import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

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

export const metadata: Metadata = {
  title: "ARA by Shanaya — Life's a Beach SS '26",
  description: "New SS '26 Collection. Dark Cloud, Horizon, Ocean, Beach, Waves, Pink Skies, Orange Vista.",
  keywords: 'ARA by Shanaya, SS26, summer collection, luxury fashion, Indian fashion',
  openGraph: {
    title: 'ARA by Shanaya',
    description: "Life's a Beach SS '26",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
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
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
