import RichText, { type Rich } from '@/components/RichText';
import styles from './protocol-diagram.module.css';

/* The "How it works" plate on a protocol's page.

   Where a device page draws a box with a thing on either side, a protocol page
   draws time: two lanes — the two ends of the conversation — and the messages
   that pass between them, in the order they pass. Alongside it sits the header
   the protocol puts on every packet, drawn as a bit field.

   Both halves are optional, and each carries its own explanatory note, because
   the note belongs to whichever drawing it explains: TCP's sits under the
   handshake, UDP's under the eight-byte header. */

/** one message on the wire.

    `lost` is drawn as a dashed run ending in a cross — a datagram that left and
    never arrived, which is UDP's whole point. `both` heads the line at each end
    in the plain text ink: traffic now flowing freely, belonging to neither side.

    A message may carry a `card` — the thing actually said on the wire, quoted,
    with a line under it saying what it means. The card's ink usually follows
    the message's direction, but `tone` overrides that: traceroute's outbound
    probe is the near side speaking, while the card records what came *back*. */
export type Message = {
  label: string;
  gloss?: string;
  dir: 'right' | 'left' | 'both' | 'lost';
  card?: {
    /** omitted where the card is only a list — nothing was said in one line */
    quote?: string;
    gloss?: Rich;
    /** what the message actually contained, field by field — used where a
        sentence would only list the same things in prose */
    rows?: { k: string; v: string; ink?: 'a' | 'b' }[];
    /** the message transcribed line by line, where it is literally text on the
        wire — an HTTP request is read as it is written */
    lines?: string[];
    tone?: 'a' | 'b' | 'plain' | 'quiet';
    /** tint the whole card rather than just its quote — for an outcome rather
        than a message, where there is nothing further to gloss */
    filled?: boolean;
  };
};

/** one field in the packet header */
export type HeaderCell = {
  t: string;
  /** share of the row's width; ignored when `w` is set */
  grow?: number;
  /** a fixed width in px, for the narrow fixed-size fields */
  w?: number;
  /** struck in the first accent — the fields the page is about */
  hi?: boolean;
  /** struck in the second accent — named, but not the subject */
  alt?: boolean;
  /** options, padding: there, but not what anyone reads the map for */
  faint?: boolean;
  small?: boolean;
};

/** one block of data on a lane: carried, held up, or not sent yet */
export type Block = 'ok' | 'stuck' | 'idle';

/** one half of a dissected address: what range of it, what it is, what it says */
export type AnatomyHalf = { kicker: string; t: string; d: string };

/** a small ruled box naming a party and what it is doing. `tone` picks its ink;
    `filled` tints it, for the box that holds the outcome. */
export type Panelet = { t: string; d: string; tone: 'a' | 'b'; filled?: boolean };

export type ProtocolDiagramSpec = {
  /** the small caps line above the drawing */
  caption: string;
  /** the side-by-side comparison some pages draw instead of an exchange: the
      rival's single lane against this protocol's independent ones. Each panel
      is a small ruled card of lanes, with a line of its own underneath. */
  panels?: {
    title: string;
    /** this page's protocol — ruled and tinted in the accent */
    on?: boolean;
    lanes: { label?: string; blocks: Block[] }[];
    note: string;
  }[];
  /** short columns under a rule inside the plate — the properties worth naming
      but not worth drawing */
  facets?: { t: string; d: string }[];
  /** an address taken apart: the specimen set large in two inks, then a tinted
      half describing each part. What a protocol's own notation actually means,
      when that is the thing worth drawing. */
  anatomy?: {
    specimen: { a: string; sep: string; b: string };
    halves: [AnatomyHalf, AnatomyHalf];
    note: Rich;
  };
  /** a protocol built in tiers, each standing on the one before. Drawn as
      stacked cards with a fall between them, rather than as messages, because
      the order is one of construction rather than of time. */
  layers?: {
    lanes?: { left: string; right: string };
    items: { head: string; tone: 'a' | 'b' | 'plain'; lines: Rich[] }[];
  };
  /** a lookup delegated and walked down a tree: who is asked, the referrals
      that come back from each level, and the answer returned at the end. */
  resolve?: {
    ask: { left: Panelet; right: Panelet };
    /** the italic line between the question and the walk */
    bridge: string;
    /** each level of the tree and what it hands back. `tone` is 'b' for a
        referral — a pass to someone else — and 'a' for the real answer. */
    referrals: { from: string; text: Rich; tone: 'a' | 'b' }[];
    answer: { left: Panelet; right: Panelet };
  };
  /** an announcement passed along and added to at each stop. Unlike `path`,
      which carries one packet unchanged, here every stop rewrites what it holds
      — so each carries its own chip showing the state after it. */
  relay?: {
    /** `on` marks the origin, `end` the destination — the two ends take the two
        accents, everything between stays in the plain ink */
    stops: { t: string; sub: string; chip?: string; on?: boolean; end?: boolean }[];
    /** what carries each leg, set over its arrow — one fewer than there are stops */
    legs?: string[];
  };
  /** a transcript of the conversation, line by line, with who spoke each one */
  dialog?: {
    label: string;
    rows: { who: string; tone: 'a' | 'b'; text: string }[];
  };
  /** the journey a packet makes: where it starts, the boxes it is handed
      between, and where it ends. `legs` labels the arrows — one more label than
      there are hops — and the last leg arrives, so it takes the second accent. */
  path?: {
    from: { t: string; sub: string };
    hops: string[];
    legs: string[];
    to: { t: string; sub: string };
  };
  exchange?: {
    /** who is talking, over the ends of the wires. `rightMuted` greys the far
        lane for the exchanges whose other end is everybody rather than a peer —
        an ARP broadcast is addressed to the segment, not to a host. */
    lanes: { left: string; right: string; rightMuted?: boolean };
    messages: Message[];
    /** the dashed box under it — the state the exchange leaves behind */
    settled?: string;
    note?: Rich;
  };
  header?: {
    label: string;
    /** the bit ruler over the field map, e.g. 0 · 16 bits · 31 */
    ruler?: [string, string, string];
    rows: HeaderCell[][];
    /** the dashed box under the map — the payload the header is wrapped around */
    payload?: string;
    note?: Rich;
  };
  /** the closing line, when it belongs to the plate as a whole rather than to
      the exchange or the header on their own */
  note?: Rich;
};

