import { Loader2 } from 'lucide-react';
export default function Spinner({ label = 'Loading' }) {
  return <div className="flex items-center justify-center gap-2 py-20" role="status"><Loader2 className="h-6 w-6 animate-spin text-violet" /><span className="font-label text-sm font-bold uppercase tracking-wider">{label}…</span></div>;
}
