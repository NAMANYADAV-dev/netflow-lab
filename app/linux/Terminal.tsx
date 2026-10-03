import type { LinuxCommand } from '@/lib/linux-data';
import styles from './terminal.module.css';

/* The one dark thing on a paper site: a captured session, set as a terminal.

   It is a specimen, not an emulator — nothing here runs. The prompt line is
   what was typed, the rows under it are what came back, and a row worth
   reading carries a number in the gutter that the notes below the panel
   answer. The gutter stays put while a long line scrolls sideways, so the
   number never leaves the row it belongs to. */
export default function Terminal({
  session,
  pkg,
}: {
  session: LinuxCommand['session'];
  pkg: string;
}) {
  return (
    <figure className={styles.wrap}>
      <div className={styles.term}>
        <div className={styles.bar}>
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.barTitle}>
            {session.prompt === '#' ? 'root@netflow' : 'user@netflow'} — bash
          </span>
          <span className={styles.barPkg}>{pkg}</span>
        </div>

        {/* focusable so a keyboard reader can scroll the long rows */}
        <div className={styles.body} tabIndex={0} role="group" aria-label="Terminal session">
          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.gutter} />
              <span className={styles.line}>
                <span className={session.prompt === '#' ? styles.promptRoot : styles.prompt}>
                  {session.prompt}
                </span>{' '}
                <span className={styles.typed}>{session.run}</span>
              </span>
            </div>

            {session.lines.map((line, i) => (
              <div className={line.n ? `${styles.row} ${styles.rowNoted}` : styles.row} key={i}>
                <span className={styles.gutter}>
                  {line.n && (
                    <span className={styles.mark} aria-label={`Note ${line.n}`}>
                      {line.n}
                    </span>
                  )}
                </span>
                <span className={styles.line}>{line.text || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>
        Illustrative session · every address is from a documentation or private range
      </figcaption>
    </figure>
  );
}
