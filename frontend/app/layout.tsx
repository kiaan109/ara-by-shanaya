import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Playfair_Display, Inter, Great_Vibes } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import LayoutShell from '@/components/LayoutShell';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-great-vibes',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://arabyshanaya.com'),
  title: {
    default: "ARA by Shanaya — Luxury Women's Fashion | Life's a Beach SS '26",
    template: '%s | ARA by Shanaya',
  },
  description:
    "Shop ARA by Shanaya's SS '26 collection — luxury dresses, tops, skirts and co-ords designed in Ahmedabad, India. Free shipping over ₹3,000. Collections: Dark Cloud, Horizon, Ocean, Beach, Waves, Pink Skies, Orange Vista.",
  keywords: [
    'ARA by Shanaya', 'clothing store Ahmedabad', 'designer boutique Ahmedabad', 'luxury fashion Ahmedabad',
    'designer dresses India', 'SS26 collection', 'summer dresses', 'resort wear India',
    'women designer clothing Ahmedabad', 'Indian fashion brand', 'boutique Gujarat',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "ARA by Shanaya — Luxury Women's Fashion",
    description: "Life's a Beach SS '26 — designer dresses, tops and co-ords. Free shipping in India over ₹3,000.",
    type: 'website',
    url: 'https://arabyshanaya.com',
    siteName: 'ARA by Shanaya',
    locale: 'en_IN',
    images: [{ url: '/logo.jpg', width: 512, height: 512, alt: 'ARA by Shanaya' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "ARA by Shanaya — Luxury Women's Fashion",
    description: "Life's a Beach SS '26 — designer dresses, tops and co-ords.",
    images: ['/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'ARA by Shanaya',
  url: 'https://arabyshanaya.com',
  logo: 'https://arabyshanaya.com/logo.jpg',
  image: 'https://arabyshanaya.com/logo.jpg',
  description: "Luxury women's clothing brand from Ahmedabad, Gujarat. Designer dresses, tops, skirts and co-ords. SS '26 collections: Dark Cloud, Horizon, Ocean, Beach, Waves, Pink Skies, Orange Vista.",
  telephone: '+91-89800-08826',
  priceRange: '₹₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ahmedabad',
    addressRegion: 'Gujarat',
    addressCountry: 'IN',
  },
  areaServed: [
    { '@type': 'City', name: 'Ahmedabad' },
    { '@type': 'Country', name: 'India' },
  ],
  sameAs: ['https://www.instagram.com/arabyshanaya'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable} ${greatVibes.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-9T598WDN9G" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9T598WDN9G');
          `}
        </Script>
      </head>
      <body className="bg-[#f9f9f9] text-[#1a1c1c] antialiased font-sans">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1c1c',
              color: '#fff',
              borderRadius: '0',
              fontSize: '11px',
              letterSpacing: '0.08em',
              fontFamily: 'Inter, sans-serif',
            },
            duration: 2000,
          }}
        />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
