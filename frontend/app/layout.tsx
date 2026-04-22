import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ARA by Shanaya',
  description: 'Summer 2025 Collection — Fashion with AI-powered virtual try-on.',
  keywords: 'ARA by Shanaya, fashion, summer collection, AI try-on',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 antialiased font-sans">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#000',
              color: '#fff',
              borderRadius: '0',
              fontSize: '12px',
              letterSpacing: '0.05em',
              fontFamily: 'Poppins, sans-serif',
            },
          }}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
