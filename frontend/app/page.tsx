'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard, { Product } from '@/components/ProductCard';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import VerticalSwipeCarousel from '@/components/VerticalSwipeCarousel';
import USPFeatures from '@/components/USPFeatures';

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

const LOOKBOOK_PAGES = Array.from({ length: 27 }, (_, i) =>
  `/lookbook/page-${String(i + 1).padStart(2, '0')}.jpg`
);

function LookbookSlideshow() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const timerRef = typeof window !== 'undefined' ? { current: null as ReturnType<typeof setInterval> | null } : { current: null };

  const goTo = (newIdx: number) => {
    setDir(newIdx > idx ? 1 : -1);
    setIdx(newIdx);
  };

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setIdx(i => (i + 1) % LOOKBOOK_PAGES.length);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {/* Book page slide animation */}
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={idx}
          custom={dir}
          variants={{
            initial: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0.6 }),
            animate: { x: 0, opacity: 1 },
            exit:    (d: number) => ({ x: d > 0 ? '-6%' : '6%', opacity: 0, scale: 0.97 }),
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={LOOKBOOK_PAGES[idx]}
            alt={`Lookbook page ${idx + 1}`}
            loading={idx < 3 ? 'eager' : 'lazy'}
            className="w-full h-full object-contain"
            style={{ display: 'block' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={() => goTo((idx - 1 + LOOKBOOK_PAGES.length) % LOOKBOOK_PAGES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center
          text-black/30 hover:text-black/80 transition-colors select-none text-3xl font-extralight"
        aria-label="Previous page"
      >‹</button>
      <button
        onClick={() => goTo((idx + 1) % LOOKBOOK_PAGES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center
          text-black/30 hover:text-black/80 transition-colors select-none text-3xl font-extralight"
        aria-label="Next page"
      >›</button>

      {/* Collection label */}
      {(() => {
        const col = COLLECTIONS.find(c =>
          c.pages.includes(LOOKBOOK_PAGES[idx])
        );
        const isFirst = col && col.pages[0] === LOOKBOOK_PAGES[idx];
        return isFirst && col ? (
          <div className="absolute top-5 left-5 z-10 pointer-events-none">
            <p className="font-sans text-[8px] tracking-[0.45em] uppercase text-[#C5A059] mb-1">Collection</p>
            <p className="font-display text-[18px] italic text-black leading-none">{col.name}</p>
          </div>
        ) : null;
      })()}

      {/* Page counter */}
      <div className="absolute bottom-4 right-5 font-sans text-[9px] tracking-[0.3em] text-black/40 select-none z-10">
        {String(idx + 1).padStart(2, '0')} / {String(LOOKBOOK_PAGES.length).padStart(2, '0')}
      </div>

      {/* Progress line-dots */}
      <div className="absolute bottom-4 left-5 flex gap-1.5 z-10">
        {LOOKBOOK_PAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all duration-300 bg-black"
            style={{ height: '1.5px', width: i === idx ? '22px' : '6px', opacity: i === idx ? 0.9 : 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ready,    setReady]    = useState(false);
  const [heroPage, setHeroPage] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('/api/products?limit=6')
      .then(r => r.json())
      .then(d => setProducts(d.products || []));
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Force-play hero video on mobile (some mobile browsers ignore the autoPlay attribute)
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const resume = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', resume);
          document.removeEventListener('click', resume);
        };
        document.addEventListener('touchstart', resume, { once: true });
        document.addEventListener('click', resume, { once: true });
      });
    }
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
          HERO — Full-screen video (desktop) / image (mobile)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-[#0d0d0d]" style={{ height: '100svh' }}>

        {/* ── Autoplay video (desktop & mobile) ── */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            // @ts-ignore - older iOS Safari attribute
            webkit-playsinline="true"
            preload="auto"
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ display: 'block', filter: 'blur(40px) brightness(0.6)', transform: 'scale(1.15)' }}
          >
            <source src="https://qcnpwaidf1iszznv.public.blob.vercel-storage.com/hero-video.mp4" type="video/mp4" />
          </video>
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            // @ts-ignore - older iOS Safari attribute
            webkit-playsinline="true"
            preload="auto"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ display: 'block' }}
          >
            <source src="https://qcnpwaidf1iszznv.public.blob.vercel-storage.com/hero-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Gradient overlays — light, just enough for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent pointer-events-none" />

        {/* Text content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 md:px-16 lg:px-24 pb-12 md:pb-20 lg:pb-28">
          {ready && (
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
              <p className="font-sans text-[9px] md:text-[10px] tracking-[0.5em] uppercase text-[#C5A059] mb-2.5 md:mb-3">
                Spring Summer '26
              </p>
              <h1 className="font-display font-light text-white leading-[0.9] mb-6 md:mb-9"
                style={{ fontSize: 'clamp(2.6rem, 12vw, 7.5rem)', letterSpacing: '-0.03em' }}>
                Life's a<br />Beach
              </h1>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                <Link href="/shop"
                  className="gold-btn inline-block px-7 md:px-10 py-3 md:py-4 text-white font-sans text-[10px] md:text-[11px] tracking-[0.25em] uppercase self-start">
                  Shop Collection
                </Link>
                <Link href="/try-on"
                  className="inline-block px-7 md:px-10 py-3 md:py-4 border border-white/40 text-white font-sans text-[10px] md:text-[11px] tracking-[0.25em] uppercase hover:bg-white/10 transition-colors self-start">
                  AI Virtual Try-On
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Scroll cue — desktop only */}
        <div className="absolute bottom-7 right-8 z-10 hidden md:flex flex-col items-center gap-1.5">
          <div className="w-px h-8 bg-white/20 overflow-hidden">
            <motion.div className="w-full bg-white/60"
              animate={{ y: ['-100%', '100%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
              style={{ height: '50%' }} />
          </div>
          <p className="text-[8px] tracking-[0.3em] uppercase text-white/30">Scroll</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          VERTICAL SWIPE CAROUSEL
      ═══════════════════════════════════════════════════════════════ */}
      <VerticalSwipeCarousel />

      {/* ═══════════════════════════════════════════════════════════════
          USP FEATURES + SHIPPING CALCULATOR
      ═══════════════════════════════════════════════════════════════ */}
      <USPFeatures />

      {/* ═══════════════════════════════════════════════════════════════
          INTRO STRIP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-10 md:py-16 lg:py-20 px-5 md:px-16 lg:px-24 reveal">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-8">
          <div>
            <p className="font-sans text-[9px] md:text-[10px] tracking-[0.5em] uppercase text-[#C5A059] mb-2">New Collection</p>
            <h2 className="font-display font-light text-[28px] md:text-[44px] lg:text-[56px] italic leading-tight">
              Seven Collections.<br />One Season.
            </h2>
          </div>
          <p className="font-sans text-[13px] md:text-[15px] text-[#767676] max-w-sm md:max-w-md leading-relaxed">
            A sun-drenched invitation to a world where fashion and horizon intertwine.
            Where the air is salty and the dresses match the tides.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SCROLL REVEAL — 3-D scroll animation
      ═══════════════════════════════════════════════════════════════ */}
      {/* Desktop/tablet: 3-D scroll lookbook */}
      <section className="hidden md:block bg-white">
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center gap-4 pb-4">
              <span className="font-display text-[34px] tracking-[0.28em] uppercase font-light text-[#1a1c1c]">
                ARA&nbsp;<span className="text-[#C5A059]">by</span>&nbsp;SHANAYA
              </span>
              <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#C5A059]">
                Spring Summer &apos;26
              </p>
              <h2 className="font-display font-light italic text-[#1a1c1c] leading-none"
                style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
                The Lookbook
              </h2>
            </div>
          }
        >
          <LookbookSlideshow />
        </ContainerScroll>
      </section>

      {/* Mobile: flat lookbook slideshow */}
      <section className="md:hidden bg-white py-12 px-5">
        <div className="flex flex-col items-center gap-3 mb-6">
          <span className="font-display text-[26px] tracking-[0.25em] uppercase font-light text-[#1a1c1c]">
            ARA&nbsp;<span className="text-[#C5A059]">by</span>&nbsp;SHANAYA
          </span>
          <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-[#C5A059]">Spring Summer &apos;26</p>
          <h2 className="font-display font-light italic text-[#1a1c1c] text-[28px]">The Lookbook</h2>
        </div>
        <div className="relative w-full overflow-hidden rounded-sm bg-white border border-gray-100" style={{ aspectRatio: '3/4' }}>
          <LookbookSlideshow />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          AI TRY-ON SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 md:py-24 lg:py-32 reveal">
        <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-7">
            <div className="flex items-center gap-5">
              <span className="h-px w-12 bg-[#C5A059]" />
              <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-[#C5A059]">Innovation</span>
            </div>
            <h2 className="font-display font-light text-[#1a1c1c] italic leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '-0.02em' }}>
              Virtual Try-On
            </h2>
            <p className="font-sans text-[15px] text-[#767676] leading-relaxed max-w-md">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
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
      <section className="bg-white py-16 md:py-24 lg:py-28 reveal">
        <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-24">
          <div className="flex flex-col items-center text-center mb-10 md:mb-14">
            <p className="font-sans text-[9px] md:text-[10px] tracking-[0.5em] uppercase text-[#C5A059] mb-3">Shop Now</p>
            <h2 className="font-display font-light text-[32px] md:text-[44px] lg:text-[52px] italic leading-tight">Featured Pieces</h2>
            <div className="w-10 h-px bg-[#C5A059] mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-4 gap-y-8 md:gap-y-10">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          <div className="text-center mt-10 md:mt-14">
            <Link href="/shop"
              className="inline-flex items-center gap-2 gold-btn px-10 md:px-12 py-3.5 md:py-4 text-white font-sans text-[10px] md:text-[11px] tracking-[0.25em] uppercase">
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
        <div className="relative w-full overflow-hidden bg-white" style={{ height: '90vh' }}>
          <img src="/lookbook/page-24.jpg" alt="Orange Vista"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ display: 'block' }} />
          <div className="absolute left-8 md:left-16 bottom-10 md:bottom-16 text-[#1a1c1c]">
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#C5A059] mb-2">Orange Vista</p>
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
