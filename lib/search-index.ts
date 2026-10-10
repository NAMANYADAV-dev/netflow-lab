/* What the site can be searched for.

   Built on the server and handed to the navbar as data, because the records it
   reads from — protocol-pages and device-pages — carry every page's prose and
   have no business in a client bundle. What crosses the boundary is one short
   row per destination.

   Everything the site publishes is in here: the protocols that have a page, the
   devices, the cables and connectors, the Linux commands and directories, the
   labs, the parts of a page worth landing on directly — a protocol category, a
   layer of the stack, a shelf of commands — and the section fronts themselves,
   so that typing "stack" reaches the page as readily as typing a protocol
   name does. */

import {
  BENCH_HREF,
  CABLES_HREF,
  DEVICES_HREF,
  LABS_HREF,
  LINUX_HREF,
  LINUX_INTRO_HREF,
  STACK_HREF,
} from './atlas-data';
import { cableHref, cables } from './cable-data';
import { connectorHref, connectors } from './connector-data';
import { deviceHref, devices } from './device-data';
import { devicePages } from './device-pages';
import { labs } from './lab-data';
import { linuxCommands, linuxGroupById, linuxGroups, linuxHref } from './linux-data';
import { linuxSwitches } from './linux-switches';
import { linuxDirHref, linuxDirs, treeGroupById } from './linux-tree';
import { protocolBySlug, protocolCategories, protocolCategoryById, protocolCount, protocols } from './protocol-data';
import { protocolPages } from './protocol-pages';
import { layerDetails, pduByLayer, tcpIpLayers } from './stack-data';

export type SearchKind = 'protocol' | 'device' | 'cable' | 'connector' | 'command' | 'directory' | 'lab' | 'topic' | 'section';

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
     page bodies, so the index stays a few kilobytes on the wire.

     Protocol and device entries also carry the headings of their own page —
     the facts table, the numbered steps, the security notes — so a term that
     only appears inside a page ("three-way handshake", "EtherType", "DORA")
     still finds the page it is explained on. Headings, never the prose. */
  alt: string[];
};

/* Protocols are keyed off the page records rather than the catalogue: the
   catalogue lists more protocols than have been written up, and a result that
   leads to a 404 is worse than no result. */
/** the short labels a write-up is organised under: its facts, steps and cautions */
function headings(page: {
  points: { k: string; v: string }[];
  steps: { t: string }[];
  security: { points: { t: string }[] };
  beats?: { items: { t: string }[] };
  rides?: { t: string }[];
}): string[] {
  return [
    ...page.points.map((p) => `${p.k} ${p.v}`),
    ...page.steps.map((s) => s.t),
    ...page.security.points.map((s) => s.t),
    ...(page.beats?.items.map((b) => b.t) ?? []),
    ...(page.rides?.map((r) => r.t) ?? []),
  ];
}

const protocolEntries: SearchEntry[] = Object.entries(protocolPages).map(([slug, page]) => {
  const catalogued = protocolBySlug[slug];
  const category = catalogued ? protocolCategoryById[catalogued.cat]?.name : undefined;
  return {
    title: page.title,
    detail: category ? `${page.sub} · ${category}` : page.sub,
    href: `/protocols/${slug}`,
    kind: 'protocol',
    alt: [slug, page.sub, page.crumb, catalogued?.name, catalogued?.port, catalogued?.fn, ...headings(page)].filter(
      (s): s is string => Boolean(s) && s !== '—',
    ),
  };
});

