'use client';

import { ArrowRight, CursorClick, GraduationCap, Lightbulb, TerminalWindow, X } from '@phosphor-icons/react';
import styles from './snmp-guide.module.css';

/* What a first-time visitor needs before pressing anything: what SNMP is for,
   and how this page is meant to be used. It closes itself on the first Next,
   and the toolbar's "How to use" button brings it back. */

const howTo = [
  { icon: CursorClick, title: 'Pick a story', text: 'Start with “Watch a router”. “Keep it private” shows the secure version.' },
  { icon: ArrowRight, title: 'Press Next', text: 'One message at a time travels between the two machines.' },
  { icon: Lightbulb, title: 'Read what happened', text: 'Switch to Technical or Packet whenever you want more detail.' },
  { icon: TerminalWindow, title: 'Try it for real', text: 'Every step shows the command that sends the same message.' },
] as const;

export default function SnmpGuide({ onClose }: { onClose: () => void }) {
  return (
    <section className={styles.guide} aria-labelledby="snmp-guide-title">
      <div className={styles.guideIntro}>
        <span className={styles.guideKicker}>
          <GraduationCap weight="duotone" size={16} /> Start here
        </span>
        <h2 id="snmp-guide-title">What is SNMP?</h2>
        <p>
          SNMP — Simple Network Management Protocol — is how a monitoring server keeps an eye on routers,
          switches and servers. It asks them questions such as “how much traffic?” on UDP port 161, and
          they can raise an alarm of their own on port 162.
        </p>
      </div>

      <ol className={styles.howTo} aria-label="How to use this lab">
        {howTo.map(({ icon: Icon, title, text }, index) => (
          <li key={title}>
            <span className={styles.howIcon}>
              <Icon weight="duotone" size={22} />
              <b>{index + 1}</b>
            </span>
            <strong>{title}</strong>
            <p>{text}</p>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className={styles.guideClose}
        onClick={onClose}
        aria-label="Hide the guide"
        data-hint="Click to hide this guide — the How to use button brings it back."
      >
        <X weight="bold" size={16} />
      </button>
    </section>
  );
}
