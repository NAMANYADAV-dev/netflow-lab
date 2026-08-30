'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CheckCircle,
  CursorClick,
  Envelope,
  Lightbulb,
  Question,
  TerminalWindow,
  WarningCircle,
} from '@phosphor-icons/react';
import { sayAt, stepsFor, toneVar, type Pickup } from './mail-data';
import MailMap, { type Box, type Msg, type Rail } from './MailMap';
import styles from './mail-lab.module.css';

type ReadingMode = 'Simple' | 'Technical' | 'Packet';

const modes: ReadingMode[] = ['Simple', 'Technical', 'Packet'];

const node = (lit: boolean, chip: string, tone = 'var(--b)'): Box => ({ lit, tone, chip });
const rail = (lit: boolean, live: boolean, sub: string, label?: string, tone = 'var(--ok)'): Rail =>
  ({ lit, live, sub, label, tone: lit ? tone : 'var(--line)' });

export default function MailLab() {
  const [pickup, setPickup] = useState<Pickup>('imap');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ReadingMode>('Simple');
  const pop = pickup === 'pop';
  const steps = stepsFor(pickup);
  const maxStep = steps.length;
  const s = step;
  const current = s > 0 ? steps[s - 1] : null;
  const done = s >= maxStep;

  const choosePickup = (next: Pickup) => {
    if (next === pickup) return;
    setPickup(next);
    setStep(0);
  };

  const advance = () => {
    if (s >= maxStep) return;
    const next = s + 1;
    setStep(next);
  };

  const reset = () => setStep(0);

  /* This POP3 scenario sends DELE and QUIT after RETR, so the phone holds the
     only remaining copy. POP3 does not require clients to delete messages. */
  const drained = pop && s >= 6;
  const delivered = s >= 5;

  const app = node(s >= 1, s >= 2 ? 'handed off · no longer her problem' : s >= 1 ? 'send pressed · nothing sent yet' : 'idle');
  const msa = node(s >= 2,
    s >= 4 ? 'relayed to mx.corp.net' : s >= 3 ? 'MX found: mx.corp.net' : s >= 2 ? 'authenticated · message queued' : 'waiting',
    'var(--ok)');
  const mx = node(s >= 4, s >= 5 ? 'delivered · connection closed' : s >= 4 ? 'accepting for corp.net' : 'waiting', 'var(--ok)');
  const box = node(delivered,
    drained ? '0 messages · deleted after DELE' : delivered ? '1 message · 2,104 B' : 'empty',
    drained ? 'var(--rst)' : 'var(--a)');
  const phone = node(s >= 6,
    drained ? '1 message · the only copy in the world'
      : s >= 7 ? '1 message · marked read on the server'
        : s >= 6 ? '1 message · a copy, original stays' : 'offline · nothing waiting for it',
    drained ? 'var(--rst)' : 'var(--b)');
  const laptop = node(s >= 7,
    s >= 7 ? (pop ? '0 messages · login fine, box empty' : '1 message · already marked read') : 'not checked yet',
    s >= 7 && pop ? 'var(--rst)' : 'var(--ok)');
  const reply = node(s >= 8, s >= 8 ? 'new SMTP conversation · 587' : '—', 'var(--a)');

  /* one box speaks per step, in plain words, so the diagram narrates itself */
  const boxes: Record<string, Box> = { app, msa, mx, box, phone, laptop, reply };
  const say = sayAt[s];
  if (say) {
    const [key, imapWord, popWord] = say;
    const target = boxes[key];
    if (target) target.say = pop && popWord ? popWord : imapWord;
  }

  const boxNote = !delivered
    ? 'This box is the destination of the whole SMTP journey — not Bob’s phone.'
    : pop
      ? drained
        ? 'This client sent DELE and QUIT, so the server removed its copy. A POP3 client can instead be configured to leave it here.'
        : 'POP3 stores no folders and no read marks here. Message number and size are the only facts that exist.'
      : s >= 7
        ? 'The \\Seen flag lives in this box, so every device that opens it shows the mail as read.'
        : 'Folders, read marks and UIDs all live in this box. Devices keep a copy; this is the original.';

  const r1 = rail(s >= 2, s === 2, s >= 2 ? 'submission · she logs in first' : 'her app must hand it to a server', 'SMTP · 587');
  const r2 = rail(s >= 4, s === 4, s >= 4 ? 'relay · server to server, no password' : 'the hop across the internet', 'SMTP · 25');
  const d1 = rail(s >= 5, s === 5, s >= 5 ? 'written to disk — SMTP’s job ends here' : 'delivery target');
  const d2 = rail(s >= 6, s === 6,
    s >= 6 ? (pop ? 'downloads it, then explicitly sends DELE' : 'reads it and leaves the original') : 'Bob has to come and ask',
    pop ? 'POP3 · 995' : 'IMAP · 993', drained ? 'var(--rst)' : 'var(--b)');
  const d3 = rail(s >= 7, s === 7,
    s >= 7 ? (pop ? 'same login, empty box' : 'same box, same read mark') : 'second device, same account',
    pop ? 'POP3 · 995' : 'IMAP · 993', s >= 7 && pop ? 'var(--rst)' : 'var(--sim)');
  const l1 = rail(s >= 8, s === 8, s >= 8 ? 'sending is never IMAP or POP3' : '', 'SMTP · 587', 'var(--a)');

  const msgs: Msg[] = delivered
    ? [{
      subject: 'Q3 numbers',
      from: 'alice@example.com · 2,104 B',
      where: drained ? 'phone only' : pop && s >= 6 ? 'server + phone' : 'lives here',
      tone: drained ? 'var(--rst)' : pop ? 'var(--a)' : 'var(--ok)',
      gone: drained,
    }]
    : [{
      subject: '— nothing has arrived yet —',
      from: 'the box is where SMTP is aiming',
      where: 'empty',
      tone: 'var(--line)',
      gone: true,
    }];

  const wireLines = steps.slice(0, s).flatMap((entry) => entry.wire);

  const walk = steps.map((entry, i) => ({
    mark: i < s ? '✓' : String(i + 1),
    label: entry.at,
    proto: entry.proto,
    state: i < s ? (i === s - 1 ? 'current' : 'done') : 'todo',
    protoTone: i < s
      ? entry.proto.startsWith('SMTP') ? 'ok' : entry.proto === 'DNS' ? 'sim' : entry.proto === '—' ? 'text3' : 'b'
      : 'text3',
  }));

  const counters = [
    {
      k: 'who moves mail between servers', v: 'SMTP · 587 then 25',
      note: 'always — push only, never pulls anything',
      color: 'var(--ok)', border: 'var(--line)',
    },
    {
      k: 'who takes it out of the mailbox', v: pop ? 'POP3 · 110 or 995' : 'IMAP · 143 or 993',
      note: pop
        ? '110 is the original plaintext port; 995 is the same POP3 wrapped in TLS — pull only, it cannot send'
        : '143 is the original plaintext port; 993 is the same IMAP wrapped in TLS — pull only, it cannot send',
      color: 'var(--b)', border: 'var(--line)',
    },
    {
      k: 'where the mailbox lives', v: drained ? 'Bob’s phone' : 'the server',
      note: drained ? 'this client sent DELE; keeping a server copy is also possible' : 'devices hold copies of it',
      color: drained ? 'var(--rst)' : 'var(--ok)', border: drained ? 'var(--rst)' : 'var(--line)',
    },
    {
      k: 'what the second device sees',
      v: s < 7 ? '— not checked yet —' : pop ? '0 messages' : 'the same mail, already read',
      note: s < 7
        ? 'run the journey to the laptop step'
        : pop ? 'a successful login to an empty box' : 'no phone-to-laptop sync involved',
      color: s < 7 ? 'var(--text3)' : pop ? 'var(--rst)' : 'var(--ok)',
      border: s >= 7 && pop ? 'var(--rst)' : 'var(--line)',
    },
  ];

  const explain = current
    ? mode === 'Packet' ? current.packet : mode === 'Technical' ? current.technical : current.simple
    : 'Three protocols, three jobs. SMTP carries the mail from Alice as far as Bob’s server and stops. Then IMAP or POP3 — Bob’s choice — gets it out of the mailbox and onto his screen. Press Send and watch each box light up.';

  const footNote = current
    ? `${current.tag} · ${current.proto} · SMTP RFC 5321 · IMAP RFC 3501 (143, TLS 993) · POP3 RFC 1939 (110, TLS 995)`
    : 'SMTP 25/587 pushes · IMAP 143/993 or POP3 110/995 pulls · nothing does both';

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.missionTag}>Mission</span>
        <h1 className={styles.missionLine}>
          Follow one email from Alice’s laptop to Bob’s phone — and name the protocol at every box.
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
          {/* --------------------------------------------------- the journey */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Envelope weight="duotone" size={15} color="var(--text3)" />
              <span>the whole journey · three protocols, one email</span>
              <span className={styles.headNote} style={{ color: done ? 'var(--ok)' : undefined }}>
                {s === 0 ? 'ready' : done ? 'journey complete' : `step ${s} of ${maxStep} · ${current?.tag}`}
              </span>
            </div>
            <MailMap
              app={app} msa={msa} mx={mx} box={box} phone={phone} laptop={laptop} reply={reply}
              r1={r1} r2={r2} d1={d1} d2={d2} d3={d3} l1={l1}
              msgs={msgs} boxNote={boxNote}
              phoneSub={pop ? 'POP3 110 plain / 995 TLS · downloads; this demo sends DELE' : 'IMAP 143 plain / 993 TLS · reads in place'}
            />
          </div>

          {/* ------------------------------------------------ the four answers */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Question weight="duotone" size={15} color="var(--text3)" />
              <span>the four answers a beginner actually needs</span>
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

        {/* ---------------------------------------------------- journey control */}
        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <CursorClick weight="duotone" size={15} color="var(--text3)" />
              <span>journey_control</span>
            </div>
            <div className={styles.toolBody}>
              <div className={styles.toolLabel}>How Bob picks his mail up</div>
              <div className={styles.pickups}>
                <button type="button" data-active={!pop} aria-pressed={!pop} onClick={() => choosePickup('imap')}>IMAP · 143/993</button>
                <button type="button" data-active={pop} aria-pressed={pop} onClick={() => choosePickup('pop')}>POP3 · delete-after-download</button>
              </div>

              <div className={styles.stateRow} style={{ color: s === 0 ? 'var(--text3)' : done ? 'var(--ok)' : 'var(--b)' }}>
                <span className={styles.stateDot} />
                <strong>
                  {s === 0 ? 'not started' : done ? (pop ? 'collected · server copy deleted' : 'delivered · mailbox in sync') : 'in flight'}
                </strong>
              </div>

              <div className={styles.walk}>
                {walk.map((row) => (
                  <div key={row.label} data-state={row.state}>
                    <i>{row.mark}</i>
                    <span>{row.label}</span>
                    <em data-tone={row.protoTone}>{row.proto}</em>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.advance} disabled={done} onClick={advance}>
                {s === 0 ? 'Press Send' : done ? 'Journey complete' : `Next — ${steps[s].tag}`}
              </button>
              <button type="button" className={styles.reset} onClick={reset}>Start over</button>
            </div>
          </div>

          {/* ------------------------------------------------------- explain */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <Lightbulb weight="duotone" size={15} color="var(--b)" />
              <span>{current ? `in plain words · ${current.tag.toLowerCase()}` : 'in plain words · start here'}</span>
            </div>
            <div className={styles.explainBody}>
              <p>{explain}</p>
              <div className={styles.footNote}>{footNote}</div>
            </div>
          </div>

          {/* ---------------------------------------------------- the wire */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <TerminalWindow weight="duotone" size={15} color="var(--text3)" />
              <span>what the two computers actually said</span>
            </div>
            <div className={styles.wireBody}>
              {wireLines.length > 0
                ? wireLines.map((line, i) => (
                  <div key={`${line.t}-${i}`} style={{ color: toneVar(line.c) }}>{line.t}</div>
                ))
                : <div className={styles.wireEmpty}>
                  nothing on the wire yet — press Send and the plain-text commands appear here, line by line
                </div>}
            </div>
          </div>

          {/* -------------------------------------------------- the mistakes */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <WarningCircle weight="duotone" size={15} color="var(--a)" />
              <span>the three mistakes everyone makes</span>
            </div>
            <div className={styles.mistake}>
              <p>
                <strong>&ldquo;Email is one protocol.&rdquo;</strong> It is three jobs. SMTP pushes mail{' '}
                <em>towards</em> a mailbox. IMAP or POP3 pulls it <em>out of</em> one. No protocol does both.
              </p>
              <p className={styles.mistakeSplit}>
                <strong>&ldquo;SMTP delivers to Bob.&rdquo;</strong> SMTP stops at Bob&rsquo;s <em>server</em>. His
                phone was offline the whole time and nothing waited for it.
              </p>
              <p className={styles.mistakeSplit}>
                <strong>&ldquo;POP3 always deletes downloaded mail.&rdquo;</strong> It does not. RETR downloads; DELE marks a
                message for removal, and QUIT commits that removal. This demo deliberately shows delete-after-download.
                IMAP additionally provides server-side folders and shared state across devices.
              </p>
              <p className={styles.deeper}>
                deeper dives · <Link href="/lab/dns">DNS lab</Link> · <Link href="/lab/tcp">TCP lab</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {done && (
        <div className={styles.winWrap}>
          <div className={styles.win} data-tone={pop ? 'a' : 'ok'}>
            <CheckCircle weight="duotone" size={26} color={pop ? 'var(--a)' : 'var(--ok)'} />
            <div>
              <strong>
                {pop
                  ? 'One email, three protocols — and the mailbox ended up on the phone.'
                  : 'One email, three protocols — and the mailbox never moved.'}
              </strong>
              <span>
                {pop
                  ? 'SMTP pushed it to Bob’s server; this POP3 client downloaded it, sent DELE and committed deletion with QUIT; the reply left over SMTP again. Switch to IMAP to see shared server-side state.'
                  : 'SMTP pushed it to Bob’s server; IMAP read it in place so both his devices agree; the reply left over SMTP again. Switch to POP3 to see the mailbox move instead.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
