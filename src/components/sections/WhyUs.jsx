import { Printer, ShieldCheck, Sparkles, Wallet, Lock } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import { whyUs } from '../../data/content';

const ICONS = { Printer, ShieldCheck, Sparkles, Wallet, Lock };

export default function WhyUs() {
  return (
    <section className="border-y-[1.5px] border-ink bg-paper2">
      <div className="container-x py-16">
        <SectionHeading center eyebrow="Why STIKLY" title="Stickers worth sticking" />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {whyUs.map((w, i) => {
            const Icon = ICONS[w.icon] || Sparkles;
            const colors = ['bg-violet text-white', 'bg-coral', 'bg-citrus', 'bg-mint', 'bg-cobalt text-white'];
            return (
              <li key={w.title} className="card p-6">
                <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-ink ${colors[i]}`}><Icon className="h-5 w-5" /></span>
                <h3 className="text-lg font-bold">{w.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{w.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
