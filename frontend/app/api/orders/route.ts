import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import crypto from 'crypto';

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

// GET /api/orders — admin: all orders
export async function GET() {
  const orders = await readBlob(ORDERS_BLOB, []);
  return NextResponse.json({ orders, total: (orders as any[]).length });
}

// POST /api/orders — save a pending order (no Razorpay)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email: rawEmail, phone, address, city, state, pincode, items, subtotal, shipping, discount, couponCode, total } = body;
    const email = rawEmail?.trim().toLowerCase();
    if (!name || !email || !phone) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const orderId = `ARA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const order = {
      orderId, name, email, phone, address, city, state, pincode,
      items: items || [], subtotal, shipping, discount, couponCode, total,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };

    const orders: any[] = await readBlob(ORDERS_BLOB, []);
    orders.unshift(order);
    await writeBlob(ORDERS_BLOB, orders);

    // Upsert user
    const users: any[] = await readBlob(USERS_BLOB, []);
    const idx = users.findIndex(u => u.email === email);
    if (idx >= 0) users[idx] = { ...users[idx], name, phone, updatedAt: new Date().toISOString() };
    else users.unshift({ name, email, phone, address, city, state, pincode, createdAt: new Date().toISOString() });
    await writeBlob(USERS_BLOB, users);

    // Send email — MUST await so serverless doesn't terminate before it fires
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const itemRows = (items || []).map((i: any) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px">${i.name}</td>
         <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center">${i.size || '—'}</td>
         <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center">${i.quantity}</td>
         <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td></tr>`
      ).join('');

      const html = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#fafafa;margin:0;padding:0">
        <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e8e8e8">
          <div style="background:#1a1c1c;padding:24px 32px;text-align:center">
            <p style="font-size:20px;letter-spacing:.2em;color:#fff;font-weight:300;margin:0">ARA <span style="color:#C5A059">by</span> SHANAYA</p>
            <p style="font-size:10px;letter-spacing:.4em;color:#888;text-transform:uppercase;margin:6px 0 0">New Order Received</p>
          </div>
          <div style="padding:24px 32px;border-bottom:1px solid #f0f0f0">
            <p style="font-size:13px;margin:4px 0"><b>Order ID:</b> ${orderId}</p>
            <p style="font-size:13px;margin:4px 0"><b>Customer:</b> ${name}</p>
            <p style="font-size:13px;margin:4px 0"><b>Email:</b> ${email}</p>
            <p style="font-size:13px;margin:4px 0"><b>Phone:</b> ${phone}</p>
            <p style="font-size:13px;margin:4px 0"><b>Address:</b> ${address || ''}, ${city || ''}, ${state || ''} – ${pincode || ''}</p>
          </div>
          <div style="padding:24px 32px;border-bottom:1px solid #f0f0f0">
            <table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#f9f9f9">
                <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase">Product</th>
                <th style="padding:8px;text-align:center;font-size:10px;text-transform:uppercase">Size</th>
                <th style="padding:8px;text-align:center;font-size:10px;text-transform:uppercase">Qty</th>
                <th style="padding:8px;text-align:right;font-size:10px;text-transform:uppercase">Price</th>
              </tr></thead>
              <tbody>${itemRows}</tbody>
            </table>
            ${discount > 0 ? `<p style="text-align:right;font-size:13px;color:#C5A059;margin:8px 0 0">Discount (${couponCode}): −₹${discount.toLocaleString('en-IN')}</p>` : ''}
            <p style="text-align:right;font-size:15px;font-weight:700;margin:12px 0 0">Total: ₹${(total || 0).toLocaleString('en-IN')}</p>
          </div>
          <div style="padding:16px 32px;text-align:center;font-size:11px;color:#aaa">
            Payment pending — confirm with customer before dispatching
          </div>
        </div></body></html>`;

      try {
        await Promise.all([
          // Notify Shanaya
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'ARA by Shanaya <noreply@arabyshanaya.com>',
              to: [process.env.NOTIFICATION_EMAIL || 'arabyshanaya@gmail.com'],
              subject: `🛍️ New Order ${orderId} — ${name} — ₹${total?.toLocaleString('en-IN')}`,
              html,
            }),
          }),
          // Confirm to customer
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'ARA by Shanaya <noreply@arabyshanaya.com>',
              to: [email],
              subject: `Your ARA order ${orderId} has been received`,
              html: html.replace('New Order Received', 'Order Confirmation').replace('Payment pending — confirm with customer before dispatching', 'Thank you for your order! We will contact you to confirm payment.'),
            }),
          }),
        ]);
      } catch (emailErr) {
        console.error('[email]', emailErr);
        // Don't fail the order if email fails
      }
    }

    return NextResponse.json({ success: true, orderId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH /api/orders — admin: update order status
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, trackingId } = await req.json();
    const orders: any[] = await readBlob(ORDERS_BLOB, []);
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx < 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    orders[idx] = { ...orders[idx], status, trackingId: trackingId || orders[idx].trackingId, updatedAt: new Date().toISOString() };
    await writeBlob(ORDERS_BLOB, orders);
    return NextResponse.json({ success: true, order: orders[idx] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
