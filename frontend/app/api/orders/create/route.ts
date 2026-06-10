import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { list } from '@vercel/blob';
import { localProducts } from '@/lib/localProducts';
import { applyCoupon } from '@/lib/coupons';
import { calcShipping } from '@/lib/shipping';

const ALL_BLOB = 'ara-all-products.json';

async function getProduct(id: string): Promise<any | null> {
  try {
    const { blobs } = await list({ prefix: ALL_BLOB, limit: 1 });
    const b = blobs.find(x => x.pathname === ALL_BLOB);
    if (b) {
      const r = await fetch(b.url, { cache: 'no-store' });
      if (r.ok) {
        const all: any[] = await r.json();
        const hit = all.find(p => p._id === id);
        if (hit) return hit;
      }
    }
  } catch { /* fall through */ }
  return (localProducts as any[]).find(p => p._id === id) ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let subtotal = 0;
    const orderItems: any[] = [];

    if (body.type === 'single') {
      const { productId, size, qty = 1 } = body;
      const product = await getProduct(productId);
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      if (!product.inStock) return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 });
      const quantity = Math.max(1, Math.min(10, parseInt(qty)));
      subtotal = product.price * quantity;
      orderItems.push({ _id: product._id, name: product.name, price: product.price, quantity, size, image: product.images?.[0] || '', collection: product.collection || '' });
    } else {
      for (const item of body.items || []) {
        const product = await getProduct(item._id);
        if (!product) continue;
        const quantity = Math.max(1, Math.min(10, parseInt(item.qty || 1)));
        subtotal += product.price * quantity;
        orderItems.push({ _id: product._id, name: product.name, price: product.price, quantity, size: item.size, image: product.images?.[0] || '', collection: product.collection || '' });
      }
    }

    if (subtotal <= 0 || orderItems.length === 0) return NextResponse.json({ error: 'Invalid order' }, { status: 400 });

    const shipping = calcShipping(body.country || 'India', subtotal);
    const { discount, percent, code } = applyCoupon(subtotal, body.couponCode);
    const grandTotal = Math.max(0, subtotal + shipping - discount);

    if (!keyId || !keySecret) {
      return NextResponse.json({ pending: true, subtotal, shipping, discount, couponCode: code, total: grandTotal, items: orderItems }, { status: 503 });
    }

    const amountPaise = Math.round(grandTotal * 100);
    const receipt     = `ara_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const auth        = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const rzp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt }),
    });

    if (!rzp.ok) return NextResponse.json({ error: 'Payment gateway error' }, { status: 502 });
    const rzpOrder = await rzp.json();

    return NextResponse.json({ razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: 'INR', key: keyId, subtotal, shipping, discount, couponCode: code, percent, total: grandTotal, items: orderItems });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
