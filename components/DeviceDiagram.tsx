import RichText, { type Rich } from '@/components/RichText';
import styles from './device-diagram.module.css';

/* The "How it works" plate.

   Every device page in the design draws the same picture: the thing on the left
   that sends, an arrow labelled with what travels, the device itself, a second
   arrow labelled with what comes out the other side, and the thing on the right
   that receives. Underneath sits the small table the box consults or produces,
   with the row that matters struck in the accent, and a line of explanation.

   It is one drawing with sixteen sets of labels, not sixteen drawings — so it is
   built once here and driven from data. The two endpoints are deliberately
   different shapes as well as different inks: the sender is drawn as ruled lines
   and the receiver as a disc, which is what tells them apart at a glance when
   the labels are too small to read. */

export type DiagramSpec = {
  /** the small caps line above the drawing */
  caption: string;
  left: { title: string; sub: string; tag: string };
  /** what travels into the device */
  inLabel: string;
  /** the interface it arrives on, set over the arrow — only the boxes that name
      their ports carry it (a router's eth0, a firewall's outside) */
  inPort?: string;
  /** `badge` is struck under a rule inside the box — the one value it owns */
  device: { name: string; line1: string; line2: string; badge?: string };
  /** what leaves it */
  outLabel: string;
  outPort?: string;
  right: { title: string; sub: string; tag: string };
  /** the small table the box consults or produces. Omitted for the devices whose
      work has no table in it — a repeater keeps no state at all */
  table?: {
    label: string;
    /** `hi` strikes the row in the accent — the one the example turns on */
    rows: { l: string; r: string; hi?: boolean }[];
  };
  /** an alternative to `table` for the boxes whose subject is a thing laid out
      end to end rather than a list of entries — the NIC draws the frame it
      builds, field by field, instead of a table it looks anything up in */
  frame?: {
    label: string;
    /** `grow` widens a field against its neighbours; `hi` is the one the page is about */
    cells: { k: string; v: string; hi?: boolean; grow?: number }[];
  };
  note: Rich;
};

export default function DeviceDiagram({ spec }: { spec: DiagramSpec }) {
  return (
    <div className={styles.plate}>
      <div className={styles.caption}>{spec.caption}</div>

      <div className={styles.flow}>
        <div className={`${styles.end} ${styles.endLeft}`}>
          {/* ruled lines: the side that is already digital, already framed */}
          <div className={`${styles.glyph} ${styles.glyphLines}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.endTitle}>{spec.left.title}</div>
          <div className={`${styles.endSub} ${styles.inkA}`}>{spec.left.sub}</div>
          <div className={`${styles.endTag} ${styles.inkA}`}>{spec.left.tag}</div>
        </div>

        <div className={styles.arrowCell}>
          {spec.inPort && <div className={`${styles.port} ${styles.inkA}`}>{spec.inPort}</div>}
          <div className={`${styles.arrow} ${styles.arrowA}`} aria-hidden="true">
            <span className={styles.shaft} />
            <span className={styles.head} />
          </div>
          <div className={`${styles.arrowLabel} ${styles.inkA}`}>{spec.inLabel}</div>
        </div>

        <div className={styles.device}>
          <div className={styles.deviceName}>{spec.device.name}</div>
          <div className={styles.deviceSub}>
            {spec.device.line1}
            <br />
            {spec.device.line2}
          </div>
          {/* the one value the box carries as its own — a MAC, struck under a
              rule so it reads as a plate on the hardware, not as more prose */}
          {spec.device.badge && <div className={styles.deviceBadge}>{spec.device.badge}</div>}
        </div>

        <div className={styles.arrowCell}>
          {spec.outPort && <div className={`${styles.port} ${styles.inkB}`}>{spec.outPort}</div>}
          <div className={`${styles.arrow} ${styles.arrowB}`} aria-hidden="true">
            <span className={styles.shaft} />
            <span className={styles.head} />
          </div>
          <div className={`${styles.arrowLabel} ${styles.inkB}`}>{spec.outLabel}</div>
        </div>

        <div className={`${styles.end} ${styles.endRight}`}>
          {/* a disc: the far side, whose internals are not this page's subject */}
          <div className={`${styles.glyph} ${styles.glyphDisc}`} aria-hidden="true">
            <span />
          </div>
          <div className={styles.endTitle}>{spec.right.title}</div>
          <div className={`${styles.endSub} ${styles.inkB}`}>{spec.right.sub}</div>
          <div className={`${styles.endTag} ${styles.inkB}`}>{spec.right.tag}</div>
        </div>
      </div>

      {spec.table && (
        <div className={styles.tableWrap}>
          <div className={styles.tableLabel}>{spec.table.label}</div>
          <div className={styles.table}>
            {spec.table.rows.map((r) => (
              <div key={r.l} className={r.hi ? `${styles.row} ${styles.rowHi}` : styles.row}>
                <span>{r.l}</span>
                <span className={styles.rowRight}>{r.r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {spec.frame && (
        <div className={styles.frameWrap}>
          <div className={styles.tableLabel}>{spec.frame.label}</div>
          <div className={styles.frame}>
            {spec.frame.cells.map((c) => (
              <div
                key={c.k}
                className={c.hi ? `${styles.cell} ${styles.cellHi}` : styles.cell}
                style={{ flex: c.grow ?? 1 }}
              >
                <div className={styles.cellKey}>{c.k}</div>
                <div className={styles.cellVal}>{c.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={styles.note}>
        <RichText parts={spec.note} />
      </p>
    </div>
  );
}
