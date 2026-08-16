// Site-wide promotional discount shown on product prices and the top banner.
// Purely a display discount — does NOT change what checkout actually charges.
export const PROMO_PERCENT = 40;

export function promoPrice(price: number): number {
  return Math.round(price * (1 - PROMO_PERCENT / 100));
}
