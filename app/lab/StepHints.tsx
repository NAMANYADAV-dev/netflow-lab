'use client';

import { Eye, Lightbulb, WarningCircle } from '@phosphor-icons/react';
import styles from './step-hints.module.css';

export type StepHint = {
  /** the hints, gentlest first — each asks the reader to think a little less */
  nudges: string[];
  /** the answer itself, kept behind one more deliberate click */
  answer: string;
};

/* The hint ladder under a builder step.

   Nothing is shown until the reader asks. Each click gives one more level:
   a nudge that points at what to think about, then the idea behind it, and
   only then the answer. Someone who is stuck gets unstuck, and someone who
   already knows is never told. Earlier hints stay on screen, so the reader can
   see how the answer follows from them.

   `feedback` is the reason a submitted answer was wrong. It explains the
   mistake the reader actually made, rather than just repeating the right
   answer, so being wrong teaches something too. */
export default function StepHints({ hint, level, onReveal, feedback, tour }: {
  hint: StepHint;
  /** how many levels are open: 0 = none, nudges.length + 1 = the answer too */
  level: number;
  onReveal: () => void;
  feedback?: string | null;
  /** the walkthrough selector, so the hints are lit together with their field */
  tour?: string;
}) {
  const total = hint.nudges.length + 1;
  const shown = hint.nudges.slice(0, level);
  const answered = level >= total;
  const nextIsAnswer = level === hint.nudges.length;

  return (
    <div className={styles.hints} data-tour={tour}>
      {feedback && (
        <p className={styles.feedback} role="status">
          <WarningCircle weight="fill" size={14} />
          <span>{feedback}</span>
        </p>
      )}

      {level > 0 && (
        <ol className={styles.ladder} aria-live="polite">
          {shown.map((text, i) => (
            <li key={text}>
              <b>Hint {i + 1}</b>
              <span>{text}</span>
            </li>
          ))}
          {answered && (
            <li data-kind="answer">
              <b>Answer</b>
              <span>{hint.answer}</span>
            </li>
          )}
        </ol>
      )}

      {!answered && (
        <button
          type="button"
          className={styles.reveal}
          data-kind={nextIsAnswer ? 'answer' : undefined}
          data-hint={nextIsAnswer
            ? 'Click to see the answer for this step. Try the field once more first.'
            : `Click for hint ${level + 1} of ${hint.nudges.length}. It won't give the answer away.`}
          onClick={onReveal}
        >
          {nextIsAnswer ? <Eye weight="duotone" size={14} /> : <Lightbulb weight="duotone" size={14} />}
          {level === 0 ? 'Stuck? Get a hint' : nextIsAnswer ? 'Still stuck? Show the answer' : 'Another hint'}
          <i>{Math.min(level + 1, total)}/{total}</i>
        </button>
      )}
    </div>
  );
}
