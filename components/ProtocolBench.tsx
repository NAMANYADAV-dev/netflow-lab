'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  protocolById,
  protocolCategories,
  protocolHref,
  protocolSlug,
  protocolsByCategory,
} from '@/lib/protocol-data';
import { protocolPages } from '@/lib/protocol-pages';
import shell from '@/app/shell.module.css';
import styles from './protocol-bench.module.css';

/* The reading table, the tray under it and the filtered index below. All three
   share one piece of state — which protocol is on the table — so they are one
   component. A tray chip, an index card and a "works with" tag all put something
   there, and the nav's Protocols menu drags ids onto it from another page. */
export default function ProtocolBench() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const selected = selectedId ? protocolById[selectedId] : null;

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
    // the nav drags device and cable ids across the site too; only a protocol
    // belongs on this table
    if (id && protocolById[id]) setSelectedId(id);
  };

  /* without preventDefault on dragover the drop never fires — the browser's
     default is to reject the drag */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const catName = (id: string) => protocolCategories.find((c) => c.id === id)?.name ?? '';
  const stack = (selected?.stack ?? []).map((id) => protocolById[id]).filter(Boolean);
  const related = (selected?.rel ?? []).map((id) => protocolById[id]).filter(Boolean);

  return (
    <>
      {/* ── the bench ────────────────────────────────────────────────── */}
      <section id="bench" className={`${shell.wrap} ${styles.benchSection}`}>
        <div className={styles.benchHead}>
          <h2 className={shell.sectionTitle}>The bench</h2>
          <span className={styles.benchNote}>
            Drag a chip from the tray onto the reading table — or click it.
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
                Drop any protocol here to lay it out: what it does, its port or number, the stack it
                rides in, and the protocols it works with.
              </p>
            </div>
          ) : (
            <div className={styles.filled}>
              <div className={styles.filledHead}>
                <div>
                  <div className={styles.filledCat}>{catName(selected.cat)}</div>
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

              <div className={styles.portRow}>
                <span className={styles.metaLabel}>Port / number</span>
                <span className={`tag tag-neutral ${styles.portTag}`}>{selected.port}</span>
              </div>

              <div className={styles.filledCols}>
                {stack.length > 0 && (
                  <div>
                    <div className={styles.metaLabel}>Sits in the stack</div>
                    <div className={styles.stackList}>
                      {stack.map((s) => (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setSelectedId(s.id)}
                          /* the protocol on the table is one of its own layers —
                             marking it shows where in the encapsulation you are */
                          className={`${styles.stackRow} ${s.id === selected.id ? styles.stackRowCurrent : ''}`}
                          aria-current={s.id === selected.id ? 'true' : undefined}
                        >
                          <span className={styles.stackAbbr}>{s.abbr}</span>
                          <span className={styles.stackName}>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {related.length > 0 && (
                  <div>
                    <div className={styles.metaLabel}>Works with</div>
                    <div className={styles.chipRow}>
                      {related.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => setSelectedId(r.id)}
                          className={`tag tag-outline ${styles.relTag}`}
                        >
                          {r.abbr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── the tray ───────────────────────────────────────────────── */}
        <div className={styles.tray}>
          <div className={styles.trayLabel}>The tray — drag or click any chip up to the table</div>
          <div className={styles.trayGroups}>
            {protocolsByCategory.map((g) => (
              <div className={styles.trayGroup} key={g.id}>
                <div className={styles.trayGroupName}>{g.name}</div>
                <div className={styles.trayChips}>
                  {g.items.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      draggable
                      onDragStart={startDrag(p.id)}
                      onClick={() => setSelectedId(p.id)}
                      title={p.name}
                      className={`${styles.trayChip} ${selectedId === p.id ? styles.trayChipOn : ''}`}
                    >
                      {p.abbr}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── the index ────────────────────────────────────────────────── */}
      <section id="index" className={`${shell.wrap} ${styles.indexSection}`}>
        <div className={shell.sectionHead}>
          <div className={shell.sectionHeadRow}>
            <h2 className={shell.sectionTitle}>The index</h2>
            <span className={shell.sectionNote}>
              Every protocol, filed by its role in the network.
            </span>
          </div>
        </div>

        <div className={styles.filters}>
          {[{ id: 'all', name: 'All' }, ...protocolCategories].map((f) => (
            <button
              type="button"
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`${styles.filter} ${filter === f.id ? styles.filterOn : ''}`}
              aria-pressed={filter === f.id}
            >
              {f.name}
            </button>
          ))}
        </div>

        <div className={styles.groups}>
          {protocolsByCategory
            .filter((c) => filter === 'all' || filter === c.id)
            .map((c) => (
              <div className={styles.group} id={`category-${c.id}`} key={c.id}>
                <div className={styles.groupLabel}>
                  <h3 className={styles.groupName}>{c.name}</h3>
                  <p className={styles.groupBlurb}>{c.blurb}</p>
                </div>

                <div className={styles.groupItems}>
                  {c.items.map((p) => (
                    /* the card itself stays a button — it is dragged and it
                       selects. The link to the protocol's own page is a sibling,
                       because a link inside a button is neither valid nor
                       operable. */
                    <div className={styles.cardShell} key={p.id}>
                      <button
                        type="button"
                        draggable
                        onDragStart={startDrag(p.id)}
                        onClick={() => setSelectedId(p.id)}
                        className={`card elev-sm ${styles.protoCard}`}
                        aria-pressed={selectedId === p.id}
                      >
                        <span className={styles.protoCardHead}>
                          <span className={styles.protoAbbr}>{p.abbr}</span>
                          <span className={styles.protoPort}>{p.port}</span>
                        </span>
                        <span className={styles.protoName}>{p.name}</span>
                        <span className={styles.protoFn}>{p.fn}</span>
                      </button>
                      {protocolPages[protocolSlug(p)] && (
                        <Link href={protocolHref(p)} className={styles.cardOpen}>
                          Open &rarr;
                        </Link>
                      )}
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
