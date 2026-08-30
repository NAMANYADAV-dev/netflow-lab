'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowsLeftRight,
  Certificate,
  CursorClick,
  Eye,
  Lightbulb,
  LockKey,
  WarningCircle,
} from '@phosphor-icons/react';
import { plainWire, stepsFor, tapNote, tlsWire, wireCounts, type Wire } from './https-data';
import TlsSequence from './TlsSequence';
import styles from './https-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const advanceLabels: Record<Wire, string[]> = {
  tls: [
    'Open the connection →',
    'Send ClientHello →',
    'Get the certificate →',
    'Verify the certificate →',
    'Derive the keys →',
    'Send the sealed GET →',
    'Read the sealed reply',
    'Session established',
  ],
  plain: [
    'Open the connection →',
    'Send the request →',
    'Look at the wire →',
    'Read the response',
    'Sent in the clear',
  ],
};

export default function HttpsLab() {
  const [wire, setWire] = useState<Wire>('tls');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  const plain = wire === 'plain';
  const steps = stepsFor(wire);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;

  const chooseWire = (next: Wire) => {
    if (next === wire) return;
    setWire(next);
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
  const tapTone = plain ? 'rst' : 'ok';

  const stateText = step === 0
    ? plain ? 'idle · port 80' : 'idle · no keys yet'
    : !done
      ? plain ? 'plaintext in flight' : step < 5 ? 'handshaking' : 'encrypted'
      : plain ? 'exposed · credentials leaked' : 'established · aes-128-gcm';

  const stateColor = step === 0
    ? 'var(--text3)'
    : plain ? 'var(--rst)' : !done && step < 5 ? 'var(--b)' : 'var(--ok)';

  const tap = (plain ? plainWire : tlsWire).slice(0, wireCounts[wire][Math.max(0, step - 1)] || 0);

  const headerFields = plain
    ? [
      { k: 'tls version', v: '— none —', color: 'var(--rst)', border: 'var(--rst)', note: 'no encryption layer exists' },
      { k: 'certificate', v: '— none —', color: 'var(--rst)', border: 'var(--rst)', note: 'nothing proves who answered' },
      { k: 'method / path', v: 'GET /account', color: step >= 2 ? 'var(--rst)' : 'var(--text3)', border: 'var(--line)', note: 'visible' },
      { k: 'host', v: 'example.com', color: step >= 2 ? 'var(--rst)' : 'var(--text3)', border: 'var(--line)', note: 'visible' },
      { k: 'cookie', v: step >= 2 ? 'session=8f31c9a2…' : '—', color: step >= 2 ? 'var(--rst)' : 'var(--text3)', border: step >= 2 ? 'var(--rst)' : 'var(--line)', note: 'a session anyone can replay' },
      { k: 'authorization', v: step >= 2 ? 'me:hunter2' : '—', color: step >= 2 ? 'var(--rst)' : 'var(--text3)', border: step >= 2 ? 'var(--rst)' : 'var(--line)', note: 'base64 decodes in one step' },
      { k: 'integrity', v: 'none', color: 'var(--rst)', border: 'var(--line)', note: 'the reply can be rewritten in transit' },
      { k: 'response body', v: step >= 4 ? 'balance $4,182.30' : '—', color: step >= 4 ? 'var(--rst)' : 'var(--text3)', border: step >= 4 ? 'var(--rst)' : 'var(--line)', note: 'visible' },
    ]
    : [
      { k: 'tls version', v: step >= 3 ? 'TLS 1.3' : 'proposed 1.3', color: step >= 3 ? 'var(--ok)' : 'var(--text3)', border: step >= 3 ? 'var(--ok)' : 'var(--line)', note: 'chosen by the server' },
      { k: 'cipher suite', v: step >= 3 ? 'AES_128_GCM_SHA256' : '—', color: step >= 3 ? 'var(--ok)' : 'var(--text3)', border: step >= 3 ? 'var(--ok)' : 'var(--line)', note: 'encrypts and authenticates together' },
      { k: 'key exchange', v: step >= 2 ? 'X25519 · ECDHE' : '—', color: step >= 2 ? 'var(--sim)' : 'var(--text3)', border: step >= 5 ? 'var(--sim)' : 'var(--line)', note: 'ephemeral — forward secrecy' },
      { k: 'server_name (sni)', v: 'example.com', color: step >= 2 ? 'var(--a)' : 'var(--text3)', border: step >= 2 ? 'var(--a)' : 'var(--line)', note: 'sent in the clear, before any keys' },
      { k: 'certificate', v: step >= 3 ? 'CN=example.com' : '—', color: step >= 3 ? 'var(--text)' : 'var(--text3)', border: 'var(--line)', note: 'the identity claim' },
      { k: 'issuer', v: step >= 4 ? 'R3 → ISRG Root X1' : '—', color: step >= 4 ? 'var(--ok)' : 'var(--text3)', border: step >= 4 ? 'var(--ok)' : 'var(--line)', note: 'already trusted by this machine' },
      { k: 'chain check', v: step >= 4 ? 'valid · 63 days left' : 'unverified', color: step >= 4 ? 'var(--ok)' : 'var(--text3)', border: step >= 4 ? 'var(--ok)' : 'var(--line)', note: 'name, dates, signature' },
      { k: 'session keys', v: step >= 5 ? 'derived, not sent' : '—', color: step >= 5 ? 'var(--sim)' : 'var(--text3)', border: step >= 5 ? 'var(--sim)' : 'var(--line)', note: 'both sides computed the same secret' },
    ];

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : plain
      ? 'Same request as the HTTPS run, same password, one port lower. Step through and read your own credentials off the wire.'
      : 'One password, one request. Watch the four moves that have to happen before a single byte of it can leave the machine — and note which one is about identity rather than secrecy.';

  const footNote = current
    ? current.packet
    : plain
      ? 'socket 51882 → 203.0.113.20:80   ESTABLISHED   no tls layer'
      : 'socket 51884 → 203.0.113.20:443   ESTABLISHED   awaiting ClientHello';

  const elapsed = step === 0
    ? '—'
    : plain ? (step >= 4 ? '26 ms' : '12 ms') : step >= 7 ? '96 ms' : step >= 5 ? '52 ms' : '28 ms';

  const portLabel = plain ? 'port 80 · cleartext' : step >= 5 ? 'port 443 · aes-128-gcm' : 'port 443 · negotiating';
  const portColor = plain ? 'var(--rst)' : step >= 5 ? 'var(--ok)' : 'var(--text3)';

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          {plain
            ? 'Send the same password over port 80 — and read it back off the wire yourself.'
            : 'Send a password to example.com and find out exactly what the café wi-fi can read.'}
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
                {plain ? 'http over tcp · no security layer at all' : 'tls 1.3 handshake, then http inside it'}
              </span>
              <span className={styles.headNote} style={{ color: portColor }}>{portLabel}</span>
            </div>
            <div className={styles.stageBody}>
              <TlsSequence steps={steps} step={step} plain={plain} packetMode={mode === 'Packet'} tick={tick} />
            </div>
          </div>

          {/* ----------------------------------------------------- the tap */}
          <div className={styles.tapPanel} data-tone={tapTone}>
            <div className={styles.tapHead}>
              <Eye weight="duotone" size={15} />
              <span>the tap · what the person on the wire captures</span>
              <span className={styles.headNote}>{elapsed}</span>
            </div>
            <div className={styles.tapBody}>
              {tap.length > 0
                ? tap.map((line) => <div key={line.text} style={{ color: line.color }}>{line.text}</div>)
                : <div className={styles.tapEmpty}>the tap is running — nothing has crossed the wire yet</div>}
              {done && <div className={styles.tapNote}>{tapNote[wire]}</div>}
            </div>
          </div>

          {/* --------------------------------------------------- tls session */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Certificate weight="duotone" size={15} color="var(--text3)" />
              <span>
                {plain
                  ? 'security parameters · nothing negotiated'
                  : 'tls_session · what got agreed, and what leaked anyway'}
              </span>
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

        {/* ----------------------------------------------------- session state */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <CursorClick weight="duotone" size={15} color="var(--text3)" />
              <span>session_state</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>Send the password over</div>
              <div className={styles.wires}>
                <button type="button" data-active={!plain} aria-pressed={!plain} data-tone="ok" onClick={() => chooseWire('tls')}>HTTPS · 443</button>
                <button type="button" data-active={plain} aria-pressed={plain} data-tone="rst" onClick={() => chooseWire('plain')}>HTTP · 80</button>
              </div>

              <div className={styles.stateRow} style={{ color: stateColor }}>
                <span className={styles.stateDot} />
                <strong>{stateText}</strong>
              </div>

              {/* completed rows take the colour of their direction */}
              <div className={styles.walk}>
                {steps.map((entry, index) => (
                  <div key={entry.at}
                    data-state={index < step ? entry.dir : 'todo'}
                    data-plain={plain || undefined}>
                    <i>{index < step ? '✓' : index + 1}</i>
                    <span>{entry.at}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} data-tone={plain ? 'rst' : 'b'}
                disabled={done} onClick={advance}>
                {advanceLabels[wire][Math.min(step, maxStep)]}
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

          {/* --------------------------------------------------- the mistake */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <WarningCircle weight="duotone" size={15} color="var(--a)" />
              <span>the common mistake</span>
            </div>
            <div className={styles.mistake}>
              <p>
                The padlock does <em>not</em> mean the site is safe, and it does not hide your password from the site.
                It means one thing: the bytes are unreadable to everyone <em data-plain>between</em> you and whoever
                holds that certificate. The server decrypts and reads every word.
              </p>
              <p className={styles.mistakeSplit}>
                TLS is not encrypted HTTP. It is a separate layer underneath: HTTP is written exactly as before, then
                handed to TLS, which seals it. That is why a <code data-tone="b">GET</code> looks identical on both
                wires &mdash; only its wrapping changed.
              </p>
              <p className={styles.mistakeSplit}>
                Encryption is the easy half. The <code data-tone="a">certificate</code> is the hard half: without it
                you would have a perfectly private conversation with an impostor.
              </p>
              <p className={styles.mistakeSplit}>
                Underneath sits a plain <Link href="/lab/tcp">TCP handshake</Link>. Plaintext{' '}
                <Link href="/lab/dns">DNS</Link> can expose the hostname before TLS starts, and plaintext SNI exposes
                it in this lab; encrypted DNS and ECH can reduce those leaks. Same messages as the{' '}
                <Link href="/lab/http">HTTP lab</Link>, sealed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className={styles.winWrap}>
          <div className={styles.win} data-tone={plain ? 'rst' : 'ok'}>
            {plain
              ? <Eye weight="duotone" size={26} color="var(--rst)" />
              : <LockKey weight="duotone" size={26} color="var(--ok)" />}
            <div>
              <strong>
                {plain
                  ? 'Password captured — by nobody in particular'
                  : 'Established — and the observer got metadata only'}
              </strong>
              <span>
                {plain
                  ? 'No attack was needed. Everything on this wire was readable, and the reply could have been rewritten on the way back. Now switch to HTTPS · 443 and send the identical request.'
                  : 'The GET was byte-for-byte the one sent over port 80 — TLS changed its wrapping, not its content. The server proved possession of the certificate’s private key, and the browser validated the chain, dates and hostname. The tap still sees IPs, port, sizes and timing; in this no-ECH example it also sees SNI. Switch to HTTP · 80 to compare.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
