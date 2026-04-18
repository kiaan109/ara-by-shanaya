'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const cartTotal = total();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-subtitle">Your Selections</p>
          <h1 className="section-title mb-10">Shopping Cart</h1>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 flex flex-col items-center"
          >
            <p className="text-6xl text-gold-500/20 mb-6">◇</p>
            <p className="text-gray-500 mb-8">Your cart is empty</p>
            <Link href="/products" className="btn-gold">Explore Collection</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => {
                  const imgSrc = item.image?.startsWith('http') ? item.image : item.image ? `${BACKEND}/${item.image}` : '';
                  return (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className="luxury-card p-5 flex gap-5 items-center"
                    >
                      {/* Image */}
                      <div
                        className="w-24 h-28 rounded-sm flex-shrink-0 bg-luxury-dark"
                        style={imgSrc ? { backgroundImage: `url(${imgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-luxury text-lg text-white truncate">{item.name}</h3>
                        {item.size  && <p className="text-gray-500 text-xs mt-1">Size: {item.size}</p>}
                        {item.color && (
                          <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                            Color: <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ backgroundColor: item.color }} />
                          </p>
                        )}
                        <p className="text-gold-400 font-semibold mt-2">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 gold-border rounded-sm text-gold-400 hover:bg-gold-500 hover:text-black transition-all flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-white w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 gold-border rounded-sm text-gold-400 hover:bg-gold-500 hover:text-black transition-all flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => { removeItem(item._id); toast.success('Removed from cart'); }}
                        className="text-gray-600 hover:text-red-400 transition-colors ml-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="luxury-card p-6 h-fit sticky top-28"
            >
              <h2 className="font-luxury text-xl text-white mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Shipping</span>
                  <span className={cartTotal >= 5000 ? 'text-green-400' : 'text-gray-400'}>
                    {cartTotal >= 5000 ? 'Free' : '₹250'}
                  </span>
                </div>
                {cartTotal < 5000 && (
                  <p className="text-xs text-gold-500/60">Add ₹{(5000 - cartTotal).toLocaleString('en-IN')} more for free shipping</p>
                )}
              </div>
              <div className="border-t border-gold-500/20 pt-4 mb-6">
                <div className="flex justify-between text-white font-semibold">
                  <span>Total</span>
                  <span className="text-gold-400">₹{(cartTotal + (cartTotal >= 5000 ? 0 : 250)).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-gold w-full text-center block">
                Proceed to Checkout
              </Link>
              <Link href="/products" className="block text-center text-gray-600 text-xs mt-4 hover:text-gold-400 transition-colors">
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
