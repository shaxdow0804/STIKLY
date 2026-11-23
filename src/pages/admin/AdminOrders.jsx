import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import useAsync from '../../hooks/useAsync';
import { listOrders, updateOrderStatus } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { formatDate, money } from '../../lib/format';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { data: orders, loading, error, reload } = useAsync(listOrders, []);
  const [open, setOpen] = useState(null);
  const toast = useToast();

  const change = async (o, status) => {
    try { await updateOrderStatus(o.id, status); toast.success(`${o.orderNumber} marked ${status}`); reload(); } catch (ex) { toast.error(ex.message); }
  };
  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Orders</h1>
      {orders.length === 0 ? <div className="mt-6"><EmptyState title="No orders yet" text="Orders will show up here as customers check out." /></div> : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="card">
              <div className="flex flex-wrap items-center gap-3 p-4">
                <button className="flex flex-1 items-center gap-3 text-left" aria-expanded={open === o.id} onClick={() => setOpen(open === o.id ? null : o.id)}>
                  <ChevronDown className={`h-4 w-4 transition ${open === o.id ? 'rotate-180' : ''}`} />
                  <span><span className="font-label font-bold">{o.orderNumber}</span><span className="block text-sm text-ink/60">{o.customerName} · {formatDate(o.createdAt)}</span></span>
                </button>
                <span className="font-label font-bold">{money(o.total)}</span>
                <label className="sr-only" htmlFor={`st-${o.id}`}>Status for {o.orderNumber}</label>
                <select id={`st-${o.id}`} className="input w-auto py-2" value={o.status} onChange={(e) => change(o, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
              </div>
              {open === o.id && (
                <div className="grid gap-4 border-t border-line p-4 text-sm sm:grid-cols-2">
                  <div><p className="label">Ship to</p><p>{o.customerName}<br />{o.address}<br />{o.city}, {o.state} {o.pincode}</p><p className="mt-2">{o.phone}<br />{o.email}</p><p className="mt-2 text-ink/70">Payment: {o.paymentMethod} ({o.paymentStatus})</p></div>
                  <div><p className="label">Items</p><ul className="space-y-1">{o.items.map((i, idx) => <li key={idx} className="flex justify-between"><span>{i.quantity} × {i.name}</span><span>{money(i.unitPrice * i.quantity)}</span></li>)}</ul><p className="mt-2 border-t border-line pt-2">Shipping {money(o.shipping)} · <strong>Total {money(o.total)}</strong></p></div>
                </div>)}
            </li>))}
        </ul>)}
    </div>
  );
}
