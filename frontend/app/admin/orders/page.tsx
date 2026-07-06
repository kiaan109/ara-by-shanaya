'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUSES = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'pending_payment'];
const STATUS_COLOR: Record<string, string> = {
  confirmed:        'bg-green-100 text-green-700',
  processing:       'bg-blue-100 text-blue-700',
  shipped:          'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
  pending_payment:  'bg-amber-100 text-amber-700',
};

export default function AdminOrdersPage() {
  const [orders,   setOrders]  = useState<any[]>([]);
  const [loading,  setLoading] = useState(true);
  const [search,   setSearch]  = useState('');
  const [filter,   setFilter]  = useState('all');
  const [saving,   setSaving]  = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [newStatus, setNewStatus] = useState<Record<string, string>>({});

  const loadOrders = () => {
    setLoading(true);
    fetch(`/api/orders?_t=${Date.now()}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
      setOrders(d.orders || []);
      setLoading(false);
    });
  };

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (orderId: string) => {
    const status = newStatus[orderId] || orders.find(o => o.orderId === orderId)?.status;
    setSaving(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, trackingId: tracking[orderId] }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.emailed ? `Order updated — "${status.replace(/_/g, ' ')}" email sent to customer` : 'Order updated');
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch {
      toast.error('Network error — try again');
    }
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status, trackingId: tracking[orderId] || o.trackingId } : o));
    setSaving(null);
  };

  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Items', 'Total', 'Status', 'Tracking'],
      ...orders.map(o => [
        o.orderId,
        new Date(o.createdAt).toLocaleDateString('en-IN'),
        o.name, o.email, o.phone,
        (o.items || []).map((i: any) => `${i.name}(${i.size||''}x${i.quantity})`).join('; '),
        o.total, o.status, o.trackingId || '',
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `ara-orders-${Date.now()}.csv`;
    a.click();
  };

  const visible = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const s = search.toLowerCase();
    const matchesSearch = !s || o.orderId?.toLowerCase().includes(s) || o.name?.toLowerCase().includes(s) || o.email?.toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'pending_payment').reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="p-5 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-light tracking-wide">Orders</h1>
          <p className="text-[11px] text-gray-400 mt-1">{orders.length} total · ₹{totalRevenue.toLocaleString('en-IN')} revenue</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadOrders} disabled={loading}
            className="flex items-center gap-2 border border-gray-300 hover:border-[#C5A059]/50 text-gray-500 hover:text-[#C5A059] px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-all rounded disabled:opacity-40">
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
              className={loading ? 'animate-spin' : ''}>
              <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-300 hover:border-[#C5A059]/50 text-gray-500 hover:text-[#C5A059] px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-all rounded">
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Confirmed', value: orders.filter(o => ['confirmed','processing','shipped','delivered'].includes(o.status)).length, color: 'text-green-600' },
          { label: 'Pending',   value: orders.filter(o => o.status === 'pending_payment').length, color: 'text-amber-600' },
          { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className={`text-[22px] font-light ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID, name or email…"
          className="flex-1 bg-white border border-gray-300 rounded px-4 py-2.5 text-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C5A059]/40" />
        <div className="flex gap-1.5 flex-wrap">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded text-[9px] tracking-[0.12em] uppercase transition-colors ${
                filter === s ? 'bg-[#C5A059] text-black' : 'bg-white border border-gray-300 text-gray-500 hover:border-[#C5A059]/30 hover:text-gray-900'
              }`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-[11px] tracking-[0.2em] uppercase text-gray-300">No orders found</div>
      ) : (
        <div className="space-y-1.5">
          {visible.map(order => {
            const isOpen = expanded === order.orderId;
            const sc = STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-500';
            const curStatus = newStatus[order.orderId] || order.status;
            return (
              <div key={order.orderId} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Row */}
                <div className="px-5 py-3.5 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : order.orderId)}>
                  <span className="font-mono text-[11px] text-gray-500 w-44 flex-shrink-0">{order.orderId}</span>
                  <span className="text-[11px] text-gray-400 w-20 flex-shrink-0">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-[12px] flex-1 min-w-0 truncate">{order.name}</span>
                  <span className="text-[11px] text-gray-400 hidden md:block flex-1 min-w-0 truncate">{order.email}</span>
                  <span className={`text-[9px] tracking-[0.1em] uppercase px-2 py-1 rounded-sm flex-shrink-0 ${sc}`}>
                    {(order.status || '').replace('_', ' ')}
                  </span>
                  <span className="text-[13px] font-medium text-[#C5A059] w-20 text-right flex-shrink-0">
                    ₹{(order.total || 0).toLocaleString('en-IN')}
                  </span>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                    className={`transition-transform flex-shrink-0 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden border-t border-gray-200">
                    <div className="px-5 py-5 grid md:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-3">Items Ordered</p>
                        <div className="space-y-2.5">
                          {(order.items || []).map((item: any, i: number) => (
                            <div key={i} className="flex gap-3">
                              {item.image && <img src={item.image} alt="" className="w-10 h-12 object-contain bg-gray-100 rounded flex-shrink-0" />}
                              <div>
                                <p className="text-[12px]">{item.name}</p>
                                <p className="text-[11px] text-gray-400">{item.size ? `Size ${item.size} · ` : ''}Qty {item.quantity}</p>
                                <p className="text-[12px] text-[#C5A059]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 text-[12px] space-y-0.5 text-gray-500">
                          <p>Total: <span className="text-[#C5A059] font-medium">₹{(order.total || 0).toLocaleString('en-IN')}</span></p>
                          {order.paymentId && <p className="text-[10px] text-gray-400 mt-1">Razorpay: {order.paymentId}</p>}
                        </div>
                      </div>

                      {/* Customer + update */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-2">Customer</p>
                          <p className="text-[12px]">{order.name}</p>
                          <p className="text-[11px] text-gray-500">{order.email}</p>
                          <p className="text-[11px] text-gray-500">{order.phone}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{order.address}, {order.city}, {order.state} – {order.pincode}</p>
                        </div>
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-2">Update Status</p>
                          <div className="space-y-2">
                            <select
                              value={curStatus}
                              onChange={e => setNewStatus(p => ({ ...p, [order.orderId]: e.target.value }))}
                              className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 text-[12px] focus:outline-none focus:border-[#C5A059]/40 rounded"
                            >
                              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                            <input
                              placeholder="Tracking ID (optional)"
                              value={tracking[order.orderId] || order.trackingId || ''}
                              onChange={e => setTracking(t => ({ ...t, [order.orderId]: e.target.value }))}
                              className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 text-[12px] focus:outline-none focus:border-[#C5A059]/40 rounded placeholder:text-gray-400"
                            />
                            <button
                              onClick={() => updateStatus(order.orderId)}
                              disabled={saving === order.orderId}
                              className="w-full bg-[#C5A059] hover:bg-[#d4b06a] text-black text-[10px] tracking-[0.15em] uppercase py-2.5 rounded disabled:opacity-50 transition-colors"
                            >
                              {saving === order.orderId ? 'Saving…' : 'Update Order'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
