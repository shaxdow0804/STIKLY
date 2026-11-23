import { Link } from 'react-router-dom';

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2" aria-label="STIKLY home">
      <span className="flex h-9 w-9 -rotate-6 items-center justify-center rounded-xl border-[1.5px] border-ink bg-violet font-display text-lg font-extrabold text-white shadow-hard-sm">S</span>
      <span className={`font-display text-2xl font-extrabold tracking-tight ${light ? 'text-white' : ''}`}>STIKLY</span>
    </Link>
  );
}
