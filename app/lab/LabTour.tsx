'use client';

import { useCallback, useEffect, useState } from 'react';
import { Question as QuestionIcon } from '@phosphor-icons/react';
import styles from './lab-tour.module.css';

export type TourStep = {
  /** what to light up — a selector; every match is lit as one area */
  target: string;
  /** true once the reader has done this step; the tour then moves on by itself */
  done: boolean;
};

type Box = { x: number; y: number; w: number; h: number };

/* The walkthrough that opens with the lab.

   It lights the one control the reader is meant to touch next and dims
   everything else, then moves on by itself when they touch it. There is no
   card and no Next: the lab already labels each step where it happens, and a
   second copy of that text in a floating box was just something else to read.
   There is no Skip either — the dimming takes no clicks, so it is a way of
   pointing rather than a gate, and it lifts on its own the moment the lab
   starts running.

   It runs every time the lab is opened. Nothing is remembered between visits,
   on purpose: a lab that walks one reader through and then silently drops the
   walkthrough for the next one is the thing that felt broken.

   Every setState below happens inside a callback — an animation frame, a
   listener — rather than in the body of an effect. */
export default function LabTour({ steps, active, question }: {
  steps: TourStep[];
  active: boolean;
  /** the challenge waiting at the end, carried up front so it can be watched for */
  question?: { label: string; text: string };
}) {
  const [open, setOpen] = useState(true);
  const [box, setBox] = useState<Box | null>(null);

  const index = steps.findIndex((step) => !step.done);
  const target = index === -1 ? null : steps[index].target;
  const visible = open && active;
  const showing = visible && target !== null;

  const finish = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const found = showing && target ? [...document.querySelectorAll(target)] : [];

    /* one area around everything the step names, so a field and the note
       above it are lit together rather than the note being dimmed out */
    const measure = () => {
      if (!found.length) { setBox(null); return; }
      let left = Infinity; let top = Infinity; let right = -Infinity; let bottom = -Infinity;
      for (const el of found) {
        const rect = el.getBoundingClientRect();
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }
      setBox({ x: left, y: top, w: right - left, h: bottom - top });
    };

    const frame = requestAnimationFrame(() => {
      measure();
      /* only scroll when the step is actually off screen — the builder moves
         the page a little of its own accord to keep a clicked control under
         the pointer, and two things scrolling at once reads as a lurch */
      const rect = found[0]?.getBoundingClientRect();
      if (rect && (rect.top < 8 || rect.bottom > window.innerHeight - 8)) {
        found[0].scrollIntoView({ block: 'center' });
      }
    });
    if (!found.length) return () => cancelAnimationFrame(frame);

    const observer = new ResizeObserver(measure);
    for (const el of found) observer.observe(el);
    window.addEventListener('scroll', measure, { capture: true, passive: true });
    window.addEventListener('resize', measure);
    /* the panel also shifts when a note appears above a field, which changes
       no size the observer can see — so the position is re-read on a slow
       timer as well */
    const timer = window.setInterval(measure, 250);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', measure, { capture: true });
      window.removeEventListener('resize', measure);
      window.clearInterval(timer);
    };
  }, [showing, target]);

  /* no button offers this, but a reader who wants the page plain should not
     have to finish the lab to get it */
  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, finish]);

  if (!visible) return null;

  let spotlight = null;
  if (showing && box) {
    const pad = 8;
    const x = Math.max(0, box.x - pad);
    const y = Math.max(0, box.y - pad);
    const w = box.w + pad * 2;
    const h = box.h + pad * 2;

    spotlight = (
      <>
        {/* four panes around the lit area — no mask, and nothing at all over
            the thing itself, so every click still lands where it is aimed */}
        <div className={styles.shade} style={{ top: 0, left: 0, right: 0, height: y }} />
        <div className={styles.shade} style={{ top: y + h, left: 0, right: 0, bottom: 0 }} />
        <div className={styles.shade} style={{ top: y, left: 0, width: x, height: h }} />
        <div className={styles.shade} style={{ top: y, left: x + w, right: 0, height: h }} />
        <div
          className={styles.ring}
          style={{ top: y, left: x, width: w, height: h }}
          role="presentation"
          aria-label={`Step ${index + 1} of ${steps.length}`}
        />
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
