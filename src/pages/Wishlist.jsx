import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import EmptyState from '../components/ui/EmptyState';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { useCatalog } from '../context/CatalogContext';
import { useWishlist } from '../context/WishlistContext';
import useSeo from '../hooks/useSeo';

export default function Wishlist() {
  useSeo('Wishlist', 'Stickers you have saved for later.');
  const { products, loading } = useCatalog();
  const wish = useWishlist();
  const [quick, setQuick] = useState(null);
  const saved = products.filter((p) => wish.has(p.id));
  return (
    <div className="container-x py-10">
      <h1 className="mb-8 text-4xl font-extrabold sm:text-5xl">Wishlist</h1>
      {loading ? <ProductGridSkeleton count={4} /> : saved.length === 0 ? (
        <EmptyState icon={Heart} title="Nothing saved yet" text="Tap the heart on any sticker to keep it here." action={<Link to="/shop" className="btn btn-primary">Browse stickers</Link>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">{saved.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuick} />)}</div>
      )}
      <QuickViewModal product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
