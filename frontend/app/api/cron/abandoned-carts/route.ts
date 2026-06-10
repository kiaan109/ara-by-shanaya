import { NextRequest, NextResponse } from 'next/server';
import { readBlob, writeBlob } from '@/lib/blobStore';
import { sendEmail, sendSMS, brandEmailWrap } from '@/lib/notify';

const CARTS_BLOB = 'ara-carts.json';
const REMINDER_DELAY_MS = 60 * 60 * 1000; // remind after 1 hour of inactivity

export async function GET(req: NextRequest) {
  // Optional protection — set CRON_SECRET and Vercel will send it as a Bearer token
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const carts: any[] = await readBlob(CARTS_BLOB, []);
  const now = Date.now();
  let remindedCount = 0;

  for (const cart of carts) {
    if (cart.reminded) continue;
    if (!cart.items?.length) continue;
    const age = now - new Date(cart.updatedAt).getTime();
    if (age < REMINDER_DELAY_MS) continue;

    const firstItem = cart.items[0];
    const itemName  = cart.items.length > 1 ? `${firstItem.name} and ${cart.items.length - 1} more item${cart.items.length > 2 ? 's' : ''}` : firstItem.name;
    const firstName = (cart.name || '').split(' ')[0] || 'there';

    // Email reminder
    const html = brandEmailWrap('Your Bag Is Waiting', `
      <p style="font-size:14px;line-height:1.7;color:#1a1c1c;margin:0 0 16px">Hi ${firstName},</p>
      <p style="font-size:14px;line-height:1.7;color:#1a1c1c;margin:0 0 20px">
        Your <b>${itemName}</b> ${cart.items.length > 1 ? 'are' : 'is'} still waiting for you in your bag!
        Complete your order before they sell out.
      </p>
      <div style="text-align:center;margin:24px 0">
        ${firstItem.image ? `<img src="${firstItem.image}" alt="${firstItem.name}" style="max-width:200px;height:auto"/>` : ''}
      </div>
      <div style="text-align:center;margin-top:12px">
        <a href="https://arabyshanaya.com/cart" style="display:inline-block;background:#C5A059;color:#1a1c1c;text-decoration:none;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding:14px 32px;font-weight:700">Return to Bag</a>
      </div>
    `);
    await sendEmail(cart.email, `Your ${firstItem.name} is waiting for you ✦ ARA by Shanaya`, html);

    // SMS reminder (no-op if Twilio not configured)
    if (cart.phone) {
      await sendSMS(cart.phone, `Hi ${firstName}, your ${itemName} is waiting for you at ARA by Shanaya! Complete your order: https://arabyshanaya.com/cart`);
    }

    cart.reminded = true;
    remindedCount++;
  }

  if (remindedCount > 0) await writeBlob(CARTS_BLOB, carts);

  return NextResponse.json({ checked: carts.length, reminded: remindedCount });
}
