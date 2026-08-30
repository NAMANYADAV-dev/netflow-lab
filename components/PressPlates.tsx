'use client';

import { useEffect, useRef } from 'react';

/* The Broadsheet separation filters and the press driver — ported from
   print-plates.js in the design system.

   Each single-plate filter extracts one process plate from a photograph,
   rendered as that ink on the sheet — cyan from R, magenta from G, yellow from
   B, and a 60%-strength luminance K printed in the text ink (#201e1d). #sep-all
   chains the four into ONE compound filter for a single swappable image (see
   `.cmyk .print` in broadsheet.css): each stage re-extracts a plate from
   SourceGraphic, clips it to the source's own silhouette (feComposite
   operator="in" against SourceAlpha), and offsets the clipped sheet by the
   registered misregistration (C 0,0 / M 5,3 / Y -5,-3 / K 3,6); the sheets
   multiply where they cross and show alone where they don't.

   The clip is why there is no paper flood: an unclipped feColorMatrix lays its
   constant-term ink across the whole filter region, which forces overflow:hidden
   on the figure and guillotines the misregistration flat at the box edge.
   Clipped sheets paint nothing outside themselves, so the figure can let them
   overhang and the offsets read at the edges — the films askew on the stack.

   The defs have to be IN the document: a data-URI filter reference does not
   survive Chromium, and external-file references are unreliable across engines.
   Rendering them from the root layout is the React equivalent of the original's
   script injection. */

/** the resting misregistration, in px, per animated plate */
const BASE: Record<string, [number, number]> = {
  m: [5, 3],
  y: [-5, -3],
  k: [3, 6],
};

/* All numbers below are the measured design values, not tunables-in-waiting:
   LEAN_PX is ±2.5px x / ±2px y at the viewport edges (half the M/Y x-offset,
   two-thirds of its y — a breath); REGISTER_MS matches the deck's gather
   without its theatre (a 1.4s slide move reads as a scene, a hover should
   answer). */
const LEAN_PX: [number, number] = [2.5, 2];
const REGISTER_MS = 450;

/* The plate matrices' two endpoints. INK is the brand separation the sheet
   prints at rest (the values in the defs below). TRUE_ is the pure-process
   factorization — C passes R and floods G,B to 1, M and Y likewise for their
   channels, K goes to white (the multiply identity) — chosen because the four
   TRUE_ plates multiply back to SourceGraphic EXACTLY:
   (R,1,1)·(1,G,1)·(1,1,B)·(1,1,1) = (R,G,B).

   The brand inks and the K plate are exactly what makes the resting print
   denser than the photograph, so easing each matrix INK→TRUE_ as the plates
   converge lands the merged print ON the photograph — the image on screen is a
   four-plate multiply at every instant, and the converged merge "looks normal"
   by algebra, not by swapping anything in at the end. */
