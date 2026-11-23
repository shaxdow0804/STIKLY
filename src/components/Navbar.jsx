import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import Logo from './Logo';
import SearchOverlay from './SearchOverlay';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { SHIPPING } from '../lib/config';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/custom', label: 'Custom Stickers' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-2 font-label text-sm font-bold uppercase tracking-wider transition hover:bg-white ${isActive ? 'bg-violet text-white hover:bg-violet' : ''}`;

function CountBadge({ n }) {
  if (!n) return null;
  return <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-ink bg-coral px-1 font-label text-[10px] font-bold">{n > 99 ? '99+' : n}</span>;
}

export default function Navbar() {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const { count } = useCart();
  const wish = useWishlist();
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => setMenu(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b-[1.5px] border-ink bg-paper/95 backdrop-blur">
      <div className="bg-ink px-4 py-2 text-center font-label text-xs font-semibold uppercase tracking-wider text-white">
        Free shipping on orders over ₹{SHIPPING.freeAbove}
      </div>
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-1">
          <button className="icon-btn" aria-label="Search" onClick={() => setSearch(true)}><Search className="h-5 w-5" /></button>
          <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist, ${wish.count} items`}><Heart className="h-5 w-5" /><CountBadge n={wish.count} /></Link>
          <Link to="/cart" className="icon-btn" aria-label={`Cart, ${count} items`}><ShoppingBag className="h-5 w-5" /><CountBadge n={count} /></Link>
          <Link to={user ? '/account' : '/login'} className="icon-btn hidden sm:inline-flex" aria-label={user ? 'My account' : 'Sign in'}><User className="h-5 w-5" /></Link>
          <button className="icon-btn lg:hidden" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((m) => !m)}>
            {menu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {menu && (
        <nav id="mobile-menu" aria-label="Mobile" className="animate-pop border-t border-line bg-paper px-4 pb-6 pt-3 lg:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => <li key={l.to}><NavLink to={l.to} end={l.end} className={(s) => `block ${linkClass(s)} text-base`}>{l.label}</NavLink></li>)}
            <li><NavLink to={user ? '/account' : '/login'} className={(s) => `block ${linkClass(s)} text-base`}>{user ? 'My account' : 'Sign in'}</NavLink></li>
            <li><NavLink to="/track-order" className={(s) => `block ${linkClass(s)} text-base`}>Track order</NavLink></li>
          </ul>
        </nav>
      )}
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </header>
  );
}
