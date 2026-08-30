'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Broadcast,
  ClockClockwise,
  CursorClick,
  IdentificationCard,
  Lightbulb,
  ListDashes,
  TerminalWindow,
  WarningCircle,
} from '@phosphor-icons/react';
import { CLIENT_MAC, XID, freshWire, renewWire, stepsFor, wireCounts, type Scenario } from './dhcp-data';
import DhcpDiagram from './DhcpDiagram';
import styles from './dhcp-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const advanceLabels: Record<Scenario, string[]> = {
  fresh: ['Shout for a server →', 'Read the offer →', 'Accept the offer →', 'Take the lease', 'Bound · 192.168.1.10'],
  renew: ['Let the clock run to T1 →', 'Send the renewal →', 'Read the ACK', 'Renewed · clock reset'],
};

export default function DhcpLab() {
  const [sc, setSc] = useState<Scenario>('fresh');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const [tick, setTick] = useState(0);
  const renew = sc === 'renew';
  const steps = stepsFor(sc);
  const maxStep = steps.length;
  const current = step > 0 ? steps[step - 1] : null;
  const bound = renew ? true : step >= 4;
  const done = step >= maxStep;

  const chooseScenario = (next: Scenario) => {
    if (next === sc) return;
    setSc(next);
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

  const stateText = renew
    ? step === 0 ? 'bound · 12 h elapsed' : !done ? 'renewing' : 'bound · clock reset'
    : step === 0 ? 'init · no address' : !done ? 'selecting' : 'bound';

  const stateColor = renew
    ? done ? 'var(--ok)' : 'var(--a)'
    : step === 0 ? 'var(--rst)' : !done ? 'var(--b)' : 'var(--ok)';

  const wire = (renew ? renewWire : freshWire).slice(0, wireCounts[sc][Math.max(0, step - 1)] || 0);

  const headerFields = renew
    ? [
      { k: 'op / msg type', v: step >= 2 ? 'BOOTREQUEST · 3' : '—', color: step >= 2 ? 'var(--b)' : 'var(--text3)', border: step >= 2 ? 'var(--b)' : 'var(--line)', note: 'a REQUEST, not a discover' },
      { k: 'ciaddr', v: '192.168.1.10', color: 'var(--ok)', border: step >= 2 ? 'var(--ok)' : 'var(--line)', note: 'filled in — this is the difference' },
      { k: 'destination', v: step >= 2 ? '192.168.1.1' : '—', color: step >= 2 ? 'var(--ok)' : 'var(--text3)', border: step >= 2 ? 'var(--ok)' : 'var(--line)', note: 'unicast · it knows the server now' },
      { k: 'broadcast flag', v: '0', color: 'var(--ok)', border: 'var(--line)', note: 'nobody else needs to hear this' },
      { k: 'opt 54 server id', v: '192.168.1.1', color: step >= 2 ? 'var(--text)' : 'var(--text3)', border: 'var(--line)', note: 'asking the same server again' },
      { k: 'opt 51 lease', v: step >= 3 ? '86400 s · reset' : '43200 s left', color: step >= 3 ? 'var(--ok)' : 'var(--a)', border: step >= 3 ? 'var(--ok)' : 'var(--line)', note: 'granted from zero again' },
      { k: 'packets used', v: step >= 3 ? '2' : '—', color: step >= 3 ? 'var(--ok)' : 'var(--text3)', border: 'var(--line)', note: 'DORA was four' },
      { k: 'address change', v: step >= 3 ? 'none' : '—', color: step >= 3 ? 'var(--ok)' : 'var(--text3)', border: 'var(--line)', note: 'same lease, longer' },
    ]
    : [
      {
        k: 'op / msg type',
        v: step >= 4 ? 'BOOTREPLY · 5 ACK' : step >= 3 ? 'BOOTREQUEST · 3' : step >= 2 ? 'BOOTREPLY · 2 OFFER' : step >= 1 ? 'BOOTREQUEST · 1' : '—',
        color: step >= 1 ? 'var(--b)' : 'var(--text3)', border: step >= 1 ? 'var(--b)' : 'var(--line)',
        note: 'option 53 names the message',
      },
      { k: 'xid', v: step >= 1 ? XID : '—', color: step >= 1 ? 'var(--text)' : 'var(--text3)', border: 'var(--line)', note: 'ties all four together' },
      { k: 'ciaddr', v: '0.0.0.0', color: step >= 4 ? 'var(--text3)' : 'var(--rst)', border: 'var(--line)', note: 'the client has no address to put here' },
      { k: 'broadcast flag', v: '1', color: 'var(--b)', border: 'var(--line)', note: 'asks server replies to use broadcast' },
      { k: 'chaddr', v: CLIENT_MAC, color: step >= 1 ? 'var(--text)' : 'var(--text3)', border: step >= 1 ? 'var(--b)' : 'var(--line)', note: 'the only identity it owns' },
      { k: 'yiaddr', v: step >= 2 ? '192.168.1.10' : '—', color: step >= 2 ? 'var(--a)' : 'var(--text3)', border: step >= 2 ? 'var(--a)' : 'var(--line)', note: '“your address” — offered, then committed' },
      { k: 'opt 1 / 3', v: step >= 2 ? '/24 · gw .1' : '—', color: step >= 2 ? 'var(--a)' : 'var(--text3)', border: step >= 2 ? 'var(--a)' : 'var(--line)', note: 'mask and gateway ride along' },
      { k: 'opt 6 dns', v: step >= 2 ? '1.1.1.1, 8.8.8.8' : '—', color: step >= 2 ? 'var(--a)' : 'var(--text3)', border: step >= 2 ? 'var(--a)' : 'var(--line)', note: 'names, not just numbers' },
      { k: 'opt 51 lease', v: step >= 2 ? '86400 s' : '—', color: step >= 4 ? 'var(--ok)' : step >= 2 ? 'var(--a)' : 'var(--text3)', border: step >= 4 ? 'var(--ok)' : 'var(--line)', note: 'borrowed, not owned' },
    ];

  /* the lease panel tells three different stories: nothing, offered, committed */
  const leaseRows = bound
    ? [
      { k: 'address', v: '192.168.1.10', color: 'var(--ok)' },
      { k: 'mask', v: '255.255.255.0  /24', color: 'var(--text)' },
      { k: 'gateway', v: '192.168.1.1', color: 'var(--text)' },
      { k: 'dns', v: '1.1.1.1 · 8.8.8.8', color: 'var(--text)' },
      { k: 'lease', v: renew && step >= 3 ? '86400 s · just renewed' : '86400 s · 24 h', color: 'var(--ok)' },
    ]
    : step >= 2
      ? [
        { k: 'address', v: '192.168.1.10  (offered)', color: 'var(--a)' },
        { k: 'mask', v: '255.255.255.0  /24', color: 'var(--a)' },
        { k: 'gateway', v: '192.168.1.1', color: 'var(--a)' },
        { k: 'dns', v: '1.1.1.1 · 8.8.8.8', color: 'var(--a)' },
        { k: 'lease', v: '86400 s  (not yet committed)', color: 'var(--a)' },
      ]
      : ['address', 'mask', 'gateway', 'dns', 'lease'].map((k) => ({ k, v: '— none —', color: 'var(--rst)' }));

  const leaseTone = bound ? 'ok' : step >= 2 ? 'a' : 'rst';
  const leaseTitle = bound
    ? 'the lease · what the machine actually got'
    : step >= 2 ? 'offered configuration · not yet yours' : 'interface configuration · empty';
  const leaseFill = renew ? (step >= 3 ? '4%' : '50%') : bound ? '2%' : '0%';
  const leaseNote = renew
    ? step >= 3
      ? 'Renewed at the halfway mark, so the address never lapsed. A machine can hold one address for months this way.'
      : 'Half the lease is gone. Renew now and the clock resets; do nothing and at T2 it starts asking any server that will listen.'
    : bound
      ? 'The clock starts now. At T1 the client renews quietly; if the server has vanished, it keeps working right up to expiry and then starts over.'
      : 'Five settings, not one — and every one of them arrives in the same exchange.';

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : renew
      ? 'The machine is already working and nothing is wrong. Watch the quiet two-packet exchange that keeps it that way — and note what it no longer has to broadcast.'
      : 'A machine that has just booted knows its own MAC address and nothing else. Four messages later it has an address, a mask, a gateway, a pair of resolvers and a deadline.';

  const footNote = current
    ? current.packet
    : renew
      ? 'state BOUND · addr 192.168.1.10 · lease 86400s · 43200s elapsed'
      : 'state INIT · addr none · mask none · gateway none · resolvers none';

  const elapsed = step === 0 ? '—' : renew ? (step >= 3 ? '3 ms · 2 packets' : '1 ms') : step >= 4 ? '118 ms · 4 packets' : '42 ms';

  const castLabel = !current
    ? 'nothing on the wire'
    : current.cast === 'bcast' ? 'broadcast · every port'
      : current.cast === 'ucast' ? 'unicast · one port' : 'local timer · no packet';
  const castColor = !current
    ? 'var(--text3)'
    : current.cast === 'bcast' ? 'var(--b)' : current.cast === 'ucast' ? 'var(--ok)' : 'var(--a)';

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          {renew
            ? 'Keep the address you already have — with two packets and no broadcast.'
            : 'Get PC-1 onto the network from nothing but a MAC address.'}
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
              <span>
                {renew
                  ? 'dhcp renewal · unicast, and nobody else hears it'
                  : 'dhcp dora · broadcast-reply scenario (flags = 1)'}
              </span>
              <span className={styles.headNote} style={{ color: castColor }}>{castLabel}</span>
            </div>
            <div className={styles.stageBody}>
              <DhcpDiagram steps={steps} step={step} renew={renew} tick={tick} />
            </div>
          </div>

          {/* ---------------------------------------------------- the wire */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <TerminalWindow weight="duotone" size={15} color="var(--text3)" />
              <span>udp 68 ↔ 67 · every frame on the wire, with its source and destination</span>
              <span className={styles.headNote}>{elapsed}</span>
            </div>
            <div className={styles.wireBody}>
              {wire.length > 0
                ? wire.map((row) => <div key={row.text} style={{ color: row.color }}>{row.text}</div>)
                : <div className={styles.wireEmpty}>interface up, no address — nothing sent yet</div>}
            </div>
          </div>

          {/* --------------------------------------------------- dhcp packet */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <ListDashes weight="duotone" size={15} color="var(--text3)" />
              <span>dhcp packet · the fixed header, then the options that do the real work</span>
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

        {/* ------------------------------------------------------ client state */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <CursorClick weight="duotone" size={15} color="var(--text3)" />
              <span>client_state</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>Scenario</div>
              <div className={styles.scenarios}>
                <button type="button" data-active={!renew} aria-pressed={!renew} data-tone="a" onClick={() => chooseScenario('fresh')}>Fresh boot · DORA</button>
                <button type="button" data-active={renew} aria-pressed={renew} data-tone="ok" onClick={() => chooseScenario('renew')}>Renewal · T1</button>
              </div>

              <div className={styles.stateRow} style={{ color: stateColor }}>
                <span className={styles.stateDot} />
                <strong>{stateText}</strong>
              </div>

              <div className={styles.walk}>
                {steps.map((entry, index) => (
                  <div key={entry.tag} data-state={index < step ? entry.flow : 'todo'}>
                    <i>{index < step ? '✓' : index + 1}</i>
                    <span>{entry.walkLabel}</span>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} data-tone={renew ? 'ok' : 'b'}
                disabled={done} onClick={advance}>
                {advanceLabels[sc][Math.min(step, maxStep)]}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Release lease</button>
            </div>
          </div>

          {/* --------------------------------------------------- the lease */}
          <div className={styles.leasePanel} data-tone={leaseTone}>
            <div className={styles.leaseHead}>
              <IdentificationCard weight="duotone" size={15} />
              <span>{leaseTitle}</span>
            </div>
            <div className={styles.leaseBody}>
              <dl className={styles.leaseRows}>
                {leaseRows.map((row) => (
                  <div key={row.k}>
                    <dt>{row.k}</dt>
                    <dd style={{ color: row.color }}>{row.v}</dd>
                  </div>
                ))}
              </dl>

              <div className={styles.clockWrap}>
                <div className={styles.clockLabel}>Lease clock · 24 h</div>
                <div className={styles.clockTrack}>
                  <div className={styles.clockFill} style={{ width: leaseFill }} />
                  <span className={styles.clockT1} />
                  <span className={styles.clockT2} />
                </div>
                <div className={styles.clockTicks}>
                  <span>0h</span>
                  <span>T1 12h · renew</span>
                  <span>T2 21h · rebind</span>
                </div>
                <p className={styles.clockNote}>{leaseNote}</p>
              </div>
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
                DHCP does not just hand out an IP address. It hands over the whole <em>configuration</em> &mdash; mask,
                gateway, DNS servers, lease length. Get the address and lose the gateway and you can reach your
                neighbour and nothing else.
              </p>
              <p className={styles.mistakeSplit}>
                DISCOVER and the selecting-state REQUEST are <code data-tone="b">broadcast</code>. In this lab the
                client also sets the BROADCAST flag, so the server broadcasts OFFER and ACK. A client that can receive
                before configuring its address may clear that flag and receive those replies by unicast. The{' '}
                <Link href="/lab/arp">ARP lab</Link> shows local broadcast one layer down.
              </p>
              <p className={styles.mistakeSplit}>
                And you do not own the address &mdash; you borrow it. The lease is a <em data-plain>timer</em>, and the
                client is responsible for renewing it at halfway. Everything the other labs assume about{' '}
                <code data-tone="a">192.168.1.10</code> starts here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className={styles.winWrap}>
          <div className={styles.win}>
            {renew
              ? <ClockClockwise weight="duotone" size={26} color="var(--ok)" />
              : <IdentificationCard weight="duotone" size={26} color="var(--ok)" />}
            <div>
              <strong>
                {renew
                  ? 'Renewed — two packets, no broadcast, same address'
                  : 'Bound — the four-message DORA exchange is complete'}
              </strong>
              <span>
                {renew
                  ? 'Because the client already had an address and knew who issued it, discovery was unnecessary. This quiet exchange is what actually happens on a working network almost all the time — DORA is the rare event.'
                  : 'PC-1 now has the 192.168.1.10 that every other lab on this site takes for granted — plus the mask, gateway and resolvers it needs to be useful. It is borrowed for 24 hours. Switch to Renewal · T1 to see how it keeps it.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
