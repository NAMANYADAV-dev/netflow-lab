'use client';

import { useState } from 'react';
import {
  Broadcast,
  CheckCircle,
  GitFork,
  Lightbulb,
  Package,
  Path,
} from '@phosphor-icons/react';
import { stepsFor, type IpDest } from './ip-data';
import IpTopology from './IpTopology';
import styles from './ip-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const advanceLabels: Record<IpDest, string[]> = {
  remote: [
    'Send from PC-1 →',
    'Hand to gateway →',
    'Switch forwards →',
    'Router: NAT + TTL →',
    'ISP hop →',
    'Final hop →',
    'Deliver to :443 →',
    'Return path ←',
    'Journey complete',
  ],
  local: ['Send from PC-1 →', 'Address to PC-3 →', 'Switch delivers →', 'Delivered locally'],
};

const walkLabels: Record<IpDest, string[]> = {
  remote: [
    'Route lookup — local or remote?',
    'Handed to default gateway',
    'Switch forwards on MAC (L2)',
    'Router rewrites source (NAT/PAT)',
    'TTL decremented across the internet',
    'Final hop to 203.0.113.20',
    'Delivered to the HTTPS listener',
    'Reply un-NATted back to PC-1',
  ],
  local: [
    'Route lookup — same subnet',
    'Addressed straight to PC-3',
    'Switch delivers — no router, no NAT',
  ],
};

const OPENING =
  'An IP datagram carries source and destination IP addresses plus a protocol number. Its payload here is a TCP segment with ports. Routers normally preserve the IP addresses, while NAT deliberately rewrites the source mapping. Press send to follow one.';

