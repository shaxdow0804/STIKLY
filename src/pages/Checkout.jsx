import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Banknote, CreditCard, Lock } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import { OrderSummary } from './Cart';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { placeOrder } from '../services/orderService';
import useSeo from '../hooks/useSeo';
import { RAZORPAY_KEY_ID, isSupabaseConfigured } from '../lib/config';
import { isEmail, isPhone, isPin, money, normalizePhone } from '../lib/format';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Chandigarh','Puducherry','Andaman and Nicobar Islands','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep'];

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve();
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = resolve;
  s.onerror = () => reject(new Error('Could not load the payment window. Check your connection.'));
  document.body.appendChild(s);
});

function payWithRazorpay({ amount, customer }) {
  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: RAZORPAY_KEY_ID, amount: Math.round(amount * 100), currency: 'INR', name: 'STIKLY', description: 'Sticker order',
      prefill: { name: customer.name, email: customer.email, contact: customer.phone },
      theme: { color: '#7C3AED' },
      handler: (res) => resolve(res.razorpay_payment_id),
      modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) },
    });
    rz.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed.')));
    rz.open();
  });
}

const EMPTY = { name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' };

export default function Checkout() {
  useSeo('Checkout', 'Secure checkout for your STIKLY order.');
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState(RAZORPAY_KEY_ID ? 'online' : 'cod');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const onlineEnabled = Boolean(RAZORPAY_KEY_ID);

  if (cart.lines.length === 0) {
    return <div className="container-x py-20"><EmptyState title="Nothing to check out" text="Add some stickers to your cart first." action={<Link to="/shop" className="btn btn-primary">Go to shop</Link>} /></div>;
  }

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your full name.';
    if (!isEmail(form.email)) e.email = 'Enter a valid email address.';
    if (!isPhone(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (form.address.trim().length < 6) e.address = 'Enter your full street address.';
    if (form.city.trim().length < 2) e.city = 'Enter your city.';
    if (!form.state) e.state = 'Select your state.';
    if (!isPin(form.pincode)) e.pincode = 'Enter a valid 6-digit PIN code.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setBusy(true);
    const customer = { ...form, name: form.name.trim(), email: form.email.trim(), phone: normalizePhone(form.phone), address: form.address.trim(), city: form.city.trim(), pincode: form.pincode.trim() };
    try {
      let paymentRef = null;
      if (method === 'online') {
        await loadRazorpay();
        paymentRef = await payWithRazorpay({ amount: cart.total, customer });
      }
      const res = await placeOrder({ customer, lines: cart.lines, paymentMethod: method, paymentRef });
      cart.clear();
      navigate(`/order-success/${res.orderNumber}`, { state: { total: res.total, demo: res.demo, method, email: customer.email } });
    } catch (err) {
      toast.error(err.message);
    } finally { setBusy(false); }
  };

  const field = (id, label, props = {}) => (
    <div className={props.span ? 'sm:col-span-2' : ''}>
      <label className="label" htmlFor={id}>{label}</label>
      {props.select ? (
        <select id={id} className="input" value={form[id]} onChange={set(id)} aria-invalid={Boolean(errors[id])} autoComplete="address-level1">
          <option value="">Select state</option>{STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
      ) : (
        <input id={id} className="input" value={form[id]} onChange={set(id)} aria-invalid={Boolean(errors[id])} aria-describedby={errors[id] ? `${id}-e` : undefined} {...props.input} />
      )}
      {errors[id] && <p id={`${id}-e`} className="field-error">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="container-x py-10">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Checkout</h1>
      {!isSupabaseConfigured && (
        <div role="note" className="mt-6 flex gap-3 rounded-lg border-[1.5px] border-ink bg-citrus p-4 text-sm font-semibold">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>DEMO CHECKOUT: orders are saved only in this browser and <u>no payment is taken</u>. Connect Supabase (and a payment provider) to accept real orders.</p>
        </div>
      )}
      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="card p-6" aria-labelledby="ship-h">
            <h2 id="ship-h" className="mb-5 text-xl font-extrabold">Delivery details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('name', 'Full name', { input: { autoComplete: 'name' } })}
              {field('email', 'Email', { input: { type: 'email', autoComplete: 'email' } })}
              {field('phone', 'Phone', { input: { type: 'tel', autoComplete: 'tel', placeholder: '10-digit mobile number' } })}
              {field('address', 'Address', { span: true, input: { autoComplete: 'street-address' } })}
              {field('city', 'City', { input: { autoComplete: 'address-level2' } })}
              {field('state', 'State', { select: true })}
              {field('pincode', 'PIN code', { input: { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' } })}
            </div>
          </section>
          <fieldset className="card p-6">
            <legend className="px-2 text-xl font-extrabold">Payment method</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <label className={`flex gap-3 rounded-lg border-[1.5px] p-4 ${!onlineEnabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${method === 'online' ? 'border-violet bg-violet-soft' : 'border-ink'}`}>
                <input type="radio" name="pay" className="mt-1 accent-violet" checked={method === 'online'} disabled={!onlineEnabled} onChange={() => setMethod('online')} />
                <span><span className="flex items-center gap-2 font-bold"><CreditCard className="h-4 w-4" /> UPI / Card / Netbanking</span>
                  <span className="text-xs text-ink/65">{onlineEnabled ? 'Pay securely via Razorpay (test mode with test keys).' : 'Unavailable until payment provider keys are added.'}</span></span>
              </label>
              <label className={`flex cursor-pointer gap-3 rounded-lg border-[1.5px] p-4 ${method === 'cod' ? 'border-violet bg-violet-soft' : 'border-ink'}`}>
                <input type="radio" name="pay" className="mt-1 accent-violet" checked={method === 'cod'} onChange={() => setMethod('cod')} />
                <span><span className="flex items-center gap-2 font-bold"><Banknote className="h-4 w-4" /> Cash on delivery</span><span className="text-xs text-ink/65">Pay when your stickers arrive.</span></span>
              </label>
            </div>
          </fieldset>
        </div>
        <OrderSummary cart={cart}>
          <ul className="max-h-48 space-y-2 overflow-y-auto border-t border-line pt-3 text-sm">
            {cart.lines.map((l) => <li key={l.key} className="flex justify-between gap-2"><span className="truncate">{l.qty} × {l.name}</span><span className="font-label font-bold">{money(l.price * l.qty)}</span></li>)}
          </ul>
          <button className="btn btn-primary w-full" disabled={busy}><Lock className="h-4 w-4" /> {busy ? 'Placing order…' : method === 'online' ? `Pay ${money(cart.total)}` : 'Place order'}</button>
          <Link to="/cart" className="block text-center text-sm font-semibold text-violet hover:underline">Back to cart</Link>
        </OrderSummary>
      </form>
    </div>
  );
}
