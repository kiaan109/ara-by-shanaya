"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";

interface HeroSliderProps {
  products: Product[];
}

export function HeroSlider({ products }: HeroSliderProps) {
  const slides = useMemo(
    () => products.filter((p) => p.images[0]).slice(0, 5),
    [products],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return (
      <section className="ara-container mt-12 rounded-3xl bg-[var(--ara-ivory)] p-10 text-center">
        Upload products from Admin to activate the hero slider.
      </section>
    );
  }

  const current = slides[index];
  return (
    <section className="ara-container mt-12 grid gap-6 md:grid-cols-[2fr_1fr]">
      <div className="relative h-[70vh] overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]">
        <AnimatePresence mode="wait">
          <motion.img
            key={current.sku}
            src={current.images[0]}
            alt={current.name}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0.4, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white">
          <p className="font-serif text-5xl">{current.name}</p>
          <Link
            href={`/product/${current.slug}`}
            className="mt-4 inline-flex rounded-full border border-white px-8 py-3 text-sm tracking-[0.2em] uppercase"
          >
            View Outfit
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <button
            type="button"
            onClick={() => setIndex(idx)}
            key={slide.sku}
            className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left ${
              idx === index ? "border-[var(--ara-gold)] bg-white" : "border-[var(--ara-border)] bg-[var(--ara-ivory)]"
            }`}
          >
            <img src={slide.images[0]} alt={slide.name} className="h-16 w-14 rounded-xl object-cover" loading="lazy" />
            <div>
              <p className="font-serif text-xl">{slide.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ara-muted)]">{slide.category}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
