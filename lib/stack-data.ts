/* Content for The Stack page. Ported from The Stack.dc.html in the Claude Design
   project. Device links point at /devices until the per-device pages exist. */

import { DEVICES_HREF } from './atlas-data';

export type DeviceLink = { label: string; href: string };

export type OsiLayer = {
  n: number;
  name: string;
  blurb: string;
  /** the protocols or media that live here, already joined for display */
  examples: string;
  devices?: DeviceLink[];
};

export const osiLayers: OsiLayer[] = [
  { n: 7, name: 'Application', blurb: 'Where apps meet the network.', examples: 'HTTP · DNS · SMTP' },
  { n: 6, name: 'Presentation', blurb: 'Encoding, encryption, compression.', examples: 'TLS · JPEG · ASCII' },
  { n: 5, name: 'Session', blurb: 'Opens, manages and closes conversations.', examples: 'Sockets · RPC · NetBIOS' },
  { n: 4, name: 'Transport', blurb: 'End-to-end delivery between two processes.', examples: 'TCP · UDP · QUIC' },
  {
    n: 3,
    name: 'Network',
    blurb: 'Routing packets between networks by IP.',
    examples: 'IP · ICMP · OSPF',
    devices: [
      { label: 'Router', href: DEVICES_HREF },
      { label: 'L3 switch', href: DEVICES_HREF },
    ],
  },
  {
    n: 2,
    name: 'Data Link',
    blurb: 'Framing and local MAC addressing.',
    examples: 'Ethernet · ARP',
    devices: [
      { label: 'Switch', href: DEVICES_HREF },
      { label: 'NIC', href: DEVICES_HREF },
    ],
  },
  {
    n: 1,
    name: 'Physical',
    blurb: 'Raw bits on the medium.',
    examples: 'Cables · signals',
    devices: [
      { label: 'Hub', href: DEVICES_HREF },
      { label: 'Repeater', href: DEVICES_HREF },
    ],
  },
];

export type TcpIpLayer = {
  name: string;
  blurb: string;
  protos: string;
  /** which OSI row this band starts on, and how many it swallows */
  rowStart: number;
  rowSpan: number;
};

export const tcpIpLayers: TcpIpLayer[] = [
  {
    name: 'Application',
    blurb: 'Everything from the app down to encryption and sessions — OSI layers 5 through 7 in one.',
    protos: 'HTTP · DNS · TLS · SMTP',
    rowStart: 1,
    rowSpan: 3,
  },
  {
    name: 'Transport',
    blurb: 'The same layer, same name in both models.',
    protos: 'TCP · UDP · QUIC',
    rowStart: 4,
    rowSpan: 1,
  },
  {
    name: 'Internet',
    blurb: 'OSI’s Network layer — addressing and routing.',
    protos: 'IP · ICMP · routing',
    rowStart: 5,
    rowSpan: 1,
  },
  {
    name: 'Link · Network Access',
    blurb: 'Framing and the physical medium together — OSI layers 1 and 2.',
    protos: 'Ethernet · Wi-Fi · ARP',
    rowStart: 6,
    rowSpan: 2,
  },
];

export type LayerDetail = {
  n: number;
  name: string;
  examples: string;
  devices?: DeviceLink[];
  /** the italic standfirst, split so its middle clause can take the accent */
  lead: { before: string; strong: string; after: string };
  body: string;
};

