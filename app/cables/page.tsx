import { pageMeta } from '@/lib/seo';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { PlateNumber } from '@/components/PlateText';
import { cableHref, cables } from '@/lib/cable-data';
import { connectorHref, connectors } from '@/lib/connector-data';
import { photoFor } from '@/lib/photos';
import shell from '../shell.module.css';
import styles from './cables.module.css';

export const metadata = pageMeta({
  title: 'Network Cables & Connectors · NetFlow Lab',
  description:
    'Practical field guides to network copper, coaxial and fiber cable plus the connectors that terminate them.',
  path: '/cables',
});

export default function CablesPage() {
  return (
    <div className={shell.page}>
      <SiteHeader motto="The physical media section" current="cables" />

      <main>
      <section className={`${shell.wrap} ${styles.hero}`}>
        <div>
          <div className={styles.kicker}>The paths under every packet</div>
          <h1 className={styles.title}>Cables and connectors, from signal path to termination.</h1>
          <p className={styles.lede}>
            <em>Start with the medium, then identify the termination.</em> Open a field guide for
            cable anatomy, connector details, common uses and the security or operational checks
            that keep a physical link dependable.
          </p>
        </div>

        <div className={styles.count}>
          <div className={styles.countRow}>
            <PlateNumber value={String(cables.length + connectors.length)} className={styles.countNum} />
          </div>
          <div className={styles.countLabel}>field guides · cables &amp; connectors</div>
        </div>
      </section>

      <section className={`${shell.wrap} ${styles.catalogue}`}>
        <div className={shell.sectionHead}>
          <div className={shell.sectionHeadRow}>
            <h2 className={shell.sectionTitle}>Cable types</h2>
            <span className={shell.sectionNote}>Twisted pair, coaxial copper and glass fiber.</span>
          </div>
        </div>

        <div className={styles.cards}>
          {cables.map((cable) => {
            const photo = photoFor('cables', cable.slug);
            return (
              <Link href={cableHref(cable)} className={styles.card} key={cable.slug}>
                <div className={`halftone ${styles.cardImage}`}>
                  {photo ? (
                    /* Supplied editorial artwork has its own labels and fixed
                       composition, so it is shown without an optimizer crop. */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={cable.imageAlt} />
                  ) : (
                    <span>Artwork awaiting placement</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardSpec}>{cable.spec}</div>
                  <h2 className={styles.cardTitle}>{cable.name}</h2>
                  <p className={styles.cardText}>{cable.fn}</p>
                  <span className={styles.cardLink}>Read the full page &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={`${shell.wrap} ${styles.catalogue}`} id="connectors">
        <div className={shell.sectionHead}>
          <div className={shell.sectionHeadRow}>
            <h2 className={shell.sectionTitle}>Connector guides</h2>
            <span className={shell.sectionNote}>Copper, coaxial and optical terminations.</span>
          </div>
        </div>

        <div className={styles.connectorCards}>
          {connectors.map((connector) => {
            const photo = photoFor('connectors', connector.slug);
            return (
              <Link href={connectorHref(connector)} className={styles.card} key={connector.slug}>
                <div className={`halftone ${styles.cardImage}`}>
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={connector.imageAlt} />
                  ) : (
                    <span>Artwork awaiting placement</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardSpec}>{connector.spec}</div>
                  <h2 className={styles.cardTitle}>{connector.name}</h2>
                  <p className={styles.cardText}>{connector.fn}</p>
                  <span className={styles.cardLink}>Read the full page &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      </main>

      <SiteFooter note="The medium is only half the link—termination, optics and installation quality decide whether the specification survives the real world." />
    </div>
  );
}
