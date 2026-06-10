import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const ALL_BLOB = 'ara-all-products.json';

async function readAllBlob(): Promise<any[] | null> {
  try {
    const { blobs } = await list({ prefix: ALL_BLOB, limit: 1 });
    const b = blobs.find(x => x.pathname === ALL_BLOB);
    if (!b) return null;
    const r = await fetch(b.url, { cache: 'no-store' });
    if (!r.ok) return null;
    const data = await r.json();
    return Array.isArray(data) ? data : null;
  } catch { return null; }
}

export async function GET() {
  const products = await readAllBlob();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const { products } = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'products must be an array' }, { status: 400 });
    }
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    await put(ALL_BLOB, blob, { access: 'public', addRandomSuffix: false, allowOverwrite: true });
    return NextResponse.json({ ok: true, count: products.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
