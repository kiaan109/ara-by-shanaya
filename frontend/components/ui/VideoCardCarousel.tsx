'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ── Real ARA SS '26 products ─────────────────────────────────────────────────
const PRODUCTS = [
  {
    id:         'dark-cloud-corset-maxi',
    name:       'Dark Cloud Corset Maxi',
    collection: 'Dark Cloud',
    price:      '₹15,500',
    image:      '/products/dark-cloud-corset-maxi-1.jpg',
    accentHex:  '#6B21A8',
  },
  {
    id:         'horizon-scuba-maxi-cutout',
    name:       'Horizon Scuba Maxi',
    collection: 'Horizon',
    price:      '₹15,500',
    image:      '/products/horizon-scuba-maxi-cutout-2.jpg',
    accentHex:  '#0E7490',
  },
  {
    id:         'ocean-combined-maxi',
    name:       'Ocean Combined Maxi',
    collection: 'Ocean',
    price:      '₹15,500',
    image:      '/products/ocean-combined-maxi-1.jpg',
    accentHex:  '#0369A1',
  },
  {
    id:         'waves-muslin-dress',
    name:       'Waves Muslin Dress',
    collection: 'Waves',
    price:      '₹9,500',
    image:      '/products/waves-muslin-dress-1.jpg',
    accentHex:  '#0891B2',
  },
  {
    id:         'orange-vista-scuba-maxi',
    name:       'Orange Vista Scuba Maxi',
    collection: 'Orange Vista',
    price:      '₹15,500',
    image:      '/products/orange-vista-scuba-maxi-1.jpg',
    accentHex:  '#C2410C',
  },
];

// Volumetric depth layers
const THICKNESS_LAYERS = [-1.47, -0.73, 0, 0.73, 1.47];

