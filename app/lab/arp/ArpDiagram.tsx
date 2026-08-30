'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  Desktop,
  DesktopTower,
  Globe,
  HardDrives,
  Skull,
} from '@phosphor-icons/react';
import styles from './arp-lab.module.css';

/* The stage. Both scenarios draw the same segment at the same scale, so the
   switch does not jump when you flip between them, and every beat changes only
   what that beat is about: which wires carry, which boxes are lit, where the
   packet is, and the one callout naming the move. */

const W = 760;
const H = 480;
const MID_Y = 240;

const A = 'var(--a)';
const B = 'var(--b)';
const OK = 'var(--ok)';
const RST = 'var(--rst)';
const LINE = 'var(--line)';
const T3 = 'var(--text3)';

/** seconds one packet takes to cross, tied to the transport speed */
const travelDur = (speed: number) => (2000 / speed) * 1.6 / 1000;

type Vars = CSSProperties & Record<`--${string}`, string>;

function Wire({
  x1, y1, x2, y2, stroke, width, dash, opacity, dashDur, dashDelay,
}: {
  x1: number; y1: number; x2: number; y2: number;
  stroke: string; width: number; dash?: string; opacity: number;
  dashDur?: number; dashDelay?: number;
}) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeLinecap="round"
      opacity={opacity}
      className={dashDur ? styles.dashFlow : undefined}
      style={dashDur ? ({ '--dash-dur': `${dashDur}s`, '--dash-delay': `${dashDelay ?? 0}s` } as Vars) : undefined}
    />
  );
}

function Packet({ d, w, h, fill, dur, delay = 0, linear = false, opacity }: {
  d: string; w: number; h: number; fill: string; dur: number;
  delay?: number; linear?: boolean; opacity?: number;
}) {
  return (
    <rect
      width={w}
      height={h}
      rx={2}
      fill={fill}
      opacity={opacity}
      className={`${styles.packet}${linear ? ` ${styles.packetLinear}` : ''}`}
      style={{
        offsetPath: `path('${d}')`,
        filter: `drop-shadow(0 0 6px ${fill})`,
        '--dur': `${dur}s`,
        '--delay': `${delay}s`,
      } as Vars}
    />
  );
}

function Node({ cx, cy, w, h, icon, title, sub, color, stroke, weight, dim, lit, subColor }: {
  cx: number; cy: number; w: number; h: number;
  icon: ReactNode; title: string; sub?: string;
  color: string; stroke: string; weight: number;
  dim?: boolean; lit?: boolean; subColor?: string;
}) {
  return (
    <foreignObject x={cx - w / 2} y={cy - h / 2} width={w} height={h} style={{ overflow: 'visible' }}>
      <div
        className={styles.node}
        style={{
          border: `${weight}px solid ${stroke}`,
          boxShadow: lit ? `0 0 22px -4px ${stroke}` : 'none',
          opacity: dim ? 0.34 : 1,
          color,
        }}
      >
        {icon}
        <b style={{ color }}>{title}</b>
        {sub && <span style={{ color: subColor ?? T3 }}>{sub}</span>}
      </div>
    </foreignObject>
  );
}

function Callout({ text, color, x, y, dir }: {
  text: string; color: string; x: number; y: number; dir: 'up' | 'left';
}) {
  return (
    <foreignObject x={0} y={0} width={W} height={H} style={{ overflow: 'visible', pointerEvents: 'none' }}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <div
          style={{
            position: 'absolute',
            left: x,
            top: y,
            transform: dir === 'left' ? 'translate(-100%,-50%)' : 'translate(-50%,-100%)',
            pointerEvents: 'none',
          }}
        >
          <div className={styles.callout} style={{ color, border: `1.5px solid ${color}` }}>
            {text}
            <div className={styles.calloutTip} data-dir={dir} />
          </div>
        </div>
      </div>
    </foreignObject>
  );
}

const iconStyle = { fontSize: 23 } as const;

/* ------------------------------------------------------------------ normal */

