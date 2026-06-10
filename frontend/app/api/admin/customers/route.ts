import { NextResponse } from 'next/server';
import { readBlob } from '@/lib/blobStore';

const USERS_BLOB       = 'ara-users.json';
const SUBSCRIBERS_BLOB = 'ara-subscribers.json';

export async function GET() {
  const [users, subscribers] = await Promise.all([
    readBlob<any[]>(USERS_BLOB, []),
    readBlob<any[]>(SUBSCRIBERS_BLOB, []),
  ]);

  const byEmail = new Map<string, any>();

  for (const s of subscribers) {
    byEmail.set(s.email, {
      name: s.name,
      email: s.email,
      phone: s.phone,
      subscribed: true,
      hasOrdered: false,
      createdAt: s.createdAt,
    });
  }

  for (const u of users) {
    const existing = byEmail.get(u.email);
    byEmail.set(u.email, {
      name: u.name || existing?.name || '',
      email: u.email,
      phone: u.phone || existing?.phone || '',
      subscribed: existing?.subscribed || false,
      hasOrdered: true,
      createdAt: existing?.createdAt || u.createdAt,
    });
  }

  const customers = Array.from(byEmail.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ customers, total: customers.length });
}
