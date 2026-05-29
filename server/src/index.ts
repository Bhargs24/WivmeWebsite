import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { pool } from './db';
import {
  sendPilotConfirmation,
  sendWaitlistConfirmation,
  sendSchoolInquiryConfirmation,
  notifyFounders,
} from './email';

/* ──────────────────────────────────────────────────────────
   Startup env validation — warn loudly if anything critical
   is missing. We don't crash so that one missing key (e.g.
   Resend) doesn't take the whole API down.
   ────────────────────────────────────────────────────────── */
const REQUIRED_ENV = ['DATABASE_URL'] as const;
const RECOMMENDED_ENV = [
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'FOUNDER_NOTIFY_EMAILS',
  'CORS_ORIGIN',
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[startup] FATAL: ${key} is not set`);
    process.exit(1);
  }
}
for (const key of RECOMMENDED_ENV) {
  if (!process.env[key]) {
    console.warn(`[startup] WARNING: ${key} is not set — related features will be disabled`);
  }
}

const app = express();
app.set('trust proxy', 1); // Render is behind a proxy
app.use(express.json({ limit: '64kb' }));

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(',').map((s) => s.trim()) : true,
  })
);

/* Per-IP rate limit on lead-submission endpoints. Generous for humans,
   enough to make scripted abuse unprofitable. */
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'too_many_requests' },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

/* All payloads share a honeypot field. Real users never see it.
   Bots fill it. We accept the request silently and skip the work. */
const HoneypotField = z.object({
  _gotcha: z.string().optional(),
});

const PilotSchema = z.object({
  parentName: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(6).max(30),
  studentName: z.string().min(1).max(120),
  grade: z.string().min(1).max(20),
  board: z.string().min(1).max(20),
  schoolName: z.string().max(200).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
}).merge(HoneypotField);

const WaitlistSchema = z.object({
  parentName: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(6).max(30),
  studentName: z.string().max(120).optional().nullable(),
  grade: z.string().min(1).max(20),
  board: z.string().max(20).optional().nullable(),
  schoolName: z.string().max(200).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
}).merge(HoneypotField);

const SchoolSchema = z.object({
  schoolName: z.string().min(1).max(200),
  contactPerson: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(6).max(30),
  city: z.string().max(120).optional().nullable(),
  board: z.string().min(1).max(40),
  studentCount: z.string().max(40).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
}).merge(HoneypotField);

/* Helper: silently swallow honeypot hits — return 200 OK so the
   bot thinks it succeeded and doesn't retry with variations. */
function isHoneypotHit(body: { _gotcha?: string }): boolean {
  return Boolean(body._gotcha && body._gotcha.trim().length > 0);
}

/* Helper: dedup recent submissions for the same (email, grade) within
   60s. Stops accidental double-submits without preventing legitimate
   re-registration weeks later. */
async function isDuplicateRecent(
  table: string,
  email: string,
  grade: string | null
): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM ${table}
     WHERE LOWER(email) = LOWER($1)
       AND ${grade ? 'grade = $2 AND ' : ''}created_at > NOW() - INTERVAL '60 seconds'
     LIMIT 1`,
    grade ? [email, grade] : [email]
  );
  return result.rowCount! > 0;
}

app.post('/api/pilot-registrations', submitLimiter, async (req, res, next) => {
  try {
    const data = PilotSchema.parse(req.body);

    if (isHoneypotHit(data)) {
      res.json({ ok: true });
      return;
    }

    if (await isDuplicateRecent('pilot_registrations', data.email, data.grade)) {
      res.json({ ok: true });
      return;
    }

    await pool.query(
      `INSERT INTO pilot_registrations
       (parent_name, email, phone, student_name, grade, board, school_name, city, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.parentName,
        data.email,
        data.phone,
        data.studentName,
        data.grade,
        data.board,
        data.schoolName ?? null,
        data.city ?? null,
        data.source ?? null,
      ]
    );

    await Promise.all([
      sendPilotConfirmation(data.email, data.parentName, data.studentName),
      notifyFounders(
        'New pilot registration',
        `<p><strong>New pilot registration</strong></p>
         <ul>
           <li>Parent: ${data.parentName} (${data.email}, ${data.phone})</li>
           <li>Student: ${data.studentName}, Grade ${data.grade} ${data.board}</li>
           <li>School: ${data.schoolName ?? '-'} ${data.city ? `(${data.city})` : ''}</li>
           <li>Source: ${data.source ?? '-'}</li>
         </ul>`
      ),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post('/api/waitlist', submitLimiter, async (req, res, next) => {
  try {
    const data = WaitlistSchema.parse(req.body);

    if (isHoneypotHit(data)) {
      res.json({ ok: true });
      return;
    }

    if (await isDuplicateRecent('waitlist_entries', data.email, data.grade)) {
      res.json({ ok: true });
      return;
    }

    await pool.query(
      `INSERT INTO waitlist_entries
       (parent_name, email, phone, student_name, grade, board, school_name, city, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.parentName,
        data.email,
        data.phone,
        data.studentName ?? null,
        data.grade,
        data.board ?? null,
        data.schoolName ?? null,
        data.city ?? null,
        data.source ?? null,
      ]
    );

    await Promise.all([
      sendWaitlistConfirmation(data.email, data.parentName, data.grade),
      notifyFounders(
        'New waitlist entry',
        `<p><strong>New waitlist entry</strong></p>
         <ul>
           <li>Parent: ${data.parentName} (${data.email}, ${data.phone})</li>
           <li>Student: ${data.studentName ?? '-'}, Grade ${data.grade} ${data.board ?? ''}</li>
           <li>School: ${data.schoolName ?? '-'} ${data.city ? `(${data.city})` : ''}</li>
           <li>Source: ${data.source ?? '-'}</li>
         </ul>`
      ),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post('/api/school-inquiries', submitLimiter, async (req, res, next) => {
  try {
    const data = SchoolSchema.parse(req.body);

    if (isHoneypotHit(data)) {
      res.json({ ok: true });
      return;
    }

    if (await isDuplicateRecent('school_inquiries', data.email, null)) {
      res.json({ ok: true });
      return;
    }

    await pool.query(
      `INSERT INTO school_inquiries
       (school_name, contact_person, role, email, phone, city, board, student_count, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.schoolName,
        data.contactPerson,
        data.role,
        data.email,
        data.phone,
        data.city ?? null,
        data.board,
        data.studentCount ?? null,
        data.message ?? null,
      ]
    );

    await Promise.all([
      sendSchoolInquiryConfirmation(data.email, data.contactPerson, data.schoolName),
      notifyFounders(
        'New school inquiry',
        `<p><strong>New school inquiry</strong></p>
         <ul>
           <li>School: ${data.schoolName} (${data.board}) ${data.city ? `, ${data.city}` : ''}</li>
           <li>Contact: ${data.contactPerson}, ${data.role}</li>
           <li>Email/Phone: ${data.email} / ${data.phone}</li>
           <li>Students: ${data.studentCount ?? '-'}</li>
           <li>Message: ${data.message ?? '-'}</li>
         </ul>`
      ),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ ok: false, error: 'invalid_input', issues: err.issues });
    return;
  }
  console.error('[api] error', err);
  res.status(500).json({ ok: false, error: 'server_error' });
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`wivme-api listening on :${port}`);
});
