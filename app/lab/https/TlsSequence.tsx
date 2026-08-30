'use client';

import type { CSSProperties } from 'react';
import StepCallout from '../StepCallout';
import { ENCRYPTED_FROM, startLine, type Dir, type TlsStep } from './https-data';
import styles from './https-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const W = 940;
const CX = 124;
const MX = 470;
const SX = 816;
const TOP = 132;
const GAP = 52;

const dirColor: Record<Dir, string> = {
  out: 'var(--b)',
  in: 'var(--a)',
  self: 'var(--text3)',
  pipe: 'var(--ok)',
  both: 'var(--sim)',
};

const tlsCallouts = [
  'TCP is open, but not secure',
  'Here are my TLS options',
  'Here is my certificate',
  'Do I trust this certificate?',
  'We now share secret keys',
  'This request is ciphertext',
  'Encrypted response coming back',
];

const plainCallouts = [
  'Port 80 gives no protection',
  'Password sent as readable text',
  'I can read the whole request',
  'Response is readable too',
];

export default function TlsSequence({ steps, step, plain, packetMode, tick }: {
  steps: TlsStep[]; step: number; plain: boolean; packetMode: boolean; tick: number;
}) {
  const H = TOP + steps.length * GAP + 30;
  const tapCol = plain ? 'var(--rst)' : 'var(--ok)';
  const piped = step >= 1;
  // on the plain wire nothing is ever sealed, so push the boundary out of reach
  const encFrom = plain ? Number.POSITIVE_INFINITY : ENCRYPTED_FROM;

  const actors: [number, string, string][] = [
    [CX, 'BROWSER', 'PC-1 · 192.168.1.10'],
    [SX, 'WEB SERVER', plain ? '203.0.113.20 : 80' : '203.0.113.20 : 443'],
  ];

  return (
    <svg key={`${tick}-${plain}`} viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`TLS handshake and encrypted HTTP exchange, step ${step} of ${steps.length}`}>
      <defs>
        <marker id="tls-out" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={dirColor.out} />
        </marker>
        <marker id="tls-in" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={dirColor.in} />
        </marker>
        <marker id="tls-self" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={dirColor.self} />
        </marker>
        <marker id="tls-self-r" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--rst)" />
        </marker>
      </defs>

      {actors.map(([x, title, sub]) => (
        <g key={title}>
          <rect x={x - 100} y={14} width={200} height={60} rx={7} fill="var(--surface2)" stroke="var(--line)" />
          <text x={x} y={37} textAnchor="middle" fill="var(--text)" className={styles.actorName}>{title}</text>
          <text x={x} y={57} textAnchor="middle" fill="var(--text3)" className={styles.actorAddr}>{sub}</text>
          <line x1={x} y1={76} x2={x} y2={H - 14} stroke="var(--line)" strokeWidth={1} strokeDasharray="3 5" />
        </g>
      ))}

      {/* the on-path observer lane — the whole point of the lab */}
      <rect x={MX - 104} y={14} width={208} height={60} rx={7}
        fill={`color-mix(in srgb, ${tapCol} 10%, var(--surface2))`} stroke={tapCol} strokeDasharray="4 3" />
      <text x={MX} y={37} textAnchor="middle" fill={tapCol} className={styles.actorName}>ON-PATH OBSERVER</text>
      <text x={MX} y={57} textAnchor="middle" fill="var(--text3)" className={styles.observerSub}>café wi-fi · isp · proxy</text>
      <line x1={MX} y1={76} x2={MX} y2={H - 14} stroke={tapCol} strokeWidth={1} strokeDasharray="2 6" opacity={0.7} />

      {/* transport rail */}
      <rect x={CX + 8} y={TOP - 58} width={SX - CX - 16} height={15} rx={7.5}
        fill={piped ? 'color-mix(in srgb, var(--ok) 14%, transparent)' : 'transparent'}
        stroke={piped ? 'var(--ok)' : 'var(--line)'} strokeDasharray={piped ? undefined : '4 4'} />
      <text x={(CX + SX) / 2} y={TOP - 47} textAnchor="middle" fill={piped ? 'var(--ok)' : 'var(--text3)'}
        className={styles.railLabel}>
        {piped ? 'TCP ESTABLISHED — an ordinary, unencrypted pipe' : 'tcp connection'}
      </text>

      {/* the record layer, drawn over the rows whose bytes are sealed */}
      {!plain && step > encFrom && (
        <>
          <rect x={CX - 108} y={TOP + encFrom * GAP - 4} width={SX - CX + 216} height={(step - encFrom) * GAP + 16}
            rx={8} fill="color-mix(in srgb, var(--ok) 7%, transparent)" stroke="var(--ok)" strokeDasharray="5 4" />
          <text x={CX - 100} y={TOP + encFrom * GAP + 12} fill="var(--ok)" className={styles.railLabel}>
            TLS RECORD LAYER — sealed with AES-128-GCM
          </text>
        </>
      )}

      {!plain && step >= 5 && (
        <>
          <rect x={CX + 8} y={TOP - 36} width={SX - CX - 16} height={15} rx={7.5}
            fill="color-mix(in srgb, var(--sim) 16%, transparent)" stroke="var(--sim)" />
          <text x={(CX + SX) / 2} y={TOP - 25} textAnchor="middle" fill="var(--sim)" className={styles.railLabel}>
            shared keys derived — identical on both ends, never transmitted
          </text>
        </>
      )}

      {steps.slice(0, step).map((entry, i) => {
        const y = TOP + i * GAP + 18;
        const live = i === step - 1;
        const color = dirColor[entry.dir];
        const sealed = !plain && i >= encFrom;

        if (entry.dir === 'pipe') {
          return (
            <text key={entry.at} x={(CX + SX) / 2} y={y + 4} textAnchor="middle" fill={dirColor.pipe}
              className={styles.arrowLabel}>
              ↑ transport ready — nothing secured yet
            </text>
          );
        }

        if (entry.dir === 'self') {
          // on the plain wire the "work" is the observer reading, so it sits mid-lane
          const atX = plain ? MX : CX;
          return (
            <g key={entry.at}>
              <path d={`M ${atX + 14} ${y - 10} h 22 a 10 10 0 0 1 0 20 h -22`} fill="none"
                stroke={plain ? tapCol : color} strokeWidth={1.4}
                markerEnd={plain ? 'url(#tls-self-r)' : 'url(#tls-self)'} />
              <text x={atX + 56} y={y + 4} fill={live ? 'var(--text)' : 'var(--text2)'}
                className={styles.arrowLabel} data-live={live}>{entry.at}</text>
            </g>
          );
        }

        if (entry.dir === 'both') {
          return (
            <g key={entry.at}>
              <line x1={CX} y1={y} x2={SX} y2={y} stroke={color} strokeWidth={live ? 2 : 1.4}
                strokeDasharray="6 5" opacity={live ? 1 : 0.7} />
              {[CX, SX].map((x) => (
                <circle key={x} cx={x} cy={y} r={5} fill="var(--surface)" stroke={color} strokeWidth={2} />
              ))}
              <text x={MX} y={y + 17} textAnchor="middle" fill="var(--sim)" className={styles.tapLabel}>
                nothing crosses the wire
              </text>
              <text x={(CX + SX) / 2} y={y - 9} textAnchor="middle" fill={live ? 'var(--text)' : 'var(--text2)'}
                className={`${styles.arrowLabel} ${styles.fade}`} data-live={live}>{entry.at}</text>
            </g>
          );
        }

        const out = entry.dir === 'out';
        const x1 = out ? CX : SX;
        const x2 = out ? SX : CX;
        const len = Math.abs(x2 - x1);

        // what the observer picks off this particular crossing
        let tapText: string;
        let tapTextColor: string;
        if (plain) { tapText = 'readable'; tapTextColor = tapCol; }
        else if (sealed) { tapText = 'ciphertext'; tapTextColor = 'var(--ok)'; }
        else if (i === 1) { tapText = 'cleartext · sni visible'; tapTextColor = 'var(--a)'; }
        else { tapText = 'hello clear · cert sealed'; tapTextColor = 'var(--a)'; }

        return (
          <g key={entry.at}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={live ? 2 : 1.4}
              markerEnd={out ? 'url(#tls-out)' : 'url(#tls-in)'} strokeDasharray={len}
              className={styles.draw} style={{ '--len': String(len), opacity: live ? 1 : 0.72 } as Vars} />
            <text x={(CX + SX) / 2} y={y - 9} textAnchor="middle" fill={live ? 'var(--text)' : 'var(--text2)'}
              className={`${styles.arrowLabel} ${styles.fade}`} data-live={live}>{entry.at}</text>
            <circle cx={MX} cy={y} r={4.5} fill={tapTextColor} />
            <text x={MX} y={y + 17} textAnchor="middle" fill={tapTextColor} className={styles.tapLabel}>{tapText}</text>
            {packetMode && (
              <text x={(CX + SX) / 2} y={y + 31} textAnchor="middle" fill="var(--text3)" className={styles.arrowPacket}>
                {startLine(entry.packet).slice(0, 78)}
              </text>
            )}
          </g>
        );
      })}

      {step === 0 && (
        <text x={W / 2} y={TOP + 40} textAnchor="middle" fill="var(--text3)" className={styles.idleNote}>
          {plain
            ? 'Port 80. There is nothing to negotiate — the first thing sent is the request itself.'
            : 'Port 443. Before a single byte of HTTP, two strangers have to agree on a secret.'}
        </text>
      )}

      {step > 0 && (() => {
        const current = steps[step - 1];
        const y = TOP + (step - 1) * GAP + 18;
        const observerActs = plain && current.dir === 'self';
        const bothAct = current.dir === 'both';
        const fromClient = current.dir === 'out' || current.dir === 'pipe';
        return (
          <StepCallout
            key={`callout-${step}-${plain}-${tick}`}
            x={observerActs || bothAct ? MX : fromClient || current.dir === 'self' ? CX + 54 : SX - 54}
            y={observerActs || bothAct ? y - 14 : y}
            side={observerActs || bothAct ? 'up' : fromClient || current.dir === 'self' ? 'left' : 'right'}
            text={(plain ? plainCallouts : tlsCallouts)[step - 1]}
            tone={observerActs ? 'var(--rst)' : bothAct ? 'var(--sim)' : current.dir === 'pipe' ? 'var(--ok)' : current.dir === 'out' ? 'var(--b)' : 'var(--a)'}
            width={W}
            height={H}
          />
        );
      })()}
    </svg>
  );
}
