import { AlertTriangle } from 'lucide-react';
import EmptyState from './EmptyState';

export default function ErrorState({ error, onRetry }) {
  return <EmptyState icon={AlertTriangle} title="Something went wrong" text={error?.message || 'We could not load this right now.'} action={onRetry && <button className="btn btn-primary" onClick={onRetry}>Try again</button>} />;
}
