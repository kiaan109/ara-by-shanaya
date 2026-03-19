"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

interface WishlistState {
  items: Product[];
  toggle: (product: Product) => void;
  has: (sku: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set((state) => ({
          items: state.items.some((p) => p.sku === product.sku)
            ? state.items.filter((p) => p.sku !== product.sku)
            : [...state.items, product],
        })),
      has: (sku) => get().items.some((item) => item.sku === sku),
    }),
    { name: "ara-wishlist-store" },
  ),
);
