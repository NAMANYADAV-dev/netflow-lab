'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CursorClick,
  Eye,
  Gauge,
  Lightbulb,
  Lightning,
  Monitor,
  TerminalWindow,
  WarningCircle,
} from '@phosphor-icons/react';
import { secretStep, segmentsSent, stepsFor, tapColor, type TerminalMode } from './telnet-data';
import TelnetSequence from './TelnetSequence';
import styles from './telnet-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

export default function TelnetLab() {
  const [mm, setMm] = useState<TerminalMode>('char');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  const line = mm === 'line';
  const steps = stepsFor(mm);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;

  const chooseMode = (next: TerminalMode) => {
    if (next === mm) return;
    setMm(next);
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

  const done = step >= maxStep;
  const secretSeen = step >= secretStep(mm);

  // the tap accumulates: everything captured since the session opened
  const tapLines = steps.slice(0, step).flatMap((entry) => entry.tap);

  const screen = current ? current.screen : ['$ telnet 203.0.113.20'];

  const sent = step === 0 ? 0 : segmentsSent[mm][Math.min(step - 1, segmentsSent[mm].length - 1)];

  const counters = [
    {
      k: 'mode', v: line ? 'LINEMODE (opt 34)' : 'character-at-a-time',
      note: line ? 'client buffers and echoes locally' : 'server echoes every keystroke',
      color: 'var(--b)', border: 'var(--line)',
    },
    {
      k: 'who echoes', v: step >= 1 ? (line ? 'the client' : 'the server') : '— not yet agreed —',
      note: line ? 'zero round trips per keystroke' : 'one round trip per keystroke',
      color: 'var(--text)', border: 'var(--line)',
    },
    {
      k: 'segments so far', v: String(sent),
      note: line ? 'whole lines, sent on Enter' : 'one per keystroke, plus echo',
      color: 'var(--text)', border: 'var(--line)',
    },
    {
      k: 'header : payload', v: line ? '8 : 1' : '41 : 1',
      note: '40+ bytes of IP/TCP wrap each payload',
      color: 'var(--a)', border: 'var(--line)',
    },
    {
      k: 'encryption', v: 'none',
      note: 'no TLS, no key exchange, ever',
      color: 'var(--rst)', border: 'var(--rst)',
    },
    {
      k: 'credentials captured', v: secretSeen ? 'admin / hunter2' : '— none yet —',
      note: secretSeen ? 'lifted off the wire, no cracking required' : 'the tap is waiting',
      color: secretSeen ? 'var(--rst)' : 'var(--text3)', border: secretSeen ? 'var(--rst)' : 'var(--line)',
    },
  ];

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : line
      ? 'Line mode moves editing and echo to your own machine. Run it and compare the packet count with character mode — then check whether the tap noticed the difference.'
      : 'Character mode is Telnet as most people meet it. Every keystroke is a packet, and the letters on your screen came back from the server. Open the session and watch the tap.';

  const footNote = current
    ? `${current.tag} · ${line ? 'LINEMODE' : 'char-at-a-time'} · port 23 · RFC 854`
    : 'port 23 · RFC 854 · RFC 1184 (LINEMODE)';

  const advanceLabel = step === 0 ? 'Open session' : done ? 'Session complete' : `Next — ${steps[step].tag}`;

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          {line
            ? 'Prove that line mode fixes the chattiness and nothing else.'
            : 'Watch a password cross a café network in plain ASCII — one byte at a time.'}
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
              <TerminalWindow weight="duotone" size={15} color="var(--text3)" />
              <span>telnet 203.0.113.20 · {line ? 'line mode' : 'character mode'} · 3 lifelines</span>
              <span className={styles.headNote} style={{ color: done ? 'var(--rst)' : undefined }}>
                {step === 0 ? 'idle' : done ? 'session open · nothing encrypted' : `step ${step} of ${maxStep}`}
              </span>
            </div>
            <div className={styles.stageBody}>
              <TelnetSequence steps={steps} step={step} line={line} detailed={mode !== 'Simple'} tick={tick} />
            </div>
          </div>

          {/* ----------------------------------------------------- the tap */}
          <div className={styles.tapPanel} data-hot={secretSeen || undefined}>
            <div className={styles.tapHead}>
              <Eye weight="duotone" size={15} />
              <span>{secretSeen ? 'the tap · credentials recovered' : 'the tap · tcpdump -A -i wlan0 port 23'}</span>
              <span className={styles.headNote}>{current ? `${current.ms} ms` : '0 ms'}</span>
            </div>
            <div className={styles.tapBody}>
              {tapLines.length > 0
                ? tapLines.map((row, index) => (
                  <div key={`${row.t}-${index}`} style={{ color: tapColor(row.c) }}>{row.t}</div>
                ))
                : <div className={styles.tapEmpty}>capture running on the café access point — nothing sent yet</div>}
            </div>
          </div>

          {/* ------------------------------------------------------ counters */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Gauge weight="duotone" size={15} color="var(--text3)" />
              <span>cost of the session · what one typed character actually costs</span>
            </div>
            <dl className={styles.fields}>
              {counters.map((field) => (
                <div className={styles.field} style={{ borderColor: field.border }} key={field.k}>
                  <dt>{field.k}</dt>
                  <dd style={{ color: field.color }}>{field.v}</dd>
                  <p>{field.note}</p>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ---------------------------------------------------- session panel */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <CursorClick weight="duotone" size={15} color="var(--text3)" />
              <span>session_control</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>Terminal mode</div>
              <div className={styles.scenarios}>
                <button type="button" data-active={!line} aria-pressed={!line} onClick={() => chooseMode('char')}>Character mode</button>
                <button type="button" data-active={line} aria-pressed={line} onClick={() => chooseMode('line')}>Line mode</button>
              </div>

              <div className={styles.stateRow} style={{ color: step === 0 ? 'var(--text3)' : done ? 'var(--rst)' : 'var(--b)' }}>
                <span className={styles.stateDot} />
                <strong>{step === 0 ? 'closed' : done ? 'cleartext session' : 'negotiating'}</strong>
              </div>

              <div className={styles.walk}>
                {steps.map((entry, index) => (
                  <div key={entry.tag} data-state={index < step ? (index === step - 1 ? 'current' : 'done') : 'todo'}>
                    <i>{index < step ? '✓' : index + 1}</i>
                    <span>{entry.at}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} disabled={done} onClick={advance}>
                {advanceLabel}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Close session</button>
            </div>
          </div>

          {/* -------------------------------------------------- the terminal */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Monitor weight="duotone" size={15} color="var(--text3)" />
              <span>what the user sees</span>
            </div>
            <div className={styles.screen}>
              {screen.map((row, index) => (
                <div key={`${row}-${index}`} style={{ color: row.includes('Password') ? 'var(--text2)' : 'var(--ok)' }}>
                  {row || ' '}
                </div>
              ))}
              <span className={styles.caret} aria-hidden="true" />
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

          {/* --------------------------------------------------- the mistake */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <WarningCircle weight="duotone" size={15} color="var(--a)" />
              <span>the common mistake</span>
            </div>
            <div className={styles.mistake}>
              <p>
                Telnet is not simply &ldquo;SSH without encryption.&rdquo; It is a <em>negotiated</em> byte stream:
                before one character of your password moves, the two ends argue about who echoes, whether to suppress
                go-ahead, and what terminal you claim to be &mdash; in <code data-tone="sim">IAC</code> command bytes
                interleaved with your data.
              </p>
              <p className={styles.mistakeSplit}>
                The echo is not local. In character mode the <em data-plain>server</em> sends your own letters back to
                be printed &mdash; which is why a laggy link types laggily, and why one keystroke costs two segments.
              </p>
              <p className={styles.mistakeSplit}>
                Line mode fixes the chattiness. It does not fix the exposure &mdash; the tap reads the password either
                way. Only a different protocol underneath does that: see the <Link href="/lab/https">HTTPS lab</Link>{' '}
                for what a real encrypted channel costs, and the <Link href="/lab/tcp">TCP lab</Link> for the stream
                beneath.
              </p>
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className={styles.winWrap}>
          <div className={styles.win} data-tone={line ? 'b' : 'rst'}>
            {line
              ? <Lightning weight="duotone" size={26} color="var(--b)" />
              : <Eye weight="duotone" size={26} color="var(--rst)" />}
            <div>
              <strong>
                {line
                  ? 'Line mode: 4 segments instead of 25 — and the same password on the wire.'
                  : 'admin / hunter2 recovered from the capture.'}
              </strong>
              <span>
                {line
                  ? 'Efficiency and confidentiality are different problems. Telnet has a mode for one of them. Switch to character mode to see how much noisier the same login gets.'
                  : 'No cracking, no cryptanalysis — just tcpdump sorted by sequence number. Now try line mode: fewer packets, identical exposure.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
