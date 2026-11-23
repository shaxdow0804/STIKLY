import { useState } from 'react';
import { Mail } from 'lucide-react';
import { isEmail } from '../../lib/format';
import { subscribeNewsletter } from '../../services/engagementService';
import { useToast } from '../../context/ToastContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) return setError('Please enter a valid email address, like name@example.com.');
    setError(''); setBusy(true);
    try {
      const r = await subscribeNewsletter(email);
      setDone(true);
      toast.success(r === 'exists' ? 'You are already subscribed. Thanks!' : 'You are on the list!');
    } catch (err) {
      setError(err.message);
      toast.error('Could not subscribe. Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <section className="container-x py-16" aria-labelledby="news-title">
      <div className="card relative overflow-hidden bg-violet p-8 text-white sm:p-14">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-citrus" aria-hidden />
        <div className="relative max-w-xl">
          <Mail className="mb-4 h-8 w-8" aria-hidden />
          <h2 id="news-title" className="text-3xl font-extrabold sm:text-4xl">Stay in the loop</h2>
          <p className="mt-2 text-white/85">New drops and the occasional discount. No spam, unsubscribe any time.</p>
          {done ? (
            <p className="mt-6 rounded-lg border-[1.5px] border-ink bg-mint p-4 font-semibold text-ink" role="status">Thanks for subscribing! Watch your inbox for the next drop.</p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6">
              <label htmlFor="news-email" className="sr-only">Email address</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input id="news-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                  aria-invalid={Boolean(error)} aria-describedby={error ? 'news-err' : undefined} className="input flex-1 text-ink" />
                <button className="btn btn-citrus" disabled={busy}>{busy ? 'Subscribing…' : 'Subscribe'}</button>
              </div>
              {error && <p id="news-err" role="alert" className="mt-2 rounded bg-white px-3 py-1.5 text-sm font-semibold text-coral-dark">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
