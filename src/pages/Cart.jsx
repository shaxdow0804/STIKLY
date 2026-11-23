import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import useSeo from '../hooks/useSeo';
import { money } from '../lib/format';
import { SHIPPING } from '../lib/config';

export function OrderSummary({ cart, children }) {
  const left = SHIPPING.freeAbove - cart.subtotal;
  return (
    <aside className="card h-fit space-y-3 p-6 lg:sticky lg:top-32" aria-label="Order summary">
      <h2 className="text-xl font-extrabold">Order summary</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-label font-bold">{money(cart.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd className="font-label font-bold">{cart.shipping === 0 ? 'Free' : money(cart.shipping)}</dd></div>
        <div className="flex justify-between border-t-[1.5px] border-ink pt-3 text-lg"><dt className="font-bold">Total</dt><dd className="font-label text-xl font-bold">{money(cart.total)}</dd></div>
      </dl>
      {left > 0 && cart.subtotal > 0 && <p className="rounded-lg bg-citrus/40 p-3 text-sm">Add {money(left)} more for free shipping.</p>}
      {children}
    </aside>
  );
}

export default function Cart() {
  useSeo('Your cart', 'Review the stickers in your STIKLY cart.');
  const cart = useCart();
  const toast = useToast();

  if (cart.lines.length === 0) {
    return <div className="container-x py-20"><EmptyState icon={ShoppingBag} title="Your cart is empty" text="Your stash is waiting to be filled with stickers." action={<Link to="/shop" className="btn btn-primary">Start shopping</Link>} /></div>;
  }
  return (
    <div className="container-x py-10">
      <h1 className="mb-8 text-4xl font-extrabold sm:text-5xl">Your stash <span className="text-ink/40">({cart.count})</span></h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {cart.lines.map((l) => (
            <li key={l.key} className="card flex gap-4 p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border-[1.5px] border-ink bg-paper2 sm:h-28 sm:w-28">
                {l.image ? <img src={l.image} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center p-2 text-center font-display text-sm font-bold">{l.custom?.text}</span>}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">{l.slug ? <Link to={`/product/${l.slug}`} className="hover:text-violet">{l.name}</Link> : l.name}</h2>
                    {l.custom && <p className="truncate text-sm text-ink/60">{l.custom.text ? `“${l.custom.text}”` : 'Image sticker'}</p>}
                    <p className="font-label text-sm text-ink/70">{money(l.price)} each</p>
                  </div>
                  <button className="icon-btn h-9 w-9 shrink-0" aria-label={`Remove ${l.name}`} onClick={() => { cart.remove(l.key); toast.info('Removed from cart'); }}><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border-[1.5px] border-ink bg-white">
                    <button aria-label={`Decrease quantity of ${l.name}`} className="p-2" onClick={() => cart.setQty(l.key, l.qty - (l.custom ? 5 : 1))} disabled={l.qty <= (l.min || 1)}><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center font-label font-bold" aria-live="polite">{l.qty}</span>
                    <button aria-label={`Increase quantity of ${l.name}`} className="p-2" onClick={() => cart.setQty(l.key, l.qty + (l.custom ? 5 : 1))} disabled={l.qty >= (l.max || 20)}><Plus className="h-4 w-4" /></button>
                  </div>
                  <p className="font-label text-lg font-bold">{money(l.price * l.qty)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <OrderSummary cart={cart}>
          <Link to="/checkout" className="btn btn-primary w-full">Checkout</Link>
          <Link to="/shop" className="btn btn-ghost btn-sm w-full">Continue shopping</Link>
        </OrderSummary>
      </div>
    </div>
  );
}
