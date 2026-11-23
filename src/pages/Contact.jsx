import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, PackageSearch } from 'lucide-react';
import { sendContactMessage } from '../services/engagementService';
import { useToast } from '../context/ToastContext';
import { isEmail } from '../lib/format';
import useSeo from '../hooks/useSeo';

export default function Contact() {
  useSeo('Contact us', 'Questions about an order or a custom design? Message the STIKLY team.');
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2) err.name = 'Please enter your name.';
    if (!isEmail(f.email)) err.email = 'Please enter a valid email address.';
    if (f.message.trim().length < 10) err.message = 'Please write at least 10 characters.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try { await sendContactMessage({ name: f.name.trim(), email: f.email.trim(), message: f.message.trim() }); setSent(true); toast.success('Message sent. We will get back to you soon.'); }
    catch (ex) { toast.error(ex.message); } finally { setBusy(false); }
  };

  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="text-4xl font-extrabold sm:text-5xl">Contact us</h1>
        <p className="mt-2 text-ink/70">Order questions, custom designs, wholesale: say hello.</p>
        {sent ? <p className="card mt-8 bg-mint p-6 font-semibold" role="status">Thanks {f.name.split(' ')[0]}! Your message is on its way to the team.</p> : (
          <form onSubmit={submit} noValidate className="card mt-8 space-y-4 p-6">
            <div><label className="label" htmlFor="c-name">Name</label><input id="c-name" className="input" value={f.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} />{errors.name && <p className="field-error">{errors.name}</p>}</div>
            <div><label className="label" htmlFor="c-email">Email</label><input id="c-email" type="email" className="input" value={f.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} />{errors.email && <p className="field-error">{errors.email}</p>}</div>
            <div><label className="label" htmlFor="c-msg">Message</label><textarea id="c-msg" rows={5} className="input" value={f.message} onChange={set('message')} aria-invalid={Boolean(errors.message)} />{errors.message && <p className="field-error">{errors.message}</p>}</div>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
          </form>
        )}
      </div>
      <aside className="space-y-4 lg:pt-24">
        <div className="card p-5"><Mail className="mb-2 h-5 w-5 text-violet" /><h2 className="font-bold">Email</h2><a className="text-violet hover:underline" href="mailto:hello@stikly.in">hello@stikly.in</a></div>
        <div className="card p-5"><PackageSearch className="mb-2 h-5 w-5 text-violet" /><h2 className="font-bold">Where is my order?</h2><Link className="text-violet hover:underline" to="/track-order">Track it here</Link></div>
      </aside>
    </div>
  );
}
