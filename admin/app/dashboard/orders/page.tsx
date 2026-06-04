'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders, updateOrderStatus, deleteOrder } from '@/lib/api';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAY_STATUSES   = ['pending', 'paid', 'failed'];

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    placed:     'bg-orange-50 text-orange-600',
    confirmed:  'bg-blue-50 text-blue-600',
    processing: 'bg-purple-50 text-purple-600',
    shipped:    'bg-cyan-50 text-cyan-600',
    delivered:  'bg-green-50 text-green-600',
    cancelled:  'bg-red-50 text-red-500',
    pending:    'bg-yellow-50 text-yellow-600',
    paid:       'bg-green-50 text-green-600',
    failed:     'bg-red-50 text-red-500',
  };
  return map[s] || 'bg-gray-50 text-gray-500';
};

export default function OrdersPage() {
  const [orders,        setOrders]        = useState<any[]>([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('');
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [deletingId,    setDeletingId]    = useState('');

  const load = () => {
    setLoading(true);
    const params: any = { page, limit: 15 };
    if (filter) params.status = filter;
    getOrders(params)
      .then(d => { setOrders(d.orders || []); setTotal(d.total || 0); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, filter]);

  const handleStatusChange = async (id: string, field: string, value: string) => {
    try { await updateOrderStatus(id, { [field]: value }); toast.success('Updated'); load(); }
    catch { toast.error('Update failed'); }
  };

  const handleDelete = async (order: any) => {
    setConfirmDelete(null); setDeletingId(order._id);
    try { await deleteOrder(order._id); toast.success('Order removed'); load(); }
    catch { toast.error('Delete failed'); }
    finally { setDeletingId(''); }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-light tracking-[-0.01em]">Orders</h1>
          <p className="text-[12px] text-[#767676] mt-1">{total} total orders</p>
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="border border-[#e5e5e5] text-[12px] px-4 py-2 bg-white focus:outline-none focus:border-black transition-colors">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e5e5]">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-[#f5f5f5] animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-[12px] text-[#767676]">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="border-b border-[#e5e5e5] bg-[#f9f9f9]">
                <tr className="text-[10px] tracking-[0.15em] uppercase text-[#767676]">
                  <th className="text-left px-5 py-3">Order ID</th>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-5 py-3">Items</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Payment</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {orders.map(o => {
                  const isDeleting = deletingId === o._id;
                  return (
                    <motion.tr key={o._id} animate={{ opacity: isDeleting ? 0.4 : 1 }}
                      className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-5 py-4 font-mono text-[11px] text-[#767676]">
                        #{o.orderId?.slice(-8) || o._id.slice(-8)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-black">{o.shippingAddress?.name || '—'}</p>
                        <p className="text-[11px] text-[#767676]">{o.phone || o.email || ''}</p>
                      </td>
                      <td className="px-5 py-4 text-[#767676]">
                        {o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-4 font-medium">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <select value={o.paymentStatus}
                          onChange={e => handleStatusChange(o._id, 'paymentStatus', e.target.value)}
                          className={`text-[10px] tracking-[0.1em] uppercase px-2 py-1 border-0 cursor-pointer focus:outline-none font-medium ${statusColor(o.paymentStatus)}`}>
                          {PAY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <select value={o.orderStatus}
                          onChange={e => handleStatusChange(o._id, 'orderStatus', e.target.value)}
                          className={`text-[10px] tracking-[0.1em] uppercase px-2 py-1 border-0 cursor-pointer focus:outline-none font-medium ${statusColor(o.orderStatus)}`}>
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-[#767676] whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => setConfirmDelete(o)} disabled={isDeleting}
                          className="text-[#ccc] hover:text-red-500 transition-colors disabled:opacity-30">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-1 mt-6 justify-end">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 text-[11px] transition-all ${page === p ? 'bg-black text-white' : 'text-[#767676] border border-[#e5e5e5] hover:border-black'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.97 }} animate={{ scale: 1 }} exit={{ scale: 0.97 }}
              className="bg-white p-8 max-w-sm w-full text-center">
              <h3 className="text-[15px] font-light mb-2">Delete Order?</h3>
              <p className="text-[12px] text-[#767676] mb-6">
                Order <strong className="text-black">#{confirmDelete.orderId?.slice(-8) || confirmDelete._id.slice(-8)}</strong> will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 text-[11px] tracking-[0.1em] uppercase border border-[#e5e5e5] hover:border-black transition-all">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3 text-[11px] tracking-[0.1em] uppercase bg-red-500 text-white hover:bg-red-600 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
