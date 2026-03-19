"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (sku: string, size: string) => void;
  updateQuantity: (sku: string, size: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, size, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.product.sku === product.sku && item.size === size);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.sku === product.sku && item.size === size
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { product, size, quantity }] };
        }),
      removeItem: (sku, size) =>
        set((state) => ({
          items: state.items.filter((item) => !(item.product.sku === sku && item.size === size)),
        })),
      updateQuantity: (sku, size, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.sku === sku && item.size === size
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "ara-cart-store" },
  ),
);
