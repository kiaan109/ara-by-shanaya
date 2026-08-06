import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Virtual Try-On',
  description:
    'See how ARA by Shanaya pieces look on you with our AI virtual try-on. Upload a photo and preview any dress from the SS ’26 collection.',
  alternates: { canonical: '/try-on' },
};

export default function TryOnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
