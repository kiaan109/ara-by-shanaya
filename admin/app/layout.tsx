import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'ARA by Shanaya — Admin',
  description: 'Admin dashboard for ARA by Shanaya',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1a1a', color: '#f5f5f5', border: '1px solid rgba(212,153,26,0.4)' },
        }} />
        {children}
      </body>
    </html>
  );
}