const hosts = [
  { l: 'B', ip: '.3', y: 56 },
  { l: 'C', ip: '.5', y: 130 },
  { l: 'D', ip: '.7', y: 204, target: true },
  { l: 'E', ip: '.9', y: 278 },
  { l: 'F', ip: '.12', y: 352 },
  { l: 'G', ip: '.14', y: 426 },
];

const normalCallouts: Record<number, { t: string; c: string; x: number; y: number; dir: 'up' | 'left' }> = {
  0: { t: 'Cache is empty', c: B, x: 94, y: MID_Y - 40, dir: 'up' },
  1: { t: 'Build the request', c: A, x: 94, y: MID_Y - 40, dir: 'up' },
  2: { t: 'Send to everyone', c: A, x: 94, y: MID_Y - 64, dir: 'up' },
  3: { t: 'Flooding all ports', c: A, x: 372, y: MID_Y - 40, dir: 'up' },
  4: { t: 'Is that my IP?', c: A, x: 609, y: MID_Y, dir: 'left' },
  5: { t: 'D matches!', c: OK, x: 662, y: 164, dir: 'up' },
  6: { t: 'Unicast reply', c: B, x: 662, y: 164, dir: 'up' },
  7: { t: 'Learned & cached', c: OK, x: 94, y: MID_Y - 40, dir: 'up' },
  8: { t: 'Data flows direct', c: OK, x: 517, y: 192, dir: 'up' },
};

