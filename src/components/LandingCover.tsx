"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types/product";

interface LandingCoverProps {
  products: Product[];
}

export function LandingCover({ products }: LandingCoverProps) {
  const slides = products.flatMap((p) => p.images).slice(0, 3);
  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3">
        {slides.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt="ARA outfit from collection"
            className="h-full w-full object-cover"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 1.1 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center text-white">
        <motion.h1
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="font-serif text-6xl md:text-8xl"
        >
          ARA
        </motion.h1>
        <p className="mb-8 text-xl tracking-[0.2em] lowercase">by shanaya</p>
        <Link href="/home" className="ara-gold-btn rounded-full px-10 py-3 text-sm tracking-[0.2em] uppercase">
          Shop Now
        </Link>
      </div>
    </section>
  );
}
