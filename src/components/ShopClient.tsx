"use client";

import { useMemo, useState } from "react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";

interface ShopClientProps {
  products: Product[];
}

export function ShopClient({ products }: ShopClientProps) {
  const [category, setCategory] = useState("All");
  const [size, setSize] = useState("All");
  const [maxPrice, setMaxPrice] = useState(50000);

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], [products]);
  const sizes = useMemo(() => ["All", ...new Set(products.flatMap((p) => p.sizes))], [products]);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatch = category === "All" || product.category === category;
        const sizeMatch = size === "All" || product.sizes.includes(size);
        const priceMatch = product.price <= maxPrice;
        return categoryMatch && sizeMatch && priceMatch;
      }),
    [products, category, size, maxPrice],
  );

  return (
    <section className="ara-container py-12">
      <h1 className="mb-8 font-serif text-6xl">Shop Collection</h1>
      <div className="mb-10 grid gap-4 rounded-2xl border border-[var(--ara-border)] bg-white p-5 md:grid-cols-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border p-3">
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={size} onChange={(e) => setSize(e.target.value)} className="rounded-xl border p-3">
          {sizes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <div className="rounded-xl border p-3">
          <label className="text-xs uppercase tracking-[0.2em] text-[var(--ara-muted)]">Max Price: ₹{maxPrice}</label>
          <input
            type="range"
            min={1000}
            max={50000}
            step={500}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </div>
      {!filtered.length ? (
        <p className="mt-8 text-center text-[var(--ara-muted)]">No products match your filters.</p>
      ) : null}
    </section>
  );
}
