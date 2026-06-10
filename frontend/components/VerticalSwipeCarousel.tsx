'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

const SLIDES = [
  {
    img: '/lookbook/page-24.jpg',
    eyebrow: "Spring Summer '26",
    title: 'Life’s a Beach',
    href: '/shop',
  },
  {
    img: '/lookbook/page-10.jpg',
    eyebrow: 'Horizon Collection',
    title: 'Chase the\nSunset',
    href: '/shop?category=Dress',
  },
  {
    img: '/lookbook/page-15.jpg',
    eyebrow: 'Ocean Collection',
    title: 'Deep Blue\nDreams',
    href: '/shop',
  },
  {
    img: '/lookbook/page-20.jpg',
    eyebrow: 'Waves Collection',
    title: 'Light as\nSea Air',
    href: '/shop',
  },
];

export default function VerticalSwipeCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[idx];

  return (
    <section className="relative w-full overflow-hidden bg-[#0d0d0d]" style={{ height: '100svh' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={idx}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slide.img}
            alt={slide.eyebrow}
            className="w-full h-full object-cover"
            style={{ display: 'block' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Text overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-sans text-[9px] md:text-[11px] tracking-[0.5em] uppercase text-[#C5A059] mb-3 md:mb-5">
              {slide.eyebrow}
            </p>
            <h2 className="font-display font-light text-white italic leading-[1.05] whitespace-pre-line"
              style={{ fontSize: 'clamp(2.4rem, 9vw, 6rem)', letterSpacing: '-0.02em' }}>
              {slide.title}
            </h2>
            <Link href={slide.href}
              className="gold-btn inline-block mt-7 md:mt-10 px-9 md:px-12 py-3.5 md:py-4 text-white font-sans text-[10px] md:text-[11px] tracking-[0.25em] uppercase">
              Shop The Edit
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Vertical progress dots */}
      <div className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300 bg-white"
            style={{ width: '1.5px', height: i === idx ? '22px' : '8px', opacity: i === idx ? 0.9 : 0.3 }}
          />
        ))}
      </div>

      {/* Swipe-up cue */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5">
        <div className="w-px h-8 bg-white/20 overflow-hidden">
          <motion.div className="w-full bg-white/60"
            animate={{ y: ['100%', '-100%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            style={{ height: '50%' }} />
        </div>
        <p className="text-[8px] tracking-[0.3em] uppercase text-white/30">Next</p>
      </div>
    </section>
  );
}
