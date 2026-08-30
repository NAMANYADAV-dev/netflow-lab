'use client';

import type { CSSProperties, ReactNode } from 'react';
import StepCallout from '../StepCallout';
import { CLIENT_MAC, XID, type DhcpStep } from './dhcp-data';
import styles from './dhcp-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const W = 1000;
const H = 520;

const N = {
  pc1: { x: 118, y: 250 },
  sw: { x: 420, y: 250 },
  pc2: { x: 420, y: 96 },
  pc3: { x: 420, y: 404 },
  srv: { x: 862, y: 250 },
};

const DOM_X = 44;
const DOM_W = N.srv.x - 124 - DOM_X;

const freshCallouts = [
  'Who can give me an address?',
  'You may use 192.168.1.10',
  'I choose that offered address',
  'Lease confirmed for 24 hours',
];

const renewCallouts = [
  'Half-time — renew my lease',
  'Let me keep this address',
  'Same address, clock reset',
];

export default function DhcpDiagram({ steps, step, renew, tick }: {
  steps: DhcpStep[]; step: number; renew: boolean; tick: number;
}) {
  const current = step > 0 ? steps[step - 1] : null;
  const bound = renew ? true : step >= 4;
  const cast = current?.cast ?? 'none';
  const flow = current?.flow ?? 'idle';
  const flooding = cast === 'bcast';
  const onePort = cast === 'ucast';
  const color = flow === 'up' ? 'var(--b)' : flow === 'down' ? 'var(--a)' : 'var(--text3)';

  const kids: ReactNode[] = [];

  /* ---------------------------------------- the broadcast domain boundary */
  kids.push(
    <rect key="dom" x={DOM_X} y={40} width={DOM_W} height={H - 96} rx={10}
      fill={flooding ? 'color-mix(in srgb, var(--b) 7%, transparent)' : 'transparent'}
      stroke={flooding ? 'var(--b)' : 'var(--line)'} strokeWidth={1} strokeDasharray="7 6"
      opacity={flooding ? 1 : 0.6} className={flooding ? styles.fade : undefined} />,
    <text key="domt" x={DOM_X + 12} y={32} fill={flooding ? 'var(--b)' : 'var(--text3)'} className={styles.domLabel}>
      BROADCAST DOMAIN · 192.168.1.0/24 · ONE SEGMENT
    </text>,
  );
  /* the reach note gets its own line just inside the top edge — the bottom of
     the box is taken by the address line, the lease clock and PC-3 */
  if (flooding) {
    kids.push(
      <text key="domt2" x={DOM_X + 14} y={56} fill="var(--b)" className={styles.domNote}>
        dst ff:ff:ff:ff:ff:ff — every NIC in this box must read the frame
      </text>,
    );
  }
  if (onePort) {
    kids.push(
      <text key="domt3" x={DOM_X + 14} y={56} fill="var(--ok)" className={styles.domNote}>
        dst {CLIENT_MAC} — the switch forwards to one port only
      </text>,
    );
  }

  /* ------------------------------------------------------------- the wires */
  kids.push(
    <g key="wires" stroke="var(--line)" strokeWidth={1.5}>
      <line x1={N.pc1.x + 88} y1={N.pc1.y} x2={N.sw.x - 96} y2={N.sw.y} />
      <line x1={N.sw.x + 96} y1={N.sw.y} x2={N.srv.x - 88} y2={N.srv.y} />
      <line x1={N.sw.x} y1={N.sw.y - 30} x2={N.pc2.x} y2={N.pc2.y + 37} />
      <line x1={N.sw.x} y1={N.sw.y + 30} x2={N.pc3.x} y2={N.pc3.y - 37} />
    </g>,
  );

  /* ------------------------------------------------------------- the hosts */
  const box = (key: keyof typeof N, label: string, sub: string, sub2: string, accent: string, dim: boolean) => {
    const n = N[key];
    const w = 176;
    const h = 74;
    return (
      <g key={`box-${key}`}>
        <rect x={n.x - w / 2} y={n.y - h / 2} width={w} height={h} rx={8}
          fill={dim ? 'var(--surface2)' : `color-mix(in srgb, ${accent} 9%, var(--surface2))`}
          stroke={dim ? 'var(--line)' : accent} strokeWidth={dim ? 1 : 1.5} opacity={dim ? 0.45 : 1} />
        <text x={n.x} y={n.y - 16} textAnchor="middle" fill={dim ? 'var(--text3)' : 'var(--text)'} className={styles.nodeName}>{label}</text>
        <text x={n.x} y={n.y + 4} textAnchor="middle"
          fill={dim || accent === 'var(--line)' ? 'var(--text3)' : accent} className={styles.nodeAddr}>{sub}</text>
        {sub2 && <text x={n.x} y={n.y + 23} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>{sub2}</text>}
      </g>
    );
  };

  kids.push(
    box('pc1', 'PC-1', bound ? '192.168.1.10' : '0.0.0.0', bound ? 'leased · 24 h' : 'no address yet',
      bound ? 'var(--ok)' : 'var(--rst)', false),
    box('pc2', 'PC-2', '192.168.1.20', onePort ? 'never hears it' : 'not a server · discards', 'var(--line)', onePort),
    box('pc3', 'PC-3', '192.168.1.23', onePort ? 'never hears it' : 'not a server · discards', 'var(--line)', onePort),
    box('srv', 'ROUTER · DHCP', '192.168.1.1', 'pool .10 – .200', 'var(--a)', false),
    <text key="mac1" x={N.pc1.x} y={N.pc1.y + 50} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>
      mac {CLIENT_MAC}
    </text>,
  );

  /* ------------------------------- the switch, drawn as a switch: lit ports */
  const swW = 192;
  const swH = 60;
  const sx = N.sw.x - swW / 2;
  const sy = N.sw.y - swH / 2;
  kids.push(
    <g key="switch">
      <rect x={sx} y={sy} width={swW} height={swH} rx={7}
        fill={flooding ? 'color-mix(in srgb, var(--b) 11%, var(--surface2))' : 'var(--surface2)'}
        stroke={flooding ? 'var(--b)' : 'var(--line)'} strokeWidth={flooding ? 1.6 : 1} />
      <text x={N.sw.x} y={sy + 21} textAnchor="middle" fill="var(--text)" className={styles.switchName}>LAN SWITCH · L2</text>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const lit = flooding || (onePort && i === 1);
        const tone = onePort ? 'var(--ok)' : 'var(--b)';
        return (
          <rect key={i} x={sx + 22 + i * 30} y={sy + 30} width={20} height={16} rx={2.5}
            fill={lit ? tone : 'transparent'} stroke={lit ? tone : 'var(--line)'} strokeWidth={1}
            opacity={lit ? 1 : 0.55} className={lit ? styles.port : undefined}
            style={lit ? ({ '--delay': `${i * 45}ms` } as Vars) : undefined} />
        );
      })}
      <text x={N.sw.x} y={sy + swH + 15} textAnchor="middle"
        fill={flooding ? 'var(--b)' : onePort ? 'var(--ok)' : 'var(--text3)'} className={styles.switchNote}>
        {flooding ? 'unknown dst → flood every port' : onePort ? 'mac table hit → one port' : 'idle'}
      </text>
    </g>,
  );

  /* ----------------------------------------------------------- active path */
  const seg = (x1: number, y1: number, x2: number, y2: number, key: string, strong: boolean, delay: number) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    return (
      <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={strong ? 2.8 : 1.6}
        markerEnd={flow === 'up' ? 'url(#dh-up)' : 'url(#dh-dn)'} opacity={strong ? 1 : 0.75}
        strokeDasharray={len} className={styles.draw}
        style={{ '--len': String(len), '--delay': `${delay}ms` } as Vars} />
    );
  };

  /* The chip has to clear the node boxes, so size it from whichever of its two
     lines is wider — the sub is usually the long one. */
  const chip = (cx: number, cy: number, label: string, sub: string) => {
    const w = Math.max(150, label.length * 7.6 + 34, sub.length * 5.8 + 26);
    return (
      <g key="chip">
        <rect x={cx - w / 2} y={cy - 38} width={w} height={34} rx={6}
          fill={`color-mix(in srgb, ${color} 20%, var(--surface))`} stroke={color} strokeWidth={1.4}
          className={styles.chipBox} />
        <text x={cx} y={cy - 22} textAnchor="middle" fill={color} className={styles.chipLabel}>{label}</text>
        <text x={cx} y={cy - 9} textAnchor="middle" fill="var(--text3)" className={styles.chipSub}>{sub}</text>
      </g>
    );
  };

  if (current && flow !== 'idle') {
    const up = flow === 'up';
    if (up) {
      kids.push(
        seg(N.pc1.x + 88, N.pc1.y, N.sw.x - 96, N.sw.y, 'a1', true, 0),
        seg(N.sw.x + 96, N.sw.y, N.srv.x - 88, N.srv.y, 'a2', true, 180),
      );
      if (flooding) {
        kids.push(
          seg(N.sw.x, N.sw.y - 30, N.pc2.x, N.pc2.y + 37, 'a3', false, 240),
          seg(N.sw.x, N.sw.y + 30, N.pc3.x, N.pc3.y - 37, 'a4', false, 240),
        );
      }
      kids.push(chip((N.sw.x + 96 + N.srv.x - 88) / 2, N.srv.y, current.tag, `xid ${XID}`));
    } else {
      kids.push(
        seg(N.srv.x - 88, N.srv.y, N.sw.x + 96, N.sw.y, 'b1', true, 0),
        seg(N.sw.x - 96, N.sw.y, N.pc1.x + 88, N.pc1.y, 'b2', true, 180),
      );
      if (flooding) {
        kids.push(
          seg(N.sw.x, N.sw.y - 30, N.pc2.x, N.pc2.y + 37, 'b3', false, 240),
          seg(N.sw.x, N.sw.y + 30, N.pc3.x, N.pc3.y - 37, 'b4', false, 240),
        );
      }
      // the client-side leg is only ~120px of clear wire, so label the reply
      // over the roomy switch↔server span it has just crossed
      kids.push(chip((N.srv.x - 88 + N.sw.x + 96) / 2, N.srv.y, current.tag, `xid ${XID} · yiaddr 192.168.1.10`));
    }

    const addr = flooding
      ? up ? '0.0.0.0:68  →  255.255.255.255:67' : '192.168.1.1:67  →  255.255.255.255:68'
      : up ? '192.168.1.10:68  →  192.168.1.1:67' : '192.168.1.1:67  →  192.168.1.10:68';

    kids.push(
      <text key="addr" x={W / 2} y={H - 56} textAnchor="middle" fill="var(--text3)" className={styles.addrLine}>{addr}</text>,
      <rect key="tagb" x={W / 2 - 160} y={H - 46} width={320} height={32} rx={6}
        fill={`color-mix(in srgb, ${color} 14%, transparent)`} stroke={color} />,
      <text key="tagt" x={W / 2} y={H - 25} textAnchor="middle" fill={color} className={styles.castTag}>
        {current.tag} · {flooding ? 'BROADCAST' : 'UNICAST'} · {up ? 'client → server' : 'server → client'}
      </text>,
    );
  } else if (current) {
    kids.push(
      <text key="addr" x={W / 2} y={H - 56} textAnchor="middle" fill="var(--text3)" className={styles.addrLine}>
        the address still works — the clock is simply half spent
      </text>,
      <rect key="tagb" x={W / 2 - 170} y={H - 46} width={340} height={32} rx={6}
        fill="color-mix(in srgb, var(--a) 12%, transparent)" stroke="var(--a)" />,
      <text key="tagt" x={W / 2} y={H - 25} textAnchor="middle" fill="var(--a)" className={styles.castTag}>
        T1 TIMER · NOTHING ON THE WIRE
      </text>,
    );
  } else {
    kids.push(
      <text key="idle" x={W / 2} y={H - 30} textAnchor="middle" fill="var(--text3)" className={styles.idleNote}>
        {renew
          ? 'Bound and working. Watch what happens when the lease is half gone.'
          : 'PC-1 has just booted. It has a MAC address and nothing else.'}
      </text>,
    );
  }

  /* ------------------------------ the rail: which message you are on */
  const railX = N.srv.x - 52;
  kids.push(
    <g key="rail">
      {steps.map((entry, i) => {
        const y = 62 + i * 44;
        const passed = i < step - 1;
        const active = i === step - 1;
        const tone = active
          ? entry.flow === 'down' ? 'var(--a)' : entry.flow === 'up' ? 'var(--b)' : 'var(--a)'
          : passed ? 'var(--ok)' : 'var(--text3)';
        return (
          <g key={entry.tag}>
            <circle cx={railX} cy={y} r={active ? 7 : 5} fill={active || passed ? tone : 'transparent'}
              stroke={tone} strokeWidth={1.4} opacity={active || passed ? 1 : 0.5} />
            {i < steps.length - 1 && (
              <line x1={railX} y1={y + 8} x2={railX} y2={y + 36} stroke={passed ? 'var(--ok)' : 'var(--line)'}
                strokeWidth={1.4} opacity={passed ? 0.8 : 0.5} />
            )}
            <text x={railX + 15} y={y + 4} fill={active ? tone : passed ? 'var(--text2)' : 'var(--text3)'}
              className={styles.railTag} data-active={active || undefined}>{entry.tag}</text>
          </g>
        );
      })}
    </g>,
  );

  /* ------------------------------------------------------- the lease clock */
  if (bound) {
    const cx = N.pc1.x;
    const cy = H - 106;
    const r = 26;
    const frac = renew ? 0.5 : 1;
    const angle = -Math.PI / 2 + frac * 2 * Math.PI;
    const large = frac > 0.5 ? 1 : 0;
    const dx = cx + r * Math.cos(angle);
    const dy = cy + r * Math.sin(angle);
    const tone = renew ? 'var(--a)' : 'var(--ok)';
    kids.push(
      <g key="leaseclock">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth={5} />
        <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${dx.toFixed(1)} ${dy.toFixed(1)}`}
          fill="none" stroke={tone} strokeWidth={5} strokeLinecap="round" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill={tone} className={styles.clockLabel}>{renew ? 'T1' : '24h'}</text>
        <text x={cx} y={cy + r + 16} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>
          {renew ? 'lease half spent' : 'lease granted'}
        </text>
      </g>,
    );
  }

  return (
    <svg key={`${tick}-${renew}`} viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`DHCP exchange across one broadcast domain, step ${step} of ${steps.length}`}>
      <defs>
        <marker id="dh-up" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--b)" />
        </marker>
        <marker id="dh-dn" markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--a)" />
        </marker>
      </defs>
      {kids}
      {current && (
        <StepCallout
          key={`callout-${step}-${renew}-${tick}`}
          x={flow === 'down' ? N.srv.x : N.pc1.x}
          y={(flow === 'down' ? N.srv.y : N.pc1.y) - 46}
          side="up"
          text={(renew ? renewCallouts : freshCallouts)[step - 1]}
          tone={flow === 'down' ? 'var(--a)' : flow === 'up' ? 'var(--b)' : 'var(--a)'}
          width={W}
          height={H}
        />
      )}
    </svg>
  );
}
