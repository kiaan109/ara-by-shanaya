import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

const ORDERS_BLOB = 'ara-orders.json';

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get('email')?.toLowerCase();
  if (!email) return NextResponse.json({ orders: [] });

  try {
    const { blobs } = await list({ prefix: ORDERS_BLOB, limit: 1 });
    const b = blobs.find(x => x.pathname === ORDERS_BLOB);
    if (!b) return NextResponse.json({ orders: [] });
    const r = await fetch(b.url, { cache: 'no-store' });
    if (!r.ok) return NextResponse.json({ orders: [] });
    const all: any[] = await r.json();
    const orders = all.filter(o => o.email?.toLowerCase() === email);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
