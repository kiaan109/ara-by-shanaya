'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/dashboard',          label: 'Dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  )},
  { href: '/dashboard/products', label: 'Products', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  )},
  { href: '/dashboard/upload',   label: 'Upload', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  )},
  { href: '/dashboard/orders',   label: 'Orders', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  )},
];

export default function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = () => {
    localStorage.removeItem('ara_admin_token');
    localStorage.removeItem('ara_admin_user');
    router.replace('/');
  };

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-[#e5e5e5] flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#e5e5e5]">
        <p className="text-lg tracking-[0.2em] font-light">ARA</p>
        <p className="text-[9px] tracking-[0.25em] uppercase text-[#767676] mt-1">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {LINKS.map(l => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-[12px] transition-all ${
                active ? 'bg-black text-white' : 'text-[#444] hover:bg-[#f5f5f5] hover:text-black'
              }`}>
              <span className={active ? 'text-white' : 'text-[#767676]'}>{l.icon}</span>
              <span className="tracking-[0.05em]">{l.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-[#e5e5e5]">
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[12px] text-[#767676] hover:text-red-500 hover:bg-red-50 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
