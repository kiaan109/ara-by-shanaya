'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard, { Product } from '@/components/ProductCard';

const COLLECTIONS = [
  'Dark Cloud', 'Horizon', 'Ocean', 'Beach', 'Waves', 'Pink Skies', 'Orange Vista',
];

const TYPES = [
  { value: 'Dress', label: 'Dresses' },
  { value: 'Top',   label: 'Tops'    },
  { value: 'Skirt', label: 'Skirts'  },
  { value: 'Pants', label: 'Pants'   },
];

const SORT_OPTIONS = [
  { value: '',           label: 'Newest' },
  { value: 'price_asc',  label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

function ShopContent() {
  const params  = useSearchParams();
  const router  = useRouter();

  // ── Initialise from URL params ──────────────────────────────────
  const [products,   setProducts]   = useState<Product[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [sort,       setSort]       = useState('');
  const [search,     setSearch]     = useState(params.get('search')     || '');
  const [collection, setCollection] = useState(params.get('collection') || '');
  const [typeFilter, setTypeFilter] = useState(params.get('category')   || '');
  const [page,       setPage]       = useState(1);

  // Sync when URL params change (e.g. navbar click)
  useEffect(() => {
    setSearch(params.get('search')     || '');
    setCollection(params.get('collection') || '');
    setTypeFilter(params.get('category')   || '');
    setPage(1);
  }, [params]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), limit: '12' });
    if (sort === 'price_asc')  { q.set('sort', 'price'); q.set('order', 'asc'); }
    if (sort === 'price_desc') { q.set('sort', 'price'); q.set('order', 'desc'); }
    if (search)     q.set('search',     search);
    if (collection) q.set('collection', collection);
    if (typeFilter) q.set('category',   typeFilter);
    fetch(`/api/products?${q}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [sort, search, page, collection, typeFilter]);

  const totalPages = Math.ceil(total / 12);

  const clearAll = () => {
    setSearch(''); setCollection(''); setTypeFilter(''); setPage(1);
    router.replace('/shop');
  };

  const typeLabel   = TYPES.find(t => t.value === typeFilter)?.label || '';
  const activeLabel = collection || typeLabel || (search ? `"${search}"` : 'All Products');

  return (
    <div className="min-h-screen pt-20">

      {/* ── Collection filter bar ─────────────────────────────────── */}
      <div className="border-b border-[#e5e5e5] overflow-x-auto bg-white sticky top-[64px] z-40">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex items-center">
          <button
            onClick={() => { setCollection(''); setTypeFilter(''); setPage(1); router.replace('/shop'); }}
            className={`px-5 py-4 font-sans text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-all border-b-2 ${
              !collection && !typeFilter && !search
                ? 'border-black text-black'
                : 'border-transparent text-[#767676] hover:text-black'
            }`}
          >
            All
          </button>

          {/* Collection tabs */}
          <span className="w-px h-4 bg-[#e5e5e5] mx-1" />
          {COLLECTIONS.map(c => (
            <button
              key={c}
              onClick={() => { setCollection(c === collection ? '' : c); setTypeFilter(''); setPage(1); }}
              className={`px-4 py-4 font-sans text-[10px] tracking-[0.15em] uppercase whitespace-nowrap transition-all border-b-2 ${
                collection === c ? 'border-[#C5A059] text-black' : 'border-transparent text-[#767676] hover:text-black'
              }`}
            >
              {c}
            </button>
          ))}

          {/* Type tabs */}
          <span className="w-px h-4 bg-[#e5e5e5] mx-1" />
          {TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setTypeFilter(value === typeFilter ? '' : value); setPage(1); }}
              className={`px-4 py-4 font-sans text-[10px] tracking-[0.15em] uppercase whitespace-nowrap transition-all border-b-2 ${
                typeFilter === value ? 'border-black text-black' : 'border-transparent text-[#767676] hover:text-black'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display italic text-[22px] font-light leading-none">{activeLabel}</h1>
            <p className="font-sans text-[10px] text-[#767676] mt-1">{total} pieces</p>
          </div>
          <div className="flex items-center gap-4">
            {(search || collection || typeFilter) && (
              <button onClick={clearAll}
                className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#C5A059] hover:text-black transition-colors">
                Clear ×
              </button>
            )}
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              className="font-sans text-[10px] tracking-[0.1em] uppercase bg-transparent border-b border-[#e5e5e5] focus:border-black focus:outline-none pb-1 text-[#767676] cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
            {Array(8).fill(0).map((_, i) => (
              <div key={i}>
                <div className="bg-[#f0f0f0] animate-pulse" style={{ aspectRatio: '3/4' }} />
                <div className="mt-2 h-2.5 bg-[#f0f0f0] animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#767676] mb-4">No products found</p>
            <button onClick={clearAll}
              className="font-sans text-[11px] tracking-[0.15em] uppercase underline underline-offset-2 hover:opacity-50 transition-opacity">
              View All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-14">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 font-sans text-[11px] transition-all ${
                  page === p ? 'bg-black text-white' : 'text-[#767676] hover:text-black border border-transparent hover:border-[#e5e5e5]'
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
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
