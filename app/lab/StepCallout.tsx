'use client';

import type { CSSProperties } from 'react';
import styles from './step-callout.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

/* One plain-language line, pinned beside the actor that is doing something on
   the current step. The diagrams already say what is happening in protocol
   terms; this says it in the words someone would use out loud, which is the
   bit a beginner is missing when they look at a labelled arrow.

   Drop it as the last child of an <svg> and give it that svg's viewBox size —
   it positions itself in those coordinates. */
export default function StepCallout({ x, y, side, text, tone, width, height }: {
  /** the point the tail should touch, in the svg's own coordinates */
  x: number;
  y: number;
  /** which side of that point the bubble sits on */
  side: 'left' | 'right' | 'up';
  text: string;
  tone: string;
  /** the svg's viewBox width and height */
  width: number;
  height: number;
}) {
  return (
    <foreignObject x={0} y={0} width={width} height={height} className={styles.host}>
      <div className={styles.layer} style={{ width, height }}>
        <div className={styles.anchor} data-side={side} style={{ left: x, top: y }}>
          <div className={styles.bubble} style={{ '--tone': tone } as Vars}>
            {text}
            <span className={styles.tail} aria-hidden="true" />
          </div>
        </div>
      </div>
    </foreignObject>
  );
}
