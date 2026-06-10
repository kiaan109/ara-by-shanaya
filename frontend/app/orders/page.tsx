'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  confirmed:       { label: 'Confirmed',       color: 'text-green-600 bg-green-50' },
  processing:      { label: 'Processing',      color: 'text-blue-600 bg-blue-50' },
  shipped:         { label: 'Shipped',          color: 'text-purple-600 bg-purple-50' },
  delivered:       { label: 'Delivered',        color: 'text-green-700 bg-green-100' },
  cancelled:       { label: 'Cancelled',        color: 'text-red-600 bg-red-50' },
  pending_payment: { label: 'Pending Payment', color: 'text-amber-600 bg-amber-50' },
};

export default function OrdersPage() {
  const [email,    setEmail]   = useState('');
  const [orders,   setOrders]  = useState<any[]>([]);
  const [loading,  setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/orders/user?email=${encodeURIComponent(email.trim())}`);
      const d = await r.json();
      setOrders(d.orders || []);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-[#ebebeb] px-5 py-10 text-center">
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-[#C5A059] mb-2">Your Account</p>
        <h1 className="font-display text-[32px] font-light tracking-wide">Order History</h1>
      </div>

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-10">
        {/* Lookup form */}
        <form onSubmit={lookup} className="flex gap-3 mb-10">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email address to view orders"
            className="flex-1 border-b border-[#e0e0e0] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc]"
            required
          />
          <button type="submit" disabled={loading}
            className="gold-btn text-white font-sans text-[10px] tracking-[0.2em] uppercase px-6 py-3 disabled:opacity-50 whitespace-nowrap">
            {loading ? '...' : 'Look Up'}
          </button>
        </form>

        {searched && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#999]">No orders found for this email</p>
            <Link href="/shop" className="mt-6 inline-block text-[11px] tracking-[0.2em] uppercase underline underline-offset-4 text-[#C5A059]">
              Start shopping →
            </Link>
          </div>
        )}

        {/* Orders list */}
        <div className="space-y-3">
          {orders.map(order => {
            const st = STATUS_LABEL[order.status] || { label: order.status, color: 'text-gray-600 bg-gray-50' };
            const isOpen = expanded === order.orderId;
            return (
              <div key={order.orderId} className="bg-white border border-[#ebebeb]">
                {/* Summary row */}
                <button onClick={() => setExpanded(isOpen ? null : order.orderId)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#fafafa] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                    <span className="font-mono text-[12px] tracking-wider">{order.orderId}</span>
                    <span className="text-[11px] text-[#999]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className={`inline-block text-[9px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-sm font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-medium">₹{(order.total || 0).toLocaleString('en-IN')}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      transition={{ duration: 0.2 }} className="overflow-hidden border-t border-[#f0f0f0]">
                      <div className="px-5 py-5 space-y-4">
                        {/* Items */}
                        <div className="space-y-3">
                          {(order.items || []).map((item: any, i: number) => (
                            <div key={i} className="flex gap-3">
                              {item.image && (
                                <div className="w-12 bg-[#f5f5f5] flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                              )}
                              <div>
                                <p className="text-[12px] font-medium">{item.name}</p>
                                {item.size && <p className="text-[11px] text-[#999]">Size: {item.size} · Qty: {item.quantity}</p>}
                                <p className="text-[12px]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#f0f0f0] text-[12px]">
                          <div>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-[#999] mb-1">Shipped to</p>
                            <p>{order.name}</p>
                            <p className="text-[#767676]">{order.address}, {order.city}, {order.state} – {order.pincode}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#767676]">Subtotal: ₹{(order.subtotal || 0).toLocaleString('en-IN')}</p>
                            <p className="text-[#767676]">Shipping: {order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</p>
                            <p className="font-semibold mt-1">Total: ₹{(order.total || 0).toLocaleString('en-IN')}</p>
                            {order.trackingId && (
                              <p className="text-[#C5A059] mt-1">Tracking: {order.trackingId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
