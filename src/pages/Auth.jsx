import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isEmail } from '../lib/format';
import useSeo from '../hooks/useSeo';

export default function Auth({ mode }) {
  const register = mode === 'register';
  useSeo(register ? 'Create account' : 'Sign in');
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/account';
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (auth.user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (register && f.name.trim().length < 2) err.name = 'Please enter your name.';
    if (!isEmail(f.email)) err.email = 'Enter a valid email address.';
    if (f.password.length < 8) err.password = 'Password must be at least 8 characters.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      if (register) {
        const { needsConfirmation } = await auth.signUp(f.email.trim(), f.password, f.name.trim());
        if (needsConfirmation) { toast.success('Account created. Check your email to confirm it, then sign in.'); navigate('/login'); }
        else toast.success('Welcome to STIKLY!');
      } else {
        await auth.signIn(f.email.trim(), f.password);
        toast.success('Signed in');
      }
    } catch (ex) { toast.error(ex.message); } finally { setBusy(false); }
  };

  return (
    <div className="container-x max-w-md py-14">
      <h1 className="text-4xl font-extrabold">{register ? 'Create account' : 'Welcome back'}</h1>
      {!auth.configured && (
        <p className="mt-4 flex gap-2 rounded-lg border-[1.5px] border-ink bg-citrus p-3 text-sm font-semibold"><AlertTriangle className="h-5 w-5 shrink-0" /> Accounts need Supabase credentials. Add them to <code>.env</code> (see README). Shopping and checkout still work as a guest.</p>
      )}
      <form onSubmit={submit} noValidate className="card mt-6 space-y-4 p-6">
        {register && <div><label className="label" htmlFor="a-name">Full name</label><input id="a-name" className="input" value={f.name} onChange={set('name')} autoComplete="name" />{errors.name && <p className="field-error">{errors.name}</p>}</div>}
        <div><label className="label" htmlFor="a-email">Email</label><input id="a-email" type="email" className="input" value={f.email} onChange={set('email')} autoComplete="email" />{errors.email && <p className="field-error">{errors.email}</p>}</div>
        <div><label className="label" htmlFor="a-pass">Password</label><input id="a-pass" type="password" className="input" value={f.password} onChange={set('password')} autoComplete={register ? 'new-password' : 'current-password'} />{errors.password && <p className="field-error">{errors.password}</p>}</div>
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
      </form>
      <p className="mt-4 text-center text-sm">{register ? <>Already have an account? <Link to="/login" className="font-bold text-violet underline">Sign in</Link></> : <>New here? <Link to="/register" className="font-bold text-violet underline">Create an account</Link></>}</p>
    </div>
  );
}
