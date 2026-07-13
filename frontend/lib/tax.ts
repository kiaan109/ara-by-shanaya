// GST applied at checkout — change the rate here and every page/email follows
export const GST_RATE = 0.18;
export const GST_LABEL = '18% GST';

export function calcTax(taxableAmount: number): number {
  return Math.round(Math.max(0, taxableAmount) * GST_RATE);
}
