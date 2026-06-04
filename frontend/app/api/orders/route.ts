import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/orders — customer places an order
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, productName, productPrice, productImage, size, color, customerName, customerPhone } = body;

  if (!productId || !productName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      product_id:    productId,
      product_name:  productName,
      product_price: productPrice,
      product_image: productImage || '',
      size:          size || '',
      color:         color || '',
      customer_name: customerName || 'Unknown',
      customer_phone:customerPhone || '',
      status:        'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('[orders] insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}

// GET /api/orders — admin fetch all orders
export async function GET() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data || [], total: data?.length || 0 });
}
