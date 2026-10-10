/* The words inside the pages, for the search palette.

   search-index.ts is what the navbar carries on every page, so it holds one
   short row per destination and nothing of the pages' prose. This is the other
   half: for each of those destinations, everything the page actually says —
   its paragraphs, steps, notes, table cells, terminal sessions. It is far too
   heavy to ship with every page, so it is published once as a static file
   (app/search-index.json) and the palette fetches it the first time it opens.

   The text is gathered by walking the same records the pages are rendered
   from, rather than by listing fields, so a field added to a page tomorrow is
   searchable tomorrow without anyone remembering to add it here. */

import * as dhcpLab from '@/app/lab/dhcp/dhcp-data';
import * as dnsLab from '@/app/lab/dns/dns-data';
import * as ftpLab from '@/app/lab/ftp/ftp-data';
import * as httpLab from '@/app/lab/http/http-data';
import * as httpsLab from '@/app/lab/https/https-data';
import * as icmpLab from '@/app/lab/icmp/icmp-data';
import * as ipLab from '@/app/lab/ip/ip-data';
import * as mailLab from '@/app/lab/mail/mail-data';
import * as snmpLab from '@/app/lab/snmp/snmp-data';
import * as telnetLab from '@/app/lab/telnet/telnet-data';
import * as udpLab from '@/app/lab/udp/udp-data';
import { STACK_HREF } from './atlas-data';
import { cableHref, cables } from './cable-data';
import { connectorHref, connectors } from './connector-data';
import { deviceHref, devices } from './device-data';
import { devicePages } from './device-pages';
import { labs } from './lab-data';
import { linuxCommands, linuxHref } from './linux-data';
import { linuxSwitches } from './linux-switches';
import { linuxDirHref, linuxDirs } from './linux-tree';
import { protocolPages } from './protocol-pages';
import { encapRows, layerDetails, whyTwoModels } from './stack-data';

/* Fields that describe how a record is wired up or drawn, not what it says:
   ids, slugs and links to other records, and the tone a diagram is painted in. */
const SKIP = new Set(['id', 'slug', 'href', 'cat', 'group', 'kind', 'tone', 'rel', 'related', 'protocols', 'shape', 'status']);

/* A Rich run is one sentence cut into plain and marked-up pieces — a string
   here, { b: … } there. It has to go back together as the sentence it is, or a
   phrase that crosses a bold word could never be found. */
const RICH_MARKS = new Set(['a', 'b', 'i', 's', 'm']);
function richRun(value: unknown[]): string | undefined {
  const pieces: string[] = [];
  let marked = false;
  for (const item of value) {
    if (typeof item === 'string') pieces.push(item);
    else if (item && typeof item === 'object') {
      const entries = Object.entries(item);
      if (entries.length !== 1 || !RICH_MARKS.has(entries[0][0]) || typeof entries[0][1] !== 'string') return undefined;
      pieces.push(entries[0][1]);
      marked = true;
    } else return undefined;
  }
  return marked ? pieces.join('') : undefined;
}

/** every piece of prose in a record, in the order the page prints it */
function proseOf(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (value.trim().length > 1) out.push(value.trim());
  } else if (Array.isArray(value)) {
    const sentence = richRun(value);
    if (sentence) out.push(sentence.trim());
    else for (const item of value) proseOf(item, out);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) if (!SKIP.has(key)) proseOf(item, out);
  }
  return out;
}

const text = (...values: unknown[]) => values.flatMap((v) => proseOf(v)).join(' · ');

const labData: Record<string, unknown> = {
  '/lab/dhcp': dhcpLab,
  '/lab/dns': dnsLab,
  '/lab/ftp': ftpLab,
  '/lab/http': httpLab,
  '/lab/https': httpsLab,
  '/lab/icmp': icmpLab,
  '/lab/ip': ipLab,
  '/lab/mail': mailLab,
  '/lab/snmp': snmpLab,
  '/lab/telnet': telnetLab,
  '/lab/udp': udpLab,
};

/** destination → everything its page says; the keys are search-index hrefs */
export const searchDeep: Record<string, string> = Object.fromEntries(
  [
    ...Object.entries(protocolPages).map(([slug, page]) => [`/protocols/${slug}`, text(page)]),
    ...devices.map((d) => [deviceHref(d), text(d, devicePages[d.slug])]),
    ...cables.map((c) => [cableHref(c), text(c)]),
    ...connectors.map((c) => [connectorHref(c), text(c)]),
    ...linuxCommands.map((c) => [linuxHref(c), text(c, linuxSwitches[c.slug])]),
    ...linuxDirs.map((d) => [linuxDirHref(d), text(d)]),
    ...labs.map((l) => [l.href, text(l, labData[l.href])]),
    ...layerDetails.map((l) => [`${STACK_HREF}#layer-${l.n}`, text(l)]),
    [STACK_HREF, text(whyTwoModels, encapRows)],
  ].filter(([, body]) => body),
);
