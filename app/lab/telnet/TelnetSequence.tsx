'use client';

import type { CSSProperties } from 'react';
import StepCallout from '../StepCallout';
import type { Row, RowKind, TelnetStep } from './telnet-data';
import styles from './telnet-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const W = 940;
const TOP = 104;
const ROW_H = 44;
const CX = 150; // client lifeline
const TX = 470; // the observer, sitting between them
const SX = 790; // server lifeline

/** which colour a crossing takes: the secret is red wherever it appears */
const rowColor = (row: Row) =>
  row.kind === 'secret' ? 'var(--rst)'
    : row.kind === 'iac' ? 'var(--sim)'
      : row.dir === 'out' ? 'var(--b)' : 'var(--a)';

const tagFor = (kind: RowKind, line: boolean) =>
  kind === 'iac' ? 'IAC'
    : kind === 'secret' ? 'SECRET'
      : kind === 'keys' ? (line ? 'LINE' : 'KEYS')
        : kind === 'tcp' ? 'TCP' : 'DATA';

const heads: [number, string, string, string, boolean][] = [
  [CX, 'TELNET CLIENT', '192.168.1.10:54118', 'var(--b)', false],
  [TX, 'CAFÉ WI-FI · ON PATH', 'tcpdump -A port 23', 'var(--rst)', true],
  [SX, 'ROUTER · TELNETD', '203.0.113.20:23', 'var(--a)', false],
];

const characterCallouts = [
  'Port 23 — no encryption',
  'I will echo your keystrokes',
  'Username prompt in plain text',
  'Every key makes a round trip',
  'Hidden on screen, visible here',
  'All commands stay readable',
];

const lineCallouts = [
  'Buffer locally, send whole lines',
  'Prompt is still plain text',
  'One line, one segment',
  'Fewer packets, same exposure',
];

