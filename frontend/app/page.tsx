'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductCard, { Product } from '@/components/ProductCard';
import { getProducts } from '@/lib/api';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 8 })
      .then((d) => setProducts(d.products || d))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const heroImage = products[0]?.images?.[0]
    ? products[0].images[0].startsWith('http')
      ? products[0].images[0]
      : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/${products[0].images[0]}`
    : null;

  return (
    <>
      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900"
        style={
          heroImage
            ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}
        }
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-gray-300 mb-6">
            Summer 2025 Collection
          </p>
          <h1
            className="font-serif text-white mb-6 leading-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', fontWeight: 300, letterSpacing: '0.05em' }}
          >
            ARA BY SHANAYA
          </h1>
          <p className="font-sans font-light text-gray-300 text-base md:text-lg mb-10 tracking-wide">
            Crafted for the woman who dares to bloom.
          </p>
          <Link href="/products" className="btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      {/* BANNER STRIP */}
      <section className="bg-black py-4 px-6">
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white text-center">
          Free Delivery on Orders Above ₹999&nbsp;&nbsp;|&nbsp;&nbsp;Easy Returns&nbsp;&nbsp;|&nbsp;&nbsp;WhatsApp Us
        </p>
      </section>

      {/* NEW IN */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="section-label mb-2">Summer 2025</p>
            <h2 className="heading-lg">New In</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse" style={{ aspectRatio: '3/4' }} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.slice(0, 8).map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
              <div className="text-center mt-14">
                <Link href="/products" className="btn-outline">
                  View All
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="font-sans text-sm text-gray-400 mb-8">Collection launching soon</p>
              <a
                href="https://wa.me/918980008826"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Contact Us
              </a>
            </div>
          )}
        </div>
      </section>

      {/* AI TRY-ON PROMO — split section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2">
          {/* Left: text */}
          <div className="flex flex-col justify-center px-10 md:px-16 py-20 order-2 md:order-1">
            <p className="section-label mb-4">New Feature</p>
            <h2 className="heading-lg mb-6">Try Before You Buy</h2>
            <p className="font-sans font-light text-sm text-gray-500 leading-relaxed mb-10 max-w-sm">
              Upload your photo and see how any outfit looks on you with our AI-powered virtual try-on. No fitting room needed.
            </p>
            <div>
              <Link href="/try-on" className="btn-primary">
                Try It Now
              </Link>
            </div>
          </div>

          {/* Right: placeholder image block */}
          <div
            className="order-1 md:order-2 bg-gray-200 flex items-center justify-center"
            style={{ minHeight: 400 }}
          >
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
              <p className="font-sans text-xs tracking-widest uppercase">AI Try-On</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
