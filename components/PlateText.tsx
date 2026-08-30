/* The two text treatments of the print grammar. Both stack four copies of the
   same string: a `.paper` span carrying the real text (the white of the sheet,
   and the only copy assistive tech sees) under three aria-hidden C/M/Y `.plate`
   repeats that multiply together. There is no K plate — the dark core is the
   C×M×Y overlap, and the fringes are the registration drift.

   The geometry lives entirely in broadsheet.css; these components only lay down
   the markup the construction expects. Both are server components — the plates
   are inert, and only the pointer lean (a custom property the press driver
   publishes on :root) moves them. */

/** One line of a plate headline. Each line is its own registration box, so a
    multi-line headline passes one <PlateLine> per line rather than a string
    with breaks in it. */
export function PlateLine({ text }: { text: string }) {
  return (
    <span className="line">
      <span className="paper">{text}</span>
      <span className="plate plate-c" aria-hidden="true">{text}</span>
      <span className="plate plate-m" aria-hidden="true">{text}</span>
      <span className="plate plate-y" aria-hidden="true">{text}</span>
    </span>
  );
}

/** A display numeral set as misregistered plates — the stat-row treatment. Takes
    the numeral's own offsets (double the headline's), and paints its own paper
    ground so the multiply works inside an isolated stacking context. */
export function PlateNumber({ value, className, style }: {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={className ? `cmyk-num ${className}` : 'cmyk-num'} style={style}>
      <span className="paper">{value}</span>
      <span className="plate plate-c" aria-hidden="true">{value}</span>
      <span className="plate plate-m" aria-hidden="true">{value}</span>
      <span className="plate plate-y" aria-hidden="true">{value}</span>
    </span>
  );
}
