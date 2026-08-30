/* Content for the Protocol Atlas landing page. Ported from the renderVals() of
   the Claude Design source (Protocol Atlas.dc.html) — kept in one place so the
   page components stay markup. */

import { countByCategory, protocolCategories, protocolCount } from './protocol-data';

export const BENCH_HREF = '/bench';
export const STACK_HREF = '/stack';
export const DEVICES_HREF = '/devices';
export const CABLES_HREF = '/cables';
export const LABS_HREF = '/lab';

export type Stat = { num: string; label: string };

export const stats: Stat[] = [
  { num: String(protocolCount), label: 'protocols, filed & cross-linked' },
  { num: '11', label: 'protocol categories' },
  { num: '1', label: 'page from the wire to a login' },
];

export type StackLayer = {
  kicker: string;
  name: string;
  protos: string[];
  /** indent step — each layer sits 26px further in, so the rows read as nested */
  depth: number;
};

export const stackLayers: StackLayer[] = [
  { kicker: 'Layer 4 — what you asked for', name: 'Application', protos: ['HTTP', 'DNS', 'SMTP', 'SSH'], depth: 0 },
  { kicker: 'Layer 3 — the conversation', name: 'Transport', protos: ['TCP', 'UDP', 'QUIC'], depth: 1 },
  { kicker: 'Layer 2 — the address', name: 'Internet', protos: ['IPv4', 'IPv6', 'ICMP'], depth: 2 },
  { kicker: 'Layer 1 — the wire', name: 'Link', protos: ['Ethernet', 'ARP', '802.1Q'], depth: 3 },
];

export type CrossCut = { name: string; body: string };

export const crossCut: CrossCut[] = [
  { name: 'Security', body: 'TLS, IPsec, SSH — wrap traffic at whichever layer needs it.' },
  { name: 'Identity & Auth', body: 'OAuth, SAML, Kerberos — prove who is on the line.' },
  { name: 'Time & Mgmt', body: 'NTP, SNMP, Syslog — keep the fleet in sync and observed.' },
];

export type Category = { id: string; n: string; b: string; count: number; eg: string[] };

/* Name and blurb come from protocol-data, and so does the count — it used to be
   typed in here and had drifted (the Internet layer said 5 against 6 filed,
   Security 4 against 5). The examples stay curated: they are the three worth
   naming on a card, not simply the first three in the index. */
const CATEGORY_EXAMPLES: Record<string, string[]> = {
  link: ['Ethernet', 'ARP', '802.1Q'],
  net: ['IPv4', 'IPv6', 'ICMP'],
  route: ['OSPF', 'BGP', 'RIP'],
  transport: ['TCP', 'UDP', 'QUIC'],
  naming: ['DNS', 'DHCP', 'mDNS'],
  web: ['HTTP', 'HTTP/3', 'gRPC'],
  mail: ['SMTP', 'IMAP', 'POP3'],
  media: ['RTP', 'SIP', 'WebRTC'],
  security: ['TLS', 'IPsec', 'SSH'],
  auth: ['OAuth', 'SAML', 'LDAP'],
  ops: ['NTP', 'SNMP', 'Syslog'],
};

export const cats: Category[] = protocolCategories.map((c) => ({
  id: c.id,
  n: c.name,
  b: c.blurb,
  count: countByCategory[c.id],
  eg: CATEGORY_EXAMPLES[c.id] ?? [],
}));

export type Featured = { abbr: string; name: string; cat: string; line: string; href: string };

export const featured: Featured[] = [
  { abbr: 'TCP', name: 'Transmission Control', cat: 'Transport', line: 'The reliable, ordered byte stream nearly everything is built on.', href: '/protocols/tcp' },
  { abbr: 'HTTP', name: 'HyperText Transfer', cat: 'Web & Transfer', line: 'Methods, headers, status codes — the request/response of the web.', href: '/protocols/http' },
  { abbr: 'DNS', name: 'Domain Name System', cat: 'Naming & Config', line: 'Turns names people read into the addresses machines route to.', href: '/protocols/dns' },
  { abbr: 'TLS', name: 'Transport Layer Security', cat: 'Security', line: 'Encrypts a stream and proves the server is who it claims.', href: '/protocols/tls' },
  { abbr: 'BGP', name: 'Border Gateway', cat: 'Routing', line: 'The path-vector protocol that stitches the whole internet together.', href: '/protocols/bgp' },
  { abbr: 'QUIC', name: 'UDP-Based Secure Transport', cat: 'Transport', line: 'Reliable, multiplexed, encrypted streams — the transport under HTTP/3.', href: '/protocols/quic' },
];

export type MenuProtocol = { id: string; abbr: string; name: string };

/* The menu's own copy: a two-word gloss reads better in a 4-across grid than
   the protocol's formal name. Every id must exist in protocol-data — it is the
   drag payload the Bench looks up. */
export const menuProtos: MenuProtocol[] = [
  { id: 'tcp', abbr: 'TCP', name: 'Reliable stream' },
  { id: 'udp', abbr: 'UDP', name: 'Datagrams' },
  { id: 'ip4', abbr: 'IPv4', name: 'Addressing' },
  { id: 'ip6', abbr: 'IPv6', name: 'Addressing v6' },
  { id: 'http', abbr: 'HTTP', name: 'The web' },
  { id: 'http3', abbr: 'HTTP/3', name: 'Web over QUIC' },
  { id: 'dns', abbr: 'DNS', name: 'Names' },
  { id: 'dhcp', abbr: 'DHCP', name: 'Joining' },
  { id: 'tls', abbr: 'TLS', name: 'Encryption' },
  { id: 'quic', abbr: 'QUIC', name: 'Fast transport' },
  { id: 'bgp', abbr: 'BGP', name: 'Internet routing' },
  { id: 'ssh', abbr: 'SSH', name: 'Secure shell' },
];

/* The device catalogue lives in device-data.ts — the Network Devices page and
   the nav's Devices menu both read it, so the layers and descriptions have one
   home. */
