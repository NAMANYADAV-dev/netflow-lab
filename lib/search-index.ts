/* What the site can be searched for.

   Built on the server and handed to the navbar as data, because the records it
   reads from — protocol-pages and device-pages — carry every page's prose and
   have no business in a client bundle. What crosses the boundary is one short
   row per destination.

   Everything the site publishes is in here: the protocols that have a page, the
   devices, the cables and connectors, the labs, and the section fronts
   themselves, so that typing "stack" reaches the page as readily as typing a
   protocol name does. */

import { BENCH_HREF, CABLES_HREF, DEVICES_HREF, LABS_HREF, STACK_HREF } from './atlas-data';
import { cableHref, cables } from './cable-data';
import { connectorHref, connectors } from './connector-data';
import { deviceHref, devices } from './device-data';
import { labs } from './lab-data';
import { protocolBySlug, protocolCategoryById, protocolCount } from './protocol-data';
import { protocolPages } from './protocol-pages';

export type SearchKind = 'protocol' | 'device' | 'cable' | 'connector' | 'lab' | 'section';

export type SearchEntry = {
  /** what the result is called */
  title: string;
  /** the line under the title */
  detail: string;
  href: string;
  kind: SearchKind;
  /* The other strings a query may land on: slugs, full names, tags, and the
     one-line function each record already carries. The one-liners are what let
     a reader who remembers a behaviour rather than a name — "handshake",
     "broadcast" — still arrive somewhere. They are one sentence each, not the
     page bodies, so the index stays a few kilobytes on the wire. */
  alt: string[];
};

/* Protocols are keyed off the page records rather than the catalogue: the
   catalogue lists more protocols than have been written up, and a result that
   leads to a 404 is worse than no result. */
const protocolEntries: SearchEntry[] = Object.entries(protocolPages).map(([slug, page]) => {
  const catalogued = protocolBySlug[slug];
  const category = catalogued ? protocolCategoryById[catalogued.cat]?.name : undefined;
  return {
    title: page.title,
    detail: category ? `${page.sub} · ${category}` : page.sub,
    href: `/protocols/${slug}`,
    kind: 'protocol',
    alt: [slug, page.sub, page.crumb, catalogued?.name, catalogued?.port, catalogued?.fn].filter(
      (s): s is string => Boolean(s) && s !== '—',
    ),
  };
});

const deviceEntries: SearchEntry[] = devices.map((d) => ({
  title: d.abbr,
  detail: `${d.name} · ${d.layer}`,
  href: deviceHref(d),
  kind: 'device',
  alt: [d.slug, d.name, d.layer, d.fn],
}));

const cableEntries: SearchEntry[] = cables.map((c) => ({
  title: c.shortName,
  detail: c.spec,
  href: cableHref(c),
  kind: 'cable',
  alt: [c.slug, c.name, c.fn, ...c.tags],
}));

const connectorEntries: SearchEntry[] = connectors.map((c) => ({
  title: c.name,
  detail: c.spec,
  href: connectorHref(c),
  kind: 'connector',
  alt: [c.slug, c.fn, ...c.tags],
}));

const labEntries: SearchEntry[] = labs.map((l) => ({
  title: `${l.abbr} lab`,
  detail: `${l.layer} · ${l.difficulty}`,
  href: l.href,
  kind: 'lab',
  alt: [l.abbr, 'lab', 'interactive', l.difficulty, l.description],
}));

const sectionEntries: SearchEntry[] = [
  {
    title: 'The Stack',
    detail: 'OSI and TCP/IP side by side, layer by layer',
    href: STACK_HREF,
    kind: 'section',
    alt: ['osi', 'tcp/ip', 'layers', 'model', 'encapsulation'],
  },
  {
    title: 'The Bench',
    detail: `All ${protocolCount} protocols, indexed on one page`,
    href: BENCH_HREF,
    kind: 'section',
    alt: ['protocols', 'index', 'catalogue', 'all'],
  },
  {
    title: 'Network devices',
    detail: `${devices.length} boxes, by the layer they work at`,
    href: DEVICES_HREF,
    kind: 'section',
    alt: ['hardware', 'boxes', 'router', 'switch'],
  },
  {
    title: 'Cables and connectors',
    detail: `${cables.length} cable types and ${connectors.length} connector guides`,
    href: CABLES_HREF,
    kind: 'section',
    alt: ['wire', 'fibre', 'fiber', 'copper', 'plug'],
  },
  {
    title: 'Protocol labs',
    detail: `${labs.length} interactive labs with step-by-step packet flows`,
    href: LABS_HREF,
    kind: 'section',
    alt: ['labs', 'interactive', 'simulate', 'practice'],
  },
];

export const searchIndex: SearchEntry[] = [
  ...protocolEntries,
  ...labEntries,
  ...deviceEntries,
  ...cableEntries,
  ...connectorEntries,
  ...sectionEntries,
];

/** what the palette offers before anything has been typed */
export const searchDefaults: SearchEntry[] = sectionEntries;
