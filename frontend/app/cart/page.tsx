'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const cartTotal = total();
  const shipping = cartTotal >= 999 ? 0 : 99;
  const finalTotal = cartTotal + shipping;

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="section-label mb-2">Your Selections</p>
          <h1 className="heading-lg">Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-28 flex flex-col items-center gap-6">
            <div className="w-14 h-14 border border-gray-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
            <p className="font-sans font-light text-sm text-gray-400">Your cart is empty</p>
            <Link href="/products" className="btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Column headers (desktop) */}
              <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 pb-4 border-b border-gray-100 font-sans text-[10px] tracking-widest uppercase text-gray-400">
                <span className="w-20" />
                <span>Item</span>
                <span className="text-right">Price</span>
                <span className="text-center">Qty</span>
                <span />
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const imgSrc = item.image?.startsWith('http')
                    ? item.image
                    : item.image
                    ? `${BACKEND}/${item.image}`
                    : '';

                  return (
                    <div key={item._id} className="py-6 grid grid-cols-[80px_1fr] md:grid-cols-[80px_1fr_auto_auto_auto] gap-4 items-center">
                      {/* Image */}
                      <div
                        className="w-20 h-24 bg-gray-100 flex-shrink-0"
                        style={imgSrc ? { backgroundImage: `url(${imgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                      />

                      {/* Name + size + mobile price */}
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-normal text-black truncate">{item.name}</p>
                        {item.size  && <p className="font-sans text-xs text-gray-400 mt-0.5">Size: {item.size}</p>}
                        {item.color && (
                          <p className="font-sans text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            Color:
                            <span
                              className="w-3 h-3 inline-block border border-gray-200"
                              style={{ backgroundColor: item.color }}
                            />
                          </p>
                        )}
                        {/* Mobile: price + qty inline */}
                        <div className="flex items-center gap-4 mt-3 md:hidden">
                          <span className="font-sans text-sm font-medium text-black">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          <div className="flex items-center border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                            >
                              −
                            </button>
                            <span className="font-sans text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => { removeItem(item._id); toast.success('Removed'); }}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Desktop: Price */}
                      <span className="hidden md:block font-sans text-sm font-medium text-black text-right">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>

                      {/* Desktop: Qty */}
                      <div className="hidden md:flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors font-sans text-sm"
                        >
                          −
                        </button>
                        <span className="font-sans text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors font-sans text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Desktop: Remove */}
                      <button
                        onClick={() => { removeItem(item._id); toast.success('Removed'); }}
                        className="hidden md:flex text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="h-fit sticky top-24 bg-gray-50 p-8">
              <h2 className="font-sans text-sm tracking-widest uppercase text-black mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-sans text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-gray-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'Free' : `₹${shipping}`}
                  </span>
                </div>
                {cartTotal < 999 && (
                  <p className="font-sans text-xs text-gray-400">
                    Add ₹{(999 - cartTotal).toLocaleString('en-IN')} more for free shipping
                  </p>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between font-sans text-sm font-medium text-black">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary block w-full text-center">
                Checkout
              </Link>
              <Link
                href="/products"
                className="block text-center font-sans text-xs tracking-widest uppercase text-gray-400 mt-4 hover:text-black transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
