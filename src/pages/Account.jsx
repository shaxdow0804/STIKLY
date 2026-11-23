import { Link } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useAsync from '../hooks/useAsync';
import { listMyOrders } from '../services/orderService';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { formatDate, money } from '../lib/format';
import useSeo from '../hooks/useSeo';

export default function Account() {
  useSeo('My account');
  const { user, profile, isAdmin, signOut } = useAuth();
  const toast = useToast();
  const { data: orders, loading, error, reload } = useAsync(listMyOrders, []);
  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-4xl font-extrabold">Hi, {profile?.full_name || user?.email}</h1><p className="text-ink/70">{user?.email}</p></div>
        <div className="flex gap-3">
          {isAdmin && <Link to="/admin" className="btn btn-citrus btn-sm"><ShieldCheck className="h-4 w-4" /> Admin</Link>}
          <button className="btn btn-ghost btn-sm" onClick={async () => { await signOut(); toast.info('Signed out'); }}><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </div>
      <h2 className="mb-4 mt-10 text-2xl font-extrabold">Your orders</h2>
      {loading ? <Spinner /> : error ? <ErrorState error={error} onRetry={reload} /> : !orders.length ? (
        <EmptyState title="No orders yet" text="When you order, it will show up here." action={<Link to="/shop" className="btn btn-primary">Shop stickers</Link>} />
      ) : (
        <ul className="space-y-4">{orders.map((o) => (
          <li key={o.id} className="card p-5">
            <div className="flex flex-wrap justify-between gap-2"><p className="font-label font-bold">{o.orderNumber}</p><span className="chip bg-citrus">{o.status}</span></div>
            <p className="text-sm text-ink/60">{formatDate(o.createdAt)} · {money(o.total)}</p>
            <p className="mt-2 text-sm">{o.items.map((i) => `${i.quantity} × ${i.name}`).join(', ')}</p>
          </li>))}</ul>
      )}
    </div>
  );
}
