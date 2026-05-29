const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

interface Honeypot {
  /** Hidden field. Real users leave it blank; bots fill it. Server silently drops the request. */
  _gotcha?: string;
}

export interface PilotPayload extends Honeypot {
  parentName: string;
  email: string;
  phone: string;
  studentName: string;
  grade: string;
  board: string;
  schoolName?: string;
  city?: string;
  source?: string;
}

export interface WaitlistPayload extends Honeypot {
  parentName: string;
  email: string;
  phone: string;
  studentName?: string;
  grade: string;
  board?: string;
  schoolName?: string;
  city?: string;
  source?: string;
}

export interface SchoolPayload extends Honeypot {
  schoolName: string;
  contactPerson: string;
  role: string;
  email: string;
  phone: string;
  city?: string;
  board: string;
  studentCount?: string;
  message?: string;
}

async function post<T>(path: string, body: T): Promise<void> {
  if (!API_BASE) {
    throw new Error('API base URL is not configured.');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
}

export const submitPilotRegistration = (data: PilotPayload) =>
  post('/api/pilot-registrations', data);

export const submitWaitlist = (data: WaitlistPayload) =>
  post('/api/waitlist', data);

export const submitSchoolInquiry = (data: SchoolPayload) =>
  post('/api/school-inquiries', data);