const deviceEntries: SearchEntry[] = devices.map((d) => ({
  title: d.abbr,
  detail: `${d.name} · ${d.layer}`,
  href: deviceHref(d),
  kind: 'device',
  alt: [d.slug, d.name, d.layer, d.fn, ...(devicePages[d.slug] ? headings(devicePages[d.slug]) : [])],
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

const commandEntries: SearchEntry[] = linuxCommands.map((c) => ({
  title: c.cmd,
  detail: `${c.sub} · ${linuxGroupById[c.group]?.name ?? 'Linux'}`,
  href: linuxHref(c),
  kind: 'command',
  /* the switches go in as typed, so "ls -a" finds ls */
  alt: [
    c.slug,
    'linux',
    c.pkg,
    c.fn,
    c.session.run,
    ...(linuxSwitches[c.slug] ?? []).map((s) => `${c.cmd} ${s.flag}`),
  ],
}));

const directoryEntries: SearchEntry[] = linuxDirs.map((d) => ({
  title: d.path,
  detail: `${d.sub} · ${treeGroupById[d.group]?.name ?? 'Linux'}`,
  href: linuxDirHref(d),
  kind: 'directory',
  alt: [d.slug, 'linux', 'directory', 'folder', d.fn, ...d.inside.map((item) => `${d.path === '/' ? '' : d.path}/${item.name}`)],
}));

const labEntries: SearchEntry[] = labs.map((l) => ({
  title: `${l.abbr} lab`,
  detail: `${l.layer} · ${l.difficulty}`,
  href: l.href,
  kind: 'lab',
  alt: [l.abbr, 'lab', 'interactive', 'simulation', l.difficulty, l.description],
}));

/* The things a reader looks for that are a part of a page rather than a page:
   a protocol category on the Bench, one layer of the stack, a shelf of Linux
   commands. Each lands on the anchor where that part starts. */
const topicEntries: SearchEntry[] = [
  ...protocolCategories.map((c): SearchEntry => ({
    title: c.name,
    detail: `${protocols.filter((p) => p.cat === c.id).length} protocols · ${c.blurb}`,
    href: `${BENCH_HREF}#category-${c.id}`,
    kind: 'topic',
    alt: ['category', 'protocols', ...protocols.filter((p) => p.cat === c.id).map((p) => p.abbr)],
  })),
  ...layerDetails.map((l): SearchEntry => ({
    title: `Layer ${l.n} · ${l.name}`,
    detail: `OSI model · carries ${pduByLayer[l.n].toLowerCase()} · ${l.examples}`,
    href: `${STACK_HREF}#layer-${l.n}`,
    kind: 'topic',
    alt: ['osi', 'layer', `l${l.n}`, `${l.name} layer`, pduByLayer[l.n], l.body],
  })),
  ...linuxGroups.map((g): SearchEntry => ({
    title: g.name,
    detail: `Linux commands · ${g.blurb}`,
    href: `${LINUX_HREF}#group-${g.id}`,
    kind: 'topic',
    alt: ['linux', 'commands', ...linuxCommands.filter((c) => c.group === g.id).map((c) => c.cmd)],
  })),
  {
    title: 'Internet, intranet and extranet',
    detail: 'Who is allowed inside — three networks, three access boundaries',
    href: `${LABS_HREF}#network-scopes`,
    kind: 'topic',
    alt: ['internet', 'intranet', 'extranet', 'public network', 'private network', 'trusted access', 'isp', 'lan'],
  },
  {
    title: 'Connectors',
    detail: `${connectors.length} plugs and what each one terminates`,
    href: `${CABLES_HREF}#connectors`,
    kind: 'topic',
    alt: ['plug', 'jack', 'termination', ...connectors.map((c) => c.name)],
  },
  {
    title: 'The Linux directory tree',
    detail: 'From / down — what lives in each directory',
    href: `${LINUX_INTRO_HREF}#tree`,
    kind: 'topic',
    alt: ['filesystem', 'file system', 'fhs', 'folders', 'root', ...linuxDirs.map((d) => d.path)],
  },
];

const sectionEntries: SearchEntry[] = [
  {
    title: 'The Protocol Atlas',
    detail: 'The front page — the stack, the categories and where to start',
    href: '/',
    kind: 'section',
    alt: ['home', 'front page', 'start', 'atlas', 'netflow lab'],
  },
  {
    title: 'The Stack',
    detail: 'OSI and TCP/IP side by side, layer by layer',
    href: STACK_HREF,
    kind: 'section',
    alt: ['osi', 'tcp/ip', 'layers', 'model', 'encapsulation', 'pdu', 'segment', 'packet', 'frame', 'bits', ...tcpIpLayers.map((l) => `${l.name} layer`)],
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
    title: 'Linux commands',
    detail: `${linuxCommands.length} shell and networking commands, each with a session read line by line`,
    href: LINUX_HREF,
    kind: 'section',
    alt: ['linux', 'terminal', 'shell', 'cli', 'command line', 'bash', 'navigation', 'file management', 'permissions'],
  },
  {
    title: 'What is Linux',
    detail: 'What it is, why it is used, and the directory tree from / down',
    href: LINUX_INTRO_HREF,
    kind: 'section',
    alt: ['linux', 'kernel', 'distribution', 'distro', 'filesystem', 'directory tree', 'file structure', 'fhs', '/etc', '/home', '/var', '/usr', 'root'],
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
  ...commandEntries,
  ...directoryEntries,
  ...topicEntries,
  ...sectionEntries,
];

/** what the palette offers before anything has been typed */
export const searchDefaults: SearchEntry[] = sectionEntries;
