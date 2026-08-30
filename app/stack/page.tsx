import { pageMeta } from '@/lib/seo';
import Link from 'next/link';
import { Fragment } from 'react';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import {
  bitStream,
  encapRows,
  layerDetails,
  osiLayers,
  pduByLayer,
  tcpIpLayers,
  whyTwoModels,
  type DeviceLink,
} from '@/lib/stack-data';
import shell from '../shell.module.css';
import styles from './stack.module.css';

export const metadata = pageMeta({
  title: 'The Stack · NetFlow Lab',
  description:
    'The OSI and TCP/IP models side by side — seven teaching layers against the four the internet runs on, and how data is encapsulated on the way down.',
  path: '/stack',
});

/** the box classes, keyed by what the box is doing in that row */
const BOX_CLASS = {
  header: styles.boxHeader,
  carried: styles.boxCarried,
  data: styles.boxData,
} as const;

function DeviceLinks({ devices }: { devices?: DeviceLink[] }) {
  if (!devices?.length) return null;
  return (
    <>
      {' · '}
      {devices.map((d, i) => (
        <Fragment key={d.label}>
          {i > 0 && ', '}
          <Link href={d.href} className={styles.deviceLink}>
            {d.label}
          </Link>
        </Fragment>
      ))}
    </>
  );
}

