'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowsLeftRight,
  Broadcast,
  CheckCircle,
  FlowArrow,
  Lightbulb,
  Package,
  Path,
  SpeakerHigh,
  WarningDiamond,
} from '@phosphor-icons/react';
import { LOST_DG, stepsFor, tcpTraits, udpTraits, type Wire } from './udp-data';
import UdpStream from './UdpStream';
import styles from './udp-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const advanceLabels = ['Open socket →', 'Send #1 →', 'Send #2 →', 'Send #3 →', 'Send #4 →', 'Stream finished'];

const MAX_STEP = 5;

export default function UdpLab() {
  const [wire, setWire] = useState<Wire>('clean');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  const lossy = wire === 'lossy';
  const steps = stepsFor(wire);
  const current = step > 0 ? steps[step - 1] : null;

  const chooseWire = (next: Wire) => {
    if (next === wire) return;
    setWire(next);
    setStep(0);
    setTick((value) => value + 1);
  };

  const advance = () => {
    if (step >= MAX_STEP) return;
    const next = step + 1;
    setStep(next);
    setTick((value) => value + 1);
  };

  const reset = () => { setStep(0); setTick((value) => value + 1); };

  const walkLabels = [
    'Socket opened — no handshake at all',
    'Datagram 1 sent and forgotten',
    'Datagram 2 sent and forgotten',
    lossy ? 'Datagram 3 dropped — silently' : 'Datagram 3 sent and forgotten',
    'Datagram 4 sent and forgotten',
  ];

  let stateText = 'IDLE';
  let stateColor = 'var(--text3)';
  if (step === 1) { stateText = 'SOCKET OPEN'; stateColor = 'var(--b)'; }
  else if (step > 1 && step < MAX_STEP) {
    const dropped = lossy && step === 4;
    stateText = dropped ? 'ONE LOST — UNNOTICED' : 'STREAMING';
    stateColor = dropped ? 'var(--rst)' : 'var(--b)';
  } else if (step >= MAX_STEP) {
    stateText = lossy ? '3 OF 4 ARRIVED' : 'ALL FOUR ARRIVED';
    stateColor = lossy ? 'var(--a)' : 'var(--ok)';
  }

  /* What the receiving application actually got — the dropped datagram leaves
     no trace here at all, which is the point of the panel. */
  const appLog: { text: string; color: string }[] = [];
  for (let n = 1; n <= Math.max(0, step - 1); n += 1) {
    if (lossy && n === LOST_DG) continue;
    appLog.push({ text: `recv 172 bytes  ← chunk #${n}`, color: 'var(--text2)' });
  }
  if (step >= MAX_STEP) {
    appLog.push(lossy
      ? { text: 'stream ended — 3 chunks read, 0 errors reported', color: 'var(--a)' }
      : { text: 'stream ended — 4 chunks read, 0 errors reported', color: 'var(--ok)' });
    if (lossy) appLog.push({ text: 'the app never learned #3 existed', color: 'var(--rst)' });
  }

  const headerFields = [
    { k: 'source port', v: '52310', note: 'The sender’s ephemeral port — where a reply would go, if one came.', color: 'var(--text)', border: 'var(--line)' },
    { k: 'destination port', v: '5060', note: 'The only addressing UDP adds on top of IP: which socket on that host.', color: 'var(--b)', border: 'var(--line)' },
    { k: 'length', v: current && current.dg > 0 ? '172 bytes' : '8 bytes (header only)', note: 'Header plus payload. The header itself is a fixed 8 bytes.', color: 'var(--text)', border: 'var(--line)' },
    { k: 'checksum', v: '0x8f31', note: 'Detects corruption — and then discards the datagram. Detection is not repair.', color: 'var(--text)', border: 'var(--line)' },
    { k: 'sequence / ack', v: '— absent —', note: 'These fields do not exist in UDP. Without them, a gap is invisible.', color: 'var(--rst)', border: lossy && step > 3 ? 'var(--rst)' : 'var(--line)' },
  ];

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : lossy
      ? 'The wire now has a congested router in the middle. Send the same four datagrams and watch what UDP does about the one that disappears: nothing at all. That is not a bug — it is the contract.'
      : 'UDP is the transport that promises nothing. It adds two ports and a length to IP and gets out of the way. For voice, video and games, arriving late is worse than not arriving — so nobody waits.';

  const footNote = current
    ? `step: ${current.at}`
    : lossy ? 'router queue full · one datagram will not survive' : 'clean wire · all four should arrive';

  const finished = step >= MAX_STEP;
  const contrastLit = lossy && finished;
  const winColor = lossy ? 'var(--a)' : 'var(--ok)';

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          {lossy
            ? 'Send the same four datagrams across a congested wire — and find out who reports the one that vanishes.'
            : 'Send four datagrams to 203.0.113.20:5060 with no handshake, no acknowledgement, and no waiting.'}
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
          {/* -------------------------------------------------------- stream */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <FlowArrow weight="duotone" size={15} color="var(--text3)" />
              <span>{lossy ? 'stream · congested router in the middle' : 'stream · four datagrams, clean wire'}</span>
              <span className={styles.live}><Broadcast weight="duotone" size={12} /> live</span>
            </div>
            <div className={styles.stageBody}>
              <UdpStream step={step} current={current} lossy={lossy} tick={tick} />
            </div>
          </div>

          {/* ------------------------------------------------ the trade-off */}
          <div className={styles.panel} style={{ borderColor: contrastLit ? 'var(--b)' : undefined }}>
            <div className={styles.panelHead}>
              <ArrowsLeftRight weight="duotone" size={15} color="var(--text3)" />
              <span>same four messages over TCP</span>
              <span className={styles.headNote} style={{ color: contrastLit ? 'var(--b)' : undefined }}>
                {contrastLit ? 'this is the difference' : 'the trade-off'}
              </span>
            </div>
            <div className={styles.contrast}>
              <div>
                <div className={styles.traitLabel} data-tone="a">UDP — what you just watched</div>
                {udpTraits(lossy).map((trait) => (
                  <div className={styles.trait} key={trait}><span data-tone="a">&mdash;</span>{trait}</div>
                ))}
              </div>
              <div>
                <div className={styles.traitLabel} data-tone="b">TCP — what it would have done</div>
                {tcpTraits(lossy).map((trait) => (
                  <div className={styles.trait} key={trait}><span data-tone="b">&mdash;</span>{trait}</div>
                ))}
                <Link href="/lab/tcp" className={styles.tcpLink}>open the TCP lab &rarr;</Link>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- udp header */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Package weight="duotone" size={15} color="var(--text3)" />
              <span>udp_header · eight bytes, that is all</span>
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

        {/* ---------------------------------------------------- the controls */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Path weight="duotone" size={15} color="var(--text3)" />
              <span>network_conditions</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>The wire</div>
              <div className={styles.wires}>
                <button type="button" data-active={!lossy} aria-pressed={!lossy} data-tone="b" onClick={() => chooseWire('clean')}>clean wire</button>
                <button type="button" data-active={lossy} aria-pressed={lossy} data-tone="rst" onClick={() => chooseWire('lossy')}>one packet lost</button>
              </div>

              <div className={styles.stateRow} style={{ color: stateColor }}>
                <span className={styles.stateDot} />
                <strong>{stateText}</strong>
              </div>

              <div className={styles.walk}>
                {walkLabels.map((label, index) => {
                  const dropped = lossy && index === 3 && step > 3;
                  return (
                    <div key={label}
                      data-state={dropped ? 'lost' : step > index + 1 ? 'done' : step === index + 1 ? 'current' : 'todo'}>
                      <i>{step > index + 1 ? '✓' : step === index + 1 ? '▸' : ''}</i>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>

              <button type="button" className={styles.advance} disabled={finished} onClick={advance}>
                {advanceLabels[Math.min(step, MAX_STEP)]}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Reset stream</button>
            </div>
          </div>

          {/* --------------------------------------------- what the app hears */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <SpeakerHigh weight="duotone" size={15} color="var(--text3)" />
              <span>what the app hears</span>
            </div>
            <div className={styles.appLog}>
              {appLog.length > 0
                ? appLog.map((line) => <div key={line.text} style={{ color: line.color }}>{line.text}</div>)
                : <div className={styles.logEmpty}>waiting for the first datagram&hellip;</div>}
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
              <div className={styles.footNote}>{footNote}</div>
            </div>
          </div>
        </div>
      </div>

      {finished && (
        <div className={styles.winWrap}>
          <div className={styles.win} style={{ borderColor: winColor, background: `color-mix(in srgb, ${winColor} 10%, transparent)` }}>
            {lossy
              ? <WarningDiamond weight="duotone" size={26} color={winColor} />
              : <CheckCircle weight="duotone" size={26} color={winColor} />}
            <div>
              <strong>{lossy ? 'Nobody noticed' : 'Four sent, four arrived'}</strong>
              <span>
                {lossy
                  ? 'No error, no retry, no complaint — the app simply received less than was sent and had no way to know. For a voice call that is a click you barely hear; for a bank transfer it would be unforgivable. That choice is why both protocols exist.'
                  : 'No handshake, no acknowledgements, no waiting — and on a clean wire, no cost either. Now switch the wire to “one packet lost” and run it again.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
