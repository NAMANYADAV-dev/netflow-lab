import { pageMeta } from '@/lib/seo';
import DeviceBench from '@/components/DeviceBench';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { PlateNumber } from '@/components/PlateText';
import { devices } from '@/lib/device-data';
import shell from '../shell.module.css';
import styles from './devices.module.css';

export const metadata = pageMeta({
  title: 'Network Devices · NetFlow Lab',
  description:
    'Every network device filed by the layer it works at — hubs and repeaters on the wire, switches and access points on the link, routers on the network, and the service boxes above.',
  path: '/devices',
});

export default function DevicesPage() {
  return (
    <div className={shell.page}>
      <SiteHeader motto="The hardware section" current="devices" />

      <main>
      <section className={`${shell.wrap} ${styles.hero}`}>
        <div>
          <div className={styles.kicker}>The boxes on the wire</div>
          <h1 className={styles.title}>Network devices, by the layer they work at.</h1>
          <p className={styles.lede}>
            <em>A hub is not a switch, and a switch is not a router.</em> The difference is which
            layer of the stack a box reads before it decides what to do. Drag or click any device onto the
            bench for the short version — or open its own page for the whole entry.
          </p>
        </div>

        <div className={styles.count}>
          <div className={styles.countRow}>
            <PlateNumber value={String(devices.length)} className={styles.countNum} />
          </div>
          <div className={styles.countLabel}>devices · 4 layers of the stack</div>
        </div>
      </section>

      <DeviceBench />
      </main>

      <SiteFooter note="Layer assignments are the classic teaching model — many modern boxes span several at once." />
    </div>
  );
}
