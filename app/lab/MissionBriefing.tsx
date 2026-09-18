'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowRight, Question as QuestionIcon, Skull, Target } from '@phosphor-icons/react';
import styles from './mission-briefing.module.css';

/* The popup that opens with a lab, before anything else happens.

   It puts the mission and the questions waiting at the end in front of the
   reader first, so they know what they are looking for while they work —
   rather than meeting the question cold once the beats have already played.
   The walkthrough only starts once this is closed.

   It is rendered inside the lab's own <main>, so the lab's colour tokens
   reach it without being passed across. */
export default function MissionBriefing({ open, onStart, tone = 'a', tag, mission, questions }: {
  open: boolean;
  onStart: () => void;
  tone?: 'a' | 'rst';
  /** the chip above the mission — "Mission", "Threat" */
  tag: string;
  mission: ReactNode;
  questions: string[];
}) {
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    startRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onStart(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onStart]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} data-tone={tone}>
      <div className={styles.card} role="dialog" aria-modal="true" aria-labelledby="mission-briefing-title">
        <div className={styles.tag}>
          {tone === 'rst' ? <Skull weight="fill" size={13} /> : <Target weight="bold" size={13} />}
          {tag}
        </div>
        <h2 id="mission-briefing-title" className={styles.mission}>{mission}</h2>

        <div className={styles.questions}>
          <div className={styles.questionsHead}>
            <QuestionIcon weight="duotone" size={15} />
            {questions.length === 1 ? 'Question you will answer' : 'Questions you will answer'}
          </div>
          <ol>
            {questions.map((question) => <li key={question}>{question}</li>)}
          </ol>
          <p className={styles.note}>Read it now and keep it in mind — the answer is in what you are about to watch.</p>
        </div>

        <button ref={startRef} type="button" className={styles.start} onClick={onStart}>
          Got it, start the lab <ArrowRight weight="bold" size={15} />
        </button>
      </div>
    </div>
  );
}
