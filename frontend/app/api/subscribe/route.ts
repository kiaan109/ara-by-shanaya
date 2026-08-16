import { NextRequest, NextResponse } from 'next/server';
import { readBlob, writeBlob } from '@/lib/blobStore';
import { sendEmail, brandEmailWrap } from '@/lib/notify';
import { PROMO_PERCENT } from '@/lib/promo';

const SUBSCRIBERS_BLOB = 'ara-subscribers.json';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: 'Please enter your name' }, { status: 400 });
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 });
    if (!phone?.trim() || phone.replace(/\D/g, '').length < 10) return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });

    const subscribers: any[] = await readBlob(SUBSCRIBERS_BLOB, []);
    const cleanEmail = email.trim().toLowerCase();
    const existing = subscribers.find(s => s.email === cleanEmail);

    if (existing) {
      return NextResponse.json({ success: true, isNew: false, message: "You're already subscribed!" });
    }

    subscribers.unshift({
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
    });
    await writeBlob(SUBSCRIBERS_BLOB, subscribers);

    // Welcome email — points to the site-wide sale, no coupon code needed
    const html = brandEmailWrap('Welcome to ARA', `
      <p style="font-size:14px;line-height:1.7;color:#1a1c1c;margin:0 0 16px">Hi ${name.trim()},</p>
      <p style="font-size:14px;line-height:1.7;color:#1a1c1c;margin:0 0 20px">
        Thank you for subscribing! Right now, everything on the site is
        <b>${PROMO_PERCENT}% off</b> — already applied, no code needed.
      </p>
      <div style="text-align:center;margin-top:28px">
        <a href="https://arabyshanaya.com/shop" style="display:inline-block;background:#C5A059;color:#1a1c1c;text-decoration:none;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding:14px 32px;font-weight:700">Shop Now</a>
      </div>
    `);

    await sendEmail(cleanEmail, `${PROMO_PERCENT}% off everything ✦ ARA by Shanaya`, html);

    return NextResponse.json({ success: true, isNew: true, message: `${PROMO_PERCENT}% off is already applied site-wide — check your email!` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Something went wrong' }, { status: 500 });
  }
}
