'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './lab-hints.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;
type Hint = { text: string; left: number; top: number; below: boolean; tail: number };

/** half the widest bubble plus a margin, so a hint never runs off the screen */
const EDGE = 150;

/* One tooltip for the whole lab. Anything inside with a data-hint attribute
   says, on hover or keyboard focus, what clicking it will do.

   It listens once on the wrapper rather than on every button, and draws the
   bubble with position: fixed, so it is never clipped by a panel with
   overflow: hidden — the copy buttons sit inside exactly such a panel. After a
   click it re-reads the element on the next frame, because the action usually
   changes what the same button will do next. */
export default function HintLayer({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const last = useRef<Element | null>(null);
  const [hint, setHint] = useState<Hint | null>(null);

  useEffect(() => {
    const host = root.current;
    if (!host) return;

    const place = (target: Element | null) => {
      last.current = target;
      const node = target?.closest<HTMLElement>('[data-hint]');
      if (!node || !host.contains(node) || !node.dataset.hint) {
        setHint(null);
        return;
      }
      const rect = node.getBoundingClientRect();
      const below = node.dataset.hintSide === 'bottom' || rect.top < 96;
      const centre = rect.left + rect.width / 2;
      const left = Math.min(Math.max(centre, EDGE), window.innerWidth - EDGE);
      setHint({
        text: node.dataset.hint,
        left,
        top: below ? rect.bottom : rect.top,
        below,
        tail: Math.max(-110, Math.min(110, centre - left)),
      });
    };

    const over = (event: PointerEvent) => {
      // a tap performs the action at once; a hint appearing afterwards only gets in the way
      if (event.pointerType !== 'touch') place(event.target as Element);
    };
    const leave = () => {
      last.current = null;
      setHint(null);
    };
    const focus = (event: FocusEvent) => place(event.target as Element);
    const hide = () => {
      last.current = null;
      setHint(null);
    };
    /* a scroll or resize moves the control, so the bubble moves with it;
       hiding instead would drop the hint whenever the page shifts under a
       still pointer — including the shift the lab makes on purpose */
    let frame = 0;
    const follow = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (last.current?.isConnected) place(last.current);
        else setHint(null);
      });
    };
    const click = () => {
      requestAnimationFrame(() => {
        if (last.current?.isConnected) place(last.current);
        else setHint(null);
      });
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };

    host.addEventListener('pointerover', over);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('focusin', focus);
    host.addEventListener('focusout', hide);
    host.addEventListener('click', click);
    window.addEventListener('scroll', follow, { capture: true, passive: true });
    window.addEventListener('resize', follow);
    window.addEventListener('keydown', key);

    return () => {
      host.removeEventListener('pointerover', over);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('focusin', focus);
      host.removeEventListener('focusout', hide);
      host.removeEventListener('click', click);
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', follow, { capture: true });
      window.removeEventListener('resize', follow);
      window.removeEventListener('keydown', key);
    };
  }, []);

  return (
    <div ref={root} className={styles.layer}>
      {children}
      {hint && (
        <div
          key={hint.text}
          role="tooltip"
          className={styles.bubble}
          data-below={hint.below}
          style={{ left: hint.left, top: hint.top, '--tail': `${hint.tail}px` } as Vars}
        >
          {hint.text}
        </div>
      )}
    </div>
  );
}
