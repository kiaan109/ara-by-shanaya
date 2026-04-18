'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProduct } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { Product } from '@/components/ProductCard';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSize] = useState('');
  const [selectedColor, setColor] = useState('');
  const [zoomed, setZoomed] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    getProduct(id)
      .then((data) => {
        setProduct(data);
        if (data.sizes?.length)  setSize(data.sizes[0]);
        if (data.colors?.length) setColor(data.colors[0]);
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 bg-white">
      <p className="text-gray-400">Product not found.</p>
      <Link href="/products" className="btn-outline-gold">Back to Collection</Link>
    </div>
  );

  const images = product.images?.length
    ? product.images.map((img) =>
        img.startsWith('http') ? img : `${BACKEND}/${img}`
      )
    : [];

  const mainImg = images[activeImg] || '';

  const handleAddToCart = () => {
    addItem({
      _id:   product._id,
      name:  product.name,
      price: product.price,
      image: images[0] || '',
      size:  selectedSize,
      color: selectedColor,
    } as any);
    toast.success(`${product.name} added to cart ✨`);
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-10 tracking-widest uppercase">
          <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold-500 transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-gold-500 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">

          {/* ── LEFT: Images ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Image */}
            <div
              className="relative overflow-hidden rounded-sm bg-gray-50 cursor-zoom-in"
              style={{ aspectRatio: '3/4' }}
              onClick={() => setZoomed(true)}
            >
              {mainImg ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={mainImg}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Zoom hint */}
              {mainImg && (
                <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 text-[10px] text-gray-400 tracking-wider rounded-sm pointer-events-none">
                  Click to zoom
                </div>
              )}

              {/* Out of stock overlay */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="bg-gray-800 text-white text-xs tracking-widest uppercase px-4 py-2">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all duration-200 ${
                      activeImg === i
                        ? 'border-gold-500 shadow-md'
                        : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gold-300'
                    }`}
                    style={{ width: 72, height: 96 }}
                  >
                    <img
                      src={src}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── RIGHT: Info ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col"
          >
            {/* Category */}
            <span className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-3">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="font-luxury text-3xl md:text-4xl xl:text-5xl text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-2xl text-gold-500 font-semibold mb-5">
              ₹{product.price.toLocaleString('en-IN')}
            </p>

            <div className="w-12 h-px bg-gold-200 mb-6" />

            {/* Description */}
            {product.description && (
              <p className="text-gray-500 leading-relaxed text-sm mb-8">
                {product.description}
              </p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-3">
                  Color: <span className="text-gray-700 font-medium">{selectedColor}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      title={c}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === c
                          ? 'border-gold-500 scale-110 shadow-md'
                          : 'border-gray-200 hover:border-gold-300'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-3">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-5 py-2 text-xs tracking-wider rounded-sm border transition-all ${
                        selectedSize === s
                          ? 'bg-gold-500 text-white border-gold-500 font-semibold'
                          : 'border-gray-200 text-gray-500 hover:border-gold-400 hover:text-gold-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="btn-gold flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <a
                href={`https://wa.me/918980008826?text=${encodeURIComponent(`Hi, I'm interested in: ${product.name} (₹${product.price.toLocaleString('en-IN')})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium tracking-wide rounded-sm transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order on WhatsApp
              </a>
            </div>

            {/* AI Try-On link */}
            <Link
              href="/try-on"
              className="mt-3 flex items-center justify-center gap-2 w-full py-3 border border-gold-200 text-gold-500 text-sm tracking-wide hover:bg-gold-50 transition-colors rounded-sm"
            >
              ✦ Try this on with AI
            </Link>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
              {[
                { icon: '✦', label: 'Handcrafted' },
                { icon: '◈', label: 'AI Try-On Ready' },
                { icon: '⬡', label: 'Free Shipping ₹5000+' },
                { icon: '◇', label: 'Easy Returns' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-gold-400 text-base leading-none">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Fullscreen Zoom Modal ── */}
      <AnimatePresence>
        {zoomed && mainImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={mainImg}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
              style={{ maxHeight: '90vh' }}
            />
            <button
              onClick={() => setZoomed(false)}
              className="absolute top-5 right-5 text-white/60 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
