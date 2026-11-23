import { useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import ProductCard from '../ProductCard';
import QuickViewModal from '../QuickViewModal';
import { ProductGridSkeleton } from '../ui/Skeleton';
import ErrorState from '../ui/ErrorState';

/** Reusable product row used by Best Sellers, New Arrivals, related products. */
export default function ProductSection({ eyebrow, title, text, to, products, loading, error, bg = '' }) {
  const [quick, setQuick] = useState(null);
  return (
    <section className={bg}>
      <div className="container-x py-16">
        <SectionHeading eyebrow={eyebrow} title={title} text={text} to={to} />
        {error ? <ErrorState error={error} />
          : loading ? <ProductGridSkeleton count={4} />
          : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuick} />)}
            </div>
          )}
      </div>
      <QuickViewModal product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
