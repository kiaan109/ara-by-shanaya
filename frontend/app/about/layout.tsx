import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About the Brand',
  description:
    'The story of ARA by Shanaya — a contemporary luxury Indian fashion brand from Ahmedabad crafting resort wear, evening dresses and trousseau pieces with heritage Marodi hand embroidery in modern silhouettes.',
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
