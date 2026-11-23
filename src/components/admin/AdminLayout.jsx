import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Package, Palette, ShoppingCart, Tags, Store } from 'lucide-react';
import { DEMO_ADMIN } from '../../lib/config';

const nav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/custom', label: 'Custom requests', icon: Palette },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-paper2">
      <div className="flex flex-col lg:flex-row">
        <aside className="border-ink bg-ink p-4 text-white lg:min-h-screen lg:w-60 lg:shrink-0">
          <Link to="/admin" className="mb-4 block font-display text-2xl font-extrabold">STIKLY <span className="text-citrus">admin</span></Link>
          <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-violet' : 'hover:bg-white/10'}`}><Icon className="h-4 w-4" />{label}</NavLink>
            ))}
            <Link to="/" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 lg:mt-6"><Store className="h-4 w-4" /> View store</Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1 p-4 sm:p-8">
          {DEMO_ADMIN && <p className="mb-4 rounded-lg border-[1.5px] border-ink bg-citrus p-3 text-sm font-semibold">Demo admin: changes are stored only in this browser (localStorage). Not for production.</p>}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
