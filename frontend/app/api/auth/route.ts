import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { put, list } from '@vercel/blob';

const USERS_BLOB = 'ara-users.json';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'ara_salt_2026').digest('hex');
}

async function readUsers(): Promise<any[]> {
  try {
    const { blobs } = await list({ prefix: USERS_BLOB, limit: 1 });
    const b = blobs.find(x => x.pathname === USERS_BLOB);
    if (!b) return [];
    const r = await fetch(`${b.url}?_t=${Date.now()}`, { cache: 'no-store' });
    return r.ok ? await r.json() : [];
  } catch { return []; }
}

async function writeUsers(users: any[]) {
  const b = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
  await put(USERS_BLOB, b, { access: 'public', addRandomSuffix: false, allowOverwrite: true });
}

// POST /api/auth  body: { action: 'register'|'login', name?, email, password }
export async function POST(req: NextRequest) {
  try {
    const { action, name, email: rawEmail, password } = await req.json();
    const email = rawEmail?.trim().toLowerCase();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = await readUsers();

    if (action === 'register') {
      if (!name?.trim()) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      const existing = users.find(u => u.email === email);
      if (existing?.passwordHash) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
      const passwordHash = hashPassword(password);
      if (existing) {
        // User placed an order before — add password to their record
        existing.name = name.trim();
        existing.passwordHash = passwordHash;
        existing.updatedAt = new Date().toISOString();
      } else {
        users.unshift({
          name: name.trim(),
          email,
          passwordHash,
          createdAt: new Date().toISOString(),
        });
      }
      await writeUsers(users);
      const user = users.find(u => u.email === email)!;
      return NextResponse.json({ success: true, user: { name: user.name, email: user.email, phone: user.phone } });
    }

    if (action === 'login') {
      const user = users.find(u => u.email === email);
      if (!user || !user.passwordHash) {
        return NextResponse.json({ error: 'No account found. Please register first.' }, { status: 401 });
      }
      if (user.passwordHash !== hashPassword(password)) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }
      return NextResponse.json({ success: true, user: { name: user.name, email: user.email, phone: user.phone } });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
