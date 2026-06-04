'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard, { Product } from '@/components/ProductCard';

const SORT_OPTIONS = [
  { value: '',         label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function ShopContent() {
  const params     = useSearchParams();
  const router     = useRouter();
  const initSearch = params.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState('');
  const [search,   setSearch]   = useState(initSearch);
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), limit: '12' });
    if (sort === 'price_asc')  { q.set('sort', 'price'); q.set('order', 'asc'); }
    if (sort === 'price_desc') { q.set('sort', 'price'); q.set('order', 'desc'); }
    if (search) q.set('search', search);
    fetch(`/api/products?${q}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [sort, search, page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen px-5 md:px-10 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#e5e5e5] pb-5">
        <div>
          <h1 className="text-[11px] tracking-[0.35em] uppercase mb-0.5">All Products</h1>
          <p className="text-[11px] text-[#767676]">{total} items</p>
        </div>
        {/* Sort */}
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          className="text-[11px] tracking-[0.1em] uppercase bg-transparent border-b border-[#e5e5e5] focus:border-black focus:outline-none pb-1 text-[#767676] cursor-pointer"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Search result banner */}
      {search && (
        <div className="flex items-center gap-3 mb-6">
          <p className="text-[11px] text-[#767676]">Results for "<span className="text-black">{search}</span>"</p>
          <button onClick={() => { setSearch(''); setPage(1); router.replace('/shop'); }}
            className="text-[10px] tracking-[0.15em] uppercase text-[#767676] hover:text-black transition-colors underline underline-offset-2">
            Clear
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
          {Array(8).fill(0).map((_, i) => (
            <div key={i}>
              <div className="bg-[#f0f0f0] animate-pulse" style={{ aspectRatio: '3/4' }} />
              <div className="mt-2 h-3 bg-[#f0f0f0] animate-pulse w-3/4" />
              <div className="mt-1 h-3 bg-[#f0f0f0] animate-pulse w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#767676] mb-4">No products found</p>
          <button onClick={() => { setSearch(''); setPage(1); router.replace('/shop'); }}
            className="text-[11px] tracking-[0.15em] uppercase underline underline-offset-2 hover:opacity-50 transition-opacity">
            View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-14">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 text-[11px] transition-all ${
                page === p ? 'bg-black text-white' : 'text-[#767676] hover:text-black border border-transparent hover:border-[#e5e5e5]'
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