export default function ProtocolDiagram({ spec }: { spec: ProtocolDiagramSpec }) {
  return (
    <div className={styles.plate}>
      <div className={styles.caption}>{spec.caption}</div>

      {spec.panels && (
        <div className={styles.panels}>
          {spec.panels.map((p) => (
            <div key={p.title} className={p.on ? `${styles.panel} ${styles.panelOn}` : styles.panel}>
              <div className={p.on ? `${styles.panelHead} ${styles.panelHeadOn}` : styles.panelHead}>
                {p.title}
              </div>
              <div className={styles.panelBody}>
                {p.lanes.map((l, i) => (
                  <div className={styles.lane} key={l.label ?? i}>
                    {l.label && <span className={styles.laneName}>{l.label}</span>}
                    {l.blocks.map((b, j) => (
                      <span
                        key={`${b}-${j}`}
                        className={`${styles.block} ${
                          b === 'ok' ? styles.blockOk : b === 'stuck' ? styles.blockStuck : styles.blockIdle
                        }`}
                      />
                    ))}
                  </div>
                ))}
                <div className={p.on ? `${styles.panelNote} ${styles.inkA}` : `${styles.panelNote} ${styles.inkB}`}>
                  {p.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {spec.anatomy && (
        <div className={styles.anatomy}>
          <div className={styles.specimen}>
            <span className={styles.inkA}>{spec.anatomy.specimen.a}</span>
            <span className={styles.specimenSep}>{spec.anatomy.specimen.sep}</span>
            <span className={styles.inkB}>{spec.anatomy.specimen.b}</span>
          </div>

          <div className={styles.halves}>
            {spec.anatomy.halves.map((h, i) => (
              <div key={h.t} className={i === 0 ? styles.halfA : styles.halfB}>
                <div className={i === 0 ? styles.halfKickerA : styles.halfKickerB}>{h.kicker}</div>
                <div className={styles.halfTitle}>{h.t}</div>
                <div className={styles.halfText}>{h.d}</div>
              </div>
            ))}
          </div>

          <p className={styles.anatomyNote}>
            <RichText parts={spec.anatomy.note} />
          </p>
        </div>
      )}

      {spec.layers && (
        <div className={styles.layers}>
          {spec.layers.lanes && (
            <div className={styles.lanes}>
              <span className={styles.laneLeft}>{spec.layers.lanes.left}</span>
              <span className={styles.laneRight}>{spec.layers.lanes.right}</span>
            </div>
          )}

          {spec.layers.items.map((l, i) => (
            <div key={l.head}>
              <div className={`${styles.card} ${styles[`card${cap(l.tone)}`]}`}>
                <div className={styles.cardQuote}>{l.head}</div>
                {l.lines.map((line, j) => (
                  <div className={styles.cardGloss} key={j}>
                    <RichText parts={line} />
                  </div>
                ))}
              </div>
              {/* the fall to the tier built on top of this one */}
              {i < spec.layers!.items.length - 1 && (
                <div className={styles.fall} aria-hidden="true">
                  &darr;
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {spec.resolve && (
        <div className={styles.resolve}>
          <div className={styles.askRow}>
            <Panel p={spec.resolve.ask.left} />
            <div className={`${styles.wire} ${styles.wireA}`} aria-hidden="true">
              <span className={styles.shaft} />
              <span className={styles.headRight} />
            </div>
            <Panel p={spec.resolve.ask.right} />
          </div>

          <div className={styles.bridge}>{spec.resolve.bridge}</div>

          <div className={styles.referrals}>
            {spec.resolve.referrals.map((r) => (
              <div className={styles.referral} key={r.from}>
                <div className={r.tone === 'a' ? `${styles.refFrom} ${styles.inkA}` : styles.refFrom}>
                  {r.from}
                </div>
                <div className={styles.refBody}>
                  <div
                    className={`${styles.wire} ${styles.refWire} ${r.tone === 'a' ? styles.wireA : styles.wireB}`}
                    aria-hidden="true"
                  >
                    <span className={styles.headLeft} />
                    <span className={styles.shaft} />
                  </div>
                  <span className={styles.refText}>
                    <RichText parts={r.text} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={`${styles.askRow} ${styles.answerRow}`}>
            <Panel p={spec.resolve.answer.left} />
            <div className={`${styles.wire} ${styles.wireA}`} aria-hidden="true">
              <span className={styles.headLeft} />
              <span className={styles.shaft} />
            </div>
            <Panel p={spec.resolve.answer.right} />
          </div>
        </div>
      )}

      {spec.relay && (
        <div className={styles.relay}>
          {spec.relay.stops.flatMap((s, i) => {
            const nodes = [];
            if (i > 0) {
              const leg = spec.relay!.legs?.[i - 1];
              nodes.push(
                <div className={styles.relayLeg} key={`w-${i}`}>
                  {leg && <div className={styles.relayLegLabel}>{leg}</div>}
                  <div
                    className={`${styles.wire} ${s.end ? styles.wireB : styles.wireA}`}
                    aria-hidden="true"
                  >
                    <span className={styles.shaft} />
                    <span className={styles.headRight} />
                  </div>
                </div>,
              );
            }
            nodes.push(
              <div className={styles.stopCol} key={s.t}>
                <div
                  className={[
                    styles.stopName,
                    s.on ? styles.inkA : '',
                    s.end ? styles.inkB : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {s.t}
                </div>
                <div className={styles.stopNote}>{s.sub}</div>
                {s.chip && (
                  <div className={s.on ? `${styles.chip} ${styles.chipOn}` : styles.chip}>{s.chip}</div>
                )}
              </div>,
            );
            return nodes;
          })}
        </div>
      )}

      {spec.dialog && (
        <div className={styles.dialog}>
          <div className={styles.dialogHead}>{spec.dialog.label}</div>
          {spec.dialog.rows.map((r) => (
            <div className={styles.dialogRow} key={r.text}>
              <span className={r.tone === 'a' ? styles.inkA : styles.inkB}>{r.who}</span>
              <span>{r.text}</span>
            </div>
          ))}
        </div>
      )}

      {spec.path && (
        <div className={styles.path}>
          <div className={`${styles.stop} ${styles.stopFrom}`}>
            <div className={styles.stopTitle}>{spec.path.from.t}</div>
            <div className={`${styles.stopSub} ${styles.inkA}`}>{spec.path.from.sub}</div>
          </div>

          {/* leg, box, leg, box … and a final leg into the destination, which is
              drawn after the loop */}
          {spec.path.legs.flatMap((leg, i) => {
            const arriving = i === spec.path!.legs.length - 1;
            const nodes = [
              <div className={styles.leg} key={`leg-${i}`}>
                <div className={arriving ? `${styles.legLabel} ${styles.inkB}` : styles.legLabel}>
                  {leg}
                </div>
                <div
                  className={`${styles.wire} ${arriving ? styles.wireB : styles.wirePlain}`}
                  aria-hidden="true"
                >
                  <span className={styles.shaft} />
                  <span className={styles.headRight} />
                </div>
              </div>,
            ];
            const hop = spec.path!.hops[i];
            if (hop) nodes.push(<div className={styles.hop} key={`hop-${i}`}>{hop}</div>);
            return nodes;
          })}

          <div className={`${styles.stop} ${styles.stopTo}`}>
            <div className={styles.stopTitle}>{spec.path.to.t}</div>
            <div className={`${styles.stopSub} ${styles.inkB}`}>{spec.path.to.sub}</div>
          </div>
        </div>
      )}

      {spec.facets && (
        <div className={styles.facets}>
          {spec.facets.map((f) => (
            <div key={f.t}>
              <div className={styles.facetTitle}>{f.t}</div>
              <p className={styles.facetText}>{f.d}</p>
            </div>
          ))}
        </div>
      )}

      {spec.exchange && (
        <>
          <div className={styles.lanes}>
            <span className={styles.laneLeft}>{spec.exchange.lanes.left}</span>
            <span className={spec.exchange.lanes.rightMuted ? styles.laneMuted : styles.laneRight}>
              {spec.exchange.lanes.right}
            </span>
          </div>

          <div className={styles.exchange}>
            {spec.exchange.messages.map((m) => (
              <div key={m.label + m.dir + (m.gloss ?? '')}>
                <div className={`${styles.msgLabel} ${ink(m.dir)}`}>
                  {m.label}
                  {m.gloss && <span className={styles.msgGloss}>{m.gloss}</span>}
                </div>
                <Wire dir={m.dir} />
                {m.card && (
                  <div
                    className={[
                      styles.card,
                      m.card.tone ? styles[`card${cap(m.card.tone)}`] : cardInk(m.dir),
                      m.card.filled ? styles.cardFilled : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {m.card.quote && <div className={styles.cardQuote}>{m.card.quote}</div>}
                    {m.card.gloss && (
                      <div className={styles.cardGloss}>
                        <RichText parts={m.card.gloss} />
                      </div>
                    )}
                    {m.card.lines?.map((l) => (
                      <div className={styles.cardLine} key={l}>
                        {l}
                      </div>
                    ))}
                    {m.card.rows?.map((r) => (
                      <div className={styles.cardRow} key={r.k}>
                        <span className={r.ink === 'a' ? styles.inkA : r.ink === 'b' ? styles.inkB : undefined}>
                          {r.k}
                        </span>
                        <span className={styles.cardRowVal}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {spec.exchange.settled && <div className={styles.settled}>{spec.exchange.settled}</div>}
          </div>

          {spec.exchange.note && (
            <p className={styles.note}>
              <RichText parts={spec.exchange.note} />
            </p>
          )}
        </>
      )}

      {spec.header && (
        <>
          <div className={styles.headerWrap}>
            <div className={styles.headerLabel}>{spec.header.label}</div>

            {spec.header.ruler && (
              <div className={styles.ruler}>
                {spec.header.ruler.map((r, i) => (
                  <span key={`${r}-${i}`}>{r}</span>
                ))}
              </div>
            )}

            <div className={styles.fields}>
              {spec.header.rows.map((row, i) => (
                <div className={styles.fieldRow} key={row.map((c) => c.t).join('|') || i}>
                  {row.map((c) => (
                    <div
                      key={c.t}
                      className={[
                        styles.field,
                        c.hi ? styles.fieldHi : '',
                        c.alt ? styles.fieldAlt : '',
                        c.faint ? styles.fieldFaint : '',
                        c.small ? styles.fieldSmall : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={c.w ? { flex: 'none', width: c.w } : { flex: c.grow ?? 1 }}
                    >
                      {c.t}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {spec.header.payload && <div className={styles.payload}>{spec.header.payload}</div>}
          </div>

          {spec.header.note && (
            <p className={styles.note}>
              <RichText parts={spec.header.note} />
            </p>
          )}
        </>
      )}

      {spec.note && (
        <p className={styles.note}>
          <RichText parts={spec.note} />
        </p>
      )}
    </div>
  );
}

/* A message travelling right is the near side speaking, so it takes the first
   accent; anything coming back takes the second. A line flowing both ways
   belongs to neither, and stays in the plain text ink. */
function ink(dir: Message['dir']) {
  if (dir === 'right') return styles.inkA;
  if (dir === 'both') return styles.inkPlain;
  return styles.inkB;
}

function cardInk(dir: Message['dir']) {
  return dir === 'right' ? styles.cardA : styles.cardB;
}

/** 'plain' → 'Plain', so a tone name maps onto its class */
function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

/** a party in the lookup: who it is, and what it is doing about the question */
function Panel({ p }: { p: Panelet }) {
  return (
    <div
      className={[
        styles.panelet,
        p.tone === 'a' ? styles.paneletA : styles.paneletB,
        p.filled ? styles.paneletFilled : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.paneletTitle}>{p.t}</div>
      <div className={styles.paneletText}>{p.d}</div>
    </div>
  );
}

/** the shaft and its head, in the ink of whichever way it is going */
function Wire({ dir }: { dir: Message['dir'] }) {
  if (dir === 'lost') {
    return (
      <div className={`${styles.wire} ${styles.wireLost}`} aria-hidden="true">
        <span className={styles.shaftLost} />
        <span className={styles.cross}>&#10005;</span>
      </div>
    );
  }

  const tone = dir === 'right' ? styles.wireA : dir === 'both' ? styles.wirePlain : styles.wireB;

  return (
    <div className={`${styles.wire} ${tone}`} aria-hidden="true">
      {dir !== 'right' && <span className={styles.headLeft} />}
      <span className={styles.shaft} />
      {dir !== 'left' && <span className={styles.headRight} />}
    </div>
  );
}
