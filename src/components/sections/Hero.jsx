import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const tiles = [
  { src: '/images/acid-chrome-smile.webp', alt: 'Acid chrome smile holographic sticker', cls: 'left-[2%] top-[6%] w-[44%] -rotate-6', r: '-6deg' },
  { src: '/images/cosmic-jellyfish.webp', alt: 'Cosmic jellyfish iridescent sticker', cls: 'right-[2%] top-0 w-[40%] rotate-6', r: '6deg' },
  { src: '/images/midnight-tokyo-ramen.webp', alt: 'Midnight Tokyo ramen anime sticker', cls: 'bottom-[2%] left-[18%] w-[42%] rotate-3', r: '3deg' },
  { src: '/images/pixel-gameboy.webp', alt: 'Retro pixel handheld sticker', cls: 'bottom-[10%] right-[0%] w-[34%] -rotate-3', r: '-3deg' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b-[1.5px] border-ink">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-citrus/40 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet/20 blur-2xl" aria-hidden />
      <svg className="pointer-events-none absolute left-[46%] top-8 hidden h-10 w-10 animate-float text-coral lg:block" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" /></svg>
      <div className="container-x relative grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="chip mb-5 gap-2 bg-white"><Sparkles className="h-3.5 w-3.5 text-violet" /> New drop: acid dreams & retro cosmos</span>
          <h1 className="text-5xl font-extrabold leading-[0.95] sm:text-6xl lg:text-7xl">
            Stick Your <span className="relative inline-block text-violet">Personality<svg className="absolute -bottom-2 left-0 w-full text-coral" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden><path d="M2 7 Q 50 0 100 5 T 198 4" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" /></svg></span>.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink/75">Premium die-cut vinyl stickers for your laptop, bottle, phone and notebooks. Original designs, glossy finishes, built to last.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop" className="btn btn-primary">Shop now <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/categories" className="btn btn-ghost">Explore collection</Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-label text-xs font-bold uppercase tracking-wider text-ink/70">
            <li className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-citrus" /> Waterproof vinyl</li>
            <li>Scratch-resistant gloss</li>
            <li>Custom orders welcome</li>
          </ul>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-xl" aria-label="Sticker collage">
          {tiles.map((t) => (
            <img key={t.src} src={t.src} alt={t.alt} width="450" height="450" style={{ '--r': t.r }}
              className={`absolute aspect-square rounded-2xl border-[1.5px] border-ink bg-white object-cover shadow-hard-lg animate-float ${t.cls}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
