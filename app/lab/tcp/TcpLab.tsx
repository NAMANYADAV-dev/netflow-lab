'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Broadcast, CheckCircle } from '@phosphor-icons/react';
import TcpSequence, { flagColor, type Segment } from './TcpSequence';
import styles from './tcp-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

/** the seven segments of a full open-and-close, derived from the two ISNs */
function segmentsFor(x: number, y: number): Segment[] {
  return [
    { dir: 'cs', flags: ['SYN'], seq: x, ack: null,
      simple: 'The client knocks: “I want to talk, and here is my starting number.” Nothing is acknowledged yet.',
      technical: 'Client sends SYN with its Initial Sequence Number (ISN). The connection enters SYN-SENT.' },
    { dir: 'sc', flags: ['SYN', 'ACK'], seq: y, ack: x + 1,
      simple: 'The server answers: “Heard you — here is my number, and I confirm yours.”',
      technical: 'Server replies SYN+ACK: its own ISN plus ack = client ISN + 1 (SYN consumes one sequence number).' },
    { dir: 'cs', flags: ['ACK'], seq: x + 1, ack: y + 1,
      simple: 'The client confirms the server’s number. Both sides now agree — the line is open.',
      technical: 'Client sends ACK (ack = server ISN + 1). Connection is ESTABLISHED; data may now flow.' },
    { dir: 'cs', flags: ['FIN', 'ACK'], seq: x + 1, ack: y + 1,
      simple: 'The client says “I’m done sending.” It starts closing its half of the line.',
      technical: 'Active close: client sends FIN,ACK and enters FIN-WAIT-1. FIN also consumes one sequence number.' },
    { dir: 'sc', flags: ['ACK'], seq: y + 1, ack: x + 2,
      simple: 'The server acknowledges the goodbye, but may still have data to send.',
      technical: 'Server ACKs the FIN (ack = client seq + 1) and enters CLOSE-WAIT. The connection is half-closed.' },
    { dir: 'sc', flags: ['FIN', 'ACK'], seq: y + 1, ack: x + 2,
      simple: 'Now the server is done too, and sends its own goodbye.',
      technical: 'Server sends its FIN,ACK and enters LAST-ACK, closing its half of the connection.' },
    { dir: 'cs', flags: ['ACK'], seq: x + 2, ack: y + 2,
      simple: 'The client confirms the server’s goodbye. Both halves are closed — connection over.',
      technical: 'Client ACKs the server FIN (ack = server seq + 1). Connection reaches CLOSED after TIME-WAIT.' },
  ];
}

const controlLabels = [
  'Send SYN →',
  'Receive SYN-ACK ←',
  'Send ACK →',
  'Send FIN →',
  'Receive ACK ←',
  'Receive FIN ←',
  'Send final ACK →',
  'Connection closed',
];

const checkpoints = ['SYN sent', 'SYN-ACK received', 'ACK sent — ESTABLISHED'];

const OPENING_NOTE =
  'Every TCP connection begins with a three-way handshake so both sides agree on starting sequence numbers before any data moves.';

/* A real ISN is unpredictable, so these are drawn at random — a value that is
   legitimately different on the server and in the browser, which is what
   useSyncExternalStore's two-snapshot form is for. The opening pair is drawn
   once at module scope (a snapshot getter has to return a stable value or it
   re-renders forever); Reset draws a fresh pair through ordinary state. */
const randomIsn = () => 1000 + Math.floor(Math.random() * 8000);

type IsnPair = { client: number; server: number };
const firstPair: IsnPair = { client: randomIsn(), server: randomIsn() };
const serverPair: IsnPair = { client: 0, server: 0 };
const noSubscribe = () => () => {};

const LAST_PHASE = 7;

