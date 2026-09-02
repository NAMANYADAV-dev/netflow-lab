'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchEntry } from '@/lib/search-index';
import styles from '@/components/site-search.module.css';

const LIMIT = 8;

const KIND_LABEL: Record<SearchEntry['kind'], string> = {
  protocol: 'Protocol',
  device: 'Device',
  cable: 'Cable',
  connector: 'Connector',
  lab: 'Lab',
  section: 'Section',
};

/* How well one entry answers one query.

   Deliberately not a fuzzy matcher: the things being searched are short names a
   reader already knows the spelling of — ARP, RJ45, Layer 3 — and a fuzzy match
   over 90-odd of those puts "Presentation" above "SMTP" for "smt". Prefixes
   rank above contains, the title ranks above everything else it is filed under,
   and a shorter title wins a tie so that "IP" beats "IPsec" for "ip". */
function score(entry: SearchEntry, query: string, words: string[]): number {
  const title = entry.title.toLowerCase();
  const detail = entry.detail.toLowerCase();
  const alt = entry.alt.map((a) => a.toLowerCase());

  // every word has to land somewhere, or a two-word query matches half of it
  const hay = [title, detail, ...alt].join(' ');
  if (!words.every((w) => hay.includes(w))) return 0;

  let best = 0;
  if (title === query) best = 100;
  else if (title.startsWith(query)) best = 80;
  else if (title.includes(query)) best = 50;

  for (const a of alt) {
    if (a === query) best = Math.max(best, 70);
    else if (a.startsWith(query)) best = Math.max(best, 60);
    else if (a.includes(query)) best = Math.max(best, 30);
  }

  if (detail.includes(query)) best = Math.max(best, 25);
  if (best === 0) best = 10; // every word landed, just not contiguously

  return best - Math.min(title.length, 20) / 100;
}

export default function SiteSearch({
  entries,
  defaults,
}: {
  entries: SearchEntry[];
  defaults: SearchEntry[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return defaults;
    const words = q.split(/\s+/).filter(Boolean);
    return entries
      .map((e) => ({ e, s: score(e, q, words) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, LIMIT)
      .map((r) => r.e);
  }, [entries, defaults, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setCursor(0);
    triggerRef.current?.focus();
  }, []);

  const go = useCallback(
    (entry: SearchEntry | undefined) => {
      if (!entry) return;
      setOpen(false);
      setQuery('');
      setCursor(0);
      router.push(entry.href);
    },
    [router],
  );

  /* The whole-document shortcuts. "/" is the one a reference site is expected
     to answer to and Ctrl/Cmd-K is the one everything else has taught people,
     so both open it — but neither may steal a keystroke from someone who is
     typing into a field, including this one. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        !!el &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /* A query that shortens can leave the stored cursor past the end of the
     list, so the highlighted row is derived rather than stored — an effect
     that corrected it would first render a selection that is not there. */
  const active = results.length ? Math.min(cursor, results.length - 1) : 0;

  const onFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(results.length ? (active + 1) % results.length : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(results.length ? (active - 1 + results.length) % results.length : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label="Search the site"
      >
        <span className={styles.triggerLabel}>Search</span>
        <span className={styles.triggerKey} aria-hidden="true">/</span>
      </button>

      {open && (
        <div className={styles.backdrop} onMouseDown={close}>
          <div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              className={styles.field}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls="site-search-results"
              aria-activedescendant={results[active] ? `site-search-r${active}` : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
              placeholder="Protocols, devices, cables, labs…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={onFieldKeyDown}
            />

            <ul className={styles.results} id="site-search-results" role="listbox">
              {results.map((r, i) => (
                <li key={r.href} role="presentation">
                  <button
                    type="button"
                    id={`site-search-r${i}`}
                    role="option"
                    aria-selected={i === active}
                    className={styles.result}
                    data-active={i === active}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(r)}
                  >
                    <span className={styles.resultTitle}>{r.title}</span>
                    <span className={styles.resultDetail}>{r.detail}</span>
                    <span className={styles.resultKind}>{KIND_LABEL[r.kind]}</span>
                  </button>
                </li>
              ))}

              {!results.length && (
                <li className={styles.empty}>
                  Nothing here matches <strong>{query}</strong>.
                </li>
              )}
            </ul>

            <div className={styles.footer}>
              <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> move</span>
              <span><kbd>Enter</kbd> open</span>
              <span><kbd>Esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
