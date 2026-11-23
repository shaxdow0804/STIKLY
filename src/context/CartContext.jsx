import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { CUSTOM_MAX_QTY, CUSTOM_MIN_QTY, MAX_QTY } from '../lib/config';
import { customUnitPrice, shippingFor } from '../lib/pricing';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage('stikly:cart', []);

  const addProduct = useCallback((p, qty = 1) => {
    const cap = Math.min(MAX_QTY, p.stock ?? MAX_QTY);
    setItems((prev) => {
      const i = prev.findIndex((x) => x.key === p.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(next[i].qty + qty, cap) };
        return next;
      }
      return [...prev, { key: p.id, productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, qty: Math.min(qty, cap), max: cap }];
    });
  }, [setItems]);

  const addCustom = useCallback(({ type, typeName, text, imageData, qty }) => {
    setItems((prev) => [...prev, {
      key: `custom-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      name: `Custom ${typeName}`, image: imageData || null, qty, min: CUSTOM_MIN_QTY, max: CUSTOM_MAX_QTY,
      custom: { type, text, imageData },
    }]);
  }, [setItems]);

  const setQty = useCallback((key, qty) => setItems((prev) => prev.map((i) => {
    if (i.key !== key) return i;
    return { ...i, qty: Math.max(i.min || 1, Math.min(qty, i.max || MAX_QTY)) };
  })), [setItems]);

  const remove = useCallback((key) => setItems((prev) => prev.filter((i) => i.key !== key)), [setItems]);
  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(() => {
    // Custom lines are priced from their tier, so the unit price follows the quantity.
    const lines = items.map((i) => (i.custom ? { ...i, price: customUnitPrice(i.custom.type, i.qty) } : i));
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const shipping = shippingFor(subtotal);
    return {
      lines, subtotal, shipping, total: subtotal + shipping,
      count: lines.reduce((s, l) => s + l.qty, 0),
      addProduct, addCustom, setQty, remove, clear,
      has: (id) => items.some((i) => i.key === id),
    };
  }, [items, addProduct, addCustom, setQty, remove, clear]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
