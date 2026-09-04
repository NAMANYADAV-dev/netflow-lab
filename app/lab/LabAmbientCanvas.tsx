'use client';

import { useEffect, useRef } from 'react';
import styles from './lab.module.css';

type Color = [number, number, number];
type NodePoint = { x: number; y: number; vx: number; vy: number; r: number };
type Runner = { gx: number; gy: number; dir: number; p: number; speed: number; color: Color; wait: number };
type Trail = { x1: number; y1: number; x2: number; y2: number; t: number; color: Color };
type Flash = { x: number; y: number; t: number; color: Color; big?: boolean };
type Spark = { gx: number; gy: number; dir: number; p: number; speed: number; color: Color; hops: number };

const GRID = 46;
const DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]] as const;

export default function LabAmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let offsetX = 0;
    let offsetY = 0;
    let animationFrame = 0;
    let burstClock = 0;
    let nodes: NodePoint[] = [];
    let runners: Runner[] = [];
    let trails: Trail[] = [];
    let flashes: Flash[] = [];
    let sparks: Spark[] = [];

    const palette = (): Color[] => [
      [11, 107, 128],
      [154, 95, 2],
      [91, 63, 214],
    ];

    const gridPoint = (gx: number, gy: number) => ({
      x: offsetX + gx * GRID,
      y: offsetY + gy * GRID,
    });

    const seed = () => {
      const colors = palette();
      const maxGX = Math.ceil(width / GRID) + 1;
      const maxGY = Math.ceil(height / GRID) + 1;
      const nodeCount = Math.max(18, Math.round((width * height) / 26000));

      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        r: 0.8 + Math.random() * 1.6,
      }));

      const runnerCount = Math.max(4, Math.min(8, Math.round((width * height) / 150000)));
      runners = Array.from({ length: runnerCount }, () => ({
        gx: Math.floor(Math.random() * maxGX),
        gy: Math.floor(Math.random() * maxGY),
        dir: Math.floor(Math.random() * 4),
        p: Math.random(),
        speed: 0.01 + Math.random() * 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
        wait: Math.random() * 120,
      }));
      trails = [];
      flashes = [];
      sparks = [];
      burstClock = 0;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      offsetX = ((-rect.left % GRID) + GRID) % GRID;
      offsetY = ((-rect.top % GRID) + GRID) % GRID;
      seed();
    };

    const drawNetwork = () => {
      const nodeColor = '11,107,128';
      for (const node of nodes) {
        if (!reduceMotion) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }
      }
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance >= 118) continue;
          context.strokeStyle = `rgba(${nodeColor},${(0.1 * (1 - distance / 118)).toFixed(3)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
      for (const node of nodes) {
        context.fillStyle = `rgba(${nodeColor},0.16)`;
        context.beginPath();
        context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        context.fill();
      }
    };

    const drawTrails = () => {
      for (let index = trails.length - 1; index >= 0; index -= 1) {
        const trail = trails[index];
        trail.t += 0.012;
        if (trail.t >= 1) {
          trails.splice(index, 1);
          continue;
        }
        const [r, g, b] = trail.color;
        context.strokeStyle = `rgba(${r},${g},${b},${(0.3 * (1 - trail.t)).toFixed(3)})`;
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(trail.x1, trail.y1);
        context.lineTo(trail.x2, trail.y2);
        context.stroke();
      }
      context.lineCap = 'butt';
    };

    const drawPacket = (fromX: number, fromY: number, x: number, y: number, color: Color, alpha = 0.95) => {
      const [r, g, b] = color;
      const gradient = context.createLinearGradient(fromX, fromY, x, y);
      gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0.38)`);
      context.strokeStyle = gradient;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(fromX, fromY);
      context.lineTo(x, y);
      context.stroke();
      context.save();
      context.shadowColor = `rgba(${r},${g},${b},0.9)`;
      context.shadowBlur = 8;
      context.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      context.fillRect(x - 3, y - 3, 6, 6);
      context.restore();
    };

    const startBroadcast = () => {
      const colors = palette();
      const gx = 1 + Math.floor(Math.random() * Math.max(1, Math.ceil(width / GRID) - 2));
      const gy = 1 + Math.floor(Math.random() * Math.max(1, Math.ceil(height / GRID) - 2));
      const point = gridPoint(gx, gy);
      const color = colors[Math.floor(Math.random() * colors.length)];
      flashes.push({ x: point.x, y: point.y, t: 0, color, big: true });
      for (let dir = 0; dir < 4; dir += 1) {
        sparks.push({ gx, gy, dir, p: 0, speed: 0.02, color, hops: 2 });
      }
    };

    const drawRunners = () => {
      const maxGX = Math.ceil(width / GRID) + 1;
      const maxGY = Math.ceil(height / GRID) + 1;
      burstClock += 1;
      if (burstClock > 780 && sparks.length === 0) {
        burstClock = 0;
        startBroadcast();
      }

      for (const runner of runners) {
        if (runner.wait > 0) {
          runner.wait -= 1;
          continue;
        }
        const from = gridPoint(runner.gx, runner.gy);
        const direction = DIRECTIONS[runner.dir];
        const to = gridPoint(runner.gx + direction[0], runner.gy + direction[1]);
        if (!reduceMotion) runner.p += runner.speed;
        const progress = Math.min(1, runner.p);
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;
        drawPacket(from.x, from.y, x, y, runner.color);

        if (runner.p < 1 || reduceMotion) continue;
        trails.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, t: 0, color: runner.color });
        runner.gx += direction[0];
        runner.gy += direction[1];
        runner.p = 0;
        flashes.push({ x: to.x, y: to.y, t: 0, color: runner.color });
        if (Math.random() < 0.5) runner.dir = (runner.dir + (Math.random() < 0.5 ? 1 : 3)) % 4;
        runner.wait = Math.random() < 0.25 ? 30 + Math.random() * 60 : 0;
        if (runner.gx < -1 || runner.gy < -1 || runner.gx > maxGX || runner.gy > maxGY) {
          const colors = palette();
          runner.gx = Math.floor(Math.random() * maxGX);
          runner.gy = Math.floor(Math.random() * maxGY);
          runner.dir = Math.floor(Math.random() * 4);
          runner.color = colors[Math.floor(Math.random() * colors.length)];
        }
      }
    };

    const drawSparks = () => {
      const maxGX = Math.ceil(width / GRID) + 1;
      const maxGY = Math.ceil(height / GRID) + 1;
      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];
        const from = gridPoint(spark.gx, spark.gy);
        const direction = DIRECTIONS[spark.dir];
        const to = gridPoint(spark.gx + direction[0], spark.gy + direction[1]);
        if (!reduceMotion) spark.p += spark.speed;
        const progress = Math.min(1, spark.p);
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;
        drawPacket(from.x, from.y, x, y, spark.color, 0.98);
        if (spark.p < 1 || reduceMotion) continue;
        trails.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, t: 0, color: spark.color });
        flashes.push({ x: to.x, y: to.y, t: 0, color: spark.color });
        spark.gx += direction[0];
        spark.gy += direction[1];
        spark.p = 0;
        spark.hops -= 1;
        if (spark.hops <= 0 || spark.gx < -1 || spark.gy < -1 || spark.gx > maxGX || spark.gy > maxGY) {
          sparks.splice(index, 1);
        }
      }
    };

    const drawFlashes = () => {
      for (let index = flashes.length - 1; index >= 0; index -= 1) {
        const flash = flashes[index];
        flash.t += 0.03;
        if (flash.t >= 1) {
          flashes.splice(index, 1);
          continue;
        }
        const [r, g, b] = flash.color;
        const fade = 1 - flash.t;
        const cell = flash.big ? GRID * 1.4 : GRID;
        context.fillStyle = `rgba(${r},${g},${b},${((flash.big ? 0.22 : 0.15) * fade).toFixed(3)})`;
        context.fillRect(flash.x - cell / 2, flash.y - cell / 2, cell, cell);
        context.strokeStyle = `rgba(${r},${g},${b},${(0.55 * fade).toFixed(3)})`;
        context.lineWidth = 1.4;
        context.beginPath();
        context.arc(flash.x, flash.y, 4 + flash.t * (flash.big ? 36 : 16), 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = `rgba(${r},${g},${b},${(0.8 * fade).toFixed(3)})`;
        context.beginPath();
        context.arc(flash.x, flash.y, 2.4, 0, Math.PI * 2);
        context.fill();
      }
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      drawNetwork();
      drawTrails();
      drawRunners();
      drawSparks();
      drawFlashes();
      if (!reduceMotion) animationFrame = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    observer.observe(canvas);
    resize();
    draw();

    return () => {
      observer.disconnect();
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.ambientCanvas} aria-hidden="true" />;
}
