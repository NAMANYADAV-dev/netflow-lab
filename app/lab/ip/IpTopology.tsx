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
import type { IpDest, IpStep } from './ip-data';
import styles from './ip-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const A = 'var(--a)';
const B = 'var(--b)';
const OK = 'var(--ok)';
const LINE = 'var(--line)';
const T3 = 'var(--text3)';

type Node = {
  x: number; y: number; w: number; h: number;
  label: string; sub: string; icon: ReactNode; color: string;
};

const nodes: Record<string, Node> = {
  pc1: { x: 10, y: 18, w: 124, h: 44, label: 'PC-1', sub: '192.168.1.10', icon: <Desktop weight="duotone" size={14} />, color: A },
  pc2: { x: 10, y: 86, w: 124, h: 44, label: 'PC-2', sub: '192.168.1.20', icon: <Desktop weight="duotone" size={14} />, color: T3 },
  pc3: { x: 10, y: 154, w: 124, h: 44, label: 'PC-3', sub: '192.168.1.23', icon: <Desktop weight="duotone" size={14} />, color: T3 },
  pc4: { x: 10, y: 222, w: 124, h: 44, label: 'PC-4', sub: '192.168.1.25', icon: <Desktop weight="duotone" size={14} />, color: T3 },
  sw: { x: 196, y: 120, w: 112, h: 46, label: 'LAN SWITCH', sub: 'layer 2', icon: <Network weight="duotone" size={14} />, color: 'var(--text2)' },
  rt: { x: 368, y: 78, w: 168, h: 130, label: 'ROUTER / GATEWAY', sub: 'NAT + PAT', icon: <HardDrives weight="duotone" size={14} />, color: B },
  isp: { x: 596, y: 118, w: 110, h: 52, label: 'ISP', sub: 'internet', icon: <GlobeHemisphereWest weight="duotone" size={14} />, color: 'var(--text2)' },
  web: { x: 766, y: 96, w: 150, h: 96, label: 'WEB SERVER', sub: '203.0.113.20', icon: <Cloud weight="duotone" size={14} />, color: B },
};

const links: [string, string][] = [
  ['pc1', 'sw'], ['pc2', 'sw'], ['pc3', 'sw'], ['pc4', 'sw'],
  ['sw', 'rt'], ['rt', 'isp'], ['isp', 'web'],
];

const W = 930;
const H = 286;

const remoteCallouts = [
  'Is this destination local?',
  'Send the frame to the gateway',
  'Forward it to the router',
  'Private address becomes public',
  'Route toward the destination',
  'Final hop to the server',
  'This address is mine — deliver',
  'Reverse NAT sends the reply home',
];

const localCallouts = [
  'Same subnet — skip the gateway',
  'Send directly toward PC-3',
  'Delivered locally — TTL stays 64',
];

const centre = (n: Node) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

/* If a sits to the right of b, leave a's left edge and land on b's right edge —
   which is what the local path does when the switch hands back down to PC-3. */
const edge = (a: Node, b: Node) =>
  a.x > b.x
    ? { x1: a.x, y1: centre(a).y, x2: b.x + b.w, y2: centre(b).y }
    : { x1: a.x + a.w, y1: centre(a).y, x2: b.x, y2: centre(b).y };

/** the long dashed curve the reply takes home, drawn under the whole diagram */
const replyPath = () => {
  const web = centre(nodes.web);
  const pc1 = centre(nodes.pc1);
  return `M ${web.x} ${nodes.web.y + nodes.web.h} C ${web.x - 160} ${H - 6}, ${pc1.x + 180} ${H - 6}, ${pc1.x} ${nodes.pc1.y + nodes.pc1.h}`;
};

