import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import { faqs } from '../../data/content';

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="container-x py-16" aria-labelledby="faq-title">
      <div id="faq-title"><SectionHeading center eyebrow="Help" title="Frequently asked questions" /></div>
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((f, i) => (
          <div key={f.q} className="card overflow-hidden">
            <h3>
              <button className="flex w-full items-center justify-between gap-4 p-5 text-left text-lg font-bold" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}
                <ChevronDown className={`h-5 w-5 shrink-0 transition ${open === i ? 'rotate-180' : ''}`} />
              </button>
            </h3>
            {open === i && <div id={`faq-${i}`} className="border-t border-line px-5 pb-5 pt-4 text-ink/75">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
