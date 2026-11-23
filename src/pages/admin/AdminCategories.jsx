import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import { deleteCategory, saveCategory, uploadProductImage } from '../../services/productService';

export default function AdminCategories() {
  const { categories, reload } = useCatalog();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    if (editing.name.trim().length < 2) return setError('Category name is required.');
    try { await saveCategory({ ...editing, name: editing.name.trim() }); toast.success('Category saved'); setEditing(null); setError(''); reload(); } catch (ex) { toast.error(ex.message); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete “${c.name}”? Products in it will become uncategorised.`)) return;
    try { await deleteCategory(c.id); toast.success('Category deleted'); reload(); } catch (ex) { toast.error(ex.message); }
  };
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (file) try { const image = await uploadProductImage(file); setEditing((x) => ({ ...x, image })); } catch (ex) { toast.error(ex.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-3xl font-extrabold">Categories</h1><button className="btn btn-primary btn-sm" onClick={() => { setError(''); setEditing({ name: '', blurb: '', image: '' }); }}><Plus className="h-4 w-4" /> Add category</button></div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <li key={c.id} className="card flex items-center gap-4 p-4">
            {c.image && <img src={c.image} alt="" className="h-16 w-16 rounded-lg border border-ink object-cover" />}
            <div className="min-w-0 flex-1"><p className="truncate font-bold">{c.name}</p><p className="truncate text-sm text-ink/60">/{c.slug}</p></div>
            <button className="icon-btn h-9 w-9" aria-label={`Edit ${c.name}`} onClick={() => { setError(''); setEditing(c); }}><Pencil className="h-4 w-4" /></button>
            <button className="icon-btn h-9 w-9" aria-label={`Delete ${c.name}`} onClick={() => remove(c)}><Trash2 className="h-4 w-4" /></button>
          </li>))}
      </ul>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Category form">
        {editing && (
          <form onSubmit={save} noValidate className="space-y-4">
            <h2 className="pr-10 text-2xl font-extrabold">{editing.id ? 'Edit category' : 'Add category'}</h2>
            <div><label className="label" htmlFor="cf-name">Name</label><input id="cf-name" className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />{error && <p className="field-error">{error}</p>}</div>
            <div><label className="label" htmlFor="cf-blurb">Short description</label><input id="cf-blurb" className="input" value={editing.blurb || ''} onChange={(e) => setEditing({ ...editing, blurb: e.target.value })} /></div>
            <div><label className="label" htmlFor="cf-img">Cover image</label><div className="flex items-center gap-3">{editing.image && <img src={editing.image} alt="" className="h-16 w-16 rounded-lg border border-ink object-cover" />}<input id="cf-img" type="file" accept="image/*" onChange={upload} className="text-sm" /></div></div>
            <div className="flex justify-end gap-3"><button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary btn-sm">Save</button></div>
          </form>)}
      </Modal>
    </div>
  );
}
