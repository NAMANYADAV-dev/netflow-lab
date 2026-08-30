import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/RichText';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { CABLES_HREF } from '@/lib/atlas-data';
import {
  connectorBySlug,
  connectorHref,
  connectorNeighbours,
  connectors,
} from '@/lib/connector-data';
import { photoFor } from '@/lib/photos';
import { pageMeta } from '@/lib/seo';
import entry from '@/components/entry-page.module.css';
import cableStyles from '../../cables.module.css';
import shell from '../../../shell.module.css';

export function generateStaticParams() {
  return connectors.map((connector) => ({ slug: connector.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const connector = connectorBySlug[slug];
  if (!connector) return {};
  return pageMeta({
    title: `${connector.name} · Connectors · NetFlow Lab`,
    description: connector.fn,
    path: `/cables/connectors/${slug}`,
  });
}

export default async function ConnectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const connector = connectorBySlug[slug];
  if (!connector) notFound();

  const photo = photoFor('connectors', connector.slug);
  const { prev, next } = connectorNeighbours(connector.slug);
  const isComparison = connector.slug === 'rj11-vs-rj45';

  return (
    <div className={shell.page}>
      <SiteHeader motto="The physical media section" current="cables" />

      <main>
      <nav className={`${shell.wrap} ${entry.crumbs}`} aria-label="Breadcrumb">
        <Link href={CABLES_HREF} className={entry.crumbLink}>
          Cables
        </Link>
        <span className={entry.crumbSep}>/</span>
        <Link href={`${CABLES_HREF}#connectors`} className={entry.crumbLink}>
          Connectors
        </Link>
        <span className={entry.crumbSep}>/</span>
        <span className={entry.crumbHere}>{connector.name}</span>
      </nav>

      <section className={`${shell.wrap} ${entry.hero}`}>
        <div className={entry.kicker}>{connector.kicker}</div>
        <div className={entry.titleRow}>
          <h1 className={entry.title}>{connector.name}</h1>
          <span className={entry.sub}>{connector.sub}</span>
        </div>
        <p className={entry.lede}>
          <RichText parts={connector.lede} />
        </p>
      </section>

      <section className={`${shell.wrap} ${entry.takeawaySection}`}>
        <div className={entry.takeawayRow}>
          <div className={entry.takeawayBar} aria-hidden="true" />
          <p className={entry.takeaway}>
            <RichText parts={connector.takeaway} />
          </p>
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.pointsSection}`}>
        <div className={entry.points}>
          {connector.points.map((point) => (
            <div className={entry.point} key={point.k}>
              <div className={entry.pointKey}>{point.k}</div>
              <div className={entry.pointVal}>{point.v}</div>
              <div className={entry.pointNote}>{point.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>
            {isComparison ? 'Read the connectors side by side' : 'Anatomy of the connector'}
          </h2>
          <p className={entry.headLede}>
            Use the supplied plate to identify the connector, then check the four details below
            before selecting, terminating or mating it.
          </p>
        </div>

        <figure className={cableStyles.figureWrap}>
          <div className={`halftone ${cableStyles.figure}`}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={connector.imageAlt} className={cableStyles.figureImage} />
            ) : (
              <div className={cableStyles.figureMissing}>Artwork awaiting placement</div>
            )}
          </div>
          <figcaption>Supplied NetFlow Lab connector plate · shown uncropped</figcaption>
        </figure>

        <div className={entry.steps}>
          <div className={entry.stepsKicker}>Identify it correctly</div>
          <h3 className={entry.stepsTitle}>Four details to check before connection</h3>
          <div className={entry.stepGrid}>
            {connector.anatomy.map((step, index) => (
              <div className={entry.step} key={step.t}>
                <div className={entry.stepNum}>{index + 1}</div>
                <div>
                  <div className={entry.stepTitle}>{step.t}</div>
                  <p className={entry.stepText}>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>Where it is used</h2>
          <p className={entry.headLede}>
            The connector body is only one part of a link. Cable type, signal, impedance or
            optical polish must match the equipment on both ends.
          </p>
        </div>
        <div className={entry.secGrid}>
          {connector.uses.map((use) => (
            <div key={use.t}>
              <div className={entry.secTitle}>{use.t}</div>
              <p className={entry.secText}>{use.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>In cybersecurity &amp; operations</h2>
          <p className={entry.headLede}>
            <RichText parts={connector.security.lede} />
          </p>
        </div>
        <div className={entry.secGrid}>
          {connector.security.points.map((point) => (
            <div key={point.t}>
              <div className={entry.secTitle}>{point.t}</div>
              <p className={entry.secText}>{point.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.metaSection}`}>
        <div className={entry.metaCols}>
          <div>
            <div className={entry.metaHead}>
              <h2 className={entry.metaTitle}>Names &amp; specifications</h2>
            </div>
            <div className={entry.chipRow}>
              {connector.tags.map((tag) => (
                <span className={entry.protoChip} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className={entry.metaHead}>
              <h2 className={entry.metaTitle}>Continue the connector guide</h2>
            </div>
            {(next || prev) && (
              <Link href={connectorHref(next ?? prev!)} className={cableStyles.compareCard}>
                <strong>{(next ?? prev)!.name}</strong>
                <span>{(next ?? prev)!.fn}</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <nav className={`${shell.wrap} ${entry.pager}`} aria-label="Connectors">
        {prev ? (
          <Link href={connectorHref(prev)} className={entry.pagerLink}>
            &larr; Previous: {prev.name}
          </Link>
        ) : (
          <Link href={`${CABLES_HREF}#connectors`} className={entry.pagerLink}>
            &larr; All connectors
          </Link>
        )}
        <Link href={`${CABLES_HREF}#connectors`} className={entry.pagerAll}>
          All connectors
        </Link>
        {next ? (
          <Link href={connectorHref(next)} className={`${entry.pagerLink} ${entry.pagerNext}`}>
            Next: {next.name} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>
      </main>

      <SiteFooter note={connector.footnote} />
    </div>
  );
}
