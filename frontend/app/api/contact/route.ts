import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, brandEmailWrap } from '@/lib/notify';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    const html = brandEmailWrap('New Contact Message', `
      <p style="font-size:13px;margin:4px 0"><b>Name:</b> ${name}</p>
      ${email ? `<p style="font-size:13px;margin:4px 0"><b>Email:</b> ${email}</p>` : ''}
      <p style="font-size:13px;margin:16px 0 4px"><b>Message:</b></p>
      <p style="font-size:14px;line-height:1.7;white-space:pre-wrap">${message}</p>
    `);

    await sendEmail('arabyshanaya@gmail.com', `New message from ${name} — ARA Contact Form`, html);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Something went wrong' }, { status: 500 });
  }
}
