import { NextRequest, NextResponse } from 'next/server';
import { localProducts } from '@/lib/localProducts';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = localProducts.find((p) => p._id === params.id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}
