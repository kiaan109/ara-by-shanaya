'use client';
import { useState, useEffect } from 'react';
import ProductCard, { Product } from '@/components/ProductCard';
import { getProducts } from '@/lib/api';

const CATEGORIES = ['All', 'Saree', 'Lehenga', 'Kurti', 'Gown', 'Suit', 'Dupatta'];
const SORT_OPTIONS = [
  { label: 'Newest', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export default function ProductsPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [category,   setCategory]   = useState('All');
  const [sort,       setSort]       = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { setPage(1); }, [category, sort]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 12 };
    if (category !== 'All') params.category = category;
    if (sort === 'price_asc')  params.sort = 'price';
    if (sort === 'price_desc') { params.sort = 'price'; params.order = 'desc'; }

    getProducts(params)
      .then((data) => {
        setProducts(data.products || data);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort, page]);

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Header */}
      <section className="px-6 pt-16 pb-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <p className="section-label mb-3">ARA by Shanaya</p>
          <h1
            className="font-serif text-black"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300, letterSpacing: '0.04em' }}
          >
            Collection
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filter + Sort bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          {/* Category filters */}
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`font-sans text-xs tracking-widest uppercase px-3 py-2 transition-all duration-200 ${
                  category === cat
                    ? 'text-black underline underline-offset-4'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="font-sans text-xs tracking-widest uppercase bg-white border border-gray-200 px-4 py-2 text-gray-700 focus:outline-none focus:border-black transition-colors cursor-pointer"
            style={{ borderRadius: 0 }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse" style={{ aspectRatio: '3/4' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-sans font-light text-gray-400 text-sm mb-6">No products found.</p>
            <button onClick={() => setCategory('All')} className="btn-outline">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 font-sans text-xs transition-all ${
                  page === p
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black'
                }`}
                style={{ borderRadius: 0 }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
