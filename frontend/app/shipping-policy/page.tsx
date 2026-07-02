import Link from 'next/link';

export const metadata = { title: 'Shipping Policy — ARA by Shanaya' };

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#C5A059] mb-3">Legal</p>
        <h1 className="font-display text-3xl font-light tracking-tight mb-2">Shipping Policy</h1>
        <p className="text-[11px] text-[#aaa] font-sans mb-12">Last updated: June 2025</p>

        <div className="space-y-8 text-[14px] text-[#444] leading-relaxed">
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Processing Time</h2>
            <p>All ARA by Shanaya pieces are handcrafted and made to order. Please allow 3–5 business days for production before your order is dispatched. You will receive a shipping confirmation with a tracking number once your order is on its way.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Domestic Shipping (India)</h2>
            <p>Orders within India are shipped via trusted courier partners. Delivery typically takes 7–14 business days from the date of dispatch. Free shipping is available on all domestic orders above ₹2,000.</p>
            <div className="mt-4 border border-[#f0f0f0] p-4 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#767676]">Orders above ₹2,000</span>
                <span className="font-medium text-[#1a1c1c]">Free</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#767676]">Orders below ₹2,000</span>
                <span className="font-medium text-[#1a1c1c]">₹99</span>
              </div>
            </div>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">International Shipping</h2>
            <p>We ship internationally to select countries. International delivery typically takes 15–25 business days. Shipping charges are calculated at checkout based on destination and order value. Customers are responsible for any customs duties, taxes, or import fees imposed by the destination country.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Order Tracking</h2>
            <p>Once your order is dispatched, you will receive an email with your tracking number. You can track your shipment directly on the courier's website. If you have not received a tracking update within 5 business days of placing your order, please contact us.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Delivery Issues</h2>
            <p>If your package is lost, delayed, or arrives damaged, please contact us within 48 hours at <a href="mailto:arabyshanaya@gmail.com" className="text-[#C5A059] hover:underline">arabyshanaya@gmail.com</a> with your order ID. We will coordinate with the courier to resolve the issue promptly.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Contact Us</h2>
            <p>For shipping queries, reach us at <a href="mailto:arabyshanaya@gmail.com" className="text-[#C5A059] hover:underline">arabyshanaya@gmail.com</a> or WhatsApp +91 89800 08826.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#f0f0f0] flex flex-wrap gap-6 font-sans text-[10px] tracking-[0.2em] uppercase text-[#aaa]">
          <Link href="/privacy" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#C5A059] transition-colors">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-[#C5A059] transition-colors">Refund Policy</Link>
        </div>
      </div>
    </div>
  );
}
