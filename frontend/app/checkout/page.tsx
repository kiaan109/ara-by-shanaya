'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { applyCoupon } from '@/lib/coupons';
import { calcShipping, SHIPPING_COUNTRIES, SHIPPING_ZONES } from '@/lib/shipping';

declare global { interface Window { Razorpay: any } }

// ─── Types ─────────────────────────────────────────────────────────────────
type OrderItem = { _id: string; name: string; price: number; quantity: number; size: string; image: string };
type Form = { name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string; country: string };

// ─── Field component ────────────────────────────────────────────────────────
function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.22em] uppercase text-[#999] mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full border-0 border-b border-[#e0e0e0] focus:border-black focus:outline-none
          py-2.5 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors duration-200"
      />
    </div>
  );
}

// ─── Select field component ─────────────────────────────────────────────────
function SelectField({ label, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.22em] uppercase text-[#999] mb-1.5">{label}</label>
      <select
        {...props}
        className="w-full border-0 border-b border-[#e0e0e0] focus:border-black focus:outline-none
          py-2.5 text-[13px] bg-transparent transition-colors duration-200"
      >
        {props.children}
      </select>
    </div>
  );
}

// ─── Main checkout content ──────────────────────────────────────────────────
function CheckoutContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const { items: cartItems, total: cartTotal, clearCart } = useCartStore();

  const productId = params.get('id');
  const paramSize = params.get('size') || '';
  const paramQty  = parseInt(params.get('qty') || '1');
  const isSingle  = !!productId;

  const [product,   setProduct]   = useState<any>(null);
  const [loadingP,  setLoadingP]  = useState(isSingle);
  const [selSize,   setSelSize]   = useState(paramSize);
  const [qty,       setQty]       = useState(paramQty);
  const [paying,    setPaying]    = useState(false);
  const [rzpReady,  setRzpReady]  = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponCode,  setCouponCode]  = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [form, setForm] = useState<Form>({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', country: 'India',
  });

  const set = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Restore saved details
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ara_user');
      if (saved) setForm(f => ({ ...f, ...JSON.parse(saved) }));
    } catch { /* ignore */ }
  }, []);

  // Load Razorpay script
  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => setRzpReady(true);
    document.body.appendChild(s);
    return () => { try { document.body.removeChild(s); } catch { /* ignore */ } };
  }, []);

  // Fetch single product
  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`).then(r => r.json()).then(d => {
      const p = d.product || d;
      setProduct(p);
      if (!selSize && p.sizes?.length) setSelSize(p.sizes[0]);
      setLoadingP(false);
    });
  }, [productId]);

  // ── Derived totals ────────────────────────────────────────────────────────
  const items: OrderItem[] = isSingle
    ? (product ? [{ _id: product._id, name: product.name, price: product.price, quantity: qty, size: selSize, image: product.images?.[0] || '' }] : [])
    : cartItems.map(i => ({ _id: i._id, name: i.name, price: i.price, quantity: i.quantity, size: i.size || '', image: i.image }));

  const subtotal   = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping   = subtotal > 0 ? calcShipping(form.country, subtotal) : 0;
  const shippingZone = SHIPPING_ZONES[form.country] || SHIPPING_ZONES['Rest of World'];
  const { discount, percent } = applyCoupon(subtotal, couponCode);
  const tax        = Math.round((subtotal - discount) * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal + shipping + tax - discount);

  const applyCouponCode = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const result = applyCoupon(subtotal, code);
    if (!result.code) {
      setCouponError('Invalid or expired coupon code');
      setCouponCode(null);
      return;
    }
    setCouponCode(result.code);
    setCouponError('');
    toast.success(`${result.percent}% discount applied!`);
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponInput('');
    setCouponError('');
  };

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!form.name.trim())    return 'Please enter your full name';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) return 'Please enter a valid 10-digit phone number';
    if (!form.address.trim()) return 'Please enter your shipping address';
    if (!form.city.trim())    return 'Please enter your city';
    if (!form.state.trim())   return 'Please enter your state';
    if (form.country === 'India' && (!form.pincode.trim() || form.pincode.replace(/\D/g, '').length !== 6)) return 'Please enter a valid 6-digit PIN code';
    if (form.country !== 'India' && !form.pincode.trim()) return 'Please enter your postal/ZIP code';
    if (isSingle && !selSize && product?.sizes?.length) return 'Please select a size';
    return null;
  }

  // ── Payment handler ───────────────────────────────────────────────────────
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    if (items.length === 0) { toast.error('Your bag is empty'); return; }

    // Save user details for next time
    localStorage.setItem('ara_user', JSON.stringify(form));

    setPaying(true);

    const createPayload = isSingle
      ? { type: 'single', productId, size: selSize, qty, couponCode, country: form.country }
      : { type: 'cart',   items: cartItems.map(i => ({ _id: i._id, size: i.size, qty: i.quantity })), couponCode, country: form.country };

    try {
      const createRes = await fetch('/api/orders/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(createPayload),
      });
      const data = await createRes.json();

      // ── Razorpay not configured → save as pending ─────────────────────
      if (createRes.status === 503 && data.pending) {
        const pendingRes = await fetch('/api/orders', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...form, items: data.items, subtotal: data.subtotal, shipping: data.shipping, tax: data.tax, discount: data.discount, couponCode: data.couponCode, total: data.total }),
        });
        const pendingData = await pendingRes.json();
        if (pendingData.success) {
          fetch('/api/cart/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, items: [] }) }).catch(() => {});
          if (!isSingle) clearCart();
          router.push(`/order-success?id=${pendingData.orderId}&pending=true&name=${encodeURIComponent(form.name)}`);
        } else {
          toast.error('Something went wrong. Please try again.');
          setPaying(false);
        }
        return;
      }

      if (!createRes.ok || data.error) {
        toast.error(data.error || 'Payment error. Please try again.');
        setPaying(false);
        return;
      }

      // ── Razorpay configured → open payment widget ─────────────────────
      if (!rzpReady || typeof window.Razorpay === 'undefined') {
        toast.error('Payment not ready. Please refresh and try again.');
        setPaying(false);
        return;
      }

      const orderData = {
        ...form,
        items:      data.items,
        subtotal:   data.subtotal,
        shipping:   data.shipping,
        tax:        data.tax,
        discount:   data.discount,
        couponCode: data.couponCode,
        total:      data.total,
      };

      const options = {
        key:      data.key,
        amount:   data.amount,
        currency: 'INR',
        name:     'ARA by Shanaya',
        description: items.map(i => i.name).join(', '),
        image:    '/logo.jpg',
        order_id: data.razorpayOrderId,
        prefill:  { name: form.name, email: form.email, contact: form.phone },
        theme:    { color: '#C5A059' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/orders/verify', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderData,
            }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            fetch('/api/cart/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, items: [] }) }).catch(() => {});
            if (!isSingle) clearCart();
            router.push(`/order-success?id=${result.orderId}&name=${encodeURIComponent(form.name)}`);
          } else {
            toast.error('Payment verification failed. Contact us with ID: ' + response.razorpay_payment_id);
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
          escape:     false,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r: any) => {
        toast.error('Payment failed: ' + (r.error?.description || 'Unknown error'));
        setPaying(false);
      });
      rzp.open();

    } catch (e) {
      console.error(e);
      toast.error('Network error. Please try again.');
      setPaying(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingP) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isSingle && cartItems.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="font-sans text-[11px] tracking-[0.3em] uppercase text-[#767676]">Your bag is empty</p>
      <Link href="/shop" className="gold-btn inline-block px-10 py-3.5 text-white font-sans text-[10px] tracking-[0.2em] uppercase">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-[#ebebeb] px-5 md:px-10 h-14 flex items-center justify-between">
        <Link href={isSingle ? `/shop/${productId}` : '/cart'}
          className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[#767676] hover:text-black transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {isSingle ? 'Back to product' : 'Back to bag'}
        </Link>
        <Link href="/" className="font-display text-[15px] tracking-[0.2em] uppercase font-light">
          ARA <span className="text-[#C5A059]">by</span> SHANAYA
        </Link>
        <div className="w-24 hidden md:flex items-center gap-1.5 justify-end text-[10px] text-[#999]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Secure checkout
        </div>
      </div>

      {/* ── Mobile order summary bar (hidden on desktop) ── */}
      <div className="lg:hidden border-b border-[#ebebeb] bg-[#f5f5f5]">
        <button
          type="button"
          onClick={() => setSummaryOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-[12px]"
        >
          <span className="flex items-center gap-2 text-[#1a1c1c] font-medium tracking-wide">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            Order summary
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${summaryOpen ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </span>
          <span className="text-[#1a1c1c] font-semibold">₹{grandTotal.toLocaleString('en-IN')}</span>
        </button>

        {summaryOpen && (
          <div className="px-5 pb-5 border-t border-[#ebebeb] bg-white">
            <div className="space-y-3 py-4">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-12 flex-shrink-0 bg-[#f5f5f5]" style={{ aspectRatio: '3/4' }}>
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{item.name}</p>
                    {item.size && <p className="text-[11px] text-[#999]">Size: {item.size}</p>}
                    <p className="text-[11px] text-[#999]">Qty: {item.quantity}</p>
                    <p className="text-[12px]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#f0f0f0] pt-3 space-y-2 text-[12px] text-[#999]">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              {discount > 0 && <div className="flex justify-between text-[#C5A059]"><span>Discount ({couponCode})</span><span>−₹{discount.toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span></div>
              <div className="flex justify-between"><span>Estimated tax (5% GST)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between pt-2 border-t border-[#f0f0f0] text-[#1a1c1c] font-medium text-[13px]">
                <span>Total (INR)</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-16 items-start">

          {/* ════════════════════════════════════════
              LEFT — Customer form
          ════════════════════════════════════════ */}
          <form onSubmit={handlePay} className="space-y-10">

            {/* Size selector (single buy only, if not pre-selected) */}
            {isSingle && product?.sizes?.length > 0 && (
              <div>
                <h2 className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#C5A059] mb-4">
                  01 — Select Size
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s: string) => (
                    <button type="button" key={s} onClick={() => setSelSize(s)}
                      className={`h-10 min-w-[44px] px-4 text-[11px] tracking-[0.05em] border transition-all ${
                        selSize === s ? 'bg-black text-white border-black' : 'border-[#ddd] hover:border-black'
                      }`}>{s}</button>
                  ))}
                </div>
                {/* Qty */}
                <div className="flex items-center gap-4 mt-5">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#999]">Quantity</span>
                  <div className="flex items-center border border-[#ddd]">
                    <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-lg text-[#777] hover:text-black transition-colors">−</button>
                    <span className="w-10 text-center font-sans text-[13px]">{qty}</span>
                    <button type="button" onClick={() => setQty(q => Math.min(10, q + 1))}
                      className="w-9 h-9 flex items-center justify-center text-lg text-[#777] hover:text-black transition-colors">+</button>
                  </div>
                </div>
              </div>
            )}

            {/* Contact details */}
            <div>
              <h2 className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#C5A059] mb-4">
                {isSingle && product?.sizes?.length ? '02' : '01'} — Contact Details
              </h2>
              <div className="space-y-5">
                <Field label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="As on shipping label" required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Email Address *" type="email" value={form.email} onChange={e => set('email', e.target.value.trim())} placeholder="your@email.com" required />
                  <Field label="Phone Number *" type="tel" value={form.phone} onChange={e => set('phone', e.target.value.replace(/[^\d+\-\s()]/g, '').slice(0, 15))} placeholder="+91 XXXXX XXXXX" maxLength={15} required />
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div>
              <h2 className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#C5A059] mb-4">
                {isSingle && product?.sizes?.length ? '03' : '02'} — Shipping Address
              </h2>
              <div className="space-y-5">
                <SelectField label="Country *" value={form.country} onChange={e => set('country', e.target.value)} required>
                  {SHIPPING_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </SelectField>
                <Field label="Street Address *" value={form.address} onChange={e => set('address', e.target.value)} placeholder="House/Flat, Street, Area" required />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Field label="City *" value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" required />
                  </div>
                  <Field label="State *" value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" required />
                  {form.country === 'India' ? (
                    <Field label="PIN Code *" value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="400001" maxLength={6} required />
                  ) : (
                    <Field label="Postal/ZIP Code *" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="ZIP code" required />
                  )}
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="border-t border-[#ebebeb] pt-6">
              <button type="button" onClick={() => setCouponOpen(v => !v)}
                className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#767676] hover:text-black transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                {couponOpen ? 'Hide coupon field' : 'Have a coupon code?'}
              </button>
              <AnimatePresence>
                {couponOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    {couponCode ? (
                      <div className="flex items-center justify-between mt-3 px-4 py-2.5 border border-[#C5A059] bg-[#C5A059]/5">
                        <span className="text-[12px] tracking-[0.1em]">
                          <b className="text-[#C5A059]">{couponCode}</b> applied — {percent}% off
                        </span>
                        <button type="button" onClick={removeCoupon} className="text-[10px] tracking-[0.15em] uppercase text-[#999] hover:text-black transition-colors">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2 mt-3">
                          <input
                            value={couponInput}
                            onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                            className="flex-1 border-b border-[#e0e0e0] focus:border-black focus:outline-none py-2 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors uppercase"
                            placeholder="Enter coupon code" />
                          <button type="button" onClick={applyCouponCode}
                            className="px-4 py-2 text-[10px] tracking-[0.15em] uppercase border border-[#1a1c1c] text-[#1a1c1c] hover:bg-[#1a1c1c] hover:text-white transition-colors">
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-[10px] text-red-500 mt-1.5">{couponError}</p>}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pay button */}
            <div className="pt-2">
              <button type="submit" disabled={paying}
                className="w-full gold-btn text-white font-sans text-[11px] tracking-[0.25em] uppercase py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all">
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing payment…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Pay ₹{grandTotal.toLocaleString('en-IN')}
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-[#aaa] mt-3 flex items-center justify-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Secured by Razorpay — 256-bit SSL encryption
              </p>
            </div>
          </form>

          {/* ════════════════════════════════════════
              RIGHT — Order summary (sticky)
          ════════════════════════════════════════ */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white border border-[#ebebeb] p-6">
              <h2 className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#999] mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-5">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-14 flex-shrink-0 bg-[#f5f5f5] overflow-hidden" style={{ aspectRatio: '3/4' }}>
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium leading-tight truncate">{item.name}</p>
                      {item.size && <p className="text-[11px] text-[#999] mt-0.5">Size: {item.size}</p>}
                      <p className="text-[11px] text-[#999]">Qty: {item.quantity}</p>
                      <p className="text-[12px] mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-[#f0f0f0] pt-4 space-y-2.5">
                <div className="flex justify-between text-[12px] text-[#999]">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[12px] text-[#C5A059]">
                    <span>Discount ({couponCode} · {percent}%)</span>
                    <span>−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[12px] text-[#999]">
                  <span>Shipping ({form.country})</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                </div>
                <p className="text-[10px] text-[#bbb]">Estimated delivery: {shippingZone.days}</p>
                <div className="flex justify-between text-[12px] text-[#999]">
                  <span>Estimated tax (5% GST)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2.5 border-t border-[#f0f0f0] mt-2.5">
                  <span className="font-sans text-[11px] tracking-[0.1em] uppercase">Total (INR)</span>
                  <span className="text-[15px] font-medium">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Export with Suspense boundary (required for useSearchParams) ──────────
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