export default function TcpLab() {
  const [phase, setPhase] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [rolled, setRolled] = useState<IsnPair | null>(null);
  const [tick, setTick] = useState(0);
  const opening = useSyncExternalStore(noSubscribe, () => firstPair, () => serverPair);
  const { client: clientIsn, server: serverIsn } = rolled ?? opening;

  const segments = useMemo(() => segmentsFor(clientIsn, serverIsn), [clientIsn, serverIsn]);

  const advance = () => {
    if (phase >= LAST_PHASE) return;
    const next = phase + 1;
    setPhase(next);
    setTick((value) => value + 1);
  };

  const reset = () => {
    setPhase(0);
    setRolled({ client: randomIsn(), server: randomIsn() });
    setTick((value) => value + 1);
  };

  let stateText = 'CLOSED';
  let stateColor = 'var(--text3)';
  if (phase > 0 && phase < 3) { stateText = 'HANDSHAKING'; stateColor = 'var(--a)'; }
  else if (phase === 3) { stateText = 'ESTABLISHED'; stateColor = 'var(--ok)'; }
  else if (phase > 3 && phase < LAST_PHASE) { stateText = 'CLOSING'; stateColor = 'var(--rst)'; }

  const last = phase > 0 ? segments[phase - 1] : null;
  const explain = !last
    ? OPENING_NOTE
    : mode === 'Packet'
      ? `Flags [${last.flags.join('|')}]  seq=${last.seq}  ack=${last.ack ?? '—'}`
      : mode === 'Technical'
        ? last.technical
        : last.simple;

  // newest segment first, the way a capture window scrolls
  const log = segments.slice(0, phase).reverse();
  const done = phase >= LAST_PHASE;

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          Open a reliable connection to <code>93.184.216.34:443</code> — complete the{' '}
          <b>three-way handshake</b>, then close it cleanly.
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
        {/* ------------------------------------------------ connection control */}
        <div className={`${styles.panel} ${styles.side}`}>
          <div className={styles.panelHead}><span>connection_control.tcp</span></div>
          <div className={styles.controlBody}>
            <div className={styles.stateRow} style={{ color: stateColor }}>
              <span className={styles.stateDot} />
              <strong>{stateText}</strong>
            </div>

            <div className={styles.endpoints}>
              <span>client  10.0.0.5:49152  ISN {clientIsn}</span>
              <span>server 93.184.216.34:443  ISN {serverIsn}</span>
            </div>

            <div className={styles.checklist}>
              {checkpoints.map((label, index) => (
                <div key={label} data-done={phase >= index + 1}>
                  <i>{phase >= index + 1 ? '✓' : ''}</i>
                  {label}
                </div>
              ))}
            </div>

            <button type="button" className={styles.advance} disabled={done} onClick={advance}>
              {controlLabels[Math.min(phase, LAST_PHASE)]}
            </button>
            <button type="button" className={styles.reset} onClick={reset}>Reset connection</button>
          </div>
        </div>

        {/* --------------------------------------------------------- sequence */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span>sequence · client ↔ server</span>
            <span className={styles.live}><Broadcast weight="duotone" size={12} /> live</span>
          </div>
          <div className={styles.stageBody}>
            <TcpSequence phase={phase} segments={segments} tick={tick} />
          </div>
        </div>

        {/* ------------------------------------------------------ segment log */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span>segment_log.tcp</span>
            <span className={styles.sentCount}>{phase} sent</span>
          </div>
          <div className={styles.logBody}>
            {phase > 0 ? (
              <div className={styles.segments}>
                {log.map((segment, index) => (
                  <div className={styles.segment} key={`${phase - index}`}>
                    <div className={styles.segHead}>
                      <span>{segment.dir === 'cs' ? 'client → server' : 'server → client'}</span>
                      <span className={styles.segFlags}>
                        {segment.flags.map((flag) => (
                          <span key={flag} style={{ color: flagColor(flag) }}>{flag}</span>
                        ))}
                      </span>
                    </div>
                    <div className={styles.segBody}>
                      seq={segment.seq} &nbsp; ack={segment.ack ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noSegments}>
                No segments on the wire yet. Press <b>Send SYN</b> to begin the handshake.
              </p>
            )}

            <div className={styles.explain}>
              <div className={styles.explainLabel}>What just happened</div>
              <p data-kind={mode}>{explain}</p>
            </div>
          </div>
        </div>
      </div>

      {phase >= 3 && (
        <div className={styles.winWrap}>
          <div className={styles.win}>
            <CheckCircle weight="duotone" size={26} color="var(--ok)" />
            <div>
              <strong>{done ? 'Connection closed cleanly' : 'Handshake complete — connection ESTABLISHED'}</strong>
              <span>
                {done
                  ? 'Both halves shut down with FIN/ACK. That is a full TCP lifecycle: open, exchange, close.'
                  : 'Both sides agreed on sequence numbers. Data can now flow reliably. Continue to watch the 4-way teardown.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
