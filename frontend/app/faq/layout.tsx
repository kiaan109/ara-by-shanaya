import type { Metadata } from 'next';
import { FAQS } from '@/lib/faqs';

export const metadata: Metadata = {
  title: 'FAQ — Shipping, Returns & Sizing',
  description:
    'Answers to common questions about ARA by Shanaya orders — shipping times, returns and exchanges, sizing help and payments.',
  alternates: { canonical: '/faq' },
};

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      {children}
    </>
  );
}
