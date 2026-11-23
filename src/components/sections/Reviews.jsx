import { useState } from 'react';
import { BadgeCheck, MessageSquarePlus } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Rating, { StarPicker } from '../ui/Rating';
import { Skeleton } from '../ui/Skeleton';
import useAsync from '../../hooks/useAsync';
import { listReviews, submitReview } from '../../services/reviewService';
import { useCatalog } from '../../context/CatalogContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/format';

export function ReviewCard({ r }) {
  return (
    <article className="card flex h-full flex-col p-6">
      <Rating value={r.rating} />
      {r.title && <h3 className="mt-3 text-lg font-bold">{r.title}</h3>}
      <p className="mt-2 flex-1 text-ink/75">{r.body}</p>
      <footer className="mt-4 flex items-center gap-3 border-t border-line pt-4">
        {r.avatar ? <img src={r.avatar} alt="" className="h-10 w-10 rounded-full border border-ink object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink bg-citrus font-bold">{r.name[0]}</span>}
        <div className="text-sm">
          <p className="font-bold">{r.name}</p>
          <p className="text-ink/60">{formatDate(r.createdAt)}</p>
        </div>
        {r.verified && <span className="ml-auto inline-flex items-center gap-1 font-label text-[11px] font-bold uppercase tracking-wider text-mint"><BadgeCheck className="h-4 w-4" /> Verified purchase</span>}
      </footer>
    </article>
  );
}

/** Review form. Pass productId to lock it to one product, or omit to let the customer pick. */
export function ReviewForm({ productId, onDone }) {
  const { products } = useCatalog();
  const { user, profile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: profile?.full_name || '', rating: 0, title: '', body: '', productId: productId || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (form.name.trim().length < 2) err.name = 'Please enter your name.';
    if (!form.rating) err.rating = 'Choose a star rating.';
    if (form.body.trim().length < 10) err.body = 'Tell us a bit more (at least 10 characters).';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      await submitReview({ ...form, name: form.name.trim(), body: form.body.trim(), productId: form.productId || null });
      toast.success('Thanks! Your review will appear once it is approved.');
      setForm((f) => ({ ...f, rating: 0, title: '', body: '' }));
      onDone?.();
    } catch (ex) { toast.error(ex.message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-6">
      <h3 className="flex items-center gap-2 text-xl font-bold"><MessageSquarePlus className="h-5 w-5 text-violet" /> Write a review</h3>
      {!productId && (
        <div>
          <label className="label" htmlFor="rv-product">Product (optional)</label>
          <select id="rv-product" className="input" value={form.productId} onChange={set('productId')}>
            <option value="">General store review</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="label" htmlFor="rv-name">Your name</label>
        <input id="rv-name" className="input" value={form.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} autoComplete="name" />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>
      <div>
        <span className="label" id="rv-rating-l">Rating</span>
        <StarPicker value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
        {errors.rating && <p className="field-error">{errors.rating}</p>}
      </div>
      <div>
        <label className="label" htmlFor="rv-title">Headline (optional)</label>
        <input id="rv-title" className="input" value={form.title} onChange={set('title')} maxLength={80} />
      </div>
      <div>
        <label className="label" htmlFor="rv-body">Your review</label>
        <textarea id="rv-body" rows={4} className="input" value={form.body} onChange={set('body')} maxLength={1000} aria-invalid={Boolean(errors.body)} />
        {errors.body && <p className="field-error">{errors.body}</p>}
      </div>
      <p className="text-xs text-ink/60">
        {user ? 'Reviews from customers who bought the product get a “Verified purchase” badge. ' : 'Sign in before reviewing to qualify for a “Verified purchase” badge. '}
        All reviews are moderated.
      </p>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Submit review'}</button>
    </form>
  );
}

export default function Reviews() {
  const { data, loading } = useAsync(() => listReviews(), []);
  const reviews = (data || []).slice(0, 6);
  return (
    <section className="container-x py-16" aria-labelledby="rev-title">
      <div id="rev-title"><SectionHeading eyebrow="Reviews" title="Love that sticks" text="What customers say about their stickers." /></div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)
            : reviews.length ? reviews.map((r) => <ReviewCard key={r.id} r={r} />)
            : <p className="card col-span-full p-8 text-center text-ink/70">No reviews yet. Be the first to share yours!</p>}
        </div>
        <ReviewForm />
      </div>
    </section>
  );
}
