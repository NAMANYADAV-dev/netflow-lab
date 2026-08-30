'use client';

import type { CSSProperties } from 'react';
import StepCallout from '../StepCallout';
import { LOST_DG, type UdpStep } from './udp-data';
import styles from './udp-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const A = 'var(--a)';
const B = 'var(--b)';
const RST = 'var(--rst)';
const LINE = 'var(--line)';
const T3 = 'var(--text3)';

const W = 946;
const H = 300;
const LANE_Y = 176;
const SX = 196;
const EX = 760;
const DROP_X = 486;

/** vertical middle of queue slot n (1-based), shared by both columns */
const slotY = (n: number) => 98 + (n - 1) * 40;

export default function UdpStream({ step, current, lossy, tick }: {
  step: number; current: UdpStep | null; lossy: boolean; tick: number;
}) {
  // the socket-open step sends nothing, so datagrams already gone = step - 1
  const sent = step > 1 ? step - 1 : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`UDP stream on a ${lossy ? 'congested' : 'clean'} wire, ${sent} of 4 datagrams sent`}>

      {/* ------------------------------------------------------------ sender */}
      <rect x={10} y={34} width={172} height={236} rx={6} fill="var(--surface2)" stroke={A} strokeWidth={1.4} />
      <text x={22} y={54} fontFamily="var(--sans)" fontWeight={650} fontSize={11} fill="var(--text)">PC-1  sender</text>
      <text x={22} y={69} fontFamily="var(--mono)" fontSize={9} fill={T3}>192.168.1.10:52310</text>
      <text x={22} y={88} fontFamily="var(--mono)" fontSize={9} fill={A}>send queue — no waiting</text>

      {[1, 2, 3, 4].map((n) => {
        const gone = n <= sent;
        const y = slotY(n);
        return (
          <g key={`q${n}`}>
            <rect x={22} y={y} width={148} height={30} rx={4}
              fill={gone ? 'transparent' : 'color-mix(in srgb, var(--a) 12%, transparent)'}
              stroke={gone ? LINE : A} strokeWidth={1} strokeDasharray={gone ? '4 4' : undefined}
              opacity={gone ? 0.45 : 1} />
            <text x={32} y={y + 19} fontFamily="var(--mono)" fontSize={10} fill={gone ? T3 : A}>
              {gone ? `#${n}  sent — forgotten` : `#${n}  172 bytes`}
            </text>
          </g>
        );
      })}

      {/* ------------------------------------------- the wire and its router */}
      <line x1={SX} y1={LANE_Y} x2={EX} y2={LANE_Y} stroke={LINE} strokeWidth={1.6} />
      <text x={SX + 6} y={LANE_Y - 14} fontFamily="var(--mono)" fontSize={9} fill={T3}>ip · proto 17 · best effort</text>
      <rect x={DROP_X - 46} y={LANE_Y - 24} width={92} height={48} rx={5} fill="var(--surface2)"
        stroke={lossy ? RST : LINE} strokeWidth={1.4} />
      <text x={DROP_X} y={LANE_Y - 6} textAnchor="middle" fontFamily="var(--sans)" fontWeight={650} fontSize={10} fill="var(--text)">router</text>
      <text x={DROP_X} y={LANE_Y + 10} textAnchor="middle" fontFamily="var(--mono)" fontSize={8.5} fill={lossy ? RST : T3}>
        {lossy ? 'queue 100% full' : 'queue 12%'}
      </text>

      {/* ---------------------------------------------------------- receiver */}
      <rect x={774} y={34} width={162} height={236} rx={6} fill="var(--surface2)" stroke={B} strokeWidth={1.4} />
      <text x={786} y={54} fontFamily="var(--sans)" fontWeight={650} fontSize={11} fill="var(--text)">SERVER  receiver</text>
      <text x={786} y={69} fontFamily="var(--mono)" fontSize={9} fill={T3}>203.0.113.20:5060</text>
      <text x={786} y={88} fontFamily="var(--mono)" fontSize={9} fill={B}>delivered to the app</text>

      {Array.from({ length: sent }, (_, index) => {
        const n = index + 1;
        const lost = lossy && n === LOST_DG;
        const y = slotY(n);
        return (
          <g key={`g${n}`}>
            <rect x={786} y={y} width={138} height={30} rx={4}
              fill={lost ? 'none' : 'color-mix(in srgb, var(--b) 14%, transparent)'}
              stroke={lost ? RST : B} strokeWidth={1} strokeDasharray={lost ? '4 4' : undefined}
              opacity={lost ? 0.8 : 1} />
            <text x={796} y={y + 19} fontFamily="var(--mono)" fontSize={10} fill={lost ? RST : B}>
              {lost ? `#${n}  never arrived` : `#${n}  read by app`}
            </text>
          </g>
        );
      })}

      {/* ------------------------------------------------ the one in flight */}
      {current && current.dg > 0 && (() => {
        const fromY = slotY(current.dg) + 15;
        const lost = current.lost;
        const d = lost
          ? `M 182 ${fromY} L ${SX + 40} ${LANE_Y} L ${DROP_X} ${LANE_Y}`
          : `M 182 ${fromY} L ${SX + 40} ${LANE_Y} L ${EX - 30} ${LANE_Y} L 774 ${slotY(current.dg) + 15}`;
        const color = lost ? RST : B;
        return (
          <g key={`flight-${tick}`}>
            <path d={d} fill="none" stroke={color} strokeWidth={1.4} strokeDasharray="4 4" opacity={0.55} />
            <g className={lost ? styles.lost : styles.travel}
              style={{ offsetPath: `path('${d}')`, filter: `drop-shadow(0 0 6px ${color})` } as Vars}>
              <rect x={-26} y={-10} width={52} height={20} rx={3} fill={color} />
              <text x={0} y={5} textAnchor="middle" fontFamily="var(--mono)" fontSize={9} fontWeight={650} fill="var(--bg)">
                UDP #{current.dg}
              </text>
            </g>
            {lost && (
              <>
                <g className={styles.dropMark} stroke={RST} strokeWidth={2.4}
                  style={{ transformOrigin: `${DROP_X}px ${LANE_Y}px` }}>
                  <line x1={DROP_X - 10} y1={LANE_Y - 10} x2={DROP_X + 10} y2={LANE_Y + 10} />
                  <line x1={DROP_X + 10} y1={LANE_Y - 10} x2={DROP_X - 10} y2={LANE_Y + 10} />
                </g>
                <text x={DROP_X} y={LANE_Y + 42} textAnchor="middle" fontFamily="var(--mono)" fontSize={10}
                  fill={RST} className={styles.dropNote}>dropped — and nobody is told</text>
              </>
            )}
          </g>
        );
      })()}

      <text x={196} y={H - 14} fontFamily="var(--mono)" fontSize={9} fill={T3}>
        no handshake  ·  no acknowledgement  ·  no sequence numbers  ·  no retransmission
      </text>

      {current && (
        <StepCallout
          key={`callout-${step}-${lossy}-${tick}`}
          x={current.dg === 0 ? 192 : current.lost ? DROP_X : 762}
          y={current.dg === 0 ? 124 : current.lost ? LANE_Y - 32 : slotY(current.dg) + 15}
          side={current.lost ? 'up' : current.dg === 0 ? 'right' : 'left'}
          text={current.dg === 0
            ? 'No handshake — send immediately'
            : current.lost
              ? `Datagram ${current.dg} vanished silently`
              : `Datagram ${current.dg} arrived independently`}
          tone={current.lost ? RST : current.dg === 0 ? A : B}
          width={W}
          height={H}
        />
      )}
    </svg>
  );
}
