'use client';

import type { CSSProperties, ReactNode } from 'react';
import StepCallout from '../StepCallout';
import { flowTone, toneVar, type Scenario, type SnmpStep } from './snmp-data';
import styles from './snmp-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

const W = 1000;
const H = 470;

/* The two machines are tall enough that both lanes meet them. The lesson of
   the drawing is the two lanes: questions and answers share UDP 161, and the
   alarm travels the other way on its own port, 162. */
const MGR = { x: 50, y: 92, w: 220, h: 270 };
const AGT = { x: 730, y: 92, w: 220, h: 270 };
const L = MGR.x + MGR.w;
const R = AGT.x;
const MID = (L + R) / 2;
const LANE_POLL = 178;
const LANE_TRAP = 300;
const mgrX = MGR.x + MGR.w / 2;
const agtX = AGT.x + AGT.w / 2;

/* a minute-by-minute history for the little graph on the manager; the last
   bar is the point this lab's two polls produce */
const history = [14, 19, 16, 22, 20, 26, 23, 29, 27, 31, 30, 34];

const PORT_W = 44;
const PORT_GAP = 16;
const portX = (i: number) => agtX - (3 * PORT_W + 2 * PORT_GAP) / 2 + i * (PORT_W + PORT_GAP);

export default function SnmpDiagram({ sc, steps, step, tick }: {
  sc: Scenario; steps: SnmpStep[]; step: number; tick: number;
}) {
  const poll = sc === 'poll';
  const current = step > 0 ? steps[step - 1] : null;
  const flow = current?.flow;
  const color = current ? toneVar[flowTone[current.flow]] : 'var(--text3)';
  const onTrap = flow === 'trap';
  const down = poll && step >= 7;
  const rated = poll && step >= 6;
  const baseline = poll && step >= 4;
  const walking = poll && (step === 3 || step === 4);
  const watching = poll && (step === 5 || step === 6);
  const mgrPort = poll ? '49732' : '49733';

  const kids: ReactNode[] = [];

  /* ------------------------------------------------------------ the lanes */
  kids.push(
    <g key="lanes">
      <line x1={L} y1={LANE_POLL} x2={R} y2={LANE_POLL} stroke="var(--line)" strokeWidth={1.5} />
      <line x1={L} y1={LANE_TRAP} x2={R} y2={LANE_TRAP} stroke="var(--line)" strokeWidth={1.5}
        strokeDasharray="6 6" opacity={poll ? 1 : 0.45} />

      {/* high enough above the lane that an arrowhead landing at the port
          never sits on top of the port's own number */}
      <text x={L + 10} y={LANE_POLL - 14} fill="var(--b)" className={styles.portLabel}>:{mgrPort}</text>
      <text x={R - 10} y={LANE_POLL - 14} textAnchor="end" fill="var(--b)" className={styles.portLabel}>:161</text>
      <text x={L + 10} y={LANE_TRAP - 14} fill={poll ? 'var(--rst)' : 'var(--text3)'} className={styles.portLabel}>:162 listening</text>
      {poll && (
        <text x={R - 10} y={LANE_TRAP - 14} textAnchor="end" fill="var(--rst)" className={styles.portLabel}>:57203</text>
      )}

      <text x={MID} y={LANE_POLL + 22} textAnchor="middle" fill="var(--text3)" className={styles.laneCaption}>
        UDP 161 · the manager asks, the agent answers
      </text>
      <text x={MID} y={LANE_TRAP + 22} textAnchor="middle" fill="var(--text3)" className={styles.laneCaption}>
        {poll ? 'UDP 162 · the agent speaks first — nobody replies' : 'UDP 162 · unused in this exchange'}
      </text>
    </g>,
  );

  /* --------------------------------------------------------- the machines */
  const machine = (key: string, b: typeof MGR, name: string, addr: string, role: string, accent: string, lit: boolean) => (
    <g key={key}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={10}
        fill={lit ? `color-mix(in srgb, ${accent} 8%, var(--surface2))` : 'var(--surface2)'}
        stroke={lit ? accent : 'var(--line)'} strokeWidth={lit ? 1.6 : 1} />
      <text x={b.x + b.w / 2} y={b.y + 28} textAnchor="middle" fill="var(--text)" className={styles.nodeName}>{name}</text>
      <text x={b.x + b.w / 2} y={b.y + 48} textAnchor="middle" fill={accent} className={styles.nodeAddr}>{addr}</text>
      <text x={b.x + b.w / 2} y={b.y + 66} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>{role}</text>
      <line x1={b.x + 16} y1={b.y + 82} x2={b.x + b.w - 16} y2={b.y + 82} stroke="var(--line)" />
    </g>
  );

  kids.push(
    machine('mgr', MGR, 'NMS · MONITORING', '10.0.0.50', poll ? 'polls every 60 s' : 'v3 user nms-ro', 'var(--b)', flow === 'req'),
    machine('agt', AGT, 'CORE-RTR-01', '10.0.0.1', 'snmp agent · MIB-2', down ? 'var(--rst)' : 'var(--a)', flow === 'resp' || onTrap),
  );

  /* ------------------------------------------- what the manager has learned */
  if (poll) {
    if (rated) {
      const barW = 10;
      const gap = 4;
      const x0 = mgrX - (history.length * (barW + gap) - gap) / 2;
      const base = 300;
      kids.push(
        <g key="graph">
          <text x={mgrX} y={196} textAnchor="middle" fill="var(--text3)" className={styles.widgetLabel}>GI0/2 · INBOUND</text>
          <text x={mgrX} y={224} textAnchor="middle" fill="var(--ok)" className={styles.widgetBig}>45.0 Mbit/s</text>
          {history.map((h, i) => {
            const last = i === history.length - 1;
            return (
              <rect key={i} x={x0 + i * (barW + gap)} y={base - h} width={barW} height={h} rx={2}
                fill={last ? 'var(--ok)' : 'color-mix(in srgb, var(--b) 35%, var(--surface2))'}
                className={last ? styles.pop : undefined} />
            );
          })}
          <line x1={x0 - 4} y1={base + 0.5} x2={x0 + history.length * (barW + gap)} y2={base + 0.5} stroke="var(--line)" />
        </g>,
      );
      if (down) {
        kids.push(
          <g key="alert" className={styles.pop}>
            <rect x={MGR.x + 16} y={316} width={MGR.w - 32} height={30} rx={5}
              fill="color-mix(in srgb, var(--rst) 14%, var(--surface))" stroke="var(--rst)" strokeWidth={1.4} />
            <text x={mgrX} y={335} textAnchor="middle" fill="var(--rst)" className={styles.alertText}>ALERT · linkDown · Gi0/2</text>
          </g>,
        );
      }
    } else if (baseline) {
      kids.push(
        <g key="baseline">
          <text x={mgrX} y={226} textAnchor="middle" fill="var(--a)" className={styles.widgetLabel}>BASELINE STORED</text>
          <text x={mgrX} y={250} textAnchor="middle" fill="var(--text2)" className={styles.nodeNote}>ifInOctets.3 = 1,204,775,210</text>
          <text x={mgrX} y={272} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>one reading · no rate yet</text>
        </g>,
      );
    } else {
      kids.push(
        <text key="empty" x={mgrX} y={250} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>
          {step > 0 ? 'uptime known · no counters yet' : 'no readings yet'}
        </text>,
      );
    }
  } else {
    const known = step >= 2;
    kids.push(
      <g key="keys">
        <text x={mgrX} y={218} textAnchor="middle" fill={known ? 'var(--ok)' : 'var(--rst)'} className={styles.widgetLabel}>
          {known ? 'KEYS LOCALISED' : 'KEYS · CANNOT DERIVE'}
        </text>
        <text x={mgrX} y={242} textAnchor="middle" fill="var(--text2)" className={styles.nodeNote}>
          {known ? 'to engine …a43b81' : 'engine ID unknown'}
        </text>
        <text x={mgrX} y={262} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>
          SHA-256 auth · AES-128 priv
        </text>
        {step >= 4 && (
          <g className={styles.pop}>
            <rect x={MGR.x + 16} y={316} width={MGR.w - 32} height={30} rx={5}
              fill="color-mix(in srgb, var(--ok) 14%, var(--surface))" stroke="var(--ok)" strokeWidth={1.4} />
            <text x={mgrX} y={335} textAnchor="middle" fill="var(--ok)" className={styles.alertText}>VERIFIED · DECRYPTED</text>
          </g>
        )}
      </g>,
    );
  }

  /* ------------------------------------------------ the router's interfaces */
  kids.push(
    <g key="ports">
      {['Gi0/0', 'Gi0/1', 'Gi0/2'].map((name, i) => {
        const third = i === 2;
        const failed = down && third;
        const lit = walking || (watching && third);
        const tone = failed ? 'var(--rst)' : lit ? color : 'var(--line)';
        return (
          <g key={name}>
            {failed && (
              <rect x={portX(i) - 6} y={194} width={PORT_W + 12} height={38} rx={7}
                fill="none" stroke="var(--rst)" strokeWidth={1.5} className={styles.ring} />
            )}
            <rect x={portX(i)} y={200} width={PORT_W} height={26} rx={4}
              fill={failed ? 'color-mix(in srgb, var(--rst) 18%, var(--surface))' : lit ? `color-mix(in srgb, ${tone} 22%, var(--surface))` : 'var(--surface)'}
              stroke={tone} strokeWidth={failed || lit ? 1.6 : 1} />
            <circle cx={portX(i) + PORT_W / 2} cy={213} r={3.5}
              fill={failed ? 'var(--rst)' : poll ? 'var(--ok)' : 'var(--text3)'} />
            <text x={portX(i) + PORT_W / 2} y={244} textAnchor="middle"
              fill={failed ? 'var(--rst)' : lit ? tone : 'var(--text3)'} className={styles.portName}>{name}</text>
          </g>
        );
      })}
    </g>,
  );

  const uptime = step >= 7 ? '42d 06:13:14' : step >= 6 ? '42d 06:12:23' : '42d 06:11:23';
  const octets = step >= 6 ? '1,542,275,210' : '1,204,775,210';
  kids.push(
    <g key="agentfacts">
      {poll ? (
        <>
          <text x={agtX} y={276} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>sysUpTime {uptime}</text>
          <text x={agtX} y={296} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>ifInOctets.3 {octets}</text>
          <text x={agtX} y={334} textAnchor="middle" fill="var(--rst)" className={styles.nodeNote}>community &quot;public&quot; · ro</text>
        </>
      ) : (
        <>
          <text x={agtX} y={276} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>engine …a43b81</text>
          <text x={agtX} y={296} textAnchor="middle" fill="var(--text3)" className={styles.nodeNote}>boots 17 · time 3651083</text>
          <text x={agtX} y={334} textAnchor="middle" fill="var(--ok)" className={styles.nodeNote}>user nms-ro · authPriv</text>
        </>
      )}
    </g>,
  );

  /* -------------------------------------------------------- the datagram */
  if (current) {
    const lane = onTrap ? LANE_TRAP : LANE_POLL;
    const rightward = flow === 'req';
    const x1 = rightward ? L + 6 : R - 6;
    const x2 = rightward ? R - 12 : L + 12;
    const len = Math.abs(x2 - x1);
    const chipW = Math.max(176, current.tag.length * 8.2 + 40, current.chipSub.length * 6.1 + 30);
    const expoW = current.exposure.text.length * 6.4 + 28;
    const expoTone = toneVar[current.exposure.tone];

    kids.push(
      <line key="msg" x1={x1} y1={lane} x2={x2} y2={lane} stroke={color} strokeWidth={2.8}
        markerEnd={`url(#snmp-${flowTone[current.flow]})`} strokeDasharray={len}
        className={styles.draw} style={{ '--len': String(len) } as Vars} />,
      <rect key="pkt" width={22} height={14} rx={3} fill={color} className={styles.packet}
        style={{ offsetPath: `path('M ${x1} ${lane} L ${x2} ${lane}')` }} />,
      <g key="chip">
        <rect x={MID - chipW / 2} y={lane - 50} width={chipW} height={36} rx={6}
          fill={`color-mix(in srgb, ${color} 18%, var(--surface))`} stroke={color} strokeWidth={1.4}
          className={styles.chipBox} />
        <text x={MID} y={lane - 34} textAnchor="middle" fill={color} className={styles.chipLabel}>{current.tag}</text>
        <text x={MID} y={lane - 20} textAnchor="middle" fill="var(--text3)" className={styles.chipSub}>{current.chipSub}</text>
      </g>,
      <g key="expo" className={styles.fade}>
        <rect x={MID - expoW / 2} y={lane + 32} width={expoW} height={22} rx={11}
          fill={`color-mix(in srgb, ${expoTone} 12%, var(--surface))`} stroke={expoTone} strokeWidth={1} />
        <text x={MID} y={lane + 47} textAnchor="middle" fill={expoTone} className={styles.exposure}>{current.exposure.text}</text>
      </g>,
    );

    const addr = flow === 'req'
      ? `10.0.0.50:${mgrPort}  →  10.0.0.1:161`
      : onTrap ? '10.0.0.1:57203  →  10.0.0.50:162' : `10.0.0.1:161  →  10.0.0.50:${mgrPort}`;
    const direction = flow === 'req' ? 'manager → agent' : 'agent → manager';

    kids.push(
      <text key="addr" x={W / 2} y={H - 60} textAnchor="middle" fill="var(--text3)" className={styles.addrLine}>{addr}</text>,
      <rect key="tagb" x={W / 2 - 190} y={H - 50} width={380} height={32} rx={6}
        fill={`color-mix(in srgb, ${color} 14%, transparent)`} stroke={color} />,
      <text key="tagt" x={W / 2} y={H - 29} textAnchor="middle" fill={color} className={styles.castTag}>
        {current.tag} · {direction} · UDP {onTrap ? 162 : 161}
      </text>,
    );
  } else {
    kids.push(
      <text key="idle" x={W / 2} y={H - 34} textAnchor="middle" fill="var(--text3)" className={styles.idleNote}>
        {poll
          ? 'The NMS knows one address and one shared string. Nothing has been asked yet.'
          : 'The NMS has a v3 user and two passphrases — but no keys: keys belong to one engine.'}
      </text>,
    );
  }

  return (
    <svg key={`${tick}-${sc}`} viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`SNMP between a monitoring server and a router, step ${step} of ${steps.length}`}>
      <defs>
        {(['b', 'a', 'rst'] as const).map((tone) => (
          <marker key={tone} id={`snmp-${tone}`} markerWidth={9} markerHeight={9} refX={8} refY={4.5} orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill={toneVar[tone]} />
          </marker>
        ))}
      </defs>
      {kids}
      {current && (
        <StepCallout
          key={`callout-${step}-${sc}-${tick}`}
          x={flow === 'req' ? mgrX : agtX}
          y={MGR.y - 8}
          side="up"
          text={current.callout}
          tone={color}
          width={W}
          height={H}
        />
      )}
    </svg>
  );
}
