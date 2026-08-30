import { pageMeta } from '@/lib/seo';
import Link from 'next/link';
import ProtocolBench from '@/components/ProtocolBench';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { PlateLine, PlateNumber } from '@/components/PlateText';
import { protocolCount } from '@/lib/protocol-data';
import shell from '../shell.module.css';
import styles from './bench.module.css';

export const metadata = pageMeta({
  title: 'The Bench · NetFlow Lab',
  description:
    'Every protocol that carries the modern internet, indexed on one page. Drag or click any one onto the bench to see what it does, where it sits, and what it talks to.',
  path: '/bench',
});

export default function BenchPage() {
  return (
    <div className={shell.page}>
      {/* every other section names itself in the masthead; the bench was
          borrowing the homepage's line and reading like the front page */}
      <SiteHeader motto="The workbench" current="bench" />

      <main>
      <section className={`${shell.wrap} ${styles.hero}`}>
        <div>
          <div className={styles.kicker}>The networking edition</div>

          <h1 className={`cmyk-head ${styles.title}`}>
            <PlateLine text="Read the whole" />
            <PlateLine text="network stack." />
          </h1>

          <p className={styles.lede}>
            <em>From the frame on the wire to the token in a login</em> — every protocol that carries
            the modern internet, indexed on one page. Drag or click any one onto the bench to see what it
            does, where it sits, and what it talks to.
          </p>

          <div className={styles.ctaRow}>
            <Link className={`btn btn-primary ${styles.btn} ${styles.btnPrimary}`} href="#bench">
              Open the bench
            </Link>
            <Link className={`btn btn-secondary ${styles.btn}`} href="#index">
              Browse all {protocolCount}
            </Link>
          </div>
        </div>

        <div className={styles.count}>
          <div className={styles.countRow}>
            <PlateNumber value={String(protocolCount)} className={styles.countNum} />
          </div>
          <div className={styles.countLabel}>protocols · 11 protocol categories</div>
        </div>
      </section>

      <ProtocolBench />
      </main>

      <SiteFooter note="A learning instrument — ports and numbers are the common defaults, not the whole story." />
    </div>
  );
}
