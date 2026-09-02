'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styles from './stack.module.css';

/* Tracing one layer through the page.

   A layer appears in four separate figures here — the chart, the detail list,
   the sender and receiver stacks, and the encapsulation rows — and until now
   nothing connected them: a reader had to hold "layer 3" in their head across
   four diagrams. Choosing a layer in the chart now writes that number onto the
   wrapper this renders, and stack.module.css lights every figure that speaks
   for it while the rest fade back.

   The state is a pinned layer plus a hovered one, and the hover wins: pointing
   at a layer previews it, clicking pins it so the reader can leave the chart
   and read the detail with the trace still lit. Escape and a second click on
   the same layer both let go.

   Only the chart is a Client Component. Everything it lights is server-rendered
   markup passed straight through as children, which is why the highlight is
   expressed as data attributes rather than props. */

type LayerFocusValue = {
  /** the layer the page is tracing right now — a hover, or the pin under it */
  active: number | null;
  /** the pinned layer alone, which is what the chart reports as pressed */
  locked: number | null;
  /** pin a layer, or let go of it if it is already pinned */
  toggle: (n: number) => void;
  /** preview a layer under the pointer or the keyboard focus ring */
  preview: (n: number | null) => void;
};

const LayerFocusContext = createContext<LayerFocusValue | null>(null);

export function useLayerFocus(): LayerFocusValue {
  const value = useContext(LayerFocusContext);
  if (!value) throw new Error('useLayerFocus must be called inside <LayerFocus>');
  return value;
}

export default function LayerFocus({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const active = hovered ?? locked;

  const toggle = useCallback((n: number) => {
    setLocked((current) => (current === n ? null : n));
  }, []);

  /* Escape is the way out that does not ask the reader to find the same cell
     again — they may be several sections down the page by the time they want
     the trace gone. Bound only while something is pinned. */
  useEffect(() => {
    if (locked === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLocked(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [locked]);

  const value = useMemo<LayerFocusValue>(
    () => ({ active, locked, toggle, preview: setHovered }),
    [active, locked, toggle],
  );

  return (
    <LayerFocusContext.Provider value={value}>
      {/* undefined rather than null: React drops the attribute entirely, and
          the CSS keys "nothing is being traced" off its absence */}
      <div className={styles.focusRoot} data-active-layer={active ?? undefined}>
        {children}
      </div>
    </LayerFocusContext.Provider>
  );
}
