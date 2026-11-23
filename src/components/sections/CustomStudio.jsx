import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import { CUSTOM_MAX_QTY, CUSTOM_MIN_QTY, STICKER_TYPES } from '../../lib/config';
import { customUnitPrice } from '../../lib/pricing';
import { downscaleImage, money } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const MAX_FILE = 5 * 1024 * 1024;

function Preview({ image, text, type }) {
  const holo = type === 'holo';
  const clear = type === 'clear';
  return (
    <div className={`relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-lg border-[1.5px] border-ink p-6 ${clear ? 'bg-[conic-gradient(#e7e2d8_25%,#fff_0_50%,#e7e2d8_0_75%,#fff_0)] bg-[length:24px_24px]' : 'bg-paper2'}`}>
      <div className={`relative flex max-h-full max-w-full -rotate-3 flex-col items-center gap-2 rounded-[28px] border-[6px] border-white bg-white p-3 shadow-[0_0_0_1.5px_#18181B,6px_6px_0_#18181B] ${clear ? 'bg-white/60' : ''}`}>
        {image && <img src={image} alt="Your uploaded artwork" className={`max-h-56 rounded-2xl object-contain ${type === 'matte' ? 'saturate-[.75]' : ''}`} />}
        {text && <p className="max-w-[16rem] break-words text-center font-display text-2xl font-extrabold leading-tight">{text}</p>}
        {!image && !text && <p className="px-6 py-16 text-center text-ink/50">Your sticker preview appears here</p>}
        {holo && <span className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(115deg,rgba(255,0,150,.25),rgba(0,200,255,.25),rgba(255,230,0,.25))] mix-blend-multiply" aria-hidden />}
        {type !== 'matte' && <span className="pointer-events-none absolute left-3 top-2 h-4 w-14 -rotate-12 rounded-full bg-white/70 blur-[2px]" aria-hidden />}
      </div>
    </div>
  );
}

export default function CustomStudio({ standalone = false }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [type, setType] = useState('vinyl');
  const [qty, setQty] = useState(10);
  const [errors, setErrors] = useState({});
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const cart = useCart();
  const toast = useToast();

  const unit = customUnitPrice(type, qty);
  const typeInfo = STICKER_TYPES.find((t) => t.id === type);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setErrors((x) => ({ ...x, image: 'Please choose an image file (PNG, JPG, WebP).' }));
    if (file.size > MAX_FILE) return setErrors((x) => ({ ...x, image: 'That image is over 5 MB. Please choose a smaller one.' }));
    setBusy(true);
    try {
      setImage(await downscaleImage(file));
      setErrors((x) => ({ ...x, image: undefined, art: undefined }));
    } catch (err) { setErrors((x) => ({ ...x, image: err.message })); } finally { setBusy(false); }
  };

  const clampQty = (n) => setQty(Math.max(CUSTOM_MIN_QTY, Math.min(CUSTOM_MAX_QTY, Number.isFinite(n) ? n : CUSTOM_MIN_QTY)));

  const add = () => {
    if (!image && !text.trim()) return setErrors((x) => ({ ...x, art: 'Upload an image or enter some text for your sticker.' }));
    cart.addCustom({ type, typeName: typeInfo.name, text: text.trim(), imageData: image, qty });
    setAdded(true);
    toast.success('Custom stickers added to your cart');
  };

  return (
    <section id="custom" className={standalone ? 'container-x py-12' : 'border-y-[1.5px] border-ink bg-paper2'}>
      <div className={standalone ? '' : 'container-x py-16'}>
        <SectionHeading eyebrow="Custom Sticker Studio" title="Make it yours" text={`Upload your art, add text, pick a finish. Minimum ${CUSTOM_MIN_QTY} stickers. We review every design before printing.`} />
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <Preview image={image} text={text} type={type} />
          <div className="card space-y-6 p-6">
            <div>
              <span className="label">1. Your artwork</span>
              <input ref={fileRef} id="cs-file" type="file" accept="image/*" className="sr-only" onChange={onFile} />
              <div className="flex flex-wrap gap-3">
                <label htmlFor="cs-file" className="btn btn-ghost btn-sm cursor-pointer"><ImagePlus className="h-4 w-4" /> {busy ? 'Processing…' : image ? 'Change image' : 'Upload image'}</label>
                {image && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = ''; }}><Trash2 className="h-4 w-4" /> Remove</button>}
              </div>
              {errors.image && <p className="field-error" role="alert">{errors.image}</p>}
            </div>
            <div>
              <label className="label" htmlFor="cs-text">2. Sticker text (optional)</label>
              <input id="cs-text" className="input" maxLength={40} value={text} onChange={(e) => { setText(e.target.value); setErrors((x) => ({ ...x, art: undefined })); }} placeholder="e.g. Chai > Coffee" />
              <p className="mt-1 text-xs text-ink/60">{text.length}/40</p>
            </div>
            {errors.art && <p className="field-error" role="alert">{errors.art}</p>}
            <fieldset>
              <legend className="label">3. Sticker type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {STICKER_TYPES.map((t) => (
                  <label key={t.id} className={`cursor-pointer rounded-lg border-[1.5px] p-3 transition ${type === t.id ? 'border-violet bg-violet-soft shadow-violet' : 'border-ink bg-paper hover:bg-white'}`}>
                    <input type="radio" name="cs-type" className="sr-only" checked={type === t.id} onChange={() => setType(t.id)} />
                    <span className="flex justify-between font-bold">{t.name}<span className="font-label text-sm">{money(t.base)}</span></span>
                    <span className="text-xs text-ink/65">{t.note}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <span className="label" id="cs-qty-l">4. Quantity</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border-[1.5px] border-ink bg-white">
                  <button type="button" aria-label="Decrease quantity" className="p-2.5" onClick={() => clampQty(qty - 5)} disabled={qty <= CUSTOM_MIN_QTY}><Minus className="h-4 w-4" /></button>
                  <input aria-labelledby="cs-qty-l" inputMode="numeric" className="w-16 bg-transparent text-center font-label font-bold focus:outline-none" value={qty} onChange={(e) => setQty(Number(e.target.value.replace(/\D/g, '')) || 0)} onBlur={() => clampQty(qty)} />
                  <button type="button" aria-label="Increase quantity" className="p-2.5" onClick={() => clampQty(qty + 5)} disabled={qty >= CUSTOM_MAX_QTY}><Plus className="h-4 w-4" /></button>
                </div>
                <p className="text-sm text-ink/70">10% off at 20+, 20% off at 50+</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <div>
                <p className="font-label text-2xl font-bold">{money(unit * qty)}</p>
                <p className="text-sm text-ink/60">{money(unit)} per sticker × {qty}</p>
              </div>
              <button className="btn btn-primary" onClick={add}><ShoppingBag className="h-4 w-4" /> Add to cart</button>
            </div>
            {added && <p className="rounded-lg border-[1.5px] border-ink bg-mint p-3 text-sm font-semibold" role="status">Added! <Link to="/cart" className="underline">View cart</Link></p>}
          </div>
        </div>
      </div>
    </section>
  );
}
