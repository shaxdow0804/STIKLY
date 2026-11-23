import { Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo';
import WhyUs from '../components/sections/WhyUs';

export default function About() {
  useSeo('About us', 'STIKLY makes premium die-cut vinyl stickers for people who want their stuff to look like them.');
  return (
    <>
      <section className="container-x grid items-center gap-10 py-14 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-2">About STIKLY</p>
          <h1 className="text-4xl font-extrabold sm:text-6xl">Stick Your Personality.</h1>
          <p className="mt-6 text-lg text-ink/75">STIKLY makes die-cut vinyl stickers for the things you carry every day: laptops, bottles, phones and notebooks. Every design is made to feel like a small piece of you, printed sharp and built to last.</p>
          <p className="mt-4 text-ink/75">We obsess over the details that make a sticker feel premium: clean cut lines, saturated colour and a finish that survives real life. And if you can imagine it, our custom studio can print it.</p>
          <div className="mt-8 flex gap-3"><Link to="/shop" className="btn btn-primary">Shop stickers</Link><Link to="/custom" className="btn btn-ghost">Make your own</Link></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src="/images/life-peel.webp" alt="Hands peeling a holographic sticker" className="card aspect-square w-full -rotate-2 object-cover" />
          <img src="/images/life-unboxing.webp" alt="STIKLY sticker packaging flatlay" className="card mt-8 aspect-square w-full rotate-2 object-cover" />
          <img src="/images/life-phone.webp" alt="Stickers on a phone case" className="card aspect-square w-full rotate-1 object-cover" />
          <img src="/images/life-bottle.webp" alt="Sticker on a reusable bottle" className="card aspect-square w-full -rotate-1 object-cover" />
        </div>
      </section>
      <WhyUs />
    </>
  );
}
