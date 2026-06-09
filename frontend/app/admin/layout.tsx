'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/admin/edit',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    label: 'Branding',
    href: '/admin/branding',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
    ),
  },
  {
    label: 'View Store',
    href: '/',
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    external: true,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(s => setLogoUrl(s.logoUrl || null))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex bg-[#0f0f0f] text-white">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-[#141414] border-r border-white/[0.06] flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/[0.06]">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="ARA by SHANAYA"
              className="h-[22px] w-auto max-w-[140px] object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          ) : (
            <p className="font-display text-[13px] tracking-[0.3em] uppercase font-light">
              ARA <span className="text-[#C5A059]">by</span> SHANAYA
            </p>
          )}
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mt-0.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ label, href, icon, external }) => {
            const active = external ? false : (href === '/admin' ? path === '/admin' : path.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[12px] tracking-[0.08em] transition-all ${
                  active
                    ? 'bg-[#C5A059]/15 text-[#C5A059]'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className={active ? 'text-[#C5A059]' : 'text-white/40'}>{icon}</span>
                {label}
                {external && (
                  <svg className="ml-auto w-3 h-3 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06]">
          <p className="text-[9px] text-white/20 tracking-[0.1em]">ARA Admin v1.0</p>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 bg-[#141414] border-b border-white/[0.06] flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <button onClick={() => setOpen(v => !v)} className="lg:hidden p-1.5 text-white/50 hover:text-white">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <span>Admin</span>
            <span>/</span>
            <span className="text-white/60">
              {path === '/admin' ? 'Dashboard' : path.replace('/admin/', '').replace('/', ' / ')}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
