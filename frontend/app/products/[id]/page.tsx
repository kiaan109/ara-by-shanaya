'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProduct } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { Product } from '@/components/ProductCard';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product,       setProduct]       = useState<Product | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [activeImg,     setActiveImg]     = useState(0);
  const [selectedSize,  setSize]          = useState('');
  const [selectedColor, setColor]         = useState('');
  const [zoomed,        setZoomed]        = useState(false);
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
    <div className="min-h-screen pt-16 flex items-center justify-center bg-white">
      <div className="w-6 h-6 border border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center gap-6 bg-white">
      <p className="font-sans text-sm text-gray-400">Product not found.</p>
      <Link href="/products" className="btn-outline">Back to Collection</Link>
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
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-sans text-xs text-gray-400 mb-10 tracking-widest uppercase">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-black truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-10 xl:gap-16">

          {/* LEFT: Images */}
          <div>
            {/* Main Image */}
            <div
              className="relative overflow-hidden bg-gray-100 cursor-zoom-in"
              style={{ aspectRatio: '3/4' }}
              onClick={() => setZoomed(true)}
            >
              {mainImg ? (
                <img
                  key={activeImg}
                  src={mainImg}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {!product.inStock && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="bg-black text-white font-sans text-xs tracking-widest uppercase px-4 py-2">
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
                    className={`flex-shrink-0 overflow-hidden border transition-all duration-200 ${
                      activeImg === i
                        ? 'border-black'
                        : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'
                    }`}
                    style={{ width: 68, height: 90 }}
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
          </div>

          {/* RIGHT: Info */}
          <div className="flex flex-col">
            {/* Category label */}
            <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-gray-400 mb-4">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="font-serif font-light text-3xl md:text-4xl text-black leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <p className="font-sans font-medium text-xl text-black mb-6">
              ₹{product.price.toLocaleString('en-IN')}
            </p>

            <div className="w-10 h-px bg-gray-200 mb-6" />

            {/* Description */}
            {product.description && (
              <p className="font-sans font-light text-sm text-gray-500 leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-3">
                  Color: <span className="text-black">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      title={c}
                      className={`w-7 h-7 border-2 transition-all ${
                        selectedColor === c ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: c, borderRadius: 0 }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-3">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-4 py-2 font-sans text-xs tracking-wider border transition-all ${
                        selectedSize === s
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black'
                      }`}
                      style={{ borderRadius: 0 }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="btn-primary w-full text-center mb-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/918980008826?text=${encodeURIComponent(`Hi, I'm interested in: ${product.name} (₹${product.price.toLocaleString('en-IN')})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-sans text-xs tracking-widest uppercase font-medium transition-colors mb-3"
              style={{ borderRadius: 0 }}
            >
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order on WhatsApp
            </a>

            {/* AI Try-On link */}
            <Link
              href="/try-on"
              className="flex items-center justify-center w-full py-3 border border-gray-200 font-sans text-xs tracking-widest uppercase text-gray-500 hover:border-black hover:text-black transition-colors"
              style={{ borderRadius: 0 }}
            >
              Try this on with AI
            </Link>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
              {[
                'Handcrafted',
                'AI Try-On Ready',
                'Free Shipping ₹999+',
                'Easy Returns',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 font-sans text-xs text-gray-400">
                  <span className="w-1 h-1 bg-gray-300 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom */}
      {zoomed && mainImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <img
            src={mainImg}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '90vh' }}
          />
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-5 right-5 text-white/60 hover:text-white text-3xl leading-none font-light"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
