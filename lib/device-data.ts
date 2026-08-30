/* The device catalogue. Ported from Network Devices.dc.html in the Claude Design
   project — this is the authoritative list; the nav's Devices menu, the index on
   /devices, the bench and the sixteen device pages all read it, so there is one
   copy of the facts.

   The long-form content of each device's own page lives in device-pages.ts. */

export type DeviceGroup = {
  id: string;
  name: string;
  blurb: string;
};

export const deviceGroups: DeviceGroup[] = [
  { id: 'l1', name: 'Layer 1 — Physical', blurb: 'Move raw bits down the medium. No addressing, no decisions.' },
  { id: 'l2', name: 'Layer 2 — Data Link', blurb: 'Frame the bits and forward them by MAC on the local network.' },
  { id: 'l3', name: 'Layer 3 — Network', blurb: 'Route packets between networks by IP address.' },
  { id: 'l47', name: 'Layers 4–7 — Services & Edge', blurb: 'Sit above transport: security, distribution and translation.' },
];

export type Device = {
  id: string;
  /** the URL segment for the device's own page */
  slug: string;
  /** the short name the index and the bench headline use */
  abbr: string;
  /** what the abbreviation stands for */
  name: string;
  /** which group in deviceGroups it files under */
  group: string;
  layer: string;
  fn: string;
  /** protocols the box itself runs or carries, as its own page lists them */
  runs: string[];
  /** ids of the devices it is usually found next to */
  works: string[];
};

