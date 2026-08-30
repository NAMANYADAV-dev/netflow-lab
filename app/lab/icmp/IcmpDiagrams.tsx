'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  Cloud,
  Desktop,
  GlobeHemisphereWest,
  HardDrives,
  Network,
} from '@phosphor-icons/react';
import StepCallout from '../StepCallout';
import type { IcmpStep } from './icmp-data';
import styles from './icmp-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const A = 'var(--a)';
const B = 'var(--b)';
const OK = 'var(--ok)';
const RST = 'var(--rst)';
const LINE = 'var(--line)';
const T3 = 'var(--text3)';

/* ------------------------------------------------------ ping: the topology */

type Node = {
  x: number; y: number; w: number; h: number;
  label: string; sub: string; icon: ReactNode; color: string;
};

const icon = (node: ReactNode) => node;

const nodes: Record<string, Node> = {
  pc1: { x: 10, y: 18, w: 124, h: 44, label: 'PC-1', sub: '192.168.1.10', icon: icon(<Desktop weight="duotone" size={14} />), color: A },
  pc2: { x: 10, y: 86, w: 124, h: 44, label: 'PC-2', sub: '192.168.1.20', icon: icon(<Desktop weight="duotone" size={14} />), color: T3 },
  pc3: { x: 10, y: 154, w: 124, h: 44, label: 'PC-3', sub: '192.168.1.23', icon: icon(<Desktop weight="duotone" size={14} />), color: T3 },
  pc4: { x: 10, y: 222, w: 124, h: 44, label: 'PC-4', sub: '192.168.1.25', icon: icon(<Desktop weight="duotone" size={14} />), color: T3 },
  sw: { x: 196, y: 120, w: 112, h: 46, label: 'LAN SWITCH', sub: 'layer 2', icon: icon(<Network weight="duotone" size={14} />), color: 'var(--text2)' },
  rt: { x: 368, y: 100, w: 168, h: 86, label: 'ROUTER  hop 1', sub: '192.168.1.1', icon: icon(<HardDrives weight="duotone" size={14} />), color: B },
  isp: { x: 596, y: 110, w: 126, h: 66, label: 'ISP  hop 2', sub: '80.12.16.1', icon: icon(<GlobeHemisphereWest weight="duotone" size={14} />), color: 'var(--text2)' },
  web: { x: 782, y: 104, w: 150, h: 78, label: 'WEB SERVER', sub: '203.0.113.20', icon: icon(<Cloud weight="duotone" size={14} />), color: B },
};

const links: [string, string][] = [
  ['pc1', 'sw'], ['pc2', 'sw'], ['pc3', 'sw'], ['pc4', 'sw'],
  ['sw', 'rt'], ['rt', 'isp'], ['isp', 'web'],
];

const chain = ['pc1', 'sw', 'rt', 'isp', 'web'];

const centre = (n: Node) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

const edge = (a: Node, b: Node) =>
  a.x > b.x
    ? { x1: a.x, y1: centre(a).y, x2: b.x + b.w, y2: centre(b).y }
    : { x1: a.x + a.w, y1: centre(a).y, x2: b.x, y2: centre(b).y };

const TOPO_W = 946;
const TOPO_H = 286;

const pingCallouts = [
  'Echo request leaves PC-1',
  'Router lowers TTL to 63',
  'ISP lowers TTL to 62',
  'Are you there?',
  'Yes — I am here',
];

