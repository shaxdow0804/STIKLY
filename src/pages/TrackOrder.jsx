import { useState } from 'react';
import { Check, PackageSearch } from 'lucide-react';
import { trackOrder } from '../services/orderService';
import { isEmail, formatDate, money } from '../lib/format';
import useSeo from '../hooks/useSeo';

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function TrackOrder() {
  useSeo('Track your order', 'Check the status of your STIKLY order.');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [result, setResult] = useState(undefined);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!number.trim()) return setErr('Enter your order number, e.g. STK-2611-AB12CD.');
    if (!isEmail(email)) return setErr('Enter the email you used at checkout.');
    setErr(''); setBusy(true);
    try { setResult(await trackOrder(number, email)); } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  const step = result ? STEPS.indexOf(result.status) : -1;
  return (
    <div className="container-x max-w-2xl py-12">
      <h1 className="text-4xl font-extrabold">Track your order</h1>
      <form onSubmit={submit} noValidate className="card mt-8 space-y-4 p-6">
        <div><label className="label" htmlFor="t-num">Order number</label><input id="t-num" className="input" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="STK-2611-AB12CD" /></div>
        <div><label className="label" htmlFor="t-mail">Email</label><input id="t-mail" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {err && <p className="field-error" role="alert">{err}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Looking…' : 'Track order'}</button>
      </form>
      {result === null && <p className="mt-6 flex items-center gap-2 rounded-lg border-[1.5px] border-ink bg-white p-4"><PackageSearch className="h-5 w-5" /> We could not find an order with those details. Check the number and email.</p>}
      {result && (
        <div className="card mt-6 p-6">
          <p className="font-label text-sm font-bold uppercase tracking-wider text-ink/60">{result.order_number} · {formatDate(result.created_at)}</p>
          {result.status === 'cancelled' ? <p className="mt-3 text-lg font-bold text-coral-dark">This order was cancelled.</p> : (
            <ol className="mt-5 grid grid-cols-4 gap-2 text-center text-xs font-bold uppercase tracking-wider">
              {STEPS.map((s, i) => (
                <li key={s} className="flex flex-col items-center gap-2">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ink ${i <= step ? 'bg-mint' : 'bg-paper'}`}>{i <= step ? <Check className="h-4 w-4" /> : i + 1}</span>{s}
                </li>
              ))}
            </ol>
          )}
          <ul className="mt-6 divide-y divide-line text-sm">{result.items.map((i, idx) => <li key={idx} className="flex justify-between py-2"><span>{i.name}</span><span>× {i.quantity}</span></li>)}</ul>
          <p className="mt-3 text-right font-label font-bold">Total {money(result.total)}</p>
        </div>
      )}
    </div>
  );
}
