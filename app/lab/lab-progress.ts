'use client';

import { useSyncExternalStore } from 'react';

/* Which labs this reader has finished.

   Kept in the browser and nowhere else — the site has no accounts and wants
   none — so it is a convenience, not a record: a different browser starts
   clean. Everything here works with storage denied; the ticks simply do not
   appear. */

const KEY = 'netflow-labs-done';
const CHANGED = 'netflow-labs-done-changed';
const NONE: string[] = [];

/* useSyncExternalStore compares snapshots by identity, so the parsed list is
   kept and handed back unchanged until the stored string itself changes */
let cachedRaw: string | null = null;
let cachedList: string[] = NONE;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedList;
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cachedRaw = raw;
    cachedList = Array.isArray(parsed) ? parsed.filter((h): h is string => typeof h === 'string') : NONE;
    return cachedList;
  } catch {
    return NONE;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGED, onChange);
  };
}

/** record a lab as finished; safe to call more than once */
export function markLabDone(href: string) {
  try {
    const done = read();
    if (done.includes(href)) return;
    localStorage.setItem(KEY, JSON.stringify([...done, href]));
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    // storage denied — nothing to remember, nothing to break
  }
}

/** the paths of the labs finished in this browser; empty on the server */
export function useLabsDone(): string[] {
  return useSyncExternalStore(subscribe, read, () => NONE);
}
