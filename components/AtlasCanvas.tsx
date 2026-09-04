'use client';

import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number; t: 'ink' | 'cyan' | 'mag' };
type Packet = { a: Node; b: Node; p: number; c: 'cyan' | 'mag' };

/** ink RGB triples, as the canvas wants them. The canvas cannot consume CSS
    custom properties directly, so it mirrors the light/dark design tokens. */
const COL = { ink: '32,30,29', cyan: '0,136,176', mag: '214,0,108' } as const;
/** the run of node kinds — mostly ink, one cyan and one magenta per eight */
const KINDS: Node['t'][] = ['ink', 'ink', 'ink', 'ink', 'cyan', 'ink', 'ink', 'mag'];
/** links are drawn between nodes closer than this, fading out toward it */
const DIST = 168;

export default function AtlasCanvas({
  showAnimation = true,
  pace = 2,
  className,
}: {
  showAnimation?: boolean;
  /** 1–3; scales node drift and packet speed */
  pace?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let raf: number | null = null;

    const build = () => {
      const r = el.getBoundingClientRect();
      W = r.width;
      H = r.height;
      el.width = Math.max(1, W * dpr);
      el.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // node count tracks area, clamped so a phone is not sparse and a wide
      // desktop does not turn the O(n²) link pass into a cost
      const N = Math.max(16, Math.min(52, Math.round((W * H) / 20000)));
      nodes = [];
      for (let i = 0; i < N; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          t: KINDS[i % KINDS.length],
        });
      }
      packets = [];
    };

    build();

    const draw = (animate: boolean) => {
      const col = COL;
      const sp = animate ? 0.55 + pace * 0.4 : 0;
      ctx.clearRect(0, 0, W, H);

      for (const n of nodes) {
        n.x += n.vx * sp;
        n.y += n.vy * sp;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            const o = (1 - d / DIST) * 0.15;
            ctx.strokeStyle = 'rgba(' + col.ink + ',' + o + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            // a link occasionally carries a packet — rare per frame per link,
            // which reads as a handful in flight at any moment
            if (animate && Math.random() < 0.0016) {
              packets.push({ a, b, p: 0, c: Math.random() < 0.5 ? 'cyan' : 'mag' });
            }
          }
        }
      }

      for (let k = packets.length - 1; k >= 0; k--) {
        const pk = packets[k];
        pk.p += 0.01 * (0.55 + pace * 0.4);
        if (pk.p >= 1) {
          packets.splice(k, 1);
          continue;
        }
        const x = pk.a.x + (pk.b.x - pk.a.x) * pk.p;
        const y = pk.a.y + (pk.b.y - pk.a.y) * pk.p;
        ctx.fillStyle = 'rgba(' + col[pk.c] + ',0.85)';
        ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
      }

      for (const n of nodes) {
        const r = n.t === 'ink' ? 1.7 : 2.8;
        ctx.fillStyle = 'rgba(' + col[n.t] + ',' + (n.t === 'ink' ? 0.32 : 0.85) + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, 6.29);
        ctx.fill();
      }
    };

    // ResizeObserver rather than a window listener: the hero's height also
    // changes when the headline reflows, not only when the window does
    const ro = new ResizeObserver(() => {
      build();
      if (!raf) draw(false);
    });
    ro.observe(el);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // one still frame is the whole treatment when motion is unwelcome or the
    // prop is off — the field is a texture either way
    if (!showAnimation || reduce) {
      draw(false);
      return () => {
        ro.disconnect();
      };
    }

    draw(false);

    const loop = () => {
      draw(true);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const halt = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    // scrolled past the hero, the loop stops paying for itself
    const io = new IntersectionObserver((es) => (es[0]?.isIntersecting ? play() : halt()), {
      threshold: 0,
    });
    io.observe(el);

    return () => {
      halt();
      io.disconnect();
      ro.disconnect();
    };
  }, [showAnimation, pace]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
