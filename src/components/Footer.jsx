import { Link } from 'react-router-dom';
import { Instagram, Mail, Twitter, Youtube } from 'lucide-react';
import Logo from './Logo';
import { BRAND } from '../lib/config';

// Replace the "#" handles below with your real profile URLs.
const social = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/' },
  { icon: Twitter, label: 'X (Twitter)', href: 'https://x.com/' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com/' },
  { icon: Mail, label: 'Email', href: 'mailto:hello@stikly.in' },
];

const col = 'font-label text-xs font-bold uppercase tracking-[0.18em] text-citrus';
const a = 'text-white/80 hover:text-white hover:underline';

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-white/70">{BRAND.tagline}. Premium die-cut vinyl stickers for laptops, bottles, phones and everything in between.</p>
          <ul className="mt-5 flex gap-2">
            {social.map(({ icon: Icon, label, href }) => (
              <li key={label}><a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 hover:bg-white hover:text-ink"><Icon className="h-4 w-4" /></a></li>
            ))}
          </ul>
        </div>
        <nav aria-label="Quick links"><h3 className={col}>Quick links</h3>
          <ul className="mt-4 space-y-2">
            <li><Link className={a} to="/shop">Shop all</Link></li>
            <li><Link className={a} to="/categories">Categories</Link></li>
            <li><Link className={a} to="/custom">Custom stickers</Link></li>
            <li><Link className={a} to="/about">About us</Link></li>
            <li><Link className={a} to="/wishlist">Wishlist</Link></li>
          </ul>
        </nav>
        <nav aria-label="Customer support"><h3 className={col}>Customer support</h3>
          <ul className="mt-4 space-y-2">
            <li><Link className={a} to="/contact">Contact us</Link></li>
            <li><Link className={a} to="/track-order">Track your order</Link></li>
            <li><Link className={a} to="/#faq">FAQ</Link></li>
            <li><a className={a} href="mailto:hello@stikly.in">hello@stikly.in</a></li>
          </ul>
        </nav>
        <nav aria-label="Policies"><h3 className={col}>Policies</h3>
          <ul className="mt-4 space-y-2">
            <li><Link className={a} to="/policies/shipping">Shipping policy</Link></li>
            <li><Link className={a} to="/policies/returns">Returns & refunds</Link></li>
            <li><Link className={a} to="/policies/privacy">Privacy policy</Link></li>
            <li><Link className={a} to="/policies/terms">Terms of service</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15 py-5 text-center text-sm text-white/60">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