export default function VideoCardCarousel() {
  const CARD_COUNT = PRODUCTS.length;
  const cardsRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const frameId    = useRef<number>(0);
  const progress   = useRef<number>(0);
  const mouse      = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const [metrics, setMetrics] = useState({ cardW: 280, cardH: 420 });

  // ── Mouse parallax ──────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
      const ry = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouse.current.targetX = Math.max(-1, Math.min(1, rx));
      mouse.current.targetY = Math.max(-1, Math.min(1, ry));
    };
    const onLeave = () => { mouse.current.targetX = 0; mouse.current.targetY = 0; };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => { window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); };
  }, []);

  // ── Responsive card sizing — portrait 2:3 ratio ─────────────────
  useEffect(() => {
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Width: smaller than before so portrait cards fit the viewport
      let cardW = Math.round(w * 0.12 + 100);
      const heightFactor = Math.min(1.0, Math.max(0.6, h / 850));
      cardW = Math.round(cardW * heightFactor);
      cardW = Math.min(240, Math.max(120, cardW));
      // Portrait: 2:3 ratio
      setMetrics({ cardW, cardH: Math.round(cardW * 1.5) });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── 60fps render loop ───────────────────────────────────────────
  useEffect(() => {
    const { cardH } = metrics;

    const renderLoop = () => {
      progress.current += 0.0024;
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

      const h = window.innerHeight;
      const continuousProgress = progress.current;
      const roundedIndex  = Math.round(continuousProgress);
      const diffFromRound = continuousProgress - roundedIndex;
      const easedDiff     = Math.sign(diffFromRound) * Math.pow(Math.abs(diffFromRound) * 2, 4.2) / 2;
      const virtualActive = roundedIndex + easedDiff;

      for (let i = 0; i < CARD_COUNT; i++) {
        const card = cardsRefs.current[i];
        if (!card) continue;

        let offset = i - virtualActive;
        const half = CARD_COUNT / 2;
        while (offset >  half) offset -= CARD_COUNT;
        while (offset < -half) offset += CARD_COUNT;

        const absOffset = Math.abs(offset);
        const sign      = Math.sign(offset);

        if (absOffset > 3.0) { card.style.visibility = 'hidden'; continue; }
        card.style.visibility = 'visible';

        const gap        = 28;
        const peekAmount = -50;
        const D          = 1350;

        let y = 0, z = 0, rot = 0;

        if (absOffset <= 1) {
          const t      = absOffset;
          const easedT = t * t * (3 - 2 * t);
          y   = -sign * (easedT * (cardH + gap));
          z   = 400 + easedT * (220 - 400);
          rot = easedT * 132;

        } else if (absOffset <= 2) {
          const t      = absOffset - 1;
          const easedT = t * t * (3 - 2 * t);
          const zEnd   = -60;
          const sEnd   = D / (D - zEnd);
          const yEnd   = (h / 2 - peekAmount) / sEnd - cardH / 2;
          y   = -sign * ((cardH + gap) + easedT * (yEnd - (cardH + gap)));
          z   = 220 + easedT * (zEnd - 220);
          rot = 132 + easedT * (175 - 132);

        } else {
          const t      = Math.min(absOffset - 2, 1);
          const easedT = t * t * (3 - 2 * t);
          const zStart = -60; const zEnd3  = -250;
          const sStart = D / (D - zStart); const sEnd3 = D / (D - zEnd3);
          const yStart = (h / 2 - peekAmount) / sStart - cardH / 2;
          const yEnd3  = (h / 2 + 100)        / sEnd3  + cardH / 2;
          y   = -sign * (yStart + easedT * (yEnd3 - yStart));
          z   = zStart + easedT * (zEnd3  - zStart);
          rot = 175   + easedT * (195    - 175);
        }

        const localRot    = -sign * rot;
        const center      = Math.max(0, 1 - absOffset);
        const activeTiltX = -mouse.current.y * 12 * center;
        const activeTiltY =  mouse.current.x * 15 * center;

        card.style.zIndex   = Math.round(z).toString();
        card.style.opacity  = '1';
        card.style.transform =
          `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) ` +
          `rotateX(${(localRot + activeTiltX).toFixed(2)}deg) ` +
          `rotateY(${activeTiltY.toFixed(2)}deg) rotateZ(-3deg)`;
      }
    };

    const tick = () => { renderLoop(); frameId.current = requestAnimationFrame(tick); };
    frameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId.current);
  }, [metrics, CARD_COUNT]);

  return (
    <div className="absolute inset-0 bg-[#080808] text-white flex items-center justify-center overflow-hidden select-none">

      {/* Ambient glow behind the carousel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(197,160,89,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Label — top on mobile, left side on desktop */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none px-6 w-full max-w-sm
                      md:top-1/2 md:left-8 lg:left-16 md:-translate-y-1/2 md:translate-x-0 md:text-left md:max-w-xs">
        <p className="text-[9px] tracking-[0.5em] uppercase text-[#C5A059]/70 font-light mb-2 md:mb-3">
          Stand-Out Pieces
        </p>
        <h2 className="font-display font-light italic text-white leading-tight"
          style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.75rem)' }}>
          Pieces that stop traffic.
        </h2>
        <p className="hidden md:block font-sans text-[12px] text-white/40 leading-relaxed mt-3 max-w-[240px]">
          Bold silhouettes, vivid colour, and a confidence that needs no introduction.
        </p>
      </div>

      {/* 3D perspective camera */}
      <div
        className="relative w-full h-full flex items-center justify-center pointer-events-none"
        style={{ perspective: '1350px' }}
      >
        <div
          className="absolute"
          style={{
            width:          `${metrics.cardW}px`,
            height:         `${metrics.cardH}px`,
            transformStyle: 'preserve-3d',
          }}
        >
          {PRODUCTS.map((product, i) => (
            <div
              key={product.id}
              ref={(el) => { cardsRefs.current[i] = el; }}
              className="absolute inset-0"
              style={{
                width:              `${metrics.cardW}px`,
                height:             `${metrics.cardH}px`,
                transformStyle:     'preserve-3d',
                backfaceVisibility: 'visible',
              }}
            >
              {THICKNESS_LAYERS.map((zOffset, layerIdx) => {
                const isFront = layerIdx === THICKNESS_LAYERS.length - 1;
                const isBack  = layerIdx === 0;

                // ── Middle structural slices ──
                if (!isFront && !isBack) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[14px] pointer-events-none overflow-hidden"
                      style={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(197,160,89,0.15)',
                        transform: `translateZ(${zOffset}px)`,
                      }}
                    />
                  );
                }

                // ── Front face: product card ──
                if (isFront) {
                  return (
                    <div
                      key={layerIdx}
                      className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none"
                      style={{
                        transform:          `translateZ(${zOffset}px)`,
                        backfaceVisibility: 'hidden',
                        boxShadow:          '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Product photo */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        draggable={false}
                      />

                      {/* Gradient overlay — top fade */}
                      <div
                        className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
                        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
                      />

                      {/* Gradient overlay — bottom fade */}
                      <div
                        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}
                      />

                      {/* Top: collection name */}
                      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
                        <span
                          className="text-[7px] tracking-[0.35em] uppercase font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${product.accentHex}33`,
                            color:           '#ffffff',
                            border:          `1px solid ${product.accentHex}66`,
                            backdropFilter:  'blur(8px)',
                          }}
                        >
                          {product.collection}
                        </span>
                        <span className="text-[8px] text-white/40 tracking-widest">SS '26</span>
                      </div>

                      {/* Bottom: product name + price */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <p className="font-display text-[13px] font-light text-white leading-tight mb-1" style={{ letterSpacing: '0.02em' }}>
                          {product.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium" style={{ color: '#C5A059' }}>
                            {product.price}
                          </span>
                          <span className="text-[8px] tracking-[0.2em] uppercase text-white/40">
                            Shop →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // ── Back face: blurred product + brand tag ──
                return (
                  <div
                    key={layerIdx}
                    className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none"
                    style={{
                      transform:          `translateZ(${zOffset}px) rotateX(180deg)`,
                      backfaceVisibility: 'hidden',
                      boxShadow:          '0 20px 60px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Blurred product image */}
                    <div className="absolute inset-0" style={{ filter: 'blur(20px)', transform: 'scale(1.15)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        draggable={false}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60" />

                    {/* Brand watermark */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <p className="font-display text-[10px] tracking-[0.4em] uppercase text-white/60 font-light">
                        ARA by SHANAYA
                      </p>
                      <div className="w-8 h-px bg-[#C5A059]/40" />
                      <p className="text-[7px] tracking-[0.35em] uppercase text-white/30">
                        Summer 2026
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* CTA below carousel */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <Link
          href="/shop"
          className="flex items-center gap-2 text-[9px] tracking-[0.35em] uppercase text-white/40 hover:text-[#C5A059] transition-colors duration-300"
          style={{ pointerEvents: 'auto' }}
        >
          <span>Explore All Pieces</span>
          <svg width="14" height="10" fill="none" viewBox="0 0 14 10">
            <path d="M1 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
