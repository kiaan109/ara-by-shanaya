import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { localProducts } from '@/lib/localProducts';

const ALL_BLOB = 'ara-all-products.json';

async function findProduct(id: string) {
  // Check blob override first
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

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await findProduct(params.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ product });
}
