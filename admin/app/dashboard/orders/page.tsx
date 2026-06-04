'use client';
import { useEffect, useState } from 'react';

const FRONTEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://frontend-iota-three-66.vercel.app';
const WA       = 'https://wa.me/918980008826';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-cyan-50 text-cyan-700 border-cyan-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-600 border-red-200',
};

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

interface Order {
  id: string; created_at: string;
  product_id: string; product_name: string;
  product_price: number; product_image: string;
  size: string; color: string;
  customer_name: string; customer_phone: string;
  status: string;
}

export default function OrdersPage() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch(`${FRONTEND}/api/orders`)
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`${FRONTEND}/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdating(null);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    await fetch(`${FRONTEND}/api/orders/${id}`, { method: 'DELETE' });
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string,number>);

  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.product_price || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-light">Orders</h1>
          <p className="text-[12px] text-[#767676] mt-1">
            {orders.length} total orders · ₹{revenue.toLocaleString('en-IN')} revenue
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchOrders}
            className="border border-[#e5e5e5] text-[11px] tracking-[0.15em] uppercase px-4 py-2.5 hover:border-black transition-all">
            ↻ Refresh
          </button>
          <a href={WA} target="_blank" rel="noopener noreferrer"
            className="bg-[#25D366] text-white text-[11px] tracking-[0.15em] uppercase px-4 py-2.5 hover:opacity-90 transition-opacity flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-all ${
            filter === 'all' ? 'bg-black text-white' : 'bg-white border border-[#e5e5e5] text-[#767676] hover:border-black'
          }`}>
          All ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-all ${
              filter === s ? 'bg-black text-white' : 'bg-white border border-[#e5e5e5] text-[#767676] hover:border-black'
            }`}>
            {s} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-[#f5f5f5] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e5e5e5] p-16 text-center">
          <p className="text-[13px] text-[#767676]">
            {orders.length === 0
              ? 'No orders yet. Orders appear here automatically when customers tap "Order via WhatsApp" on the store.'
              : `No ${filter} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-white border border-[#e5e5e5] p-5 flex flex-col md:flex-row gap-4">
              {/* Product image */}
              {order.product_image && (
                <div className="w-16 h-20 flex-shrink-0 bg-[#f9f9f9] overflow-hidden">
                  <img src={order.product_image.startsWith('http') ? order.product_image : `${FRONTEND}${order.product_image}`}
                    alt={order.product_name}
                    className="w-full h-full object-contain" style={{ display: 'block' }} />
                </div>
              )}

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium">{order.product_name}</p>
                    <p className="text-[11px] text-[#767676] mt-0.5">
                      {order.size && `Size: ${order.size}`}
                      {order.size && order.color && ' · '}
                      {order.color && `Colour: ${order.color}`}
                    </p>
                    <p className="text-[12px] mt-1 font-light">₹{(order.product_price || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block text-[9px] tracking-[0.12em] uppercase px-2 py-1 border ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {order.status}
                    </span>
                    <p className="text-[10px] text-[#aaa] mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Customer */}
                {(order.customer_name && order.customer_name !== 'Unknown') && (
                  <p className="text-[11px] text-[#767676] mt-2">
                    Customer: <span className="text-black">{order.customer_name}</span>
                    {order.customer_phone && ` · ${order.customer_phone}`}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    disabled={updating === order.id}
                    className="text-[10px] tracking-[0.1em] uppercase border border-[#e5e5e5] px-2 py-1.5 focus:outline-none focus:border-black bg-white cursor-pointer">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <a href={`${WA}?text=${encodeURIComponent(`Hi! Following up on your "${order.product_name}" order. `)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 bg-[#25D366] text-white hover:opacity-90 transition-opacity">
                    WhatsApp Customer
                  </a>

                  <button onClick={() => deleteOrder(order.id)}
                    className="text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 border border-[#e5e5e5] text-red-500 hover:border-red-300 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
