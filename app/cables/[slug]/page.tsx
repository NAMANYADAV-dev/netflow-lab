import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/RichText';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { CABLES_HREF } from '@/lib/atlas-data';
import {
  cableBySlug,
  cableHref,
  cableNeighbours,
  cables,
} from '@/lib/cable-data';
import { photoFor } from '@/lib/photos';
import { pageMeta } from '@/lib/seo';
import entry from '@/components/entry-page.module.css';
import cableStyles from '../cables.module.css';
import shell from '../../shell.module.css';

export function generateStaticParams() {
  return cables.map((cable) => ({ slug: cable.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cable = cableBySlug[slug];
  if (!cable) return {};
  return pageMeta({
    title: `${cable.name} · Cables · NetFlow Lab`,
    description: cable.fn,
    path: `/cables/${slug}`,
  });
}

export default async function CablePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cable = cableBySlug[slug];
  if (!cable) notFound();

  const photo = photoFor('cables', cable.slug);
  const { prev, next } = cableNeighbours(cable.slug);

  return (
    <div className={shell.page}>
      <SiteHeader motto="The physical media section" current="cables" />

      <main>
      <nav className={`${shell.wrap} ${entry.crumbs}`} aria-label="Breadcrumb">
        <Link href={CABLES_HREF} className={entry.crumbLink}>
          Cables
        </Link>
        <span className={entry.crumbSep}>/</span>
        <span>Physical media</span>
        <span className={entry.crumbSep}>/</span>
        <span className={entry.crumbHere}>{cable.name}</span>
      </nav>

      <section className={`${shell.wrap} ${entry.hero}`}>
        <div className={entry.kicker}>{cable.kicker}</div>
        <div className={entry.titleRow}>
          <h1 className={entry.title}>{cable.name}</h1>
          <span className={entry.sub}>{cable.sub}</span>
        </div>
        <p className={entry.lede}>
          <RichText parts={cable.lede} />
        </p>
      </section>

      <section className={`${shell.wrap} ${entry.takeawaySection}`}>
        <div className={entry.takeawayRow}>
          <div className={entry.takeawayBar} aria-hidden="true" />
          <p className={entry.takeaway}>
            <RichText parts={cable.takeaway} />
          </p>
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.pointsSection}`}>
        <div className={entry.points}>
          {cable.points.map((point) => (
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
          <h2 className={entry.headTitle}>Anatomy of the cable</h2>
          <p className={entry.headLede}>
            Read the supplied diagram first, then follow the four layers below from the signal
            path out to the protective jacket and termination.
          </p>
        </div>

        <figure className={cableStyles.figureWrap}>
          <div className={`halftone ${cableStyles.figure}`}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={cable.imageAlt} className={cableStyles.figureImage} />
            ) : (
              <div className={cableStyles.figureMissing}>Artwork awaiting placement</div>
            )}
          </div>
          <figcaption>Supplied NetFlow Lab anatomy plate · shown uncropped</figcaption>
        </figure>

        <div className={entry.steps}>
          <div className={entry.stepsKicker}>From the inside out</div>
          <h3 className={entry.stepsTitle}>The four parts that make the medium work</h3>
          <div className={entry.stepGrid}>
            {cable.anatomy.map((step, index) => (
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
            The cable name is a family, not one universal specification. Pick the construction,
            connector and equipment for the actual link.
          </p>
        </div>
        <div className={entry.secGrid}>
          {cable.uses.map((use) => (
            <div key={use.t}>
              <div className={entry.secTitle}>{use.t}</div>
              <p className={entry.secText}>{use.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>In cybersecurity</h2>
          <p className={entry.headLede}>
            <RichText parts={cable.security.lede} />
          </p>
        </div>
        <div className={entry.secGrid}>
          {cable.security.points.map((point) => (
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
              <h2 className={entry.metaTitle}>Standards &amp; connectors</h2>
            </div>
            <div className={entry.chipRow}>
              {cable.tags.map((tag) => (
                <span className={entry.protoChip} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className={entry.metaHead}>
              <h2 className={entry.metaTitle}>Compare the other medium</h2>
            </div>
            {prev ? (
              <Link href={cableHref(prev)} className={cableStyles.compareCard}>
                <strong>{prev.name}</strong>
                <span>{prev.fn}</span>
              </Link>
            ) : next ? (
              <Link href={cableHref(next)} className={cableStyles.compareCard}>
                <strong>{next.name}</strong>
                <span>{next.fn}</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <nav className={`${shell.wrap} ${entry.pager}`} aria-label="Cables">
        {prev ? (
          <Link href={cableHref(prev)} className={entry.pagerLink}>
            &larr; Previous: {prev.name}
          </Link>
        ) : (
          <Link href={CABLES_HREF} className={entry.pagerLink}>
            &larr; All cables
          </Link>
        )}
        <Link href={CABLES_HREF} className={entry.pagerAll}>
          All cables
        </Link>
        {next ? (
          <Link href={cableHref(next)} className={`${entry.pagerLink} ${entry.pagerNext}`}>
            Next: {next.name} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>
      </main>

      <SiteFooter note={cable.footnote} />
    </div>
  );
}
