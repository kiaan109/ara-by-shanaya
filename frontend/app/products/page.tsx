'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard, { Product } from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getProducts } from '@/lib/api';

const CATEGORIES = ['All', 'Saree', 'Lehenga', 'Kurti', 'Gown', 'Suit', 'Dupatta'];

export default function ProductsPage() {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState('All');
  const [search,    setSearch]    = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page,      setPage]      = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 9 };
    if (category !== 'All') params.category = category;
    if (debouncedSearch) params.search = debouncedSearch;

    getProducts(params)
      .then((data) => {
        setProducts(data.products || data);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, debouncedSearch, page]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="px-6 py-16 text-center border-b border-gold-500/10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="section-subtitle"
        >
          ARA Collection
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="section-title"
        >
          Our Designs
        </motion.h1>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search designs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-luxury-card gold-border pl-12 pr-4 py-3 text-sm text-white placeholder-gray-600 rounded-sm focus:outline-none focus:border-gold-500/60 transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-xs tracking-[0.2em] uppercase rounded-sm transition-all duration-300 ${
                  category === cat
                    ? 'bg-gold-500 text-black font-semibold'
                    : 'gold-border text-gray-400 hover:border-gold-400 hover:text-gold-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingSpinner message="Loading Collection" />
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-600 text-4xl mb-4">◇</p>
            <p className="text-gray-500">No designs found.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${debouncedSearch}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-16">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 text-sm rounded-sm transition-all ${
                  page === p
                    ? 'bg-gold-500 text-black font-semibold'
                    : 'gold-border text-gray-400 hover:border-gold-400'
                }`}
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
