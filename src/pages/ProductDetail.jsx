import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Heart, Minus, PackageSearch, Plus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import Rating from '../components/ui/Rating';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ProductSection from '../components/sections/ProductSection';
import { ReviewCard, ReviewForm } from '../components/sections/Reviews';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import useAsync from '../hooks/useAsync';
import useSeo from '../hooks/useSeo';
import { listReviews } from '../services/reviewService';
import { discountPct, money } from '../lib/format';
import { MAX_QTY, SHIPPING } from '../lib/config';

export default function ProductDetail() {
  const { slug } = useParams();
  const { products, loading } = useCatalog();
  const product = products.find((p) => p.slug === slug);
  const [qty, setQty] = useState(1);
  const cart = useCart();
  const wish = useWishlist();
  const toast = useToast();
  useSeo(product?.name || 'Sticker', product?.description?.slice(0, 155));
  useEffect(() => setQty(1), [slug]);

  const { data: reviews, loading: rLoading, reload } = useAsync(() => (product ? listReviews({ productId: product.id }) : Promise.resolve([])), [product?.id]);
  const related = useMemo(() => products.filter((p) => product && p.id !== product.id && p.category === product.category).slice(0, 4), [products, product]);

  if (loading) return <Spinner />;
  if (!product) {
    return <div className="container-x py-20"><EmptyState icon={PackageSearch} title="Sticker not found" text="That design may have been removed or the link is wrong." action={<Link to="/shop" className="btn btn-primary">Back to shop</Link>} /></div>;
  }

  const off = discountPct(product.price, product.compareAt);
  const cap = Math.min(MAX_QTY, product.stock);
  const liked = wish.has(product.id);

  return (
    <>
      <div className="container-x py-10">
        <nav aria-label="Breadcrumb" className="mb-6 font-label text-xs font-bold uppercase tracking-wider text-ink/60">
          <Link to="/" className="hover:text-violet">Home</Link> / <Link to="/shop" className="hover:text-violet">Shop</Link> / <Link to={`/shop?category=${product.category}`} className="hover:text-violet">{product.categoryName}</Link>
        </nav>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="card relative overflow-hidden">
            <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
            {off > 0 && <span className="chip absolute left-4 top-4 bg-coral">-{off}%</span>}
          </div>
          <div>
            <p className="eyebrow">{product.categoryName}</p>
            <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">{product.name}</h1>
            <div className="mt-3"><Rating value={product.rating} count={product.reviewCount} size={18} /></div>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-label text-3xl font-bold">{money(product.price)}</span>
              {off > 0 && <span className="text-lg text-ink/50 line-through">{money(product.compareAt)}</span>}
            </div>
            <p className="mt-5 text-lg text-ink/75">{product.description}</p>
            <table className="mt-6 w-full max-w-md border-[1.5px] border-ink text-sm">
              <tbody>
                {[['Finish', product.finish], ['Size / pack', product.size], ['Material', 'Waterproof vinyl'], ['Availability', product.stock > 0 ? (product.stock <= 10 ? `Only ${product.stock} left` : 'In stock') : 'Sold out']].map(([k, v]) => (
                  <tr key={k} className="border-b border-line last:border-0"><th scope="row" className="th w-40 bg-paper2">{k}</th><td className="td">{v}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border-[1.5px] border-ink bg-white">
                <button aria-label="Decrease quantity" className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-label font-bold" aria-live="polite">{qty}</span>
                <button aria-label="Increase quantity" className="p-3" onClick={() => setQty((q) => Math.min(cap, q + 1))}><Plus className="h-4 w-4" /></button>
              </div>
              <button className="btn btn-primary flex-1 sm:flex-none" disabled={cap <= 0} onClick={() => { cart.addProduct(product, qty); toast.success(`${qty} × ${product.name} added to cart`); }}>
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </button>
              <button className="btn btn-ghost" aria-pressed={liked} onClick={() => toast.info(wish.toggle(product.id) ? 'Saved to your wishlist' : 'Removed from wishlist')}>
                <Heart className={`h-4 w-4 ${liked ? 'fill-coral text-coral' : ''}`} /> {liked ? 'Saved' : 'Wishlist'}
              </button>
            </div>
            <ul className="mt-8 space-y-2 text-sm text-ink/75">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-violet" /> Free shipping over ₹{SHIPPING.freeAbove}</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-violet" /> 7-day replacement if it arrives damaged</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-violet" /> Waterproof, scratch-resistant vinyl</li>
            </ul>
          </div>
        </div>

        <section className="mt-16 grid gap-8 lg:grid-cols-3" aria-labelledby="rv">
          <div className="lg:col-span-2">
            <h2 id="rv" className="mb-6 text-2xl font-extrabold">Reviews</h2>
            {rLoading ? <Spinner /> : reviews?.length ? <div className="grid gap-6 sm:grid-cols-2">{reviews.map((r) => <ReviewCard key={r.id} r={r} />)}</div>
              : <p className="card p-8 text-center text-ink/70">No reviews for this sticker yet. Be the first!</p>}
          </div>
          <ReviewForm productId={product.id} onDone={reload} />
        </section>
      </div>
      {related.length > 0 && <ProductSection bg="bg-paper2 border-t-[1.5px] border-ink" eyebrow="You may also like" title="More from this collection" products={related} />}
    </>
  );
}
