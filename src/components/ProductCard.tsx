"use client";

import Link from "next/link";
import { useState } from "react";
import { Product } from "@/types/product";
import { formatINR } from "@/utils/format";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { toggle, has } = useWishlistStore();
  const inWishlist = has(product.sku);
  const displayImage = hovered && product.images[1] ? product.images[1] : product.images[0];

  return (
    <article
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
        <img
          src={displayImage}
          alt={product.name}
          className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-2xl">{product.name}</h3>
          <p className="text-sm text-[var(--ara-muted)]">{formatINR(product.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => toggle(product)}
          className={`rounded-full border px-4 py-2 text-xs tracking-[0.15em] uppercase ${
            inWishlist ? "border-[var(--ara-gold)] text-[var(--ara-gold)]" : "border-[var(--ara-border)]"
          }`}
        >
          {inWishlist ? "Saved" : "Wishlist"}
        </button>
      </div>
    </article>
  );
}
