'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import {
  Broadcast,
  ChartLineUp,
  CursorClick,
  Eye,
  EyeSlash,
  Lightbulb,
  ListDashes,
  LockKey,
  LockOpen,
  ShieldCheck,
  Siren,
  TerminalWindow,
  TreeStructure,
  WarningCircle,
} from '@phosphor-icons/react';
import SnmpDiagram from './SnmpDiagram';
import {
  RATE,
  flowTone,
  idle,
  mibByKey,
  mibTree,
  states,
  stepsFor,
  toneVar,
  type Scenario,
} from './snmp-data';
import styles from './snmp-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';
type Vars = CSSProperties & Record<`--${string}`, string>;

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const advanceLabels: Record<Scenario, string[]> = {
  poll: [
    'Ask for uptime →',
    'Read the answer',
    'Walk the interface table →',
    'Read the table',
    'Poll again, 60 s later →',
    'Work out the rate',
    'Unplug Gi0/2 →',
    'Polled twice · trapped once',
  ],
  secure: [
    'Ask with no credentials →',
    'Read the refusal',
    'Ask again, signed and sealed →',
    'Verify and decrypt',
    'Read securely · done',
  ],
};

/** thousands separators without Intl, so the server and the browser agree */
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const levels = [
  { key: 'community', name: 'v1 / v2c', sub: 'community string', read: true, forge: true },
  { key: 'noauth', name: 'v3 noAuthNoPriv', sub: 'a user name, nothing else', read: true, forge: true },
  { key: 'auth', name: 'v3 authNoPriv', sub: 'signed with HMAC', read: true, forge: false },
  { key: 'authpriv', name: 'v3 authPriv', sub: 'signed and encrypted', read: false, forge: false },
] as const;

const visibleOnWire = ['IP addresses', 'UDP ports', 'msgID', 'user name', 'engine ID', 'boots · time', 'size · timing'];

