'use client';

import type { CSSProperties } from 'react';
import { Desktop, HardDrives } from '@phosphor-icons/react';
import StepCallout from '../StepCallout';
import styles from './tcp-lab.module.css';

/* what the segment on this step amounts to, said the way a person would */
const callouts: Record<number, { t: string; c: string }> = {
  1: { t: 'Can we talk?', c: 'var(--a)' },
  2: { t: 'Yes — and same to you', c: 'var(--b)' },
  3: { t: 'Pipe is open', c: 'var(--ok)' },
  4: { t: 'I’m done sending', c: 'var(--rst)' },
  5: { t: 'Heard your goodbye', c: 'var(--b)' },
  6: { t: 'I’m done too', c: 'var(--rst)' },
  7: { t: 'Both halves shut', c: 'var(--ok)' },
};

/* The sequence diagram: two lifelines and one arrow per segment sent so far.

   The stage grows a row at a time rather than reserving space for all seven,
   so the picture matches how far the connection has actually got. Only the
   newest arrow is at full strength and carries the travelling segment; the
   ones behind it fade back into history. */

export type Segment = {
  dir: 'cs' | 'sc';
  flags: string[];
  seq: number;
  ack: number | null;
  simple: string;
  technical: string;
};

export const flagColor = (flag: string) =>
  flag === 'SYN' ? 'var(--a)' : flag === 'FIN' ? 'var(--rst)' : 'var(--b)';

const C_X = 120;
const S_X = 430;
const TOP = 64;
const GAP = 64;
const W = 550;

function Head({ x, label, ip, color, kind, height }: {
  x: number; label: string; ip: string; color: string; kind: 'client' | 'server'; height: number;
}) {
  const Icon = kind === 'client' ? Desktop : HardDrives;
  return (
    <g>
      <rect x={x - 54} y={20} width={108} height={30} rx={4} fill="var(--surface2)" stroke={color} strokeWidth={1.5} />
      <foreignObject x={x - 42} y={27} width={18} height={18}>
        <div className={styles.node}>
          <Icon weight="duotone" size={16} color={color} />
        </div>
      </foreignObject>
      <text x={x + 10} y={39} textAnchor="middle" fontFamily="var(--sans)" fontWeight={650} fontSize={13} fill={color}>
        {label}
      </text>
      <text x={x} y={height - 6} textAnchor="middle" fontFamily="var(--mono)" fontSize={9.5} fill="var(--text3)">
        {ip}
      </text>
    </g>
  );
}

export default function TcpSequence({ phase, segments, tick }: {
  phase: number; segments: Segment[]; tick: number;
}) {
  const rows = Math.max(1, phase);
  const H = TOP + rows * GAP + 40;
  const establishedY = TOP + 3 * GAP + 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`TCP sequence, ${phase} of 7 segments sent`}>
      <defs>
        <marker id="tcp-arrow-cs" markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill="var(--text2)" />
        </marker>
        <marker id="tcp-arrow-sc" markerWidth={8} markerHeight={8} refX={1} refY={4} orient="auto">
          <path d="M8 0 L0 4 L8 8 Z" fill="var(--text2)" />
        </marker>
      </defs>

      <line x1={C_X} y1={TOP - 6} x2={C_X} y2={H - 20} stroke="var(--line)" strokeWidth={1.5} strokeDasharray="2 5" />
      <line x1={S_X} y1={TOP - 6} x2={S_X} y2={H - 20} stroke="var(--line)" strokeWidth={1.5} strokeDasharray="2 5" />

      <Head x={C_X} label="CLIENT" ip="10.0.0.5:49152" color="var(--a)" kind="client" height={H} />
      <Head x={S_X} label="SERVER" ip="…216.34:443" color="var(--b)" kind="server" height={H} />

      {segments.slice(0, phase).map((segment, index) => {
        const y0 = TOP + index * GAP + 18;
        const y1 = y0 + 34;
        const fromX = segment.dir === 'cs' ? C_X : S_X;
        const toX = segment.dir === 'cs' ? S_X : C_X;
        const color = flagColor(segment.flags[0]);
        const isLast = index === phase - 1;
        const lx = (fromX + toX) / 2;
        const ly = (y0 + y1) / 2;
        const path = `M ${fromX} ${y0} L ${toX} ${y1}`;

        return (
          <g key={index}>
            <line
              x1={fromX} y1={y0} x2={toX} y2={y1}
              stroke={color}
              strokeWidth={1.6}
              opacity={isLast ? 1 : 0.5}
              markerEnd={`url(#tcp-arrow-${segment.dir})`}
            />
            <text x={lx} y={ly - 8} textAnchor="middle" fontFamily="var(--mono)" fontSize={11} fontWeight={500}
              fill={color} opacity={isLast ? 1 : 0.7}>
              {segment.flags.join(', ')}
            </text>
            <text x={lx} y={ly + 14} textAnchor="middle" fontFamily="var(--mono)" fontSize={9.5}
              fill="var(--text3)" opacity={isLast ? 1 : 0.6}>
              {`seq=${segment.seq}${segment.ack != null ? `  ack=${segment.ack}` : ''}`}
            </text>
            {isLast && (
              <rect
                key={`flight-${tick}`}
                width={20} height={10} rx={2} fill={color}
                className={styles.flight}
                style={{
                  offsetPath: `path('${path}')`,
                  filter: `drop-shadow(0 0 5px ${color})`,
                } as CSSProperties}
              />
            )}
          </g>
        );
      })}

      {phase >= 3 && (
        <>
          <rect
            x={C_X} y={establishedY - 11} width={S_X - C_X} height={22} rx={4}
            fill="color-mix(in srgb, var(--ok) 14%, transparent)"
            stroke="var(--ok)" strokeWidth={1}
            opacity={phase === 3 ? 1 : 0.5}
          />
          <text x={(C_X + S_X) / 2} y={establishedY + 4} textAnchor="middle" fontFamily="var(--mono)"
            fontSize={10} fontWeight={500} fill="var(--ok)">
            ESTABLISHED — data may flow
          </text>
        </>
      )}

      {/* the callout hangs off whichever lifeline sent this segment */}
      {phase > 0 && callouts[phase] && segments[phase - 1] && (() => {
        const fromClient = segments[phase - 1].dir === 'cs';
        return (
          <StepCallout
            key={`callout-${phase}-${tick}`}
            x={fromClient ? C_X - 14 : S_X + 14}
            y={TOP + (phase - 1) * GAP + 35}
            side={fromClient ? 'left' : 'right'}
            text={callouts[phase].t}
            tone={callouts[phase].c}
            width={W}
            height={H}
          />
        );
      })()}
    </svg>
  );
}
