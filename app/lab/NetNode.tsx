import type { ComponentType, CSSProperties, ReactNode } from 'react';
import {
  Browser,
  Cloud,
  Database,
  Desktop,
  Detective,
  DeviceMobile,
  EnvelopeSimple,
  Globe,
  HardDrives,
  Laptop,
  TerminalWindow,
  Tray,
  TreeStructure,
  WifiHigh,
  type IconProps,
} from '@phosphor-icons/react';
import styles from './net-node.module.css';

/* The network drawing kit for the lab diagrams.

   Every lab draws its machines the way the ARP lab does: a card with the
   device's icon in its own tinted tile, the name beside it, and the address
   under the name. The icons are real network symbols, so a router reads as a
   router at a glance rather than as one more grey box with ROUTER written on
   it. Phosphor has no router, switch or firewall, so those three are drawn
   here in the same line weight (256 grid, 16 stroke, round caps) as Phosphor's
   regular icons, and the rest come straight from Phosphor.

   It is plain SVG — no foreignObject — so it drops into any of the existing
   diagrams and scales with them. */

export type NetKind =
  | 'pc' | 'laptop' | 'phone' | 'server' | 'dns' | 'database' | 'mail' | 'mailbox'
  | 'router' | 'switch' | 'firewall' | 'cloud' | 'internet' | 'wifi'
  | 'observer' | 'browser' | 'terminal';

type Glyph = (props: { x: number; y: number; size: number; color: string }) => ReactNode;

/** wraps a hand-drawn 256-grid glyph in its own positioned svg, like a Phosphor icon */
const drawn = (body: ReactNode): Glyph => function DrawnGlyph({ x, y, size, color }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color}
      strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {body}
    </svg>
  );
};

const phosphor = (Icon: ComponentType<IconProps>): Glyph => function PhosphorGlyph({ x, y, size, color }) {
  return <Icon x={x} y={y} size={size} color={color} weight="duotone" aria-hidden="true" />;
};

/* the router symbol: a disc with two routes coming in and two going out */
const RouterGlyph = drawn(
  <>
    <circle cx={128} cy={128} r={96} />
    <path d="M128 44v48M112 78l16 16 16-16" />
    <path d="M128 212v-48M112 178l16-16 16 16" />
    <path d="M100 128H48M64 112l-16 16 16 16" />
    <path d="M156 128h52M192 112l16 16-16 16" />
  </>,
);

/* the switch symbol: a box with frames crossing it both ways */
const SwitchGlyph = drawn(
  <>
    <rect x={24} y={56} width={208} height={144} rx={20} />
    <path d="M60 104h128M172 88l16 16-16 16" />
    <path d="M196 152H68M84 136l-16 16 16 16" />
  </>,
);

/* the firewall symbol: a brick wall */
const FirewallGlyph = drawn(
  <>
    <rect x={32} y={48} width={192} height={160} rx={12} />
    <path d="M32 101h192M32 155h192M96 48v53M160 48v53M64 101v54M128 101v54M192 101v54M96 155v53M160 155v53" />
  </>,
);

export const GLYPHS: Record<NetKind, Glyph> = {
  pc: phosphor(Desktop),
  laptop: phosphor(Laptop),
  phone: phosphor(DeviceMobile),
  server: phosphor(HardDrives),
  dns: phosphor(TreeStructure),
  database: phosphor(Database),
  mail: phosphor(EnvelopeSimple),
  mailbox: phosphor(Tray),
  router: RouterGlyph,
  switch: SwitchGlyph,
  firewall: FirewallGlyph,
  cloud: phosphor(Cloud),
  internet: phosphor(Globe),
  wifi: phosphor(WifiHigh),
  observer: phosphor(Detective),
  browser: phosphor(Browser),
  terminal: phosphor(TerminalWindow),
};

/** one network icon, top-left at (x, y) */
export function NetGlyph({ kind, x, y, size, color }: { kind: NetKind; x: number; y: number; size: number; color: string }) {
  const Draw = GLYPHS[kind];
  return <Draw x={x} y={y} size={size} color={color} />;
}

/** just the tinted icon tile, top-left at (x, y), for a diagram that draws
    its own card around it */
export function NetTile({ kind, x, y, size, tone }: { kind: NetKind; x: number; y: number; size: number; tone: string }) {
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.22}
        fill={`color-mix(in srgb, ${tone} 14%, var(--surface))`}
        stroke={`color-mix(in srgb, ${tone} 45%, transparent)`} />
      <NetGlyph kind={kind} x={x + size * 0.19} y={y + size * 0.19} size={size * 0.62} color={tone} />
    </g>
  );
}

/** A machine on the diagram, centred on (cx, cy): icon tile on the left,
    name and up to two lines of detail beside it. `tone` colours the border,
    the tile and the name; `lit` adds the glow the active machine gets. */
export default function NetNode({
  cx, cy, w, h, kind, title, sub, sub2, tone = 'var(--text3)', subTone, dim, lit, dashed, fill, faint,
}: {
  cx: number; cy: number; w: number; h: number;
  kind: NetKind;
  title: string;
  sub?: string;
  sub2?: string;
  tone?: string;
  /** colour for the address line; defaults to the tone */
  subTone?: string;
  /** greyed out: not part of this step */
  dim?: boolean;
  /** glowing: the machine this step is about */
  lit?: boolean;
  /** a dashed border, for something that sits on the path rather than at an end */
  dashed?: boolean;
  /** overrides the card's background */
  fill?: string;
  /** the tone is only a border hint; the name stays in body text colour */
  faint?: boolean;
}) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const tile = Math.min(44, h - 20);
  const tileX = x + 11;
  const tileY = cy - tile / 2;
  const textX = tileX + tile + 11;
  const lines = sub2 ? 3 : sub ? 2 : 1;
  const titleY = lines === 3 ? cy - 9 : lines === 2 ? cy - 3 : cy + 4.5;
  const nameColor = dim ? 'var(--text3)' : faint ? 'var(--text)' : tone;

  return (
    <g className={styles.node} data-lit={lit || undefined}
      style={{ opacity: dim ? 0.42 : 1, '--node-tone': tone } as CSSProperties}>
      <rect x={x} y={y} width={w} height={h} rx={10}
        fill={fill ?? (dim ? 'var(--surface2)' : `color-mix(in srgb, ${tone} 7%, var(--surface))`)}
        stroke={dim ? 'var(--line)' : tone} strokeWidth={lit ? 2 : 1.4}
        strokeDasharray={dashed ? '5 4' : undefined} />
      <rect x={tileX} y={tileY} width={tile} height={tile} rx={9}
        fill={dim ? 'var(--surface)' : `color-mix(in srgb, ${tone} 14%, var(--surface))`}
        stroke={dim ? 'var(--line)' : `color-mix(in srgb, ${tone} 45%, transparent)`} />
      <NetGlyph kind={kind} x={tileX + tile * 0.19} y={tileY + tile * 0.19} size={tile * 0.62}
        color={dim ? 'var(--text3)' : tone} />
      <text x={textX} y={titleY} fill={nameColor} className={styles.title}>{title}</text>
      {sub && (
        <text x={textX} y={titleY + 16} fill={dim ? 'var(--text3)' : subTone ?? tone} className={styles.sub}>{sub}</text>
      )}
      {sub2 && <text x={textX} y={titleY + 31} fill="var(--text3)" className={styles.note}>{sub2}</text>}
    </g>
  );
}
