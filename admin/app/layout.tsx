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
          style: { background: '#000', color: '#fff', borderRadius: '0', fontSize: '12px', letterSpacing: '0.05em' },
        }} />
        {children}
      </body>
    </html>
  );
}
