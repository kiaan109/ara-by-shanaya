'use client';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [user,         setUser]         = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('ara_admin_user');
    if (u) setUser(JSON.parse(u));

    getProducts({ limit: 100 })
      .then(d => setProductCount(d.total || (d.products?.length ?? 0)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Products',     value: loading ? '—' : productCount, href: '/dashboard/products', icon: '🛍️' },
    { label: 'Collections',  value: 7,   href: '/dashboard/products', icon: '🎨' },
    { label: 'Sizes',        value: 'XS–XL', href: '/dashboard/products', icon: '📐' },
    { label: 'Store Status', value: 'Live', href: '/', icon: '✅' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-light tracking-[-0.01em]">Dashboard</h1>
        <p className="text-[12px] text-[#767676] mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ''} — ARA by Shanaya SS '26
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(c => (
          <Link key={c.label} href={c.href}
            className="bg-white border border-[#e5e5e5] p-5 hover:border-black transition-all group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#767676]">{c.label}</p>
              <span className="text-lg">{c.icon}</span>
            </div>
            <p className="text-2xl font-light">{c.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/dashboard/products"
          className="bg-black text-white text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:opacity-75 transition-opacity">
          View Products
        </Link>
        <a href="https://frontend-iota-three-66.vercel.app" target="_blank" rel="noopener noreferrer"
          className="border border-[#e5e5e5] text-black text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:border-black transition-all">
          View Live Store ↗
        </a>
      </div>

      {/* Collections overview */}
      <div className="bg-white border border-[#e5e5e5]">
        <div className="px-6 py-4 border-b border-[#e5e5e5]">
          <h2 className="text-[11px] tracking-[0.2em] uppercase">SS '26 Collections</h2>
        </div>
        <div className="divide-y divide-[#f5f5f5]">
          {[
            { name: 'Dark Cloud',   items: 6,  price: '₹6,500 – ₹15,500' },
            { name: 'Horizon',      items: 8,  price: '₹7,000 – ₹15,500' },
            { name: 'Ocean',        items: 5,  price: '₹6,500 – ₹15,500' },
            { name: 'Beach',        items: 4,  price: '₹6,500 – ₹8,500'  },
            { name: 'Waves',        items: 4,  price: '₹6,000 – ₹10,000' },
            { name: 'Pink Skies',   items: 4,  price: '₹6,500 – ₹10,500' },
            { name: 'Orange Vista', items: 5,  price: '₹7,000 – ₹15,500' },
          ].map(c => (
            <div key={c.name} className="px-6 py-4 flex items-center justify-between hover:bg-[#f9f9f9] transition-colors">
              <div>
                <p className="text-[13px]">{c.name}</p>
                <p className="text-[11px] text-[#767676] mt-0.5">{c.price}</p>
              </div>
              <span className="text-[11px] text-[#767676] bg-[#f5f5f5] px-3 py-1">{c.items} pieces</span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders note */}
      <div className="mt-6 bg-amber-50 border border-amber-200 px-6 py-4 text-[12px] text-amber-800">
        <strong>Orders:</strong> Order management requires the backend server. Customers can place orders via WhatsApp at +91 89800 08826.
      </div>
    </div>
  );
}
