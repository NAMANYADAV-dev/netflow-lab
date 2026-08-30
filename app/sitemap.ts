import type { MetadataRoute } from 'next';
import { cables } from '@/lib/cable-data';
import { connectors } from '@/lib/connector-data';
import { devices } from '@/lib/device-data';
import { labs } from '@/lib/lab-data';
import { protocolPages } from '@/lib/protocol-pages';
import { site } from '@/lib/site';

/* Built from the same catalogues the pages are, so a protocol or a lab added
   tomorrow appears here without anyone remembering to come back. Entries are
   listed by how central they are, not by how often they change: this content
   is written once and revised rarely, so `changeFrequency` would be a guess
   and `priority` is the only honest signal. */

const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number) => ({
    url: new URL(path, site.origin).toString(),
    lastModified: now,
    priority,
  });

  return [
    entry('/', 1),
    entry('/lab', 0.9),
    entry('/bench', 0.8),
    entry('/stack', 0.8),
    entry('/devices', 0.7),
    entry('/cables', 0.7),

    /* the labs are the thing this site does that others do not */
    ...labs.map((lab) => entry(lab.href, 0.8)),

    ...Object.keys(protocolPages).map((slug) => entry(`/protocols/${slug}`, 0.6)),
    ...devices.map((device) => entry(`/devices/${device.slug}`, 0.5)),
    ...cables.map((cable) => entry(`/cables/${cable.slug}`, 0.5)),
    ...connectors.map((connector) => entry(`/cables/connectors/${connector.slug}`, 0.5)),
  ];
}
