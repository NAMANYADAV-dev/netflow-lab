'use client';

import { useEffect, useRef } from 'react';

/* Brings the page's cards in once, as they are scrolled to.

   The cards are in the HTML and visible by default; nothing is hidden until
   this has run, so a reader without JavaScript loses the motion and nothing
   else. Whatever is already on screen at load is left alone — only what the
   reader has yet to reach is held back. The stylesheet does the moving and
   stands it down under prefers-reduced-motion. */
export default function LabReveal() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchor.current?.closest('main');
    if (!root) return;

    const items = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
    for (const item of items) {
      if (item.getBoundingClientRect().top < window.innerHeight) item.dataset.shown = 'instant';
    }
    root.dataset.revealReady = 'true';

    const io = new IntersectionObserver(
      (entries) => {
        /* cards that arrive together come in one after another */
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            const item = entry.target as HTMLElement;
            item.style.setProperty('--reveal-i', String(index));
            item.dataset.shown = 'true';
            io.unobserve(item);
          });
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    for (const item of items) if (!item.dataset.shown) io.observe(item);

    return () => io.disconnect();
  }, []);

  return <span ref={anchor} hidden />;
}
