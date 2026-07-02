import Link from 'next/link';

export const metadata = { title: 'Refund Policy — ARA by Shanaya' };

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#C5A059] mb-3">Legal</p>
        <h1 className="font-display text-3xl font-light tracking-tight mb-2">Refund Policy</h1>
        <p className="text-[11px] text-[#aaa] font-sans mb-12">Last updated: June 2025</p>

        <div className="space-y-8 text-[14px] text-[#444] leading-relaxed">
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">No Returns or Exchanges</h2>
            <p>All ARA by Shanaya products are handcrafted and made to order. We do not accept returns or exchanges once an order has been placed and confirmed. Please review size guides and product descriptions carefully before purchasing.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Damaged or Incorrect Items</h2>
            <p>In the rare event that you receive a damaged or incorrect item, please contact us within 48 hours of delivery at <a href="mailto:arabyshanaya@gmail.com" className="text-[#C5A059] hover:underline">arabyshanaya@gmail.com</a> or WhatsApp +91 89800 08826 with photographs of the item. We will assess the situation and offer a replacement or store credit at our discretion.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Order Cancellation</h2>
            <p>Orders may be cancelled within 12 hours of placement. After this window, the order enters production and cannot be cancelled. To request a cancellation, contact us immediately via WhatsApp at +91 89800 08826.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Refund Processing</h2>
            <p>Approved refunds (for damaged/incorrect items or cancellations within 12 hours) are processed within 5–7 business days to the original payment method. You will receive a confirmation email once the refund has been initiated.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Colour Variations</h2>
            <p>Minor colour variations between product images and the actual item are inherent to handcrafted textiles and natural dyeing processes. These are not considered defects and are not eligible for a refund.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">Contact Us</h2>
            <p>For any queries regarding your order, reach us at <a href="mailto:arabyshanaya@gmail.com" className="text-[#C5A059] hover:underline">arabyshanaya@gmail.com</a> or on WhatsApp at +91 89800 08826.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#f0f0f0] flex flex-wrap gap-6 font-sans text-[10px] tracking-[0.2em] uppercase text-[#aaa]">
          <Link href="/privacy" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#C5A059] transition-colors">Terms of Service</Link>
          <Link href="/shipping-policy" className="hover:text-[#C5A059] transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
