import { useEffect } from 'react';
import { BRAND } from '../lib/config';

export default function useSeo(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND.name}` : `${BRAND.name} — ${BRAND.tagline}`;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
}
