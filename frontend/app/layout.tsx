import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ARA by Shanaya',
  description: 'Luxury summer fashion with AI-powered virtual try-on.',
  keywords: 'ARA by Shanaya, luxury fashion, summer collection, AI try-on',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#1a1a1a',
              border: '1px solid #E8DFC8',
              borderRadius: '2px',
              fontSize: '13px',
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