export default function IpTopology({ step, current, dest, tick }: {
  step: number; current: IpStep | null; dest: IpDest; tick: number;
}) {
  const isLocal = dest === 'local';
  const activeSeg = current?.seg ? current.seg.join('-') : null;
  const isReply = activeSeg === 'web-pc1';
  const lanLive = step >= 1 && step <= 3;
  const natOn = !isLocal && step >= 4;
  const inPath = isLocal ? ['pc1', 'sw', 'pc3'] : ['pc1', 'sw', 'rt', 'isp', 'web'];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`Datagram path to the ${isLocal ? 'local host' : 'web server'}, step ${step}`}>

      <rect x={2} y={4} width={342} height={276} rx={7} fill="none"
        stroke={lanLive ? A : LINE} strokeWidth={1.2} strokeDasharray="6 5" opacity={lanLive ? 0.85 : 0.5} />
      <text x={10} y={277} fontFamily="var(--mono)" fontSize={9} fill={lanLive ? A : T3}>
        LAN  192.168.1.0/24   mask 255.255.255.0
      </text>
      <text x={600} y={277} fontFamily="var(--mono)" fontSize={9} fill={step >= 4 && !isLocal ? B : T3}>
        PUBLIC INTERNET — routed, no NAT beyond here
      </text>

      {links.map(([aKey, bKey], index) => {
        const e = edge(nodes[aKey], nodes[bKey]);
        const on = activeSeg === `${aKey}-${bKey}` || activeSeg === `${bKey}-${aKey}`;
        return (
          <line key={index} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={on ? B : LINE} strokeWidth={on ? 2 : 1.4} opacity={on ? 1 : 0.75} />
        );
      })}

      <text x={340} y={163} textAnchor="end" fontFamily="var(--mono)" fontSize={8} fill={T3}>Gi0/0</text>
      <text x={544} y={163} fontFamily="var(--mono)" fontSize={8} fill={T3}>Gi0/1</text>

      {isReply && (
        <path d={replyPath()} fill="none" stroke={OK} strokeWidth={1.8} strokeDasharray="5 4" />
      )}

      {Object.entries(nodes).map(([key, node]) => {
        const isHere = current?.from === key && !current.seg;
        const onPath = inPath.includes(key);
        const stroke = isHere ? B : onPath ? node.color : LINE;

        return (
          <g key={key}>
            <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={5}
              fill="var(--surface2)" stroke={stroke} strokeWidth={isHere ? 2 : 1.4} opacity={onPath ? 1 : 0.62} />
            {isHere && (
              <rect key={`ring-${tick}`} x={node.x - 4} y={node.y - 4} width={node.w + 8} height={node.h + 8} rx={7}
                fill="none" stroke={B} strokeWidth={1.4} className={styles.ring}
                style={{ transformOrigin: `${node.x + node.w / 2}px ${node.y + node.h / 2}px` }} />
            )}
            <foreignObject x={node.x + 8} y={node.y + 7} width={16} height={16}>
              <div className={styles.icon} style={{ color: stroke }}>{node.icon}</div>
            </foreignObject>
            <text x={node.x + 28} y={node.y + 19} fontFamily="var(--sans)" fontWeight={650} fontSize={10.5}
              fill="var(--text)" opacity={onPath ? 1 : 0.7}>{node.label}</text>
            <text x={node.x + 28} y={node.y + 33} fontFamily="var(--mono)" fontSize={9} fill={T3}>{node.sub}</text>

            {key === 'rt' && (
              <>
                <text x={node.x + 12} y={node.y + 58} fontFamily="var(--mono)" fontSize={9} fill="var(--text2)">Gi0/0  192.168.1.1</text>
                <text x={node.x + 12} y={node.y + 74} fontFamily="var(--mono)" fontSize={9} fill="var(--text2)">Gi0/1  80.12.16.10</text>
                <text x={node.x + 12} y={node.y + 92} fontFamily="var(--mono)" fontSize={9} fill={natOn ? A : T3}>
                  {natOn ? '● NAT active' : '○ NAT idle'}
                </text>
                {natOn && (
                  <text x={node.x + 12} y={node.y + 108} fontFamily="var(--mono)" fontSize={8.5} fill={A}>52310 → 40001</text>
                )}
              </>
            )}

            {key === 'web' && (
              <>
                <text x={node.x + 12} y={node.y + 58} fontFamily="var(--mono)" fontSize={9} fill="var(--text2)">HTTPS  TCP 443</text>
                <text x={node.x + 12} y={node.y + 76} fontFamily="var(--mono)" fontSize={9} fill={!isLocal && step >= 7 ? OK : T3}>
                  {!isLocal && step >= 7 ? '● listening — hit' : '○ listening'}
                </text>
              </>
            )}
          </g>
        );
      })}

      {current?.seg && (() => {
        const e = edge(nodes[current.seg[0]], nodes[current.seg[1]]);
        const d = isReply ? replyPath() : `M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`;
        const color = isReply ? OK : B;
        return (
          <g key={`packet-${tick}`} className={styles.travel}
            style={{ offsetPath: `path('${d}')`, filter: `drop-shadow(0 0 6px ${color})` } as Vars}>
            <rect x={-13} y={-7} width={26} height={14} rx={3} fill={color} />
            <text x={0} y={4} textAnchor="middle" fontFamily="var(--mono)" fontSize={8} fontWeight={650} fill="var(--bg)">IP</text>
          </g>
        );
      })()}


      {current && (() => {
        const actor = nodes[current.from];
        const actorCentre = centre(actor);
        const leftActor = current.from === 'pc1' || current.from === 'sw';
        const rightActor = current.from === 'web';
        return (
          <StepCallout
            key={`callout-${step}-${dest}-${tick}`}
            x={leftActor ? actor.x + actor.w + 8 : rightActor ? actor.x - 8 : actorCentre.x}
            y={leftActor || rightActor ? actorCentre.y : actor.y - 5}
            side={leftActor ? 'right' : rightActor ? 'left' : 'up'}
            text={(isLocal ? localCallouts : remoteCallouts)[step - 1]}
            tone={isReply ? OK : current.nat ? A : B}
            width={W}
            height={H}
          />
        );
      })()}
    </svg>
  );
}
