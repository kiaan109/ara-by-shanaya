'use client';
import { useEffect, useState } from 'react';
import { getProducts, getOrders } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts({ limit: 1 }), getOrders({ limit: 5 })])
      .then(([prods, ords]) => {
        const orders  = ords.orders || [];
        const revenue = orders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
        const pending = orders.filter((o: any) => o.orderStatus === 'placed').length;
        setStats({ products: prods.total || 0, orders: ords.total || 0, revenue, pending });
        setRecentOrders(orders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Products',      value: stats.products, suffix: '',  href: '/dashboard/products' },
    { label: 'Total Orders',  value: stats.orders,   suffix: '',  href: '/dashboard/orders'   },
    { label: 'Revenue',       value: stats.revenue,  suffix: '₹', href: '/dashboard/orders'   },
    { label: 'Pending Orders',value: stats.pending,  suffix: '',  href: '/dashboard/orders'   },
  ];

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      placed:     'bg-orange-50 text-orange-600',
      confirmed:  'bg-blue-50 text-blue-600',
      processing: 'bg-purple-50 text-purple-600',
      shipped:    'bg-cyan-50 text-cyan-600',
      delivered:  'bg-green-50 text-green-600',
      cancelled:  'bg-red-50 text-red-500',
    };
    return m[s] || 'bg-gray-50 text-gray-500';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-light tracking-[-0.01em]">Dashboard</h1>
        <p className="text-[12px] text-[#767676] mt-1">Welcome back to ARA Admin</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-white border border-[#e5e5e5] p-5 hover:border-black transition-all group">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-3">{c.label}</p>
            <p className="text-2xl font-light">
              {loading ? '—' : c.suffix === '₹'
                ? `₹${c.value.toLocaleString('en-IN')}`
                : c.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/dashboard/products"
          className="bg-black text-white text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:opacity-75 transition-opacity">
          + New Product
        </Link>
        <Link href="/dashboard/upload"
          className="border border-[#e5e5e5] text-black text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:border-black transition-all">
          Upload Excel
        </Link>
        <Link href="/dashboard/orders"
          className="border border-[#e5e5e5] text-black text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:border-black transition-all">
          View Orders
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-[#e5e5e5]">
        <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
          <h2 className="text-[11px] tracking-[0.2em] uppercase">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-[10px] tracking-[0.15em] uppercase text-[#767676] hover:text-black transition-colors">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-[#f5f5f5] animate-pulse" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center text-[12px] text-[#767676]">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="border-b border-[#e5e5e5]">
                <tr className="text-[10px] tracking-[0.15em] uppercase text-[#767676]">
                  <th className="text-left px-6 py-3">Order ID</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {recentOrders.map(o => (
                  <tr key={o._id} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="px-6 py-4 font-mono text-[11px] text-[#767676]">
                      #{o.orderId?.slice(-8) || o._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4">{o.shippingAddress?.name || '—'}</td>
                    <td className="px-6 py-4">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] tracking-[0.1em] uppercase px-2 py-1 ${statusColor(o.orderStatus)}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
