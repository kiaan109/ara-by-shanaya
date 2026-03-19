"use client";

import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatINR } from "@/utils/format";

export function WishlistClient() {
  const { items, toggle } = useWishlistStore();
  const { addItem } = useCartStore();

  return (
    <section className="ara-container py-12">
      <h1 className="mb-6 font-serif text-6xl">Wishlist</h1>
      {!items.length ? <p>No saved outfits yet.</p> : null}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <article key={product.sku} className="rounded-2xl border border-[var(--ara-border)] bg-white p-4">
            <Link href={`/product/${product.slug}`}>
              <img src={product.images[0]} alt={product.name} className="h-80 w-full rounded-xl object-cover" />
            </Link>
            <h3 className="mt-3 font-serif text-2xl">{product.name}</h3>
            <p className="text-sm text-[var(--ara-muted)]">{formatINR(product.price)}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => addItem(product, product.sizes[0] || "M", 1)}
                className="ara-gold-btn rounded-full px-4 py-2 text-xs uppercase tracking-[0.15em]"
              >
                Move to Cart
              </button>
              <button
                type="button"
                onClick={() => toggle(product)}
                className="rounded-full border border-[var(--ara-border)] px-4 py-2 text-xs uppercase tracking-[0.15em]"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
