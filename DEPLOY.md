# Wivme — Deploy notes

This repo now has two deployable pieces:

- **`/`** — the Next.js static site (frontend)
- **`/server`** — the Express + Postgres API (backend)

Both are defined in [`render.yaml`](./render.yaml) and deploy together as a Render Blueprint.

---

## First-time setup on Render

1. **Push the repo to GitHub** (if it isn't already).
2. In Render, **New → Blueprint** and select this repo. Render reads `render.yaml` and creates:
   - `wivme-db` — free Postgres
   - `wivme-api` — Node web service
   - `wivme-web` — static site
3. After the blueprint deploys, fill in the secret env vars Render couldn't auto-fill:

   **On `wivme-api`:**
   | Env var | Value |
   |---|---|
   | `RESEND_API_KEY` | From [resend.com](https://resend.com) → API Keys |
   | `RESEND_FROM_EMAIL` | e.g. `Wivme <hello@wivme.ai>`. The domain must be verified in Resend. |
   | `FOUNDER_NOTIFY_EMAILS` | `bhargav@wivmeai.com,anshu@wivmeai.com` |
   | `CORS_ORIGIN` | `https://wivme.ai,https://www.wivme.ai` (comma-separated) |

   **On `wivme-web`:**
   | Env var | Value |
   |---|---|
   | `NEXT_PUBLIC_API_BASE_URL` | The URL of `wivme-api` (e.g. `https://wivme-api.onrender.com`) |

4. After updating env vars, trigger a **Manual Deploy** on each service so they pick them up.

---

## What the API does

Three endpoints, all `POST` JSON:

- `POST /api/pilot-registrations` — Grade 8 ICSE/CBSE parents (the actual pilot)
- `POST /api/waitlist` — every other grade/board combination
- `POST /api/school-inquiries` — schools

Each one writes to Postgres, sends a confirmation email to the user, and notifies the founders.

The DB schema is created automatically on every deploy by `npm run migrate` (idempotent — uses `CREATE TABLE IF NOT EXISTS`).

---

## Local dev

**Frontend:**
```bash
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev
```

**Backend:**
```bash
cd server
cp .env.example .env               # fill in DATABASE_URL, RESEND_API_KEY, etc.
npm install
npm run migrate                    # create tables
npm run dev                        # starts on :8080
```

---

## Resend setup (one-time)

1. Sign up at [resend.com](https://resend.com).
2. Add and verify your sending domain (e.g. `wivme.ai`) — DNS records take ~10 min.
3. Create an API key, paste into Render as `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` to a sender on your verified domain.

If you skip this, the API still works — registrations save to Postgres — but no emails go out (you'll see warnings in the API logs).

---

## Reading registrations

Until we build a dashboard, query the DB directly via Render's Postgres console:

```sql
SELECT created_at, parent_name, email, phone, student_name, grade, board, school_name, city
FROM pilot_registrations
ORDER BY created_at DESC;

SELECT created_at, parent_name, email, grade, board
FROM waitlist_entries
ORDER BY created_at DESC;

SELECT created_at, school_name, contact_person, email, phone, board, student_count
FROM school_inquiries
ORDER BY created_at DESC;
```
