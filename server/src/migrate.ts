import { pool } from './db';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS pilot_registrations (
  id            SERIAL PRIMARY KEY,
  parent_name   TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  student_name  TEXT NOT NULL,
  grade         TEXT NOT NULL,
  board         TEXT NOT NULL,
  school_name   TEXT,
  city          TEXT,
  source        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pilot_registrations_email_idx ON pilot_registrations (email);

CREATE TABLE IF NOT EXISTS waitlist_entries (
  id            SERIAL PRIMARY KEY,
  parent_name   TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  student_name  TEXT,
  grade         TEXT NOT NULL,
  board         TEXT,
  school_name   TEXT,
  city          TEXT,
  source        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS waitlist_entries_email_idx ON waitlist_entries (email);

CREATE TABLE IF NOT EXISTS school_inquiries (
  id              SERIAL PRIMARY KEY,
  school_name     TEXT NOT NULL,
  contact_person  TEXT NOT NULL,
  role            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,
  city            TEXT,
  board           TEXT NOT NULL,
  student_count   TEXT,
  message         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS school_inquiries_email_idx ON school_inquiries (email);
`;

async function main() {
  console.log('Running migrations...');
  await pool.query(SCHEMA);
  console.log('Done.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