export function PingTopology({ step, current, tick }: {
  step: number; current: IcmpStep | null; tick: number;
}) {
  const reachIdx = current ? chain.indexOf(current.from ?? current.to) : -1;
  const arcFrom = current ? (current.from ?? current.to) : null;

  return (
    <svg viewBox={`0 0 ${TOPO_W} ${TOPO_H}`} role="img" aria-label={`Ping path, step ${step} of 5`}>
      <rect x={2} y={4} width={342} height={276} rx={7} fill="none" stroke={LINE} strokeWidth={1.2} strokeDasharray="6 5" opacity={0.5} />
      <text x={10} y={277} fontFamily="var(--mono)" fontSize={9} fill={T3}>LAN  192.168.1.0/24</text>
      <text x={600} y={277} fontFamily="var(--mono)" fontSize={9} fill={T3}>PUBLIC INTERNET</text>

      {links.map(([aKey, bKey], index) => {
        const e = edge(nodes[aKey], nodes[bKey]);
        const ai = chain.indexOf(aKey);
        const bi = chain.indexOf(bKey);
        const on = Boolean(current) && ai >= 0 && bi >= 0 && Math.max(ai, bi) <= reachIdx;
        const color = current?.kind === 'expire' && Math.max(ai, bi) === reachIdx ? RST : B;
        return (
          <line key={index} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={on ? color : LINE} strokeWidth={on ? 2 : 1.4} opacity={on ? 1 : 0.75} />
        );
      })}

      {Object.entries(nodes).map(([key, node]) => {
        const isHere = current?.to === key;
        const died = isHere && current?.kind === 'expire';
        const inPath = chain.includes(key);
        const stroke = died ? RST : isHere ? B : inPath ? node.color : LINE;
        const ttl = current && key in current.ttlAt ? current.ttlAt[key] : null;
        const zero = ttl === 0;

        return (
          <g key={key}>
            <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={5}
              fill="var(--surface2)" stroke={stroke} strokeWidth={isHere ? 2 : 1.4} opacity={inPath ? 1 : 0.62} />
            {isHere && (
              <rect key={`ring-${tick}`} x={node.x - 4} y={node.y - 4} width={node.w + 8} height={node.h + 8} rx={7}
                fill="none" stroke={stroke} strokeWidth={1.4} className={styles.ring}
                style={{ transformOrigin: `${node.x + node.w / 2}px ${node.y + node.h / 2}px` }} />
            )}
            <foreignObject x={node.x + 8} y={node.y + 7} width={16} height={16}>
              <div className={styles.icon} style={{ color: stroke }}>{node.icon}</div>
            </foreignObject>
            <text x={node.x + 28} y={node.y + 19} fontFamily="var(--sans)" fontWeight={650} fontSize={10.5}
              fill="var(--text)" opacity={inPath ? 1 : 0.7}>{node.label}</text>
            <text x={node.x + 28} y={node.y + 33} fontFamily="var(--mono)" fontSize={9} fill={T3}>{node.sub}</text>

            {(key === 'rt' || key === 'isp') && ttl !== null && (
              <g key={`ttl-${tick}`}>
                <rect x={node.x + 10} y={node.y + node.h - 30} width={96} height={20} rx={4}
                  fill={zero ? 'color-mix(in srgb, var(--rst) 22%, transparent)' : 'color-mix(in srgb, var(--b) 14%, transparent)'}
                  stroke={zero ? RST : B} strokeWidth={1} />
                <text x={node.x + 18} y={node.y + node.h - 16} fontFamily="var(--mono)" fontSize={9.5} fill={zero ? RST : B}>
                  {zero ? 'ttl → 0  DROP' : `ttl → ${ttl}`}
                </text>
              </g>
            )}

            {key === 'web' && (
              <text x={node.x + 12} y={node.y + 58} fontFamily="var(--mono)" fontSize={9} fill={step >= 4 ? OK : T3}>
                {step >= 4 ? '● echo reply sent' : '○ awaiting echo'}
              </text>
            )}
          </g>
        );
      })}

      {current && reachIdx > 0 && !current.from && (() => {
        const start = centre(nodes[chain[0]]);
        let d = `M ${start.x} ${start.y}`;
        for (let i = 1; i <= reachIdx; i += 1) {
          const c = centre(nodes[chain[i]]);
          d += ` L ${c.x} ${c.y}`;
        }
        const color = current.kind === 'expire' ? A : B;
        return (
          <g key={`packet-${tick}`} className={styles.travel}
            style={{ offsetPath: `path('${d}')`, filter: `drop-shadow(0 0 6px ${color})` } as Vars}>
            <rect x={-25} y={-9} width={50} height={18} rx={3} fill={color} />
            <text x={0} y={5} textAnchor="middle" fontFamily="var(--mono)" fontSize={9} fontWeight={650} fill="var(--bg)">
              ttl {current.ttl}
            </text>
          </g>
        );
      })()}

      {current && arcFrom && (current.kind === 'expire' || current.kind === 'reply') && (() => {
        const from = nodes[arcFrom];
        const home = centre(nodes.pc1);
        const d = `M ${centre(from).x} ${from.y + from.h} C ${centre(from).x - 160} ${TOPO_H - 14}, ${home.x + 180} ${TOPO_H - 14}, ${home.x} ${nodes.pc1.y + nodes.pc1.h}`;
        const color = current.kind === 'expire' ? RST : OK;
        return (
          <g key={`reply-${tick}`}>
            <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="5 4" opacity={0.8} />
            <g className={styles.back} style={{ offsetPath: `path('${d}')`, filter: `drop-shadow(0 0 6px ${color})` } as Vars}>
              <rect x={-30} y={-8} width={60} height={16} rx={3} fill={color} />
              <text x={0} y={4.5} textAnchor="middle" fontFamily="var(--mono)" fontSize={8} fontWeight={650} fill="var(--bg)">
                {current.kind === 'expire' ? 'TYPE 11' : 'TYPE 0'}
              </text>
            </g>
          </g>
        );
      })()}

      {current && (() => {
        const actor = current.kind === 'reply' && current.from ? nodes[current.from] : nodes[current.to];
        const replying = current.kind === 'reply';
        return (
          <StepCallout
            key={`callout-${step}-${tick}`}
            x={replying ? actor.x - 10 : centre(actor).x}
            y={replying ? centre(actor).y : actor.y - 6}
            side={replying ? 'left' : 'up'}
            text={pingCallouts[step - 1]}
            tone={replying ? OK : current.kind === 'expire' ? RST : B}
            width={TOPO_W}
            height={TOPO_H}
          />
        );
      })()}
    </svg>
  );
}

