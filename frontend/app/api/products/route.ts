import { NextRequest, NextResponse } from 'next/server';
import { localProducts } from '@/lib/localProducts';
import { createClient } from '@supabase/supabase-js';

// Merge local hardcoded products with any admin-uploaded products from Supabase
async function getAllProducts() {
  const all = [...localProducts] as any[];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('admin_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data?.length) {
      // Map Supabase column names to our product shape
      const mapped = data.map((p: any) => ({
        _id: p._id || p.id,
        name: p.name, price: p.price,
        description: p.description || '',
        category: p.category || 'Other',
        collection: p.collection || 'Custom',
        images: p.images || [],
        colors: p.colors || [],
        sizes: p.sizes || ['XS','S','M','L','XL'],
        inStock: p.in_stock ?? true,
        featured: p.featured ?? false,
        stock: p.stock || 10,
        createdAt: p.created_at,
      }));
      all.push(...mapped);
    }
  } catch {
    // Supabase not configured — just use local products
  }

  return all;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search   = searchParams.get('search');
  const sort     = searchParams.get('sort');
  const order    = searchParams.get('order');
  const limit    = parseInt(searchParams.get('limit') || '20');
  const page     = parseInt(searchParams.get('page')  || '1');

  let filtered = await getAllProducts();

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

  return NextResponse.json({ products, total, page, totalPages });
}
