import fs from 'node:fs';
import path from 'node:path';

/* Which photographs actually exist.

   Pages are generated at build time, so rather than making every page guess or
   the browser probe for a missing file, the folder is read once here and the
   result handed to the pages as plain data. A device with no photograph keeps
   its ruled placeholder; drop a file in and the next build picks it up with no
   code change at all.

   Files live under public/photo/<kind>/<slug>.<ext>, so the browser fetches
   them from /photo/<kind>/<slug>.<ext>. The slug is the same one the URL uses —
   /devices/access-point wants access-point.jpg — which is what makes the match
   automatic. */

export type PhotoKind = 'devices' | 'cables' | 'connectors';

/** the formats worth accepting, best first — webp before jpg where both exist */
const EXTENSIONS = ['.webp', '.avif', '.png', '.jpg', '.jpeg'];

const ROOT = path.join(process.cwd(), 'public', 'photo');

/** slug → public URL, for every image found in one folder */
function readFolder(kind: PhotoKind): Record<string, string> {
  const dir = path.join(ROOT, kind);

  let names: string[];
  try {
    names = fs.readdirSync(dir);
  } catch {
    // the folder may not exist yet on a fresh checkout — that is not an error
    return {};
  }

  const found: Record<string, string> = {};

  for (const ext of [...EXTENSIONS].reverse()) {
    // reversed so that a better format later in the loop overwrites a worse one
    for (const name of names) {
      if (path.extname(name).toLowerCase() !== ext) continue;
      const slug = path.basename(name, path.extname(name)).toLowerCase();
      found[slug] = `/photo/${kind}/${name}`;
    }
  }

  return found;
}

const cache: Partial<Record<PhotoKind, Record<string, string>>> = {};

/* In a build the folder is read once and the answer reused across all sixteen
   pages. In development it is read every time, so that dropping a file in shows
   up on the next refresh rather than after restarting the server — which is the
   whole point of being able to just add a photograph. */
const CACHE = process.env.NODE_ENV === 'production';

/** the photograph for this slug, or undefined if none has been added yet */
export function photoFor(kind: PhotoKind, slug: string): string | undefined {
  if (!CACHE) return readFolder(kind)[slug.toLowerCase()];
  cache[kind] ??= readFolder(kind);
  return cache[kind]![slug.toLowerCase()];
}
