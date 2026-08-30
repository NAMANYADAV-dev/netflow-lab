'use client';

import type { CSSProperties } from 'react';
import StepCallout from '../StepCallout';
import { startLine, type HttpStep } from './http-data';
import styles from './http-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const W = 920;
const CX = 132;
const SX = 788;
const TOP = 104;
const GAP = 52;

const dirColor: Record<HttpStep['dir'], string> = {
  out: 'var(--b)',
  in: 'var(--a)',
  self: 'var(--text3)',
  pipe: 'var(--ok)',
};

const lifelines = [
  { x: CX, title: 'BROWSER', sub: 'PC-1 · 192.168.1.10' },
  { x: SX, title: 'WEB SERVER', sub: '203.0.113.20 : 80' },
];

const calloutFor = (at: string) => {
  if (at.startsWith('TCP connection already')) return 'The transport pipe is ready';
  if (at.startsWith('TCP connection reused')) return 'Reuse the same connection';
  if (at.startsWith('GET /index')) return 'Please send index.html';
  if (at.startsWith('Server resolves')) return 'I found the requested file';
  if (at.startsWith('200 OK')) return 'Request accepted';
  if (at.startsWith('Body streams')) return 'Here come 13,412 bytes';
  if (at.startsWith('3 more requests')) return 'Fetch the page assets too';
  if (at.startsWith('Conditional GET')) return 'Has this file changed?';
  if (at.startsWith('Server compares')) return 'The ETag still matches';
  return 'Use your cached copy';
};

export default function HttpSequence({ steps, step, packetMode, tick }: {
  steps: HttpStep[]; step: number; packetMode: boolean; tick: number;
}) {
  const H = TOP + steps.length * GAP + 34;
  const piped = step >= 1;

  return (
    // remounting on every advance replays the arrow-draw animation
    <svg key={`${tick}-${steps.length}`} viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`HTTP request and response sequence, step ${step} of ${steps.length}`}>
      <defs>
        <marker id="http-out" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={dirColor.out} />
        </marker>
        <marker id="http-in" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={dirColor.in} />
        </marker>
        <marker id="http-self" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={dirColor.self} />
        </marker>
      </defs>

      {lifelines.map((line) => (
        <g key={line.title}>
          <rect x={line.x - 104} y={14} width={208} height={62} rx={7} fill="var(--surface2)" stroke="var(--line)" />
          <text x={line.x} y={38} textAnchor="middle" fill="var(--text)" className={styles.actorName}>{line.title}</text>
          <text x={line.x} y={58} textAnchor="middle" fill="var(--text3)" className={styles.actorAddr}>{line.sub}</text>
          <line x1={line.x} y1={78} x2={line.x} y2={H - 18} stroke="var(--line)" strokeWidth={1} strokeDasharray="3 5" />
        </g>
      ))}

      {/* the TCP rail is always drawn — HTTP never moves bytes itself */}
      <rect x={CX + 8} y={TOP - 30} width={SX - CX - 16} height={16} rx={8}
        fill={piped ? 'color-mix(in srgb, var(--ok) 14%, transparent)' : 'transparent'}
        stroke={piped ? 'var(--ok)' : 'var(--line)'} strokeDasharray={piped ? undefined : '4 4'} />
      <text x={(CX + SX) / 2} y={TOP - 18} textAnchor="middle" fill={piped ? 'var(--ok)' : 'var(--text3)'}
        className={styles.railLabel}>
        {piped ? 'TCP ESTABLISHED — the pipe HTTP talks through' : 'tcp connection'}
      </text>

      {steps.slice(0, step).map((entry, i) => {
        const y = TOP + i * GAP + 18;
        const live = i === step - 1;
        const color = dirColor[entry.dir];

        if (entry.dir === 'pipe') {
          return (
            <text key={entry.at} x={(CX + SX) / 2} y={y + 4} textAnchor="middle" fill={dirColor.pipe}
              className={styles.arrowLabel}>
              ↑ no HTTP bytes yet — the transport is ready
            </text>
          );
        }

        if (entry.dir === 'self') {
          return (
            <g key={entry.at}>
              <path d={`M ${SX + 18} ${y - 9} h 34 a 9 9 0 0 1 0 18 h -34`} fill="none" stroke={color}
                strokeWidth={1.4} markerEnd="url(#http-self)" />
              <text x={SX - 14} y={y - 6} textAnchor="end" fill={live ? 'var(--text)' : 'var(--text2)'}
                className={styles.arrowLabel} data-live={live}>{entry.at}</text>
            </g>
          );
        }

        const out = entry.dir === 'out';
        const x1 = out ? CX : SX;
        const x2 = out ? SX : CX;
        const len = Math.abs(x2 - x1);

        return (
          <g key={entry.at}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={live ? 2 : 1.4}
              markerEnd={out ? 'url(#http-out)' : 'url(#http-in)'} strokeDasharray={len}
              className={styles.draw} style={{ '--len': String(len), opacity: live ? 1 : 0.72 } as Vars} />
            <text x={(CX + SX) / 2} y={y - 9} textAnchor="middle" fill={live ? 'var(--text)' : 'var(--text2)'}
              className={`${styles.arrowLabel} ${styles.fade}`} data-live={live}>{entry.at}</text>
            {packetMode && (
              <text x={(CX + SX) / 2} y={y + 15} textAnchor="middle" fill="var(--text3)" className={styles.arrowPacket}>
                {startLine(entry.packet).slice(0, 74)}
              </text>
            )}
          </g>
        );
      })}

      {step === 0 && (
        <text x={W / 2} y={TOP + 52} textAnchor="middle" fill="var(--text3)" className={styles.idleNote}>
          The socket is open. HTTP has not said anything yet.
        </text>
      )}

      {step > 0 && (() => {
        const current = steps[step - 1];
        const fromClient = current.dir === 'out' || current.dir === 'pipe';
        return (
          <StepCallout
            key={`callout-${step}-${tick}`}
            x={fromClient ? CX + 54 : SX - 54}
            y={TOP + (step - 1) * GAP + 18}
            side={fromClient ? 'left' : 'right'}
            text={calloutFor(current.at)}
            tone={current.dir === 'pipe' ? 'var(--ok)' : current.dir === 'out' ? 'var(--b)' : 'var(--a)'}
            width={W}
            height={H}
          />
        );
      })()}
    </svg>
  );
}
