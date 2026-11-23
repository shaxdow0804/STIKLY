import { STICKER_TYPES, SHIPPING } from './config';

/** Per-sticker price with quantity tiers (mirrored in the place_order SQL function). */
export function customUnitPrice(typeId, qty) {
  const type = STICKER_TYPES.find((t) => t.id === typeId) || STICKER_TYPES[0];
  const factor = qty >= 50 ? 0.8 : qty >= 20 ? 0.9 : 1;
  return Math.round(type.base * factor * 100) / 100;
}

export const shippingFor = (subtotal) =>
  subtotal === 0 || subtotal >= SHIPPING.freeAbove ? 0 : SHIPPING.flat;
