'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';

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
  const addItem = useCartStore(s => s.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product._id);
  const router = useRouter();

  const img1 = resolveImg(product.images?.[0] || '');
  const img2 = resolveImg(product.images?.[1] || '');

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: img1,
      size: product.sizes?.[0],
      color: product.colors?.[0],
    });
    toast.success('Added to bag');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({ _id: product._id, name: product.name, price: product.price, image: img1, category: product.category });
  };

  return (
    <Link href={`/shop/${product._id}`}>
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image container — object-contain so full photo is always visible */}
        <div className="relative overflow-hidden bg-white border border-[#f0f0f0]" style={{ aspectRatio: '3/4' }}>
          {img1 ? (
            <>
              {/* Primary image */}
              <img
                src={img1}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain transition-all duration-700"
                style={{
                  transform: hovered ? 'scale(1.03)' : 'scale(1)',
                  opacity: hovered && img2 ? 0 : 1,
                }}
              />
              {/* Hover image */}
              {img2 && (
                <img
                  src={img2}
                  alt={product.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-contain transition-all duration-700"
                  style={{
                    transform: hovered ? 'scale(1.03)' : 'scale(1)',
                    opacity: hovered ? 1 : 0,
                  }}
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f5]">
              <svg className="w-8 h-8 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Sold out */}
          {!product.inStock && (
            <div className="absolute top-3 left-3 bg-white text-black text-[9px] tracking-[0.15em] uppercase px-2 py-1">
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

          {/* Dark overlay on hover for add button visibility */}
          <div
            className="absolute inset-0 bg-black transition-opacity duration-400"
            style={{ opacity: hovered ? 0.08 : 0 }}
          />

          {/* Buttons — always visible on mobile, hover-reveal on desktop */}
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-2.5 md:opacity-0 md:translate-y-1.5 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:transition-all md:duration-300 flex gap-1.5">
            <button
              onClick={handleAdd}
              className="flex-1 bg-white text-black text-[9px] md:text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase py-3 md:py-3.5 hover:bg-black hover:text-white transition-colors duration-200"
            >
              Add to Bag
            </button>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/checkout?id=${product._id}&size=${product.sizes?.[0] || ''}`); }}
              className="flex-1 gold-btn text-white text-[9px] md:text-[10px] tracking-[0.18em] md:tracking-[0.2em] uppercase py-3 md:py-3.5 transition-colors duration-200"
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* Info — always visible */}
        <div className="mt-2">
          <p className="text-[11px] text-black leading-tight truncate">{product.name}</p>
          <p className="text-[11px] text-[#C5A059] mt-0.5">₹{product.price.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </Link>
  );
}
