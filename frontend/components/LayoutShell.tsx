'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import SubscribePopup from '@/components/SubscribePopup';
import CartTracker from '@/components/CartTracker';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Admin gets NO navbar / footer / WhatsApp — it has its own layout
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
      <SubscribePopup />
      <CartTracker />
    </>
  );
}
