'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ProductCard, { Product } from '@/components/ProductCard';

const CATS = [
  { label: 'Dress',  img: '/products/orange-blue-antift-dress-1.jpg',  href: '/shop?category=Dress'  },
  { label: 'Top',    img: '/products/orange-blue-bustier-top-1.jpg',    href: '/shop?category=Top'    },
  { label: 'Skirt',  img: '/products/confetti-skirt-1.jpg',             href: '/shop?category=Skirt'  },
  { label: 'Set',    img: '/products/confetti-set-1.jpg',               href: '/shop?category=Set'    },
  { label: 'Blazer', img: '/products/collage-blazer-1.jpg',             href: '/shop?category=Blazer' },
];

export default function CollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products?limit=12')
      .then(r => r.json())
      .then(d => setProducts(d.products || []));
  }, []);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-black" style={{ height: '60vh' }}>
        <Image src="/products/bustier-dress-black-pink-1.jpg" alt="Summer 2025 Collection" fill
          className="object-cover object-top opacity-80" sizes="100vw" priority />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-3 opacity-70">ARA by Shanaya</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-[-0.02em] leading-none">Summer 2025</h1>
        </div>
      </section>

      {/* Category grid */}
      <section className="px-5 md:px-10 py-14">
        <h2 className="text-[11px] tracking-[0.3em] uppercase mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATS.map(cat => (
            <Link key={cat.label} href={cat.href} className="group relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <Image src={cat.img} alt={cat.label} fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 50vw, 20vw" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-5">
                <p className="text-white text-[11px] tracking-[0.2em] uppercase">{cat.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial banner */}
      <section className="relative w-full overflow-hidden" style={{ aspectRatio: '21/8' }}>
        <Image src="/products/confetti-set-2.jpg" alt="The Collection" fill className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-3 opacity-70">The Collection</p>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.02em] leading-none mb-6">Designed for You</h2>
          <Link href="/shop" className="border border-white text-[10px] tracking-[0.22em] uppercase px-8 py-3.5 hover:bg-white hover:text-black transition-colors duration-300">
            Shop All
          </Link>
        </div>
      </section>

      {/* All products */}
      <section className="px-5 md:px-10 py-14">
        <h2 className="text-[11px] tracking-[0.3em] uppercase mb-8">The Full Edit</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

    </div>
  );
}
