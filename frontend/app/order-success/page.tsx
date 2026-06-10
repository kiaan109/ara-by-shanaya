'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function SuccessContent() {
  const p = useSearchParams();
  const orderId  = p.get('id') || '';
  const name     = p.get('name') || 'there';
  const pending  = p.get('pending') === 'true';

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-5 text-center">
      {/* Animated check / clock */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
        style={{ background: pending ? '#FEF3C7' : '#F0FDF4' }}
      >
        {pending ? (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
        ) : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        )}
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-[#C5A059] mb-3">
          {pending ? 'Order Received' : 'Order Confirmed'}
        </p>
        <h1 className="font-display text-[28px] md:text-[38px] font-light tracking-wide mb-4">
          Thank you, {name.split(' ')[0]}
        </h1>
        <p className="text-[13px] text-[#767676] max-w-sm leading-relaxed">
          {pending
            ? 'Your order has been received. We\'ll confirm payment and reach out to you shortly.'
            : 'Your payment was successful and your order is confirmed. You\'ll receive a confirmation email soon.'}
        </p>
      </motion.div>

      {orderId && (
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-8 bg-white border border-[#ebebeb] px-8 py-5 text-center"
        >
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#999] mb-1">Order ID</p>
          <p className="font-mono text-[15px] tracking-wider">{orderId}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}
        className="mt-10 flex flex-col sm:flex-row gap-3"
      >
        <Link href="/orders" className="gold-btn text-white font-sans text-[10px] tracking-[0.2em] uppercase px-8 py-3.5 inline-block">
          View My Orders
        </Link>
        <Link href="/shop" className="border border-black text-black font-sans text-[10px] tracking-[0.2em] uppercase px-8 py-3.5 inline-block hover:bg-black hover:text-white transition-colors">
          Continue Shopping
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="mt-12 grid grid-cols-3 gap-8 text-center max-w-xs"
      >
        {[
          { icon: '📦', label: '15–20 Day Delivery' },
          { icon: '✉️', label: 'Email Confirmation' },
          { icon: '🚫', label: 'No Exchange/Return' },
        ].map(({ icon, label }) => (
          <div key={label}>
            <div className="text-xl mb-1">{icon}</div>
            <p className="text-[9px] tracking-[0.12em] uppercase text-[#aaa]">{label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-5 h-5 border border-black border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