export const devices: Device[] = [
  {
    id: 'modem',
    slug: 'modem',
    abbr: 'Modem',
    name: 'Modulator–Demodulator',
    group: 'l1',
    layer: 'L1 · Physical',
    fn: 'Converts digital data to and from the analog signal a phone, cable or fibre line carries.',
    runs: ['DOCSIS', 'PPPoE', 'Ethernet'],
    works: ['router', 'nic'],
  },
  {
    id: 'hub',
    slug: 'hub',
    abbr: 'Hub',
    name: 'Ethernet hub',
    group: 'l1',
    layer: 'L1 · Physical',
    fn: 'Repeats every incoming bit out of every other port — one shared, collision-prone segment.',
    runs: ['Ethernet'],
    works: ['switch', 'repeater'],
  },
  {
    id: 'repeater',
    slug: 'repeater',
    abbr: 'Repeater',
    name: 'Signal repeater',
    group: 'l1',
    layer: 'L1 · Physical',
    fn: 'Regenerates a weakening signal so a link can run past its normal distance limit.',
    // its own page lists none: a repeater works below the layer protocols begin at
    runs: [],
    works: ['hub', 'ap'],
  },

  {
    id: 'nic',
    slug: 'nic',
    abbr: 'NIC',
    name: 'Network Interface Card',
    group: 'l2',
    layer: 'L2 · Data Link',
    fn: 'A host’s physical door onto the wire, carrying its burned-in MAC address.',
    runs: ['Ethernet', 'ARP', '802.11', '802.1X'],
    works: ['switch', 'modem'],
  },
  {
    id: 'switch',
    slug: 'switch',
    abbr: 'Switch',
    name: 'LAN switch',
    group: 'l2',
    layer: 'L2 · Data Link',
    fn: 'Forwards frames only to the port that owns the destination MAC, learning the map as it goes.',
    runs: ['Ethernet', '802.1Q', 'STP', '802.1X'],
    works: ['router', 'nic', 'ap'],
  },
  {
    id: 'bridge',
    slug: 'bridge',
    abbr: 'Bridge',
    name: 'Network bridge',
    group: 'l2',
    layer: 'L2 · Data Link',
    fn: 'Joins two segments into a single broadcast domain — the switch’s two-port ancestor.',
    runs: ['Ethernet', 'STP'],
    works: ['switch', 'hub'],
  },
  {
    id: 'ap',
    slug: 'access-point',
    abbr: 'Access Point',
    name: 'Wireless AP',
    group: 'l2',
    layer: 'L2 · Data Link',
    fn: 'Bridges Wi-Fi clients onto the wired LAN over the air.',
    runs: ['802.11', 'Ethernet', 'WPA2', '802.1X'],
    works: ['switch', 'repeater'],
  },

  {
    id: 'router',
    slug: 'router',
    abbr: 'Router',
    name: 'IP router',
    group: 'l3',
    layer: 'L3 · Network',
    fn: 'Forwards packets between networks by IP address, and runs the routing protocols that build its table.',
    runs: ['IPv4', 'IPv6', 'OSPF', 'BGP', 'ICMP', 'NAT'],
    works: ['switch', 'firewall', 'modem', 'nat'],
  },
  {
    id: 'l3switch',
    slug: 'layer-3-switch',
    abbr: 'Layer-3 Switch',
    name: 'Multilayer switch',
    group: 'l3',
    layer: 'L2 / L3',
    fn: 'Switches frames at wire speed but also routes between VLANs like a router.',
    runs: ['IPv4', 'OSPF', '802.1Q', 'IPv6'],
    works: ['switch', 'router'],
  },
  {
    id: 'nat',
    slug: 'nat-gateway',
    abbr: 'NAT Gateway',
    name: 'Address translator',
    group: 'l3',
    layer: 'L3 · Network',
    fn: 'Rewrites source addresses so many private hosts share one public IP.',
    runs: ['IPv4', 'TCP', 'UDP'],
    works: ['router', 'firewall'],
  },

  {
    id: 'firewall',
    slug: 'firewall',
    abbr: 'Firewall',
    name: 'Packet / next-gen firewall',
    group: 'l47',
    layer: 'L3 – L7',
    fn: 'Inspects traffic against a policy and blocks whatever is not explicitly allowed.',
    runs: ['IP', 'TCP', 'TLS', 'HTTP'],
    works: ['router', 'proxy', 'lb'],
  },
  {
    id: 'lb',
    slug: 'load-balancer',
    abbr: 'Load Balancer',
    name: 'Traffic distributor',
    group: 'l47',
    layer: 'L4 / L7',
    fn: 'Spreads incoming connections across a pool of servers and health-checks them.',
    runs: ['TCP', 'HTTP', 'TLS'],
    works: ['proxy', 'firewall'],
  },
  {
    id: 'proxy',
    slug: 'proxy-server',
    abbr: 'Proxy Server',
    name: 'Forward / reverse proxy',
    group: 'l47',
    layer: 'L7 · Application',
    fn: 'Stands in for clients or servers, caching, filtering and mediating their requests.',
    runs: ['HTTP', 'HTTPS', 'TLS', 'SOCKS'],
    works: ['lb', 'firewall'],
  },
  {
    id: 'gateway',
    slug: 'gateway',
    abbr: 'Gateway',
    name: 'Protocol gateway',
    group: 'l47',
    layer: 'L3+',
    fn: 'Joins two dissimilar networks and translates between their protocols end to end.',
    runs: ['IP', 'SIP', 'MQTT'],
    works: ['router', 'firewall'],
  },
  {
    id: 'vpn',
    slug: 'vpn-gateway',
    abbr: 'VPN Gateway',
    name: 'Tunnel concentrator',
    group: 'l47',
    layer: 'L3 · Network',
    fn: 'Terminates encrypted tunnels so remote sites and users join the network securely.',
    runs: ['IPsec', 'TLS', 'WireGuard', 'IKEv2'],
    works: ['firewall', 'router'],
  },
  {
    id: 'ids',
    slug: 'ids-ips',
    abbr: 'IDS / IPS',
    name: 'Intrusion detection',
    group: 'l47',
    layer: 'L3 – L7',
    fn: 'Watches traffic for attack signatures — detecting them, or dropping them inline.',
    runs: ['IP', 'TCP', 'HTTP', 'TLS'],
    works: ['firewall'],
  },
];

export const deviceById: Record<string, Device> = Object.fromEntries(
  devices.map((d) => [d.id, d]),
);

export const deviceBySlug: Record<string, Device> = Object.fromEntries(
  devices.map((d) => [d.slug, d]),
);

/** where a device's own page lives */
export const deviceHref = (d: Pick<Device, 'slug'>) => `/devices/${d.slug}`;

/** the index, filed by the highest layer each box reads */
export const devicesByGroup = deviceGroups.map((g) => ({
  ...g,
  items: devices.filter((d) => d.group === g.id),
}));

/** the nav menu shows a 3×4 grid, so it takes the first twelve */
export const deviceMenu = devices.slice(0, 12);

export const deviceGroupById: Record<string, DeviceGroup> = Object.fromEntries(
  deviceGroups.map((g) => [g.id, g]),
);

/** the neighbours in the catalogue order, for the foot of a device's page */
export function deviceNeighbours(slug: string) {
  const i = devices.findIndex((d) => d.slug === slug);
  return {
    prev: i > 0 ? devices[i - 1] : null,
    next: i >= 0 && i < devices.length - 1 ? devices[i + 1] : null,
  };
}
