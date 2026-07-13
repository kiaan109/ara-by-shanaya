import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { localProducts } from '@/lib/localProducts';

const ALL_BLOB   = 'ara-all-products.json';
const ADMIN_BLOB = 'ara-admin-products.json';

async function fetchBlob(pathname: string): Promise<any[] | null> {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const b = blobs.find(x => x.pathname === pathname);
    if (!b) return null;
    const r = await fetch(b.url, { cache: 'no-store' });
    if (!r.ok) return null;
    const data = await r.json();
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch { return null; }
}

async function getAllProducts() {
  // If admin has saved a full override, use ONLY that
  const all = await fetchBlob(ALL_BLOB);
  if (all) return all;

  // Otherwise: local seed + admin-uploaded products merged
  const merged = [...localProducts] as any[];
  const adminProducts = await fetchBlob(ADMIN_BLOB);
  if (adminProducts) merged.push(...adminProducts);
  return merged;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category   = searchParams.get('category');
  const search     = searchParams.get('search');
  const sort       = searchParams.get('sort');
  const order      = searchParams.get('order');
  const limit      = parseInt(searchParams.get('limit') || '20');
  const page       = parseInt(searchParams.get('page')  || '1');
  const collection = searchParams.get('collection');

  const all = await getAllProducts();
  // Distinct collections/categories across the whole catalog — used by shop filters + navbar
  const facets = {
    collections: Array.from(new Set(all.map((p: any) => p.collection).filter(Boolean))),
    categories:  Array.from(new Set(all.map((p: any) => p.category).filter(Boolean))),
  };
  let filtered = all;

  if (collection && collection !== 'All') {
    filtered = filtered.filter(p => p.collection === collection);
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.collection || '').toLowerCase().includes(q)
    );
  }
  if (sort === 'price') {
    filtered.sort((a, b) => order === 'desc' ? b.price - a.price : a.price - b.price);
  } else {
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  const total      = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start      = (page - 1) * limit;
  const products   = filtered.slice(start, start + limit);

  return NextResponse.json({ products, total, page, totalPages, facets });
}
