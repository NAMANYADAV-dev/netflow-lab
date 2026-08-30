import Link from 'next/link';
import NetFlowMark from '@/components/NetFlowMark';
import styles from './site-footer.module.css';

export default function SiteFooter({ note }: { note: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.intro}>
            <Link href="/" className={styles.brand}>
              <NetFlowMark className={styles.mark} />
              <span>NetFlow&nbsp;Lab</span>
            </Link>
            <p>Interactive network lessons that turn protocol exchanges into visible, step-by-step systems.</p>
          </div>

          <nav className={styles.nav} aria-label="Explore NetFlow Lab">
            <h2>Explore</h2>
            <Link href="/">Home</Link>
            <Link href="/stack">The stack</Link>
            <Link href="/bench">Protocol atlas</Link>
            <Link href="/devices">Devices</Link>
            <Link href="/cables">Cables</Link>
          </nav>

          <nav className={styles.nav} aria-label="Protocol lab shortcuts">
            <h2>Protocol labs</h2>
            <Link href="/lab">Browse all labs</Link>
            <Link href="/lab/arp">ARP lab</Link>
            <Link href="/lab/tcp">TCP lab</Link>
            <Link href="/lab/dns">DNS lab</Link>
          </nav>
        </div>

        <div className={styles.bottom}>
          <code>{note}</code>
          <span>Educational models · no real network traffic is generated</span>
        </div>
      </div>
    </footer>
  );
}