export const layerDetails: LayerDetail[] = [
  {
    n: 7,
    name: 'Application',
    examples: 'HTTP · DNS · SMTP',
    lead: { before: 'The layer ', strong: 'users and programs', after: ' actually touch.' },
    body: 'Provides network services straight to applications — web requests, email, file transfer, name lookups — and defines the format of the messages they exchange.',
  },
  {
    n: 6,
    name: 'Presentation',
    examples: 'TLS · JPEG · ASCII',
    lead: { before: 'The ', strong: 'translator', after: ' of the stack.' },
    body: 'Converts data into a form both ends agree on — character encoding, serialization, compression, and the encryption and decryption that keep it private.',
  },
  {
    n: 5,
    name: 'Session',
    examples: 'Sockets · RPC · NetBIOS',
    lead: { before: 'The ', strong: 'conversation manager.', after: '' },
    body: 'Opens, coordinates and closes the dialogue between two hosts — setup, checkpoints and teardown — so a long exchange stays organised.',
  },
  {
    n: 4,
    name: 'Transport',
    examples: 'TCP · UDP · QUIC',
    lead: { before: '', strong: 'End-to-end delivery', after: ' between programs.' },
    body: 'Splits data into segments and addresses them to a port. TCP guarantees order and reliability; UDP drops the guarantees for raw speed.',
  },
  {
    n: 3,
    name: 'Network',
    examples: 'IP · ICMP · OSPF',
    devices: [{ label: 'Router', href: DEVICES_HREF }],
    lead: { before: 'The layer that ', strong: 'spans networks.', after: '' },
    body: 'Adds IP addresses and routes each packet across networks toward its destination, choosing a path one hop at a time.',
  },
  {
    n: 2,
    name: 'Data Link',
    examples: 'Ethernet · ARP',
    devices: [{ label: 'Switch', href: DEVICES_HREF }],
    lead: { before: 'The ', strong: 'local delivery', after: ' layer.' },
    body: 'Frames the bits, addresses them by MAC on the local link, and checks for errors — moving data between directly connected nodes.',
  },
  {
    n: 1,
    name: 'Physical',
    examples: 'Cables · signals',
    devices: [{ label: 'Hub', href: DEVICES_HREF }],
    lead: { before: 'The ', strong: 'raw medium.', after: '' },
    body: 'Turns bits into signals — voltage, light or radio — and defines the cables, connectors and timing that carry them on the wire.',
  },
];

/** the protocol data unit each layer hands the one below it */
export const pduByLayer: Record<number, string> = {
  7: 'Data',
  6: 'Data',
  5: 'Data',
  4: 'Segment',
  3: 'Packet',
  2: 'Frame',
  1: 'Bits',
};

export type EncapCell = {
  label: string;
  /** header = the box this layer adds; carried = a header from further up;
      data = the payload, which is what stretches */
  kind: 'header' | 'carried' | 'data';
};

export type EncapRow = {
  layer: string;
  cells: EncapCell[];
  result: string;
  /** the result reads as a named PDU rather than a plain gloss */
  named: boolean;
};

export const encapRows: EncapRow[] = [
  {
    layer: 'Application',
    cells: [{ label: 'Data', kind: 'data' }],
    result: 'the message',
    named: false,
  },
  {
    layer: 'Transport',
    cells: [
      { label: 'TCP hdr', kind: 'header' },
      { label: 'Data', kind: 'data' },
    ],
    result: '= Segment',
    named: true,
  },
  {
    layer: 'Network',
    cells: [
      { label: 'IP hdr', kind: 'header' },
      { label: 'TCP hdr', kind: 'carried' },
      { label: 'Data', kind: 'data' },
    ],
    result: '= Packet',
    named: true,
  },
  {
    layer: 'Data Link',
    cells: [
      { label: 'Frame hdr', kind: 'header' },
      { label: 'IP hdr', kind: 'carried' },
      { label: 'TCP hdr', kind: 'carried' },
      { label: 'Data', kind: 'data' },
      { label: 'Trailer', kind: 'header' },
    ],
    result: '= Frame',
    named: true,
  },
];

export const bitStream = '1001 0110 1110 0100 1011 0010 1101 0011 0110 1001 0100 1110';

export const whyTwoModels = [
  {
    title: 'OSI — the teaching map',
    tone: 'osi' as const,
    body: 'Seven clean layers that make it easy to reason about where a job belongs. Great for learning; no network runs exactly this way.',
  },
  {
    title: 'TCP/IP — the working map',
    tone: 'tcpip' as const,
    body: 'Four layers that describe what the internet actually implements. OSI’s top three fold into one Application layer.',
  },
  {
    title: 'Encapsulation',
    tone: 'plain' as const,
    body: 'Each layer wraps the one above in its own header on the way out, and unwraps it on the way in — a packet inside a frame inside a signal.',
  },
];
