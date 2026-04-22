'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
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

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [hovered, setHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const imageUrl = product.images?.[0]
    ? product.images[0].startsWith('http')
      ? product.images[0]
      : `${BACKEND}/${product.images[0]}`
    : '';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ _id: product._id, name: product.name, price: product.price, image: imageUrl });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link href={`/products/${product._id}`}>
      <div
        className="group cursor-pointer bg-white"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image container */}
        <div
          className="relative overflow-hidden bg-gray-100"
          style={{ aspectRatio: '3/4' }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Out of stock */}
          {!product.inStock && (
            <div className="absolute top-3 left-3 bg-black text-white text-[9px] tracking-widest uppercase px-2 py-1">
              Sold Out
            </div>
          )}

          {/* Quick Add overlay */}
          <div
            className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <button
              onClick={handleQuickAdd}
              className="w-full bg-white text-black text-[10px] tracking-widest uppercase font-medium py-3 hover:bg-black hover:text-white transition-colors duration-200"
              style={{ borderRadius: 0 }}
            >
              Quick Add
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 pb-1">
          <p className="font-sans text-sm font-normal text-gray-900 leading-snug truncate">
            {product.name}
          </p>
          <p className="font-sans text-sm font-medium text-black mt-0.5">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </Link>
  );
}
