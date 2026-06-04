import { NextRequest, NextResponse } from 'next/server';
import { localProducts } from '@/lib/localProducts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search   = searchParams.get('search');
  const sort     = searchParams.get('sort');
  const order    = searchParams.get('order');
  const limit    = parseInt(searchParams.get('limit') || '20');
  const page     = parseInt(searchParams.get('page')  || '1');

  let filtered = [...localProducts];

  if (category && category !== 'All') {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
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
