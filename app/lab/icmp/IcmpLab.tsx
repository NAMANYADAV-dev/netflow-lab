'use client';

import { useState } from 'react';
import {
  Broadcast,
  CheckCircle,
  GitFork,
  Lightbulb,
  Package,
  Path,
  TerminalWindow,
} from '@phosphor-icons/react';
import { stepsFor, type IcmpTool } from './icmp-data';
import { PingTopology, TraceLadder } from './IcmpDiagrams';
import styles from './icmp-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const advanceLabels: Record<IcmpTool, string[]> = {
  ping: ['Send echo request →', 'Router hop 1 →', 'ISP hop 2 →', 'Server answers →', 'Reply home', 'Ping complete'],
  trace: ['Probe with ttl=1 →', 'Probe with ttl=2 →', 'Probe with ttl=3 →', 'Trace complete'],
};

const walkLabels: Record<IcmpTool, string[]> = {
  ping: [
    'Echo request built (type 8)',
    'Router decrements ttl 64→63',
    'ISP decrements ttl 63→62',
    'Server flips it to type 0',
    'Reply matched — rtt measured',
  ],
  trace: [
    'ttl=1 dies at hop 1 — hop 1 named',
    'ttl=2 dies at hop 2 — hop 2 named',
    'ttl=3 arrives — trace ends',
  ],
};

const consoleOutput: Record<IcmpTool, { text: string; color: string }[]> = {
  ping: [
    { text: 'ICMP echo request  id=0x4f21 seq=1  ttl=64  56 bytes', color: 'var(--text2)' },
    { text: 'hop 1  192.168.1.1     ttl 64 → 63', color: 'var(--text2)' },
    { text: 'hop 2  80.12.16.1      ttl 63 → 62', color: 'var(--text2)' },
    { text: '203.0.113.20 replies: type 8 → type 0, payload echoed', color: 'var(--a)' },
    { text: '64 bytes from 203.0.113.20: icmp_seq=1 ttl=62 time=24.4 ms', color: 'var(--ok)' },
  ],
  trace: [
    { text: ' 1   192.168.1.1      0.412 ms   ← time exceeded (type 11)', color: 'var(--rst)' },
    { text: ' 2   80.12.16.1      11.803 ms   ← time exceeded (type 11)', color: 'var(--rst)' },
    { text: ' 3   203.0.113.20    24.417 ms   ← echo reply (type 0)', color: 'var(--ok)' },
  ],
};

const OPENING = {
  ping: 'Ping asks one question and times the answer. It is the smallest useful conversation two machines can have — and it uses no ports at all, because ICMP is not a transport protocol; it rides straight on IP.',
  trace: 'Traceroute has no special powers. It just sends packets that are designed to die — one hop earlier each time — and reads the addresses of the routers that complain. The failures ARE the map.',
};

