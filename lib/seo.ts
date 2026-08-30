import type { Metadata } from 'next';
import { site } from './site';

/* Next.js inherits an `openGraph` block from a parent layout, but it does not
   copy a page's own `title` and `description` into it — so a page that sets
   only those two ends up sharing the site-wide card everywhere. Every page
   here has a real title and a real description already; this just makes sure
   the share card and the canonical say the same thing the page does. */
export function pageMeta({
  title,
  description,
  path,
  type = 'article',
}: {
  /** the full <title>, as the page already writes it */
  title: string;
  description: string;
  /** site-relative, leading slash — becomes the canonical and the og:url */
  path: string;
  type?: 'website' | 'article';
}): Metadata {
  return {
    /* `absolute` opts out of the root's "%s · NetFlow Lab" template: these
       titles already carry the brand, and letting the template run would
       append it a second time */
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: site.locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
