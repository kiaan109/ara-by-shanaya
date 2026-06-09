'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const STATUS_COLOR: Record<string, string> = {
  confirmed:       'bg-green-500/15 text-green-400',
  processing:      'bg-blue-500/15 text-blue-400',
  shipped:         'bg-purple-500/15 text-purple-400',
  delivered:       'bg-green-600/15 text-green-500',
  cancelled:       'bg-red-500/15 text-red-400',
  pending_payment: 'bg-amber-500/15 text-amber-400',
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
    { label: 'Total Orders',    value: loading ? '—' : orders.length,            sub: 'All time',            color: 'text-white' },
    { label: 'Revenue',         value: loading ? '—' : `₹${revenue.toLocaleString('en-IN')}`, sub: 'Confirmed orders', color: 'text-[#C5A059]' },
    { label: 'Pending Payment', value: loading ? '—' : pending,                  sub: 'Awaiting Razorpay',   color: 'text-amber-400' },
    { label: 'Products',        value: loading ? '—' : products.length,          sub: 'In catalogue',        color: 'text-blue-400' },
  ];

  return (
    <div className="p-5 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-light tracking-wide">Dashboard</h1>
        <p className="text-[11px] text-white/30 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">{s.label}</p>
            <p className={`text-[26px] font-light ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-white/20 mt-1">{s.sub}</p>
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
            className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-4 hover:border-[#C5A059]/40 hover:bg-[#1e1e1e] transition-all group">
            <div className="text-2xl mb-2">{a.icon}</div>
            <p className="text-[12px] font-medium group-hover:text-[#C5A059] transition-colors">{a.label}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-[12px] tracking-[0.15em] uppercase text-white/60">Recent Orders</h2>
          <Link href="/admin/orders" className="text-[10px] tracking-[0.15em] uppercase text-[#C5A059] hover:text-[#d4b06a] transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : recent.length === 0 ? (
          <div className="py-10 text-center text-[11px] text-white/20 tracking-[0.2em] uppercase">No orders yet</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {recent.map(order => {
              const sc = STATUS_COLOR[order.status] || 'bg-white/10 text-white/40';
              return (
                <div key={order.orderId} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{order.name}</p>
                    <p className="text-[10px] text-white/30 mt-0.5 font-mono">{order.orderId}</p>
                  </div>
                  <div className="hidden md:block text-[11px] text-white/30 w-28 flex-shrink-0">
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
      <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-5">
        <h2 className="text-[12px] tracking-[0.15em] uppercase text-white/60 mb-4">Setup Checklist</h2>
        <div className="grid md:grid-cols-2 gap-2 text-[11px]">
          {[
            { label: 'Razorpay Key ID',     key: 'Set RAZORPAY_KEY_ID in Vercel env vars',     done: false },
            { label: 'Razorpay Key Secret', key: 'Set RAZORPAY_KEY_SECRET in Vercel env vars',  done: false },
            { label: 'Resend Email API',    key: 'Set RESEND_API_KEY in Vercel env vars',        done: false },
            { label: 'Google Sheets',       key: 'Set GOOGLE_SCRIPT_URL (optional)',             done: false },
          ].map(({ label, key }) => (
            <div key={label} className="flex items-start gap-2.5 bg-[#141414] rounded px-3 py-2.5">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">⚠</span>
              <div>
                <p className="text-white/60">{label}</p>
                <p className="text-white/20 text-[10px] mt-0.5">{key}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/20 mt-3">
          Go to Vercel → Your Project → Settings → Environment Variables to add these keys.
          Redeploy after adding to apply changes.
        </p>
      </div>
    </div>
  );
}
