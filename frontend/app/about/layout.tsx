import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About the Brand',
  description:
    'The story of ARA by Shanaya — a luxury womenswear label from Ahmedabad, India, crafting elevated dresses and separates with a coastal soul.',
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
