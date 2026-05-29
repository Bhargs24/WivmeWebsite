# What's left before launch

Code is done. These are the remaining steps to get Wivme live.

---

## 1. Resend setup (~15 min)

1. Sign up at [resend.com](https://resend.com)
2. Add domain `wivme.ai` → add the DNS records they give you at your registrar
3. Wait for the domain to show "Verified"
4. Create an API key. Save the `re_…` value.

---

## 2. Push to GitHub

```
git add .
git commit -m "Pilot launch"
git push
```

---

## 3. Local end-to-end test (recommended, ~20 min)

Catches issues before they're public.

**Backend:**
```
cd server
cp .env.example .env       # fill in DATABASE_URL, RESEND_API_KEY, etc.
npm install
npm run migrate
npm run dev                # starts on :8080
```
For `DATABASE_URL`, easiest is a free [Neon](https://neon.tech) Postgres (5 min, no card).

**Smoke test the API:**
```
npm run smoke
```
Should print 7 ✓. Check inbox for confirmation emails.

**Frontend:**
```
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```
Open http://localhost:3000 and submit each form path:
- Parent · Grade 8 · ICSE → "Welcome aboard, founding parent"
- Parent · Grade 6 · CBSE → "You're on the list"
- School → "Inquiry received"

---

## 4. Deploy to Render (~10 min)

1. Render → **New → Blueprint** → pick the repo
2. Wait for `wivme-db`, `wivme-api`, `wivme-web` to provision
3. Fill in the secret env vars (Render will prompt for these — they're marked `sync: false` in `render.yaml`):

   **wivme-api:**
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` = `Wivme <hello@wivme.ai>`
   - `FOUNDER_NOTIFY_EMAILS` = `bhargav@wivmeai.com,anshu@wivmeai.com`
   - `CORS_ORIGIN` = `https://wivme-web.onrender.com,https://wivme.ai,https://www.wivme.ai`

   **wivme-web:**
   - `NEXT_PUBLIC_API_BASE_URL` = the URL of `wivme-api` (e.g. `https://wivme-api.onrender.com`)

4. **Manual Deploy** both services so they pick up the env vars.

---

## 5. Verify the live site (~10 min)

```
cd server
API_BASE=https://wivme-api.onrender.com npm run smoke
```
Then walk through `https://wivme-web.onrender.com` like you did locally.

Paste the URL into [opengraph.xyz](https://www.opengraph.xyz/) to confirm the OG image renders.

---

## 6. Point the domain (~30 min including DNS)

1. Render → wivme-web → **Settings → Custom Domains** → add `wivme.ai` and `www.wivme.ai`
2. Add the DNS records Render gives you
3. Wait for DNS to propagate, SSL auto-provisions
4. Tighten `CORS_ORIGIN` on `wivme-api` to drop the `onrender.com` URL once the real domain works

---

## Common gotchas

- **Form does nothing** → `NEXT_PUBLIC_API_BASE_URL` missing on `wivme-web`. Set it, redeploy.
- **CORS error in browser console** → calling origin not in `CORS_ORIGIN`. Add it (with `https://`), redeploy api.
- **No confirmation email** → Resend domain not verified, or `RESEND_FROM_EMAIL` is on an unverified domain.
- **First request after idle is slow (30–60s)** → free Render tier spins down. Upgrade to Starter ($7/mo) when traffic justifies it.

---

## Reading registrations (until there's a dashboard)

Render → wivme-db → Connect → use the psql shell:
```sql
SELECT created_at, parent_name, email, phone, student_name, grade, board, school_name, city
FROM pilot_registrations ORDER BY created_at DESC;
```

---

## Nice-to-haves (not blockers)

- Lead dashboard
- Analytics (GA4 takes 20 min to wire up, free)
- Sentry for error tracking (once you have traffic)
- Delete the now-redundant `Favicon/` folder at repo root (canonical copies live in `public/`)
