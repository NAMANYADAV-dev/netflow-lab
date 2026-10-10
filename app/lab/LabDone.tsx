'use client';

import { CheckCircle } from '@phosphor-icons/react';
import { useLabsDone } from './lab-progress';
import styles from './lab.module.css';

/** the tick on a lab's card once its mission check has been passed in this browser */
export function LabDoneTag({ href }: { href: string }) {
  const done = useLabsDone();
  if (!done.includes(href)) return null;
  return (
    <span className={styles.doneTag}>
      <CheckCircle weight="fill" size={13} /> Done
    </span>
  );
}

/** "3 of 13 labs done" above the catalogue; says nothing until one is finished */
export function LabDoneCount({ hrefs }: { hrefs: string[] }) {
  const done = useLabsDone().filter((href) => hrefs.includes(href)).length;
  if (!done) return null;
  return (
    <p className={styles.doneCount}>
      <CheckCircle weight="fill" size={15} />
      {done === hrefs.length ? `All ${done} labs done.` : `${done} of ${hrefs.length} labs done in this browser.`}
    </p>
  );
}
