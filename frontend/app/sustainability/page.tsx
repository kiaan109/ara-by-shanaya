import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sustainability — ARA by Shanaya' };

export default function SustainabilityPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-24 px-5 md:px-16 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-[#C5A059] mb-3">Our Commitment</p>
        <h1 className="font-display font-light italic text-[36px] md:text-[52px] leading-tight mb-12">Sustainability</h1>

        <div className="space-y-10 font-sans text-[14px] text-[#444] leading-relaxed">
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Crafted with Care</h2>
            <p>Every ARA by Shanaya piece is made in small batches to minimise waste. We work with artisans who are fairly compensated and operate in safe, dignified conditions.</p>
          </section>

          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Responsible Fabrics</h2>
            <p>We prioritise high-quality fabrics that are built to last — choosing longevity over fast fashion. Our scuba, muslin, and printed fabrics are sourced from responsible suppliers.</p>
          </section>

          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Packaging</h2>
            <p>Our packaging is minimal and recyclable. We are actively working toward fully plastic-free packaging across all shipments.</p>
          </section>

          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Slow Fashion</h2>
            <p>ARA is not a seasonal drop brand. We design collections that transcend trends — pieces you will reach for year after year, not discard next season.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
