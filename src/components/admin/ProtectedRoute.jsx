import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';
import { DEMO_ADMIN } from '../../lib/config';

/**
 * Client-side gate for UX only. Real protection is Postgres RLS (public.is_admin()),
 * which rejects admin reads/writes from anyone whose profiles.is_admin is false.
 */
export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading, configured } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!configured && !DEMO_ADMIN) {
    return <div className="container-x py-20"><EmptyState icon={ShieldAlert} title="Admin needs a backend" text="Connect Supabase to enable the admin dashboard. For local demo only, set VITE_DEMO_ADMIN=true in .env." action={<Link to="/" className="btn btn-primary">Back home</Link>} /></div>;
  }
  if (configured && !user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!isAdmin) {
    return <div className="container-x py-20"><EmptyState icon={ShieldAlert} title="Not authorised" text="This area is for STIKLY admins only." action={<Link to="/" className="btn btn-primary">Back home</Link>} /></div>;
  }
  return children;
}
