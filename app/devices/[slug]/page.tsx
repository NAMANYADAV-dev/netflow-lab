import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeviceDiagram from '@/components/DeviceDiagram';
import RichText from '@/components/RichText';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { DEVICES_HREF } from '@/lib/atlas-data';
import { BENCH_HREF } from '@/lib/atlas-data';
import {
  deviceById,
  deviceBySlug,
  deviceHref,
  deviceNeighbours,
  devices,
} from '@/lib/device-data';
import { devicePages } from '@/lib/device-pages';
import { photoFor } from '@/lib/photos';
import { pageMeta } from '@/lib/seo';
import styles from '@/components/entry-page.module.css';
import shell from '../../shell.module.css';

/* One page per device, all sixteen prerendered at build time, in the layout the
   design draws: standfirst, the line to keep, the four-point strip, the diagram,
   the steps, the security notes, what it runs and what it sits beside. */

export function generateStaticParams() {
  return devices.map((d) => ({ slug: d.slug }));
}

/** the catalogue is the whole set; anything else is a 404, not a render */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const device = deviceBySlug[slug];
  if (!device) return {};
  return pageMeta({
    title: `${device.abbr} · Network Devices · NetFlow Lab`,
    description: device.fn,
    path: `/devices/${slug}`,
  });
}

export default async function DevicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const device = deviceBySlug[slug];
  const page = devicePages[slug];
  if (!device || !page) notFound();

  const beside = device.works.map((id) => deviceById[id]).filter(Boolean);
  const { prev, next } = deviceNeighbours(device.slug);
  const photo = photoFor('devices', device.slug);

  return (
    <div className={shell.page}>
      <SiteHeader motto="The hardware section" current="devices" />

      <main>
      {/* ── where you are ────────────────────────────────────────────── */}
      <nav className={`${shell.wrap} ${styles.crumbs}`} aria-label="Breadcrumb">
        <Link href={DEVICES_HREF} className={styles.crumbLink}>
          Devices
        </Link>
        <span className={styles.crumbSep}>/</span>
        <span>{page.crumb}</span>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbHere}>{page.title}</span>
      </nav>

      {/* ── hero ─────────────────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.hero}`}>
        <div className={styles.kicker}>{page.kicker}</div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{page.title}</h1>
          <span className={styles.sub}>{page.sub}</span>
        </div>
        <p className={styles.lede}>
          <RichText parts={page.lede} />
        </p>
      </section>

      {/* ── the line to keep ─────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.takeawaySection}`}>
        <div className={styles.takeawayRow}>
          <div className={styles.takeawayBar} aria-hidden="true" />
          <p className={styles.takeaway}>
            <RichText parts={page.takeaway} />
          </p>
        </div>
      </section>

      {/* ── the four points ──────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.pointsSection}`}>
        <div className={styles.points}>
          {page.points.map((p) => (
            <div className={styles.point} key={p.k}>
              <div className={styles.pointKey}>{p.k}</div>
              <div className={styles.pointVal}>{p.v}</div>
              <div className={styles.pointNote}>{p.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── how it works ─────────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.section}`}>
        <div className={styles.head}>
          <h2 className={styles.headTitle}>How it works</h2>
        </div>

        <DeviceDiagram spec={page.diagram} />

        <div className={styles.steps}>
          <div className={styles.stepsKicker}>The main points</div>
          <h3 className={styles.stepsTitle}>
            What {article(page.title)} {subject(page.title)} does, step by step
          </h3>
          <div className={styles.stepGrid}>
            {page.steps.map((s, i) => (
              <div className={styles.step} key={s.t}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div>
                  <div className={styles.stepTitle}>{s.t}</div>
                  <p className={styles.stepText}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── in cybersecurity ─────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.section}`}>
        <div className={styles.head}>
          <h2 className={styles.headTitle}>In cybersecurity</h2>
          <p className={styles.headLede}>
            <RichText parts={page.security.lede} />
          </p>
        </div>

        <div className={styles.secGrid}>
          {page.security.points.map((p) => (
            <div key={p.t}>
              <div className={styles.secTitle}>{p.t}</div>
              <p className={styles.secText}>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── what it runs, what it sits beside ────────────────────────── */}
      <section className={`${shell.wrap} ${styles.metaSection}`}>
        <div className={styles.metaCols}>
          <div>
            {/* a repeater runs nothing — it works below the layer protocols
                begin at — so the heading goes rather than standing over a gap */}
            {device.runs.length > 0 && (
              <>
                <div className={styles.metaHead}>
                  <h2 className={styles.metaTitle}>Protocols it runs</h2>
                </div>
                <div className={styles.chipRow}>
                  {device.runs.map((r) => (
                    <Link href={BENCH_HREF} key={r} className={styles.protoChip}>
                      {r}
                    </Link>
                  ))}
                </div>
              </>
            )}

            <div
              className={
                device.runs.length > 0
                  ? `${styles.metaHead} ${styles.metaHeadSecond}`
                  : styles.metaHead
              }
            >
              <h2 className={styles.metaTitle}>Sits beside</h2>
            </div>
            <div className={styles.chipRow}>
              {beside.map((w) => (
                <Link
                  key={w.id}
                  href={deviceHref(w)}
                  className={`tag tag-outline ${styles.besideChip}`}
                >
                  {w.abbr}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.metaHead}>
              <h2 className={styles.metaTitle}>On the bench</h2>
            </div>
            {/* the design leaves a photo well here for a picture of the real box.
                Drop <slug>.jpg into public/photo/devices/ and it appears; until
                then the plate prints as a ruled frame, the way a page waits for
                its art. */}
            {photo ? (
              /* halftone goes on the frame, not the image: the newsprint dot
                 screen is drawn by its ::after, and a replaced element like
                 <img> has no ::after to draw it with */
              <div className={`halftone ${styles.photo} ${styles.photoFilled}`}>
                {/* plain <img>: these are photographs dropped into a folder by
                    hand, of unknown dimensions, so there is nothing for
                    next/image to be given a width and height from */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`${device.abbr} — ${device.name}`}
                  className={styles.photoImg}
                />
              </div>
            ) : (
              <div className={`halftone ${styles.photo}`}>
                <span className={styles.photoNote}>
                  A photograph of {article(device.abbr)} {device.abbr.toLowerCase()} belongs here
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── on to the next one ───────────────────────────────────────── */}
      <nav className={`${shell.wrap} ${styles.pager}`} aria-label="Devices">
        {prev ? (
          <Link href={deviceHref(prev)} className={styles.pagerLink}>
            &larr; Previous: the {prev.abbr}
          </Link>
        ) : (
          <Link href={DEVICES_HREF} className={styles.pagerLink}>
            &larr; All network devices
          </Link>
        )}

        <Link href={DEVICES_HREF} className={styles.pagerAll}>
          All network devices
        </Link>

        {next ? (
          <Link href={deviceHref(next)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            Next: the {next.abbr} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>
      </main>

      <SiteFooter note={page.footnote} />
    </div>
  );
}

/** "a switch", but "an access point" — the headline reads as a sentence */
function article(word: string) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

/** The title set as a common noun inside the sentence: "Access Point" becomes
    "access point". Acronyms keep their capitals — "IDS / IPS", "NAT gateway" —
    which is why this isn't a plain toLowerCase(). */
function subject(title: string) {
  return title
    .split(' ')
    .map((w) => (/[a-z]/.test(w) ? w.toLowerCase() : w))
    .join(' ');
}
