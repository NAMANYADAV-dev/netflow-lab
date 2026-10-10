'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowsClockwise, Brain, CheckCircle, Eye, Target, TerminalWindow, Trophy, XCircle } from '@phosphor-icons/react';
import { labExtras, nextLab } from './lab-extras';
import { markLabDone } from './lab-progress';
import styles from './lab-mission.module.css';

/* The mission kit for the step-through labs.

   Every lab here plays an exchange one step at a time. The kit adds three
   things around that, all driven by one data object per scenario:

   - the briefing popup (MissionBriefing), which opens with the lab and again
     for each scenario, so the questions are read before anything plays;
   - a "think first" prompt under the step button, which asks what the next
     step will be before the reader clicks, with the answer one click away;
   - the mission check at the end, where the briefing's questions come back
     as multiple choice and each one explains itself once it is answered;
   - what to do after that (AfterLab): run the lab's other scenario, try the
     same exchange with a real command, and move on to the next lab.

   Each scenario gets its own mission, prompts and questions, because the same
   lab behaves differently in each: a warm cache skips the tree, active FTP
   dies at the router, a lossy wire drops a datagram. */

export type MissionCheckItem = {
  q: string;
  options: string[];
  /** index into options */
  correct: number;
  /** shown once the right answer is picked: why it is right */
  why: string;
};

export type ScenarioMission = {
  mission: ReactNode;
  /** one prompt per step, asked before that step is played */
  nudges: string[];
  checks: MissionCheckItem[];
};

/** a lab's second story: what to call it, and how to switch to it */
export type OtherScenario = { label: string; onPick: () => void };

/** Whether the briefing is open. It opens for every scenario the reader has
    not yet dismissed it for, so switching scenario brings it back. */
export function useLabMission<S extends string>(scenario: S) {
  const [dismissed, setDismissed] = useState<S | null>(null);
  const closeBriefing = useCallback(() => setDismissed(scenario), [scenario]);
  const openBriefing = useCallback(() => setDismissed(null), []);
  return { briefingOpen: dismissed !== scenario, closeBriefing, openBriefing };
}

/** the small button in the mission bar that brings the briefing back */
export function BriefingButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.briefingButton} onClick={onClick}
      data-hint="Click to read the mission and its questions again.">
      <Target weight="bold" size={14} /> Mission brief
    </button>
  );
}

/** Sits under the lab's step button: a prompt before each step, then the
    mission check once the last step has played. Give it key={scenario} so a
    new scenario starts with a clean check. */
export default function MissionPanel({ mission, step, total, next, another }: {
  mission: ScenarioMission;
  step: number;
  total: number;
  /** what the next step turns out to be — the answer to the prompt */
  next?: string;
  /** the lab's other scenario, offered once this one has been played */
  another?: OtherScenario;
}) {
  if (step >= total) {
    return (
      <>
        <MissionCheck checks={mission.checks} />
        <AfterLab another={another} />
      </>
    );
  }
  const nudge = mission.nudges[step];
  if (!nudge || !next) return null;
  // keyed by step, so each prompt starts with its answer hidden
  return <ThinkFirst key={step} nudge={nudge} next={next} step={step} total={total} />;
}

function ThinkFirst({ nudge, next, step, total }: { nudge: string; next: string; step: number; total: number }) {
  const [shown, setShown] = useState(false);
  return (
    <div className={styles.think}>
      <div className={styles.thinkHead}>
        <Brain weight="duotone" size={15} />
        Think first · step {step + 1} of {total}
      </div>
      <p className={styles.thinkText}>{nudge}</p>
      {shown ? (
        <p className={styles.thinkAnswer} aria-live="polite">
          <b>What happens</b>
          {next}
        </p>
      ) : (
        <button type="button" className={styles.thinkReveal} onClick={() => setShown(true)}
          data-hint="Click to see the answer. Try to guess first, then press the step button.">
          <Eye weight="duotone" size={14} /> Hint: show what happens
        </button>
      )}
    </div>
  );
}

