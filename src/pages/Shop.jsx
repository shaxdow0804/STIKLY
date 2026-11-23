import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, SlidersHorizontal, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useCatalog } from '../context/CatalogContext';
import useDebounce from '../hooks/useDebounce';
import useSeo from '../hooks/useSeo';
import { money } from '../lib/format';

const PAGE_SIZE = 8;
const SORTS = [
  { v: 'featured', l: 'Featured' }, { v: 'popular', l: 'Popularity' }, { v: 'newest', l: 'Newest' },
  { v: 'price-asc', l: 'Price: low to high' }, { v: 'price-desc', l: 'Price: high to low' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { products, categories, loading, error, reload } = useCatalog();
  const [quick, setQuick] = useState(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState(params.get('q') || '');
  const dq = useDebounce(q);

  const category = params.get('category') || 'all';
  const sort = params.get('sort') || 'featured';
  const min = params.get('min') || '';
  const max = params.get('max') || '';
  const activeCat = categories.find((c) => c.slug === category);
  useSeo(activeCat ? activeCat.name : 'Shop all stickers', 'Shop premium die-cut vinyl stickers. Filter by category and price.');

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null || v === 'all' || (k === 'sort' && v === 'featured') ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: true });
  };

  // keep URL in sync with the debounced search box; and the box in sync with navigation (e.g. header search)
  useEffect(() => { if ((params.get('q') || '') !== dq) update({ q: dq }); /* eslint-disable-next-line */ }, [dq]);
  const urlQ = params.get('q') || '';
  useEffect(() => { if (urlQ !== dq) setQ(urlQ); /* eslint-disable-next-line */ }, [urlQ]);
  useEffect(() => setVisible(PAGE_SIZE), [category, sort, min, max, dq]);

  const bounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    return { lo: prices.length ? Math.min(...prices) : 0, hi: prices.length ? Math.max(...prices) : 1000 };
  }, [products]);

  const results = useMemo(() => {
    const t = dq.trim().toLowerCase();
    const lo = min === '' ? -Infinity : Number(min);
    const hi = max === '' ? Infinity : Number(max);
    let list = products.filter((p) =>
      (category === 'all' || p.category === category) &&
      p.price >= lo && p.price <= hi &&
      (!t || `${p.name} ${p.categoryName} ${p.description} ${(p.tags || []).join(' ')}`.toLowerCase().includes(t)));
    const by = {
      popular: (a, b) => b.sold - a.sold,
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      featured: (a, b) => Number(b.isBestseller) - Number(a.isBestseller) || b.sold - a.sold,
    };
    list = [...list].sort(by[sort] || by.featured);
    return list;
  }, [products, category, dq, sort, min, max]);

  const hasFilters = category !== 'all' || dq || min || max;
  const clear = () => { setQ(''); setParams({}, { replace: true }); };

  const filterPanel = (
    <aside className="space-y-6" aria-label="Filters">
      <div>
        <h2 className="label">Category</h2>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
          {[{ slug: 'all', name: 'All stickers' }, ...categories].map((c) => (
            <button key={c.slug} onClick={() => update({ category: c.slug })} aria-pressed={category === c.slug}
              className={`rounded-full border-[1.5px] border-ink px-4 py-2 text-left text-sm font-semibold transition ${category === c.slug ? 'bg-violet text-white shadow-hard-sm' : 'bg-white hover:bg-citrus/50'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="label">Price range</h2>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="pmin">Minimum price</label>
          <input id="pmin" type="number" min="0" inputMode="numeric" className="input" placeholder={String(bounds.lo)} value={min} onChange={(e) => update({ min: e.target.value })} />
          <span aria-hidden>–</span>
          <label className="sr-only" htmlFor="pmax">Maximum price</label>
          <input id="pmax" type="number" min="0" inputMode="numeric" className="input" placeholder={String(bounds.hi)} value={max} onChange={(e) => update({ max: e.target.value })} />
        </div>
        <p className="mt-2 text-xs text-ink/60">Catalogue range: {money(bounds.lo)} – {money(bounds.hi)}</p>
      </div>
      {hasFilters && <button onClick={clear} className="btn btn-ghost btn-sm w-full">Clear all filters</button>}
    </aside>
  );

  return (
    <div className="container-x py-10">
      <h1 className="text-4xl font-extrabold sm:text-5xl">{activeCat ? activeCat.name : 'Shop all stickers'}</h1>
      <p className="mt-2 text-ink/70">{activeCat?.blurb || 'Every design, every finish, one place.'}</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor="shop-q" className="sr-only">Search stickers</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" aria-hidden />
          <input id="shop-q" type="search" className="input pl-11" placeholder="Search stickers…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label htmlFor="shop-sort" className="sr-only">Sort by</label>
        <select id="shop-sort" className="input w-auto" value={sort} onChange={(e) => update({ sort: e.target.value })}>
          {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm lg:hidden" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((o) => !o)}><SlidersHorizontal className="h-4 w-4" /> Filters</button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>{filterPanel}</div>
        <div>
          {error ? <ErrorState error={error} onRetry={reload} />
            : loading ? <ProductGridSkeleton />
            : results.length === 0 ? (
              <EmptyState icon={SearchX} title="No stickers found" text={dq ? `Nothing matches “${dq}” with these filters. Try a different word or clear the filters.` : 'No stickers match these filters.'}
                action={<button className="btn btn-primary" onClick={clear}>Clear filters</button>} />
            ) : (
              <>
                <p className="mb-4 text-sm text-ink/70" aria-live="polite">Showing {Math.min(visible, results.length)} of {results.length} stickers</p>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
                  {results.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuick} />)}
                </div>
                {visible < results.length && (
                  <div className="mt-10 text-center"><button className="btn btn-ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Load more</button></div>
                )}
              </>
            )}
        </div>
      </div>
      <QuickViewModal product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
