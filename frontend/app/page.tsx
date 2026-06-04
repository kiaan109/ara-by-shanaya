'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard, { Product } from '@/components/ProductCard';

// Full lookbook spreads — shown at FULL height, never cropped
const COLLECTIONS = [
  {
    pages: ['/lookbook/page-04.jpg', '/lookbook/page-05.jpg'],
    name: 'Dark Cloud',
    desc: 'Sunset gradient — bold, electric, unforgettable.',
    color: 'from-purple-900/60',
  },
  {
    pages: ['/lookbook/page-09.jpg', '/lookbook/page-10.jpg'],
    name: 'Horizon',
    desc: 'Peach, sky and ocean — the ombré of a perfect day.',
    color: 'from-orange-900/60',
  },
  {
    pages: ['/lookbook/page-14.jpg', '/lookbook/page-15.jpg'],
    name: 'Ocean',
    desc: 'Deep blues and teals, shifting like the sea.',
    color: 'from-blue-900/60',
  },
  {
    pages: ['/lookbook/page-17.jpg', '/lookbook/page-18.jpg'],
    name: 'Beach',
    desc: 'Sunshine yellow with hand-painted beach motifs.',
    color: 'from-yellow-900/50',
  },
  {
    pages: ['/lookbook/page-19.jpg', '/lookbook/page-20.jpg'],
    name: 'Waves',
    desc: 'Sky blue muslin, light as sea air.',
    color: 'from-cyan-900/60',
  },
  {
    pages: ['/lookbook/page-21.jpg', '/lookbook/page-22.jpg'],
    name: 'Pink Skies',
    desc: 'Sunset pinks — bold, playful, unapologetic.',
    color: 'from-pink-900/60',
  },
  {
    pages: ['/lookbook/page-23.jpg', '/lookbook/page-25.jpg'],
    name: 'Orange Vista',
    desc: 'Rainbow stripes in a shirt, a maxi, a moment.',
    color: 'from-orange-800/50',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ready,    setReady]    = useState(false);
  const [heroPage, setHeroPage] = useState(0);

  useEffect(() => {
    fetch('/api/products?limit=6')
      .then(r => r.json())
      .then(d => setProducts(d.products || []));
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(() => setHeroPage(i => (i + 1) % 3), 6000);
    return () => clearInterval(t);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(entries =>
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); }),
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [products]);

  const HERO_IMGS = [
  '/products/dark-cloud-corset-maxi.jpg',
  '/products/horizon-scuba-maxi-cutout.jpg',
  '/products/waves-sun-dress.jpg',
];

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Lookbook cover page, full screen
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: '100svh' }}>
        {HERO_IMGS.map((src, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-[1800ms]"
            style={{ opacity: i === heroPage ? 1 : 0 }}>
            <img src={src} alt="ARA by Shanaya SS '26"
              className="w-full h-full object-cover"
              style={{
                objectPosition: 'center top',
                transform: i === heroPage ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 10s ease',
                display: 'block',
              }} />
          </div>
        ))}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-16 pb-16 md:pb-24">
          <AnimatePresence mode="wait">
            {ready && (
              <motion.div key={heroPage}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}>
                <p className="font-sans text-[10px] tracking-[0.55em] uppercase text-white/55 mb-3">
                  Spring Summer '26
                </p>
                <h1 className="font-display font-light text-white leading-[0.9] mb-8"
                  style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)', letterSpacing: '-0.025em' }}>
                  Life's a<br />Beach
                </h1>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/shop"
                    className="gold-btn inline-block px-10 py-4 text-white font-sans text-[11px] tracking-[0.25em] uppercase">
                    Shop Collection
                  </Link>
                  <Link href="/try-on"
                    className="inline-block px-10 py-4 border border-white/50 text-white font-sans text-[11px] tracking-[0.25em] uppercase backdrop-blur-sm hover:bg-white/10 transition-colors">
                    AI Virtual Try-On
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Slide indicator */}
        <div className="absolute bottom-6 right-8 z-10 flex gap-3">
          {HERO_IMGS.map((_, i) => (
            <button key={i} onClick={() => setHeroPage(i)}
              className="bg-white transition-all duration-500"
              style={{ height: '1px', width: i === heroPage ? 36 : 12, opacity: i === heroPage ? 1 : 0.35 }} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          INTRO STRIP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 px-6 md:px-16 reveal">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#C5A059] mb-2">New Collection</p>
            <h2 className="font-display font-light text-[36px] md:text-[52px] italic leading-tight">
              Seven Collections.<br />One Season.
            </h2>
          </div>
          <p className="font-sans text-[15px] text-[#767676] max-w-md leading-relaxed">
            A sun-drenched invitation to a world where fashion and horizon intertwine.
            Where the air is salty and the dresses match the tides.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE LOOKBOOK — Full spreads, each collection
      ═══════════════════════════════════════════════════════════════ */}
      {COLLECTIONS.map(({ pages, name, desc, color }, ci) => (
        <section key={name} className={`reveal ${ci % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}`}>

          {/* Collection header */}
          <div className="max-w-[1440px] mx-auto px-6 md:px-16 pt-20 pb-10 flex items-end justify-between">
            <div>
              <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#C5A059] mb-2">
                Collection 0{ci + 1}
              </p>
              <h2 className="font-display font-light text-[40px] md:text-[56px] italic leading-none">{name}</h2>
              <p className="font-sans text-[14px] text-[#767676] mt-3 italic">{desc}</p>
            </div>
            <Link href={`/shop?search=${encodeURIComponent(name)}`}
              className="hidden md:flex items-center gap-2 font-sans text-[11px] tracking-[0.25em] uppercase
                border-b border-[#C5A059] pb-1 text-[#C5A059] hover:opacity-70 transition-opacity whitespace-nowrap">
              Shop {name}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Full-width lookbook spreads — shown at full natural height */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {pages.map((src, pi) => (
              <Link key={pi} href={`/shop?search=${encodeURIComponent(name)}`}
                className="group relative overflow-hidden block bg-[#f0f0f0]">
                <img src={src} alt={`${name} look ${pi + 1}`}
                  className="w-full transition-transform duration-[1400ms] group-hover:scale-[1.03]"
                  style={{ display: 'block' }} />
                <div className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-700
                  flex items-end justify-start p-8`}>
                  <span className="font-display text-[20px] italic text-white">
                    View Look →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile shop link */}
          <div className="md:hidden px-6 pb-10 pt-5">
            <Link href={`/shop?search=${encodeURIComponent(name)}`}
              className="flex items-center gap-2 font-sans text-[11px] tracking-[0.25em] uppercase
                border-b border-[#C5A059] pb-1 text-[#C5A059] w-fit">
              Shop {name}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          AI TRY-ON SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1a1c1c] py-28 reveal">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-7">
            <div className="flex items-center gap-5">
              <span className="h-px w-12 bg-[#C5A059]" />
              <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-[#C5A059]">Innovation</span>
            </div>
            <h2 className="font-display font-light text-white italic leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '-0.02em' }}>
              Virtual Try-On
            </h2>
            <p className="font-sans text-[15px] text-white/55 leading-relaxed max-w-md">
              Upload your photo. Select a style. See yourself in ARA SS '26 — powered by AI, styled by you.
            </p>
            <Link href="/try-on"
              className="gold-btn inline-flex items-center gap-3 px-10 py-4 text-white font-sans text-[11px] tracking-[0.25em] uppercase">
              <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
              Try It Now
            </Link>
          </div>
          {/* Preview image */}
          <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '520px' }}>
            <img src="/lookbook/page-11.jpg" alt="AI Try-On"
              className="w-full h-full object-cover object-top" style={{ display: 'block' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-white/55 block mb-1">Horizon</span>
              <p className="font-display text-[18px] italic">Scuba Corset Dress</p>
              <p className="font-sans text-[13px] text-white/55 mt-0.5">₹15,500</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 reveal">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16">
          <div className="flex flex-col items-center text-center mb-14">
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#C5A059] mb-3">Shop Now</p>
            <h2 className="font-display font-light text-[40px] md:text-[52px] italic leading-tight">Featured Pieces</h2>
            <div className="w-10 h-px bg-[#C5A059] mt-5" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          <div className="text-center mt-14">
            <Link href="/shop"
              className="inline-flex items-center gap-2 gold-btn px-12 py-4 text-white font-sans text-[11px] tracking-[0.25em] uppercase">
              View All Pieces
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ORANGE VISTA FULL-WIDTH EDITORIAL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="reveal">
        <div className="relative w-full overflow-hidden" style={{ maxHeight: '90vh' }}>
          <img src="/lookbook/page-24.jpg" alt="Orange Vista"
            className="w-full" style={{ display: 'block' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="absolute left-8 md:left-16 bottom-10 md:bottom-16 text-white">
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-white/60 mb-2">Orange Vista</p>
            <h3 className="font-display font-light italic leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              Scuba Maxi<br />with Belt
            </h3>
            <Link href="/shop/orange-vista-scuba-maxi"
              className="gold-btn inline-block px-9 py-3.5 text-white font-sans text-[10px] tracking-[0.25em] uppercase">
              Shop This Look
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MARQUEE
      ═══════════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden border-y border-[#e8e8e8] py-5 bg-[#f9f9f9]">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(12).fill(null).map((_, i) => (
            <span key={i} className="font-sans text-[10px] tracking-[0.45em] uppercase text-[#C5A059] mx-10">
              Life's a Beach &nbsp;·&nbsp; SS '26 &nbsp;·&nbsp; ARA by Shanaya &nbsp;·&nbsp; New Collection
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