export default function StackPage() {
  return (
    <div className={shell.page}>
      <SiteHeader motto="The reference section" current="stack" />

      <main>
      {/* ── hero ─────────────────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.hero}`}>
        <div className={styles.kicker}>The two models, side by side</div>
        <h1 className={styles.title}>The stack, layer by layer.</h1>
        <p className={styles.lede}>
          <em>Two maps of the same territory.</em> The{' '}
          <strong className={styles.osiWord}>OSI model</strong> splits the network into seven
          teaching layers; the <strong className={styles.tcpWord}>TCP/IP model</strong> collapses
          them into the four the internet actually runs on. Every protocol and device on this site is
          filed by where it sits here.
        </p>
      </section>

      {/* ── the chart ────────────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.chartSection}`}>
        <div className={styles.chartLabels}>
          <div className={styles.labelOsi}>OSI · 7 layers</div>
          <div className={styles.labelTcp}>TCP/IP · 4 layers</div>
        </div>

        <div className={styles.chart}>
          <div className={`${styles.stackedLabel} ${styles.stackedLabelOsi}`}>OSI · 7 layers</div>

          {osiLayers.map((L) => (
            <div
              key={L.n}
              className={styles.osiCell}
              style={{ '--row': 8 - L.n } as React.CSSProperties}
            >
              <div className={styles.osiNum}>{L.n}</div>
              <div>
                <div className={styles.osiName}>{L.name}</div>
                <div className={styles.osiBlurb}>{L.blurb}</div>
                <div className={styles.osiExamples}>
                  {L.examples}
                  <DeviceLinks devices={L.devices} />
                </div>
              </div>
            </div>
          ))}

          <div className={`${styles.stackedLabel} ${styles.stackedLabelTcp}`}>TCP/IP · 4 layers</div>

          {tcpIpLayers.map((T) => (
            <div
              key={T.name}
              className={styles.tcpCell}
              style={
                { '--row-start': T.rowStart, '--row-span': T.rowSpan } as React.CSSProperties
              }
            >
              <div className={styles.tcpName}>{T.name}</div>
              <div className={styles.tcpBlurb}>{T.blurb}</div>
              <div className={styles.tcpProtos}>{T.protos}</div>
            </div>
          ))}
        </div>

        <p className={styles.caption}>
          Data travels down the stack on the way out and back up on the way in — each layer adding,
          then stripping, its own header. Layer assignments are the classic teaching model; many real
          devices span several at once.
        </p>
      </section>

      {/* ── the seven layers, in detail ──────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.detailSection}`}>
        <div className={styles.detailHead}>
          <h2 className={shell.sectionTitle}>The seven layers, in detail</h2>
        </div>

        <div className={styles.detailList}>
          {layerDetails.map((L) => (
            <div className={styles.detailRow} key={L.n}>
              <div>
                <div className={styles.detailName}>
                  <span className={styles.detailNum}>{L.n}</span>&nbsp; {L.name}
                </div>
                <div className={styles.detailExamples}>
                  {L.examples}
                  <DeviceLinks devices={L.devices} />
                </div>
              </div>
              <div>
                <div className={styles.detailLead}>
                  {L.lead.before}
                  <strong>{L.lead.strong}</strong>
                  {L.lead.after}
                </div>
                <p className={styles.detailBody}>{L.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── sender and receiver ──────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.flowSection}`}>
        <div className={styles.flowHead}>
          <h2 className={shell.sectionTitle}>Sender and receiver</h2>
        </div>
        <p className={styles.flowIntro}>
          Data travels <strong className={styles.osiWord}>down the sender&apos;s stack</strong> —
          each layer wrapping the last in its own header — crosses the wire, then travels{' '}
          <strong className={styles.tcpWord}>up the receiver&apos;s stack</strong>, each layer
          stripping the header meant for it.
        </p>

        <div className={styles.flowGrid}>
          <div className={`${styles.flowCap} ${styles.flowCapSender}`}>
            <span>SENDER · encapsulate</span>
            <span className={styles.flowArrow}>&darr;</span>
          </div>
          <div />
          <div className={`${styles.flowCap} ${styles.flowCapReceiver}`}>
            <span className={styles.flowArrow}>&uarr;</span>
            <span>RECEIVER · decapsulate</span>
          </div>

          {osiLayers.map((L, i) => {
            const last = i === osiLayers.length - 1;
            return (
              <Fragment key={L.n}>
                <div
                  className={`${styles.flowCell} ${styles.flowCellSender} ${last ? styles.flowCellLast : ''}`}
                >
                  <span className={styles.flowLayerName}>{L.name}</span>
                  <span className={styles.flowNumSender}>{L.n}</span>
                </div>

                <div className={`${styles.pduCell} ${i === 0 ? styles.pduCellFirst : ''}`}>
                  {pduByLayer[L.n]}
                </div>

                <div
                  className={`${styles.flowCell} ${styles.flowCellReceiver} ${last ? styles.flowCellLast : ''}`}
                >
                  <span className={styles.flowNumReceiver}>{L.n}</span>
                  <span className={styles.flowLayerName}>{L.name}</span>
                </div>
              </Fragment>
            );
          })}

          <div className={styles.wire}>
            The physical medium — the actual cable, fibre or radio the bits cross
          </div>
        </div>

        <p className={styles.caption}>
          The bits leave the sender&apos;s Physical layer, cross the medium, and arrive at the
          receiver&apos;s Physical layer — then climb back up, header by header, until the
          application reads the original data.
        </p>
      </section>

      {/* ── how the data gets wrapped ────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.encapSection}`}>
        <div className={styles.flowHead}>
          <h2 className={shell.sectionTitle}>How the data gets wrapped</h2>
        </div>
        <p className={styles.flowIntro}>
          Going down, each layer takes what it&apos;s handed and puts it in its own box — adding a{' '}
          <strong className={styles.osiWord}>header</strong> in front. The application&apos;s data
          becomes the payload inside the transport&apos;s box, inside the network&apos;s box, inside
          the frame.
        </p>

        <div className={styles.encapList}>
          {encapRows.map((row) => (
            <div className={styles.encapRow} key={row.layer}>
              <div className={styles.encapLayer}>{row.layer}</div>
              <div className={styles.encapBoxes}>
                {row.cells.map((c, i) => (
                  <div className={BOX_CLASS[c.kind]} key={`${c.label}-${i}`}>
                    {c.label}
                  </div>
                ))}
              </div>
              <div
                className={`${styles.encapResult} ${row.named ? styles.encapResultNamed : ''}`}
              >
                {row.result}
              </div>
            </div>
          ))}

          <div className={styles.encapRow}>
            <div className={styles.encapLayer}>Physical</div>
            <div className={styles.bits}>{bitStream}</div>
            <div className={styles.encapResult}>= Bits</div>
          </div>
        </div>

        <p className={styles.caption}>
          At the receiver it runs in reverse — each layer opens its box, reads and removes its
          header, and hands the payload up until only the original data is left.
        </p>
      </section>

      {/* ── why two models ───────────────────────────────────────────── */}
      <section className={`${shell.wrap} ${styles.whySection}`}>
        <div className={styles.whyHead}>
          <h2 className={shell.sectionTitle}>Why two models?</h2>
        </div>
        <div className={styles.whyGrid}>
          {whyTwoModels.map((w) => (
            <div key={w.title}>
              <div
                className={`${styles.whyTitle} ${
                  w.tone === 'osi'
                    ? styles.whyTitleOsi
                    : w.tone === 'tcpip'
                      ? styles.whyTitleTcpip
                      : ''
                }`}
              >
                {w.title}
              </div>
              <p className={styles.whyBody}>{w.body}</p>
            </div>
          ))}
        </div>
      </section>
      </main>

      <SiteFooter note="Two models, one network — filed by the layer each protocol and device works at." />
    </div>
  );
}
