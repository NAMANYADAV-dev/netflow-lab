'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowsLeftRight,
  CheckCircle,
  CursorClick,
  Lightbulb,
  Lightning,
  ListDashes,
  TerminalWindow,
  WarningCircle,
} from '@phosphor-icons/react';
import { firstWire, revisitWire, stepsFor, wireCounts, type Visit } from './http-data';
import HttpSequence from './HttpSequence';
import styles from './http-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const advanceLabels: Record<Visit, string[]> = {
  first: [
    'Open the connection →',
    'Send the GET →',
    'Server finds the resource →',
    'Read the response headers →',
    'Receive the body →',
    'Fetch the subresources',
    'Page fully loaded',
  ],
  revisit: [
    'Open the connection →',
    'Send a conditional GET →',
    'Server checks the tag →',
    'Get the 304 back',
    'Validated — nothing sent',
  ],
};

export default function HttpLab() {
  const [visit, setVisit] = useState<Visit>('first');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  const revisit = visit === 'revisit';
  const steps = stepsFor(visit);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;

  const chooseVisit = (next: Visit) => {
    if (next === visit) return;
    setVisit(next);
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

  const stateText = step === 0
    ? 'idle · socket open'
    : !done ? 'in flight'
      : revisit ? '304 · served from cache' : '200 · page loaded';
  const stateColor = step === 0 ? 'var(--text3)' : !done ? 'var(--b)' : 'var(--ok)';

  const wire = (revisit ? revisitWire : firstWire).slice(0, wireCounts[visit][Math.max(0, step - 1)] || 0);

  const headerFields = revisit
    ? [
      { k: 'method', v: 'GET', color: 'var(--b)', border: step >= 2 ? 'var(--b)' : 'var(--line)', note: 'same verb, smarter question' },
      { k: 'path', v: '/index.html', color: 'var(--text)', border: 'var(--line)', note: 'what is being asked for' },
      { k: 'host', v: 'example.com', color: 'var(--text)', border: 'var(--line)', note: 'which site on this IP' },
      { k: 'if-none-match', v: '"a3f1c"', color: step >= 2 ? 'var(--a)' : 'var(--text3)', border: step >= 2 ? 'var(--a)' : 'var(--line)', note: 'the tag the browser already holds' },
      { k: 'status', v: step >= 4 ? '304 Not Modified' : '—', color: step >= 4 ? 'var(--ok)' : 'var(--text3)', border: step >= 4 ? 'var(--ok)' : 'var(--line)', note: 'use your copy' },
      { k: 'content-length', v: step >= 4 ? '0' : '—', color: step >= 4 ? 'var(--ok)' : 'var(--text3)', border: 'var(--line)', note: 'no body at all' },
      { k: 'etag', v: '"a3f1c"', color: step >= 3 ? 'var(--a)' : 'var(--text3)', border: 'var(--line)', note: 'server’s version fingerprint' },
      { k: 'connection', v: 'keep-alive', color: 'var(--ok)', border: 'var(--line)', note: 'reused, no new handshake' },
    ]
    : [
      { k: 'method', v: 'GET', color: step >= 2 ? 'var(--b)' : 'var(--text3)', border: step >= 2 ? 'var(--b)' : 'var(--line)', note: 'read, change nothing' },
      { k: 'path', v: '/index.html', color: step >= 2 ? 'var(--text)' : 'var(--text3)', border: 'var(--line)', note: 'the resource wanted' },
      { k: 'host', v: 'example.com', color: step >= 2 ? 'var(--text)' : 'var(--text3)', border: step >= 2 ? 'var(--b)' : 'var(--line)', note: 'required — one IP, many sites' },
      { k: 'status', v: step >= 4 ? '200 OK' : '—', color: step >= 4 ? 'var(--ok)' : 'var(--text3)', border: step >= 4 ? 'var(--ok)' : 'var(--line)', note: 'found it, here it is' },
      { k: 'content-type', v: step >= 4 ? 'text/html' : '—', color: step >= 4 ? 'var(--a)' : 'var(--text3)', border: step >= 4 ? 'var(--a)' : 'var(--line)', note: 'how to parse the body' },
      { k: 'content-length', v: step >= 4 ? '13412' : '—', color: step >= 4 ? 'var(--a)' : 'var(--text3)', border: 'var(--line)', note: 'where the body ends' },
      { k: 'etag', v: step >= 4 ? '"a3f1c"' : '—', color: step >= 4 ? 'var(--a)' : 'var(--text3)', border: 'var(--line)', note: 'used on the next visit' },
      { k: 'connection', v: step >= 6 ? 'keep-alive' : '—', color: step >= 6 ? 'var(--ok)' : 'var(--text3)', border: step >= 6 ? 'var(--ok)' : 'var(--line)', note: 'socket stays open for more' },
    ];

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : revisit
      ? 'You have been here before, and the browser kept a copy. Watch it ask whether that copy is still good instead of downloading the page again.'
      : 'A GET request is a few lines of plain text. Step through and watch one request turn into one response — and then watch how one page turns out to need four of them.';

  const footNote = current
    ? current.packet
    : revisit
      ? 'cached: /index.html  etag "a3f1c"  age 42s  max-age 300'
      : 'socket 49512 → 203.0.113.20:80   ESTABLISHED   0 bytes exchanged';

  const byteCount = step === 0
    ? '0 bytes of HTTP'
    : revisit
      ? step >= 4 ? '~180 bytes total · 13,412 saved' : '~140 bytes sent'
      : step >= 6 ? '4 requests · 4 responses · 61 KB'
        : step >= 5 ? '13,412 bytes received' : '~120 bytes sent';

  const elapsed = step === 0
    ? '—'
    : revisit
      ? step >= 4 ? '6 ms' : '2 ms'
      : step >= 6 ? '214 ms' : step >= 5 ? '96 ms' : '24 ms';

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          {revisit
            ? 'Reload the same page — and find the request that sends no page back.'
            : 'Fetch example.com/index.html and count how many requests one page really takes.'}
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
                {revisit
                  ? 'conditional GET · revalidating a cached page'
                  : 'http request / response · over one TCP connection'}
              </span>
              <span className={styles.headNote}>{byteCount}</span>
            </div>
            <div className={styles.stageBody}>
              <HttpSequence steps={steps} step={step} packetMode={mode === 'Packet'} tick={tick} />
            </div>
          </div>

          {/* ----------------------------------------------------- raw bytes */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <TerminalWindow weight="duotone" size={15} color="var(--text3)" />
              <span>raw bytes on the wire · plain text, human readable</span>
              <span className={styles.headNote} style={{ color: revisit && step >= 4 ? 'var(--ok)' : undefined }}>
                {elapsed}
              </span>
            </div>
            <div className={styles.wireBody}>
              {wire.length > 0
                ? wire.map((line) => <div key={line.text} style={{ color: line.color }}>{line.text}</div>)
                : <div className={styles.wireEmpty}>connection open, nothing asked yet — press send below</div>}
            </div>
          </div>

          {/* --------------------------------------------------- http message */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <ListDashes weight="duotone" size={15} color="var(--text3)" />
              <span>http_message · a start line, some headers, then a body</span>
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

        {/* ---------------------------------------------------- exchange state */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <CursorClick weight="duotone" size={15} color="var(--text3)" />
              <span>exchange_state</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>Visit</div>
              <div className={styles.visits}>
                <button type="button" data-active={!revisit} aria-pressed={!revisit} onClick={() => chooseVisit('first')}>First visit</button>
                <button type="button" data-active={revisit} aria-pressed={revisit} onClick={() => chooseVisit('revisit')}>Revisit</button>
              </div>

              <div className={styles.stateRow} style={{ color: stateColor }}>
                <span className={styles.stateDot} />
                <strong>{stateText}</strong>
              </div>

              {/* the checklist is coloured by direction, not by progress: blue
                  went out, orange came back, green was already there */}
              <div className={styles.walk}>
                {steps.map((entry, index) => (
                  <div key={entry.at} data-state={index < step ? entry.dir : 'todo'}>
                    <i>{index < step ? '✓' : index + 1}</i>
                    <span>{entry.at}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} disabled={done} onClick={advance}>
                {advanceLabels[visit][Math.min(step, maxStep)]}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Reset exchange</button>
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
                One page is <em>not</em> one request. The HTML arrives first, and only then does the browser
                discover the CSS, the script and the image it needs &mdash; each one is its own request over the
                same connection.
              </p>
              <p className={styles.mistakeSplit}>
                HTTP is <code data-tone="b">stateless</code>: the server remembers nothing between requests. Every
                request has to carry its own context &mdash; that is why <code data-tone="a">Host</code>, cookies and
                auth headers are repeated every single time.
              </p>
              <p className={styles.mistakeSplit}>
                HTTP does no delivery work of its own. It rides a TCP connection that was already built by a{' '}
                <Link href="/lab/tcp">three-way handshake</Link>, to an address found by <Link href="/lab/dns">DNS</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className={styles.winWrap}>
          <div className={styles.win} data-tone={revisit ? 'ok' : 'a'}>
            {revisit
              ? <Lightning weight="duotone" size={26} color="var(--ok)" />
              : <CheckCircle weight="duotone" size={26} color="var(--a)" />}
            <div>
              <strong>
                {revisit
                  ? '304 — the fastest response is the one with no body'
                  : 'Page loaded — and it took four requests, not one'}
              </strong>
              <span>
                {revisit
                  ? 'A ~180 byte exchange replaced a 13,412 byte download. The page was never sent; the browser was simply told its copy is still good.'
                  : 'One request brought the HTML. Parsing it revealed a stylesheet, a script and an image — three more request/response pairs on the same connection. Now switch to Revisit and see what caching changes.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
