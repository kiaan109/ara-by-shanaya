'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import ProductCard, { Product } from '@/components/ProductCard';
import toast from 'react-hot-toast';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || '';
function resolveImg(img: string) {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('/')) return img;
  return `${BACKEND}/${img}`;
}

const CARE = [
  { icon: '🧺', label: 'Hand wash cold' },
  { icon: '🚫', label: 'Do not bleach' },
  { icon: '❌', label: 'Do not tumble dry' },
  { icon: '♨️', label: 'Low iron' },
];

const SIZE_GUIDE = [
  { size: 'XS', bust: '31–32"', waist: '24–25"', hip: '34–35"' },
  { size: 'S',  bust: '33–34"', waist: '26–27"', hip: '36–37"' },
  { size: 'M',  bust: '35–36"', waist: '28–29"', hip: '38–39"' },
  { size: 'L',  bust: '37–38"', waist: '30–31"', hip: '40–41"' },
  { size: 'XL', bust: '39–40"', waist: '32–33"', hip: '42–43"' },
];

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product,     setProduct]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [selSize,     setSelSize]     = useState('');
  const [mainIdx,     setMainIdx]     = useState(0);
  const [adding,      setAdding]      = useState(false);
  const [related,     setRelated]     = useState<Product[]>([]);
  const [sizeGuide,   setSizeGuide]   = useState(false);
  const [activeTab,   setActiveTab]   = useState<'description' | 'care' | 'delivery'>('description');

  const addItem = useCartStore(s => s.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setMainIdx(0);
    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.json()),
      fetch(`/api/products?limit=5`).then(r => r.json()),
    ]).then(([d, rel]) => {
      const p = d.product || d;
      setProduct(p);
      setSelSize(p.sizes?.[0] || '');
      setRelated((rel.products || []).filter((r: Product) => r._id !== id).slice(0, 4));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-[11px] tracking-[0.2em] uppercase text-[#767676]">Product not found</p>
      <Link href="/shop" className="text-[11px] tracking-[0.15em] uppercase underline underline-offset-2 hover:opacity-50 transition-opacity">
        Back to Shop
      </Link>
    </div>
  );

  const images    = (product.images || []).map(resolveImg).filter(Boolean);
  const mainImg   = images[mainIdx] || images[0] || '';
  const wishlisted = isWishlisted(product._id);

  const handleAddToBag = () => {
    if (!selSize && product.sizes?.length) { toast.error('Please select a size'); return; }
    setAdding(true);
    addItem({ _id: product._id, name: product.name, price: product.price, image: images[0], size: selSize, color: product.colors?.[0] });
    toast.success('Added to bag');
    setTimeout(() => setAdding(false), 800);
  };

  // Auto-save order to Supabase then open WhatsApp
  const handleWhatsApp = async () => {
    if (!selSize && product.sizes?.length) { toast.error('Please select a size first'); return; }
    // Save order in background (don't block WA opening)
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId:    product._id,
        productName:  product.name,
        productPrice: product.price,
        productImage: images[0] || '',
        size:  selSize,
        color: product.colors?.[0] || '',
        customerName:  '',
        customerPhone: '',
      }),
    }).catch(() => {});

    const msg = encodeURIComponent(
      `Hi! I'd like to order "${product.name}" (Size: ${selSize || 'TBD'}, ₹${product.price?.toLocaleString('en-IN')}) from the ARA by Shanaya SS '26 collection. Is it available? 🌸`
    );
    window.open(`https://wa.me/918980008826?text=${msg}`, '_blank');
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images,
    sku: product._id,
    brand: { '@type': 'Brand', name: 'ARA by Shanaya' },
    offers: {
      '@type': 'Offer',
      url: `https://arabyshanaya.com/shop/${product._id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* Breadcrumb */}
      <div className="px-5 md:px-10 py-3.5 flex items-center gap-2 text-[10px] tracking-[0.12em] uppercase text-[#999] border-b border-[#f5f5f5]">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-black">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

        {/* ── LEFT: Gallery ── */}
        <div className="md:sticky md:top-[52px] md:h-[calc(100vh-52px)] flex flex-col">
          {/* Desktop thumbnail row */}
          <div className="hidden md:flex gap-2 px-5 md:px-10 pt-4 pb-3 overflow-x-auto">
            {images.map((src: string, i: number) => (
              <button key={i} onClick={() => setMainIdx(i)}
                className="flex-shrink-0 w-14 overflow-hidden transition-all"
                style={{ aspectRatio: '3/4', opacity: i === mainIdx ? 1 : 0.45, border: i === mainIdx ? '1px solid #000' : '1px solid transparent' }}>
                <img src={src} alt={`View ${i + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>

          {/* Main image — full photo, no crop */}
          <div className="flex-1 relative overflow-hidden bg-white" style={{ minHeight: '300px' }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={mainIdx}
                src={mainImg}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full object-contain"
                style={{ display: 'block' }}
              />
            </AnimatePresence>

            {/* Try-on badge */}
            <Link href={`/try-on?product=${product._id}`}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-[#e5e5e5] hover:border-black transition-all text-[9px] tracking-[0.2em] uppercase px-3 py-2 flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Try On
            </Link>
          </div>

          {/* Mobile thumbnails */}
          <div className="flex md:hidden gap-2 px-5 py-3 overflow-x-auto">
            {images.map((src: string, i: number) => (
              <button key={i} onClick={() => setMainIdx(i)}
                className="flex-shrink-0 w-12 overflow-hidden transition-all"
                style={{ aspectRatio: '3/4', opacity: i === mainIdx ? 1 : 0.4, border: i === mainIdx ? '1px solid #000' : '1px solid transparent' }}>
                <img src={src} alt={`View ${i + 1}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Info ── */}
        <div className="px-5 md:px-10 py-8 md:py-10 flex flex-col">

          {/* Name + price */}
          <div className="mb-7 pb-7 border-b border-[#f0f0f0]">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#767676] mb-2">{product.category}</p>
            <h1 className="text-[26px] font-light tracking-[-0.015em] leading-tight mb-4">{product.name}</h1>
            <div className="flex items-baseline gap-3">
              <p className="text-[20px] text-black">₹{product.price?.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-[#aaa]">Incl. all taxes</p>
            </div>
          </div>

          {/* Colours */}
          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.25em] uppercase mb-2">
                Colour — <span className="text-[#555]">{product.colors.join(', ')}</span>
              </p>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] tracking-[0.25em] uppercase">Size</p>
                <button onClick={() => setSizeGuide(v => !v)}
                  className="text-[10px] tracking-[0.12em] uppercase text-[#767676] hover:text-black transition-colors underline underline-offset-2">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button key={s} onClick={() => setSelSize(s)}
                    className={`h-10 min-w-[44px] px-3 text-[11px] tracking-[0.05em] border transition-all duration-150 ${
                      selSize === s
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-[#ddd] hover:border-black'
                    }`}>{s}</button>
                ))}
              </div>

              {/* Size guide drawer */}
              <AnimatePresence>
                {sizeGuide && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4">
                    <div className="border border-[#f0f0f0] p-4">
                      <p className="text-[10px] tracking-[0.2em] uppercase mb-3 text-[#767676]">Size Guide (inches)</p>
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-[#f0f0f0] text-[#767676]">
                            <th className="text-left py-1.5 font-normal">Size</th>
                            <th className="text-left py-1.5 font-normal">Bust</th>
                            <th className="text-left py-1.5 font-normal">Waist</th>
                            <th className="text-left py-1.5 font-normal">Hip</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f5f5]">
                          {SIZE_GUIDE.map(row => (
                            <tr key={row.size} className={selSize === row.size ? 'bg-[#f9f9f9]' : ''}>
                              <td className="py-2 font-medium">{row.size}</td>
                              <td className="py-2">{row.bust}</td>
                              <td className="py-2">{row.waist}</td>
                              <td className="py-2">{row.hip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-2.5 mb-3">
            <button onClick={handleAddToBag} disabled={adding || !product.inStock}
              className="flex-1 bg-black text-white text-[11px] tracking-[0.22em] uppercase py-4 hover:opacity-75 transition-opacity disabled:opacity-30">
              {!product.inStock ? 'Sold Out' : adding ? 'Adding…' : 'Add to Bag'}
            </button>
            <button
              onClick={() => toggleItem({ _id: product._id, name: product.name, price: product.price, image: images[0], category: product.category })}
              className="w-14 h-14 border border-[#ddd] flex items-center justify-center hover:border-black transition-all flex-shrink-0"
              aria-label="Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24"
                fill={wishlisted ? '#000' : 'none'} stroke="#000" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'fill 0.2s' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Buy Now — goes straight to checkout */}
          <Link
            href={`/checkout?id=${product._id}&size=${selSize || product.sizes?.[0] || ''}`}
            className="w-full gold-btn text-white text-[11px] tracking-[0.22em] uppercase py-4 mb-3 flex items-center justify-center gap-2 transition-all"
            onClick={e => {
              if (!selSize && product.sizes?.length) { e.preventDefault(); toast.error('Please select a size'); }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Buy Now
          </Link>

          {/* Virtual try-on button */}
          <Link href={`/try-on?product=${product._id}`}
            className="w-full border border-[#e5e5e5] hover:border-black text-black text-[11px] tracking-[0.22em] uppercase py-3.5 mb-8 transition-all flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Virtual Try‑On
          </Link>

          {/* Tabs: Description / Care / Delivery */}
          <div className="border-t border-[#f0f0f0]">
            <div className="flex border-b border-[#f0f0f0]">
              {(['description', 'care', 'delivery'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3.5 text-[10px] tracking-[0.15em] uppercase transition-colors ${
                    activeTab === tab ? 'text-black border-b-2 border-black -mb-px' : 'text-[#999] hover:text-black'
                  }`}>
                  {tab === 'description' ? 'Details' : tab === 'care' ? 'Care' : 'Delivery'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="py-5">
                {activeTab === 'description' && (
                  <div>
                    <p className="text-[12.5px] text-[#444] leading-relaxed mb-4">{product.description}</p>
                    <ul className="space-y-1.5 text-[12px] text-[#555]">
                      <li className="flex gap-2"><span className="text-[#bbb]">—</span> Summer 2025 Collection</li>
                      <li className="flex gap-2"><span className="text-[#bbb]">—</span> Lightweight summer fabric</li>
                      <li className="flex gap-2"><span className="text-[#bbb]">—</span> Made in India</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'care' && (
                  <div className="grid grid-cols-2 gap-3">
                    {CARE.map(({ icon, label }) => (
                      <div key={label} className="flex items-center gap-3 bg-[#fafafa] px-3 py-3">
                        <span className="text-base">{icon}</span>
                        <span className="text-[11px] text-[#555]">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'delivery' && (
                  <div className="space-y-4">
                    {[
                      { icon: '📦', label: 'Free shipping', body: 'On all orders above ₹3,000' },
                      { icon: '🚚', label: '15–20 day delivery', body: 'Estimated delivery time' },
                      { icon: '🚫', label: 'No exchange or return', body: 'All sales are final' },
                      { icon: '🔒', label: 'Secure checkout', body: 'Your data is always protected' },
                    ].map(({ icon, label, body }) => (
                      <div key={label} className="flex items-start gap-3">
                        <span className="text-base mt-0.5">{icon}</span>
                        <div>
                          <p className="text-[11px] text-black">{label}</p>
                          <p className="text-[11px] text-[#999]">{body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <div className="border-t border-[#f0f0f0] px-5 md:px-10 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.35em] uppercase text-[#767676] mb-1">You May Also Like</p>
              <h2 className="text-[22px] font-light tracking-[-0.01em]">Complete the Look</h2>
            </div>
            <Link href="/shop" className="text-[11px] tracking-[0.15em] uppercase text-[#767676] hover:text-black transition-colors">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
