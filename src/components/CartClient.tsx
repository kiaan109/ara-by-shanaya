"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { createOrderMailto } from "@/utils/mailer";
import { formatINR } from "@/utils/format";

export function CartClient() {
  const { items, removeItem, updateQuantity, clear } = useCartStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const checkout = () => {
    if (!name.trim() || !phone.trim()) {
      alert("Please enter your name and phone number before checkout.");
      return;
    }
    window.location.href = createOrderMailto(items, { name, phone });
  };

  return (
    <section className="ara-container py-12">
      <h1 className="mb-6 font-serif text-6xl">Cart</h1>
      {!items.length ? <p>Your cart is empty.</p> : null}
      <div className="space-y-4">
        {items.map((item) => (
          <article key={`${item.product.sku}-${item.size}`} className="grid gap-4 rounded-2xl border border-[var(--ara-border)] bg-white p-4 md:grid-cols-[120px_1fr_auto]">
            <img src={item.product.images[0]} alt={item.product.name} className="h-28 w-24 rounded-xl object-cover" />
            <div>
              <p className="font-serif text-2xl">{item.product.name}</p>
              <p className="text-sm text-[var(--ara-muted)]">Size: {item.size}</p>
              <p>{formatINR(item.product.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.product.sku, item.size, Number(e.target.value))}
                className="w-20 rounded-lg border p-2"
              />
              <button
                type="button"
                onClick={() => removeItem(item.product.sku, item.size)}
                className="text-sm text-red-700"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      {!!items.length && (
        <div className="mt-8 rounded-2xl border border-[var(--ara-border)] bg-[var(--ara-ivory)] p-6">
          <p className="mb-3 font-serif text-3xl">Total: {formatINR(total)}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="Customer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border bg-white p-3"
            />
            <input
              type="tel"
              placeholder="Customer Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border bg-white p-3"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={checkout} className="ara-gold-btn rounded-full px-8 py-3 text-sm uppercase tracking-[0.2em]">
              Checkout via Email
            </button>
            <button type="button" onClick={clear} className="rounded-full border border-[var(--ara-border)] px-8 py-3 text-sm uppercase tracking-[0.2em]">
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
