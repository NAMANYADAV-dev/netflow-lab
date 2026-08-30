'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  Browser,
  Database,
  Folders,
  HardDrive,
  HardDrives,
  TreeStructure,
  WifiHigh,
} from '@phosphor-icons/react';
import StepCallout from '../StepCallout';
import type { DnsStep } from './dns-data';
import styles from './dns-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const A = 'var(--a)';
const B = 'var(--b)';
const OK = 'var(--ok)';
const RST = 'var(--rst)';
const LINE = 'var(--line)';
const T2 = 'var(--text2)';
const T3 = 'var(--text3)';

const W = 946;
const H = 452;

/* ---------- band 1: the cache ladder ---------- */
const LW = 194;
const LY = 44;
const LH = 84;
const LMY = LY + LH / 2;

type Rung = { k: 'br' | 'os' | 'rt' | 'rs'; x: number; t: string; s: string; n: string; icon: ReactNode };

const ladder: Rung[] = [
  { k: 'br', x: 4, t: 'BROWSER CACHE', s: 'inside Chrome', n: 'nothing has left the machine', icon: <Browser weight="duotone" size={14} /> },
  { k: 'os', x: 252, t: 'OS CACHE + hosts', s: 'on the machine', n: 'still nothing on the wire', icon: <HardDrive weight="duotone" size={14} /> },
  { k: 'rt', x: 500, t: 'ROUTER  (forwarder)', s: '192.168.1.1', n: 'small cache — cannot walk', icon: <WifiHigh weight="duotone" size={14} /> },
  { k: 'rs', x: 748, t: 'RESOLVER CACHE', s: '1.1.1.1', n: 'big cache — and it can walk', icon: <HardDrives weight="duotone" size={14} /> },
];

/* ---------- band 2: the resolver and the three servers ---------- */
const RX = 8;
const RY = 196;
const RW = 220;
const RH = 200;
const RR = RX + RW;
const RCY = RY + RH / 2;
const CACHE_Y = RY + 70;

const SX = 628;
const SW = 310;
const SH = 64;

type Server = { y: number; tag: string; addr: string; role: string; q: string; ans: string; icon: ReactNode };

const servers: Server[] = [
  { y: 190, tag: 'ROOT  ·  "."', addr: '198.41.0.4', role: 'knows who owns .com', q: 'www.example.com  A?', ans: 'referral → ask .com', icon: <TreeStructure weight="duotone" size={14} /> },
  { y: 272, tag: 'TLD  ·  ".com"', addr: '192.5.6.30', role: 'knows who owns example.com', q: 'www.example.com  A?', ans: 'referral → ask ns1.example.com', icon: <Folders weight="duotone" size={14} /> },
  { y: 354, tag: 'AUTHORITATIVE  ·  example.com', addr: '198.51.100.5', role: 'owns the record itself', q: 'www.example.com  A?', ans: 'ANSWER → 93.184.216.34', icon: <Database weight="duotone" size={14} /> },
];

const coldCallouts = [
  'Browser cache: not here',
  'OS cache: still missing',
  'Router forwards the question',
  'Resolver cache: empty',
  'Root says: ask .com',
  '.com says: ask the owner',
  'Owner returns the address',
  'Remember this for 300 seconds',
  'Answer: 93.184.216.34',
];

const warmCallouts = [
  'Browser cache: not here',
  'OS cache: still missing',
  'Router forwards the question',
  'Cache hit — skip the tree',
  'Cached answer comes home',
];

