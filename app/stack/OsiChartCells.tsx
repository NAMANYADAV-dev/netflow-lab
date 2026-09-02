'use client';

import { osiLayers } from '@/lib/stack-data';
import DeviceLinks from './DeviceLinks';
import { useLayerFocus } from './LayerFocus';
import styles from './stack.module.css';

/* The seven OSI cells of the chart — the only control on the page, and the
   reason it is a Client Component. It returns a fragment rather than a wrapper
   so the cells stay direct children of the chart grid, which places each of
   them on its own row.

   The click handler is on the cell, not on the button inside it: the whole
   plate is a comfortable pointer target, and the button's own Enter and Space
   raise a click that bubbles to the same handler, so there is one code path for
   both. The button exists because a div is not reachable by keyboard and has
   nothing to announce; it carries the pressed state for a screen reader. The
   examples line ends in real links to the devices, so a click that lands on one
   is left alone. */
export default function OsiChartCells() {
  const { locked, toggle, preview } = useLayerFocus();

  return (
    <>
      {osiLayers.map((L) => (
        <div
          key={L.n}
          className={styles.osiCell}
          data-layers={L.n}
          style={{ '--row': 8 - L.n } as React.CSSProperties}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) return;
            toggle(L.n);
          }}
          onMouseEnter={() => preview(L.n)}
          onMouseLeave={() => preview(null)}
          onFocus={() => preview(L.n)}
          onBlur={() => preview(null)}
        >
          <div className={styles.osiNum}>{L.n}</div>
          <div>
            <button type="button" className={styles.osiName} aria-pressed={locked === L.n}>
              {L.name}
            </button>
            <div className={styles.osiBlurb}>{L.blurb}</div>
            <div className={styles.osiExamples}>
              {L.examples}
              <DeviceLinks devices={L.devices} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
