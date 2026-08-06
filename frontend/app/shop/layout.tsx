import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Shop All — Designer Dresses, Tops, Skirts & Pants",
  description:
    "Browse the full ARA by Shanaya SS '26 catalog — luxury dresses, tops, skirts and pants. Filter by collection: Dark Cloud, Horizon, Ocean, Beach, Waves, Pink Skies, Orange Vista.",
  alternates: { canonical: '/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
