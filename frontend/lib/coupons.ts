// Central place for discount-code definitions.
// Add new codes here — { percent: 0-100, maxUses?: limit }
export const COUPONS: Record<string, { percent: number; label: string; maxUses?: number }> = {
  NEW20:      { percent: 20, label: '20% off — welcome gift' },
  PROUDMOM15: { percent: 15, label: '15% off — first 50 customers', maxUses: 50 },
};

export function getCoupon(code: string | undefined | null) {
  if (!code) return null;
  const c = COUPONS[code.trim().toUpperCase()];
  return c || null;
}

export function applyCoupon(subtotal: number, code: string | undefined | null) {
  const coupon = getCoupon(code);
  if (!coupon) return { discount: 0, percent: 0, code: null as string | null };
  const discount = Math.round(subtotal * (coupon.percent / 100));
  return { discount, percent: coupon.percent, code: code!.trim().toUpperCase() };
}
