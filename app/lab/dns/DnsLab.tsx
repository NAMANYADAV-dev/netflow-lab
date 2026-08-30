'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Lightbulb,
  Lightning,
  Package,
  Path,
  TerminalWindow,
  TreeStructure,
  WarningCircle,
} from '@phosphor-icons/react';
import { coldTrace, stepsFor, warmTrace, type Cache } from './dns-data';
import DnsDiagram from './DnsDiagram';
import styles from './dns-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const advanceLabels: Record<Cache, string[]> = {
  cold: [
    'Check the browser cache →',
    'Check the OS cache →',
    'Ask the router →',
    'Resolver: check its cache →',
    'Ask a root server →',
    'Ask the .com server →',
    'Ask the owner →',
    'Cache the answer →',
    'Send it back down',
    'Name resolved',
  ],
  warm: [
    'Check the browser cache →',
    'Check the OS cache →',
    'Ask the router →',
    'Resolver: check its cache →',
    'Send the answer back',
    'Answered from cache',
  ],
};

const walkLabels: Record<Cache, string[]> = {
  cold: [
    'Browser cache — MISS',
    'OS cache + hosts — MISS',
    'Router forwarder — MISS, forwards on',
    'Resolver cache — MISS, must walk',
    'Root refers it to .com',
    '.com refers it to example.com',
    'The owner answers with the address',
    'Answer cached for its TTL',
    'Sent back down — every stop caches it',
  ],
  warm: [
    'Browser cache — MISS',
    'OS cache + hosts — MISS',
    'Router forwarder — MISS, forwards on',
    'Resolver cache HIT — 284s left',
    'Answered without touching the tree',
  ],
};

