'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  BellRinging,
  CaretDown,
  ChatCircleText,
  CheckCircle,
  Clock,
  Eye,
  EyeSlash,
  Gauge,
  Key,
  Lightbulb,
  LockKey,
  Package,
  Question,
  ShieldCheck,
} from '@phosphor-icons/react';
import SnmpGuide from './SnmpGuide';
import { SetupGuide, TryItCard } from './SnmpPractice';
import SnmpStage from './SnmpStage';
import { RATE, flowTone, idle, states, stepsFor, toneVar, type Scenario } from './snmp-data';
import { practiceFor } from './snmp-practice';
import guide from './snmp-guide.module.css';
import styles from './snmp-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';
type Vars = CSSProperties & Record<`--${string}`, string>;

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

/** what Next will do from each step, so the button says what is about to happen */
const nextLabels: Record<Scenario, string[]> = {
  poll: [
    'Send the first question',
    'Show the answer',
    'Ask for all the ports',
    'Show the answer',
    'Wait 60 s and ask again',
    'Show the answer',
    'Pull out a cable',
    'Finished',
  ],
  secure: [
    'Knock without a password',
    'Show the reply',
    'Ask again, locked',
    'Show the answer',
    'Finished',
  ],
};

const intro: Record<Scenario, string> = {
  poll: 'A monitoring server wants to keep an eye on a router. Press Next to send its first question.',
  secure: 'The same question as before — but this time nobody else on the network should be able to read it.',
};

