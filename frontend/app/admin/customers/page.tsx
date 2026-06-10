'use client';
import { useState, useEffect } from 'react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    fetch('/api/admin/customers').then(r => r.json()).then(d => {
      setCustomers(d.customers || []);
      setLoading(false);
    });
  }, []);

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Subscribed', 'Has Ordered', 'Joined'],
      ...customers.map(c => [
        c.name, c.email, c.phone,
        c.subscribed ? 'Yes' : 'No',
        c.hasOrdered ? 'Yes' : 'No',
        new Date(c.createdAt).toLocaleDateString('en-IN'),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `ara-customers-${Date.now()}.csv`;
    a.click();
  };

  const visible = customers.filter(c => {
    const s = search.toLowerCase();
    return !s || c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s) || c.phone?.toLowerCase().includes(s);
  });

  return (
    <div className="p-5 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-light tracking-wide">Customers</h1>
          <p className="text-[11px] text-gray-400 mt-1">{customers.length} total</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 border border-gray-300 hover:border-[#C5A059]/50 text-gray-500 hover:text-[#C5A059] px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-all rounded">
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: customers.length, color: 'text-gray-900' },
          { label: 'Subscribed', value: customers.filter(c => c.subscribed).length, color: 'text-[#C5A059]' },
          { label: 'Customers', value: customers.filter(c => c.hasOrdered).length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className={`text-[22px] font-light ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, email or phone…"
        className="w-full bg-white border border-gray-300 rounded px-4 py-2.5 text-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C5A059]/40" />

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-[11px] tracking-[0.2em] uppercase text-gray-300">No customers found</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-4 border-b border-gray-200 text-[9px] tracking-[0.15em] uppercase text-gray-400">
            <span className="flex-1 min-w-0">Name</span>
            <span className="flex-1 min-w-0 hidden md:block">Email</span>
            <span className="w-32 flex-shrink-0">Phone</span>
            <span className="w-24 flex-shrink-0 text-right">Status</span>
          </div>
          {visible.map((c, i) => (
            <div key={c.email + i} className="px-5 py-3.5 flex flex-wrap items-center gap-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
              <span className="text-[12px] flex-1 min-w-0 truncate">{c.name || '—'}</span>
              <span className="text-[11px] text-gray-400 flex-1 min-w-0 truncate">{c.email}</span>
              <span className="text-[11px] text-gray-500 w-32 flex-shrink-0">{c.phone || '—'}</span>
              <span className="w-24 flex-shrink-0 flex justify-end gap-1.5">
                {c.subscribed && (
                  <span className="text-[9px] tracking-[0.1em] uppercase px-2 py-1 rounded-sm bg-[#C5A059]/15 text-[#C5A059]">Sub</span>
                )}
                {c.hasOrdered && (
                  <span className="text-[9px] tracking-[0.1em] uppercase px-2 py-1 rounded-sm bg-green-100 text-green-700">Order</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
