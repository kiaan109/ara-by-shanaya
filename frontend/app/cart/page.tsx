'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { calcShipping, SHIPPING_ZONES } from '@/lib/shipping';
import { calcTax, GST_LABEL } from '@/lib/tax';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || '';
function resolveImg(img: string) {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('/')) return img;
  return `${BACKEND}/${img}`;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const subtotal = total();
  const shipping = subtotal > 0 ? calcShipping('India', subtotal) : 0;
  const freeOver = SHIPPING_ZONES['India'].freeOver || 3000;
  const tax = calcTax(subtotal);
  const grandTotal = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#767676]">Your bag is empty</p>
        <Link href="/shop" className="bg-black text-white text-[11px] tracking-[0.2em] uppercase px-10 py-4 hover:opacity-75 transition-opacity">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 md:px-10 py-10">
      <h1 className="text-[11px] tracking-[0.35em] uppercase mb-10">Shopping Bag ({items.reduce((a, i) => a + i.quantity, 0)})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">

        {/* Items */}
        <div className="space-y-0 divide-y divide-[#e5e5e5]">
          {items.map(item => {
            const img = resolveImg(item.image);
            return (
              <div key={`${item._id}-${item.size}`} className="grid grid-cols-[100px_1fr] gap-5 py-6">
                {/* Image */}
                <Link href={`/shop/${item._id}`}>
                  <div className="relative overflow-hidden bg-[#f0f0f0]" style={{ aspectRatio: '3/4' }}>
                    {img ? (
                      <img src={img} alt={item.name} className="absolute inset-0 w-full h-full object-contain" />
                    ) : (
                      <div className="absolute inset-0 bg-[#f0f0f0]" />
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] leading-tight">{item.name}</p>
                        {item.size && <p className="text-[11px] text-[#767676] mt-1">Size: {item.size}</p>}
                        {item.color && <p className="text-[11px] text-[#767676]">Colour: {item.color}</p>}
                      </div>
                      <p className="text-[13px] flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#e5e5e5]">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#767676] hover:text-black transition-colors text-lg"
                      >−</button>
                      <span className="w-8 text-center text-[12px]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#767676] hover:text-black transition-colors text-lg"
                      >+</button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => { removeItem(item._id); toast.success('Removed'); }}
                      className="text-[10px] tracking-[0.15em] uppercase text-[#767676] hover:text-black transition-colors underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-[80px] h-fit">
          <div className="border border-[#e5e5e5] p-6">
            <h2 className="text-[11px] tracking-[0.3em] uppercase mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#767676]">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#767676]">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#767676]">Estimated tax ({GST_LABEL})</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="border-t border-[#e5e5e5] pt-4 mb-6 flex justify-between">
              <span className="text-[11px] tracking-[0.1em] uppercase">Total (INR)</span>
              <span className="text-[15px]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            {shipping > 0 && (
              <p className="text-[10px] text-[#767676] mb-4 tracking-[0.05em]">
                Add ₹{(freeOver - subtotal).toLocaleString('en-IN')} more for free shipping in India
              </p>
            )}

            <Link href="/checkout" className="block w-full bg-black text-white text-[11px] tracking-[0.2em] uppercase py-4 text-center hover:opacity-75 transition-opacity">
              Checkout
            </Link>

            <Link href="/shop" className="block w-full border border-[#e5e5e5] text-black text-[11px] tracking-[0.2em] uppercase py-4 text-center hover:border-black transition-all mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
