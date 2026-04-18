'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductCard, { Product } from '@/components/ProductCard';
import { getProducts } from '@/lib/api';

const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-cream" />,
});

const fadeUp = {
  hidden:   { opacity: 0, y: 30 },
  visible:  (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getProducts({ limit: 8 })
      .then((d) => setProducts(d.products || d))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-30">
          <HeroScene />
        </div>

        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream/40 to-cream/90 pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <motion.p
            custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="section-subtitle"
          >
            Summer 2025 Collection
          </motion.p>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
            <Image src="/logo.svg" alt="ARA by Shanaya" width={260} height={96} className="mx-auto h-24 w-auto" priority />
          </motion.div>

          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="font-luxury text-xl md:text-2xl text-gray-600 italic mb-10 leading-relaxed"
          >
            Crafted for the woman who dares to bloom.
          </motion.p>

          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/products" className="btn-gold">
              Shop Collection
            </Link>
            <Link href="/try-on" className="btn-outline-gold">
              AI Try-On
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-gold-400" />
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <section className="border-y border-gold-100 py-4 bg-white overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: 'scroll 25s linear infinite' }}>
          {Array(6).fill(['ARA by Shanaya', 'Summer 2025', 'Luxury Fashion', 'Made with Love', 'India'].join('   ✦   ')).map((t, i) => (
            <span key={i} className="text-gold-400 text-xs tracking-[0.35em] uppercase">{t}</span>
          ))}
        </div>
        <style jsx>{`
          @keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        `}</style>
      </section>

      {/* ── FEATURED COLLECTION ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="section-subtitle">Summer Collection 2025</p>
            <h2 className="section-title">Our Designs</h2>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="h-px w-16 bg-gold-200" />
              <span className="text-gold-400 text-sm">✦</span>
              <div className="h-px w-16 bg-gold-200" />
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-sm animate-pulse" style={{ aspectRatio: '3/4' }} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg mb-4">Collection launching soon</p>
              <a href="https://wa.me/918980008826" target="_blank" rel="noopener noreferrer" className="btn-outline-gold">
                Contact Us
              </a>
            </div>
          )}

          {products.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/products" className="btn-outline-gold">View Full Collection</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── AI TRY-ON BANNER ── */}
      <section className="py-20 px-6 bg-cream border-y border-gold-100">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="section-subtitle">New Feature</p>
            <h2 className="section-title mb-4">Try Before You Buy</h2>
            <p className="text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
              Upload your photo and see how any outfit looks on you with our AI-powered virtual try-on.
            </p>
            <Link href="/try-on" className="btn-gold">Try It Now</Link>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT / WHATSAPP SECTION ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <p className="section-subtitle">Get in Touch</p>
          <h2 className="section-title mb-6">We're Here for You</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Questions about sizing, custom orders, or styling advice? Chat with us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/918980008826"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-3 bg-green-500 text-white text-sm font-medium rounded-sm hover:bg-green-600 transition-colors tracking-wide"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
            <a
              href="tel:+918980008826"
              className="flex items-center justify-center gap-3 px-8 py-3 border border-gold-200 text-gold-500 text-sm font-medium rounded-sm hover:bg-gold-50 transition-colors tracking-wide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
