'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Question as QuestionIcon, X } from '@phosphor-icons/react';
import styles from './lab-tour.module.css';

export type TourStep = {
  /** a selector for the thing to light up — use a data-tour attribute */
  target: string;
  title: string;
  text: string;
  /** true once the reader has done this step; the tour then moves on by itself */
  done: boolean;
};

type Box = { x: number; y: number; w: number; h: number };

/* The walkthrough that opens with the lab.

   It shows the first step the reader has not done yet, lights that part of the
   page and dims the rest, and moves on when they actually do it — there is no
   "Next" to click through without reading. The dimming never takes a click:
   it only directs the eye, so nobody can get stuck behind it.

   It runs every time the lab is opened. Nothing is remembered between visits,
   on purpose: a lab that walks one reader through and then silently drops the
   walkthrough for the next one is the thing that felt broken. Skip and Escape
   put it away for this visit only.

   `active` goes false the moment the lab starts running, which clears the
   whole thing out of the way of the animation.

   Every setState below happens inside a callback — an animation frame, a
   listener, a button — rather than in the body of an effect. */
export default function LabTour({ steps, active, question }: {
  steps: TourStep[];
  active: boolean;
  /** the challenge waiting at the end, carried up front so it can be watched for */
  question?: { label: string; text: string };
}) {
  const [open, setOpen] = useState(true);
  const [box, setBox] = useState<Box | null>(null);

  const index = steps.findIndex((step) => !step.done);
  const step = index === -1 ? null : steps[index];
  const visible = open && active;
  const showing = visible && step !== null;

  const finish = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const el = showing && step ? document.querySelector(step.target) : null;

    const measure = () => {
      if (!el) { setBox(null); return; }
      const rect = el.getBoundingClientRect();
      setBox({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
    };

    const frame = requestAnimationFrame(measure);
    if (!el) return () => cancelAnimationFrame(frame);

    el.scrollIntoView({ block: 'center' });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('scroll', measure, { capture: true, passive: true });
    window.addEventListener('resize', measure);
    /* the panel also moves when a coach mark appears above a field, which
       changes no size the observer can see — so the position is re-read on a
       slow timer as well */
    const timer = window.setInterval(measure, 300);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', measure, { capture: true });
      window.removeEventListener('resize', measure);
      window.clearInterval(timer);
    };
  }, [showing, step]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, finish]);

  if (!visible) return null;

  let spotlight = null;
  if (showing && step && box) {
    const pad = 8;
    const x = Math.max(0, box.x - pad);
    const y = Math.max(0, box.y - pad);
    const w = box.w + pad * 2;
    const h = box.h + pad * 2;

    /* Under the lit area when there is room, over it when there is not — and
       beside it when the target is so tall that neither fits, which is just
       what a whole panel is. Without that third case the card slides off the
       top of the screen and takes its Skip button with it. */
    const CARD = 190;
    const place = window.innerHeight - (y + h) >= CARD ? 'below' : y >= CARD ? 'above' : 'side';
    const flip = place === 'side' && x + w + 360 > window.innerWidth;

    const cardTop = place === 'below'
      ? y + h + 14
      : place === 'above'
        ? y - 14
        : Math.min(Math.max(y + h / 2 - 90, 12), Math.max(12, window.innerHeight - CARD));
    const cardLeft = place === 'side'
      ? (flip ? x - 16 : x + w + 16)
      : Math.min(Math.max(x + w / 2, 190), window.innerWidth - 190);

    spotlight = (
      <>
        {/* four panes around the lit area — no mask, and nothing at all over
            the thing itself, so every click still lands where it is aimed */}
        <div className={styles.shade} style={{ top: 0, left: 0, right: 0, height: y }} />
        <div className={styles.shade} style={{ top: y + h, left: 0, right: 0, bottom: 0 }} />
        <div className={styles.shade} style={{ top: y, left: 0, width: x, height: h }} />
        <div className={styles.shade} style={{ top: y, left: x + w, right: 0, height: h }} />
        <div className={styles.ring} style={{ top: y, left: x, width: w, height: h }} />

        <div
          className={styles.card}
          data-place={place}
          data-flip={flip}
          style={{ top: cardTop, left: cardLeft }}
          role="region"
          aria-label={`Step ${index + 1} of ${steps.length}`}
        >
          <div className={styles.cardHead}>
            <span className={styles.count}>Step {index + 1} of {steps.length}</span>
            <button type="button" className={styles.skip} onClick={finish} aria-label="Skip the walkthrough">
              <X weight="bold" size={13} /> Skip
            </button>
          </div>
          <strong className={styles.title}>{step.title}</strong>
          <p className={styles.text}>{step.text}</p>
          <div className={styles.doIt}>
            <ArrowRight weight="bold" size={13} /> do it here to carry on
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={styles.tour} aria-live="polite">
      {spotlight}

      {question && (
        <aside className={styles.question} aria-label={question.label}>
          <div className={styles.questionHead}>
            <QuestionIcon weight="duotone" size={15} />
            <span>{question.label}</span>
          </div>
          <p>{question.text}</p>
          <span className={styles.questionNote}>keep it in mind while the beats play</span>
        </aside>
      )}
    </div>
  );
}