export default function TelnetSequence({ steps, step, line, detailed, tick }: {
  steps: TelnetStep[]; step: number; line: boolean; detailed: boolean; tick: number;
}) {
  // every crossing from every step taken so far, in order
  const rows = steps.slice(0, step).flatMap((entry, si) => entry.rows.map((row) => ({ ...row, si })));
  const H = Math.max(360, TOP + Math.max(rows.length, 4) * ROW_H + 50);

  return (
    <svg key={tick} viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`Telnet session sequence with an on-path observer, step ${step} of ${steps.length}`}>
      <defs>
        {[['b', 'var(--b)'], ['a', 'var(--a)'], ['sim', 'var(--sim)'], ['rst', 'var(--rst)']].map(([id, fill]) => (
          <marker key={id} id={`tn-${id}`} markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill={fill} />
          </marker>
        ))}
      </defs>

      {heads.map(([x, title, sub, color, dashed]) => (
        <g key={title}>
          <rect x={x - 117} y={10} width={234} height={56} rx={7}
            fill={`color-mix(in srgb, ${color} 8%, var(--surface2))`} stroke={color} strokeWidth={1.3}
            strokeDasharray={dashed ? '5 4' : undefined} />
          <text x={x} y={32} textAnchor="middle" fill="var(--text)" className={styles.actorName}>{title}</text>
          <text x={x} y={51} textAnchor="middle" fill={color} className={styles.actorAddr}>{sub}</text>
          <line x1={x} y1={66} x2={x} y2={H - 24} stroke={color} strokeWidth={1} strokeDasharray="4 5" opacity={0.5} />
        </g>
      ))}

      {/* the TCP stream both endpoints are sitting on */}
      {step >= 1 && (
        <>
          {[CX, SX].map((x) => (
            <rect key={x} x={x - 3.5} y={TOP - 24} width={7} height={H - TOP + 4} rx={3.5}
              fill="color-mix(in srgb, var(--ok) 30%, transparent)" />
          ))}
          <text x={CX + 14} y={TOP - 30} fill="var(--ok)" className={styles.railLabel}>
            TCP ESTABLISHED · one stream, no message boundaries
          </text>
        </>
      )}

      {/* in line mode the client owns echo, so editing never reaches the wire */}
      {line && step >= 1 && (
        <>
          <rect x={CX - 96} y={TOP - 8} width={96} height={H - TOP - 12} rx={5}
            fill="color-mix(in srgb, var(--b) 9%, transparent)" stroke="var(--b)" strokeWidth={1} strokeDasharray="4 4" />
          <text x={CX - 48} y={TOP + 14} textAnchor="middle" fill="var(--b)" className={styles.echoTitle}>LOCAL ECHO</text>
          <text x={CX - 48} y={TOP + 30} textAnchor="middle" fill="var(--text3)" className={styles.echoNote}>edits never</text>
          <text x={CX - 48} y={TOP + 42} textAnchor="middle" fill="var(--text3)" className={styles.echoNote}>reach the wire</text>
        </>
      )}

      {rows.map((row, i) => {
        const y = TOP + i * ROW_H + 16;
        const active = row.si === step - 1;
        const out = row.dir === 'out';
        const color = rowColor(row);
        const marker = row.kind === 'secret' ? 'rst' : row.kind === 'iac' ? 'sim' : out ? 'b' : 'a';
        const x1 = out ? CX : SX;
        const x2 = out ? SX : CX;
        const len = Math.abs(x2 - x1);

        return (
          <g key={`${row.si}-${i}`}>
            {row.kind === 'secret' && (
              <rect x={CX - 6} y={y - 17} width={SX - CX + 12} height={34} rx={5}
                fill="color-mix(in srgb, var(--rst) 9%, transparent)" />
            )}
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={active ? 2.4 : 1.4}
              opacity={active ? 1 : 0.45} markerEnd={`url(#tn-${marker})`}
              strokeDasharray={active ? len : row.kind === 'keys' ? '6 4' : undefined}
              className={active ? styles.draw : undefined}
              style={active ? ({ '--len': String(len) } as Vars) : undefined} />
            <text x={(CX + SX) / 2} y={y - 8} textAnchor="middle" fill={active ? color : 'var(--text3)'}
              className={styles.rowLabel} data-secret={row.kind === 'secret' || undefined}>{row.label}</text>
            {/* the byte detail sits in the left half so it clears the observer's
                own marker, which claims the space just right of the tap lane */}
            {detailed && (
              <text x={(CX + TX) / 2} y={y + 15} textAnchor="middle" fill="var(--text3)" className={styles.rowTail}>
                {row.tail}
              </text>
            )}
            <circle cx={TX} cy={y} r={active ? 5.4 : 4} fill={row.tap ? 'var(--rst)' : 'var(--text3)'}
              opacity={active ? 1 : 0.55} />
            {row.tap && (
              <text x={TX + 11} y={y + 14} fill="var(--rst)" opacity={active ? 1 : 0.5} className={styles.tapMark}>
                readable
              </text>
            )}
            <text x={12} y={y + 4} fill={color} opacity={active ? 1 : 0.5} className={styles.rowTag}>
              {tagFor(row.kind, line)}
            </text>
          </g>
        );
      })}

      {rows.length === 0 && (
        <>
          <text x={W / 2} y={TOP + 50} textAnchor="middle" fill="var(--text3)" className={styles.idleNote}>
            {line
              ? 'Line mode selected — the client will buffer each line and echo it itself.'
              : 'Character mode selected — every keystroke will leave as its own packet.'}
          </text>
          <text x={W / 2} y={TOP + 74} textAnchor="middle" fill="var(--text3)" className={styles.idleSub}>
            press Open session to begin · the café access point is already capturing
          </text>
        </>
      )}

      {step > 0 && (() => {
        const current = steps[step - 1];
        const latest = current.rows[current.rows.length - 1];
        const y = TOP + (rows.length - 1) * ROW_H + 16;
        const observerActs = current.tag === 'PASSWORD' || current.tag === 'PROMPT';
        const fromClient = latest.dir === 'out';
        return (
          <StepCallout
            key={`callout-${step}-${line}-${tick}`}
            x={observerActs ? TX : fromClient ? CX + 54 : SX - 54}
            y={observerActs ? y - 14 : y}
            side={observerActs ? 'up' : fromClient ? 'left' : 'right'}
            text={(line ? lineCallouts : characterCallouts)[step - 1]}
            tone={observerActs ? 'var(--rst)' : rowColor(latest)}
            width={W}
            height={H}
          />
        );
      })()}
    </svg>
  );
}
