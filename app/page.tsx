import Link from 'next/link';
import AtlasCanvas from '@/components/AtlasCanvas';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { PlateLine, PlateNumber } from '@/components/PlateText';
import {
  BENCH_HREF,
  STACK_HREF,
  cats,
  crossCut,
  featured,
  stackLayers,
  stats,
} from '@/lib/atlas-data';
import shell from './shell.module.css';
import styles from './atlas.module.css';

export default function ProtocolAtlas() {
  return (
    <div className={shell.page}>
      {/* the header sits outside the hero: .hero clips its canvas with
          overflow:hidden, and a sticky element inside a clipped box cannot
          escape it */}
      <SiteHeader motto="A field guide to the wire" current="home" />

      <main>
      {/* ── hero ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <AtlasCanvas className={styles.heroCanvas} />
        <div className={styles.heroFade} />

        <div className={styles.heroInner}>
          <div className={`${shell.wrap} ${styles.heroBody}`}>
            <div className={styles.kicker}>Browse · Learn · See the whole stack</div>

            <h1 className={`cmyk-head ${styles.headline}`}>
              <PlateLine text="The whole stack," />
              <PlateLine text="one protocol at a time." />
            </h1>

            <p className={styles.lede}>
              <em>From the frame on the wire to the token in a login.</em> A working field guide to
              the 48 protocols that carry the modern internet — what each one does, where it sits,
              and how they fit together.
            </p>

            <div className={styles.ctaRow}>
              <Link className={`btn btn-primary ${shell.btnLg} ${shell.btnLgPrimary}`} href="#categories">
                Start browsing
              </Link>
              <Link className={`btn btn-secondary ${shell.btnLg}`} href={STACK_HREF}>
                See the stack
              </Link>
            </div>

            <div className={styles.statRow}>
              {stats.map((s) => (
                <div className={styles.stat} key={s.num}>
                  <PlateNumber value={s.num} className={styles.statNum} />
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── what this is ─────────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.about}`}>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutLabel}>What this is</div>
          <div>
            <p className={styles.aboutLede}>
              Most references teach one protocol at a time, in isolation. Networks don&apos;t work
              that way — a single web request rides <em>five protocols stacked on each other</em>.
              This atlas shows both: each protocol on its own, and how it clips into everything above
              and below it.
            </p>
            <div className={styles.aboutPoints}>
              <div className={styles.aboutPoint}>
                <strong>Organised by purpose.</strong> Eleven protocol categories, from link and
                routing to web, security, authentication, and operations.
              </div>
              <div className={styles.aboutPoint}>
                <strong>Shown in context.</strong> Every entry names the protocols it rides on and
                the ones it works with.
              </div>
              <div className={styles.aboutPoint}>
                <strong>Built to poke at.</strong> The Bench lets you pull any protocol out and read
                it in the open.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── the stack, at a glance ───────────────────────────────────── */}
      <section id="stack" className={`${shell.wrap} ${shell.section}`}>
        <div className={shell.sectionHead}>
          <div className={shell.sectionHeadRow}>
            <h2 className={shell.sectionTitle}>The stack, at a glance</h2>
            <span className={`${shell.sectionNote} ${shell.sectionNoteWide}`}>
              A single HTTPS request, read top to bottom — each layer wraps the one above it.
            </span>
          </div>
        </div>

        <div className={styles.stackGrid}>
          <div className={styles.stackRows}>
            {stackLayers.map((L) => (
              <div
                key={L.name}
                className={styles.stackRow}
                style={{ '--depth': L.depth } as React.CSSProperties}
              >
                <div className={styles.stackRowHead}>
                  <div>
                    <div className={styles.stackKicker}>{L.kicker}</div>
                    <div className={styles.stackName}>{L.name}</div>
                  </div>
                  <div className={styles.stackProtos}>
                    {L.protos.map((p) => (
                      <span className={styles.protoChip} key={p}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.crossCol}>
            <div className={styles.crossLabel}>Runs across every layer</div>
            <div className={styles.crossList}>
              {crossCut.map((x) => (
                <div key={x.name}>
                  <div className={styles.crossName}>{x.name}</div>
                  <div className={styles.crossBody}>{x.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── protocol categories ──────────────────────────────────────── */}
      <section id="categories" className={`${shell.wrap} ${shell.section}`}>
        <div className={shell.sectionHead}>
          <div className={shell.sectionHeadRow}>
            <h2 className={shell.sectionTitle}>Eleven protocol categories</h2>
            <span className={shell.sectionNote}>Every protocol is filed under one of these.</span>
          </div>
        </div>

        <div className={styles.catGrid}>
          {cats.map((c) => (
            <Link
              key={c.n}
              href={`${BENCH_HREF}#category-${c.id}`}
              className={`card elev-sm ${styles.catCard}`}
            >
              <div className={styles.catHead}>
                <h3 className={styles.catName}>{c.n}</h3>
                <span className={styles.catCount}>{c.count}</span>
              </div>
              <p className={styles.catBody}>{c.b}</p>
              <div className={styles.catTags}>
                {c.eg.map((e) => (
                  <span className={styles.catTag} key={e}>
                    {e}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── start here ───────────────────────────────────────────────── */}
      <section id="featured" className={`${shell.wrap} ${shell.section}`}>
        <div className={shell.sectionHead}>
          <div className={shell.sectionHeadRow}>
            <h2 className={shell.sectionTitle}>Start here</h2>
            <span className={shell.sectionNote}>
              The load-bearing protocols — the ones worth knowing cold.
            </span>
          </div>
        </div>

        <div className={styles.featGrid}>
          {featured.map((f) => (
            <Link key={f.abbr} href={f.href} className={styles.featCell}>
              <div className={styles.featCat}>{f.cat}</div>
              <div className={styles.featHead}>
                <span className={styles.featAbbr}>{f.abbr}</span>
                <span className={styles.featName}>{f.name}</span>
              </div>
              <p className={styles.featLine}>{f.line}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── bench teaser ─────────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.benchSection}`}>
        <div className={styles.bench}>
          <div>
            <div className={styles.benchKicker}>The interactive bench</div>
            <h2 className={styles.benchTitle}>
              Drag or click any protocol onto the table and read it in the open.
            </h2>
            <p className={styles.benchBody}>
              Pull a chip out of the tray and the bench lays it flat: its job, its port or number,
              the stack it rides in, and the protocols it works with — each one clickable to jump
              across.
            </p>
            <Link className={`btn btn-primary ${shell.btnLg} ${shell.btnLgPrimary}`} href={BENCH_HREF}>
              Open the full Bench &rarr;
            </Link>
          </div>

          <div className={styles.benchCard}>
            <div className={styles.benchCardKicker}>Transport</div>
            <div className={styles.benchCardHead}>
              <span className={styles.benchAbbr}>TCP</span>
              <span className={styles.benchName}>Transmission Control</span>
            </div>
            <p className={styles.benchCardBody}>
              A reliable, ordered byte stream: handshake, sequence numbers, acknowledgements,
              retransmission.
            </p>
            <div className={styles.benchWorksLabel}>Works with</div>
            <div className={styles.benchTags}>
              <span className="tag tag-outline">UDP</span>
              <span className="tag tag-outline">TLS</span>
              <span className="tag tag-outline">IPv4</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── closing call ─────────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.ctaSection}`}>
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Read the network the way it actually runs.</h2>
          <p className={styles.ctaBody}>
            Forty-eight protocols, eleven categories, one page. Start anywhere.
          </p>
          <div className={styles.ctaBtns}>
            <Link className={`btn btn-primary ${shell.btnXl} ${shell.btnLgPrimary}`} href={BENCH_HREF}>
              Explore all protocols
            </Link>
            <Link className={`btn btn-secondary ${shell.btnXl}`} href="/lab/tcp">
              Open the TCP Lab
            </Link>
          </div>
        </div>
      </section>
      </main>

      <SiteFooter note="A learning instrument — ports and numbers are the common defaults, not the whole story." />
    </div>
  );
}
