'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowsLeftRight,
  Calculator,
  CheckCircle,
  CursorClick,
  GitFork,
  Lightbulb,
  Prohibit,
  TerminalWindow,
  WarningCircle,
} from '@phosphor-icons/react';
import { activeWire, passiveWire, stepsFor, wireCounts, type DataMode } from './ftp-data';
import FtpSequence from './FtpSequence';
import styles from './ftp-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const advanceLabels: Record<DataMode, string[]> = {
  passive: [
    'Open the control connection →',
    'Log in →',
    'Ask for a port (PASV) →',
    'Read the 227 reply →',
    'Open the data connection →',
    'Fetch the file →',
    'Close the data connection',
    'Transfer complete · 226',
  ],
  active: [
    'Open the control connection →',
    'Log in →',
    'Send PORT →',
    'Server dials back →',
    'Watch the router →',
    'Read the failure',
    'Transfer failed · 425',
  ],
};

export default function FtpLab() {
  const [dm, setDm] = useState<DataMode>('passive');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  const active = dm === 'active';
  const steps = stepsFor(dm);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;
  const done = step >= maxStep;
  const failed = active && step >= 5;

  const chooseMode = (next: DataMode) => {
    if (next === dm) return;
    setDm(next);
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

  const stateText = step === 0
    ? 'idle · nothing connected'
    : failed ? 'data connection refused'
      : !done ? (step >= 5 && !active ? 'two connections live' : 'control only')
        : active ? '425 · session alive, transfer dead' : '226 · transfer complete';

  const stateColor = step === 0
    ? 'var(--text3)'
    : failed ? 'var(--rst)'
      : step >= 5 && !active ? 'var(--a)'
        : done ? 'var(--ok)' : 'var(--b)';

  const wire = (active ? activeWire : passiveWire).slice(0, wireCounts[dm][Math.max(0, step - 1)] || 0);

  const headerFields = active
    ? [
      { k: 'control socket', v: '51120 → 21', color: step >= 1 ? 'var(--ok)' : 'var(--text3)', border: step >= 1 ? 'var(--ok)' : 'var(--line)', note: 'client dials · works fine throughout' },
      { k: 'who dials the data', v: 'the server', color: 'var(--rst)', border: 'var(--rst)', note: 'inbound — the whole problem' },
      { k: 'server data port', v: '20', color: step >= 4 ? 'var(--rst)' : 'var(--text3)', border: 'var(--line)', note: 'source port of the callback' },
      { k: 'address advertised', v: step >= 3 ? '192.168.1.10' : '—', color: step >= 3 ? 'var(--rst)' : 'var(--text3)', border: step >= 3 ? 'var(--rst)' : 'var(--line)', note: 'private · meaningless on the internet' },
      { k: 'client listen port', v: step >= 3 ? '50000' : '—', color: step >= 3 ? 'var(--a)' : 'var(--text3)', border: 'var(--line)', note: '195 × 256 + 80' },
      { k: 'nat mapping', v: step >= 5 ? 'none found' : '—', color: step >= 5 ? 'var(--rst)' : 'var(--text3)', border: step >= 5 ? 'var(--rst)' : 'var(--line)', note: 'nothing inside requested this' },
      { k: 'credentials', v: step >= 2 ? 'cleartext' : '—', color: step >= 2 ? 'var(--rst)' : 'var(--text3)', border: step >= 2 ? 'var(--rst)' : 'var(--line)', note: 'USER / PASS as typed' },
      { k: 'bytes transferred', v: step >= 5 ? '0' : '—', color: step >= 5 ? 'var(--rst)' : 'var(--text3)', border: 'var(--line)', note: 'login worked; the file never moved' },
    ]
    : [
      { k: 'control socket', v: '51120 → 21', color: step >= 1 ? 'var(--ok)' : 'var(--text3)', border: step >= 1 ? 'var(--ok)' : 'var(--line)', note: 'open for the whole session' },
      { k: 'who dials the data', v: 'the client', color: step >= 3 ? 'var(--ok)' : 'var(--text3)', border: step >= 3 ? 'var(--ok)' : 'var(--line)', note: 'outbound twice — nat is happy' },
      { k: 'data socket', v: step >= 5 ? '51121 → 50000' : '—', color: step >= 5 ? 'var(--a)' : 'var(--text3)', border: step >= 5 ? 'var(--a)' : 'var(--line)', note: 'a second, separate connection' },
      { k: 'port from 227', v: step >= 4 ? '195,80 → 50000' : '—', color: step >= 4 ? 'var(--a)' : 'var(--text3)', border: step >= 4 ? 'var(--a)' : 'var(--line)', note: 'two decimals, one port' },
      { k: 'file bytes on :21', v: '0', color: step >= 1 ? 'var(--ok)' : 'var(--text3)', border: 'var(--line)', note: 'never, in any mode' },
      { k: 'file bytes on :50000', v: step >= 6 ? '2,464,133' : '—', color: step >= 6 ? 'var(--a)' : 'var(--text3)', border: step >= 6 ? 'var(--a)' : 'var(--line)', note: 'the entire transfer' },
      { k: 'credentials', v: step >= 2 ? 'cleartext' : '—', color: step >= 2 ? 'var(--rst)' : 'var(--text3)', border: step >= 2 ? 'var(--rst)' : 'var(--line)', note: 'USER / PASS as typed' },
      { k: 'next transfer', v: step >= 7 ? 'new PASV, new port' : '—', color: step >= 7 ? 'var(--text)' : 'var(--text3)', border: 'var(--line)', note: 'the dance repeats every time' },
    ];

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : active
      ? 'This is FTP as originally designed, in 1985, before NAT existed. Everything will work — the login, the commands, the replies — right up until a file has to move.'
      : 'Fetch one file and count the connections. The command channel and the file itself do not travel together, and the port the file uses is negotiated on the fly.';

  const footNote = current
    ? current.packet
    : active
      ? 'mode: active · client will send PORT · server will originate the data connection'
      : 'mode: passive · client will send PASV · client will originate both connections';

  const elapsed = step === 0 ? '—' : active ? (step >= 5 ? '75.2 s · timed out' : '0.4 s') : step >= 6 ? '3.1 s' : '0.3 s';

  const connLabel = step === 0
    ? '0 connections'
    : active
      ? failed ? '1 connection · 1 refused' : '1 connection'
      : step >= 5 && step < 7 ? '2 connections live' : step >= 7 ? '1 connection · data closed' : '1 connection';
  const connColor = failed ? 'var(--rst)' : !active && step >= 5 ? 'var(--a)' : 'var(--text3)';

  const showDecoder = step >= (active ? 3 : 4);

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          {active
            ? 'Fetch the same file the original way — and find out where it dies.'
            : 'Download report.pdf, and count how many TCP connections it really takes.'}
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
          {/* ------------------------------------------------------ sequence */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <ArrowsLeftRight weight="duotone" size={15} color="var(--text3)" />
              <span>
                {active
                  ? 'ftp active mode · the server dials back'
                  : 'ftp passive mode · two connections, both client-originated'}
              </span>
              <span className={styles.headNote} style={{ color: connColor }}>{connLabel}</span>
            </div>
            <div className={styles.stageBody}>
              <FtpSequence steps={steps} step={step} active={active} packetMode={mode === 'Packet'} tick={tick} />
            </div>
          </div>

          {/* ------------------------------------------------ control channel */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <TerminalWindow weight="duotone" size={15} color="var(--ok)" />
              <span>control connection · port 21 · commands and numbered replies, never file bytes</span>
              <span className={styles.headNote}>{elapsed}</span>
            </div>
            <div className={styles.wireBody}>
              {wire.length > 0
                ? wire.map((row) => <div key={row.text} style={{ color: row.color }}>{row.text}</div>)
                : <div className={styles.wireEmpty}>no session yet — open the control connection below</div>}
            </div>
          </div>

          {/* ---------------------------------------------------- the sockets */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <GitFork weight="duotone" size={15} color="var(--a)" />
              <span>the two sockets · who dials whom, and on what port</span>
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

        {/* ------------------------------------------------------ session state */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <CursorClick weight="duotone" size={15} color="var(--text3)" />
              <span>session_state</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>Data connection mode</div>
              <div className={styles.dataModes}>
                <button type="button" data-active={!active} aria-pressed={!active} data-tone="ok" onClick={() => chooseMode('passive')}>Passive · PASV</button>
                <button type="button" data-active={active} aria-pressed={active} data-tone="rst" onClick={() => chooseMode('active')}>Active · PORT</button>
              </div>

              <div className={styles.stateRow} style={{ color: stateColor }}>
                <span className={styles.stateDot} />
                <strong>{stateText}</strong>
              </div>

              <div className={styles.walk}>
                {steps.map((entry, index) => (
                  <div key={entry.at}
                    data-state={index < step ? (entry.dir === 'drop' ? 'drop' : entry.chan === 'data' ? 'data' : entry.dir) : 'todo'}>
                    <i>{index < step ? (entry.dir === 'drop' ? '✕' : '✓') : index + 1}</i>
                    <span>{entry.at}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} data-tone={active ? 'rst' : 'b'}
                disabled={done} onClick={advance}>
                {advanceLabels[dm][Math.min(step, maxStep)]}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Reset session</button>
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

          {/* ------------------------------------------------- port decoder */}
          {showDecoder && (
            <div className={styles.decoder}>
              <div className={styles.decoderHead}>
                <Calculator weight="duotone" size={15} />
                <span>decoding the port</span>
              </div>
              <div className={styles.decoderBody}>
                <div>{active ? 'PORT 192,168,1,10,195,80' : '227 (203,0,113,20,195,80)'}</div>
                <div className={styles.decoderRule}>
                  {active ? '         address ────┘   └── port' : '      address ────┘    └── port'}
                </div>
                <div className={styles.decoderSum}>195 × 256 + 80 = <b>50000</b></div>
                <p>
                  A port number does not fit in one byte, so FTP sends it as two decimals and expects both ends to do
                  the arithmetic.
                </p>
              </div>
            </div>
          )}

          {/* --------------------------------------------------- the mistake */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <WarningCircle weight="duotone" size={15} color="var(--a)" />
              <span>the common mistake</span>
            </div>
            <div className={styles.mistake}>
              <p>
                &ldquo;FTP is port 21.&rdquo; Port 21 carries the <em data-plain>conversation</em> and not one byte of
                any file. Every transfer &mdash; every directory listing too &mdash; opens a{' '}
                <em>second, separate TCP connection</em> on a port nobody knew in advance.
              </p>
              <p className={styles.mistakeSplit}>
                That second connection is why FTP fights firewalls. In active mode the{' '}
                <code data-tone="rst">server dials the client</code> &mdash; an unsolicited inbound connection, which
                is commonly what <Link href="/lab/ip">NAT</Link> and stateful firewalls block unless an FTP helper or
                explicit rule permits it. Passive mode makes the client originate both connections.
              </p>
              <p className={styles.mistakeSplit}>
                And it is all cleartext: <code data-tone="rst">USER</code> and <code data-tone="rst">PASS</code> travel
                exactly as typed, like the port-80 run in the <Link href="/lab/https">HTTPS lab</Link>. SFTP and FTPS
                exist for this reason.
              </p>
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className={styles.winWrap}>
          <div className={styles.win} data-tone={active ? 'rst' : 'ok'}>
            {active
              ? <Prohibit weight="duotone" size={26} color="var(--rst)" />
              : <CheckCircle weight="duotone" size={26} color="var(--ok)" />}
            <div>
              <strong>
                {active
                  ? '425 — authenticated, connected, and completely stuck'
                  : '226 — one file, two connections'}
              </strong>
              <span>
                {active
                  ? 'Nothing was misconfigured on the server. The client advertised a private address and asked for an unsolicited inbound connection, and the router did exactly its job. This failure is why every FTP client on earth now defaults to passive.'
                  : 'Port 21 carried nine short lines of text and not one byte of the file. The 2.4 MB arrived on a second connection to port 50000, negotiated seconds earlier and closed the moment the file ended. Now switch to Active · PORT and watch the same download fail.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
