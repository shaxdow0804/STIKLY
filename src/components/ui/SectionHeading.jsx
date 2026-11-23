import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({ eyebrow, title, text, to, linkLabel = 'View all', center = false }) {
  return (
    <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 ${center ? 'flex-col items-center text-center' : ''}`}>
      <div className={center ? 'max-w-2xl' : ''}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-3xl font-extrabold sm:text-4xl">{title}</h2>
        {text && <p className="mt-2 max-w-xl text-ink/70">{text}</p>}
      </div>
      {to && (
        <Link to={to} className="inline-flex items-center gap-1 font-label text-sm font-bold uppercase tracking-wider text-violet hover:underline">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
