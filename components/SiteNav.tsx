'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BENCH_HREF,
  CABLES_HREF,
  DEVICES_HREF,
  LABS_HREF,
  STACK_HREF,
  menuProtos,
} from '@/lib/atlas-data';
import { cableHref, cableMenu } from '@/lib/cable-data';
import { deviceHref, deviceMenu } from '@/lib/device-data';
import { protocolById, protocolHref, protocolSlug } from '@/lib/protocol-data';
import NetFlowMark from '@/components/NetFlowMark';
import SiteSearch from '@/components/SiteSearch';
import type { SearchEntry } from '@/lib/search-index';
import styles from '@/app/shell.module.css';

type MenuName = 'protocols' | 'devices' | 'cables';

/** the nav entries a page can claim as its own */
export type NavSection = MenuName | 'home' | 'stack' | 'bench' | 'labs';

/* Every catalogued protocol has a page; a chip for one that somehow doesn't
   falls back to the Bench rather than to a 404. */
function protocolPageHref(id: string, pages: Set<string>) {
  const p = protocolById[id];
  return p && pages.has(protocolSlug(p)) ? protocolHref(p) : BENCH_HREF;
}

/** the payload the Bench reads off a dropped chip */
const startDrag = (id: string) => (e: React.DragEvent) => {
  try {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'copy';
  } catch {
    // some browsers lock dataTransfer outside a real drag — the link still works
  }
};

