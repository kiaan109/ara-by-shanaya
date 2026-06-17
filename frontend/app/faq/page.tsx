'use client';
import { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  { q: 'What sizes do you offer?', a: 'We offer XS, S, M, L, and XL across all styles. Refer to the size guide on each product page for exact measurements.' },
  { q: 'How do I care for my garment?', a: 'All ARA by Shanaya pieces are dry clean only to preserve fabric quality and print integrity.' },
  { q: 'Can I exchange or return an item?', a: 'We accept exchanges within 7 days of delivery for unworn items in original condition. Contact us via WhatsApp or email to initiate.' },
  { q: 'Do you ship internationally?', a: 'Yes. International orders typically arrive in 15–20 business days. Customs duties are borne by the customer.' },
  { q: 'How do I track my order?', a: 'Once your order is dispatched, you will receive a tracking link via email and WhatsApp.' },
  { q: 'Can I do a virtual try-on?', a: 'Yes! Use our AI Try-On feature — upload your photo and see yourself in any ARA piece instantly.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major cards, UPI, net banking, and cash on delivery for select domestic orders.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <main className="min-h-screen bg-white pt-32 pb-24 px-5 md:px-16 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-[#C5A059] mb-3">Help</p>
        <h1 className="font-display font-light italic text-[36px] md:text-[52px] leading-tight mb-12">FAQs</h1>

        <div className="divide-y divide-black/8">
          {FAQS.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left font-sans text-[14px] text-[#1a1c1c] hover:text-[#C5A059] transition-colors"
              >
                <span>{item.q}</span>
                <span className="text-[#C5A059] text-[20px] font-light ml-4">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <p className="pb-5 font-sans text-[13px] text-[#767676] leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-black/8">
          <Link href="/contact" className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#C5A059] hover:underline">
            Still have questions? Contact Us →
          </Link>
        </div>
      </div>
    </main>
  );
}
