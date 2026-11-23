import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { money } from '../lib/format';

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { products } = useCatalog();

  useEffect(() => {
    if (!open) return undefined;
    setQ('');
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return products.filter((p) => `${p.name} ${p.categoryName} ${(p.tags || []).join(' ')}`.toLowerCase().includes(t)).slice(0, 5);
  }, [q, products]);

  if (!open) return null;
  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[95] bg-ink/60 p-4 pt-20" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Search stickers" className="mx-auto w-full max-w-2xl animate-pop rounded-lg border-[1.5px] border-ink bg-paper p-4 shadow-hard-lg">
        <form onSubmit={submit} className="flex items-center gap-3" role="search">
          <Search className="h-5 w-5 shrink-0" aria-hidden />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} className="input" placeholder="Search anime, gaming, cats, pastel…" aria-label="Search products" />
          <button type="button" onClick={onClose} aria-label="Close search" className="icon-btn"><X className="h-5 w-5" /></button>
        </form>
        {q.trim() && (
          <div className="mt-3 border-t border-line pt-3">
            {matches.length === 0 ? (
              <p className="px-2 py-4 text-center text-ink/70">No stickers match “{q}”. Try a different word.</p>
            ) : (
              <ul>
                {matches.map((p) => (
                  <li key={p.id}>
                    <Link to={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white">
                      <img src={p.image} alt="" className="h-12 w-12 rounded-lg border border-ink object-cover" />
                      <span className="flex-1 font-semibold">{p.name}</span>
                      <span className="font-label text-sm font-bold">{money(p.price)}</span>
                    </Link>
                  </li>
                ))}
                <li className="pt-2"><button onClick={submit} className="w-full rounded-lg p-2 text-center font-label text-sm font-bold uppercase tracking-wider text-violet hover:bg-white">See all results</button></li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
