/* The design's running text is not plain: a sentence carries emphasis in three
   registers — italic for the definition, cyan for what the box does, magenta for
   the consequence. Authoring that as JSX inside the data file would put markup
   in the catalogue, so the data holds parts and this renders them.

   `a` prints in the first accent, `b` in the second, `i` in italic, `s` is
   emphasis in the plain text colour (for a term that is neither of the two
   accents' business — an operator like `::`), `m` sets a literal in the heading
   face, and a bare string is ordinary text. */

export type Rich = (
  | string
  | { a: string }
  | { b: string }
  | { i: string }
  | { s: string }
  | { m: string }
)[];

export default function RichText({ parts }: { parts: Rich }) {
  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === 'string') return <span key={i}>{p}</span>;
        if ('i' in p) return <em key={i}>{p.i}</em>;
        if ('s' in p) return (
          <strong key={i} className="rich-s">
            {p.s}
          </strong>
        );
        if ('m' in p) return (
          <span key={i} className="rich-m">
            {p.m}
          </span>
        );
        const cls = 'a' in p ? 'rich-a' : 'rich-b';
        const text = 'a' in p ? p.a : p.b;
        return (
          <strong key={i} className={cls}>
            {text}
          </strong>
        );
      })}
    </>
  );
}
