'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const STATUS_COLOR: Record<string, string> = {
  confirmed:       'bg-green-100 text-green-700',
  processing:      'bg-blue-100 text-blue-700',
  shipped:         'bg-purple-100 text-purple-700',
  delivered:       'bg-green-100 text-green-700',
  cancelled:       'bg-red-100 text-red-700',
  pending_payment: 'bg-amber-100 text-amber-700',
};

export default function AdminDashboard() {
  const [orders,   setOrders]   = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/products?limit=100').then(r => r.json()),
    ]).then(([o, p]) => {
      setOrders(o.orders || []);
      setProducts(p.products || []);
      setLoading(false);
    });
  }, []);

  const revenue    = orders.filter(o => o.status !== 'cancelled' && o.status !== 'pending_payment').reduce((s, o) => s + (o.total || 0), 0);
  const pending    = orders.filter(o => o.status === 'pending_payment').length;
  const confirmed  = orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
  const recent     = orders.slice(0, 8);

  const stats = [
    { label: 'Total Orders',    value: loading ? '—' : orders.length,            sub: 'All time',            color: 'text-gray-900' },
    { label: 'Revenue',         value: loading ? '—' : `₹${revenue.toLocaleString('en-IN')}`, sub: 'Confirmed orders', color: 'text-[#C5A059]' },
    { label: 'Pending Payment', value: loading ? '—' : pending,                  sub: 'Awaiting Razorpay',   color: 'text-amber-600' },
    { label: 'Products',        value: loading ? '—' : products.length,          sub: 'In catalogue',        color: 'text-blue-600' },
  ];

  return (
    <div className="p-5 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-light tracking-wide">Dashboard</h1>
        <p className="text-[11px] text-gray-400 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-2">{s.label}</p>
            <p className={`text-[26px] font-light ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-300 mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Orders', href: '/admin/orders',    icon: '📦', desc: 'View & update all orders' },
          { label: 'Edit Products', href: '/admin/edit',    icon: '✏️', desc: 'Update catalogue & images' },
          { label: 'Branding',      href: '/admin/branding', icon: '🖼️', desc: 'Upload logo & brand assets' },
          { label: 'View Store',    href: '/',               icon: '🛍️', desc: 'See live storefront', ext: true },
        ].map(a => (
          <Link key={a.label} href={a.href} target={a.ext ? '_blank' : undefined}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#C5A059]/40 hover:bg-gray-50 transition-all group">
            <div className="text-2xl mb-2">{a.icon}</div>
            <p className="text-[12px] font-medium group-hover:text-[#C5A059] transition-colors">{a.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[12px] tracking-[0.15em] uppercase text-gray-600">Recent Orders</h2>
          <Link href="/admin/orders" className="text-[10px] tracking-[0.15em] uppercase text-[#C5A059] hover:text-[#d4b06a] transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          </div>
        ) : recent.length === 0 ? (
          <div className="py-10 text-center text-[11px] text-gray-300 tracking-[0.2em] uppercase">No orders yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map(order => {
              const sc = STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-500';
              return (
                <div key={order.orderId} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{order.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{order.orderId}</p>
                  </div>
                  <div className="hidden md:block text-[11px] text-gray-400 w-28 flex-shrink-0">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <span className={`text-[9px] tracking-[0.1em] uppercase px-2 py-1 rounded-sm flex-shrink-0 ${sc}`}>
                    {(order.status || '').replace('_', ' ')}
                  </span>
                  <p className="text-[12px] font-medium text-[#C5A059] w-20 text-right flex-shrink-0">
                    ₹{(order.total || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Env check panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-[12px] tracking-[0.15em] uppercase text-gray-600 mb-4">Setup Checklist</h2>
        <div className="grid md:grid-cols-2 gap-2 text-[11px]">
          {[
            { label: 'Razorpay Key ID',     key: 'Set RAZORPAY_KEY_ID in Vercel env vars',     done: false },
            { label: 'Razorpay Key Secret', key: 'Set RAZORPAY_KEY_SECRET in Vercel env vars',  done: false },
            { label: 'Resend Email API',    key: 'Set RESEND_API_KEY in Vercel env vars',        done: false },
            { label: 'Google Sheets',       key: 'Set GOOGLE_SCRIPT_URL (optional)',             done: false },
          ].map(({ label, key }) => (
            <div key={label} className="flex items-start gap-2.5 bg-gray-50 rounded px-3 py-2.5">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
              <div>
                <p className="text-gray-700">{label}</p>
                <p className="text-gray-400 text-[10px] mt-0.5">{key}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-3">
          Go to Vercel → Your Project → Settings → Environment Variables to add these keys.
          Redeploy after adding to apply changes.
        </p>
      </div>
    </div>
  );
}
