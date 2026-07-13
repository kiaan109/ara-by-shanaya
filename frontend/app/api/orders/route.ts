import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import crypto from 'crypto';

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

// GET /api/orders — admin: all orders
export async function GET() {
  const orders = await readBlob(ORDERS_BLOB, []);
  return NextResponse.json({ orders, total: (orders as any[]).length });
}

// POST /api/orders — save a pending order (no Razorpay)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email: rawEmail, phone, address, city, state, pincode, items, subtotal, shipping, tax, discount, couponCode, total } = body;
    const email = rawEmail?.trim().toLowerCase();
    if (!name || !email || !phone) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const orderId = `ARA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const order = {
      orderId, name, email, phone, address, city, state, pincode,
      items: items || [], subtotal, shipping, tax, discount, couponCode, total,
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
            <p style="text-align:right;font-size:13px;color:#767676;margin:8px 0 0">Shipping: ${shipping === 0 ? 'Free' : '₹' + (shipping || 0).toLocaleString('en-IN')}</p>
            ${tax > 0 ? `<p style="text-align:right;font-size:13px;color:#767676;margin:4px 0 0">Tax (18% GST): ₹${tax.toLocaleString('en-IN')}</p>` : ''}
            <p style="text-align:right;font-size:15px;font-weight:700;margin:12px 0 0">Total: ₹${(total || 0).toLocaleString('en-IN')}</p>
          </div>
          <div style="padding:16px 32px;text-align:center;font-size:11px;color:#aaa">
            Payment pending — confirm with customer before dispatching
          </div>
        </div></body></html>`;

      const sendResend = async (payload: any, label: string) => {
        try {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!r.ok) {
            const body = await r.text().catch(() => '');
            console.error(`[resend:${label}] ${r.status} ${body}`);
          }
        } catch (e) {
          console.error(`[resend:${label}] threw`, e);
        }
      };

      await Promise.allSettled([
        // Notify Shanaya — separate sends per recipient for reliable delivery
        ...['arabyshanaya@gmail.com', 'shanayasanghani@gmail.com'].map(to => sendResend({
          from: 'ARA by Shanaya <noreply@arabyshanaya.com>',
          to: [to],
          subject: `New order ${orderId} — ${name} — Rs ${total?.toLocaleString('en-IN')}`,
          html,
        }, `admin:${to}`)),
        // Confirm to customer
        sendResend({
          from: 'ARA by Shanaya <noreply@arabyshanaya.com>',
          to: [email],
          subject: `Your ARA order ${orderId} has been received`,
          html: html.replace('New Order Received', 'Order Confirmation').replace('Payment pending — confirm with customer before dispatching', 'Thank you for your order! We will contact you to confirm payment.'),
        }, 'customer'),
      ]);
    }

    return NextResponse.json({ success: true, orderId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── Lifecycle status emails (Zara-style) ────────────────────────────────────
const STATUS_EMAIL: Record<string, { subject: (o: any) => string; heading: string; message: string }> = {
  confirmed: {
    subject: o => `Order ${o.orderId} confirmed — thank you for your purchase`,
    heading: 'THANK YOU FOR YOUR PURCHASE',
    message: 'We are preparing your order so you can receive it as quickly as possible. We will send you another email when it is on its way.',
  },
  processing: {
    subject: o => `Your ARA order ${o.orderId} is being prepared`,
    heading: 'YOUR ORDER IS BEING PREPARED',
    message: 'Our team is carefully preparing your pieces. We will notify you the moment your order ships.',
  },
  shipped: {
    subject: o => `Your ARA order ${o.orderId} has been shipped`,
    heading: 'YOUR ORDER HAS BEEN SHIPPED',
    message: 'Your order is on its way. You will receive another email when it is out for delivery.',
  },
  out_for_delivery: {
    subject: o => `Your ARA order ${o.orderId} is out for delivery`,
    heading: 'YOUR ORDER IS OUT FOR DELIVERY',
    message: 'Your order will be delivered today. Please keep your phone reachable in case the courier needs directions.',
  },
  delivered: {
    subject: o => `Your ARA order ${o.orderId} has been delivered`,
    heading: 'YOUR ORDER HAS BEEN DELIVERED',
    message: 'Your order has been delivered. We hope you love your new pieces — tag @arabyshanaya to be featured!',
  },
  cancelled: {
    subject: o => `Your ARA order ${o.orderId} has been cancelled`,
    heading: 'YOUR ORDER HAS BEEN CANCELLED',
    message: 'Your order has been cancelled. If you already paid, your refund will be processed within 5–7 business days. Contact us if you have any questions.',
  },
};

function buildStatusEmail(order: any, status: string): string {
  const t = STATUS_EMAIL[status];
  const thumbs = (order.items || []).slice(0, 4).map((i: any) => `
    <td style="padding:0 6px;text-align:center;vertical-align:top">
      ${i.image ? `<img src="${i.image.startsWith('http') ? i.image : `https://arabyshanaya.com${i.image}`}" alt="${i.name}" width="110" style="display:block;width:110px;height:auto;background:#f5f5f5;margin:0 auto"/>` : ''}
      <p style="font-size:11px;color:#1a1c1c;margin:8px 0 0;font-family:Georgia,serif">${i.name}</p>
      <p style="font-size:10px;color:#767676;margin:2px 0 0">${i.size ? `Size ${i.size} · ` : ''}Qty ${i.quantity}</p>
    </td>`).join('');

  const trackUrl = order.trackingId
    ? (order.trackingId.startsWith('http') ? order.trackingId : `https://www.google.com/search?q=${encodeURIComponent(order.trackingId + ' tracking')}`)
    : 'https://arabyshanaya.com/orders';

  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#faf7f2;margin:0;padding:0">
  <div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #eee">
    <div style="padding:32px;text-align:center;border-bottom:1px solid #f0f0f0">
      <p style="font-size:22px;letter-spacing:.25em;color:#1a1c1c;font-weight:300;margin:0">ARA <span style="color:#C5A059">by</span> SHANAYA</p>
    </div>
    <div style="padding:40px 32px 24px;text-align:center">
      <h1 style="font-size:22px;letter-spacing:.05em;font-weight:700;color:#1a1c1c;margin:0 0 16px">${t.heading}</h1>
      <p style="font-size:13px;letter-spacing:.15em;color:#767676;margin:0 0 24px">ORDER NO. ${order.orderId}</p>
      <p style="font-size:14px;color:#444;line-height:1.7;margin:0 auto 8px;max-width:440px">${t.message}</p>
    </div>
    ${thumbs ? `
    <div style="padding:8px 32px 32px;text-align:center">
      <p style="font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#999;margin:0 0 16px">${(order.items || []).length} ITEM${(order.items || []).length > 1 ? 'S' : ''}</p>
      <table style="margin:0 auto;border-collapse:collapse"><tr>${thumbs}</tr></table>
    </div>` : ''}
    ${status !== 'cancelled' ? `
    <div style="padding:0 32px 32px">
      <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:#1a1c1c;margin:0 0 8px">Standard Home Delivery</p>
      <p style="font-size:13px;color:#555;line-height:1.7;margin:0;text-transform:uppercase">
        ${order.address || ''}<br/>${order.pincode || ''} ${order.city || ''}<br/>${order.state || ''}<br/>India
      </p>
      <a href="${trackUrl}" style="display:block;background:#1a1c1c;color:#fff;text-decoration:none;text-align:center;font-size:12px;letter-spacing:.2em;text-transform:uppercase;padding:16px;margin-top:24px">
        ${order.trackingId ? 'Track Your Order Here' : 'View Your Order'}
      </a>
      ${order.trackingId ? `<p style="font-size:11px;color:#999;text-align:center;margin:12px 0 0">Tracking ID: ${order.trackingId}</p>` : ''}
    </div>` : ''}
    <div style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center">
      <p style="font-size:11px;color:#aaa;margin:0">Questions? WhatsApp us at +91 89800 08826 or reply to this email.</p>
    </div>
  </div></body></html>`;
}

// PATCH /api/orders — admin: update order status (+ notify customer)
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, trackingId } = await req.json();
    const orders: any[] = await readBlob(ORDERS_BLOB, []);
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx < 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const prevStatus = orders[idx].status;
    orders[idx] = { ...orders[idx], status, trackingId: trackingId || orders[idx].trackingId, updatedAt: new Date().toISOString() };
    await writeBlob(ORDERS_BLOB, orders);

    // Email customer on real status transitions — MUST await (serverless)
    const order = orders[idx];
    const apiKey = process.env.RESEND_API_KEY;
    let emailed = false;
    let emailError = '';
    if (status !== prevStatus && STATUS_EMAIL[status] && order.email) {
      if (!apiKey) {
        emailError = 'RESEND_API_KEY is not set in Vercel — customer email NOT sent';
      } else {
        try {
          const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'ARA by Shanaya <noreply@arabyshanaya.com>',
              to: [order.email],
              subject: STATUS_EMAIL[status].subject(order),
              html: buildStatusEmail(order, status),
            }),
          });
          emailed = r.ok;
          if (!r.ok) {
            const detail = await r.text().catch(() => '');
            emailError = `Resend rejected the email (${r.status})`;
            console.error(`[resend:status:${status}] ${r.status} ${detail}`);
          }
        } catch (e) {
          emailError = 'Could not reach the email service';
          console.error(`[resend:status:${status}] threw`, e);
        }
      }
    }

    return NextResponse.json({ success: true, order, emailed, emailError });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
