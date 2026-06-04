import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ORDERS_BLOB = 'ara-orders.json';

async function readOrders(): Promise<any[]> {
  try {
    const res = await fetch(
      `https://public.blob.vercel-storage.com/${ORDERS_BLOB}?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function writeOrders(orders: any[]) {
  const blob = new Blob([JSON.stringify(orders)], { type: 'application/json' });
  await put(ORDERS_BLOB, blob, { access: 'public', addRandomSuffix: false });
}

// PATCH /api/orders/[id] — update order status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  const orders = await readOrders();
  const updated = orders.map((o: any) => o.id === params.id ? { ...o, status } : o);
  await writeOrders(updated);
  return NextResponse.json({ ok: true });
}

// DELETE /api/orders/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const orders = await readOrders();
  await writeOrders(orders.filter((o: any) => o.id !== params.id));
  return NextResponse.json({ ok: true });
}