export function NormalDiagram({ beat, speed }: { beat: number; speed: number }) {
  const pcaX = 94, swX = 372, hostX = 662;
  const pcaR = pcaX + 50, swL = swX - 54, swR = swX + 54, hostL = hostX - 45;
  const ty = hosts[2].y;

  const flood = beat === 3;
  const checking = beat === 4;
  const matched = beat >= 5;
  const reply = beat === 6;
  const cached = beat >= 7;
  const flowing = beat === 8;
  const ready = beat >= 2;
  const dur = travelDur(speed);

  const pcaLit = flood || reply || flowing;
  const co = normalCallouts[beat];

  // PC-A ↔ switch
  let pl = { stroke: LINE, width: 1.2, dash: '5 6' as string | undefined, opacity: 0.5, dashDur: undefined as number | undefined };
  if (flood || checking) pl = { stroke: A, width: 1.9, dash: '2 7', opacity: 0.8, dashDur: 0.9 };
  else if (reply || flowing) pl = { stroke: B, width: 2, dash: '2 7', opacity: 0.85, dashDur: 0.9 };
  else if (matched) pl = { stroke: OK, width: 1.8, dash: undefined, opacity: 0.7, dashDur: undefined };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`ARP resolution, beat ${beat + 1} of 9`}>
      {hosts.map((h, i) => {
        let stroke = LINE, width = 1.2, dash: string | undefined = '5 6', opacity = 0.4;
        let dashDur: number | undefined;
        if (flood || checking) {
          stroke = A; width = 1.7; dash = '2 7'; opacity = 0.7; dashDur = 0.9 + (i % 3) * 0.1;
        } else if (matched) {
          if (h.target) {
            stroke = reply ? B : OK; width = 2.2; dash = undefined; opacity = 0.95;
            if (reply) dashDur = 0.8;
          } else {
            opacity = 0.16;
          }
        }
        return (
          <Wire key={`l${i}`} x1={swR} y1={MID_Y} x2={hostL} y2={h.y}
            stroke={stroke} width={width} dash={dash} opacity={opacity} dashDur={dashDur} />
        );
      })}

      <Wire x1={pcaR} y1={MID_Y} x2={swL} y2={MID_Y}
        stroke={pl.stroke} width={pl.width} dash={pl.dash} opacity={pl.opacity} dashDur={pl.dashDur} />

      {flood && (
        <circle cx={swX} cy={MID_Y} r={3} fill="none" stroke={A} strokeWidth={1.6}
          className={styles.floodRing} style={{ '--dur': `${dur}s` } as Vars} />
      )}
      {matched && !reply && (
        <circle cx={hostX} cy={ty} r={34} fill="none" stroke={OK} strokeWidth={1.6} className={styles.matchRing} />
      )}

      <Node cx={pcaX} cy={MID_Y} w={102} h={68} icon={<Desktop weight="duotone" style={iconStyle} />}
        title="PC-A" sub=".10" color={A} stroke={A} weight={pcaLit ? 2.4 : 1.6} lit={pcaLit} />
      {cached && <text x={pcaX} y={MID_Y - 44} textAnchor="middle" fontSize={15} fill={OK}>✓</text>}

      <Node cx={swX} cy={MID_Y} w={110} h={68} icon={<HardDrives weight="duotone" style={iconStyle} />}
        title="SWITCH" color={B} stroke={B} weight={1.8} lit={flood || checking} />

      {hosts.map((h, i) => {
        let stroke = T3, weight = 1.4, color = T3, sub = h.ip, subColor = T3;
        let dim = false, lit = false;
        if (h.target) {
          if (beat < 5) { color = A; stroke = A; weight = 1.8; sub = '.7 ?'; subColor = A; lit = checking; }
          else { color = OK; stroke = OK; weight = 2.3; sub = '.7'; subColor = OK; lit = true; }
        } else if (flood || checking) {
          stroke = A; weight = 1.6; color = A; subColor = A;
        } else if (matched) {
          dim = true;
        }
        return (
          <g key={h.l}>
            <Node cx={hostX} cy={h.y} w={92} h={62} icon={<DesktopTower weight="duotone" style={iconStyle} />}
              title={h.l} sub={sub} color={color} stroke={stroke} weight={weight} dim={dim} lit={lit} subColor={subColor} />
            {checking && (
              <text x={hostX + 60} y={h.y + 5} textAnchor="middle" fontFamily="var(--mono)" fontSize={13} fill={A}
                className={styles.blink} style={{ '--delay': `${i * 0.08}s` } as Vars}>=?</text>
            )}
            {matched && !h.target && (
              <text x={hostX + 60} y={h.y + 5} textAnchor="middle" fontFamily="var(--mono)" fontSize={14} fill={RST} opacity={0.7}>✕</text>
            )}
          </g>
        );
      })}

      {ready && beat === 2 && (
        <>
          <rect x={pcaX - 15} y={MID_Y - 56} width={30} height={13} rx={2} fill={A}
            className={styles.blink} style={{ filter: `drop-shadow(0 0 6px ${A})` }} />
          <text x={pcaX} y={MID_Y - 62} textAnchor="middle" fontFamily="var(--mono)" fontSize={10} fill={A}>REQ</text>
        </>
      )}

      {flood && hosts.map((h, i) => (
        <Packet key={`pk${i}`} d={`M ${pcaR} ${MID_Y} L ${swX} ${MID_Y} L ${hostL} ${h.y}`}
          w={26} h={13} fill={A} dur={dur} delay={i * 0.05} />
      ))}

      {reply && (
        <Packet d={`M ${hostL} ${ty} L ${swX} ${MID_Y} L ${pcaR} ${MID_Y}`} w={28} h={13} fill={B} dur={dur} />
      )}

      {flowing && (
        <>
          <Packet d={`M ${pcaR} ${MID_Y} L ${swX} ${MID_Y} L ${hostL} ${ty}`} w={24} h={11} fill={B} dur={dur} linear />
          <Packet d={`M ${hostL} ${ty} L ${swX} ${MID_Y} L ${pcaR} ${MID_Y}`} w={24} h={11} fill={B} dur={dur} delay={dur * 0.5} linear opacity={0.8} />
          <text x={(swX + hostX) / 2} y={(MID_Y + ty) / 2 - 10} textAnchor="middle" fontFamily="var(--mono)" fontSize={11} fill={B}>DATA</text>
        </>
      )}

      {co && <Callout text={co.t} color={co.c} x={co.x} y={co.y} dir={co.dir} />}
    </svg>
  );
}

/* ------------------------------------------------------------------ attack */

