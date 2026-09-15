'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, X } from '@phosphor-icons/react';
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

/* The first-run walkthrough.

   It shows the first step the reader has not done yet, lights that part of the
   page and dims the rest, and moves on when they actually do it — there is no
   "Next" to click through without reading. The dimming never takes a click:
   it only directs the eye, so nobody can get stuck behind it.

   `active` goes false the moment the lab starts running, which clears the
   whole thing out of the way of the animation.

   Every setState below happens inside a callback — an animation frame, a
   listener, a button — rather than in the body of an effect. */
export default function LabTour({ id, steps, active, force = false }: {
  /** remembered under this name, so a finished tour does not return */
  id: string;
  steps: TourStep[];
  active: boolean;
  /** opened from the lab's own button, whatever was remembered */
  force?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<Box | null>(null);

  const key = `netflow-tour-${id}`;
  const index = steps.findIndex((step) => !step.done);
  const step = index === -1 ? null : steps[index];
  const showing = open && active && step !== null;

  const remember = useCallback(() => {
    try {
      localStorage.setItem(key, 'seen');
    } catch {
      // a locked-down browser denies storage; the tour simply returns next time
    }
  }, [key]);

  const finish = useCallback(() => {
    setOpen(false);
    remember();
  }, [remember]);

  /* What the reader has already seen is read after mount, never during render:
     the server cannot know it, and a guess would mismatch on hydration. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (force) { setOpen(true); return; }
      try {
        setOpen(!localStorage.getItem(key));
      } catch {
        setOpen(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [key, force]);

  /* Every step done means the reader got there — nothing left to show, so just
     note it down. The render already stops on its own.

     `active` is deliberately not part of this: it goes false the instant the
     lab starts running, which is exactly when the last step completes, and
     waiting for it would mean a finished walkthrough was never remembered. */
  useEffect(() => {
    if (open && index === -1) remember();
  }, [open, index, remember]);

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
    if (!showing) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showing, finish]);

  if (!showing || !step || !box) return null;

  const pad = 8;
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad);
  const w = box.w + pad * 2;
  const h = box.h + pad * 2;

  /* Under the lit area when there is room, over it when there is not — and
     beside it when the target is so tall that neither fits, which is just what
     a whole panel is. Without that third case the card slides off the top of
     the screen and takes its Skip button with it. */
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

  return (
    <div className={styles.tour} aria-live="polite">
      {/* four panes around the lit area — no mask, and nothing at all over the
          thing itself, so every click still lands where the reader aims it */}
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
    </div>
  );
}
