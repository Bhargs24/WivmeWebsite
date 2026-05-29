import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Wivme <hello@wivme.ai>';
const founderEmails = (process.env.FOUNDER_NOTIFY_EMAILS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const resend = apiKey ? new Resend(apiKey) : null;

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

async function send({ to, subject, html }: SendArgs) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', to);
    return;
  }
  try {
    await resend.emails.send({ from: fromEmail, to, subject, html });
  } catch (err) {
    console.error('[email] send failed', err);
  }
}

const wrap = (body: string) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1A1A1E; line-height: 1.6;">
  <div style="padding: 32px 24px; background: #F5F1EB; border-radius: 12px;">
    <h1 style="font-size: 22px; margin: 0 0 16px; color: #1A1A1E;">Wivme</h1>
    ${body}
    <p style="margin-top: 32px; font-size: 13px; color: #6b6b70;">
      Wivme &middot; Post-class memory system for schools<br/>
      Questions? Reply to this email.
    </p>
  </div>
</div>`;

export async function sendPilotConfirmation(
  to: string,
  parentName: string,
  studentName: string
) {
  await send({
    to,
    subject: "Welcome aboard. You're a Wivme founding parent",
    html: wrap(`
      <p>Hi ${escapeHtml(parentName)},</p>
      <p>Thanks for registering <strong>${escapeHtml(studentName)}</strong> for the Wivme pilot. You're in.</p>
      <p>Here's what happens next:</p>
      <ul>
        <li>One of us will personally reach out within 2 working days to walk you through onboarding.</li>
        <li>The pilot is <strong>fully free</strong> for founding parents. Normally ₹1,500/year per student.</li>
        <li>In return, we'll occasionally ask for your honest feedback so we can shape the product around real students learning real things.</li>
      </ul>
      <p>This isn't a soft launch. It's how we're building the product. The choices we make over the next year will be informed by what your child actually experiences. You're not just trying Wivme. You're helping build it.</p>
      <p>Talk soon,<br/>Bhargav &amp; Anshu<br/>Founders, Wivme</p>
    `),
  });
}

export async function sendWaitlistConfirmation(
  to: string,
  parentName: string,
  grade: string
) {
  await send({
    to,
    subject: "You're on the Wivme waitlist",
    html: wrap(`
      <p>Hi ${escapeHtml(parentName)},</p>
      <p>You're on the waitlist for <strong>Grade ${escapeHtml(grade)}</strong>.</p>
      <p>Right now we're running a focused pilot for Grade 8 (ICSE &amp; CBSE) so we can build something that genuinely works before scaling. You'll be among the first to know when we open up your child's grade.</p>
      <p>Full launch is planned for the next academic year.</p>
      <p>Thanks for your patience,<br/>The Wivme team</p>
    `),
  });
}

export async function sendSchoolInquiryConfirmation(
  to: string,
  contactPerson: string,
  schoolName: string
) {
  await send({
    to,
    subject: 'Wivme: we received your inquiry',
    html: wrap(`
      <p>Hi ${escapeHtml(contactPerson)},</p>
      <p>Thanks for reaching out about <strong>${escapeHtml(schoolName)}</strong>. We've received your inquiry and one of the founders will personally get back to you within 2 working days to set up a conversation.</p>
      <p>Best,<br/>Bhargav &amp; Anshu<br/>Founders, Wivme</p>
    `),
  });
}

export async function notifyFounders(subject: string, summaryHtml: string) {
  if (founderEmails.length === 0) return;
  await send({
    to: founderEmails.join(','),
    subject: `[Wivme] ${subject}`,
    html: wrap(summaryHtml),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
