import { BadgeCheck, Check, EyeOff, Trash2 } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Rating from '../../components/ui/Rating';
import useAsync from '../../hooks/useAsync';
import { deleteReview, listAllReviews, setReviewStatus } from '../../services/reviewService';
import { useToast } from '../../context/ToastContext';
import { useCatalog } from '../../context/CatalogContext';

export default function AdminReviews() {
  const { data: reviews, loading, error, reload } = useAsync(listAllReviews, []);
  const { products } = useCatalog();
  const toast = useToast();
  const act = async (fn, msg) => { try { await fn(); toast.success(msg); reload(); } catch (ex) { toast.error(ex.message); } };
  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const pName = (r) => r.productName || products.find((p) => p.id === r.productId)?.name || 'General';
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Reviews</h1>
      {reviews.length === 0 ? <div className="mt-6"><EmptyState title="No reviews yet" /></div> : (
        <ul className="mt-6 space-y-3">{reviews.map((r) => (
          <li key={r.id} className="card flex flex-wrap items-start gap-4 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><Rating value={r.rating} /><span className={`chip ${r.status === 'approved' ? 'bg-mint' : r.status === 'pending' ? 'bg-citrus' : 'bg-line'}`}>{r.status}</span>{r.verified && <span className="inline-flex items-center gap-1 text-xs font-bold text-mint"><BadgeCheck className="h-4 w-4" />Verified</span>}</div>
              <p className="mt-1 font-bold">{r.title || 'Untitled'} <span className="font-normal text-ink/60">on {pName(r)} by {r.name}</span></p>
              <p className="text-sm text-ink/75">{r.body}</p>
            </div>
            <div className="flex gap-2">
              {r.status !== 'approved' && <button className="btn btn-mint btn-sm" onClick={() => act(() => setReviewStatus(r.id, 'approved'), 'Review approved')}><Check className="h-4 w-4" /> Approve</button>}
              {r.status === 'approved' && <button className="btn btn-ghost btn-sm" onClick={() => act(() => setReviewStatus(r.id, 'hidden'), 'Review hidden')}><EyeOff className="h-4 w-4" /> Hide</button>}
              <button className="icon-btn h-9 w-9" aria-label="Delete review" onClick={() => window.confirm('Delete this review permanently?') && act(() => deleteReview(r.id), 'Review deleted')}><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>))}</ul>)}
    </div>
  );
}
