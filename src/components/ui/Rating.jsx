import { Star } from 'lucide-react';

export default function Rating({ value = 0, count, size = 14 }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${value} out of 5${count != null ? ` from ${count} reviews` : ''}`}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} width={size} height={size} className={n <= full ? 'fill-citrus text-ink' : 'text-ink/25'} strokeWidth={1.5} />
        ))}
      </span>
      <span className="font-label text-xs font-bold">{Number(value).toFixed(1)}</span>
      {count != null && <span className="text-xs text-ink/60">({count})</span>}
    </span>
  );
}

export function StarPicker({ value, onChange, id }) {
  return (
    <div role="radiogroup" aria-label="Your rating" id={id} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className="rounded p-0.5">
          <Star className={`h-7 w-7 transition ${n <= value ? 'fill-citrus text-ink' : 'text-ink/30'}`} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}