export default function IpLab() {
  const [dest, setDest] = useState<IpDest>('remote');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  const isLocal = dest === 'local';
  const steps = stepsFor(dest);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;

  const chooseDest = (next: IpDest) => {
    if (next === dest) return;
    setDest(next);
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
  if (isLocal) {
    if (step > 0 && step < 3) { stateText = 'STAYING LOCAL'; stateColor = 'var(--a)'; }
    else if (step >= 3) { stateText = 'DELIVERED ON LAN'; stateColor = 'var(--ok)'; }
  } else if (step > 0 && step < 4) { stateText = 'ON THE LAN'; stateColor = 'var(--a)'; }
  else if (step >= 4 && step < 6) { stateText = 'ROUTED / NATTED'; stateColor = 'var(--b)'; }
  else if (step === 6) { stateText = 'ARRIVED'; stateColor = 'var(--ok)'; }
  else if (step === 7) { stateText = 'DELIVERED'; stateColor = 'var(--ok)'; }
  else if (step >= 8) { stateText = 'ROUND TRIP DONE'; stateColor = 'var(--ok)'; }

  const src = current?.src ?? '192.168.1.10:52310';
  const dst = current?.dst ?? '203.0.113.20:443';
  const ttl = current?.ttl ?? 64;
  const natOn = current?.nat ?? false;
  const prevTtl = step > 1 ? steps[step - 2].ttl : 64;
  const ttlDropped = Boolean(current) && ttl < prevTtl;
  const isReply = !isLocal && step === 8;

  /* The border is the field's own alarm: orange where NAT has rewritten
     something, red the moment a router takes one off the TTL. */
  type Field = { k: string; v: string; note: string; color: string; border: string };

  const headerFields: Field[] = isReply
    ? [
      { k: 'source IP · TCP port', v: src, note: 'The server’s public IP and the source port in the encapsulated TCP segment.', color: 'var(--b)', border: 'var(--line)' },
      { k: 'destination IP · TCP port', v: dst, note: 'Reverse PAT restored PC-1’s private IP and TCP destination port.', color: 'var(--a)', border: 'var(--a)' },
      { k: 'ttl', v: String(ttl), note: 'A fresh TTL, set by the server on its own reply — not a decrement.', color: 'var(--text)', border: 'var(--line)' },
      { k: 'protocol', v: '6 (TCP)', note: 'Tells the receiver which layer-4 handler to use.', color: 'var(--text)', border: 'var(--line)' },
      { k: 'nat translation', v: '40001 → 52310', note: 'The translation reversed — this is how the reply found the one host that asked.', color: 'var(--a)', border: 'var(--a)' },
    ]
    : [
      {
        k: 'source IP · TCP port', v: src,
        note: natOn ? 'PAT rewrote the source IP and TCP source port.' : 'PC-1’s private IP plus the encapsulated TCP source port.',
        color: natOn ? 'var(--a)' : 'var(--text)', border: natOn ? 'var(--a)' : 'var(--line)',
      },
      {
        k: 'destination IP · TCP port', v: dst,
        note: 'The IP destination drives routing; port 443 belongs to the TCP segment carried inside.',
        color: 'var(--b)', border: 'var(--line)',
      },
      {
        k: 'ttl', v: String(ttl),
        note: ttlDropped
          ? 'Just decremented by a router.'
          : isLocal ? 'Untouched — no router handled this packet.' : 'Decremented once per router hop.',
        color: ttlDropped ? 'var(--rst)' : 'var(--text)', border: ttlDropped ? 'var(--rst)' : 'var(--line)',
      },
      {
        k: 'protocol', v: '6 (TCP)',
        note: 'Tells the receiver which layer-4 handler to use.',
        color: 'var(--text)', border: 'var(--line)',
      },
      {
        k: 'nat translation', v: natOn ? '52310 → 40001' : '—',
        note: natOn
          ? 'The router’s note for routing the reply home.'
          : isLocal ? 'None — NAT only happens at the boundary.' : 'Not yet translated.',
        color: natOn ? 'var(--a)' : 'var(--text3)', border: 'var(--line)',
      },
    ];

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : OPENING;

  const ttlNote = current
    ? `hop: ${current.at}   ttl=${ttl}`
    : 'ttl=64 (typical Linux/macOS default) · Windows uses 128';

  const showWin = isLocal ? step >= 3 : step >= 7;
  const done = step >= maxStep;

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          Route one IP datagram from <code data-tone="a">PC-1 192.168.1.10</code> to{' '}
          <code data-tone="b">203.0.113.20</code>. It carries a TCP segment for port 443 — watch what each layer changes.
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
              <span>topology · 192.168.1.0/24 → internet</span>
              <span className={styles.live}><Broadcast weight="duotone" size={12} /> live</span>
            </div>
            <div className={styles.stageBody}>
              <IpTopology step={step} current={current} dest={dest} tick={tick} />
            </div>
          </div>

          {/* ----------------------------------------------------- ip header */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Package weight="duotone" size={15} color="var(--text3)" />
              <span>ip_header · live values</span>
              <span className={styles.headNote}>{current ? current.at : 'not sent'}</span>
            </div>
            <dl className={styles.fields}>
              {headerFields.map((field) => (
                <div className={styles.field} style={{ borderColor: field.border }} key={field.k}>
                  <dt>{field.k}</dt>
                  <dd style={{ color: field.color }}>{field.v}</dd>
                  <p>{field.note}</p>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* -------------------------------------------------- forwarding walk */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Path weight="duotone" size={15} color="var(--text3)" />
              <span>forwarding_walk</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>Destination</div>
              <div className={styles.dests}>
                <button type="button" data-active={!isLocal} aria-pressed={!isLocal} data-tone="b" onClick={() => chooseDest('remote')}>
                  To web server (remote)
                </button>
                <button type="button" data-active={isLocal} aria-pressed={isLocal} data-tone="a" onClick={() => chooseDest('local')}>
                  To PC-3 (local)
                </button>
              </div>

              <div className={styles.stateRow} style={{ color: stateColor }}>
                <span className={styles.stateDot} />
                <strong>{stateText}</strong>
              </div>

              <div className={styles.walk}>
                {walkLabels[dest].map((label, index) => (
                  <div key={label} data-state={step > index + 1 ? 'done' : step === index + 1 ? 'current' : 'todo'}>
                    <i>{step > index + 1 ? '✓' : step === index + 1 ? '▸' : ''}</i>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} disabled={done} onClick={advance}>
                {advanceLabels[dest][Math.min(step, maxStep)]}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Reset datagram</button>
            </div>
          </div>

          {/* ------------------------------------------------------- explain */}
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
                {isLocal ? 'Never left the LAN' : step >= 8 ? 'Round trip complete' : 'Datagram delivered'}
              </strong>
              <span>
                {isLocal
                  ? 'Same subnet, so no gateway, no NAT, and the TTL never moved. Compare that to the remote path — that difference IS the routing decision.'
                  : step >= 8
                    ? 'NAT sent the reply to the one host that asked for it. Source and destination were never in doubt — that is the whole job of IP.'
                    : 'The destination address survived every hop untouched. The TTL, the source address, and the frame around it did not.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
