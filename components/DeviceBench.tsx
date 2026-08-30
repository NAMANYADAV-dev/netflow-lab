'use client';

import Link from 'next/link';
import { useState } from 'react';
import { deviceById, deviceGroups, deviceHref, devicesByGroup } from '@/lib/device-data';
import shell from '@/app/shell.module.css';
import styles from './device-bench.module.css';

/* The reading table and the index below it. They are one component because they
   share one piece of state: which device is on the table. A card in the index,
   a chip dragged out of the nav, and a "sits beside" tag in the bench itself all
   put something there. */
export default function DeviceBench() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? deviceById[selectedId] : null;

  const startDrag = (id: string) => (e: React.DragEvent) => {
    try {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'copy';
    } catch {
      // the click path still works if the browser locks dataTransfer
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    // guard the payload: the nav drags protocol and cable ids onto the same
    // page, and neither belongs on this table
    if (id && deviceById[id]) setSelectedId(id);
  };

  /* without preventDefault on dragover the drop never fires — the browser's
     default is to reject the drag */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const groupName = (id: string) => deviceGroups.find((g) => g.id === id)?.name ?? '';
  const beside = (selected?.works ?? []).map((id) => deviceById[id]).filter(Boolean);

  return (
    <>
      {/* ── the bench ────────────────────────────────────────────────── */}
      <section id="bench" className={`${shell.wrap} ${styles.benchSection}`}>
        <div className={styles.benchHead}>
          <h2 className={shell.sectionTitle}>The bench</h2>
          <span className={styles.benchNote}>
            Drag a device onto the reading table — or click it.
          </span>
        </div>

        <div className={styles.table} onDrop={onDrop} onDragOver={onDragOver}>
          {!selected ? (
            <div className={styles.empty}>
              <div className={styles.emptyMark} aria-hidden="true">
                &#8615;
              </div>
              <div className={styles.emptyTitle}>The table is empty</div>
              <p className={styles.emptyBody}>
                Drop any device here to lay it out: which OSI layer it reads, what it does, the
                protocols it runs, and the devices it sits beside.
              </p>
            </div>
          ) : (
            <div className={styles.filled}>
              <div className={styles.filledHead}>
                <div>
                  <div className={styles.filledGroup}>{groupName(selected.group)}</div>
                  <div className={styles.filledTitle}>
                    <span className={styles.filledAbbr}>{selected.abbr}</span>
                    <span className={styles.filledName}>{selected.name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className={`btn btn-secondary ${styles.clear}`}
                >
                  Clear
                </button>
              </div>

              <p className={styles.filledFn}>{selected.fn}</p>

              <div className={styles.operatesAt}>
                <span className={styles.metaLabel}>Operates at</span>
                <span className={`tag tag-neutral ${styles.layerTag}`}>{selected.layer}</span>
              </div>

              <div className={styles.filledCols}>
                {selected.runs.length > 0 && (
                  <div>
                    <div className={styles.metaLabel}>Runs / carries</div>
                    <div className={styles.chipRow}>
                      {selected.runs.map((r) => (
                        <span className={styles.protoChip} key={r}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {beside.length > 0 && (
                  <div>
                    <div className={styles.metaLabel}>Sits beside</div>
                    <div className={styles.chipRow}>
                      {beside.map((w) => (
                        <button
                          type="button"
                          key={w.id}
                          onClick={() => setSelectedId(w.id)}
                          className={`tag tag-outline ${styles.besideTag}`}
                        >
                          {w.abbr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* the bench is the summary; the device's own page is the rest */}
              <Link href={deviceHref(selected)} className={styles.readMore}>
                Read the full page &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── the index ────────────────────────────────────────────────── */}
      <section id="index" className={`${shell.wrap} ${styles.indexSection}`}>
        <div className={shell.sectionHead}>
          <div className={shell.sectionHeadRow}>
            <h2 className={shell.sectionTitle}>The index</h2>
            <span className={shell.sectionNote}>
              Every device, filed by the highest layer it reads.
            </span>
          </div>
        </div>

        <div className={styles.groups}>
          {devicesByGroup.map((g) => (
            <div className={styles.group} key={g.id}>
              {/* sticks while its own devices scroll past, so the layer you are
                  reading is always named */}
              <div className={styles.groupLabel}>
                <h3 className={styles.groupName}>{g.name}</h3>
                <p className={styles.groupBlurb}>{g.blurb}</p>
              </div>

              <div className={styles.groupItems}>
                {/* two affordances, deliberately separate: the card body puts the
                    device on the bench, the link at its foot opens its page. They
                    are siblings rather than nested, because a link inside a
                    button is neither valid nor operable. */}
                {g.items.map((d) => (
                  <div className={styles.cardShell} key={d.id}>
                    <button
                      type="button"
                      draggable
                      onDragStart={startDrag(d.id)}
                      onClick={() => setSelectedId(d.id)}
                      className={`card elev-sm ${styles.deviceCard}`}
                      aria-pressed={selectedId === d.id}
                    >
                      <span className={styles.deviceCardHead}>
                        <span className={styles.deviceAbbr}>{d.abbr}</span>
                        <span className={styles.deviceLayer}>{d.layer}</span>
                      </span>
                      <span className={styles.deviceFn}>{d.fn}</span>
                    </button>

                    <Link
                      href={deviceHref(d)}
                      className={styles.cardOpen}
                      aria-label={`Open the ${d.abbr} page`}
                    >
                      Open&nbsp;&rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