export default function DnsLab() {
  const [cache, setCache] = useState<Cache>('cold');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  const warm = cache === 'warm';
  const steps = stepsFor(cache);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;

  const chooseCache = (next: Cache) => {
    if (next === cache) return;
    setCache(next);
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
  if (step > 0 && step < 4) { stateText = 'CHECKING CACHES'; stateColor = 'var(--b)'; }
  else if (warm) {
    if (step === 4) { stateText = 'RESOLVER CACHE HIT'; stateColor = 'var(--ok)'; }
    else if (step >= 5) { stateText = 'ANSWERED IN 12MS'; stateColor = 'var(--ok)'; }
  } else if (step === 4) { stateText = 'ALL FOUR CACHES MISSED'; stateColor = 'var(--rst)'; }
  else if (step >= 5 && step <= 6) { stateText = 'WALKING THE TREE'; stateColor = 'var(--a)'; }
  else if (step === 7) { stateText = 'ANSWER FOUND'; stateColor = 'var(--ok)'; }
  else if (step === 8) { stateText = 'CACHED FOR 300S'; stateColor = 'var(--ok)'; }
  else if (step >= 9) { stateText = 'NAME RESOLVED'; stateColor = 'var(--ok)'; }

  const fullTrace = warm ? warmTrace : coldTrace;
  // the warm run's last two lines both land on the final step
  const traceLines = warm ? fullTrace.slice(0, step >= 5 ? 6 : step) : fullTrace.slice(0, step);

  const answered = step >= maxStep;
  const isAuthoritative = current?.arc === 2;
  const hasAnswer = warm ? step >= 4 : step >= 7;

  const headerFields = [
    {
      k: 'question (qname)', v: 'www.example.com',
      note: 'Byte for byte the same in every query — the resolver never rewrites it.',
      color: 'var(--b)', border: 'var(--b)',
    },
    {
      k: 'type / class', v: 'A / IN',
      note: 'An IPv4 address record. AAAA would ask for IPv6, MX for mail.',
      color: 'var(--text)', border: 'var(--line)',
    },
    {
      k: 'flags',
      v: answered
        ? 'RA=1  AA=0'
        : typeof current?.arc === 'number' ? (isAuthoritative ? 'AA=1' : 'AA=0  RD=0') : 'RD=1',
      note: answered
        ? 'A recursive answer from the resolver — not authoritative itself.'
        : isAuthoritative
          ? 'AA=1: this server owns the zone, so this is the real answer.'
          : 'AA=0: not authoritative — expect a referral, not an address.',
      color: isAuthoritative ? 'var(--ok)' : 'var(--text)',
      border: isAuthoritative ? 'var(--ok)' : 'var(--line)',
    },
    {
      k: 'answer count', v: hasAnswer ? '1' : '0',
      note: hasAnswer
        ? 'One A record — the hunt is over.'
        : 'Zero so far. A referral carries authority records, not answers.',
      color: hasAnswer ? 'var(--ok)' : 'var(--text3)', border: 'var(--line)',
    },
    {
      k: 'ttl', v: warm ? '284s left' : step >= 7 ? '300s' : '—',
      note: warm
        ? 'Ticking down. At zero the resolver must walk the tree again.'
        : 'How long any resolver may cache this answer. Set by the zone owner.',
      color: warm ? 'var(--a)' : 'var(--text)', border: warm ? 'var(--a)' : 'var(--line)',
    },
    {
      k: 'transport', v: 'udp / 53',
      note: 'One small datagram each way. Over 512 bytes and DNS retries over TCP.',
      color: 'var(--text)', border: 'var(--line)',
    },
  ];

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : warm
      ? 'Same name, same client, one minute later. The tree has not changed — but the resolver remembers. Run it and watch how much of the work disappears.'
      : 'No single machine knows where www.example.com lives. The name is split into labels, and each level of the tree knows only one thing: who to ask next. Four questions turn a name into an address.';

  const footNote = current
    ? `step: ${current.at}`
    : warm ? 'cache warm · 284s of 300s remaining' : 'cache cold · the resolver knows nothing yet';

  const asked = warm ? 0 : Math.max(0, Math.min(3, step - 4));
  const elapsed = warm ? (step >= 5 ? '12 ms' : '—') : step >= 9 ? '48 ms' : '—';

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          {warm
            ? 'Ask for the same name again and find out what the cache just saved you.'
            : 'Turn www.example.com into an address, starting from a resolver that knows nothing.'}
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
          {/* ------------------------------------------------------- diagram */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <TreeStructure weight="duotone" size={15} color="var(--text3)" />
              <span>
                {warm
                  ? 'cache ladder · the resolver already knew — nothing to walk'
                  : 'cache ladder, then the tree walk · the resolver returns to the middle every time'}
              </span>
              <span className={styles.headNote}>{warm ? '0 external queries' : `${asked} of 3 servers asked`}</span>
            </div>
            <div className={styles.stageBody}>
              <DnsDiagram step={step} current={current} warm={warm} tick={tick} />
            </div>
          </div>

          {/* --------------------------------------------------------- trace */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <TerminalWindow weight="duotone" size={15} color="var(--text3)" />
              <span>dig www.example.com · +trace</span>
              <span className={styles.headNote} style={{ color: warm ? 'var(--ok)' : undefined }}>{elapsed}</span>
            </div>
            <div className={styles.traceBody}>
              {traceLines.length > 0
                ? traceLines.map((line) => <div key={line.text} style={{ color: line.color }}>{line.text}</div>)
                : <div className={styles.traceEmpty}>no query sent yet — press ask below</div>}
            </div>
          </div>

          {/* ---------------------------------------------------- dns header */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Package weight="duotone" size={15} color="var(--text3)" />
              <span>dns_message · the question never changes</span>
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

        {/* ---------------------------------------------------- resolver state */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Path weight="duotone" size={15} color="var(--text3)" />
              <span>resolver_state</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>Resolver cache</div>
              <div className={styles.caches}>
                <button type="button" data-active={!warm} aria-pressed={!warm} data-tone="b" onClick={() => chooseCache('cold')}>cold cache</button>
                <button type="button" data-active={warm} aria-pressed={warm} data-tone="ok" onClick={() => chooseCache('warm')}>warm cache</button>
              </div>

              <div className={styles.stateRow} style={{ color: stateColor }}>
                <span className={styles.stateDot} />
                <strong>{stateText}</strong>
              </div>

              <div className={styles.walk}>
                {walkLabels[cache].map((label, index) => (
                  <div key={label} data-state={step > index + 1 ? 'done' : step === index + 1 ? 'current' : 'todo'}>
                    <i>{step > index + 1 ? '✓' : step === index + 1 ? '▸' : ''}</i>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} disabled={answered} onClick={advance}>
                {advanceLabels[cache][Math.min(step, maxStep)]}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Reset lookup</button>
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

          {/* -------------------------------------------------- the mistake */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <WarningCircle weight="duotone" size={15} color="var(--a)" />
              <span>the common mistake</span>
            </div>
            <div className={styles.mistake}>
              <p>
                The query does <em>not</em> travel root &rarr; TLD &rarr; authoritative like a relay. It returns to
                the resolver every single time. Root never talks to the TLD server; it just says{' '}
                <code data-tone="a">go ask them</code>.
              </p>
              <p className={styles.mistakeSplit}>
                Two query types in one lookup: PC-1 asks <code data-tone="b">recursively</code> (RD=1 &mdash; give me
                the final answer), and the resolver then asks <code data-tone="a">iteratively</code> (RD=0 &mdash; tell
                me what you know, I&rsquo;ll do the walking). Only the resolver walks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {answered && (
        <div className={styles.winWrap}>
          <div className={styles.win}>
            {warm
              ? <Lightning weight="duotone" size={26} color="var(--ok)" />
              : <CheckCircle weight="duotone" size={26} color="var(--ok)" />}
            <div>
              <strong>{warm ? 'Twelve milliseconds, nobody asked' : 'Four caches missed, then four questions'}</strong>
              <span>
                {warm
                  ? 'Browser, OS and router still missed — but the resolver had it, so root, TLD and authoritative servers saw no traffic at all. This is why the name system survives billions of lookups a day: almost none of them reach the tree.'
                  : 'Browser, OS, router and resolver all came up empty, so the resolver walked: root knew who ran .com, .com knew who ran example.com, and only the last server knew the address. On the way home every stop wrote it down. Now switch to a warm cache and run it again.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