export default function SnmpLab() {
  const [sc, setSc] = useState<Scenario>('poll');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);

  const poll = sc === 'poll';
  const steps = stepsFor(sc);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;
  const done = step >= maxStep;
  const state = states[sc][step];
  const flowColor = current ? toneVar[flowTone[current.flow]] : 'var(--text3)';

  const chooseScenario = (next: Scenario) => {
    if (next === sc) return;
    setSc(next);
    setStep(0);
    setTick((value) => value + 1);
  };

  const advance = () => {
    if (step >= maxStep) return;
    setStep(step + 1);
    setTick((value) => value + 1);
  };

  const reset = () => { setStep(0); setTick((value) => value + 1); };

  /* the capture only ever grows, so index keys are stable: new rows mount and
     animate, rows already on screen stay put */
  const wire = steps.slice(0, step).flatMap((entry) => entry.wire);

  /* a node is the leaf the PDU names, on the path down to one, or neither */
  const touched = (current?.touches ?? []).map((key) => mibByKey[key].oid);
  const nodeState = (oid: string) =>
    touched.includes(oid) ? 'leaf' : touched.some((leaf) => leaf.startsWith(`${oid}.`)) ? 'path' : 'idle';

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : idle[sc].explain;

  const castLabel = current ? `udp ${current.flow === 'trap' ? 162 : 161} · ${current.pdu}` : 'nothing on the wire';

  /* the mode decides how much of each varbind the table admits to */
  const showOid = mode === 'Packet';
  const showType = mode !== 'Simple';
  const showNote = mode !== 'Packet';

  /* ---------------------------------------------------------- the rate */
  const firstRead = step >= 4;
  const secondRead = step >= 6;
  const linkDown = step >= 7;
  const deltaOctets = RATE.second.octets - RATE.first.octets;
  const deltaTicks = RATE.second.ticks - RATE.first.ticks;
  const bps = (deltaOctets * 8) / (deltaTicks / 100);
  const share = (bps / RATE.linkBps) * 100;
  const rateNote = linkDown
    ? 'The next poll would find this counter frozen, and the graph would sag a minute late. The trap got here first — with the reason.'
    : secondRead
      ? 'Two readings, sixty seconds apart, became a speed. The NMS plots one point and waits another minute. That is the whole graph.'
      : firstRead
        ? 'Baseline stored. 1,204,775,210 bytes since boot says nothing about right now. The rate needs a second reading.'
        : 'A counter only climbs. One reading is a large, meaningless number — this panel needs two.';

  /* ------------------------------------------------------ the security */
  const level = poll ? null : step >= 3 ? 'authpriv' : step >= 1 ? 'noauth' : null;
  const secNote = step >= 3
    ? 'authPriv: the OIDs and values are sealed and every message is signed. What is left in the clear is what the agent needs to find the key.'
    : step >= 1
      ? 'Discovery runs at noAuthNoPriv on purpose. Without the engine ID there is no key to sign or encrypt with.'
      : 'Four ways to run SNMP. Only the bottom row keeps the data private and the requests genuine.';

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          {poll ? (
            <>Graph the traffic on <code>Gi0/2</code> of <code>10.0.0.1</code> — poll a counter twice, turn it into a speed, then <b>catch the alarm</b>.</>
          ) : (
            <>Ask <code>10.0.0.1</code> the same question with <b>SNMPv3</b> — so nobody on the path can read the answer or forge the request.</>
          )}
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
              <Broadcast weight="duotone" size={15} color="var(--text3)" />
              <span>{poll ? 'snmp v2c · one lane for questions, one for alarms' : 'snmp v3 · the same lane, sealed'}</span>
              <span className={styles.headNote} style={{ color: flowColor }}>{castLabel}</span>
            </div>
            <div className={styles.stageBody}>
              <SnmpDiagram sc={sc} steps={steps} step={step} tick={tick} />
            </div>
          </div>

          {/* ------------------------------------------------------ the wire */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <TerminalWindow weight="duotone" size={15} color="var(--text3)" />
              <span>capture · what anyone on the path between them reads</span>
              <span className={styles.headNote}>{current ? `t = ${current.at}` : '—'}</span>
            </div>
            <div className={styles.wireBody}>
              {wire.length > 0
                ? wire.map((row, index) => <div key={index} style={{ color: toneVar[row.tone] }}>{row.text}</div>)
                : <div className={styles.wireEmpty}>listening on the path — no datagrams yet</div>}
            </div>
          </div>

          {/* ------------------------------------------------------- the pdu */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <ListDashes weight="duotone" size={15} color="var(--text3)" />
              <span>pdu · the header, then the variable bindings</span>
              <span className={styles.headNote} style={{ color: flowColor }}>{current ? current.pdu : 'no pdu yet'}</span>
            </div>

            {current && (
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
            )}

            {current?.sealed && (
              <div className={styles.sealed}>
                <LockKey weight="duotone" size={15} />
                <span>
                  encrypted on the wire · shown here as the manager {current.flow === 'req' ? 'wrote it before sealing' : 'read it after decrypting'}
                </span>
              </div>
            )}

            <div className={styles.vbWrap}>
              {current && current.varbinds.length > 0 ? (
                <table className={styles.vbTable}>
                  <thead>
                    <tr>
                      <th>{showOid ? 'oid' : 'object'}</th>
                      {showType && <th>type</th>}
                      <th>value</th>
                      {showNote && <th>what it means</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {current.varbinds.map((vb, index) => {
                      const asking = vb.type === 'NULL';
                      return (
                        <tr key={`${sc}-${step}-${vb.oid}`} style={{ '--i': String(index) } as Vars}>
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
              ) : (
                <p className={styles.vbEmpty}>
                  {current
                    ? 'An empty variable-binding list. This request names no object at all — it exists only to be refused.'
                    : 'No PDU yet. Every SNMP message carries the same cargo: a list of OIDs, each paired with a value — or with NULL, when it is a question.'}
                </p>
              )}
            </div>
          </div>

          <div className={styles.twoUp}>
            {/* ---------------------------------------------------- the mib */}
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <TreeStructure weight="duotone" size={15} color="var(--text3)" />
                <span>mib · the numbered tree every OID walks</span>
              </div>
              <ul className={styles.tree} style={{ '--tone': flowColor } as Vars}>
                {mibTree.map((node) => (
                  <li key={node.key} data-state={nodeState(node.oid)} data-depth={node.depth}
                    style={{ '--depth': String(node.depth) } as Vars}>
                    <span className={styles.treeName}>{node.label}</span>
                    <span className={styles.treeArc}>({node.arc})</span>
                    {node.via && <span className={styles.treeVia}>{node.via}</span>}
                  </li>
                ))}
              </ul>
              <div className={styles.treeFoot}>
                {current && current.touches.length > 0 ? (
                  <>
                    <span>this pdu names</span>
                    {current.touches.map((key) => <code key={key} style={{ color: flowColor }}>{mibByKey[key].label}</code>)}
                  </>
                ) : (
                  <span>
                    {current
                      ? 'this pdu names no object at all'
                      : 'every object has a name for people and a number for the wire — only the number is sent'}
                  </span>
                )}
              </div>
            </div>

            {poll ? (
              /* ------------------------------------------------ the rate */
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <ChartLineUp weight="duotone" size={15} color="var(--text3)" />
                  <span>counter → rate · the sum behind every graph</span>
                </div>
                <div className={styles.rateBody}>
                  <div className={styles.readings}>
                    <div className={styles.readHead}>
                      <span />
                      <span>sysUpTime</span>
                      <span>ifInOctets.3</span>
                    </div>
                    <div data-on={firstRead}>
                      <span>poll 1</span>
                      <span>{firstRead ? fmt(RATE.first.ticks) : '—'}</span>
                      <span>{firstRead ? fmt(RATE.first.octets) : '—'}</span>
                    </div>
                    <div data-on={secondRead}>
                      <span>poll 2</span>
                      <span>{secondRead ? fmt(RATE.second.ticks) : '—'}</span>
                      <span>{secondRead ? fmt(RATE.second.octets) : '—'}</span>
                    </div>
                    <div data-on={secondRead} data-delta>
                      <span>Δ</span>
                      <span>{secondRead ? `${fmt(deltaTicks)} = ${(deltaTicks / 100).toFixed(2)} s` : '—'}</span>
                      <span>{secondRead ? fmt(deltaOctets) : '—'}</span>
                    </div>
                  </div>

                  <div className={styles.rateResult} data-state={linkDown ? 'down' : secondRead ? 'ok' : 'wait'}>
                    <div className={styles.rateLabel}>
                      {linkDown
                        ? <><Siren weight="duotone" size={14} /> Gi0/2 down · last rate</>
                        : secondRead ? 'Δ octets × 8 ÷ Δ time' : 'needs two readings'}
                    </div>
                    <strong>{secondRead ? (bps / 1e6).toFixed(1) : '—'}<small> Mbit/s</small></strong>
                    <div className={styles.meter}><i style={{ width: secondRead ? `${share}%` : '0%' }} /></div>
                    <div className={styles.meterTicks}>
                      <span>0</span>
                      <span>{secondRead ? `${share.toFixed(1)} % of the link` : ''}</span>
                      <span>1 Gbit/s</span>
                    </div>
                  </div>

                  <p className={styles.panelNote}>{rateNote}</p>
                </div>
              </div>
            ) : (
              /* -------------------------------------------- the security */
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <LockKey weight="duotone" size={15} color="var(--text3)" />
                  <span>security level · who can read it, who can forge it</span>
                </div>
                <div className={styles.rateBody}>
                  <div className={styles.ladder}>
                    <div className={styles.ladderHead}>
                      <span>level</span>
                      <span>readable</span>
                      <span>forgeable</span>
                    </div>
                    {levels.map((row) => (
                      <div key={row.key} data-active={level === row.key} data-best={row.key === 'authpriv'}>
                        <span><b>{row.name}</b><small>{row.sub}</small></span>
                        <span data-bad={row.read}>
                          {row.read ? <Eye weight="duotone" size={14} /> : <EyeSlash weight="duotone" size={14} />}
                          {row.read ? 'yes' : 'no'}
                        </span>
                        <span data-bad={row.forge}>
                          {row.forge ? <LockOpen weight="duotone" size={14} /> : <ShieldCheck weight="duotone" size={14} />}
                          {row.forge ? 'yes' : 'no'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.toolLabel}>still visible on the wire</div>
                  <div className={styles.visible}>
                    {visibleOnWire.map((item) => <span key={item} data-on={step >= 3}>{item}</span>)}
                  </div>

                  <p className={styles.panelNote}>{secNote}</p>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------ the mistake */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <WarningCircle weight="duotone" size={15} color="var(--a)" />
              <span>the common mistake</span>
            </div>
            <div className={styles.mistake}>
              <p>
                SNMP is not a monitoring system. It is the protocol a monitoring system uses to <em>ask</em>. The graphs,
                thresholds and alerts all live in the NMS; the router only keeps counters and answers questions about them.
              </p>
              <p className={styles.mistakeSplit}>
                A counter is not a speed. <code data-tone="a">ifInOctets = 1,204,775,210</code> means nothing on its own
                &mdash; only the difference between two polls, divided by the time between them, becomes 45 Mbit/s. And
                32-bit counters wrap: on a gigabit link, in about 34 seconds. Fast interfaces are read from the 64-bit{' '}
                <code data-tone="b">ifHCInOctets</code>.
              </p>
              <p className={styles.mistakeSplit}>
                <code data-tone="rst">public</code> is not a password. v1 and v2c send the community string in the clear in
                every packet, replies included. Run SNMPv3 at authPriv and let only the NMS reach UDP 161. Encryption hides
                what is asked, <em data-plain>not who is asking</em> &mdash; the <Link href="/lab/https">HTTPS lab</Link>{' '}
                shows the same limit one layer over.
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- console */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <CursorClick weight="duotone" size={15} color="var(--text3)" />
              <span>manager_console</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>Scenario</div>
              <div className={styles.scenarios}>
                <button type="button" data-active={poll} aria-pressed={poll} data-tone="b" onClick={() => chooseScenario('poll')}>
                  Poll &amp; trap · v2c
                </button>
                <button type="button" data-active={!poll} aria-pressed={!poll} data-tone="ok" onClick={() => chooseScenario('secure')}>
                  Secure · v3
                </button>
              </div>

              <div className={styles.stateRow} style={{ color: toneVar[state.tone] }}>
                <span className={styles.stateDot} />
                <strong>{state.text}</strong>
              </div>

              <div className={styles.endpoints}>
                <span>nms    10.0.0.50</span>
                <span>agent  10.0.0.1:161 · core-rtr-01</span>
                <span data-tone={poll ? 'rst' : 'ok'}>
                  {poll ? 'auth   community "public"' : 'auth   user nms-ro · authPriv'}
                </span>
              </div>

              <div className={styles.walk}>
                {steps.map((entry, index) => (
                  <div key={index} data-state={index < step ? entry.flow : 'todo'} data-current={index === step - 1 || undefined}>
                    <i>{index < step ? '✓' : index + 1}</i>
                    <span>{entry.walkLabel}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} data-tone={poll ? 'b' : 'ok'} disabled={done} onClick={advance}>
                {advanceLabels[sc][Math.min(step, maxStep)]}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Start over</button>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Lightbulb weight="duotone" size={15} color="var(--b)" />
              <span>what just happened</span>
            </div>
            <div className={styles.explainBody}>
              <p data-kind={current ? mode : undefined}>{explain}</p>
              {mode !== 'Packet' && (
                <div className={styles.footNote}>{current ? current.packet : idle[sc].foot}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className={styles.winWrap}>
          <div className={styles.win}>
            {poll
              ? <ChartLineUp weight="duotone" size={26} color="var(--ok)" />
              : <ShieldCheck weight="duotone" size={26} color="var(--ok)" />}
            <div>
              <strong>
                {poll
                  ? 'Polled twice, trapped once — that is how every network graph is made'
                  : 'Same uptime, but nobody on the path could read it or forge it'}
              </strong>
              <span>
                {poll
                  ? 'Polling built the graph: two readings of a counter, sixty seconds apart, became 45 Mbit/s. The trap raised the alarm the moment Gi0/2 failed, without waiting for the next poll. Switch to Secure · v3 to ask the same question without handing out the password.'
                  : 'Discovery taught the manager the engine ID it needed to localise its keys; after that every message was signed with HMAC-SHA-256 and encrypted with AES-128. The user name and engine ID still crossed in the clear — encryption hides what is asked, not who is asking.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
