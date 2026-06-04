'use client';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';

const FRONTEND = 'https://frontend-iota-three-66.vercel.app';

interface Product {
  _id: string; name: string; price: number; description: string;
  category: string; collection: string; images: string[];
  colors: string[]; sizes: string[]; inStock: boolean; featured: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');

  useEffect(() => {
    getProducts({ limit: 100 })
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const collections = ['All', ...Array.from(new Set(products.map(p => p.collection).filter(Boolean)))];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || p.collection === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-light">Products</h1>
          <p className="text-[12px] text-[#767676] mt-1">{products.length} products across 7 collections</p>
        </div>
        <a href={`${FRONTEND}/shop`} target="_blank" rel="noopener noreferrer"
          className="bg-black text-white text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:opacity-75 transition-opacity">
          View Live Shop ↗
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text" placeholder="Search products..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-[#e5e5e5] px-4 py-2.5 text-[12px] focus:outline-none focus:border-black transition-colors w-full md:w-64"
        />
        <div className="flex flex-wrap gap-2">
          {collections.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-all ${
                filter === c ? 'bg-black text-white' : 'bg-white border border-[#e5e5e5] text-[#767676] hover:border-black'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 px-4 py-3 text-[11px] text-blue-700">
        Products are served from <strong>localProducts.ts</strong>. To add or edit products, update that file and redeploy. &nbsp;
        <a href="https://github.com/kiaan109/ara-by-shanaya" target="_blank" rel="noopener noreferrer"
          className="underline hover:no-underline">Open on GitHub →</a>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-[#e5e5e5] overflow-hidden">
              <div className="aspect-[3/4] bg-[#f5f5f5] animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[#f5f5f5] animate-pulse w-3/4" />
                <div className="h-3 bg-[#f5f5f5] animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[13px] text-[#767676]">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => {
            const img = p.images?.[0]
              ? (p.images[0].startsWith('http') ? p.images[0] : `${FRONTEND}${p.images[0]}`)
              : null;
            return (
              <div key={p._id} className="bg-white border border-[#e5e5e5] overflow-hidden group">
                {/* Image */}
                <div className="aspect-[3/4] bg-[#f9f9f9] relative overflow-hidden">
                  {img ? (
                    <img src={img} alt={p.name}
                      className="w-full h-full object-contain" style={{ display: 'block' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#ccc] text-sm">No image</div>
                  )}
                  {p.featured && (
                    <span className="absolute top-2 left-2 bg-black text-white text-[9px] tracking-[0.1em] uppercase px-2 py-1">
                      Featured
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-[11px] text-[#C5A059] tracking-[0.1em] uppercase mb-0.5">{p.collection}</p>
                  <p className="text-[13px] leading-tight">{p.name}</p>
                  <p className="text-[12px] text-[#767676] mt-1">₹{p.price.toLocaleString('en-IN')}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] uppercase tracking-wide text-[#767676]">{p.category}</span>
                    <span className={`text-[9px] uppercase tracking-wide ${p.inStock ? 'text-green-600' : 'text-red-500'}`}>
                      {p.inStock ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                  <a href={`${FRONTEND}/shop/${p._id}`} target="_blank" rel="noopener noreferrer"
                    className="block mt-3 text-center text-[10px] tracking-[0.15em] uppercase border border-[#e5e5e5] py-2 hover:border-black transition-colors">
                    View on Store ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
