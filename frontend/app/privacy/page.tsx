import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — ARA by Shanaya' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#C5A059] mb-3">Legal</p>
        <h1 className="font-display text-3xl font-light tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[11px] text-[#aaa] font-sans mb-12">Last updated: June 2025</p>

        <div className="space-y-8 text-[14px] text-[#444] leading-relaxed">
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">1. Information We Collect</h2>
            <p>When you place an order or subscribe to our newsletter, we collect your name, email address, phone number, and delivery address. We do not store payment card details — all transactions are processed securely through Razorpay.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">2. How We Use Your Information</h2>
            <p>Your information is used solely to process and deliver your orders, send order confirmations and shipping updates, respond to enquiries, and send promotional offers if you have subscribed (you may unsubscribe at any time).</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">3. Data Sharing</h2>
            <p>We do not sell or trade your personal information. Data may be shared only with trusted service providers (courier partners, payment gateway) to fulfil your order, and only to the extent necessary.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">4. Cookies</h2>
            <p>We use cookies to maintain your shopping cart session and analyse site traffic. No personally identifiable information is stored in cookies.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">5. Data Security</h2>
            <p>All pages are served over HTTPS. Payment data is handled entirely by Razorpay under PCI-DSS compliance. We implement industry-standard security measures to protect your data.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">6. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:arabyshanaya@gmail.com" className="text-[#C5A059] hover:underline">arabyshanaya@gmail.com</a>.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#1a1c1c] mb-3">7. Contact</h2>
            <p>For privacy queries: <a href="mailto:arabyshanaya@gmail.com" className="text-[#C5A059] hover:underline">arabyshanaya@gmail.com</a> or WhatsApp +91 89800 08826.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#f0f0f0] flex flex-wrap gap-6 font-sans text-[10px] tracking-[0.2em] uppercase text-[#aaa]">
          <Link href="/terms" className="hover:text-[#C5A059] transition-colors">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-[#C5A059] transition-colors">Refund Policy</Link>
          <Link href="/shipping-policy" className="hover:text-[#C5A059] transition-colors">Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
