import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { type NavSection } from '@/components/SiteNav';
import shell from '@/app/shell.module.css';
import styles from './coming-soon.module.css';

/* Placeholder for the pages the Atlas links out to but that are not built yet.
   Keeps the chrome and measure of the real pages, so the links land somewhere
   that belongs to the same publication. */
export default function ComingSoon({
  title,
  note,
  current,
}: {
  title: string;
  note: string;
  current?: NavSection;
}) {
  return (
    <div className={shell.page}>
      <SiteHeader motto="A field guide to the wire" current={current} dateline="In press" />

      <section className={`${shell.wrap} ${shell.section} ${styles.body}`}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.note}>{note}</p>
        <Link className={`btn btn-secondary ${shell.btnLg}`} href="/">
          &larr; Back to the Atlas
        </Link>
      </section>

      <SiteFooter note="In press — this section is still being set." />
    </div>
  );
}
