"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatINR } from "@/utils/format";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [size, setSize] = useState(product.sizes[0] || "M");
  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();

  const buyNowMailto = `mailto:arabyshanya@gmail.com?subject=${encodeURIComponent(`New Order - ${product.name}`)}&body=${encodeURIComponent(
    `Outfit Name: ${product.name}\nPrice: ${formatINR(product.price)}\nSelected Size: ${size}\nQuantity: 1\nCustomer Name: \nCustomer Phone: `,
  )}`;

  return (
    <section className="ara-container py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <img src={activeImage} alt={product.name} className="h-[620px] w-full rounded-3xl object-cover" />
          <div className="mt-3 flex gap-2">
            {product.images.map((image) => (
              <button key={image} type="button" onClick={() => setActiveImage(image)} className={`h-24 w-20 overflow-hidden rounded-xl border ${activeImage === image ? "border-[var(--ara-gold)]" : "border-[var(--ara-border)]"}`}>
                <img src={image} alt={product.name} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--ara-muted)]">{product.category}</p>
          <h1 className="mt-2 font-serif text-6xl">{product.name}</h1>
          <p className="mt-3 text-2xl">{formatINR(product.price)}</p>
          <p className="mt-5 text-[var(--ara-muted)]">{product.description}</p>

          <div className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--ara-muted)]">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSize(item)}
                  className={`rounded-full border px-5 py-2 text-sm ${size === item ? "border-[var(--ara-gold)] text-[var(--ara-gold)]" : "border-[var(--ara-border)]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addItem(product, size, 1)}
              className="ara-gold-btn rounded-full px-8 py-3 text-xs uppercase tracking-[0.2em]"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => toggle(product)}
              className="rounded-full border border-[var(--ara-border)] px-8 py-3 text-xs uppercase tracking-[0.2em]"
            >
              {has(product.sku) ? "Saved" : "Wishlist"}
            </button>
            <a href={buyNowMailto} className="rounded-full border border-[var(--ara-gold)] px-8 py-3 text-xs uppercase tracking-[0.2em] text-[var(--ara-gold)]">
              Buy by Email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
