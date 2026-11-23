import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import useAsync from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { useCatalog } from '../../context/CatalogContext';
import { deleteProduct, listAllProducts, saveProduct, uploadProductImage } from '../../services/productService';
import { money } from '../../lib/format';

const blank = { name: '', categoryId: '', price: '', compareAt: '', stock: 50, description: '', image: '', finish: 'Glossy vinyl', size: '3 in (7.6 cm)', tags: [], isActive: true, isBestseller: false, isNew: true };

function ProductForm({ initial, categories, onSaved, onCancel }) {
  const toast = useToast();
  const [f, setF] = useState({ ...blank, ...initial, compareAt: initial?.compareAt ?? '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setF((x) => ({ ...x, image: '' })); const url = await uploadProductImage(file); setF((x) => ({ ...x, image: url })); } catch (ex) { toast.error(ex.message); }
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2) err.name = 'Name is required.';
    if (!f.categoryId) err.categoryId = 'Choose a category.';
    if (!(Number(f.price) > 0)) err.price = 'Enter a price above 0.';
    if (f.compareAt !== '' && Number(f.compareAt) <= Number(f.price)) err.compareAt = 'Original price must be higher than the price (or leave empty).';
    if (!(Number(f.stock) >= 0) || !Number.isInteger(Number(f.stock))) err.stock = 'Stock must be a whole number.';
    if (!f.image) err.image = 'Upload a product image.';
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      await saveProduct({ ...f, name: f.name.trim(), price: Number(f.price), compareAt: f.compareAt === '' ? null : Number(f.compareAt), stock: Number(f.stock), tags: typeof f.tags === 'string' ? f.tags.split(',').map((t) => t.trim()).filter(Boolean) : f.tags });
      toast.success(initial?.id ? 'Product updated' : 'Product created');
      onSaved();
    } catch (ex) { toast.error(ex.message); } finally { setBusy(false); }
  };

  const Err = ({ k }) => (errors[k] ? <p className="field-error">{errors[k]}</p> : null);
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <h2 className="pr-10 text-2xl font-extrabold">{initial?.id ? 'Edit product' : 'Add product'}</h2>
      <div><label className="label" htmlFor="pf-name">Name</label><input id="pf-name" className="input" value={f.name} onChange={set('name')} /><Err k="name" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="pf-cat">Category</label><select id="pf-cat" className="input" value={f.categoryId} onChange={set('categoryId')}><option value="">Select…</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><Err k="categoryId" /></div>
        <div><label className="label" htmlFor="pf-stock">Stock</label><input id="pf-stock" type="number" min="0" className="input" value={f.stock} onChange={set('stock')} /><Err k="stock" /></div>
        <div><label className="label" htmlFor="pf-price">Price (₹)</label><input id="pf-price" type="number" min="0" step="1" className="input" value={f.price} onChange={set('price')} /><Err k="price" /></div>
        <div><label className="label" htmlFor="pf-cmp">Original price (₹, optional)</label><input id="pf-cmp" type="number" min="0" className="input" value={f.compareAt} onChange={set('compareAt')} /><Err k="compareAt" /></div>
        <div><label className="label" htmlFor="pf-fin">Finish</label><input id="pf-fin" className="input" value={f.finish || ''} onChange={set('finish')} /></div>
        <div><label className="label" htmlFor="pf-size">Size / pack</label><input id="pf-size" className="input" value={f.size || ''} onChange={set('size')} /></div>
      </div>
      <div><label className="label" htmlFor="pf-desc">Description</label><textarea id="pf-desc" rows={3} className="input" value={f.description} onChange={set('description')} /></div>
      <div><label className="label" htmlFor="pf-tags">Tags (comma separated)</label><input id="pf-tags" className="input" value={Array.isArray(f.tags) ? f.tags.join(', ') : f.tags} onChange={(e) => setF((x) => ({ ...x, tags: e.target.value }))} /></div>
      <div>
        <label className="label" htmlFor="pf-img">Image</label>
        <div className="flex items-center gap-4">{f.image && <img src={f.image} alt="" className="h-20 w-20 rounded-lg border-[1.5px] border-ink object-cover" />}<input id="pf-img" type="file" accept="image/*" onChange={upload} className="text-sm" /></div><Err k="image" />
      </div>
      <div className="flex flex-wrap gap-6 text-sm font-semibold">
        {[['isActive', 'Visible in store'], ['isBestseller', 'Best seller'], ['isNew', 'New arrival']].map(([k, l]) => <label key={k} className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-violet" checked={Boolean(f[k])} onChange={set(k)} />{l}</label>)}
      </div>
      <div className="flex justify-end gap-3 pt-2"><button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button><button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button></div>
    </form>
  );
}

export default function AdminProducts() {
  const { data: products, loading, error, reload } = useAsync(listAllProducts, []);
  const catalog = useCatalog();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | {} (new) | product
  const refresh = () => { reload(); catalog.reload(); };

  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    try { await deleteProduct(p.id); toast.success('Product deleted'); refresh(); } catch (ex) { toast.error(ex.message); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold">Products</h1><button className="btn btn-primary btn-sm" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add product</button></div>
      {loading ? <Spinner /> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px]"><thead className="bg-paper2"><tr><th className="th">Product</th><th className="th">Category</th><th className="th">Price</th><th className="th">Stock</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
            <tbody>{products.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="td"><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-10 w-10 rounded border border-ink object-cover" /><span className="font-semibold">{p.name}</span></div></td>
                <td className="td">{p.categoryName}</td><td className="td font-label font-bold">{money(p.price)}</td><td className={`td ${p.stock <= 10 ? 'font-bold text-coral-dark' : ''}`}>{p.stock}</td>
                <td className="td">{p.isActive ? 'Live' : 'Hidden'}</td>
                <td className="td text-right"><button className="icon-btn h-9 w-9" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></button><button className="icon-btn h-9 w-9" aria-label={`Delete ${p.name}`} onClick={() => remove(p)}><Trash2 className="h-4 w-4" /></button></td>
              </tr>))}</tbody></table>
        </div>
      )}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Product form" wide>
        {editing && <ProductForm initial={editing.id ? editing : null} categories={catalog.categories} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
      </Modal>
    </div>
  );
}
