// Server-side catalog access — same source of truth as /api/products
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

export async function getAllProducts(): Promise<any[]> {
  const all = await fetchBlob(ALL_BLOB);
  if (all) return all;
  const merged = [...localProducts] as any[];
  const adminProducts = await fetchBlob(ADMIN_BLOB);
  if (adminProducts) merged.push(...adminProducts);
  return merged;
}

export async function getProduct(id: string): Promise<any | null> {
  const all = await getAllProducts();
  return all.find(p => p._id === id) ?? null;
}
