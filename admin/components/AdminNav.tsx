'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/dashboard',          icon: '◈', label: 'Dashboard' },
  { href: '/dashboard/products', icon: '◇', label: 'Products' },
  { href: '/dashboard/upload',   icon: '↑', label: 'Upload' },
  { href: '/dashboard/orders',   icon: '◉', label: 'Orders' },
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
    <aside className="w-64 min-h-screen bg-luxury-dark border-r border-gold-500/10 flex flex-col">
      <div className="px-6 py-6 border-b border-gold-500/10">
        <p className="text-xl font-light tracking-[0.2em] text-white">ARA</p>
        <p className="text-gold-500/50 text-[10px] tracking-[0.4em] uppercase mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-all ${
              pathname === l.href
                ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span className="text-xs">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gold-500/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm text-gray-600 hover:text-red-400 transition-colors"
        >
          <span className="text-xs">⊗</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
