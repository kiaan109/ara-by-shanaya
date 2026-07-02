import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { put, list } from '@vercel/blob';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const USERS_BLOB = 'ara-users.json';
const resend = new Resend(process.env.RESEND_API_KEY);
const SITE = 'https://arabyshanaya.com';

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
  await put(USERS_BLOB, JSON.stringify(users, null, 2), { access: 'public', addRandomSuffix: false, allowOverwrite: true });
}

export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json({ ok: true, accounts: users.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── Forgot password ──────────────────────────────────────────────────────
    if (action === 'forgot') {
      const email = body.email?.trim().toLowerCase();
      if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

      const users = await readUsers();
      const user = users.find(u => u.email === email);

      // Always return success to avoid revealing whether email exists
      if (!user || !user.passwordHash) {
        return NextResponse.json({ success: true });
      }

      const token = crypto.randomBytes(32).toString('hex');
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
      await writeUsers(users);

      const resetUrl = `${SITE}/reset-password?token=${token}`;

      await resend.emails.send({
        from: 'ARA by Shanaya <noreply@arabyshanaya.com>',
        to: email,
        subject: 'Reset your ARA password',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1c1c">
            <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#C5A059;margin:0 0 24px">ARA by Shanaya</p>
            <h1 style="font-size:24px;font-weight:300;margin:0 0 16px">Reset your password</h1>
            <p style="font-size:14px;color:#767676;line-height:1.6;margin:0 0 32px">
              We received a request to reset the password for your ARA account. Click the button below — this link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display:inline-block;background:#1a1c1c;color:#fff;text-decoration:none;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;padding:16px 32px">
              Reset Password
            </a>
            <p style="font-size:12px;color:#aaa;margin:32px 0 0">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    // ── Reset password ───────────────────────────────────────────────────────
    if (action === 'reset') {
      const { token, password } = body;
      if (!token || !password) {
        return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const users = await readUsers();
      const user = users.find(u => u.resetToken === token);

      if (!user) {
        return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
      }
      if (Date.now() > user.resetTokenExpiry) {
        return NextResponse.json({ error: 'Reset link has expired — please request a new one' }, { status: 400 });
      }

      user.passwordHash = hashPassword(password);
      delete user.resetToken;
      delete user.resetTokenExpiry;
      user.updatedAt = new Date().toISOString();
      await writeUsers(users);

      return NextResponse.json({ success: true, user: { name: user.name, email: user.email, phone: user.phone } });
    }

    // ── Register / Login ────────────────────────────────────────────────────
    const email = body.email?.trim().toLowerCase();
    const { name, password } = body;

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
        existing.name = name.trim();
        existing.passwordHash = passwordHash;
        existing.updatedAt = new Date().toISOString();
      } else {
        users.unshift({ name: name.trim(), email, passwordHash, createdAt: new Date().toISOString() });
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
