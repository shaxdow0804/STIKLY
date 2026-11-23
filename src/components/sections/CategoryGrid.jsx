import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading';
import { useCatalog } from '../../context/CatalogContext';
import { Skeleton } from '../ui/Skeleton';

export const CUSTOM_TILE = { id: 'custom', slug: 'custom', name: 'Custom Stickers', image: '/images/cat-custom.webp', blurb: 'Upload your art and we print it.', href: '/custom' };

export default function CategoryGrid({ heading = true }) {
  const { categories, loading } = useCatalog();
  const tiles = [...categories, CUSTOM_TILE];
  return (
    <section className="container-x py-16" aria-labelledby="cat-title">
      {heading && <div id="cat-title"><SectionHeading eyebrow="Browse" title="Shop by category" text="Find your corner of the sticker universe." /></div>}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {loading && !categories.length
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)
          : tiles.map((c, i) => (
            <Link key={c.id} to={c.href || `/shop?category=${c.slug}`} className="group card relative block aspect-square overflow-hidden transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg">
              <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4 pt-12 text-white">
                <h3 className="text-lg font-bold leading-tight sm:text-xl">{c.name}</h3>
                <p className="hidden text-sm text-white/80 sm:block">{c.blurb}</p>
              </div>
              {i === tiles.length - 1 && <span className="chip absolute left-3 top-3 bg-citrus text-ink">Make your own</span>}
            </Link>
          ))}
      </div>
    </section>
  );
}