/** thousands separators without Intl, so the server and the browser agree */
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function SnmpLab() {
  const [sc, setSc] = useState<Scenario>('poll');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  /* open for a first visit; the first move into the story puts it away */
  const [guideOpen, setGuideOpen] = useState(true);

  const poll = sc === 'poll';
  const steps = stepsFor(sc);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;
  const done = step >= maxStep;
  const state = states[sc][step];
  const practice = practiceFor(sc, step);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(maxStep, next));
    if (clamped > 0) setGuideOpen(false);
    setStep(clamped);
    setTick((value) => value + 1);
  };

  const choose = (next: Scenario) => {
    if (next === sc) return;
    setSc(next);
    setStep(0);
    setTick((value) => value + 1);
  };

  const openSetup = () => {
    const panel = document.getElementById('snmp-setup');
    if (!(panel instanceof HTMLDetailsElement)) return;
    panel.open = true;
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : idle[sc].explain;

  /* the table admits to more of each value as the reading mode deepens */
  const showOid = mode === 'Packet';
  const showType = mode !== 'Simple';
  const showNote = mode !== 'Packet';

  const deltaOctets = RATE.second.octets - RATE.first.octets;
  const seconds = (RATE.second.ticks - RATE.first.ticks) / 100;
  const mbps = (deltaOctets * 8) / seconds / 1e6;

  /* one idea per stretch of the exchange — the thing worth remembering */
  let idea: { icon: ReactNode; title: string; body: ReactNode } | null = null;
  if (poll && step >= 1 && step <= 2) {
    idea = {
      icon: <ChatCircleText weight="duotone" size={20} />,
      title: 'One question, one answer',
      body: <p>The server names exactly what it wants, and the router sends back that one value. That is all SNMP polling is: a question on UDP 161, and an answer back.</p>,
    };
  } else if (poll && step >= 3 && step <= 5) {
    idea = {
      icon: <Gauge weight="duotone" size={20} />,
      title: 'A counter is a running total',
      body: <p>Gi0/2 has received <b>{fmt(RATE.first.octets)}</b> bytes since the router started. On its own that number says nothing about how busy the port is <em>right now</em> — for that you need a second reading.</p>,
    };
  } else if (poll && step === 6) {
    idea = {
      icon: <Gauge weight="duotone" size={20} />,
      title: 'Two readings make a speed',
      body: (
        <div className={styles.equation}>
          <span className={styles.term}><small>2nd reading</small>{fmt(RATE.second.octets)}</span>
          <span className={styles.op}>−</span>
          <span className={styles.term}><small>1st reading</small>{fmt(RATE.first.octets)}</span>
          <span className={styles.op}>=</span>
          <span className={styles.term} data-tone="a"><small>bytes in {seconds} s</small>{fmt(deltaOctets)}</span>
          <span className={styles.op}>× 8 ÷ {seconds} s =</span>
          <span className={styles.term} data-tone="ok"><small>speed</small>{mbps.toFixed(1)} Mbit/s</span>
        </div>
      ),
    };
  } else if (poll && step === 7) {
    idea = {
      icon: <BellRinging weight="duotone" size={20} />,
      title: 'Two ways to find out',
      body: (
        <div className={styles.split}>
          <div>
            <Clock weight="duotone" size={22} />
            <strong>Polling</strong>
            <p>The server asks every 60 seconds. Good for graphs.</p>
          </div>
          <div data-tone="rst">
            <BellRinging weight="duotone" size={22} />
            <strong>Trap</strong>
            <p>The router tells the server at once, on UDP 162. Good for alarms — but nobody replies, so a lost alarm is never noticed.</p>
          </div>
        </div>
      ),
    };
  } else if (!poll && step >= 1 && step <= 2) {
    idea = {
      icon: <Key weight="duotone" size={20} />,
      title: 'Keys belong to one router',
      body: <p>SNMPv3 turns each password into a key tied to one router’s ID. Until the server knows that ID it cannot sign or lock anything — so its first message only asks for it.</p>,
    };
  } else if (!poll && step >= 3) {
    idea = {
      icon: <LockKey weight="duotone" size={20} />,
      title: 'Locked, not invisible',
      body: (
        <div className={styles.split}>
          <div data-tone="ok">
            <EyeSlash weight="duotone" size={22} />
            <strong>Hidden</strong>
            <p>What was asked, the answer, and any password. And nobody can forge or change the message.</p>
          </div>
          <div>
            <Eye weight="duotone" size={22} />
            <strong>Still visible</strong>
            <p>The two IP addresses, the ports, the user name <code>nms-ro</code> and the router’s ID.</p>
          </div>
        </div>
      ),
    };
  }

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.wrap}>
        {/* ---------------------------------------------------- mission */}
        <div className={styles.missionBar}>
          <span className={styles.missionTag}>Mission</span>
          <h1 className={styles.missionLine}>
            {poll ? (
              <>Watch a router: measure how busy port <code>Gi0/2</code> is, then <b>catch the alarm</b> when it fails.</>
            ) : (
              <>Ask the router the same question with <b>SNMPv3</b>, so nobody else can read the answer.</>
            )}
          </h1>
        </div>

        {/* ------------------------------------------------- start here */}
        {guideOpen && <SnmpGuide onClose={() => setGuideOpen(false)} />}

        {/* ---------------------------------------------------- toolbar */}
        <div className={styles.toolbar}>
          <div className={guide.toolbarStart}>
            <div className={styles.scenarios} role="group" aria-label="Scenario">
              <button type="button" data-active={poll} aria-pressed={poll} onClick={() => choose('poll')}>
                <Gauge weight="duotone" size={16} /> Watch a router · v2c
              </button>
              <button type="button" data-active={!poll} aria-pressed={!poll} data-tone="ok" onClick={() => choose('secure')}>
                <ShieldCheck weight="duotone" size={16} /> Keep it private · v3
              </button>
            </div>
            <button type="button" className={guide.helpButton} aria-expanded={guideOpen} onClick={() => setGuideOpen((open) => !open)}>
              <Question weight="duotone" size={17} /> How to use
            </button>
          </div>

          <div className={styles.progress}>
            <span className={styles.status} style={{ color: toneVar[state.tone] }}>
              <i /> {state.text}
            </span>
            <div className={styles.dots} role="group" aria-label="Jump to a step">
              {steps.map((entry, index) => (
                <button
                  key={index}
                  type="button"
                  data-state={index < step - 1 ? 'done' : index === step - 1 ? 'current' : 'todo'}
                  style={{ '--tone': toneVar[flowTone[entry.flow]] } as Vars}
                  aria-label={`Step ${index + 1}: ${entry.walkLabel}`}
                  aria-current={index === step - 1 ? 'step' : undefined}
                  title={entry.walkLabel}
                  onClick={() => go(index + 1)}
                />
              ))}
            </div>
            <span className={styles.stepCount}>{step === 0 ? `${maxStep} steps` : `Step ${step} of ${maxStep}`}</span>
          </div>
        </div>

        {/* ------------------------------------------------------ stage */}
        <SnmpStage sc={sc} step={step} current={current} tick={tick} />

        {/* ----------------------------------------------- what happened */}
        <section className={styles.happened} data-tone={current ? flowTone[current.flow] : 'idle'} aria-live="polite">
          <div className={styles.happenedHead}>
            <span className={styles.kicker}><Lightbulb weight="duotone" size={16} /> What happened</span>
            <div className={styles.modeTabs} role="group" aria-label="How much detail">
              {modes.map((option) => (
                <button key={option} type="button" data-active={mode === option} aria-pressed={mode === option} onClick={() => setMode(option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
          <h2 className={styles.happenedTitle}>{current ? current.title : intro[sc]}</h2>
          <p className={styles.happenedText} data-kind={current ? mode : undefined}>{explain}</p>
          {current && (
            <div className={styles.exposure} style={{ color: toneVar[current.exposure.tone] }}>
              {current.exposure.tone === 'ok' ? <EyeSlash weight="duotone" size={16} /> : <Eye weight="duotone" size={16} />}
              <span>{current.exposure.text}</span>
            </div>
          )}
        </section>

        {/* ------------------------------------------------- navigation */}
        <div className={styles.navRow}>
          <button type="button" className={styles.secondary} onClick={() => go(step - 1)} disabled={step === 0}>
            <ArrowLeft weight="bold" size={16} /> Back
          </button>
          <button type="button" className={styles.ghost} onClick={() => go(0)} disabled={step === 0}>
            <ArrowCounterClockwise weight="bold" size={16} /> Start over
          </button>
          <button type="button" className={styles.next} data-tone={poll ? 'b' : 'ok'} onClick={() => go(step + 1)} disabled={done}>
            {nextLabels[sc][Math.min(step, maxStep)]} {!done && <ArrowRight weight="bold" size={17} />}
          </button>
        </div>

        {/* ---------------------------------------------------- key idea */}
        {idea && (
          <section key={`${sc}-${idea.title}`} className={styles.idea}>
            <div className={styles.ideaHead}>{idea.icon}<span>Key idea · {idea.title}</span></div>
            <div className={styles.ideaBody}>{idea.body}</div>
          </section>
        )}

        {/* ----------------------------------------------- try it for real */}
        {practice && <TryItCard key={`${sc}-${practice.goal}`} practice={practice} onSetup={openSetup} />}

        {done && (
          <div className={styles.win}>
            <CheckCircle weight="duotone" size={28} />
            <div>
              <strong>
                {poll ? 'Done — you watched a router the way real monitoring does' : 'Done — same answer, but only the server could read it'}
              </strong>
              <span>
                {poll
                  ? 'Questions and answers on UDP 161 built the 45 Mbit/s graph; the alarm on UDP 162 arrived the moment the cable came out. Try Keep it private · v3 next.'
                  : 'The server learned the router’s ID first, then signed and locked every message. The addresses and the user name still showed — locking hides what is said, not who is talking.'}
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------- the real packet */}
        <details className={styles.details}>
          <summary>
            <Package weight="duotone" size={18} />
            <span>See the real packet</span>
            <small>{current ? `${current.pdu} · the fields and values on the wire` : 'fields and values appear once a message is sent'}</small>
            <CaretDown weight="bold" size={15} className={styles.caret} />
          </summary>

          {current ? (
            <div className={styles.detailsBody}>
              <dl className={styles.fields}>
                {current.header.map((field) => {
                  const tone = field.tone ? toneVar[field.tone] : undefined;
                  return (
                    <div className={styles.field} key={field.k} style={{ borderColor: tone ?? 'var(--line)' }}>
                      <dt>{field.k}</dt>
                      <dd style={{ color: tone ?? 'var(--text)' }}>{field.v}</dd>
                      <p>{field.note}</p>
                    </div>
                  );
                })}
              </dl>

              {current.sealed && (
                <div className={styles.sealed}>
                  <LockKey weight="duotone" size={15} />
                  <span>Encrypted on the wire — shown here as the server {current.flow === 'req' ? 'wrote it before locking' : 'read it after unlocking'}.</span>
                </div>
              )}

              {current.varbinds.length > 0 ? (
                <div className={styles.vbWrap}>
                  <table className={styles.vbTable}>
                    <thead>
                      <tr>
                        <th>{showOid ? 'oid' : 'value name'}</th>
                        {showType && <th>type</th>}
                        <th>value</th>
                        {showNote && <th>meaning</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {current.varbinds.map((vb) => {
                        const asking = vb.type === 'NULL';
                        return (
                          <tr key={`${sc}-${step}-${vb.oid}`}>
                            <td className={showOid ? styles.vbOid : styles.vbName}>{showOid ? vb.oid : vb.name}</td>
                            {showType && <td className={styles.vbType}>{vb.type}</td>}
                            <td className={styles.vbValue} data-asking={asking || undefined}>
                              {asking ? (mode === 'Simple' ? 'asking…' : 'NULL') : vb.value}
                            </td>
                            {showNote && <td className={styles.vbNote}>{vb.note ?? ''}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.vbEmpty}>No values at all — this message exists only to be refused.</p>
              )}

              <code className={styles.packetLine}>{current.packet}</code>
            </div>
          ) : (
            <p className={styles.detailsEmpty}>{idle[sc].foot}</p>
          )}
        </details>

        {/* ------------------------------------ practise on your own computer */}
        <SetupGuide />
      </div>
    </main>
  );
}
