'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchEntry, SearchKind } from '@/lib/search-index';
import styles from '@/components/site-search.module.css';

/** how many rows a query may put on screen — the list scrolls past the first few */
const LIMIT = 30;
/** how many destinations the palette remembers between visits */
const RECENTS = 5;
const RECENTS_KEY = 'netflow-search-recents';

const KIND_LABEL: Record<SearchKind, string> = {
  protocol: 'Protocol',
  device: 'Device',
  cable: 'Cable',
  connector: 'Connector',
  lab: 'Lab',
  section: 'Section',
};

/* The order groups come in when a query matches several kinds at once.
   Protocols first because they are what most queries are reaching for; the
   section fronts last because they are the broadest answer to any question. */
const KIND_ORDER: SearchKind[] = ['protocol', 'lab', 'device', 'cable', 'connector', 'section'];

const KIND_PLURAL: Record<SearchKind, string> = {
  protocol: 'Protocols',
  device: 'Devices',
  cable: 'Cables',
  connector: 'Connectors',
  lab: 'Labs',
  section: 'Sections',
};

type Group = { label: string; entries: SearchEntry[] };

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

const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* The part of a row the query actually landed on, marked. Without it a reader
   scanning a dozen one-line details has to re-find their own words in each; with
   it, the reason a row is in the list is the first thing on it they see. */
