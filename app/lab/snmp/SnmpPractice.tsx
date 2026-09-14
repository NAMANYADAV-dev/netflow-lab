'use client';

import { useState } from 'react';
import {
  ArrowDown,
  BookOpen,
  CaretDown,
  Check,
  Copy,
  Laptop,
  Lightbulb,
  ShieldWarning,
  TerminalWindow,
} from '@phosphor-icons/react';
import { setup, type Practice } from './snmp-practice';
import styles from './snmp-guide.module.css';

/** one command, ready to copy */
function CommandLine({ cmd, label }: { cmd: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // a browser that blocks the clipboard still lets the command be selected by hand
    }
  };

  return (
    <div className={styles.command}>
      {label && <span className={styles.commandLabel}>{label}</span>}
      <div className={styles.commandRow}>
        <code>
          <span aria-hidden="true">$ </span>
          {cmd}
        </code>
        <button type="button" onClick={copy} aria-label={copied ? 'Copied' : 'Copy command'}>
          {copied ? <Check weight="bold" size={15} /> : <Copy size={15} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
}

/** the command behind the step on screen */
export function TryItCard({ practice, onSetup }: { practice: Practice; onSetup: () => void }) {
  return (
    <section className={styles.tryIt}>
      <div className={styles.tryHead}>
        <TerminalWindow weight="duotone" size={18} />
        <span>Try it for real · {practice.goal}</span>
      </div>

      <div className={styles.tryBody}>
        {practice.commands.map((command) => (
          <CommandLine key={command.cmd} cmd={command.cmd} label={command.label} />
        ))}

        {practice.output && (
          <div className={styles.output}>
            <span className={styles.commandLabel}>what the lab’s router would print — your numbers will differ</span>
            <pre>{practice.output.join('\n')}</pre>
          </div>
        )}
        {practice.outputNote && <p className={styles.tryNote}>{practice.outputNote}</p>}

        <p className={styles.tryTip}>
          <Lightbulb weight="duotone" size={17} />
          <span>{practice.tip}</span>
        </p>

        <button type="button" className={styles.setupLink} onClick={onSetup}>
          <ArrowDown weight="bold" size={14} /> No SNMP on your computer yet? Set it up in 5 steps
        </button>
      </div>
    </section>
  );
}

/** everything needed to run the commands above, on the reader's own machine */
export function SetupGuide() {
  return (
    <details className={styles.setup} id="snmp-setup">
      <summary>
        <Laptop weight="duotone" size={19} />
        <span>Practise on your own computer</span>
        <small>5 steps · Ubuntu, or Windows with WSL</small>
        <CaretDown weight="bold" size={15} className={styles.caret} />
      </summary>

      <div className={styles.setupBody}>
        <p className={styles.safety}>
          <ShieldWarning weight="duotone" size={18} />
          <span>
            Practise only on your own computer, or on devices you have permission to test. The agent set up
            here listens on 127.0.0.1, so nothing outside your computer can reach it.
          </span>
        </p>

        <ol className={styles.setupSteps}>
          {setup.map((entry, index) => (
            <li key={entry.title}>
              <span className={styles.setupNum}>{index + 1}</span>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.body}</p>
                {entry.commands.map((cmd) => <CommandLine key={cmd} cmd={cmd} />)}
              </div>
            </li>
          ))}
        </ol>

        <p className={styles.tryNote}>
          <BookOpen weight="duotone" size={16} /> Done — now pick any step above and run its command.
        </p>
      </div>
    </details>
  );
}