export default function DnsDiagram({ step, current, warm, tick }: {
  step: number; current: DnsStep | null; warm: boolean; tick: number;
}) {
  const going = current?.arc === 'down';
  // how many ladder rungs have reported back
  const resolved = Math.min(step, 4);
  const ladderIdx = current ? ladder.findIndex((rung) => rung.k === current.arc) : -1;
  const resActive = Boolean(current) && (typeof current!.arc === 'number' || current!.arc === 'cache' || current!.arc === 'rs');
  const hit = Boolean(current?.warm);

  /* what the resolver's cache box currently shows */
  const cacheLines: { t: string; c: string }[] = [];
  if (warm) {
    cacheLines.push({ t: '.com NS  ttl 171204', c: T3 });
    cacheLines.push({ t: 'example.com NS  ttl 170980', c: T3 });
    cacheLines.push({ t: 'www.example.com A', c: step >= 4 ? OK : T2 });
    cacheLines.push({ t: '   93.184.216.34  ttl 284', c: step >= 4 ? OK : T2 });
  } else if (step < 4) {
    cacheLines.push({ t: '— empty —', c: T3 });
  } else if (step === 4) {
    cacheLines.push({ t: 'MISS — nothing known', c: RST });
  } else {
    if (step >= 5) cacheLines.push({ t: '.com NS  ttl 172800', c: T2 });
    if (step >= 6) cacheLines.push({ t: 'example.com NS  ttl 172800', c: T2 });
    if (step >= 8) {
      cacheLines.push({ t: 'www.example.com A', c: OK });
      cacheLines.push({ t: '   93.184.216.34  ttl 300', c: OK });
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`DNS lookup on a ${warm ? 'warm' : 'cold'} cache, step ${step}`}>

      {/* ============================================ band 1: cache ladder */}
      <text x={4} y={20} fontFamily="var(--sans)" fontWeight={650} fontSize={12} fill="var(--text)">
        ①  FIRST — does anybody here already know this name?
      </text>
      <text x={942} y={20} textAnchor="end" fontFamily="var(--mono)" fontSize={9} fill={T3}>
        checked in order · the first HIT ends the whole lookup
      </text>
      <text x={4} y={LY - 6} fontFamily="var(--mono)" fontSize={8.5} fill={A}>you type www.example.com</text>

      {ladder.map((rung, i) => {
        const done = i < resolved;
        const active = ladderIdx === i;
        const isHit = warm && i === 3 && done;
        const stamp = going ? 'CACHED' : done ? (isHit ? 'HIT' : 'MISS') : '';
        const stampColor = going ? OK : isHit ? OK : RST;
        const stroke = active ? (isHit ? OK : B) : LINE;
        const next = ladder[i + 1];
        const passed = step > i + 1;

        return (
          <g key={rung.k}>
            <rect x={rung.x} y={LY} width={LW} height={LH} rx={6} fill="var(--surface2)"
              stroke={stroke} strokeWidth={active ? 2 : 1.4} opacity={done || active ? 1 : 0.62} />
            {active && (
              <rect key={`ring-${tick}`} x={rung.x - 4} y={LY - 4} width={LW + 8} height={LH + 8} rx={8}
                fill="none" stroke={isHit ? OK : B} strokeWidth={1.4} className={styles.ring}
                style={{ transformOrigin: `${rung.x + LW / 2}px ${LMY}px` }} />
            )}
            <foreignObject x={rung.x + 12} y={LY + 11} width={16} height={16}>
              <div className={styles.icon} style={{ color: active ? B : T2 }}>{rung.icon}</div>
            </foreignObject>
            <text x={rung.x + 34} y={LY + 24} fontFamily="var(--sans)" fontWeight={650} fontSize={10.5} fill="var(--text)">{rung.t}</text>
            <text x={rung.x + 12} y={LY + 43} fontFamily="var(--mono)" fontSize={9} fill={B}>{rung.s}</text>
            <text x={rung.x + 12} y={LY + 58} fontFamily="var(--mono)" fontSize={8.5} fill={T3}>{rung.n}</text>
            <circle cx={rung.x + LW - 16} cy={LY + 16} r={9} fill="var(--surface2)"
              stroke={done || active ? B : LINE} strokeWidth={1.2} />
            <text x={rung.x + LW - 16} y={LY + 19.5} textAnchor="middle" fontFamily="var(--mono)" fontSize={9}
              fontWeight={650} fill={done || active ? B : T3}>{i + 1}</text>
            {stamp && (
              <text key={`stamp-${tick}`} x={rung.x + LW - 12} y={LY + 76} textAnchor="end" fontFamily="var(--mono)"
                fontSize={10} fontWeight={650} fill={stampColor} className={styles.pop}>{stamp}</text>
            )}

            {next && (
              <>
                <line x1={rung.x + LW + 4} y1={LMY} x2={next.x - 8} y2={LMY}
                  stroke={passed ? A : LINE} strokeWidth={passed ? 1.6 : 1.2} opacity={passed ? 1 : 0.5} />
                <path d={`M ${next.x - 13} ${LMY - 4} L ${next.x - 6} ${LMY} L ${next.x - 13} ${LMY + 4}`}
                  fill="none" stroke={passed ? A : LINE} strokeWidth={passed ? 1.6 : 1.2} opacity={passed ? 1 : 0.5} />
                {passed && !going && (
                  <text x={(rung.x + LW + next.x) / 2} y={LMY - 8} textAnchor="middle"
                    fontFamily="var(--mono)" fontSize={8.5} fill={A}>miss</text>
                )}
              </>
            )}

            {active && i > 0 && (() => {
              const d = `M ${ladder[i - 1].x + LW + 4} ${LMY} L ${rung.x - 8} ${LMY}`;
              return (
                <g key={`ask-${tick}`} className={styles.travel}
                  style={{ offsetPath: `path('${d}')`, '--dur': '0.7s', filter: `drop-shadow(0 0 6px ${B})` } as Vars}>
                  <rect x={-20} y={-9} width={40} height={18} rx={3} fill={B} />
                  <text x={0} y={5} textAnchor="middle" fontFamily="var(--mono)" fontSize={8.5} fontWeight={650} fill="var(--bg)">ASK</text>
                </g>
              );
            })()}
          </g>
        );
      })}

      {/* the answer walking back down the ladder, caching at every stop */}
      {going && (() => {
        const d = `M ${ladder[3].x - 8} ${LMY} L ${ladder[0].x + LW + 4} ${LMY}`;
        return (
          <g key={`home-${tick}`}>
            <path d={d} fill="none" stroke={OK} strokeWidth={1.6} strokeDasharray="5 4" />
            <g className={styles.travel}
              style={{ offsetPath: `path('${d}')`, '--dur': '1.1s', filter: `drop-shadow(0 0 6px ${OK})` } as Vars}>
              <rect x={-30} y={-9} width={60} height={18} rx={3} fill={OK} />
              <text x={0} y={5} textAnchor="middle" fontFamily="var(--mono)" fontSize={8.5} fontWeight={650} fill="var(--bg)">A REC</text>
            </g>
          </g>
        );
      })()}

      {/* ============================================== band 2: the tree walk */}
      <text x={4} y={166} fontFamily="var(--sans)" fontWeight={650} fontSize={12} fill={warm ? T3 : 'var(--text)'}>
        {warm ? '②  NOT NEEDED — the resolver already had the answer' : '②  NOBODY KNEW — so the resolver walks the tree'}
      </text>
      <text x={942} y={166} textAnchor="end" fontFamily="var(--mono)" fontSize={9} fill={warm ? T3 : A}>
        3 × ITERATIVE · RD=0 — every reply is only a pointer
      </text>

      {/* the resolver box above IS this resolver */}
      <path d={`M ${ladder[3].x + LW / 2} ${LY + LH} L ${ladder[3].x + LW / 2} 180 L ${RX + 110} 180 L ${RX + 110} ${RY}`}
        fill="none" stroke={warm ? LINE : B} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.7} />

      <rect x={RX} y={RY} width={RW} height={RH} rx={7} fill="var(--surface2)"
        stroke={resActive ? B : LINE} strokeWidth={resActive ? 2 : 1.4} />
      <foreignObject x={RX + 12} y={RY + 12} width={16} height={16}>
        <div className={styles.icon} style={{ color: B }}><HardDrives weight="duotone" size={14} /></div>
      </foreignObject>
      <text x={RX + 34} y={RY + 24} fontFamily="var(--sans)" fontWeight={650} fontSize={11} fill="var(--text)">RECURSIVE RESOLVER</text>
      <text x={RX + 12} y={RY + 43} fontFamily="var(--mono)" fontSize={9.5} fill={B}>1.1.1.1:53  ·  udp</text>
      <text x={RX + 12} y={RY + 58} fontFamily="var(--mono)" fontSize={8.5} fill={T3}>the only box that walks</text>

      <rect x={RX + 12} y={CACHE_Y} width={RW - 24} height={118} rx={5} fill="var(--surface)"
        stroke={hit ? OK : LINE} strokeWidth={hit ? 1.8 : 1} />
      <text x={RX + 22} y={CACHE_Y + 17} fontFamily="var(--sans)" fontWeight={650} fontSize={9}
        letterSpacing=".12em" fill={hit ? OK : T3}>{warm ? 'CACHE — WARM' : 'CACHE'}</text>
      {cacheLines.map((line, i) => (
        <text key={`${line.t}-${tick}`} x={RX + 22} y={CACHE_Y + 38 + i * 19} fontFamily="var(--mono)" fontSize={9}
          fill={line.c} className={styles.fade}>{line.t}</text>
      ))}

      {servers.map((server, i) => {
        const cy = server.y + SH / 2;
        const asked = warm ? false : step >= 5 + i;
        const active = !warm && current?.arc === i;
        const isAns = i === 2;
        const dim = warm ? 0.4 : asked ? 1 : 0.55;
        const accent = isAns ? OK : A;
        const outD = `M ${RR} ${RCY - 10} C ${RR + 150} ${RCY - 10}, ${SX - 150} ${cy - 9}, ${SX} ${cy - 9}`;
        const backD = `M ${SX} ${cy + 9} C ${SX - 150} ${cy + 9}, ${RR + 150} ${RCY + 10}, ${RR} ${RCY + 10}`;

        return (
          <g key={server.tag}>
            <rect x={SX} y={server.y} width={SW} height={SH} rx={6} fill="var(--surface2)"
              stroke={active ? accent : LINE} strokeWidth={active ? 2 : 1.4} opacity={dim} />
            <foreignObject x={SX + 12} y={server.y + 11} width={16} height={16}>
              <div className={styles.icon} style={{ color: active ? accent : T2, opacity: dim }}>{server.icon}</div>
            </foreignObject>
            <text x={SX + 34} y={server.y + 23} fontFamily="var(--sans)" fontWeight={650} fontSize={10.5}
              fill="var(--text)" opacity={dim}>{server.tag}</text>
            <text x={SX + 12} y={server.y + 41} fontFamily="var(--mono)" fontSize={9} fill={T3} opacity={dim}>{server.addr}</text>
            <text x={SX + 12} y={server.y + 56} fontFamily="var(--mono)" fontSize={8.5}
              fill={active ? accent : T3} opacity={dim}>{server.role}</text>

            {warm ? (
              <text x={SX + SW - 10} y={server.y + SH - 8} textAnchor="end" fontFamily="var(--mono)" fontSize={8.5} fill={T3}>
                never contacted
              </text>
            ) : (
              <>
                <path d={outD} fill="none" stroke={asked && active ? B : LINE} strokeWidth={asked ? 1.6 : 1} opacity={asked ? 1 : 0.4} />
                <path d={backD} fill="none" strokeDasharray="5 4" stroke={asked ? accent : LINE}
                  strokeWidth={asked ? 1.6 : 1} opacity={asked ? 1 : 0.4} />
                <circle cx={SX - 9} cy={cy - 9} r={9} fill={asked && active ? B : 'var(--surface2)'}
                  stroke={asked ? B : LINE} strokeWidth={1.2} opacity={asked ? 1 : 0.5} />
                <text x={SX - 9} y={cy - 5.5} textAnchor="middle" fontFamily="var(--mono)" fontSize={9} fontWeight={650}
                  fill={asked ? (active ? 'var(--bg)' : B) : T3} opacity={asked ? 1 : 0.6}>{i + 1}</text>

                {asked && (
                  <>
                    <text x={SX - 26} y={cy - 14} textAnchor="end" fontFamily="var(--mono)" fontSize={9.5} fill={B}>{server.q}</text>
                    <text x={SX - 26} y={cy + 20} textAnchor="end" fontFamily="var(--mono)" fontSize={9.5} fill={accent}>{server.ans}</text>
                  </>
                )}

                {active && (
                  <g key={`spoke-${tick}`}>
                    <g className={styles.travel}
                      style={{ offsetPath: `path('${outD}')`, '--dur': '0.85s', filter: `drop-shadow(0 0 6px ${B})` } as Vars}>
                      <rect x={-24} y={-9} width={48} height={18} rx={3} fill={B} />
                      <text x={0} y={5} textAnchor="middle" fontFamily="var(--mono)" fontSize={8.5} fontWeight={650} fill="var(--bg)">QUERY</text>
                    </g>
                    <g className={styles.travel}
                      style={{ offsetPath: `path('${backD}')`, '--dur': '0.9s', '--delay': '0.8s', filter: `drop-shadow(0 0 6px ${accent})` } as Vars}>
                      <rect x={-34} y={-9} width={68} height={18} rx={3} fill={accent} />
                      <text x={0} y={5} textAnchor="middle" fontFamily="var(--mono)" fontSize={8.5} fontWeight={650} fill="var(--bg)">
                        {isAns ? 'ANSWER' : 'REFERRAL'}
                      </text>
                    </g>
                  </g>
                )}
              </>
            )}
          </g>
        );
      })}

      <text x={4} y={H - 8} fontFamily="var(--mono)" fontSize={9} fill={T3}>
        {warm
          ? 'four caches checked · zero servers asked · the tree never saw this lookup'
          : 'the question is identical at every stop — only who is being asked changes'}
      </text>

      {current && (() => {
        const treeIndex = typeof current.arc === 'number' ? current.arc : -1;
        const rungIndex = typeof current.arc === 'string'
          ? ladder.findIndex((rung) => rung.k === current.arc)
          : -1;

        if (treeIndex >= 0) {
          const server = servers[treeIndex];
          return (
            <StepCallout
              key={`callout-${step}-${warm}-${tick}`}
              x={SX - 12}
              y={server.y + SH / 2}
              side="left"
              text={(warm ? warmCallouts : coldCallouts)[step - 1]}
              tone={treeIndex === 2 ? OK : A}
              width={W}
              height={H}
            />
          );
        }

        if (current.arc === 'cache') {
          return (
            <StepCallout
              key={`callout-${step}-${warm}-${tick}`}
              x={RR + 12}
              y={CACHE_Y + 78}
              side="right"
              text={coldCallouts[step - 1]}
              tone={OK}
              width={W}
              height={H}
            />
          );
        }

        const x = current.arc === 'down'
          ? ladder[1].x + LW / 2
          : ladder[Math.max(0, rungIndex)].x + LW / 2;
        return (
          <StepCallout
            key={`callout-${step}-${warm}-${tick}`}
            x={x}
            y={LY + LH + 12}
            side="up"
            text={(warm ? warmCallouts : coldCallouts)[step - 1]}
            tone={current.arc === 'down' || current.warm ? OK : B}
            width={W}
            height={H}
          />
        );
      })()}
    </svg>
  );
}
