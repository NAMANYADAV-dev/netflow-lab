import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from '@/components/entry-page.module.css';
import ProtocolDiagram from '@/components/ProtocolDiagram';
import RichText from '@/components/RichText';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { BENCH_HREF } from '@/lib/atlas-data';
import { labForProtocol } from '@/lib/lab-data';
import { protocolById, protocolBySlug, protocolHref, protocolSlug, protocols } from '@/lib/protocol-data';
import { protocolPages } from '@/lib/protocol-pages';
import { pageMeta } from '@/lib/seo';
import shell from '../../shell.module.css';

/* One page per protocol, in the layout the design draws: standfirst, the line
   to keep, the four-point strip, the diagram, the steps, the security notes,
   where it rides and what its header carries.

   Every protocol in the catalogue has a page, but the prerendered set is still
   derived from protocol-pages rather than from the catalogue: adding a protocol
   without writing its page should leave the site consistent, not ship a stub. */

export function generateStaticParams() {
  return Object.keys(protocolPages).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const protocol = protocolBySlug[slug];
  if (!protocol) return {};
  return pageMeta({
    title: `${protocol.abbr} · Protocols · NetFlow Lab`,
    description: protocol.fn,
    path: `/protocols/${slug}`,
  });
}

export default async function ProtocolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const protocol = protocolBySlug[slug];
  const page = protocolPages[slug];
  if (!protocol || !page) notFound();

  const related = protocol.rel.map((id) => protocolById[id]).filter(Boolean);

  /* ten of the forty-eight also have a lab; the rest render without this */
  const lab = labForProtocol(slug);

  /* The pager steps through the protocols that have a page, in catalogue order.
     That is currently all of them; the filter is what keeps it honest if the
     catalogue ever gets ahead of the writing again. */
  const written = protocols.filter((p) => protocolPages[protocolSlug(p)]);
  const i = written.findIndex((p) => protocolSlug(p) === slug);
  const prev = i > 0 ? written[i - 1] : null;
  const next = i >= 0 && i < written.length - 1 ? written[i + 1] : null;

  return (
    <div className={shell.page}>
      <SiteHeader motto="The protocol section" current="protocols" />

      <main>
      {/* ── where you are ────────────────────────────────────────────── */}
      <nav className={`${shell.wrap} ${styles.crumbs}`} aria-label="Breadcrumb">
        <Link href={BENCH_HREF} className={styles.crumbLink}>
          Protocols
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

      {/* ── the hands-on half, where there is one ────────────────────── */}
      {lab && (
        <section className={shell.wrap}>
          <Link href={lab.href} className={styles.labBridge}>
            <div className={styles.labBridgeMain}>
              <div className={styles.labBridgeKicker}>You can run this one</div>
              <h2 className={styles.labBridgeTitle}>
                Open the {lab.abbr} lab <span className={styles.labBridgeArrow}>&rarr;</span>
              </h2>
              <p className={styles.labBridgeDesc}>{lab.description}</p>
            </div>
            <div className={styles.labBridgeMeta}>
              <span className={styles.labBridgeDiff}>{lab.difficulty}</span>
            </div>
          </Link>
        </section>
      )}

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

        <ProtocolDiagram spec={page.diagram} />

        <div className={styles.steps}>
          <div className={styles.stepsKicker}>The main points</div>
          <h3 className={styles.stepsTitle}>What {page.title} does, step by step</h3>
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

        {/* the case against what it replaces, when a page makes one */}
        {page.beats && (
          <div className={styles.beats}>
            <div className={styles.stepsKicker}>{page.beats.kicker}</div>
            <div className={styles.beatsGrid}>
              {page.beats.items.map((b) => (
                <div className={styles.beat} key={b.t}>
                  <span className={styles.beatTitle}>{b.t}</span>
                  <span className={styles.beatText}> — {b.d}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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

      {/* ── where it rides, what it works with, its header ───────────── */}
      <section className={`${shell.wrap} ${styles.metaSection}`}>
        <div className={styles.metaCols}>
          <div>
            <div className={styles.metaHead}>
              <h2 className={styles.metaTitle}>{page.ridesTitle ?? 'Rides in the stack'}</h2>
            </div>
            <div className={styles.chain}>
              {page.rides.map((r, i) => (
                <span key={r.t} className={styles.chainStep}>
                  {i > 0 && (
                    <span className={styles.chainArrow} aria-hidden="true">
                      {page.ridesJoin ?? '→'}
                    </span>
                  )}
                  <span
                    className={
                      r.on ? `${styles.chainChip} ${styles.chainChipOn}` : styles.chainChip
                    }
                  >
                    {r.t}
                  </span>
                </span>
              ))}
            </div>

            {page.ridesNote && <p className={styles.chainNote}>{page.ridesNote}</p>}

            <div className={`${styles.metaHead} ${styles.metaHeadSecond}`}>
              <h2 className={styles.metaTitle}>Works with</h2>
            </div>
            <div className={styles.chipRow}>
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={pageHref(r)}
                  className={`tag tag-outline ${styles.besideChip}`}
                >
                  {r.abbr}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.metaHead}>
              <h2 className={styles.metaTitle}>{page.aside.title}</h2>
            </div>

            {page.aside.kind === 'header' ? (
              <>
                <div className={styles.kv}>
                  {page.aside.specimen && (
                    <div className={styles.specimen}>
                      <span className={styles.inkA}>{page.aside.specimen.a}</span>
                      {page.aside.specimen.sep}
                      <span className={styles.inkB}>{page.aside.specimen.b}</span>
                    </div>
                  )}
                  {page.aside.rows.map((h) => (
                    <div
                      key={h.k}
                      className={h.hi ? `${styles.kvRow} ${styles.kvRowHi}` : styles.kvRow}
                    >
                      <span className={h.ink === 'a' ? styles.inkA : h.ink === 'b' ? styles.inkB : undefined}>
                        {h.k}
                      </span>
                      <span className={styles.kvVal}>{h.v}</span>
                    </div>
                  ))}
                </div>
                {page.aside.note && <p className={styles.asideNote}>{page.aside.note}</p>}
              </>
            ) : page.aside.kind === 'pair' ? (
              <div className={styles.pair}>
                {page.aside.tables.map((t) => (
                  <div className={styles.kv} key={t.head}>
                    <div className={styles.pairHead}>{t.head}</div>
                    {t.rows.map((r) => (
                      <div className={styles.pairRow} key={r.k}>
                        <span
                          className={r.ink === 'a' ? styles.inkA : r.ink === 'b' ? styles.inkB : undefined}
                        >
                          {r.k}
                        </span>
                        <span className={styles.kvVal}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              /* the three-column form: the field, the rival's answer, and this
                 protocol's, struck in the accent so the contrast is the thing
                 you read down */
              <div className={styles.kv}>
                <div className={`${styles.cmpRow} ${styles.cmpHead}`}>
                  <span />
                  <span>{page.aside.cols[0]}</span>
                  <span className={styles.cmpMine}>{page.aside.cols[1]}</span>
                </div>
                {page.aside.rows.map((r) => (
                  <div className={styles.cmpRow} key={r.k}>
                    <span className={styles.cmpKey}>{r.k}</span>
                    <span>{r.a}</span>
                    <span className={styles.cmpMine}>{r.b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── on to the next one ───────────────────────────────────────── */}
      <nav className={`${shell.wrap} ${styles.pager}`} aria-label="Protocols">
        {prev ? (
          <Link href={pageHref(prev)} className={styles.pagerLink}>
            &larr; Previous: {prev.abbr}
          </Link>
        ) : (
          <Link href={BENCH_HREF} className={styles.pagerLink}>
            &larr; All protocols
          </Link>
        )}

        <Link href={BENCH_HREF} className={styles.pagerAll}>
          All protocols
        </Link>

        {next ? (
          <Link href={pageHref(next)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
            Next: {next.abbr} &rarr;
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

/* A "works with" chip names a protocol from the catalogue, which normally has a
   page. Anything that doesn't points at the Bench, where it is at least filed —
   so no link in the site can land on a 404. */
function pageHref(p: { id: string; abbr: string }) {
  return protocolPages[protocolSlug(p)] ? protocolHref(p) : BENCH_HREF;
}
