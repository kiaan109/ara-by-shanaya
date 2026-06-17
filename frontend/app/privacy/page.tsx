import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy — ARA by Shanaya' };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-24 px-5 md:px-16 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-[9px] tracking-[0.5em] uppercase text-[#C5A059] mb-3">Legal</p>
        <h1 className="font-display font-light italic text-[36px] md:text-[52px] leading-tight mb-12">Privacy Policy</h1>
        <div className="space-y-8 font-sans text-[14px] text-[#444] leading-relaxed">
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Data We Collect</h2>
            <p>We collect your name, email, phone number, and shipping address when you place an order or create an account. We do not sell your data to third parties.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">How We Use It</h2>
            <p>Your information is used solely to process orders, send shipping updates, and (with your consent) share new collection announcements.</p>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[0.3em] uppercase text-black mb-4">Contact</h2>
            <p>For any privacy concerns, email us or reach out via WhatsApp at +91 89800 08826.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
