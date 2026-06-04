import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const PRODUCTS_BLOB = 'ara-admin-products.json';

async function readAdminProducts(): Promise<any[]> {
  try {
    const res = await fetch(
      `https://public.blob.vercel-storage.com/${PRODUCTS_BLOB}?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function writeAdminProducts(products: any[]) {
  const blob = new Blob([JSON.stringify(products)], { type: 'application/json' });
  await put(PRODUCTS_BLOB, blob, { access: 'public', addRandomSuffix: false });
}

// GET /api/admin/products
export async function GET() {
  const products = await readAdminProducts();
  return NextResponse.json({ products });
}

// POST /api/admin/products — upload product with images
export async function POST(req: NextRequest) {
  const form = await req.formData();

  const name        = form.get('name') as string;
  const price       = parseInt(form.get('price') as string || '0');
  const description = form.get('description') as string || '';
  const category    = form.get('category') as string || 'Dress';
  const collection  = form.get('collection') as string || 'Other';
  const sizes       = (form.get('sizes') as string || 'XS,S,M,L,XL').split(',').map(s => s.trim()).filter(Boolean);
  const colors      = (form.get('colors') as string || '').split(',').map(s => s.trim()).filter(Boolean);
  const featured    = form.get('featured') === 'true';

  if (!name || !price) {
    return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
  }

  // Upload images to Vercel Blob
  const imageUrls: string[] = [];
  const files = form.getAll('images') as File[];

  for (const file of files) {
    if (!file?.size) continue;
    const ext      = file.name.split('.').pop() || 'jpg';
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { url }  = await put(filename, file, { access: 'public' });
    imageUrls.push(url);
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const product = {
    _id:        `admin-${slug}-${Date.now()}`,
    name, price, description, category, collection,
    sizes, colors, featured,
    images:     imageUrls,
    inStock:    true,
    stock:      10,
    createdAt:  new Date().toISOString(),
  };

  const products = await readAdminProducts();
  products.unshift(product);
  await writeAdminProducts(products);

  return NextResponse.json({ product });
}

// DELETE /api/admin/products?id=xxx
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  const products = await readAdminProducts();
  await writeAdminProducts(products.filter((p: any) => p._id !== id));
  return NextResponse.json({ ok: true });
}
