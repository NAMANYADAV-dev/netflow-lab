'use client';

import Link from 'next/link';
import { ShieldCheck } from '@phosphor-icons/react';
import styles from './lab.module.css';

/* Two headers in one, because the design draws them differently: the labs index
   gets the section nav and a Browse-labs call to action, while a lab itself
   drops both — inside a lab the crumb back to the index is the only navigation
   that matters, and the chrome should not compete with the workspace. */
export default function LabsHeader({ activeLab }: { activeLab?: string }) {
  const toggleTheme = () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    try {
      localStorage.setItem('netflow-theme', nextTheme);
    } catch {
      // The visual state still changes when storage is unavailable.
    }
  };

  return (
    <header className={styles.labHeader}>
      <Link href="/" className={styles.labHeaderBrand}>
        <svg viewBox="0 0 26 26" aria-hidden="true">
          <rect x="1" y="1" width="24" height="24" rx="4" className={styles.labMarkTile} />
          <line x1="8" y1="18" x2="18" y2="8" className={styles.labMarkLine} />
          <circle cx="8" cy="18" r="3.2" className={styles.labMarkCircle} />
          <rect x="14.8" y="4.8" width="6" height="6" rx="1" className={styles.labMarkSquare} />
        </svg>
        <span>NetFlow&nbsp;Lab</span>
      </Link>

      <span className={styles.labHeaderSlash}>/</span>

      {activeLab ? (
        <>
          <Link href="/lab" className={styles.labHeaderCrumb}>Protocol Labs</Link>
          <span className={styles.labHeaderSlash}>/</span>
          <strong className={styles.labHeaderTitle}>{activeLab}</strong>
        </>
      ) : (
        <>
          <strong className={styles.labHeaderTitle}>Protocol Labs</strong>
          <nav className={styles.labHeaderNav} aria-label="Protocol Labs">
            <Link href="/lab#labs">the labs</Link>
            <Link href="/lab#loop">how it works</Link>
            <Link href="/bench">read the docs</Link>
          </nav>
        </>
      )}

      <span className={styles.labHeaderSpacer} />

      <div className={styles.simulatedBadge} title="This page uses an educational simulation">
        <ShieldCheck weight="duotone" size={15} />
        <strong>Simulated</strong>
      </div>

      <button
        type="button"
        className={styles.labThemeToggle}
        onClick={toggleTheme}
        aria-label="Toggle color theme"
        title="Toggle color theme"
      >
        <span className={styles.labThemeMoon} aria-hidden="true">☾</span>
        <span className={styles.labThemeSun} aria-hidden="true">☀</span>
      </button>

      {!activeLab && (
        <Link href="/lab#labs" className={styles.browseLabsButton}>
          Browse labs &rarr;
        </Link>
      )}
    </header>
  );
}
