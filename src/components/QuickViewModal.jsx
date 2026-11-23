import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import Modal from './ui/Modal';
import Rating from './ui/Rating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { discountPct, money } from '../lib/format';
import { MAX_QTY } from '../lib/config';

export default function QuickViewModal({ product, onClose }) {
  const [qty, setQty] = useState(1);
  const cart = useCart();
  const wish = useWishlist();
  const toast = useToast();
  useEffect(() => setQty(1), [product?.id]);
  if (!product) return null;

  const off = discountPct(product.price, product.compareAt);
  const cap = Math.min(MAX_QTY, product.stock || 0);
  const liked = wish.has(product.id);

  return (
    <Modal open onClose={onClose} title={`Quick view: ${product.name}`} wide>
      <div className="grid gap-6 sm:grid-cols-2">
        <img src={product.image} alt={product.name} className="aspect-square w-full rounded-lg border-[1.5px] border-ink object-cover shadow-hard" />
        <div className="flex flex-col">
          <p className="eyebrow">{product.categoryName}</p>
          <h2 className="mt-1 pr-10 text-2xl font-extrabold">{product.name}</h2>
          <div className="mt-2"><Rating value={product.rating} count={product.reviewCount} /></div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-label text-2xl font-bold">{money(product.price)}</span>
            {off > 0 && <><span className="text-ink/50 line-through">{money(product.compareAt)}</span><span className="chip bg-coral">-{off}%</span></>}
          </div>
          <p className="mt-4 text-ink/75">{product.description}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="label">Finish</dt><dd>{product.finish}</dd></div>
            <div><dt className="label">Size</dt><dd>{product.size}</dd></div>
          </dl>
          <div className="mt-auto pt-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center rounded-full border-[1.5px] border-ink bg-white">
                <button aria-label="Decrease quantity" className="p-2.5" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-label font-bold" aria-live="polite">{qty}</span>
                <button aria-label="Increase quantity" className="p-2.5" onClick={() => setQty((q) => Math.min(cap, q + 1))}><Plus className="h-4 w-4" /></button>
              </div>
              <button aria-pressed={liked} aria-label="Toggle wishlist" className="icon-btn border-ink bg-white" onClick={() => toast.info(wish.toggle(product.id) ? 'Saved to your wishlist' : 'Removed from wishlist')}>
                <Heart className={liked ? 'fill-coral text-coral' : ''} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary flex-1" disabled={cap <= 0} onClick={() => { cart.addProduct(product, qty); toast.success(`${product.name} added to cart`); onClose(); }}>
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </button>
              <Link to={`/product/${product.slug}`} onClick={onClose} className="btn btn-ghost">Full details</Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