function MissionCheck({ checks }: { checks: MissionCheckItem[] }) {
  /* every option the reader has tried, per question, in order — the first
     one decides whether it counts as right first time */
  const [tries, setTries] = useState<number[][]>(() => checks.map(() => []));

  const pick = (qi: number, oi: number) => setTries((all) => all.map((list, i) =>
    i === qi && !list.includes(oi) && !list.includes(checks[qi].correct) ? [...list, oi] : list));

  const solved = tries.map((list, i) => list.includes(checks[i].correct));
  const allSolved = solved.every(Boolean);

  /* answering every question is what finishing a lab means here, so that is
     the moment it earns its tick on the labs page */
  const pathname = usePathname();
  useEffect(() => {
    if (allSolved) markLabDone(pathname);
  }, [allSolved, pathname]);
  const firstTime = tries.filter((list, i) => list[0] === checks[i].correct).length;

  return (
    <section className={styles.check} aria-label="Mission check">
      <div className={styles.checkHead}>
        <Target weight="bold" size={14} />
        Mission check · the briefing questions
      </div>

      {checks.map((item, qi) => (
        <div key={item.q} className={styles.question}>
          <p className={styles.questionText}><b>{qi + 1}.</b> {item.q}</p>
          <div className={styles.options}>
            {item.options.map((option, oi) => {
              const tried = tries[qi].includes(oi);
              const state = tried ? (oi === item.correct ? 'correct' : 'wrong') : undefined;
              return (
                <button key={option} type="button" data-state={state}
                  disabled={solved[qi] || tried}
                  onClick={() => pick(qi, oi)}>
                  {state === 'correct' && <CheckCircle weight="fill" size={15} />}
                  {state === 'wrong' && <XCircle weight="fill" size={15} />}
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
          {solved[qi]
            ? <p className={styles.why}>{item.why}</p>
            : tries[qi].length > 0 && <p className={styles.retry}>Not quite. Think back to what you just watched and try another.</p>}
        </div>
      ))}

      {allSolved && (
        <div className={styles.score} data-perfect={firstTime === checks.length}>
          <Trophy weight="duotone" size={18} />
          <span>
            {firstTime === checks.length
              ? `Mission complete: ${firstTime}/${checks.length} right first time.`
              : `Mission complete: ${firstTime}/${checks.length} right first time. Reset and run it again to lock it in.`}
          </span>
          <button type="button" onClick={() => setTries(checks.map(() => []))}>Try again</button>
        </div>
      )}
    </section>
  );
}

/* Where a finished lab points next. A run that simply stops leaves a newcomer
   at a dead end, so three ways on are laid out in the order they are worth
   taking: the lab's other story while this one is fresh, the same exchange on
   a real machine, then the next lab. Exported for the ARP lab, which runs its
   own challenge rather than the mission check. */
export function AfterLab({ another }: { another?: OtherScenario }) {
  const pathname = usePathname();
  const extras = labExtras[pathname];
  const next = nextLab(pathname);

  return (
    <section className={styles.after} aria-label="What to do next">
      {another && (
        <div className={styles.afterBlock}>
          <div className={styles.afterHead}><ArrowsClockwise weight="bold" size={14} /> Now try the other story</div>
          <button type="button" className={styles.afterAction} onClick={another.onPick}
            data-hint="Click to run this lab again under the other conditions.">
            Run it as “{another.label}” <ArrowRight weight="bold" size={13} />
          </button>
        </div>
      )}

      {extras && (
        <div className={styles.afterBlock}>
          <div className={styles.afterHead}><TerminalWindow weight="bold" size={14} /> {extras.real.length ? 'See it for real' : 'In a real capture'}</div>
          {extras.real.map((item) => (
            <div className={styles.real} key={item.cmd}>
              <code>{item.cmd}</code>
              <p>
                {item.does}
                {item.slug && <> <Link href={`/linux/${item.slug}`}>Read its output &rarr;</Link></>}
              </p>
            </div>
          ))}
          <p className={extras.real.length ? styles.filter : styles.filterAlone}>
            In Wireshark, the display filter <code>{extras.filter}</code> shows only this exchange.
          </p>
        </div>
      )}

      <div className={styles.afterNav}>
        {next && (
          <Link href={next.href} className={styles.afterNext}>
            Next lab: {next.abbr} <ArrowRight weight="bold" size={14} />
          </Link>
        )}
        <Link href="/lab#labs" className={styles.afterAll}>All labs</Link>
      </div>
    </section>
  );
}
