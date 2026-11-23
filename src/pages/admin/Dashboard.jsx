import { Link } from 'react-router-dom';
import { IndianRupee, Package, ShoppingCart, Clock } from 'lucide-react';
import useAsync from '../../hooks/useAsync';
import { listOrders } from '../../services/orderService';
import { listAllProducts } from '../../services/productService';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import { formatDate, money } from '../../lib/format';
import useSeo from '../../hooks/useSeo';

export default function Dashboard() {
  useSeo('Admin overview');
  const { data, loading, error, reload } = useAsync(async () => {
    const [orders, products] = await Promise.all([listOrders(), listAllProducts()]);
    return { orders, products };
  }, []);
  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const { orders, products } = data;
  const counted = orders.filter((o) => o.status !== 'cancelled');
  const revenue = counted.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === 'pending').length;
  const low = products.filter((p) => p.stock <= 10);
  const stats = [
    { label: 'Total orders', value: orders.length, icon: ShoppingCart, c: 'bg-violet text-white' },
    { label: 'Total products', value: products.length, icon: Package, c: 'bg-coral' },
    { label: 'Revenue (excl. cancelled)', value: money(revenue), icon: IndianRupee, c: 'bg-mint' },
    { label: 'Pending orders', value: pending, icon: Clock, c: 'bg-citrus' },
  ];
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, c }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-ink ${c}`}><Icon className="h-5 w-5" /></span>
            <div><p className="text-sm text-ink/65">{label}</p><p className="font-label text-2xl font-bold">{value}</p></div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between p-5"><h2 className="text-xl font-extrabold">Recent orders</h2><Link to="/admin/orders" className="text-sm font-bold text-violet">View all</Link></div>
          {orders.length === 0 ? <p className="px-5 pb-6 text-ink/60">No orders yet.</p> : (
            <div className="overflow-x-auto"><table className="w-full"><thead className="bg-paper2"><tr><th className="th">Order</th><th className="th">Date</th><th className="th">Status</th><th className="th text-right">Total</th></tr></thead>
              <tbody>{orders.slice(0, 6).map((o) => <tr key={o.id} className="border-t border-line"><td className="td font-label font-bold">{o.orderNumber}</td><td className="td">{formatDate(o.createdAt)}</td><td className="td capitalize">{o.status}</td><td className="td text-right">{money(o.total)}</td></tr>)}</tbody></table></div>
          )}
        </section>
        <section className="card p-5">
          <h2 className="text-xl font-extrabold">Low stock (10 or fewer)</h2>
          {low.length === 0 ? <p className="mt-3 text-ink/60">All products are well stocked.</p> : <ul className="mt-3 divide-y divide-line">{low.map((p) => <li key={p.id} className="flex justify-between py-2 text-sm"><span>{p.name}</span><span className="font-label font-bold">{p.stock} left</span></li>)}</ul>}
        </section>
      </div>
    </div>
  );
}
