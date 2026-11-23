import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import useAsync from '../../hooks/useAsync';
import { listCustomRequests, updateCustomRequestStatus } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/format';

const STATUSES = ['new', 'in_review', 'approved', 'printed'];

export default function AdminCustom() {
  const { data, loading, error, reload } = useAsync(listCustomRequests, []);
  const toast = useToast();
  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Custom sticker requests</h1>
      {data.length === 0 ? <div className="mt-6"><EmptyState title="No custom requests yet" /></div> : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">{data.map((r) => (
          <li key={r.id} className="card flex gap-4 p-4">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg border-[1.5px] border-ink bg-paper2">{r.imageUrl ? <a href={r.imageUrl} target="_blank" rel="noreferrer"><img src={r.imageUrl} alt="Customer artwork" className="h-full w-full object-contain" /></a> : <span className="flex h-full items-center justify-center p-2 text-center text-xs text-ink/50">Text only</span>}</div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-label font-bold">{r.orderNumber}</p><p>{r.customer} · {r.email}</p>
              <p className="mt-1">{r.quantity} × {r.type}{r.text && <> · “{r.text}”</>}</p><p className="text-ink/60">{formatDate(r.createdAt)}</p>
              {supabase ? (<><label className="sr-only" htmlFor={`cr-${r.id}`}>Status</label><select id={`cr-${r.id}`} className="input mt-2 py-1.5" value={r.status} onChange={async (e) => { try { await updateCustomRequestStatus(r.id, e.target.value); toast.success('Status updated'); reload(); } catch (ex) { toast.error(ex.message); } }}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></>) : <p className="mt-2 text-xs text-ink/50">Status tracking needs Supabase.</p>}
            </div>
          </li>))}</ul>)}
    </div>
  );
}
