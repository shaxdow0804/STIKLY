import { useMemo } from 'react';
import Hero from '../components/sections/Hero';
import CategoryGrid from '../components/sections/CategoryGrid';
import ProductSection from '../components/sections/ProductSection';
import CustomStudio from '../components/sections/CustomStudio';
import WhyUs from '../components/sections/WhyUs';
import Reviews from '../components/sections/Reviews';
import FAQ from '../components/sections/FAQ';
import Newsletter from '../components/sections/Newsletter';
import { useCatalog } from '../context/CatalogContext';
import useSeo from '../hooks/useSeo';

export default function Home() {
  useSeo(null, 'STIKLY sells premium die-cut vinyl stickers: anime, gaming, aesthetic, minimalist and custom stickers. Stick Your Personality.');
  const { products, loading, error } = useCatalog();
  const best = useMemo(() => [...products].filter((p) => p.isBestseller).sort((a, b) => b.sold - a.sold).slice(0, 4), [products]);
  const fresh = useMemo(() => [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4), [products]);
  return (
    <>
      <Hero />
      <CategoryGrid />
      <ProductSection bg="bg-paper2 border-y-[1.5px] border-ink" eyebrow="Fan favourites" title="Best sellers" text="The stickers everyone keeps coming back for." to="/shop?sort=popular" products={best} loading={loading} error={error} />
      <ProductSection eyebrow="Just dropped" title="New arrivals" text="Fresh collections, straight off the press." to="/shop?sort=newest" linkLabel="See newest" products={fresh} loading={loading} error={error} />
      <CustomStudio />
      <WhyUs />
      <Reviews />
      <FAQ />
      <Newsletter />
    </>
  );
}
