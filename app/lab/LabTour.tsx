'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Question as QuestionIcon } from '@phosphor-icons/react';
import styles from './lab-tour.module.css';

export type TourStep = {
  /** what to light up — a selector; every match is lit as one area */
  target: string;
  /** true once the reader has done this step; the tour then moves on by itself */
  done: boolean;
  /** which accent to ring it in, so the light matches the step's own mark */
  tone?: 'a' | 'b' | 'ok' | 'rst';
};

type Vars = CSSProperties & Record<`--${string}`, string>;
/** the lit area and the page it sits on, both in page coordinates */
type Box = { x: number; y: number; w: number; h: number; pw: number; ph: number };

/* The walkthrough that opens with the lab.

   It lights the one control the reader is meant to touch next and dims
   everything else, then moves on by itself when they touch it. There is no
   card and no Next: the lab already labels each step where it happens, and a
   second copy of that text in a floating box was just something else to read.
   There is no Skip either — the dimming takes no clicks, so it is a way of
   pointing rather than a gate, and it lifts on its own the moment the lab
   starts running.

   The light is drawn in page coordinates, in a portal on the body, so it is
   part of the page and scrolls with it. Measuring it against the viewport
   instead means re-placing it on every scroll event, always a frame late —
   which is exactly how a highlight ends up sliding around behind the thing it
   is supposed to be stuck to.

   It runs every time the lab is opened. Nothing is remembered between visits,
   on purpose: a lab that walks one reader through and then silently drops the
   walkthrough for the next one is the thing that felt broken.

   Every setState below happens inside a callback — an animation frame, a
   listener — rather than in the body of an effect. */
export default function LabTour({ steps, active, question, at }: {
  steps: TourStep[];
  active: boolean;
  /** the challenge waiting at the end, carried up front so it can be watched for */
  question?: { label: string; text: string };
  /** a step to light instead of the next unfinished one — for a lab that lets
      the reader go back and put an earlier answer right */
  at?: number | null;
}) {
  const [open, setOpen] = useState(true);
  const [box, setBox] = useState<Box | null>(null);
  const [ink, setInk] = useState<string | null>(null);
  const shown = useRef<Box | null>(null);
  const inked = useRef<string | null>(null);

  const asked = at != null && at >= 0 && at < steps.length ? at : null;
  const index = asked ?? steps.findIndex((step) => !step.done);
  const current = index === -1 ? null : steps[index];
  const target = current?.target ?? null;
  const tone = current?.tone ?? 'a';
  const visible = open && active;
  const showing = visible && target !== null;

  const finish = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const found = showing && target ? [...document.querySelectorAll(target)] : [];

    /* the timer below re-reads the position several times a second; without
       this the identical result would still be a new object, and the whole
       lab would re-render four times a second for nothing */
    const settle = (next: Box | null) => {
      const was = shown.current;
      if (next && was && (Object.keys(next) as (keyof Box)[]).every((k) => Math.abs(next[k] - was[k]) < 0.5)) return;
      if (!next && !was) return;
      shown.current = next;
      setBox(next);
    };

    /* one area around everything the step names, so a field and the note
       above it are lit together rather than the note being dimmed out */
    const measure = () => {
      if (!found.length) { settle(null); return; }
      let left = Infinity; let top = Infinity; let right = -Infinity; let bottom = -Infinity;
      for (const el of found) {
        const rect = el.getBoundingClientRect();
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }
      /* The light is drawn on the body, where the lab's own tokens do not
         reach, so the accent is read off the lit element itself and handed
         over as a plain colour. Passing var(--a) across would simply resolve
         to nothing and leave the ring the colour of body text. */
      const paint = getComputedStyle(found[0]).getPropertyValue(`--${tone}`).trim();
      if (paint && paint !== inked.current) { inked.current = paint; setInk(paint); }

      const page = document.documentElement;
      settle({
        x: left + window.scrollX,
        y: top + window.scrollY,
        w: right - left,
        h: bottom - top,
        pw: Math.max(page.scrollWidth, page.clientWidth),
        ph: Math.max(page.scrollHeight, page.clientHeight),
      });
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

    /* no scroll listener: the light is part of the page and travels with it.
       What can still move it is the page changing shape underneath. */
    const observer = new ResizeObserver(measure);
    for (const el of found) observer.observe(el);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    /* a note appearing above a field shifts the panel without changing any
       size the observer watches, so the position is re-read on a slow timer */
    const timer = window.setInterval(measure, 250);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.clearInterval(timer);
    };
  }, [showing, target, tone]);

  /* no button offers this, but a reader who wants the page plain should not
     have to finish the lab to get it */
  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, finish]);

  if (!visible) return null;

  const pad = 8;
  const light = showing && box
    ? {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      w: box.w + pad * 2,
      h: box.h + pad * 2,
      pw: box.pw,
      ph: box.ph,
    }
    : null;

  return (
    <>
      {light && createPortal(
        <div
          className={styles.tour}
          style={{ width: light.pw, height: light.ph, '--tour-tone': ink ?? '#9a5f02' } as Vars}
          aria-hidden="true"
        >
          {/* four panes around the lit area — no mask, and nothing at all over
              the thing itself, so every click still lands where it is aimed */}
          <div className={styles.shade} style={{ top: 0, left: 0, width: light.pw, height: light.y }} />
          <div className={styles.shade} style={{ top: light.y + light.h, left: 0, width: light.pw, height: Math.max(0, light.ph - light.y - light.h) }} />
          <div className={styles.shade} style={{ top: light.y, left: 0, width: light.x, height: light.h }} />
          <div className={styles.shade} style={{ top: light.y, left: light.x + light.w, width: Math.max(0, light.pw - light.x - light.w), height: light.h }} />
          <div className={styles.ring} style={{ top: light.y, left: light.x, width: light.w, height: light.h }} />
        </div>,
        document.body,
      )}

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
    </>
  );
}
