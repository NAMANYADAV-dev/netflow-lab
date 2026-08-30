'use client';

import { useSyncExternalStore } from 'react';

const format = (d: Date) =>
  d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

/* The masthead's dateline — a value that is legitimately different on the
   server and in the browser, which is exactly what useSyncExternalStore's
   two-snapshot form is for.

   The server snapshot is stamped whenever the page was rendered, so the slot is
   never empty and the bar does not jump; the client snapshot is the reader's
   actual date, and React swaps to it after hydration without a mismatch. Both
   are computed once at module scope: a snapshot getter has to return a stable
   value or it re-renders forever. Nothing here ever changes again, so the store
   has no subscribers to notify. */
const serverToday = format(new Date());
const clientToday = format(new Date());
const noSubscribe = () => () => {};

export default function MastheadDate() {
  const today = useSyncExternalStore(
    noSubscribe,
    () => clientToday,
    () => serverToday,
  );

  return <span>{today}</span>;
}
