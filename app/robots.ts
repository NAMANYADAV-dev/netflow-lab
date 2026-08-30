import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/* Everything here is public reference material meant to be found, so the rule
   is simply "yes" — the file exists to point crawlers at the sitemap, which is
   the part that actually helps them. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', site.origin).toString(),
    host: site.origin,
  };
}
