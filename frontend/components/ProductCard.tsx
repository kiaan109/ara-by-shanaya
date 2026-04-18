'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
  const addItem = useCartStore((s) => s.addItem);

  const imageUrl = product.images?.[0]
    ? product.images[0].startsWith('http') ? product.images[0] : `${BACKEND}/${product.images[0]}`
    : '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ _id: product._id, name: product.name, price: product.price, image: imageUrl });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="group"
    >
      <Link href={`/products/${product._id}`}>
        <div className="luxury-card overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-400 hover:-translate-y-0.5">
          {/* Image container */}
          <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '3/4' }}>
            {imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gold-50">
                <svg className="w-16 h-16 text-gold-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Hover overlay with Add to Cart */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-400 flex items-end">
              <motion.div
                className="w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400"
              >
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white text-gold-500 text-xs tracking-[0.2em] uppercase font-medium py-3 rounded-sm hover:bg-gold-500 hover:text-white transition-colors duration-300"
                >
                  Add to Cart
                </button>
              </motion.div>
            </div>

            {/* Out of stock badge */}
            {!product.inStock && (
              <div className="absolute top-3 left-3 bg-gray-800 text-white text-[10px] tracking-wider uppercase px-2 py-1">
                Sold Out
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="p-4">
            <h3 className="font-luxury text-base text-gray-900 mb-1 group-hover:text-gold-500 transition-colors leading-snug">
              {product.name}
            </h3>
            <p className="text-gold-500 font-medium text-sm">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
