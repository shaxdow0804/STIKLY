import { Link, useLocation, useParams } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import useSeo from '../hooks/useSeo';
import { money } from '../lib/format';

export default function OrderSuccess() {
  useSeo('Order placed');
  const { orderNumber } = useParams();
  const { state } = useLocation();
  return (
    <div className="container-x py-20">
      <div className="card mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-ink bg-mint shadow-hard"><PartyPopper className="h-7 w-7" /></span>
        <h1 className="text-3xl font-extrabold">Order placed!</h1>
        <p className="mt-2 text-ink/75">Your order number is</p>
        <p className="my-2 font-label text-2xl font-bold tracking-wider">{orderNumber}</p>
        {state?.total != null && <p className="text-ink/75">Total: <strong>{money(state.total)}</strong> · {state.method === 'cod' ? 'Pay on delivery' : 'Paid online'}</p>}
        {state?.demo && <p className="mt-4 rounded-lg border-[1.5px] border-ink bg-citrus p-3 text-sm font-semibold">This was a demo order saved only in your browser. No payment was taken and nothing will be shipped.</p>}
        <p className="mt-4 text-sm text-ink/65">Keep this number{state?.email ? <> and the email <strong>{state.email}</strong></> : ''} to track your order.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/track-order" className="btn btn-primary">Track order</Link>
          <Link to="/shop" className="btn btn-ghost">Keep shopping</Link>
        </div>
      </div>
    </div>
  );
}
