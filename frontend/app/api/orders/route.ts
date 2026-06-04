import { NextRequest, NextResponse } from 'next/server';
import { put, head, del } from '@vercel/blob';

const ORDERS_BLOB = 'ara-orders.json';

// Helper: fetch current orders list from blob
async function readOrders(): Promise<any[]> {
  try {
    const res = await fetch(
      `https://public.blob.vercel-storage.com/${ORDERS_BLOB}?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Helper: write orders list back to blob
async function writeOrders(orders: any[]) {
  const blob = new Blob([JSON.stringify(orders)], { type: 'application/json' });
  await put(ORDERS_BLOB, blob, { access: 'public', addRandomSuffix: false });
}

// POST /api/orders — customer places an order
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, productName, productPrice, productImage, size, color, customerName, customerPhone } = body;

  if (!productId || !productName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const order = {
    id:            crypto.randomUUID(),
    created_at:    new Date().toISOString(),
    product_id:    productId,
    product_name:  productName,
    product_price: productPrice || 0,
    product_image: productImage || '',
    size:          size  || '',
    color:         color || '',
    customer_name: customerName  || 'Customer',
    customer_phone:customerPhone || '',
    status:        'pending',
  };

  const orders = await readOrders();
  orders.unshift(order); // newest first
  await writeOrders(orders);

  return NextResponse.json({ order });
}

// GET /api/orders — admin fetch all orders
export async function GET() {
  const orders = await readOrders();
  return NextResponse.json({ orders, total: orders.length });
}
