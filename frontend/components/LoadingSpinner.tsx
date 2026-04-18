'use client';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 border-2 border-gold-400/20 rounded-full"
        />
        <motion.div
          className="absolute inset-0 border-t-2 border-gold-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 border-b-2 border-gold-600/60 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <p className="text-gold-400/70 text-xs tracking-[0.3em] uppercase">{message}</p>
    </div>
  );
}
