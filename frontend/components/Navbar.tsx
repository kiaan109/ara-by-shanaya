'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

const LOGO_CACHE_KEY = 'ara_logo_url';
const LOGO_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function useSiteLogo() {
  // Seed from localStorage immediately (no flash)
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(LOGO_CACHE_KEY);
      if (!raw) return null;
      const { url, ts } = JSON.parse(raw);
      if (Date.now() - ts < LOGO_CACHE_TTL) return url;
      return null;
    } catch { return null; }
  });

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(s => {
        const url = s.logoUrl || null;
        setLogoUrl(url);
        try {
          if (url) {
            localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify({ url, ts: Date.now() }));
          } else {
            localStorage.removeItem(LOGO_CACHE_KEY);
          }
        } catch {}
      })
      .catch(() => {});
  }, []);

  return logoUrl;
}

const COLLECTIONS = [
  { name: 'Dark Cloud',   color: '#6b21a8' },
  { name: 'Horizon',      color: '#c2410c' },
  { name: 'Ocean',        color: '#0e7490' },
  { name: 'Beach',        color: '#a16207' },
  { name: 'Waves',        color: '#0369a1' },
  { name: 'Pink Skies',   color: '#be185d' },
  { name: 'Orange Vista', color: '#c2410c' },
];

export default function Navbar() {
  const [scrolled,        setScrolled]        = useState(false);
  const [menuOpen,        setMenuOpen]         = useState(false);
  const [searchOpen,      setSearchOpen]       = useState(false);
  const [collectionsOpen, setCollectionsOpen]  = useState(false);
  const [query,           setQuery]            = useState('');
  const collectionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const logoUrl = useSiteLogo();

  const cartCount     = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0));
  const wishlistCount = useWishlistStore(s => s.items.length);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false); setQuery('');
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 glass-nav border-b transition-all duration-500 ${
        scrolled ? 'border-black/10 shadow-sm' : 'border-white/10'
      }`}>
        {/* Single row: flex — left (flex-none) | brand (flex-1 centered) | right (flex-none) */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-14 h-[60px] md:h-[64px] flex items-center">

          {/* ── Left: hamburger (mobile) + nav links (desktop) ── */}
          <div className="flex-none flex items-center gap-6">
            {/* Mobile hamburger */}
            <button className="lg:hidden hover:opacity-60 transition-opacity"
              onClick={() => setMenuOpen(true)}>
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-7">
              <Link href="/shop"
                className="nav-link text-[11px] tracking-[0.18em] uppercase text-[#444] hover:text-black transition-colors whitespace-nowrap">
                Shop
              </Link>

              {/* Collections dropdown */}
              <div
                ref={collectionsRef}
                className="relative"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <button className="nav-link text-[11px] tracking-[0.18em] uppercase text-[#444] hover:text-black transition-colors whitespace-nowrap flex items-center gap-1">
                  Collections
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"
                    style={{ transform: collectionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M0 2l4 4 4-4H0z"/>
                  </svg>
                </button>
                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
                    >
                      <div className="bg-white border border-[#f0f0f0] shadow-lg min-w-[180px] py-2">
                        {COLLECTIONS.map(({ name, color }) => (
                          <Link
                            key={name}
                            href={`/shop?collection=${encodeURIComponent(name)}`}
                            onClick={() => setCollectionsOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-[10px] tracking-[0.15em] uppercase text-[#444] hover:text-black hover:bg-[#f9f9f9] transition-colors whitespace-nowrap"
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            {name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/shop?category=Dress"
                className="nav-link text-[11px] tracking-[0.18em] uppercase text-[#444] hover:text-black transition-colors whitespace-nowrap">
                Dresses
              </Link>
              <Link href="/shop?category=Top"
                className="nav-link text-[11px] tracking-[0.18em] uppercase text-[#444] hover:text-black transition-colors whitespace-nowrap">
                Tops
              </Link>
            </div>
          </div>

          {/* ── Center: Logo or text brand — flex-1 min-w-0 so it never crowds the icons ── */}
          <div className="flex-1 min-w-0 flex justify-center">
            <Link href="/" className="hover:opacity-70 transition-opacity duration-200 select-none flex items-center">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoUrl}
                  alt="ARA by SHANAYA"
                  className="h-[28px] md:h-[32px] w-auto max-w-[160px] object-contain"
                  style={{ display: 'block' }}
                />
              ) : (
                <span className="font-display text-[10px] sm:text-[15px] lg:text-[18px] tracking-[0.25em] sm:tracking-[0.18em] lg:tracking-[0.22em] uppercase font-light text-[#1a1c1c] whitespace-nowrap">
                  ARA&nbsp;<span className="text-[#C5A059]">by</span>&nbsp;SHANAYA
                </span>
              )}
            </Link>
          </div>

          {/* ── Right: nav links (desktop) + icons — flex-none so icons never move ── */}
          <div className="flex-none flex items-center justify-end gap-2.5 sm:gap-4 lg:gap-5">
            {/* Desktop right links */}
            <div className="hidden lg:flex items-center gap-7 mr-3">
              {[
                { href: '/shop?category=Skirt', label: 'Skirts' },
                { href: '/shop?category=Pants', label: 'Pants' },
                { href: '/try-on',              label: 'AI Try-On' },
              ].map(({ href, label }) => (
                <Link key={label} href={href}
                  className="nav-link text-[11px] tracking-[0.18em] uppercase text-[#444] hover:text-black transition-colors whitespace-nowrap">
                  {label}
                </Link>
              ))}
            </div>

            {/* Search */}
            <button onClick={() => setSearchOpen(v => !v)} className="hover:opacity-60 transition-opacity">
              <span className="material-symbols-outlined text-[19px] sm:text-[21px]">search</span>
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative hover:opacity-60 transition-opacity">
              <span className="material-symbols-outlined text-[19px] sm:text-[21px]">favorite</span>
              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span key="wb" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-[15px] h-[15px] bg-[#C5A059] text-white text-[8px] flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative hover:opacity-60 transition-opacity">
              <span className="material-symbols-outlined text-[19px] sm:text-[21px]">shopping_bag</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span key="cb" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-[15px] h-[15px] bg-black text-white text-[8px] flex items-center justify-center rounded-full">
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Account (desktop only) */}
            <Link href="/account" className="hidden md:block hover:opacity-60 transition-opacity">
              <span className="material-symbols-outlined text-[21px]">person</span>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form onSubmit={handleSearch}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="border-t border-black/5 bg-white/90 backdrop-blur-md">
              <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-4 flex items-center gap-4">
                <span className="material-symbols-outlined text-[18px] text-[#aaa]">search</span>
                <input autoFocus type="text" placeholder="Search styles..."
                  value={query} onChange={e => setQuery(e.target.value)}
                  className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-[#aaa]" />
                <button type="button" onClick={() => setSearchOpen(false)}
                  className="text-[10px] tracking-[0.22em] uppercase text-[#767676] hover:text-black">
                  Close
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div className="fixed inset-0 z-[99] bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)} />
            <motion.div className="fixed top-0 left-0 bottom-0 z-[100] bg-[#f9f9f9] w-[82vw] max-w-sm flex flex-col"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>

              <div className="flex items-center justify-between px-6 h-[64px] border-b border-black/5">
                <span className="font-display text-[15px] tracking-[0.2em] uppercase font-light">
                  ARA&nbsp;<span className="text-[#C5A059]">by</span>&nbsp;SHANAYA
                </span>
                <button onClick={() => setMenuOpen(false)}>
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </div>

              <nav className="flex-1 px-6 py-6 flex flex-col overflow-y-auto">
                {/* Shop by type */}
                {[
                  { href: '/shop',                label: 'Shop All' },
                  { href: '/shop?category=Dress', label: 'Dresses' },
                  { href: '/shop?category=Top',   label: 'Tops' },
                  { href: '/shop?category=Skirt', label: 'Skirts' },
                  { href: '/shop?category=Pants', label: 'Pants' },
                ].map(({ href, label }, i) => (
                  <motion.div key={href}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05 }}>
                    <Link href={href} onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-4 border-b border-black/5
                        font-display text-[20px] italic font-light hover:text-[#C5A059] transition-colors group">
                      {label}
                      <span className="material-symbols-outlined text-[15px] opacity-20 group-hover:opacity-100 group-hover:text-[#C5A059] transition-all">arrow_forward</span>
                    </Link>
                  </motion.div>
                ))}

                {/* Collections */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                  className="font-sans text-[8px] tracking-[0.45em] uppercase text-[#C5A059] mt-6 mb-2">
                  Collections
                </motion.p>
                {COLLECTIONS.map(({ name, color }, i) => (
                  <motion.div key={name}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.38 + i * 0.04 }}>
                    <Link href={`/shop?collection=${encodeURIComponent(name)}`} onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-3 border-b border-black/5
                        font-sans text-[11px] tracking-[0.15em] uppercase text-[#444] hover:text-black transition-colors group">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      {name}
                      <span className="ml-auto material-symbols-outlined text-[13px] opacity-0 group-hover:opacity-60 transition-all">arrow_forward</span>
                    </Link>
                  </motion.div>
                ))}

                {/* Extras */}
                {[
                  { href: '/try-on',   label: 'AI Try-On' },
                  { href: '/wishlist', label: 'Wishlist' },
                  { href: '/account',  label: 'Account' },
                ].map(({ href, label }, i) => (
                  <motion.div key={href}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.68 + i * 0.04 }}>
                    <Link href={href} onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-4 border-b border-black/5
                        font-display text-[18px] italic font-light hover:text-[#C5A059] transition-colors group">
                      {label}
                      <span className="material-symbols-outlined text-[14px] opacity-20 group-hover:opacity-100 group-hover:text-[#C5A059] transition-all">arrow_forward</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="px-6 py-5 border-t border-black/5">
                <a href="https://wa.me/918980008826" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[12px] text-[#767676] hover:text-black transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Us
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
