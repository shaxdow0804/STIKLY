import { Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo';

export default function NotFound() {
  useSeo('Page not found');
  return (
    <div className="container-x py-24 text-center">
      <p className="font-display text-8xl font-extrabold text-violet">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">This page peeled off</h1>
      <p className="mt-2 text-ink/70">We could not find what you were looking for.</p>
      <Link to="/" className="btn btn-primary mt-8">Back home</Link>
    </div>
  );
}
