import { Link, useParams } from 'react-router-dom';
import { policies } from '../data/content';
import useSeo from '../hooks/useSeo';
import NotFound from './NotFound';

export default function Policy() {
  const { slug } = useParams();
  const p = policies[slug];
  useSeo(p?.title, p ? `STIKLY ${p.title.toLowerCase()}.` : undefined);
  if (!p) return <NotFound />;
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-4xl font-extrabold">{p.title}</h1>
      <div className="mt-6 space-y-4 text-lg text-ink/80">{p.body.map((t) => <p key={t}>{t}</p>)}</div>
      <p className="mt-10 text-sm text-ink/60">Questions? <Link to="/contact" className="text-violet underline">Contact us</Link>.</p>
    </div>
  );
}
