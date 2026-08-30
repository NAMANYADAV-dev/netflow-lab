/* One place for the facts a deployed site needs to state about itself.

   The origin has to be absolute for Open Graph, canonicals and the sitemap to
   mean anything, and it is the one value that differs between a laptop, a
   Vercel preview and production. So it is read from the environment in that
   order of specificity rather than hard-coded: set NEXT_PUBLIC_SITE_URL once a
   custom domain exists, and everything downstream follows. */

import { labs } from './lab-data';

function resolveOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  /* Vercel injects the production domain at build time; on a preview
     deployment this is still the production one, which is what we want for
     canonicals — previews should not compete with production in an index. */
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

export const site = {
  name: 'NetFlow Lab',
  origin: resolveOrigin(),
  /* the masthead line, reused as the default share description */
  tagline: 'A field guide to the wire',
  description:
    `A working field guide to the 48 protocols that carry the modern internet — what each one does, where it sits, and how they fit together, with ${labs.length} interactive labs.`,
  locale: 'en_GB',
} as const;

/** absolute URL for a site-relative path, for metadata that cannot be relative */
export const absolute = (path: string) => new URL(path, site.origin).toString();
