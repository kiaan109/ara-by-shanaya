import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Collections — SS '26 Lookbook",
  description:
    "Explore ARA by Shanaya's SS '26 collections — Dark Cloud, Horizon, Ocean, Beach, Waves, Pink Skies and Orange Vista. Luxury womenswear designed in India.",
  alternates: { canonical: '/collections' },
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