export default function SiteNav({
  current,
  pageSlugs,
  searchEntries,
  searchDefaults,
}: {
  current?: NavSection;
  /** the protocol slugs that have a page, handed down by the server header */
  pageSlugs: string[];
  /** everything the palette can reach, built on the server */
  searchEntries: SearchEntry[];
  /** what the palette offers before anything is typed */
  searchDefaults: SearchEntry[];
}) {
  const pages = useMemo(() => new Set(pageSlugs), [pageSlugs]);
  const [open, setOpen] = useState<MenuName | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const toggleTheme = () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    try {
      localStorage.setItem('netflow-theme', nextTheme);
    } catch {
      // A locked-down browser can deny storage; the theme still changes now.
    }
  };

  const show = (name: MenuName) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(name);
  };

  /* a grace period on leave, so crossing the gap between the trigger and the
     panel does not snap the menu shut under the cursor */
  const scheduleHide = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 180);
  };

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // the menus open on hover, so they also need the two ways out a hover has not:
  // Escape, and a click anywhere else
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  /* the design system paints aria-current='page' the same as a hovered link, so
     this is the only thing a page needs to claim its own nav entry */
  const mark = (section: NavSection) => (current === section ? ('page' as const) : undefined);

  return (
    <nav className={`nav ${styles.nav}`} ref={navRef}>
      <Link href="/" className={`nav-brand ${styles.brand}`}>
        <NetFlowMark className={styles.brandMark} />
        <span>NetFlow&nbsp;Lab</span>
      </Link>

      <Link href="/" aria-current={mark('home')}>
        Home
      </Link>

      <Link href={STACK_HREF} aria-current={mark('stack')}>
        The stack
      </Link>

      <div
        className={styles.menuHost}
        onMouseEnter={() => show('protocols')}
        onMouseLeave={scheduleHide}
      >
        <Link
          href={BENCH_HREF}
          className={styles.menuTrigger}
          aria-haspopup="true"
          aria-expanded={open === 'protocols'}
          aria-current={mark('protocols')}
          onClick={(e) => {
            e.preventDefault();
            show('protocols');
          }}
          onFocus={() => show('protocols')}
        >
          Protocols <span className={styles.caret}>&#9662;</span>
        </Link>

        <div className={styles.menu} hidden={open !== 'protocols'}>
          <div className={styles.menuHint}>Drag one out — or click to open its page</div>
          <div className={styles.menuGrid4}>
            {menuProtos.map((m) => (
              <Link
                key={m.id}
                href={protocolPageHref(m.id, pages)}
                draggable
                onDragStart={startDrag(m.id)}
                title={m.name}
                className={styles.chip}
              >
                <span className={styles.chipAbbr}>{m.abbr}</span>
                <span className={styles.chipName}>{m.name}</span>
              </Link>
            ))}
          </div>
          <Link href={BENCH_HREF} className={styles.menuMore}>
            See all 48 protocols &rarr;
          </Link>
        </div>
      </div>

      <div
        className={styles.menuHost}
        onMouseEnter={() => show('devices')}
        onMouseLeave={scheduleHide}
      >
        <Link
          href={DEVICES_HREF}
          className={styles.menuTrigger}
          aria-haspopup="true"
          aria-expanded={open === 'devices'}
          aria-current={mark('devices')}
          onClick={(e) => {
            e.preventDefault();
            show('devices');
          }}
          onFocus={() => show('devices')}
        >
          Devices <span className={styles.caret}>&#9662;</span>
        </Link>

        <div className={`${styles.menu} ${styles.menuRight}`} hidden={open !== 'devices'}>
          <div className={styles.menuHint}>Drag one out — or click to open its page</div>
          <div className={styles.menuGrid3}>
            {deviceMenu.map((d) => (
              <Link
                key={d.id}
                href={deviceHref(d)}
                draggable
                /* the id, not the label — the Devices page's bench looks the
                   dropped payload up by id */
                onDragStart={startDrag(d.id)}
                title={d.fn}
                className={styles.chip}
              >
                <span className={styles.chipDevice}>{d.abbr}</span>
                <span className={styles.chipLayer}>{d.layer}</span>
              </Link>
            ))}
          </div>
          <Link href={DEVICES_HREF} className={styles.menuMore}>
            See all devices &rarr;
          </Link>
        </div>
      </div>

      <div
        className={styles.menuHost}
        onMouseEnter={() => show('cables')}
        onMouseLeave={scheduleHide}
      >
        <Link
          href={CABLES_HREF}
          className={styles.menuTrigger}
          aria-haspopup="true"
          aria-expanded={open === 'cables'}
          aria-current={mark('cables')}
          onClick={(e) => {
            e.preventDefault();
            show('cables');
          }}
          onFocus={() => show('cables')}
        >
          Cables <span className={styles.caret}>&#9662;</span>
        </Link>

        <div
          className={`${styles.menu} ${styles.menuRight} ${styles.cableMenu}`}
          hidden={open !== 'cables'}
        >
          <div className={styles.menuHint}>Two physical media — open the full field guide</div>
          <div className={styles.menuGrid2}>
            {cableMenu.map((c) => (
              <Link
                key={c.slug}
                href={cableHref(c)}
                title={c.fn}
                className={styles.chip}
              >
                <span className={styles.chipDevice}>{c.shortName}</span>
                <span className={styles.chipLayer}>{c.spec}</span>
              </Link>
            ))}
          </div>
          <Link href={CABLES_HREF} className={styles.menuMore}>
            See all cables &rarr;
          </Link>
        </div>
      </div>

      <Link href={BENCH_HREF} aria-current={mark('bench')}>
        The Bench
      </Link>
      <SiteSearch entries={searchEntries} defaults={searchDefaults} />

      <button
        type="button"
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label="Toggle color theme"
        title="Toggle color theme"
      >
        <span className={`${styles.themeIcon} ${styles.themeMoon}`} aria-hidden="true">
          {'\u263E'}
        </span>
        <span className={`${styles.themeIcon} ${styles.themeSun}`} aria-hidden="true">
          {'\u2600'}
        </span>
      </button>
      <Link
        className={`btn btn-primary ${styles.navCta}`}
        href={LABS_HREF}
        aria-current={mark('labs')}
      >
        Explore labs
      </Link>
    </nav>
  );
}
