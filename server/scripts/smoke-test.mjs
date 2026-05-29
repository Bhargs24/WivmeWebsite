// One-command end-to-end smoke test for the API.
// Usage: API_BASE=http://localhost:8080 node scripts/smoke-test.mjs
//        API_BASE=https://wivme-api.onrender.com node scripts/smoke-test.mjs
//
// Hits every endpoint with valid + invalid + honeypot payloads and prints
// pass/fail. Uses a unique email per run so dedup doesn't reject valid ones.

const API_BASE = process.env.API_BASE ?? 'http://localhost:8080';
const stamp = Date.now();
const uniq = (label) => `smoke-${stamp}-${label}@wivme.ai`;

let pass = 0;
let fail = 0;

async function check(label, fn) {
  try {
    await fn();
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
    pass++;
  } catch (err) {
    console.log(`  \x1b[31m✗\x1b[0m ${label}`);
    console.log(`     ${err.message}`);
    fail++;
  }
}

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, body: json };
}

function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}

console.log(`Smoke test against ${API_BASE}\n`);

console.log('Health');
await check('GET /api/health returns 200', async () => {
  const res = await fetch(`${API_BASE}/api/health`);
  expect(res.status === 200, `expected 200, got ${res.status}`);
  const j = await res.json();
  expect(j.ok === true, `expected ok:true, got ${JSON.stringify(j)}`);
});

console.log('\nPilot registration (Grade 8 ICSE)');
await check('valid pilot payload returns 200 ok', async () => {
  const r = await post('/api/pilot-registrations', {
    parentName: 'Smoke Parent',
    email: uniq('pilot'),
    phone: '+919999999999',
    studentName: 'Smoke Student',
    grade: '8',
    board: 'ICSE',
    schoolName: 'Smoke School',
    city: 'Bengaluru',
    source: 'Other',
  });
  expect(r.status === 200 && r.body.ok === true, `got ${r.status} ${JSON.stringify(r.body)}`);
});
await check('missing required field returns 400 invalid_input', async () => {
  const r = await post('/api/pilot-registrations', { parentName: 'No Email' });
  expect(r.status === 400 && r.body.error === 'invalid_input', `got ${r.status} ${JSON.stringify(r.body)}`);
});
await check('honeypot-filled payload silently returns 200 (no DB write)', async () => {
  const r = await post('/api/pilot-registrations', {
    parentName: 'Bot',
    email: uniq('bot'),
    phone: '+910000000000',
    studentName: 'Bot Student',
    grade: '8',
    board: 'ICSE',
    _gotcha: 'http://spam.com',
  });
  expect(r.status === 200 && r.body.ok === true, `got ${r.status} ${JSON.stringify(r.body)}`);
});

console.log('\nWaitlist (any non-Grade-8)');
await check('valid waitlist payload returns 200 ok', async () => {
  const r = await post('/api/waitlist', {
    parentName: 'Smoke Waitlist',
    email: uniq('waitlist'),
    phone: '+919999999998',
    studentName: 'Smoke Student',
    grade: '6',
    board: 'CBSE',
  });
  expect(r.status === 200 && r.body.ok === true, `got ${r.status} ${JSON.stringify(r.body)}`);
});

console.log('\nSchool inquiries');
await check('valid school payload returns 200 ok', async () => {
  const r = await post('/api/school-inquiries', {
    schoolName: 'Smoke International',
    contactPerson: 'Principal Smoke',
    role: 'Principal',
    email: uniq('school'),
    phone: '+919999999997',
    city: 'Bengaluru',
    board: 'CBSE',
    studentCount: '500',
    message: 'Smoke test inquiry',
  });
  expect(r.status === 200 && r.body.ok === true, `got ${r.status} ${JSON.stringify(r.body)}`);
});

console.log('\nDuplicate guard');
const dupEmail = uniq('dup');
await check('first submission with shared email returns 200', async () => {
  const r = await post('/api/waitlist', {
    parentName: 'Dup A',
    email: dupEmail,
    phone: '+919999999996',
    grade: '7',
    board: 'CBSE',
  });
  expect(r.status === 200, `got ${r.status}`);
});
await check('immediate second submission also returns 200 (silent dedup)', async () => {
  const r = await post('/api/waitlist', {
    parentName: 'Dup B',
    email: dupEmail,
    phone: '+919999999995',
    grade: '7',
    board: 'CBSE',
  });
  expect(r.status === 200, `got ${r.status}`);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
