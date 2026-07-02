import Link from 'next/link';

export const metadata = { title: 'Terms of Service — ARA by Shanaya' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#C5A059] mb-3">Legal</p>
        <h1 className="font-display text-3xl font-light tracking-tight mb-2">Terms of Service</h1>
        <p className="text-[11px] text-[#aaa] font-sans mb-12">Last updated: June 2025</p>

        <div className="space-y-8 text-[14px] text-[#444] leading-relaxed">
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using arabyshanaya.com, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website or services.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">2. Products & Pricing</h2>
            <p>All products are handcrafted and subject to availability. Prices are listed in Indian Rupees (INR) and are inclusive of applicable GST. We reserve the right to modify prices without prior notice. Product colours may vary slightly due to photography and screen settings.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">3. Orders & Payment</h2>
            <p>Order confirmation is sent via email after successful payment. We accept payments through Razorpay (cards, UPI, net banking, wallets). We also accept orders via WhatsApp with manual payment confirmation. ARA by Shanaya reserves the right to cancel any order at its discretion, with a full refund issued.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">4. No Returns or Exchanges</h2>
            <p>All sales are final. We do not accept returns or exchanges on any products. Please refer to our <Link href="/refund-policy" className="text-[#C5A059] hover:underline">Refund Policy</Link> for details on how we handle defective or incorrect items.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">5. Intellectual Property</h2>
            <p>All content on this website — including images, designs, text, and branding — is the exclusive property of ARA by Shanaya. Reproduction or distribution without written permission is strictly prohibited.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">6. Limitation of Liability</h2>
            <p>ARA by Shanaya shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our liability is limited to the value of the order placed.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">7. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Gujarat, India.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">8. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:arabyshanaya@gmail.com" className="text-[#C5A059] hover:underline">arabyshanaya@gmail.com</a>.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#f0f0f0] flex flex-wrap gap-6 font-sans text-[10px] tracking-[0.2em] uppercase text-[#aaa]">
          <Link href="/privacy" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-[#C5A059] transition-colors">Refund Policy</Link>
          <Link href="/shipping-policy" className="hover:text-[#C5A059] transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
