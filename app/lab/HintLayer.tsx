'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './lab-hints.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;
type Hint = { text: string; left: number; top: number; below: boolean; tail: number };

/** half the widest bubble plus a margin, so a hint never runs off the screen */
const EDGE = 150;

/* One tooltip for the whole lab. Anything inside with a data-hint attribute
   says, on hover or keyboard focus, what clicking it will do.

   It listens once on the wrapper rather than on every button, and draws the
   bubble in a portal on the body, so it is never clipped by a panel with
   overflow: hidden — the copy buttons sit inside exactly such a panel.

   The bubble is placed in page coordinates, which is what keeps it stuck to
   its control while the page scrolls under the pointer. Placing it against
   the viewport instead means re-placing it on every scroll event, always a
   frame late, and the bubble visibly drags behind the button it belongs to.

   After a click it re-reads the element on the next frame, because the action
   usually changes what the same button will do next. */
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
      // kept clear of the window edges, then written down as a place on the page
      const left = Math.min(Math.max(centre, EDGE), window.innerWidth - EDGE);
      setHint({
        text: node.dataset.hint,
        left: left + window.scrollX,
        top: (below ? rect.bottom : rect.top) + window.scrollY,
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
    /* scrolling needs no help — the bubble is on the page and travels with
       the control. A resize can still move the control under a still pointer,
       and hiding the hint then would drop it for no reason the reader did. */
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
    window.addEventListener('resize', follow);
    window.addEventListener('keydown', key);

    return () => {
      host.removeEventListener('pointerover', over);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('focusin', focus);
      host.removeEventListener('focusout', hide);
      host.removeEventListener('click', click);
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', follow);
      window.removeEventListener('keydown', key);
    };
  }, []);

  return (
    <div ref={root} className={styles.layer}>
      {children}
      {hint && createPortal(
        <div
          key={hint.text}
          role="tooltip"
          className={styles.bubble}
          data-below={hint.below}
          style={{ left: hint.left, top: hint.top, '--tail': `${hint.tail}px` } as Vars}
        >
          {hint.text}
        </div>,
        document.body,
      )}
    </div>
  );
}
