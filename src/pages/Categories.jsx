import CategoryGrid from '../components/sections/CategoryGrid';
import useSeo from '../hooks/useSeo';

export default function Categories() {
  useSeo('Categories', 'Browse STIKLY sticker categories: anime, gaming, aesthetic, minimalist, funny, laptop and custom stickers.');
  return (
    <div className="pt-10">
      <div className="container-x"><h1 className="text-4xl font-extrabold sm:text-5xl">Categories</h1><p className="mt-2 text-ink/70">Pick a vibe and jump straight in.</p></div>
      <CategoryGrid heading={false} />
    </div>
  );
}
