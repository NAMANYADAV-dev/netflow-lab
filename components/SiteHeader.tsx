import MastheadDate from '@/components/MastheadDate';
import SiteNav, { type LinuxMenuItem, type NavSection } from '@/components/SiteNav';
import { linuxGroupById, linuxHref, linuxMenu } from '@/lib/linux-data';
import { protocolPageSlugs } from '@/lib/protocol-pages';
import { searchDefaults, searchIndex } from '@/lib/search-index';
import styles from '@/app/shell.module.css';

const linuxMenuItems: LinuxMenuItem[] = linuxMenu.map((c) => ({
  href: linuxHref(c),
  cmd: c.cmd,
  group: linuxGroupById[c.group]?.name ?? '',
  fn: c.fn,
}));

/* Every page shares the slim editorial masthead and the application navbar. */
export default function SiteHeader({
  motto,
  current,
  dateline,
}: {
  /** the section line printed in the centre of the small masthead */
  motto: string;
  /** which nav entry to mark as the current page */
  current?: NavSection;
  /** overrides the live date for undated editions */
  dateline?: string;
}) {
  return (
    <>
      <header>
        <div className={styles.mastheadRule} />
        <div className={styles.mastheadBand}>
          <div className={`${styles.headerWrap} ${styles.mastheadBar}`}>
            <span>Vol. I · No. 46</span>
            <span className={styles.mastheadMotto}>{motto}</span>
            {dateline ? <span>{dateline}</span> : <MastheadDate />}
          </div>
        </div>
      </header>

      <div className={styles.navBand}>
        <div className={styles.headerWrap}>
          <SiteNav
            current={current}
            pageSlugs={protocolPageSlugs}
            linuxMenu={linuxMenuItems}
            searchEntries={searchIndex}
            searchDefaults={searchDefaults}
          />
        </div>
      </div>
    </>
  );
}
