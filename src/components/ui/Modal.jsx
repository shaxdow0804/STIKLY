import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/** Accessible dialog: ESC to close, focus moves in, focus returns on close, body scroll locked. */
export default function Modal({ open, onClose, title, children, wide = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={`relative max-h-[92vh] w-full animate-pop overflow-y-auto rounded-t-2xl border-[1.5px] border-ink bg-paper p-5 shadow-hard-lg focus:outline-none sm:rounded-lg sm:p-8 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <button onClick={onClose} aria-label="Close dialog" className="icon-btn absolute right-3 top-3 border-ink bg-white"><X className="h-5 w-5" /></button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
