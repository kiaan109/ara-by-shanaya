'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SEEN_KEY = 'ara_subscribe_seen';

export default function SubscribePopup() {
  const [open,    setOpen]    = useState(false);
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<{ ok: boolean; message: string; code?: string } | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch { /* ignore */ }
    const t = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || phone.replace(/\D/g, '').length < 10) {
      setResult({ ok: false, message: 'Please fill in all fields with a valid phone number.' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error || 'Something went wrong. Please try again.' });
      } else {
        try {
          const lead = { name, email, phone: `+91${phone}` };
          localStorage.setItem('ara_subscriber', JSON.stringify(lead));
          // Also pre-fill checkout — only set if no existing user session
          if (!localStorage.getItem('ara_user')) {
            localStorage.setItem('ara_user', JSON.stringify(lead));
          } else {
            // Merge phone/email into existing session if missing
            const existing = JSON.parse(localStorage.getItem('ara_user')!);
            if (!existing.phone) existing.phone = `+91${phone}`;
            if (!existing.email) existing.email = email;
            if (!existing.name) existing.name = name;
            localStorage.setItem('ara_user', JSON.stringify(existing));
          }
        } catch { /* ignore */ }
        setResult({
          ok: true,
          code: data.code,
          message: data.isNew
            ? 'Check your email — your 20% off code is on its way!'
            : "You're already on the list!",
        });
      }
    } catch {
      setResult({ ok: false, message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-[420px] bg-white rounded-lg shadow-2xl px-7 py-9 sm:px-9 sm:py-10"
          >
            {/* Close */}
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#1a1c1c] hover:opacity-50 transition-opacity"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {result?.ok ? (
              /* ── Success state ── */
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[#C5A059]/15 flex items-center justify-center">
                  <svg width="22" height="22" fill="none" stroke="#C5A059" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-light tracking-tight mb-3">Welcome!</h2>
                <p className="text-[13px] text-[#767676] leading-relaxed mb-5">{result.message}</p>
                {result.code && (
                  <div className="inline-block border-2 border-dashed border-[#C5A059] px-7 py-3 text-[18px] tracking-[0.3em] font-semibold text-[#1a1c1c]">
                    {result.code}
                  </div>
                )}
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#999] mt-6">Use this code at checkout</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <h2 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-center mb-3">
                  Subscribe Now!
                </h2>
                <p className="text-[13px] text-center text-[#767676] leading-relaxed mb-7 px-1">
                  Get 20% off your first purchase—plus early access to launches, events, and exclusive offers.
                </p>

                <form onSubmit={submit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-[#e0e0e0] rounded-md px-4 py-3.5 text-[14px] text-[#1a1c1c] placeholder:text-[#aaa] focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-[#e0e0e0] rounded-md px-4 py-3.5 text-[14px] text-[#1a1c1c] placeholder:text-[#aaa] focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                  <div className="flex border border-[#e0e0e0] rounded-md overflow-hidden focus-within:border-[#C5A059] transition-colors">
                    <span className="flex items-center gap-1.5 px-4 bg-[#f5f5f5] text-[14px] text-[#1a1c1c] border-r border-[#e0e0e0] flex-shrink-0">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 min-w-0 px-4 py-3.5 text-[14px] text-[#1a1c1c] placeholder:text-[#aaa] focus:outline-none"
                    />
                  </div>

                  {result && !result.ok && (
                    <p className="text-[12px] text-red-500">{result.message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full gold-btn text-white text-[13px] tracking-[0.2em] uppercase font-semibold py-4 rounded-md disabled:opacity-60 transition-all"
                  >
                    {loading ? 'Signing up…' : 'Sign Me Up!'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