export default function IcmpLab() {
  const [tool, setTool] = useState<IcmpTool>('ping');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  const isPing = tool === 'ping';
  const steps = stepsFor(tool);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;

  const chooseTool = (next: IcmpTool) => {
    if (next === tool) return;
    setTool(next);
    setStep(0);
    setTick((value) => value + 1);
  };

  const advance = () => {
    if (step >= maxStep) return;
    const next = step + 1;
    setStep(next);
    setTick((value) => value + 1);
  };

  const reset = () => { setStep(0); setTick((value) => value + 1); };

  let stateText = 'IDLE';
  let stateColor = 'var(--text3)';
  if (isPing) {
    if (step > 0 && step < 4) { stateText = 'REQUEST IN FLIGHT'; stateColor = 'var(--b)'; }
    else if (step === 4) { stateText = 'ECHOED'; stateColor = 'var(--a)'; }
    else if (step >= 5) { stateText = 'REPLY RECEIVED'; stateColor = 'var(--ok)'; }
  } else if (step > 0 && step < 3) { stateText = 'TTL EXPIRED — HOP NAMED'; stateColor = 'var(--rst)'; }
  else if (step >= 3) { stateText = 'PATH MAPPED'; stateColor = 'var(--ok)'; }

  const type = current?.type ?? 8;
  const typeName = type === 8 ? '8 — echo request' : type === 0 ? '0 — echo reply' : '11 — time exceeded';
  const ttlAlert = Boolean(current && current.ttl <= 1 && !isPing);

  const headerFields = [
    {
      k: 'icmp type', v: typeName,
      note: type === 11
        ? 'Not an answer — a router reporting a packet it had to discard.'
        : type === 0
          ? 'The mirror of the request, sent by the destination itself.'
          : 'A question: are you reachable?',
      color: type === 11 ? 'var(--rst)' : type === 0 ? 'var(--ok)' : 'var(--b)',
      alert: type === 11,
    },
    {
      k: 'code', v: current ? String(current.code) : '0',
      note: type === 11
        ? 'Code 0 = TTL exceeded in transit (code 1 would be fragment reassembly).'
        : 'Code 0 is the only code these types use.',
      color: 'var(--text)', alert: false,
    },
    {
      k: 'ttl on the wire', v: current ? String(current.ttl) : isPing ? '64' : '1',
      note: isPing
        ? 'One less at every router; layer 2 devices leave it alone.'
        : 'Traceroute sets this deliberately low — the expiry IS the measurement.',
      color: ttlAlert ? 'var(--rst)' : 'var(--text)', alert: ttlAlert,
    },
    {
      k: 'identifier / seq', v: isPing ? '0x4f21 / 1' : `0x4f21 / ${step || 1}`,
      note: 'How the tool pairs a reply with the request that earned it.',
      color: 'var(--text)', alert: false,
    },
    {
      k: 'carried inside', v: 'ip.proto = 1',
      note: 'ICMP sits directly on IP — no ports, no TCP, no UDP.',
      color: 'var(--text)', alert: false,
    },
  ];

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : OPENING[tool];

  const ttlNote = current
    ? `hop: ${current.at}   ttl=${current.ttl}`
    : isPing
      ? 'ttl=64 leaving · arrives 61 · two routers on the path'
      : 'probe 1 of 3 · ttl starts at 1 and climbs';

  const showWin = isPing ? step >= 4 : step >= 3;
  const done = step >= maxStep;

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          {isPing
            ? 'Ping the web server at 203.0.113.20 and watch the hop counter fall on the way there.'
            : 'Map the path to 203.0.113.20 using nothing but packets that die on purpose.'}
        </h1>
        <div className={styles.modeTabs}>
          {modes.map((option) => (
            <button key={option} type="button" data-active={mode === option} aria-pressed={mode === option} onClick={() => setMode(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.column}>
          {/* ------------------------------------------------------ topology */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <GitFork weight="duotone" size={15} color="var(--text3)" />
              <span>
                {isPing
                  ? 'topology · the packet carries its own ttl'
                  : 'probe ladder · three probes, each one hop longer'}
              </span>
              <span className={styles.live}><Broadcast weight="duotone" size={12} /> live</span>
            </div>
            <div className={styles.stageBody}>
              {isPing
                ? <PingTopology step={step} current={current} tick={tick} />
                : <TraceLadder step={step} tick={tick} />}
            </div>
          </div>

          {/* ------------------------------------------------------- console */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <TerminalWindow weight="duotone" size={15} color="var(--text3)" />
              <span>{isPing ? 'ping · output' : 'traceroute · output'}</span>
              <span className={styles.headNote}>{current ? current.at : 'not sent'}</span>
            </div>
            <div className={styles.consoleBody}>
              <div className={styles.consoleCmd}>
                {isPing ? '$ ping 203.0.113.20' : '$ traceroute 203.0.113.20'}
              </div>
              {consoleOutput[tool].slice(0, step).map((line) => (
                <div key={line.text} style={{ color: line.color }}>{line.text}</div>
              ))}
            </div>
          </div>

          {/* -------------------------------------------------- icmp header */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Package weight="duotone" size={15} color="var(--text3)" />
              <span>icmp_header · live values</span>
            </div>
            <dl className={styles.fields}>
              {headerFields.map((field) => (
                <div className={styles.field} data-alert={field.alert} key={field.k}>
                  <dt>{field.k}</dt>
                  <dd style={{ color: field.color }}>{field.v}</dd>
                  <p>{field.note}</p>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* --------------------------------------------------------- toolbox */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Path weight="duotone" size={15} color="var(--text3)" />
              <span>icmp_tool</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>Tool</div>
              <div className={styles.tools}>
                <button type="button" data-active={isPing} aria-pressed={isPing} data-tone="b" onClick={() => chooseTool('ping')}>ping</button>
                <button type="button" data-active={!isPing} aria-pressed={!isPing} data-tone="a" onClick={() => chooseTool('trace')}>traceroute</button>
              </div>

              <div className={styles.stateRow} style={{ color: stateColor }}>
                <span className={styles.stateDot} />
                <strong>{stateText}</strong>
              </div>

              <div className={styles.walk}>
                {walkLabels[tool].map((label, index) => (
                  <div key={label} data-state={step > index + 1 ? 'done' : step === index + 1 ? 'current' : 'todo'}>
                    <i>{step > index + 1 ? '✓' : step === index + 1 ? '▸' : ''}</i>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} disabled={done} onClick={advance}>
                {advanceLabels[tool][Math.min(step, maxStep)]}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Reset</button>
            </div>
          </div>

          {/* ------------------------------------------------------ explain */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Lightbulb weight="duotone" size={15} color="var(--b)" />
              <span>what just happened</span>
            </div>
            <div className={styles.explainBody}>
              <p>{explain}</p>
              <div className={styles.ttlNote}>{ttlNote}</div>
            </div>
          </div>
        </div>
      </div>

      {showWin && (
        <div className={styles.winWrap}>
          <div className={styles.win}>
            <CheckCircle weight="duotone" size={26} color="var(--ok)" />
            <div>
              <strong>
                {isPing ? (step >= 5 ? 'Round trip measured' : 'The server answered') : 'Every hop named'}
              </strong>
              <span>
                {isPing
                  ? step >= 5
                    ? 'Left with ttl 64, came back reading 61 — two routers each took one, and the reply crossed them again. That single number is a rough hop count you get for free.'
                    : 'A reply means the whole path works in both directions. Ping proves reachability, nothing more — a host can be up and still refuse every port.'
                  : 'Three probes, three answers, three router addresses — and the tool never asked a router to identify itself. It only had to make each one fail in turn.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
