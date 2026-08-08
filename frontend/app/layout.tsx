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
    "ARA by Shanaya — luxury Indian resort wear and evening dresses from Ahmedabad. Designer co-ord sets, kaftans, gowns and cocktail dresses with traditional Marodi hand embroidery. Destination wedding and vacation wear, shipped worldwide.",
  keywords: [
    'ARA by Shanaya', 'luxury Indian resort wear brand', 'designer resort wear for destination weddings',
    'high-end designer kaftans and co-ord sets', 'modern Indian vacation wear designer', 'luxury holiday wear',
    'Indian designer evening dresses for reception', 'contemporary Indian gown and dress designer',
    'indo-western evening wear', 'designer cocktail dresses with hand embroidery',
    'Marodi hand embroidery designer clothes', 'Marodi work luxury Indian wear', 'Marodi zardozi embellished outfits',
    'heritage Indian embroidery modern silhouettes', 'contemporary luxury Indian fashion brand',
    'boutique Indian designers for trousseau', 'clothing store Ahmedabad', 'designer boutique Ahmedabad',
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
  description: "Contemporary luxury Indian fashion brand from Ahmedabad, Gujarat. Designer resort wear, evening dresses, kaftans and co-ord sets featuring traditional Marodi hand embroidery — vacation wear, destination wedding and trousseau pieces in modern silhouettes.",
  knowsAbout: [
    'luxury Indian resort wear', 'destination wedding outfits', 'designer kaftans', 'co-ord sets',
    'Indian evening dresses', 'indo-western evening wear', 'cocktail dresses',
    'Marodi hand embroidery', 'zardozi embellishment', 'heritage Indian craftsmanship', 'trousseau wear',
  ],
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
  sameAs: [
    'https://www.instagram.com/arabyshanaya',
    'https://www.facebook.com/ARA-by-Shanaya-1389809801344619',
    'https://www.justdial.com/Ahmedabad/Ara-By-Shanaya-Thaltej/079PXX79-XX79-250425200144-M9N1_BZDET',
  ],
  hasMap: 'https://www.google.com/search?q=Ara+by+Shanaya+Ahmedabad',
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
