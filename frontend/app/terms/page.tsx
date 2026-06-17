import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms — ARA by Shanaya' };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-24 px-5 md:px-16 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-[#C5A059] mb-3">Legal</p>
        <h1 className="font-display font-light italic text-[36px] md:text-[52px] leading-tight mb-12">Terms of Service</h1>
        <div className="space-y-8 font-sans text-[14px] text-[#444] leading-relaxed">
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Orders</h2>
            <p>By placing an order, you confirm that all details provided are accurate. ARA by Shanaya reserves the right to cancel orders in cases of pricing errors or stock unavailability.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Returns & Exchanges</h2>
            <p>Items may be exchanged within 7 days of delivery, provided they are unworn and in original condition. Sale items are final sale.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Intellectual Property</h2>
            <p>All designs, images, and content on this site belong to ARA by Shanaya. Reproduction without written permission is prohibited.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
