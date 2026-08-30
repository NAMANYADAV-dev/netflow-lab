'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  ArrowUUpLeft,
  Buildings,
  DeviceMobile,
  EnvelopeSimple,
  EnvelopeSimpleOpen,
  Envelope,
  HardDrives,
  Laptop,
  Tray,
} from '@phosphor-icons/react';
import styles from './mail-lab.module.css';

type Vars = CSSProperties & Record<`--${string}`, string>;

/* A grid rather than an SVG: the journey is boxes and the lines between them,
   and laying it out in CSS keeps the text selectable and the type consistent
   with the rest of the lab. Each box and each rail is a small descriptor the
   lab computes per step, so this file only draws. */

export type Box = {
  lit: boolean;
  tone: string;
  chip: string;
  /** the speech bubble, only on the box that is acting this step */
  say?: string;
};

export type Rail = {
  lit: boolean;
  live: boolean;
  tone: string;
  label?: string;
  sub: string;
};

export type Msg = {
  subject: string;
  from: string;
  where: string;
  tone: string;
  gone: boolean;
};

const boxStyle = (box: Box): Vars => ({
  '--bd': box.lit ? box.tone : 'var(--line)',
  '--bg': box.lit ? `color-mix(in srgb, ${box.tone} 9%, var(--surface2))` : 'var(--surface2)',
});

function Node({ box, icon, title, addr, area, dashed }: {
  box: Box; icon: ReactNode; title: string; addr: string; area: string; dashed?: boolean;
}) {
  return (
    <div className={styles.node} style={{ ...boxStyle(box), gridArea: area }} data-dashed={dashed || undefined}>
      {box.say && <div className={styles.say}>{box.say}</div>}
      <span className={styles.nodeIcon}>{icon}</span>
      <div className={styles.nodeTitle}>{title}</div>
      <div className={styles.nodeAddr}>{addr}</div>
      <div className={styles.nodeChip}>{box.chip}</div>
    </div>
  );
}

/** a left-to-right hop; `back` points the arrow the other way */
function RailX({ rail, area, back }: { rail: Rail; area: string; back?: boolean }) {
  return (
    <div className={styles.railX} style={{ '--c': rail.tone, gridArea: area } as Vars}>
      {rail.label && <div className={styles.railLabel}>{rail.label}</div>}
      <div className={styles.railLine} data-lit={rail.lit} data-back={back || undefined}>
        <span className={styles.railHead} data-back={back || undefined} />
        {rail.live && <span className={styles.railRunner} data-back={back || undefined} />}
      </div>
      <div className={styles.railSub}>{rail.sub}</div>
    </div>
  );
}

/** a downward hop, with its caption beside it rather than under it */
function RailY({ rail, area }: { rail: Rail; area: string }) {
  return (
    <div className={styles.railY} style={{ '--c': rail.tone, gridArea: area } as Vars}>
      <div className={styles.railLineY} data-lit={rail.lit}>
        <span className={styles.railHeadY} />
        {rail.live && <span className={styles.railRunnerY} />}
      </div>
      <div className={styles.railAside}>
        {rail.label && <div className={styles.railLabel}>{rail.label}</div>}
        <div className={styles.railSub}>{rail.sub}</div>
      </div>
    </div>
  );
}

export default function MailMap({ app, msa, mx, box, phone, laptop, reply, r1, r2, d1, d2, d3, l1, msgs, boxNote, phoneSub }: {
  app: Box; msa: Box; mx: Box; box: Box; phone: Box; laptop: Box; reply: Box;
  r1: Rail; r2: Rail; d1: Rail; d2: Rail; d3: Rail; l1: Rail;
  msgs: Msg[]; boxNote: string; phoneSub: string;
}) {
  return (
    <div className={styles.map}>
      <Node box={app} area="app" title="Alice’s mail app" addr="alice@example.com · Thunderbird"
        icon={<EnvelopeSimpleOpen weight="duotone" size={27} />} />
      <RailX rail={r1} area="r1" />
      <Node box={msa} area="msa" title="Alice’s outgoing server" addr="smtp.example.com · port 587"
        icon={<HardDrives weight="duotone" size={27} />} />
      <RailX rail={r2} area="r2" />
      <Node box={mx} area="mx" title="Bob’s mail server" addr="mx.corp.net · port 25"
        icon={<Buildings weight="duotone" size={27} />} />

      <RailY rail={d1} area="d1" />

      {/* the mailbox is the destination of the whole SMTP journey, so it gets
          the full width and the message list beside it */}
      <div className={styles.mailbox} style={{ ...boxStyle(box), gridArea: 'box' }}>
        <div className={styles.mailboxHead}>
          {box.say && <div className={styles.say}>{box.say}</div>}
          <span className={styles.nodeIcon}><Tray weight="duotone" size={27} /></span>
          <div className={styles.nodeTitle}>Bob’s mailbox</div>
          <div className={styles.nodeAddr}>/var/mail/bob · on the server</div>
          <div className={styles.nodeChip}>{box.chip}</div>
        </div>
        <div className={styles.mailboxBody}>
          {msgs.map((m) => (
            <div className={styles.msg} key={m.subject} style={{ '--c': m.tone } as Vars} data-gone={m.gone || undefined}>
              <span className={styles.msgIcon}>
                {m.gone ? <EnvelopeSimple weight="duotone" size={18} /> : <Envelope weight="duotone" size={18} />}
              </span>
              <div className={styles.msgMain}>
                <div className={styles.msgSubject}>{m.subject}</div>
                <div className={styles.msgFrom}>{m.from}</div>
              </div>
              <span className={styles.msgWhere}>{m.where}</span>
            </div>
          ))}
          <p className={styles.mailboxNote}>{boxNote}</p>
        </div>
      </div>

      <RailY rail={d2} area="d2" />
      <RailY rail={d3} area="d3" />

      <Node box={reply} area="reply" title="Bob replies" addr="out via smtp.corp.net · 587" dashed
        icon={<ArrowUUpLeft weight="duotone" size={27} />} />
      <RailX rail={l1} area="l1" back />
      <Node box={phone} area="phone" title="Bob’s phone" addr={phoneSub}
        icon={<DeviceMobile weight="duotone" size={27} />} />
      <Node box={laptop} area="laptop" title="Bob’s laptop" addr="same account, second device"
        icon={<Laptop weight="duotone" size={27} />} />
    </div>
  );
}
