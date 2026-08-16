'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';
import { promoPrice, PROMO_PERCENT } from '@/lib/promo';

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  colors?: string[];
  sizes?: string[];
  inStock: boolean;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || '';

function resolveImg(img: string) {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('/')) return img;
  return `${BACKEND}/${img}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const [picker, setPicker] = useState<'bag' | 'buy' | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const addItem = useCartStore(s => s.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product._id);
  const router = useRouter();

  const imgs = (product.images || []).map(resolveImg).filter(Boolean);
  const img1 = imgs[0] || '';
  const currentImg = imgs[imgIdx] || '';
  const nextImg = imgs.length > 1 ? imgs[(imgIdx + 1) % imgs.length] : '';

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    didSwipe.current = false;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - (touchStartY.current ?? 0);
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true;
      setImgIdx(i => dx < 0 ? Math.min(i + 1, imgs.length - 1) : Math.max(i - 1, 0));
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleImageClick = () => {
    if (picker) return;
    if (didSwipe.current) { didSwipe.current = false; return; }
    router.push(`/shop/${product._id}`);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/shop/${product._id}`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    if (product.sizes?.length) {
      setPicker('buy');
      return;
    }
    router.push(`/checkout?id=${product._id}`);
  };

  const confirmSize = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    if (picker === 'bag') {
      addItem({ _id: product._id, name: product.name, price: product.price, image: img1, size, color: product.colors?.[0] });
      toast.success(`Added to bag — ${size}`);
    } else {
      router.push(`/checkout?id=${product._id}&size=${encodeURIComponent(size)}`);
    }
    setPicker(null);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem({ _id: product._id, name: product.name, price: product.price, image: img1, category: product.category });
  };

  const closePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPicker(null);
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image container ── */}
      <div
        className="relative overflow-hidden bg-white border border-[#f0f0f0]"
        style={{ aspectRatio: '3/4' }}
        onClick={handleImageClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {currentImg ? (
          <>
            <img
              src={currentImg}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain transition-all duration-700 pointer-events-none"
              style={{
                transform: hovered ? 'scale(1.03)' : 'scale(1)',
                opacity: hovered && nextImg ? 0 : 1,
              }}
            />
            {nextImg && (
              <img
                src={nextImg}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain transition-all duration-700 pointer-events-none"
                style={{
                  transform: hovered ? 'scale(1.03)' : 'scale(1)',
                  opacity: hovered ? 1 : 0,
                }}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f5] pointer-events-none">
            <svg className="w-8 h-8 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Sold out */}
        {!product.inStock && (
          <div className="absolute top-3 left-3 bg-white text-black text-[9px] tracking-[0.15em] uppercase px-2 py-1 pointer-events-none">
            Sold Out
          </div>
        )}

        {/* Wishlist heart */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 transition-all duration-300"
          style={{
            opacity: hovered || wishlisted ? 1 : 0,
            transform: hovered || wishlisted ? 'scale(1)' : 'scale(0.8)',
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={wishlisted ? '#000' : 'none'}
            stroke="#000" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'fill 0.2s ease' }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Dark overlay on hover */}
        <div
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-400"
          style={{ opacity: hovered ? 0.08 : 0 }}
        />

        {/* Swipe dot indicators */}
        {imgs.length > 1 && !picker && (
          <div className="absolute bottom-[50px] left-0 right-0 flex justify-center gap-1 pointer-events-none z-10">
            {imgs.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === imgIdx ? '6px' : '5px',
                  height: i === imgIdx ? '6px' : '5px',
                  background: i === imgIdx ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.25)',
                }}
              />
            ))}
          </div>
        )}

        {/* ── Size picker overlay ── */}
        {picker && (
          <div
            className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-3 p-4"
            onClick={closePicker}
          >
            <p className="text-[9px] tracking-[0.25em] uppercase text-[#767676]">
              {picker === 'bag' ? 'Select size to add' : 'Select size to buy'}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {product.sizes!.map(s => (
                <button
                  key={s}
                  onClick={e => confirmSize(e, s)}
                  className="px-3 py-2 border border-[#1a1c1c] text-[#1a1c1c] text-[10px] tracking-wider uppercase hover:bg-[#1a1c1c] hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={closePicker}
              className="text-[9px] tracking-[0.2em] uppercase text-[#aaa] hover:text-black transition-colors mt-1"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Add to Bag / Buy Now ── */}
        {!picker && (
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-2.5 md:opacity-0 md:translate-y-1.5 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:transition-all md:duration-300 flex gap-1.5">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="flex-1 bg-white text-black text-[9px] md:text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase py-3 md:py-3.5 hover:bg-black hover:text-white transition-colors duration-200 disabled:opacity-40"
            >
              Add to Bag
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="flex-1 gold-btn text-white text-[9px] md:text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase py-3 md:py-3.5 transition-colors duration-200 disabled:opacity-40"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <Link href={`/shop/${product._id}`} className="block mt-2">
        <p className="text-[11px] text-black leading-tight truncate">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-[#C5A059] font-medium">₹{promoPrice(product.price).toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-[#aaa] line-through">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-[9px] text-[#1a1c1c] font-medium">{PROMO_PERCENT}% off</span>
        </div>
      </Link>
    </div>
  );
}
