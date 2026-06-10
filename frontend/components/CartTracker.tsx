'use client';
import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';

// Silently reports the current cart to the backend (when we know the
// shopper's email/phone) so abandoned-cart reminder emails/SMS can be sent.
export default function CartTracker() {
  const items = useCartStore(s => s.items);
  const lastKey = useRef<string>('');

  useEffect(() => {
    let contact: { name?: string; email?: string; phone?: string } | null = null;
    try {
      const sub = localStorage.getItem('ara_subscriber');
      const usr = localStorage.getItem('ara_user');
      contact = { ...(usr ? JSON.parse(usr) : {}), ...(sub ? JSON.parse(sub) : {}) };
    } catch { /* ignore */ }

    if (!contact?.email) return;

    const key = JSON.stringify(items.map(i => `${i._id}:${i.size || ''}:${i.quantity}`)) + contact.email;
    if (key === lastKey.current) return;
    lastKey.current = key;

    const t = setTimeout(() => {
      fetch('/api/cart/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contact!.email,
          phone: contact!.phone,
          name:  contact!.name,
          items: items.map(i => ({ _id: i._id, name: i.name, price: i.price, image: i.image, quantity: i.quantity, size: i.size })),
        }),
      }).catch(() => {});
    }, 1500);

    return () => clearTimeout(t);
  }, [items]);

  return null;
}
