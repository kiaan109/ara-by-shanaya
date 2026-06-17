import Link from 'next/link';

export const metadata = { title: 'Shipping — ARA by Shanaya' };

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-24 px-5 md:px-16 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-[#C5A059] mb-3">Information</p>
        <h1 className="font-display font-light italic text-[36px] md:text-[52px] leading-tight mb-12">Shipping</h1>

        <div className="space-y-10 font-sans text-[14px] text-[#444] leading-relaxed">
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Domestic (India)</h2>
            <ul className="space-y-2">
              <li>Standard delivery: <span className="text-black">5–7 business days</span></li>
              <li>Express delivery: <span className="text-black">2–3 business days</span></li>
              <li>Free shipping on orders above ₹3,000</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">International</h2>
            <ul className="space-y-2">
              <li>Delivery time: <span className="text-black">15–20 business days</span></li>
              <li>Customs and import duties are the responsibility of the customer</li>
              <li>Tracking provided on all international orders</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Returns</h2>
            <p>All items are quality-checked before dispatch. For any issues, please contact us within 48 hours of delivery.</p>
          </section>

          <div className="pt-6 border-t border-black/8">
            <Link href="/contact" className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#C5A059] hover:underline">
              Contact Us for Help →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
