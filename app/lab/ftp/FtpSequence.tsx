'use client';

import type { CSSProperties } from 'react';
import StepCallout from '../StepCallout';
import { startLine, type Dir, type FtpStep } from './ftp-data';
import styles from './ftp-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const W = 940;
const CX = 126; // client
const MX = 468; // the home router, sitting between them
const SX = 812; // server
const TOP = 136;
const GAP = 54;

const dirColor: Record<Dir, string> = {
  out: 'var(--b)',
  in: 'var(--a)',
  pipe: 'var(--ok)',
  drop: 'var(--rst)',
};

const passiveCallouts = [
  'Let’s talk on port 21',
  'Credentials cross in clear',
  'Open a data port for me',
  'Use data port 50000',
  'Opening the second connection',
  'The file travels here',
  'Transfer done — data pipe closes',
];

const activeCallouts = [
  'Let’s talk on port 21',
  'Credentials cross in clear',
  'Call my private address back',
  'Server starts the callback',
  'NAT blocks this new connection',
  '425: no data connection',
];

export default function FtpSequence({ steps, step, active, packetMode, tick }: {
  steps: FtpStep[]; step: number; active: boolean; packetMode: boolean; tick: number;
}) {
  const H = TOP + steps.length * GAP + 30;
  const dataOpen = !active && step >= 5;
  const failed = active && step >= 5;
  const ctrlUp = step >= 1;
  const routerColor = failed ? 'var(--rst)' : active ? 'var(--a)' : 'var(--text3)';

  return (
    <svg key={`${tick}-${active}`} viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`FTP control and data connections, step ${step} of ${steps.length}`}>
      <defs>
        <marker id="fp-out" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--b)" />
        </marker>
        <marker id="fp-in" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--a)" />
        </marker>
        <marker id="fp-data" markerWidth={10} markerHeight={10} refX={8.5} refY={5} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--a)" />
        </marker>
      </defs>

      {([[CX, 'FTP CLIENT', '192.168.1.10'], [SX, 'FTP SERVER', '203.0.113.20']] as [number, string, string][])
        .map(([x, title, sub]) => (
          <g key={title}>
            <rect x={x - 100} y={14} width={200} height={60} rx={7} fill="var(--surface2)" stroke="var(--line)" />
            <text x={x} y={37} textAnchor="middle" fill="var(--text)" className={styles.actorName}>{title}</text>
            <text x={x} y={57} textAnchor="middle" fill="var(--text3)" className={styles.actorAddr}>{sub}</text>
            <line x1={x} y1={76} x2={x} y2={H - 14} stroke="var(--line)" strokeWidth={1} strokeDasharray="3 5" />
          </g>
        ))}

      {/* the router lane — benign in passive, fatal in active */}
      <rect x={MX - 104} y={14} width={208} height={60} rx={7}
        fill={failed ? 'color-mix(in srgb, var(--rst) 12%, var(--surface2))' : 'var(--surface2)'}
        stroke={routerColor} strokeDasharray="4 3" />
      <text x={MX} y={37} textAnchor="middle" fill={routerColor} className={styles.actorName}>HOME ROUTER · NAT</text>
      <text x={MX} y={57} textAnchor="middle" fill="var(--text3)" className={styles.routerSub}>wan 80.12.16.10</text>
      <line x1={MX} y1={76} x2={MX} y2={H - 14} stroke={routerColor} strokeWidth={1} strokeDasharray="2 6" opacity={0.7} />

      {/* the control rail — open the whole session, never carrying a file */}
      <rect x={CX + 8} y={TOP - 62} width={SX - CX - 16} height={15} rx={7.5}
        fill={ctrlUp ? 'color-mix(in srgb, var(--ok) 14%, transparent)' : 'transparent'}
        stroke={ctrlUp ? 'var(--ok)' : 'var(--line)'} strokeDasharray={ctrlUp ? undefined : '4 4'} />
      <text x={(CX + SX) / 2} y={TOP - 51} textAnchor="middle" fill={ctrlUp ? 'var(--ok)' : 'var(--text3)'}
        className={styles.railLabel}>
        {ctrlUp ? 'CONTROL · 51120 ↔ 21 · open all session · 0 file bytes' : 'control connection · port 21'}
      </text>

      {/* the data rail — a second, separate connection */}
      <rect x={CX + 8} y={TOP - 40} width={SX - CX - 16} height={15} rx={7.5}
        fill={dataOpen ? 'color-mix(in srgb, var(--a) 16%, transparent)'
          : failed ? 'color-mix(in srgb, var(--rst) 12%, transparent)' : 'transparent'}
        stroke={dataOpen ? 'var(--a)' : failed ? 'var(--rst)' : 'var(--line)'}
        strokeDasharray={dataOpen ? undefined : '4 4'} />
      <text x={(CX + SX) / 2} y={TOP - 29} textAnchor="middle"
        fill={dataOpen ? 'var(--a)' : failed ? 'var(--rst)' : 'var(--text3)'} className={styles.railLabel}>
        {dataOpen
          ? 'DATA · 51121 ↔ 50000 · one connection per transfer, then closed'
          : failed
            ? 'DATA · never established — the server could not reach the client'
            : 'data connection · port not known yet'}
      </text>

      {steps.slice(0, step).map((entry, i) => {
        const y = TOP + i * GAP + 18;
        const live = i === step - 1;
        const isData = entry.chan === 'data';

        if (entry.dir === 'pipe') {
          return (
            <text key={entry.at} x={(CX + SX) / 2} y={y + 4} textAnchor="middle" fill={dirColor.pipe}
              className={styles.arrowLabel}>
              ↑ talking connection up — nothing can carry a file yet
            </text>
          );
        }

        if (entry.dir === 'drop') {
          const len = SX - MX;
          return (
            <g key={entry.at}>
              <line x1={SX} y1={y} x2={MX} y2={y} stroke="var(--rst)" strokeWidth={live ? 2.4 : 1.6}
                strokeDasharray={len} className={styles.draw} style={{ '--len': String(len) } as Vars} />
              <g stroke="var(--rst)" strokeWidth={2.6}>
                <line x1={MX - 9} y1={y - 9} x2={MX + 9} y2={y + 9} />
                <line x1={MX + 9} y1={y - 9} x2={MX - 9} y2={y + 9} />
              </g>
              <text x={(MX + SX) / 2} y={y - 10} textAnchor="middle" fill="var(--rst)" className={styles.dropLabel}>
                inbound SYN — unsolicited
              </text>
              <text x={MX - 16} y={y + 5} textAnchor="end" fill="var(--rst)" className={styles.dropNote}>
                dropped · no NAT entry
              </text>
            </g>
          );
        }

        const out = entry.dir === 'out';
        const x1 = out ? CX : SX;
        const x2 = out ? SX : CX;
        const len = Math.abs(x2 - x1);
        const stroke = isData ? 'var(--a)' : dirColor[entry.dir];
        const marker = isData ? 'fp-data' : out ? 'fp-out' : 'fp-in';

        return (
          <g key={entry.at}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={stroke}
              strokeWidth={isData ? (live ? 3 : 2.2) : live ? 2 : 1.4} markerEnd={`url(#${marker})`}
              strokeDasharray={len} className={styles.draw}
              style={{ '--len': String(len), opacity: live ? 1 : 0.72 } as Vars} />
            <text x={(CX + SX) / 2} y={y - 9} textAnchor="middle" fill={live ? 'var(--text)' : 'var(--text2)'}
              className={`${styles.arrowLabel} ${styles.fade}`} data-live={live}>{entry.at}</text>
            {/* which of the two connections carried it, in the margin */}
            <text x={out ? CX - 104 : SX + 104} y={y + 4} textAnchor={out ? 'start' : 'end'}
              fill={isData ? 'var(--a)' : 'var(--ok)'} className={styles.chanTag}>
              {isData ? 'DATA' : 'CTRL'}
            </text>
            {packetMode && (
              <text x={(CX + SX) / 2} y={y + 16} textAnchor="middle" fill="var(--text3)" className={styles.arrowPacket}>
                {startLine(entry.packet).slice(0, 78)}
              </text>
            )}
          </g>
        );
      })}

      {step === 0 && (
        <text x={W / 2} y={TOP + 38} textAnchor="middle" fill="var(--text3)" className={styles.idleNote}>
          {active
            ? 'Active mode: the client will ask the server to dial it back. Watch where that goes.'
            : 'Passive mode: the client will end up dialling twice. Nothing is connected yet.'}
        </text>
      )}

      {step > 0 && (() => {
        const current = steps[step - 1];
        const y = TOP + (step - 1) * GAP + 18;
        const fromClient = current.dir === 'out' || current.dir === 'pipe';
        const blocked = current.dir === 'drop';
        return (
          <StepCallout
            key={`callout-${step}-${active}-${tick}`}
            x={blocked ? MX - 18 : fromClient ? CX + 54 : SX - 54}
            y={y}
            side={blocked ? 'left' : fromClient ? 'left' : 'right'}
            text={(active ? activeCallouts : passiveCallouts)[step - 1]}
            tone={blocked ? 'var(--rst)' : current.chan === 'data' ? 'var(--a)' : fromClient ? 'var(--b)' : 'var(--a)'}
            width={W}
            height={H}
          />
        );
      })()}
    </svg>
  );
}
