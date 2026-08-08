import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Shop All — Luxury Resort Wear, Evening Dresses & Co-ord Sets",
  description:
    "Browse ARA by Shanaya's full catalog — luxury Indian resort wear, designer evening dresses, kaftans and co-ord sets with Marodi hand embroidery. Perfect for vacations, destination weddings and receptions.",
  alternates: { canonical: '/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
