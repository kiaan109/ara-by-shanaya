'use client';
import { PROMO_PERCENT } from '@/lib/promo';

const MESSAGE = `${PROMO_PERCENT}% OFF EVERYTHING`;
const REPEATS = Array(8).fill(MESSAGE);

export default function PromoBanner() {
  return (
    <div
      className="h-8 md:h-9 bg-white overflow-hidden select-none border-t border-black/10"
      aria-label={`${MESSAGE} — site-wide sale`}
    >
      <div className="promo-track flex items-center h-full w-max">
        {[0, 1].map(copy => (
          <div key={copy} className="flex items-center h-full">
            {REPEATS.map((msg, i) => (
              <span
                key={`${copy}-${i}`}
                className="flex items-center h-full px-6 font-sans text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-black whitespace-nowrap"
              >
                {msg}
                <span className="mx-6 text-[#C5A059]">&#9670;</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        .promo-track {
          animation: promo-scroll 22s linear infinite;
        }
        @keyframes promo-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .promo-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
