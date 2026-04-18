'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProducts, getOrders } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0, orders: 0, revenue: 0, pending: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 1 }),
      getOrders({ limit: 5 }),
    ]).then(([prods, ords]) => {
      const orders  = ords.orders || [];
      const revenue = orders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
      const pending = orders.filter((o: any) => o.orderStatus === 'placed').length;
      setStats({
        products: prods.total || 0,
        orders:   ords.total  || 0,
        revenue,
        pending,
      });
      setRecentOrders(orders);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: '◇', color: 'text-blue-400' },
    { label: 'Total Orders',   value: stats.orders,   icon: '◉', color: 'text-green-400' },
    { label: 'Revenue',        value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: '₹', color: 'text-gold-400' },
    { label: 'Pending Orders', value: stats.pending,  icon: '◈', color: 'text-orange-400' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-light text-white mb-1">Dashboard</h1>
        <p className="text-gray-600 text-sm mb-8">Welcome back to ARA Admin</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-luxury-card border border-gold-500/10 rounded-lg p-5"
          >
            <div className={`text-2xl mb-2 ${c.color}`}>{c.icon}</div>
            <p className="text-2xl font-semibold text-white">{loading ? '—' : c.value}</p>
            <p className="text-gray-600 text-xs mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-luxury-card border border-gold-500/10 rounded-lg p-6">
        <h2 className="text-white text-lg mb-4">Recent Orders</h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-luxury-dark rounded animate-pulse" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-gray-600 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-600 text-xs uppercase tracking-wide border-b border-gold-500/10">
                  <th className="text-left pb-3">Order ID</th>
                  <th className="text-left pb-3">Customer</th>
                  <th className="text-left pb-3">Amount</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/5">
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="py-3 text-gold-400 font-mono text-xs">{o.orderId}</td>
                    <td className="py-3 text-gray-300">{o.shippingAddress?.name}</td>
                    <td className="py-3 text-white">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-sm ${
                        o.orderStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        o.orderStatus === 'shipped'   ? 'bg-blue-500/20 text-blue-400' :
                        o.orderStatus === 'placed'    ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
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
