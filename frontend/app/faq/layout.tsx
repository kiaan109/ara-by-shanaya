import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Shipping, Returns & Sizing',
  description:
    'Answers to common questions about ARA by Shanaya orders — shipping times, returns and exchanges, sizing help and payments.',
  alternates: { canonical: '/faq' },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
