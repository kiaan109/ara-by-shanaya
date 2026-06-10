'use client';
import { Scissors, Sparkles, Globe } from 'lucide-react';

const FEATURES = [
  {
    icon: Scissors,
    title: 'Customisable',
    desc: 'All our outfits are made to order. Feel free to ask us for customisation — we’ll work out the best way for you.',
  },
  {
    icon: Sparkles,
    title: 'Handcrafted',
    desc: 'Every piece is cut, stitched and finished by hand in small batches — no two garments are ever quite the same.',
  },
  {
    icon: Globe,
    title: 'International Shipping',
    desc: 'We ship everywhere we possibly can. Reach out to us for a delivery estimate to your doorstep, anywhere in the world.',
  },
];

export default function USPFeatures() {
  return (
    <section className="bg-white py-16 md:py-24 px-5 md:px-16 lg:px-24 reveal">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-12 text-center">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center px-4">
              <Icon className="w-7 h-7 md:w-8 md:h-8 text-[#C5A059] mb-4 md:mb-5" strokeWidth={1.25} />
              <h3 className="font-display font-light italic text-[18px] md:text-[20px] text-[#1a1c1c] mb-3">
                {title}
              </h3>
              <p className="font-sans text-[13px] text-[#767676] leading-relaxed max-w-[280px]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