/* ------------------------------------------- traceroute: the probe ladder */

const columns = [
  { x: 70, name: 'PC-1', addr: '192.168.1.10' },
  { x: 318, name: 'hop 1 · router', addr: '192.168.1.1' },
  { x: 566, name: 'hop 2 · ISP', addr: '80.12.16.1' },
  { x: 830, name: 'destination', addr: '203.0.113.20' },
];

const laneY = [128, 192, 256];
const TRACE_W = 946;
const TRACE_H = 300;

const traceCallouts = [
  'TTL 1 reveals hop 1',
  'TTL 2 reveals hop 2',
  'Destination reached — trace ends',
];

export function TraceLadder({ step, tick }: { step: number; tick: number }) {
  return (
    <svg viewBox={`0 0 ${TRACE_W} ${TRACE_H}`} role="img" aria-label={`Traceroute probes, ${step} of 3 sent`}>
      <text x={70} y={20} fontFamily="var(--mono)" fontSize={9.5} fill={T3}>
        each probe leaves with one more hop of life than the last
      </text>

      {columns.map((column, index) => {
        const live = step > 0 && index <= step;
        return (
          <g key={column.name}>
            <line x1={column.x} y1={74} x2={column.x} y2={TRACE_H - 14} stroke={LINE} strokeWidth={1}
              strokeDasharray="3 5" opacity={live ? 0.9 : 0.45} />
            <text x={column.x} y={44} textAnchor="middle" fontFamily="var(--sans)" fontWeight={650} fontSize={11}
              fill={live ? 'var(--text)' : T3}>{column.name}</text>
            <text x={column.x} y={60} textAnchor="middle" fontFamily="var(--mono)" fontSize={9.5}
              fill={live ? B : T3}>{column.addr}</text>
          </g>
        );
      })}

      {[0, 1, 2].map((lane) => {
        const shown = step > lane;
        const active = step === lane + 1;
        const y = laneY[lane];
        const startTtl = lane + 1;
        const stopCol = lane + 1;
        const expired = lane < 2;
        const color = !shown ? LINE : expired ? RST : OK;
        const sx = columns[stopCol].x;
        const path = `M ${columns[0].x} ${y} L ${sx} ${y}`;
        const backPath = `M ${sx} ${y + 16} L ${columns[0].x} ${y + 16}`;

        return (
          <g key={lane}>
            <text x={12} y={y + 4} fontFamily="var(--mono)" fontSize={10}
              fill={shown ? (expired ? RST : OK) : T3}>ttl={startTtl}</text>
            <line x1={columns[0].x} y1={y} x2={sx} y2={y} stroke={color}
              strokeWidth={shown ? 2 : 1.2} opacity={shown ? 1 : 0.35} />

            {shown && Array.from({ length: stopCol }, (_, offset) => {
              const j = offset + 1;
              const atDest = !expired && j === stopCol;
              // the destination delivers rather than decrements: it arrives with one left
              const value = atDest ? startTtl - j + 1 : startTtl - j;
              const zero = expired && value === 0;
              const label = zero ? 'ttl 0 — DROP' : atDest ? `ttl ${value} — delivered` : `ttl ${value}`;
              const cx = columns[j].x;
              const bw = zero ? 70 : atDest ? 96 : 44;
              return (
                <g key={j}>
                  <rect x={cx - bw / 2} y={y - 28} width={bw} height={18} rx={3}
                    fill={zero ? 'color-mix(in srgb, var(--rst) 20%, transparent)' : 'color-mix(in srgb, var(--b) 14%, transparent)'}
                    stroke={zero ? RST : B} strokeWidth={1} />
                  <text x={cx} y={y - 15} textAnchor="middle" fontFamily="var(--mono)" fontSize={9}
                    fill={zero ? RST : B}>{label}</text>
                </g>
              );
            })}

            {shown && (
              <g>
                {expired ? (
                  <>
                    <g stroke={RST} strokeWidth={2}>
                      <line x1={sx - 7} y1={y - 7} x2={sx + 7} y2={y + 7} />
                      <line x1={sx + 7} y1={y - 7} x2={sx - 7} y2={y + 7} />
                    </g>
                    <text x={columns[0].x + 16} y={y + 33} fontFamily="var(--mono)" fontSize={10} fill={RST}>
                      {`type 11 time exceeded — hop names itself: ${columns[stopCol].addr}`}
                    </text>
                  </>
                ) : (
                  <>
                    <circle cx={sx} cy={y} r={7} fill="none" stroke={OK} strokeWidth={2} />
                    <text x={columns[0].x + 16} y={y + 33} fontFamily="var(--mono)" fontSize={10} fill={OK}>
                      type 0 echo reply — arrived, trace ends
                    </text>
                  </>
                )}
                <line x1={columns[0].x} y1={y + 16} x2={sx} y2={y + 16} stroke={expired ? RST : OK}
                  strokeWidth={1.2} strokeDasharray="4 4" opacity={0.6} />
                <path d={`M ${columns[0].x + 9} ${y + 12} L ${columns[0].x} ${y + 16} L ${columns[0].x + 9} ${y + 20}`}
                  fill="none" stroke={expired ? RST : OK} strokeWidth={1.2} opacity={0.7} />
              </g>
            )}

            {active && (
              <g key={`live-${tick}`}>
                <g className={styles.probe}
                  style={{ offsetPath: `path('${path}')`, filter: `drop-shadow(0 0 6px ${expired ? A : OK})` } as Vars}>
                  <rect x={-25} y={-9} width={50} height={18} rx={3} fill={expired ? A : OK} />
                  <text x={0} y={5} textAnchor="middle" fontFamily="var(--mono)" fontSize={9} fontWeight={650} fill="var(--bg)">
                    ttl {startTtl}
                  </text>
                </g>
                <g className={styles.backProbe} style={{ offsetPath: `path('${backPath}')` } as Vars}>
                  <rect x={-30} y={-8} width={60} height={16} rx={3} fill={expired ? RST : OK} />
                  <text x={0} y={4.5} textAnchor="middle" fontFamily="var(--mono)" fontSize={8} fontWeight={650} fill="var(--bg)">
                    {expired ? 'TYPE 11' : 'TYPE 0'}
                  </text>
                </g>
              </g>
            )}
          </g>
        );
      })}


      {step > 0 && (
        <StepCallout
          key={`callout-${step}-${tick}`}
          x={columns[step].x}
          y={laneY[step - 1] - 34}
          side="up"
          text={traceCallouts[step - 1]}
          tone={step < 3 ? RST : OK}
          width={TRACE_W}
          height={TRACE_H}
        />
      )}
    </svg>
  );
}
