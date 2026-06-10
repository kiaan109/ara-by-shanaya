// Shipping zones — country → flat rate (INR) + free-shipping threshold + delivery estimate
export type ShippingZone = { rate: number; days: string; freeOver?: number };

export const SHIPPING_ZONES: Record<string, ShippingZone> = {
  India:            { rate: 200,  days: '15-20 business days', freeOver: 3000 },
  Nepal:            { rate: 1200, days: '15-20 business days' },
  Bangladesh:       { rate: 1200, days: '15-20 business days' },
  'Sri Lanka':      { rate: 1200, days: '15-20 business days' },
  UAE:              { rate: 1800, days: '15-20 business days' },
  Singapore:        { rate: 1800, days: '15-20 business days' },
  'United Kingdom': { rate: 2800, days: '15-20 business days' },
  'United States':  { rate: 3200, days: '15-20 business days' },
  Canada:           { rate: 3200, days: '15-20 business days' },
  Australia:        { rate: 3000, days: '15-20 business days' },
  Germany:          { rate: 2800, days: '15-20 business days' },
  France:           { rate: 2800, days: '15-20 business days' },
  'Rest of World':  { rate: 3800, days: '15-20 business days' },
};

export const SHIPPING_COUNTRIES = Object.keys(SHIPPING_ZONES);

export function calcShipping(country: string, subtotal: number): number {
  const zone = SHIPPING_ZONES[country] || SHIPPING_ZONES['Rest of World'];
  if (zone.freeOver && subtotal >= zone.freeOver) return 0;
  return zone.rate;
}
