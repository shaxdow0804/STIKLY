import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const { pathname, hash } = useLocation();

  // Scroll to top on page change, or to the #section if the link has one.
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
    return undefined;
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-violet focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <Navbar />
      <main id="main" key={pathname} className="flex-1 animate-pop">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