const INK: Record<string, number[]> = {
  c: [1, 0, 0, 0, 0, 0.467, 0, 0, 0, 0.533, 0.31, 0, 0, 0, 0.69, 0, 0, 0, 0, 1],
  m: [0, 0.161, 0, 0, 0.839, 0, 1, 0, 0, 0, 0, 0.576, 0, 0, 0.424, 0, 0, 0, 0, 1],
  y: [0, 0, 0.071, 0, 0.929, 0, 0, 0.267, 0, 0.733, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  k: [0.112, 0.375, 0.038, 0, 0.475, 0.113, 0.379, 0.038, 0, 0.471, 0.113, 0.38, 0.038, 0, 0.468, 0, 0, 0, 0, 1],
};

const TRUE_: Record<string, number[]> = {
  c: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  m: [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  y: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  k: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
};

const SEP_C = '1 0 0 0 0  0.467 0 0 0 0.533  0.310 0 0 0 0.690  0 0 0 0 1';
const SEP_M = '0 0.161 0 0 0.839  0 1 0 0 0  0 0.576 0 0 0.424  0 0 0 0 1';
const SEP_Y = '0 0 0.071 0 0.929  0 0 0.267 0 0.733  0 0 1 0 0  0 0 0 0 1';
const SEP_K =
  '0.112 0.375 0.038 0 0.475  0.113 0.379 0.038 0 0.471  0.113 0.380 0.038 0 0.468  0 0 0 0 1';

export default function PressPlates() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    /* The driver stands down wholesale under reduced motion or without a fine
       hover pointer; broadsheet.css carries the matching media-gated :hover cut
       as the fallback, so the reduced-motion experience is exactly the static
       one. */
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const nodes: Record<string, SVGFEOffsetElement> = {};
    svg.querySelectorAll<SVGFEOffsetElement>('feOffset[data-plate]').forEach((n) => {
      nodes[n.dataset.plate!] = n;
    });

    const mats: Record<string, SVGFEColorMatrixElement> = {};
    svg.querySelectorAll<SVGFEColorMatrixElement>('feColorMatrix[data-plate-mat]').forEach((n) => {
      mats[n.dataset.plateMat!] = n;
    });

    const root = document.documentElement;
    let nx = 0;
    let ny = 0; // smoothed pointer, -1..1 from viewport center
    let tx = 0;
    let ty = 0; // raw pointer target
    let reg = 1; // 1 = misregistered (rest), 0 = in register
    let regFrom = 1;
    let regTo = 1;
    let regT0 = 0;
    let raf = 0;
    let lastOffs = '';
    let lastReg = -1;
    let lastProps = '';

    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // cubic out

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    function tick(now: number) {
      raf = 0;
      nx += (tx - nx) * 0.22;
      ny += (ty - ny) * 0.22; // soften the hand

      if (regTo !== reg || regT0) {
        const t = Math.min(1, (now - regT0) / REGISTER_MS);
        reg = regFrom + (regTo - regFrom) * ease(t);
        if (t >= 1) {
          reg = regTo;
          regT0 = 0;
        }
      }

      /* Every write below is guarded on its COMPUTED output, not its inputs — an
         equal-value setAttribute still dirties the filter, and at full register
         the offsets are 0.00 whatever the lean, so a pointer roaming over a
         converged figure must not recompute the compound filter every frame. */
      const lx = LEAN_PX[0] * nx;
      const ly = LEAN_PX[1] * ny;
      const vals: Record<string, [string, string]> = {};
      let offsKey = '';
      for (const p in BASE) {
        const dx = ((BASE[p][0] + lx) * reg).toFixed(2);
        const dy = ((BASE[p][1] + ly) * reg).toFixed(2);
        vals[p] = [dx, dy];
        offsKey += dx + ',' + dy + ';';
      }
      if (offsKey !== lastOffs) {
        lastOffs = offsKey;
        for (const p in BASE) {
          nodes[p]?.setAttribute('dx', vals[p][0]);
          nodes[p]?.setAttribute('dy', vals[p][1]);
        }
      }

      // the ink purification rides the same eased value — INK at rest (reg 1),
      // TRUE_ at register (reg 0); see the endpoint tables above
      if (reg !== lastReg) {
        lastReg = reg;
        for (const p in mats) {
          const a = INK[p];
          const b = TRUE_[p];
          const v = new Array<string>(20);
          for (let i = 0; i < 20; i++) v[i] = (b[i] + (a[i] - b[i]) * reg).toFixed(3);
          mats[p].setAttribute('values', v.join(' '));
        }
      }

      // the text plates lean whatever the photo's register state — the custom
      // properties move with the pointer alone
      const pk = nx.toFixed(3) + ',' + ny.toFixed(3);
      if (pk !== lastProps) {
        lastProps = pk;
        root.style.setProperty('--press-nx', nx.toFixed(3));
        root.style.setProperty('--press-ny', ny.toFixed(3));
      }

      if (regT0 || Math.abs(tx - nx) > 0.002 || Math.abs(ty - ny) > 0.002) schedule();
    }

    const onMove = (e: PointerEvent) => {
      tx = (2 * e.clientX) / innerWidth - 1;
      ty = (2 * e.clientY) / innerHeight - 1;
      schedule();
    };

    const retarget = (to: number) => {
      regFrom = reg;
      regTo = to;
      regT0 = performance.now();
      schedule();
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const p = target?.closest?.('.cmyk .print');
      if (p && !(e.relatedTarget instanceof Node && p.contains(e.relatedTarget))) retarget(0);
    };
    const onOut = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const p = target?.closest?.('.cmyk .print');
      if (p && !(e.relatedTarget instanceof Node && p.contains(e.relatedTarget))) retarget(1);
    };

    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      root.style.removeProperty('--press-nx');
      root.style.removeProperty('--press-ny');
    };
  }, []);

  return (
    <svg ref={svgRef} width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="sep-c" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={SEP_C} />
        </filter>
        <filter id="sep-m" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={SEP_M} />
        </filter>
        <filter id="sep-y" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={SEP_Y} />
        </filter>
        <filter id="sep-k" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={SEP_K} />
        </filter>

        <filter id="sep-all" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values={SEP_C} data-plate-mat="c" result="c0" />
          <feComposite in="c0" in2="SourceAlpha" operator="in" result="c" />

          <feColorMatrix in="SourceGraphic" type="matrix" values={SEP_M} data-plate-mat="m" result="m0" />
          <feComposite in="m0" in2="SourceAlpha" operator="in" result="m1" />
          <feOffset in="m1" dx="5" dy="3" data-plate="m" result="m" />

          <feColorMatrix in="SourceGraphic" type="matrix" values={SEP_Y} data-plate-mat="y" result="y0" />
          <feComposite in="y0" in2="SourceAlpha" operator="in" result="y1" />
          <feOffset in="y1" dx="-5" dy="-3" data-plate="y" result="y" />

          <feColorMatrix in="SourceGraphic" type="matrix" values={SEP_K} data-plate-mat="k" result="k0" />
          <feComposite in="k0" in2="SourceAlpha" operator="in" result="k1" />
          <feOffset in="k1" dx="3" dy="6" data-plate="k" result="k" />

          <feBlend in="m" in2="c" mode="multiply" result="s1" />
          <feBlend in="y" in2="s1" mode="multiply" result="s2" />
          <feBlend in="k" in2="s2" mode="multiply" />
        </filter>
      </defs>
    </svg>
  );
}
