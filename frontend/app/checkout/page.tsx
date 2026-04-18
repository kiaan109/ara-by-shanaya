'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { createOrder } from '@/lib/api';
import toast from 'react-hot-toast';

interface ShippingForm {
  name: string; email: string; phone: string;
  address: string; city: string; state: string; pincode: string;
}

const UPI_ID      = 'shanaya@upi';
const WA_NUMBER   = '918980008826';
const PHONE       = '+918980008826';
const UPI_QR_URL  = (amount: number) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `upi://pay?pa=${UPI_ID}&pn=ARA+by+Shanaya&am=${amount}&cu=INR`
  )}`;

type PayMode = 'upi' | 'whatsapp' | 'phone';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const cartTotal  = total();
  const shipping   = cartTotal >= 5000 ? 0 : 250;
  const grandTotal = cartTotal + shipping;

  const [step,     setStep]    = useState<'details' | 'payment' | 'success'>('details');
  const [payMode,  setPayMode] = useState<PayMode>('upi');
  const [loading,  setLoading] = useState(false);
  const [orderId,  setOrderId] = useState('');
  const [form,     setForm]    = useState<ShippingForm>({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
  });

  const update = (k: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof ShippingForm)[] = ['name', 'phone', 'address', 'city', 'pincode'];
    if (required.some((f) => !form[f].trim())) {
      toast.error('Please fill all required fields');
      return;
    }
    setStep('payment');
  };

  const handleConfirm = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const order = await createOrder({
        items:           items.map((i) => ({ product: i._id, quantity: i.quantity, price: i.price })),
        shippingAddress: form,
        paymentMethod:   payMode,
        totalAmount:     grandTotal,
        phone:           form.phone,
        email:           form.email,
      });
      setOrderId(order.orderId || order._id);
      clearCart();
      setStep('success');
    } catch {
      toast.error('Order failed. Please try again or contact us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const waMessage = encodeURIComponent(
    `Hi! I'd like to place an order.\n\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}, ${form.city} ${form.pincode}\n\nItems:\n${items.map((i) => `• ${i.name} x${i.quantity} — ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n')}\n\nTotal: ₹${grandTotal.toLocaleString('en-IN')}`
  );

  if (!items.length && step !== 'success') {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link href="/products" className="btn-gold">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-subtitle">Almost There</p>
          <h1 className="section-title mb-10">Checkout</h1>
        </motion.div>

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="flex items-center gap-3 mb-12">
            {(['details', 'payment'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-semibold ${
                    step === s ? 'bg-gold-500 text-white' :
                    (step === 'payment' && s === 'details') ? 'bg-gold-100 text-gold-500' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step === 'payment' && s === 'details' ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm capitalize ${step === s ? 'text-gold-500 font-medium' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i === 0 && <div className="w-12 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Details ── */}
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <form onSubmit={handleDetailsSubmit} className="lg:col-span-2 space-y-5">
                <h2 className="font-luxury text-2xl text-gray-800 mb-6">Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {([
                    { key: 'name',    label: 'Full Name *',   type: 'text' },
                    { key: 'phone',   label: 'Phone *',       type: 'tel' },
                    { key: 'email',   label: 'Email',         type: 'email' },
                    { key: 'pincode', label: 'Pincode *',     type: 'text' },
                  ] as { key: keyof ShippingForm; label: string; type: string }[]).map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">{label}</label>
                      <input type={type} value={form[key]} onChange={update(key)} className="input-field" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">Address *</label>
                  <input type="text" value={form.address} onChange={update('address')} className="input-field" placeholder="House No, Street, Locality" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">City *</label>
                    <input type="text" value={form.city} onChange={update('city')} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">State</label>
                    <input type="text" value={form.state} onChange={update('state')} className="input-field" />
                  </div>
                </div>
                <button type="submit" className="btn-gold w-full mt-4">Continue to Payment</button>
              </form>

              {/* Order summary */}
              <div className="luxury-card p-6 h-fit">
                <h3 className="font-luxury text-lg text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-gray-500 truncate max-w-[130px]">{item.name} ×{item.quantity}</span>
                      <span className="text-gray-800 font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gold-100 pt-4 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span className="text-gold-500">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Payment ── */}
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <h2 className="font-luxury text-2xl text-gray-800 mb-8">Payment Method</h2>

                {/* Method selector */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {([
                    { id: 'upi',       label: 'UPI / QR Code',   icon: '₹' },
                    { id: 'whatsapp',  label: 'WhatsApp Order',   icon: '💬' },
                    { id: 'phone',     label: 'Call Us',          icon: '📞' },
                  ] as { id: PayMode; label: string; icon: string }[]).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPayMode(m.id)}
                      className={`p-4 rounded-sm text-center text-sm transition-all border ${
                        payMode === m.id
                          ? 'border-gold-500 bg-gold-50 text-gold-500 font-medium'
                          : 'border-gray-200 text-gray-500 hover:border-gold-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{m.icon}</div>
                      <div className="text-xs leading-tight">{m.label}</div>
                    </button>
                  ))}
                </div>

                {/* UPI */}
                {payMode === 'upi' && (
                  <div className="luxury-card p-8 text-center space-y-5">
                    <p className="text-gray-500 text-sm">Scan with any UPI app — PhonePe, GPay, Paytm</p>
                    <div className="flex justify-center">
                      <div className="bg-white border border-gray-200 p-3 rounded-lg inline-block">
                        <img src={UPI_QR_URL(grandTotal)} alt="UPI QR" className="w-52 h-52" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</p>
                      <p className="text-gold-500 text-sm mt-1">{UPI_ID}</p>
                      <p className="text-gray-400 text-xs">ARA by Shanaya</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <a href={`upi://pay?pa=${UPI_ID}&pn=ARA+by+Shanaya&am=${grandTotal}&cu=INR`}
                        className="btn-outline-gold text-xs px-5 py-2">
                        Open UPI App
                      </a>
                      <a href={`gpay://upi/pay?pa=${UPI_ID}&pn=ARA+by+Shanaya&am=${grandTotal}&cu=INR`}
                        className="btn-outline-gold text-xs px-5 py-2">
                        Open GPay
                      </a>
                    </div>
                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-gray-400 text-xs mb-3">After completing payment, click below to confirm your order</p>
                      <button onClick={handleConfirm} disabled={loading} className="btn-gold w-full disabled:opacity-50">
                        {loading ? 'Confirming...' : 'I Have Paid — Confirm Order'}
                      </button>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {payMode === 'whatsapp' && (
                  <div className="luxury-card p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 fill-current text-green-500" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-luxury text-xl text-gray-800 mb-2">Order via WhatsApp</h3>
                      <p className="text-gray-500 text-sm">
                        Send your order details directly to us on WhatsApp.<br/>
                        We'll confirm availability and payment details personally.
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-sm p-4 text-left text-sm space-y-1">
                      <p className="font-medium text-gray-700">Your Order:</p>
                      {items.map((i) => (
                        <p key={i._id} className="text-gray-500">• {i.name} ×{i.quantity} — ₹{(i.price * i.quantity).toLocaleString('en-IN')}</p>
                      ))}
                      <p className="font-semibold text-gray-700 pt-1">Total: ₹{grandTotal.toLocaleString('en-IN')}</p>
                    </div>
                    <a
                      href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleConfirm}
                      className="flex items-center justify-center gap-3 w-full py-3.5 bg-green-500 text-white text-sm font-medium rounded-sm hover:bg-green-600 transition-colors"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Send Order on WhatsApp
                    </a>
                  </div>
                )}

                {/* Phone */}
                {payMode === 'phone' && (
                  <div className="luxury-card p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-gold-50 rounded-full flex items-center justify-center mx-auto border border-gold-200">
                      <svg className="w-7 h-7 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-luxury text-xl text-gray-800 mb-2">Call to Order</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Call us directly and we'll help you place your order and answer any questions.
                      </p>
                      <p className="text-2xl font-semibold text-gold-500">{PHONE}</p>
                      <p className="text-gray-400 text-xs mt-1">Mon–Sat, 10am–8pm IST</p>
                    </div>
                    <div className="bg-gold-50 rounded-sm p-4 text-left text-sm space-y-1">
                      <p className="font-medium text-gray-700">Mention your order:</p>
                      {items.map((i) => (
                        <p key={i._id} className="text-gray-500">• {i.name} ×{i.quantity}</p>
                      ))}
                      <p className="font-semibold text-gray-700 pt-1">Total: ₹{grandTotal.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex gap-3">
                      <a href={`tel:${PHONE}`}
                        className="btn-gold flex-1 text-center flex items-center justify-center gap-2">
                        Call Now
                      </a>
                      <button onClick={handleConfirm} disabled={loading}
                        className="btn-outline-gold flex-1 disabled:opacity-50">
                        {loading ? '...' : 'Confirm Order'}
                      </button>
                    </div>
                  </div>
                )}

                <button onClick={() => setStep('details')} className="mt-4 text-gray-400 text-xs hover:text-gold-500 transition-colors">
                  ← Back to details
                </button>
              </div>

              {/* Summary sidebar */}
              <div className="luxury-card p-6 h-fit">
                <h3 className="font-luxury text-lg text-gray-800 mb-3">Shipping to</h3>
                <div className="text-gray-500 text-sm space-y-1">
                  <p className="text-gray-800 font-medium">{form.name}</p>
                  <p>{form.address}</p>
                  <p>{form.city}{form.state ? `, ${form.state}` : ''} {form.pincode}</p>
                  <p>{form.phone}</p>
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-600">Total</span>
                    <span className="text-gold-500">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
                className="w-20 h-20 rounded-full bg-gold-50 border-2 border-gold-400 flex items-center justify-center mx-auto mb-8"
              >
                <span className="text-gold-500 text-3xl">✓</span>
              </motion.div>
              <h2 className="font-luxury text-3xl text-gray-900 mb-4">Order Received!</h2>
              <p className="text-gray-500 mb-2 text-sm">Thank you for shopping with ARA by Shanaya.</p>
              {orderId && <p className="text-gold-500 text-sm mb-4 font-medium">Order: {orderId}</p>}
              <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                We'll reach out on WhatsApp or phone to confirm your order shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white text-sm rounded-sm hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
                <Link href="/products" className="btn-outline-gold text-center">Continue Shopping</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
