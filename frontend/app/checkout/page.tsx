'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || '';
function resolveImg(img: string) {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('/')) return img;
  return `${BACKEND}/${img}`;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const subtotal = total();
  const shipping = subtotal >= 3000 ? 0 : 200;
  const grandTotal = subtotal + shipping;

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
  });
  const [placed, setPlaced] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const k of required) {
      if (!form[k as keyof typeof form].trim()) {
        toast.error('Please fill all fields');
        return;
      }
    }
    // Build WA order message
    const orderLines = items.map(i => `• ${i.name}${i.size ? ` (${i.size})` : ''} × ${i.quantity} = ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
    const msg = encodeURIComponent(
      `🛍 New Order from ARA Website\n\n` +
      `*Customer:* ${form.name}\n*Phone:* ${form.phone}\n*Email:* ${form.email}\n\n` +
      `*Address:*\n${form.address}\n${form.city}, ${form.state} - ${form.pincode}\n\n` +
      `*Items:*\n${orderLines}\n\n` +
      `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n` +
      `*Shipping:* ${shipping === 0 ? 'Free' : `₹${shipping}`}\n` +
      `*Total:* ₹${grandTotal.toLocaleString('en-IN')}`
    );
    window.open(`https://wa.me/918980008826?text=${msg}`, '_blank');
    clearCart();
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 gap-6 text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h1 className="text-[11px] tracking-[0.35em] uppercase">Order Placed!</h1>
        <p className="text-[13px] text-[#767676] max-w-sm">Your order has been sent to us via WhatsApp. We'll confirm it shortly.</p>
        <Link href="/shop" className="bg-black text-white text-[11px] tracking-[0.2em] uppercase px-10 py-4 hover:opacity-75 transition-opacity">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#767676]">Your bag is empty</p>
        <Link href="/shop" className="bg-black text-white text-[11px] tracking-[0.2em] uppercase px-10 py-4 hover:opacity-75 transition-opacity">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 md:px-10 py-10">
      <div className="mb-8">
        <Link href="/cart" className="text-[10px] tracking-[0.15em] uppercase text-[#767676] hover:text-black transition-colors flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Bag
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

        {/* Shipping form */}
        <div>
          <h1 className="text-[11px] tracking-[0.35em] uppercase mb-8">Shipping Details</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Full Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your full name"
                  className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Phone *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="+91 XXXXX XXXXX" type="tel"
                  className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Email *</label>
              <input value={form.email} onChange={e => set('email', e.target.value)} required placeholder="your@email.com" type="email"
                className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Street Address *</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} required placeholder="House/Flat no., Street"
                className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">City *</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} required placeholder="City"
                  className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">State *</label>
                <input value={form.state} onChange={e => set('state', e.target.value)} required placeholder="State"
                  className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">PIN Code *</label>
                <input value={form.pincode} onChange={e => set('pincode', e.target.value)} required placeholder="XXXXXX"
                  className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit"
                className="w-full bg-black text-white text-[11px] tracking-[0.2em] uppercase py-4 hover:opacity-75 transition-opacity flex items-center justify-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Place Order via WhatsApp
              </button>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div>
          <h2 className="text-[11px] tracking-[0.35em] uppercase mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map(item => {
              const img = resolveImg(item.image);
              return (
                <div key={`${item._id}-${item.size}`} className="flex gap-4">
                  <div className="relative w-16 flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                    {img && <Image src={img} alt={item.name} fill className="object-cover object-top" sizes="64px" />}
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white text-[9px] flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] leading-tight">{item.name}</p>
                    {item.size && <p className="text-[11px] text-[#767676] mt-0.5">Size: {item.size}</p>}
                    <p className="text-[12px] mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#e5e5e5] pt-5 space-y-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#767676]">Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[#767676]">Shipping</span>
              <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between text-[13px] pt-2 border-t border-[#e5e5e5]">
              <span className="tracking-[0.1em] uppercase text-[11px]">Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