function Marked({ text, words }: { text: string; words: string[] }) {
  const parts = useMemo(() => {
    if (!words.length) return [text];
    return text.split(new RegExp(`(${words.map(escapeRx).join('|')})`, 'ig'));
  }, [text, words]);

  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        // split() with one capture group alternates: text, match, text, match…
        i % 2 ? (
          <mark key={i} className={styles.mark}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/* Which key to print on the trigger. Read through useSyncExternalStore rather
   than an effect, because there is nothing to subscribe to and nothing to
   clean up: the server has no navigator, renders the "/" hint, and the client
   swaps in the one that platform was taught. */
const noSubscribe = () => () => {};
const readIsMac = () => /mac|iphone|ipad/i.test(navigator.userAgent);
const notMac = () => false;

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((h): h is string => typeof h === 'string') : [];
  } catch {
    // a locked-down browser denies storage, and the palette works without it
    return [];
  }
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
  const [kind, setKind] = useState<SearchKind | null>(null);
  const [cursor, setCursor] = useState(0);
  const [recentHrefs, setRecentHrefs] = useState<string[]>([]);
  const isMac = useSyncExternalStore(noSubscribe, readIsMac, notMac);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /* Keyboard moves the highlight and scrolls the list under a resting cursor,
     which fires mouseenter on whatever row slid beneath it. Only a pointer that
     has actually moved is allowed to take the selection back. */
  const pointerMoved = useRef(false);

  const byHref = useMemo(() => new Map(entries.map((e) => [e.href, e])), [entries]);
  const words = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query]);

  /* Scored once against everything, so the filter chips can say how many
     matches each kind holds before the reader has committed to one. */
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return entries
      .map((e) => ({ e, s: score(e, q, words) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.e);
  }, [entries, query, words]);

  const counts = useMemo(() => {
    const source = matches ?? entries;
    const out = {} as Record<SearchKind, number>;
    for (const k of KIND_ORDER) out[k] = 0;
    for (const e of source) out[e.kind] += 1;
    return out;
  }, [matches, entries]);

  const recents = useMemo(
    () => recentHrefs.map((h) => byHref.get(h)).filter((e): e is SearchEntry => Boolean(e)),
    [recentHrefs, byHref],
  );

  /* Three shapes of list, all handed back as labelled groups so the keyboard
     can walk one flat sequence through them:
       nothing typed          — where you have been, then where to start
       nothing typed + a kind — that whole shelf, browsable
       a query                — the matches, gathered under their kinds */
  const groups: Group[] = useMemo(() => {
    if (!matches) {
      if (kind) {
        return [{ label: KIND_PLURAL[kind], entries: entries.filter((e) => e.kind === kind) }];
      }
      const seen = new Set(recents.map((r) => r.href));
      const rest = defaults.filter((d) => !seen.has(d.href));
      return [
        ...(recents.length ? [{ label: 'Recently opened', entries: recents }] : []),
        ...(rest.length ? [{ label: 'Start here', entries: rest }] : []),
      ];
    }

    const shown = (kind ? matches.filter((e) => e.kind === kind) : matches).slice(0, LIMIT);
    return KIND_ORDER.map((k) => ({
      label: KIND_PLURAL[k],
      entries: shown.filter((e) => e.kind === k),
    })).filter((g) => g.entries.length);
  }, [matches, kind, entries, defaults, recents]);

  const flat = useMemo(() => groups.flatMap((g) => g.entries), [groups]);

  /* A query that shortens can leave the stored cursor past the end of the
     list, so the highlighted row is derived rather than stored — an effect
     that corrected it would first render a selection that is not there. */
  const active = flat.length ? Math.min(cursor, flat.length - 1) : 0;

  /* The remembered list is read on the way in rather than once at mount: it is
     written by every visit in every tab, and the palette should open showing
     where this reader has actually just been. */
  const openPalette = useCallback(() => {
    setRecentHrefs(readRecents());
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setKind(null);
    setCursor(0);
    triggerRef.current?.focus();
  }, []);

  const go = useCallback(
    (entry: SearchEntry | undefined) => {
      if (!entry) return;
      setRecentHrefs((prev) => {
        const next = [entry.href, ...prev.filter((h) => h !== entry.href)].slice(0, RECENTS);
        try {
          localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
        } catch {
          // storage denied — the list still holds for this visit
        }
        return next;
      });
      setOpen(false);
      setQuery('');
      setKind(null);
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
        !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openPalette();
        return;
      }
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openPalette]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /* The page behind a modal must not scroll under it. Taking the scrollbar away
     widens the page, so its width is paid back as padding, or everything under
     the palette shifts sideways as it opens. */
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [open]);

  // arrowing past the fold has to bring the row with it
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  /* The highlighted row is the one Enter will open, so it is the one worth
     having already fetched by the time Enter arrives. */
  useEffect(() => {
    const href = flat[active]?.href;
    if (open && href) router.prefetch(href);
  }, [open, flat, active, router]);

  const move = (delta: number) => {
    pointerMoved.current = false;
    setCursor(flat.length ? (active + delta + flat.length) % flat.length : 0);
  };

  /* Handled on the panel rather than on the field, so the keys still work with
     focus on a filter chip — the list is what the palette is for. */
  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    const onChip = (e.target as HTMLElement).tagName === 'BUTTON';

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Home' && !onChip) {
      e.preventDefault();
      setCursor(0);
    } else if (e.key === 'End' && !onChip) {
      e.preventDefault();
      setCursor(Math.max(flat.length - 1, 0));
    } else if (e.key === 'Enter' && !onChip) {
      e.preventDefault();
      go(flat[active]);
    } else if (e.key === 'Backspace' && !query && kind) {
      // an empty field with a filter still on: the filter is what backspace clears
      e.preventDefault();
      setKind(null);
    } else if (e.key === 'Tab') {
      // a modal keeps its own focus; Tab cycles the field and the chips
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled])');
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const pickKind = (k: SearchKind | null) => {
    setKind(k);
    setCursor(0);
    inputRef.current?.focus();
  };

  const total = flat.length;
  const typed = query.trim();

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        onClick={openPalette}
        aria-label="Search the site"
      >
        <svg className={styles.triggerIcon} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.4 10.4 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className={styles.triggerLabel}>Search</span>
        <span className={styles.triggerKey} aria-hidden="true">
          {isMac ? '⌘K' : '/'}
        </span>
      </button>

      {open && (
        <div className={styles.backdrop} onMouseDown={close}>
          <div
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onPanelKeyDown}
          >
            <div className={styles.fieldRow}>
              <svg className={styles.fieldIcon} viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12.8 12.8 18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>

              <input
                ref={inputRef}
                className={styles.field}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="site-search-results"
                aria-activedescendant={flat[active] ? `site-search-r${active}` : undefined}
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck={false}
                placeholder="Protocols, devices, cables, labs…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
              />

              {query && (
                <button
                  type="button"
                  className={styles.clear}
                  aria-label="Clear the search"
                  onClick={() => {
                    setQuery('');
                    setCursor(0);
                    inputRef.current?.focus();
                  }}
                >
                  &times;
                </button>
              )}
            </div>

            {/* the shelves, each carrying what it holds for the query as it stands */}
            <div className={styles.filters}>
              <button
                type="button"
                className={styles.filter}
                data-on={kind === null}
                aria-pressed={kind === null}
                onClick={() => pickKind(null)}
              >
                All
              </button>
              {KIND_ORDER.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={styles.filter}
                  data-on={kind === k}
                  aria-pressed={kind === k}
                  disabled={!counts[k]}
                  onClick={() => pickKind(kind === k ? null : k)}
                >
                  {KIND_PLURAL[k]}
                  <span className={styles.filterCount}>{counts[k]}</span>
                </button>
              ))}
            </div>

            <div
              className={styles.results}
              id="site-search-results"
              role="listbox"
              aria-label="Search results"
              ref={listRef}
              onPointerMove={() => {
                pointerMoved.current = true;
              }}
            >
              {groups.map((group) => (
                <div key={group.label} role="group" aria-label={group.label}>
                  <div className={styles.groupLabel} aria-hidden="true">
                    {group.label}
                  </div>
                  {group.entries.map((r) => {
                    const i = flat.indexOf(r);
                    return (
                      <div
                        key={r.href}
                        id={`site-search-r${i}`}
                        role="option"
                        aria-selected={i === active}
                        className={styles.result}
                        data-active={i === active}
                        data-index={i}
                        onMouseEnter={() => {
                          if (pointerMoved.current) setCursor(i);
                        }}
                        onClick={() => go(r)}
                      >
                        <span className={styles.resultTitle}>
                          <Marked text={r.title} words={words} />
                        </span>
                        <span className={styles.resultDetail}>
                          <Marked text={r.detail} words={words} />
                        </span>
                        <span className={styles.resultKind}>{KIND_LABEL[r.kind]}</span>
                        <span className={styles.resultGo} aria-hidden="true">
                          &crarr;
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}

              {!total && (
                <div className={styles.empty}>
                  <p className={styles.emptyLine}>
                    Nothing {kind ? `filed under ${KIND_PLURAL[kind].toLowerCase()} ` : ''}matches{' '}
                    <strong>{typed}</strong>.
                  </p>
                  {kind ? (
                    <button
                      type="button"
                      className={styles.emptyAction}
                      onClick={() => pickKind(null)}
                    >
                      Search everything instead
                    </button>
                  ) : (
                    <p className={styles.emptyHint}>
                      Try a name, a layer, or what the thing does — handshake, broadcast, routing.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <span className={styles.hint}>
                <kbd>&uarr;</kbd>
                <kbd>&darr;</kbd> move
              </span>
              <span className={styles.hint}>
                <kbd>Enter</kbd> open
              </span>
              <span className={styles.hint}>
                <kbd>Esc</kbd> close
              </span>
              <span className={styles.count} aria-hidden="true">
                {total ? `${total} result${total === 1 ? '' : 's'}` : ''}
              </span>
            </div>

            <div className={styles.srOnly} role="status" aria-live="polite">
              {typed ? `${total} result${total === 1 ? '' : 's'} for ${typed}` : ''}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