const attackCallouts: Record<number, { t: string; c: string; x: number; y: number; dir: 'up' | 'left' }> = {
  0: { t: 'Gateway trusted', c: OK, x: 94, y: MID_Y - 40, dir: 'up' },
  1: { t: 'Attacker joins', c: RST, x: 662, y: 302, dir: 'up' },
  2: { t: 'Forging a reply', c: RST, x: 662, y: 302, dir: 'up' },
  3: { t: 'Unsolicited reply', c: RST, x: 372, y: MID_Y - 40, dir: 'up' },
  4: { t: 'Cache poisoned!', c: RST, x: 94, y: MID_Y - 40, dir: 'up' },
  5: { t: 'Sent to attacker', c: RST, x: 372, y: MID_Y - 40, dir: 'up' },
  6: { t: 'Relayed onward', c: RST, x: 517, y: 173, dir: 'up' },
  7: { t: 'Traffic exposed', c: RST, x: 662, y: 302, dir: 'up' },
  8: { t: 'Defenses on', c: OK, x: 94, y: MID_Y - 40, dir: 'up' },
};

export function AttackDiagram({ beat, speed }: { beat: number; speed: number }) {
  const pcaX = 94, swX = 372, rX = 662;
  const pcaR = pcaX + 50, swL = swX - 54, swR = swX + 54, rL = rX - 52;
  const gwY = 150, atkY = 340;
  const dur = travelDur(speed);

  const appear = beat >= 1;
  const forged = beat === 2;
  const inject = beat === 3;
  const poisoned = beat >= 4 && beat <= 7;
  const redirect = beat === 5;
  const relay = beat === 6;
  const exposed = beat === 7;
  const defend = beat === 8;
  const atkActive = beat >= 1 && beat <= 7;
  const co = attackCallouts[beat];

  let pl = { stroke: beat === 0 ? OK : LINE, width: 1.8, dash: undefined as string | undefined, opacity: 0.7, dashDur: undefined as number | undefined };
  if (inject || poisoned) pl = { stroke: RST, width: 2, dash: '2 7', opacity: 0.9, dashDur: 0.9 };
  if (defend) pl = { stroke: OK, width: 1.9, dash: undefined, opacity: 0.75, dashDur: undefined };

  const gwCalm = beat === 0 || defend;
  let gl = { stroke: gwCalm ? OK : LINE, width: 1.6, dash: gwCalm ? undefined : '5 6', opacity: gwCalm ? 0.7 : 0.4, dashDur: undefined as number | undefined };
  if (relay || exposed) gl = { stroke: RST, width: 1.9, dash: '2 7', opacity: 0.85, dashDur: 0.9 };

  let al = { stroke: LINE, width: 1.4, dash: '5 6' as string | undefined, opacity: appear ? 0.5 : 0.14, dashDur: undefined as number | undefined };
  if (inject || redirect || relay || exposed) al = { stroke: RST, width: 1.9, dash: '2 7', opacity: 0.85, dashDur: 0.9 };

  const pcaCol = defend ? OK : (poisoned ? RST : A);
  const gwLit = relay || exposed;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`ARP spoofing, beat ${beat + 1} of 9`}>
      <Wire x1={pcaR} y1={MID_Y} x2={swL} y2={MID_Y} stroke={pl.stroke} width={pl.width} dash={pl.dash} opacity={pl.opacity} dashDur={pl.dashDur} />
      <Wire x1={swR} y1={MID_Y} x2={rL} y2={gwY} stroke={gl.stroke} width={gl.width} dash={gl.dash} opacity={gl.opacity} dashDur={gl.dashDur} />
      <Wire x1={swR} y1={MID_Y} x2={rL} y2={atkY} stroke={al.stroke} width={al.width} dash={al.dash} opacity={al.opacity} dashDur={al.dashDur} />

      <Node cx={pcaX} cy={MID_Y} w={102} h={68} icon={<Desktop weight="duotone" style={iconStyle} />}
        title="PC-A" sub=".10" color={pcaCol} stroke={pcaCol} weight={inject || poisoned ? 2.4 : 1.6} lit={inject || poisoned} />
      {poisoned && <text x={pcaX} y={MID_Y - 44} textAnchor="middle" fontSize={15} fill={RST}>☠</text>}
      {defend && <text x={pcaX} y={MID_Y - 44} textAnchor="middle" fontSize={15} fill={OK}>✓</text>}

      <Node cx={swX} cy={MID_Y} w={110} h={68} icon={<HardDrives weight="duotone" style={iconStyle} />}
        title="SWITCH" color={B} stroke={B} weight={1.7} />

      <Node cx={rX} cy={gwY} w={100} h={64} icon={<Globe weight="duotone" style={iconStyle} />}
        title="GATEWAY" sub=".1" color={gwCalm || gwLit ? OK : T3} stroke={gwCalm || gwLit ? OK : T3} weight={1.6} lit={gwLit} />

      <Node cx={rX} cy={atkY} w={100} h={64} icon={<Skull weight="fill" style={iconStyle} />}
        title="ATTACKER" sub=".66" color={atkActive ? RST : T3} stroke={atkActive ? RST : LINE}
        weight={atkActive ? 2.1 : 1.4} dim={beat === 0} lit={atkActive} subColor={atkActive ? RST : T3} />
      {forged && (
        <text x={rX} y={atkY - 40} textAnchor="middle" fontFamily="var(--mono)" fontSize={11} fill={RST} className={styles.blink}>FORGE</text>
      )}
      {beat >= 2 && beat <= 7 && (
        <text x={rX} y={atkY + 50} textAnchor="middle" fontFamily="var(--mono)" fontSize={10} fill={RST}>→ claims .1</text>
      )}

      <foreignObject x={0} y={0} width={W} height={H} style={{ overflow: 'visible', pointerEvents: 'none' }}>
        <div style={{ position: 'relative', width: W, height: H }}>
          <div className={styles.bindPanel} data-poisoned={poisoned} style={{ top: H - 96 }}>
            <div>who is 192.168.1.1 ?</div>
            <div className={styles.bindRows}>
              <div style={{ color: poisoned ? T3 : OK, textDecoration: poisoned ? 'line-through' : 'none', opacity: poisoned ? 0.6 : 1 }}>
                <span>5e:aa:1f:00:00:01</span>
                <span>{poisoned ? 'real gateway' : '✓ in cache'}</span>
              </div>
              {poisoned && (
                <div style={{ color: RST }}>
                  <span>de:ad:be:ef:13:37</span>
                  <span>☠ in cache</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </foreignObject>

      {inject && <Packet d={`M ${rL} ${atkY} L ${swX} ${MID_Y} L ${pcaR} ${MID_Y}`} w={28} h={13} fill={RST} dur={dur} />}
      {redirect && <Packet d={`M ${pcaR} ${MID_Y} L ${swX} ${MID_Y} L ${rL} ${atkY}`} w={26} h={12} fill={RST} dur={dur} />}
      {relay && <Packet d={`M ${rL} ${atkY} L ${swX} ${MID_Y} L ${rL} ${gwY}`} w={26} h={12} fill={RST} dur={dur} />}
      {exposed && (
        <>
          <Packet d={`M ${pcaR} ${MID_Y} L ${swX} ${MID_Y} L ${rL} ${atkY}`} w={24} h={11} fill={RST} dur={dur} linear />
          <Packet d={`M ${rL} ${atkY} L ${swX} ${MID_Y} L ${rL} ${gwY}`} w={24} h={11} fill={RST} dur={dur} delay={dur * 0.5} linear opacity={0.85} />
        </>
      )}
      {defend && <Packet d={`M ${pcaR} ${MID_Y} L ${swX} ${MID_Y} L ${rL} ${gwY}`} w={22} h={10} fill={OK} dur={dur} linear />}

      {co && <Callout text={co.t} color={co.c} x={co.x} y={co.y} dir={co.dir} />}
    </svg>
  );
}
