import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { put, list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

const ORDERS_BLOB = 'ara-orders.json';
const USERS_BLOB  = 'ara-users.json';

async function readBlob<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const b = blobs.find(x => x.pathname === pathname);
    if (!b) return fallback;
    const url = `${b.url}?_t=${Date.now()}`;
    const r = await fetch(url, { cache: 'no-store' });
    return r.ok ? await r.json() : fallback;
  } catch { return fallback; }
}

async function writeBlob(pathname: string, data: any) {
  const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  await put(pathname, b, { access: 'public', addRandomSuffix: false, allowOverwrite: true });
}

async function upsertUser(user: { name: string; email: string; phone: string; address?: string; city?: string; state?: string; pincode?: string }) {
  try {
    const users: any[] = await readBlob(USERS_BLOB, []);
    const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) users[idx] = { ...users[idx], ...user, updatedAt: new Date().toISOString() };
    else users.unshift({ ...user, createdAt: new Date().toISOString() });
    await writeBlob(USERS_BLOB, users);
  } catch { /* non-fatal */ }
}

function buildEmailHtml(order: any): string {
  const rows = (order.items || []).map((i: any) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f5f5f5;font-size:13px">${i.name}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f5f5f5;font-size:13px;text-align:center">${i.size || '—'}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f5f5f5;font-size:13px;text-align:center">${i.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f5f5f5;font-size:13px;text-align:right">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#fafafa;margin:0;padding:0">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8e8e8">
    <div style="background:#1a1c1c;padding:28px 32px;text-align:center">
      <p style="font-size:22px;letter-spacing:.2em;color:#fff;font-weight:300;margin:0">ARA <span style="color:#C5A059">by</span> SHANAYA</p>
      <p style="font-size:10px;letter-spacing:.45em;color:#888;text-transform:uppercase;margin:8px 0 0">${order.status === 'confirmed' ? 'Order Confirmed' : 'New Order (Pending)'}</p>
    </div>
    <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0">
      <p style="font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#C5A059;margin:0 0 12px">Order Details</p>
      <p style="font-size:13px;margin:4px 0"><b>Order ID:</b> ${order.orderId}</p>
      <p style="font-size:13px;margin:4px 0"><b>Date:</b> ${new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
      <p style="font-size:13px;margin:4px 0"><b>Status:</b> <span style="color:${order.status === 'confirmed' ? '#16a34a' : '#d97706'}">${order.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}</span></p>
    </div>
    <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0">
      <p style="font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#C5A059;margin:0 0 12px">Customer</p>
      <p style="font-size:13px;margin:4px 0"><b>Name:</b> ${order.name}</p>
      <p style="font-size:13px;margin:4px 0"><b>Email:</b> ${order.email}</p>
      <p style="font-size:13px;margin:4px 0"><b>Phone:</b> ${order.phone}</p>
      <p style="font-size:13px;margin:4px 0"><b>Address:</b> ${order.address}, ${order.city}, ${order.state} – ${order.pincode}</p>
    </div>
    <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0">
      <p style="font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#C5A059;margin:0 0 12px">Items</p>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f9f9f9">
          <th style="padding:8px;text-align:left;font-size:10px;letter-spacing:.1em;text-transform:uppercase">Product</th>
          <th style="padding:8px;text-align:center;font-size:10px;letter-spacing:.1em;text-transform:uppercase">Size</th>
          <th style="padding:8px;text-align:center;font-size:10px;letter-spacing:.1em;text-transform:uppercase">Qty</th>
          <th style="padding:8px;text-align:right;font-size:10px;letter-spacing:.1em;text-transform:uppercase">Price</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:16px;text-align:right;font-size:13px">
        <p style="color:#767676;margin:3px 0">Subtotal: ₹${(order.subtotal || 0).toLocaleString('en-IN')}</p>
        ${order.discount > 0 ? `<p style="color:#C5A059;margin:3px 0">Discount (${order.couponCode}): −₹${order.discount.toLocaleString('en-IN')}</p>` : ''}
        <p style="color:#767676;margin:3px 0">Shipping: ${order.shipping === 0 ? 'Free' : '₹' + order.shipping}</p>
        <p style="font-size:15px;font-weight:700;margin:8px 0 0;color:#1a1c1c">Total: ₹${(order.total || 0).toLocaleString('en-IN')}</p>
      </div>
    </div>
    ${order.paymentId ? `<div style="padding:16px 32px;font-size:11px;color:#aaa;text-align:center">Payment ID: ${order.paymentId}</div>` : ''}
  </div></body></html>`;
}

async function sendEmails(order: any) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const html = buildEmailHtml(order);
  const from = 'ARA by Shanaya <noreply@arabyshanaya.com>';
  await Promise.allSettled([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, html, to: [process.env.NOTIFICATION_EMAIL || 'arabyshanaya@gmail.com'], subject: `🛍️ New Order ${order.orderId} — ₹${(order.total || 0).toLocaleString('en-IN')}` }),
    }),
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, html, to: [order.email], subject: `Your ARA order ${order.orderId} is confirmed ✓` }),
    }),
  ]);
}

async function pushToGoogleSheets(order: any) {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) return;
  try { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order), redirect: 'follow' }); }
  catch { /* optional */ }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const expected = crypto.createHmac('sha256', keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
    if (expected !== razorpaySignature) return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });

    const orderId = `ARA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const order = { orderId, ...orderData, email: orderData.email?.trim().toLowerCase(), paymentId: razorpayPaymentId, rzpOrderId: razorpayOrderId, status: 'confirmed', createdAt: new Date().toISOString() };

    const orders: any[] = await readBlob(ORDERS_BLOB, []);
    orders.unshift(order);
    await writeBlob(ORDERS_BLOB, orders);
    await upsertUser({ name: order.name, email: order.email, phone: order.phone, address: order.address, city: order.city, state: order.state, pincode: order.pincode });
    // MUST await — serverless terminates after response otherwise
    await Promise.allSettled([sendEmails(order), pushToGoogleSheets(order)]);

    return NextResponse.json({ success: true, orderId });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
