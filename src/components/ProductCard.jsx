import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import Rating from './ui/Rating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { discountPct, money } from '../lib/format';

export default function ProductCard({ product, onQuickView }) {
  const cart = useCart();
  const wish = useWishlist();
  const toast = useToast();
  const off = discountPct(product.price, product.compareAt);
  const liked = wish.has(product.id);
  const soldOut = product.stock <= 0;

  const add = () => {
    cart.addProduct(product, 1);
    toast.success(`${product.name} added to cart`);
  };
  const like = () => {
    const nowLiked = wish.toggle(product.id);
    toast.info(nowLiked ? 'Saved to your wishlist' : 'Removed from wishlist');
  };

  return (
    <article className="group card flex flex-col overflow-hidden transition duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg">
      <div className="relative aspect-square overflow-hidden border-b-[1.5px] border-ink bg-paper2">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" width="600" height="600"
            className="h-full w-full object-cover transition duration-300 group-hover:rotate-2 group-hover:scale-105" />
        </Link>
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && <span className="chip bg-coral">-{off}%</span>}
          {product.isNew && <span className="chip bg-citrus">New</span>}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button onClick={like} aria-pressed={liked} aria-label={liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-ink bg-white shadow-hard-sm transition hover:scale-105">
            <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-coral text-coral' : ''}`} />
          </button>
          {onQuickView && (
            <button onClick={() => onQuickView(product)} aria-label={`Quick view ${product.name}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-ink bg-white shadow-hard-sm transition hover:scale-105 sm:translate-x-14 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:focus-visible:translate-x-0 sm:focus-visible:opacity-100">
              <Eye className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-label text-[11px] font-bold uppercase tracking-widest text-ink/60">{product.categoryName || product.category}</p>
        <h3 className="mt-1 text-lg font-bold leading-snug"><Link to={`/product/${product.slug}`} className="hover:text-violet">{product.name}</Link></h3>
        <div className="mt-1"><Rating value={product.rating} count={product.reviewCount} /></div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-label text-lg font-bold">{money(product.price)}</span>
          {product.compareAt > product.price && <span className="text-sm text-ink/50 line-through">{money(product.compareAt)}</span>}
        </div>
        <button onClick={add} disabled={soldOut} className="btn btn-primary btn-sm mt-4 w-full">
          <ShoppingBag className="h-4 w-4" /> {soldOut ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
