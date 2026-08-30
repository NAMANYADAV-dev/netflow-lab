/* The long-form content of each protocol's own page, ported from the
   `Protocol *.dc.html` pages in the Claude Design project.

   Same arrangement as device-pages.ts, and for the same reason: every page
   answers the same things in the same order — the standfirst, the one line to
   keep, four key points, the diagram, four steps, six security notes, where it
   rides in the stack, its header, and a footnote — so the reader learns the
   shape once and afterwards only reads the differences. The wording is the
   design's own.

   Sixteen of these were ported from the design's own `Protocol *.dc.html` files
   and use its wording verbatim; the rest were written to the same brief, in the
   same voice and to the same shape, for the protocols the design did not cover.

   The catalogue facts a protocol shares with the Bench and the Atlas (category,
   port, one-line summary, what it is seen with) live in protocol-data.ts; this
   file holds only what belongs to the page. */

import type { ProtocolDiagramSpec } from '@/components/ProtocolDiagram';
import type { Rich } from '@/components/RichText';

export type ProtocolPage = {
  /** the middle crumb — the category, as the design writes it */
  crumb: string;
  /** the small caps line above the headline */
  kicker: string;
  /** the headline itself */
  title: string;
  /** the italic apposition beside it */
  sub: string;
  lede: Rich;
  /** the rule-and-bar pull quote under the standfirst */
  takeaway: Rich;
  /** the four-cell strip: label, value, and the gloss under it */
  points: { k: string; v: string; note: string }[];
  diagram: ProtocolDiagramSpec;
  /** what the protocol does, in the order it does it */
  steps: { t: string; d: string }[];
  security: { lede: Rich; points: { t: string; d: string }[] };
  /** a strip of short claims under the steps, where a page argues its protocol
      against the one it replaces */
  beats?: { kicker: string; items: { t: string; d: string }[] };
  /** "Rides in the stack" for most, but a protocol that joins two layers rather
      than sitting on one says so — ARP "sits beside" it */
  ridesTitle?: string;
  /** the arrow between the links. A protocol carried by the one before it takes
      the default →; one that translates between its neighbours takes ↔. */
  ridesJoin?: '→' | '↔';
  /** the encapsulation chain: what wraps it, itself, what it carries.
      `on` marks this protocol's own link — the one struck in the accent. */
  rides: { t: string; on?: boolean }[];
  /** a line under the chain, where the chain alone would mislead */
  ridesNote?: string;
  /** the right-hand block under the security notes. Most pages summarise the
      protocol's header there; some set it against its rival instead, which is
      the more useful thing to print when a protocol is defined by the contrast
      (UDP against TCP). */
  aside:
    | {
        kind: 'header';
        title: string;
        /** an example set large over the table, its parts in the two inks —
            what an address or a message actually looks like */
        specimen?: { a: string; sep?: string; b: string };
        /** `hi` tints the whole row; `ink` tints only the key, for a table whose
            rows name the parts of the specimen above */
        rows: { k: string; v: string; hi?: boolean; ink?: 'a' | 'b' }[];
        note?: string;
      }
    | {
        kind: 'compare';
        title: string;
        /** the two column heads; the second is this page's protocol, in the accent */
        cols: [string, string];
        rows: { k: string; a: string; b: string }[];
      }
    | {
        /** two small tables abreast, for a protocol whose reference figures
            don't reduce to one list */
        kind: 'pair';
        title: string;
        /** `ink` tints a row's key — the fields that are this protocol's own,
            or which of two message directions a row belongs to */
        tables: { head: string; rows: { k: string; v: string; ink?: 'a' | 'b' }[] }[];
      };
  /** the line set against the right of the footer rule */
  footnote: string;
};

export const protocolPages: Record<string, ProtocolPage> = {
  arp: {
    crumb: 'The Link',
    kicker: 'Layer 2 · The Link · from IP address to hardware address',
    title: 'ARP',
    sub: 'Address Resolution Protocol',
    lede: [
      'ARP is the ',
      { i: 'last translation before the wire.' },
      ' A host knows the ',
      { a: 'IP address' },
      ' it wants to reach on the local network, but the Ethernet card can only deliver to a ',
      { b: 'MAC address.' },
      ' ARP asks the segment “who has this IP?” and caches the hardware address that answers.',
    ],
    takeaway: [
      'ARP resolves a local ',
      { a: 'IP address' },
      ' to the ',
      { b: 'MAC address' },
      ' that owns it — one broadcast question, one cached answer.',
    ],
    points: [
      { k: 'Operates at', v: 'Layer 2 / 3', note: 'bridges the two' },
      { k: 'Port', v: 'None', note: 'not over IP at all' },
      { k: 'Scope', v: 'Local link', note: 'one broadcast domain' },
      { k: 'IPv6 uses', v: 'NDP', note: 'neighbour discovery' },
    ],
    diagram: {
      caption: 'Host A wants to reach 192.168.1.20 on the same LAN',
      exchange: {
        lanes: { left: 'Host A', right: 'The whole segment', rightMuted: true },
        messages: [
          {
            label: 'ARP Request — broadcast to ff:ff:ff:ff:ff:ff',
            dir: 'right',
            card: {
              quote: '“Who has 192.168.1.20? Tell 192.168.1.10”',
              gloss: ['Every host on the segment receives it — only the owner answers.'],
            },
          },
          {
            label: 'ARP Reply — unicast, from Host B only',
            dir: 'left',
            card: {
              quote: '“192.168.1.20 is at 1c:6f:65:aa:bb:cc”',
              gloss: ['Host A stores the pair in its ARP cache for the next few minutes.'],
            },
          },
          { label: 'Ethernet frames now flow straight to that MAC', dir: 'both' },
        ],
        note: [
          'The question is a ',
          { a: 'broadcast' },
          ' because A doesn’t yet know who to ask; the answer is a ',
          { b: 'unicast' },
          ' straight back. For an IP off the LAN, A resolves the gateway’s MAC instead.',
        ],
      },
    },
    steps: [
      { t: 'Check the cache', d: 'If the IP→MAC pair is already known, the host skips straight to sending — no ARP traffic at all.' },
      { t: 'Broadcast the question', d: 'On a miss it floods “who has this IP?” to every host on the local segment at once.' },
      { t: 'The owner replies', d: 'Only the host holding that IP answers, unicast, with its hardware address.' },
      { t: 'Cache and send', d: 'The pair is cached with a short timeout, and frames flow directly until it expires.' },
    ],
    beats: {
      kicker: 'Relatives & variants',
      items: [
        { t: 'Gratuitous ARP', d: 'announce your own IP→MAC' },
        { t: 'Proxy ARP', d: 'a router answers on another’s behalf' },
        { t: 'NDP (IPv6)', d: 'the ICMPv6 replacement' },
      ],
    },
    security: {
      lede: [
        'ARP has ',
        { a: 'no authentication whatsoever' },
        ' — a host believes any reply it hears, which makes ',
        { b: 'spoofing the classic LAN attack.' },
      ],
      points: [
        { t: 'ARP spoofing', d: 'An attacker sends forged replies claiming the gateway’s IP, so traffic detours through them.' },
        { t: 'Man-in-the-middle', d: 'Once in the path they can read, alter or drop traffic — only encryption above keeps it private.' },
        { t: 'Dynamic ARP Inspection', d: 'Switches validate replies against DHCP-snooping data and drop the forged ones.' },
        { t: 'Cache poisoning', d: 'Unsolicited replies quietly overwrite good entries; static entries pin critical ones in place.' },
        { t: 'Denial of service', d: 'Poisoning a gateway entry with a dead MAC simply blackholes a host off the network.' },
        { t: 'Segmentation', d: 'ARP is link-local, so smaller VLANs shrink the blast radius of any spoofing attack.' },
      ],
    },
    ridesTitle: 'Sits beside the stack',
    ridesJoin: '↔',
    rides: [{ t: 'IP (L3)' }, { t: 'ARP', on: true }, { t: 'Ethernet (L2)' }],
    ridesNote:
      'ARP isn’t carried over IP — it rides directly in Ethernet frames, joining the two layers it sits between.',
    aside: {
      kind: 'pair',
      title: 'Packet & cache',
      tables: [
        {
          head: 'Key fields',
          rows: [
            { k: 'Opcode', v: '1=req 2=rep', ink: 'a' },
            { k: 'Sender', v: 'IP + MAC', ink: 'a' },
            { k: 'Target', v: 'IP + MAC', ink: 'a' },
          ],
        },
        {
          head: 'The cache',
          rows: [
            { k: 'Dynamic', v: 'learned' },
            { k: 'Static', v: 'pinned' },
            { k: 'Timeout', v: 'minutes' },
            { k: 'arp -a', v: 'inspect' },
          ],
        },
      ],
    },
    footnote: 'A host trusts any ARP reply it hears — which is the whole reason spoofing works.',
  },

  ipv4: {
    crumb: 'The Internet Layer',
    kicker: 'Layer 3 · Network protocol',
    title: 'IPv4',
    sub: 'the Internet Protocol, version 4',
    lede: [
      'IPv4 is the ',
      { i: 'addressing and delivery system of the internet.' },
      ' It ',
      { a: 'gives every host a 32-bit address' },
      ', ',
      { a: 'wraps data in packets stamped with source and destination' },
      ', and ',
      { b: 'lets routers carry each one hop by hop' },
      ' — best-effort, across any number of networks.',
    ],
    takeaway: [
      'IPv4 gives every host an ',
      { a: 'address' },
      ' and carries packets to it ',
      { b: 'hop by hop, best-effort.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3', note: 'Network' },
      { k: 'Address', v: '32-bit', note: '~4.3 billion' },
      { k: 'Delivery', v: 'Best-effort', note: 'connectionless' },
      { k: 'Unit', v: 'Packet', note: 'TTL-limited' },
    ],
    diagram: {
      caption: 'One packet, carried hop by hop toward its address',
      path: {
        from: { t: 'Source', sub: '10.0.0.9' },
        hops: ['Router', 'Router'],
        legs: ['TTL 64', 'TTL 63', 'TTL 62'],
        to: { t: 'Destination', sub: '203.0.113.5' },
      },
      header: {
        label: 'Each packet carries this header',
        ruler: ['0', '16 bits', '31'],
        rows: [
          [
            { t: 'Ver · IHL', w: 70, small: true },
            { t: 'DSCP · ECN', w: 90, small: true },
            { t: 'Total length', small: true },
          ],
          [
            { t: 'Identification', small: true },
            { t: 'Flags', w: 70, small: true },
            { t: 'Fragment offset', small: true },
          ],
          [
            { t: 'TTL', w: 80, small: true, hi: true },
            { t: 'Protocol', w: 90, small: true },
            { t: 'Header checksum', small: true },
          ],
          [{ t: 'Source address', hi: true }],
          [{ t: 'Destination address', hi: true }],
          [{ t: 'Options (if any)', faint: true, small: true }],
        ],
        payload: 'Data — usually a TCP or UDP segment',
        note: [
          'Every router reads the ',
          { a: 'destination address' },
          ', forwards the packet one hop closer, and drops the TTL by one — so a packet that can’t find its way eventually dies instead of looping forever.',
        ],
      },
    },
    steps: [
      { t: 'Address the packet', d: 'It stamps the data with a 32-bit source and destination address so any router can place it.' },
      { t: 'Route hop by hop', d: 'Each router matches the destination against its table and forwards the packet one step closer — independently, per packet.' },
      { t: 'Count down the TTL', d: 'Each hop drops the Time-To-Live by one; at zero the packet is discarded, killing routing loops.' },
      { t: 'Fragment if it must', d: 'If a link’s MTU is too small, the packet is split into fragments and reassembled at the destination.' },
    ],
    security: {
      lede: [
        'IPv4 carries no identity and no encryption, so the ',
        { a: 'source address can’t be trusted' },
        ' and the ',
        { b: 'payload rides in the clear.' },
      ],
      points: [
        { t: 'IP spoofing', d: 'A forged source address hides the sender and powers reflection attacks; ingress filtering fights it.' },
        { t: 'No confidentiality', d: 'Encrypt at the network layer with IPsec, or above it with TLS.' },
        { t: 'Fragmentation attacks', d: 'Overlapping or tiny fragments can evade filters and crash weak reassemblers.' },
        { t: 'TTL-based recon', d: 'Watching TTLs (as traceroute does) maps the path and fingerprints hosts.' },
        { t: 'Address exhaustion', d: 'Only ~4.3 billion addresses forced NAT everywhere — and pushed the move to IPv6.' },
        { t: 'DDoS at the packet level', d: 'Floods of spoofed packets saturate links regardless of what rides above.' },
      ],
    },
    rides: [{ t: 'Ethernet' }, { t: 'IPv4', on: true }, { t: 'TCP / UDP' }],
    aside: {
      kind: 'header',
      title: 'Reading an address',
      specimen: { a: '203.0.113', sep: '.', b: '5' },
      rows: [
        { k: '203.0.113', v: 'the network', ink: 'a' },
        { k: '.5', v: 'the host', ink: 'b' },
        { k: '/24', v: 'how many bits are the network' },
      ],
      note: 'Four bytes, dotted — the mask splits them into network and host.',
    },
    footnote: 'IPv4 still carries most of the internet — even as IPv6 slowly takes over.',
  },

  ipv6: {
    crumb: 'The Internet Layer',
    kicker: 'Layer 3 · Network protocol',
    title: 'IPv6',
    sub: 'the Internet Protocol, version 6',
    lede: [
      'IPv6 is IPv4’s successor, built to ',
      { i: 'never run out of addresses.' },
      ' It ',
      { a: 'gives every host a 128-bit address' },
      ', ',
      { a: 'configures itself with no DHCP server' },
      ', and ',
      { b: 'restores end-to-end connectivity without NAT' },
      ' — the same job as IPv4, with room to spare.',
    ],
    takeaway: [
      'IPv6 is IPv4 with a ',
      { a: 'vastly bigger address space' },
      ' and ',
      { b: 'no need for NAT.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3', note: 'Network' },
      { k: 'Address', v: '128-bit', note: '~340 undecillion' },
      { k: 'Config', v: 'Automatic', note: 'SLAAC, no NAT' },
      { k: 'Header', v: 'Fixed 40 B', note: 'extension headers' },
    ],
    diagram: {
      caption: 'Anatomy of a 128-bit address',
      anatomy: {
        specimen: { a: '2001:0db8:85a3:0000', sep: ':', b: '0000:8a2e:0370:7334' },
        halves: [
          {
            kicker: 'First 64 bits',
            t: 'Network prefix',
            d: 'which network — routed by /64',
          },
          { kicker: 'Last 64 bits', t: 'Interface ID', d: 'which host on it' },
        ],
        note: [
          'Eight groups of four hex digits. Runs of zeros collapse to ',
          { s: '::' },
          ', so this shortens to ',
          { m: '2001:db8:85a3::8a2e:370:7334' },
          '.',
        ],
      },
      header: {
        label: 'A fixed 40-byte header — simpler than IPv4',
        ruler: ['0', '16 bits', '31'],
        rows: [
          [
            { t: 'Version', w: 80, small: true },
            { t: 'Traffic class', w: 110, small: true },
            { t: 'Flow label', small: true },
          ],
          [
            { t: 'Payload length', small: true },
            { t: 'Next header', w: 110, small: true },
            { t: 'Hop limit', w: 90, small: true, hi: true },
          ],
          [{ t: 'Source address (128 bits)', hi: true }],
          [{ t: 'Destination address (128 bits)', hi: true }],
        ],
        payload: 'Extension headers, then the data',
        note: [
          'No header checksum, no router fragmentation, optional features moved into ',
          { a: 'extension headers' },
          ' — so routers do less work per packet than with IPv4.',
        ],
      },
    },
    steps: [
      { t: 'Configure itself', d: 'A host learns the network prefix from a router advertisement and builds its own address — SLAAC, no DHCP needed.' },
      { t: 'Address the packet', d: '128-bit source and destination — enough that every device on earth can have a public address.' },
      { t: 'Route hop by hop', d: 'Routers forward by prefix, dropping the Hop Limit each step — the same idea as IPv4’s TTL.' },
      { t: 'Extend when needed', d: 'Options like fragmentation or IPsec live in chained extension headers, keeping the base header lean.' },
    ],
    security: {
      lede: [
        'IPv6 fixes some IPv4 problems and adds its own: a ',
        { a: 'huge space that’s hard to scan' },
        ', but ',
        { b: 'public addresses that expose hosts directly.' },
      ],
      points: [
        { t: 'Scanning is impractical', d: 'A /64 holds 18 quintillion addresses, so brute-force host discovery is effectively impossible.' },
        { t: 'No NAT to hide behind', d: 'Hosts are globally reachable, so a real firewall — not NAT — must do the shielding.' },
        { t: 'NDP spoofing', d: 'Neighbour Discovery replaces ARP and inherits similar on-link spoofing risks; RA Guard helps.' },
        { t: 'Privacy addresses', d: 'Random interface IDs stop a stable address from tracking a device across networks.' },
        { t: 'Dual-stack gaps', d: 'Running IPv4 and IPv6 together doubles the policy to get right — an easy place to leave a hole.' },
        { t: 'Extension-header abuse', d: 'Long or crafted header chains can slip past filters that don’t parse them fully.' },
      ],
    },
    rides: [{ t: 'Ethernet' }, { t: 'IPv6', on: true }, { t: 'TCP / UDP' }],
    aside: {
      kind: 'compare',
      title: 'IPv4 or IPv6?',
      cols: ['IPv4', 'IPv6'],
      rows: [
        { k: 'Address', a: '32-bit', b: '128-bit' },
        { k: 'Notation', a: 'Dotted decimal', b: 'Hex, colons' },
        { k: 'NAT', a: 'Usually', b: 'Not needed' },
        { k: 'Config', a: 'DHCP', b: 'SLAAC' },
      ],
    },
    footnote: 'The internet is still mid-migration — most hosts speak both IPv4 and IPv6 at once.',
  },

  icmp: {
    crumb: 'The Internet Layer',
    kicker: 'Layer 3 · The Internet Layer · the network’s error & status channel',
    title: 'ICMP',
    sub: 'Internet Control Message Protocol',
    lede: [
      'ICMP is ',
      { i: 'how the network reports back.' },
      ' IP itself carries no way to say “that didn’t arrive” — ICMP fills the gap, sending ',
      { a: 'error and diagnostic messages' },
      ' when a packet can’t be delivered, is too big, or outlives its hop budget. It is also the engine behind ',
      { b: 'ping and traceroute.' },
    ],
    takeaway: [
      'ICMP is IP’s ',
      { a: 'status channel' },
      ' — it carries errors and diagnostics, never ',
      { b: 'application data.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3', note: 'beside IP itself' },
      { k: 'Port', v: 'None', note: 'IP protocol 1' },
      { k: 'Carries', v: 'Control', note: 'errors, not payload' },
      { k: 'IPv6 uses', v: 'ICMPv6', note: 'protocol 58 · NDP' },
    ],
    diagram: {
      caption: 'Traceroute — ICMP errors mapped into a path',
      exchange: {
        lanes: { left: 'Source', right: 'Each router along the way' },
        messages: [
          {
            label: 'Send a packet with TTL = 1',
            dir: 'right',
            card: {
              tone: 'b',
              quote: 'Hop 1 decrements TTL to 0 → drops it',
              gloss: [
                'Returns ',
                { s: 'Time Exceeded (type 11)' },
                ' — now you know hop 1’s address',
              ],
            },
          },
          {
            label: 'Repeat with TTL = 2, 3, 4…',
            dir: 'right',
            card: {
              tone: 'b',
              quote: 'Each further hop expires the packet in turn',
              gloss: ['One Time-Exceeded per hop draws the whole path, router by router'],
            },
          },
          {
            label: 'Reaching the destination',
            dir: 'left',
            card: { tone: 'a', filled: true, quote: 'Destination replies — the walk is complete' },
          },
        ],
        note: [
          'Ping is simpler still: an ',
          { a: 'Echo Request (type 8)' },
          ' out, an ',
          { b: 'Echo Reply (type 0)' },
          ' back — the round trip is the latency you see.',
        ],
      },
    },
    steps: [
      { t: 'Ride inside IP', d: 'An ICMP message is carried as the payload of an IP packet — no ports, no connection, no handshake.' },
      { t: 'Report a problem', d: 'A router that can’t deliver sends back an error — unreachable, too big, or time exceeded.' },
      { t: 'Quote the offender', d: 'The error carries the start of the original packet, so the sender knows exactly which one failed.' },
      { t: 'Power the tools', d: 'Echo request/reply is ping; expiring TTLs on purpose is traceroute — both are just ICMP.' },
    ],
    beats: {
      kicker: 'Common message types',
      items: [
        { t: '0 / 8', d: 'Echo Reply / Request (ping)' },
        { t: '3', d: 'Destination Unreachable' },
        { t: '11', d: 'Time Exceeded (traceroute)' },
        { t: '3 / 4', d: 'Fragmentation Needed (PMTUD)' },
        { t: '5', d: 'Redirect (use a better router)' },
        { t: '12', d: 'Parameter Problem (bad header)' },
      ],
    },
    security: {
      lede: [
        'ICMP is invaluable for diagnostics but is also a ',
        { a: 'reconnaissance and covert-channel tool' },
        ' — the trick is filtering the dangerous types ',
        { b: 'without breaking the ones the network needs.' },
      ],
      points: [
        { t: 'Host & network scanning', d: 'Echo sweeps and error responses map which hosts are alive — often the first step of an attack.' },
        { t: 'Don’t block it all', d: 'Dropping every ICMP breaks Path MTU Discovery, so connections silently hang — permit types 3 & 11.' },
        { t: 'ICMP tunnelling', d: 'Data hidden in echo payloads smuggles traffic past filters that wave ping through unquestioned.' },
        { t: 'Smurf & floods', d: 'Spoofed echoes to a broadcast once amplified DDoS; rate-limiting and no directed-broadcast end it.' },
        { t: 'Redirect abuse', d: 'A forged type-5 redirect can steer a host onto an attacker’s gateway — most systems now ignore them.' },
        { t: 'Rate-limit, don’t kill', d: 'Throttling ICMP keeps diagnostics working while blunting scans and floods — the pragmatic middle.' },
      ],
    },
    rides: [{ t: 'Ethernet' }, { t: 'IP' }, { t: 'ICMP', on: true }],
    ridesNote:
      'It sits directly on IP with no transport layer — ICMP is the network layer talking about itself.',
    aside: {
      kind: 'pair',
      title: 'Message & tools',
      tables: [
        {
          head: 'Header',
          rows: [
            { k: 'Type', v: 'what', ink: 'a' },
            { k: 'Code', v: 'why', ink: 'a' },
            { k: 'Checksum', v: 'integrity', ink: 'a' },
            { k: 'Payload', v: 'quoted pkt', ink: 'a' },
          ],
        },
        {
          head: 'Tools',
          rows: [
            { k: 'ping', v: 'echo' },
            { k: 'traceroute', v: 'TTL' },
            { k: 'pathping', v: 'both' },
            { k: 'PMTUD', v: 'type 3/4' },
          ],
        },
      ],
    },
    footnote:
      'Block ICMP entirely and connections silently hang — the fix is to rate-limit, not to kill it.',
  },

  igmp: {
    crumb: 'The Internet Layer',
    kicker: 'Layer 3 · The Internet Layer · who wants to hear a multicast',
    title: 'IGMP',
    sub: 'Internet Group Management Protocol',
    lede: [
      'IGMP is the ',
      { i: 'subscription desk for multicast.' },
      ' One-to-many traffic — IPTV, video walls, market-data feeds — should only reach hosts that actually want it. IGMP is how a host tells its router ',
      { a: '“I want this group”' },
      ', and how the router knows ',
      { b: 'when nobody is listening any more.' },
    ],
    takeaway: [
      'IGMP manages ',
      { a: 'multicast group membership' },
      ' — so a feed reaches only the hosts that ',
      { b: 'asked to join it.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3', note: 'host ↔ local router' },
      { k: 'Port', v: 'None', note: 'IP protocol 2' },
      { k: 'Scope', v: 'IPv4 only', note: 'one local segment' },
      { k: 'Current', v: 'IGMPv3', note: 'source-specific' },
    ],
    diagram: {
      caption: 'Join, query, leave — the membership conversation',
      exchange: {
        lanes: { left: 'Host', right: 'Multicast router (querier)' },
        messages: [
          {
            label: 'Membership Report — “I want group 239.1.1.1”',
            dir: 'right',
            card: {
              filled: true,
              quote: 'The router starts forwarding that group onto this segment',
            },
          },
          {
            label: 'General Query — periodic “anyone still listening?”',
            dir: 'left',
            card: {
              quote: 'One member replies for the whole group — a random timer suppresses the rest',
              gloss: ['No report after a few queries → the router stops forwarding the group'],
            },
          },
          {
            label: 'Leave Group — “done with 239.1.1.1” (v2+)',
            dir: 'right',
            card: {
              tone: 'plain',
              quote: 'A group-specific query confirms nobody else wants it, then forwarding stops fast',
            },
          },
        ],
        note: [
          'The router is the ',
          { b: 'querier' },
          '; hosts only speak up to join or when asked. ',
          { a: 'IGMPv3' },
          ' adds source filtering — a host can ask for a group ',
          { i: 'from a specific sender' },
          ' and ignore the rest.',
        ],
      },
    },
    steps: [
      { t: 'Join a group', d: 'A host sends a membership report for a multicast address in the 224.0.0.0/4 range it wants to receive.' },
      { t: 'Answer the querier', d: 'The router periodically queries the segment; one host per group replies, the rest stay quiet.' },
      { t: 'Leave when done', d: 'A leave message (or simply going silent) tells the router to prune the group off this link.' },
      { t: 'Switches snoop along', d: 'IGMP snooping lets a switch overhear these reports and forward multicast only to ports that joined.' },
    ],
    beats: {
      kicker: 'Three versions',
      items: [
        { t: 'v1', d: 'join & query, no explicit leave' },
        { t: 'v2', d: 'adds Leave for fast pruning' },
        { t: 'v3', d: 'source-specific (SSM)' },
      ],
    },
    security: {
      lede: [
        'IGMP is ',
        { a: 'unauthenticated and trusts any host on the segment' },
        ', so on a flat network a single client can distort what multicast every port receives.',
      ],
      points: [
        { t: 'Report flooding', d: 'A host that joins thousands of groups can exhaust switch and router state — a denial of service.' },
        { t: 'Querier spoofing', d: 'A forged low-IP querier can take over membership timing and starve real feeds — lock the querier down.' },
        { t: 'Snooping matters', d: 'Without IGMP snooping a switch floods multicast to every port — wasteful and a passive eavesdrop risk.' },
        { t: 'Unwanted subscription', d: 'Anyone can join a group and receive its stream; sensitive feeds need SSM plus network access control.' },
        { t: 'Filtering & limits', d: 'Per-port group limits and IGMP profiles cap how many and which groups a host may ever request.' },
        { t: 'Keep it link-local', d: 'IGMP never leaves the segment; VLAN boundaries are the natural containment for its blast radius.' },
      ],
    },
    rides: [{ t: 'Ethernet' }, { t: 'IP' }, { t: 'IGMP', on: true }],
    ridesNote:
      'Carried straight in IPv4 as protocol 2, with TTL 1 — it is meant never to leave the local link.',
    aside: {
      kind: 'pair',
      title: 'Messages & ranges',
      tables: [
        {
          head: 'Messages',
          rows: [
            { k: 'Query', v: 'router', ink: 'b' },
            { k: 'Report', v: 'join', ink: 'a' },
            { k: 'Leave', v: 'prune', ink: 'a' },
          ],
        },
        {
          head: 'Address range',
          rows: [
            { k: '224/4', v: 'multicast' },
            { k: '224.0.0.x', v: 'link-local' },
            { k: '239/8', v: 'private' },
            { k: 'TTL 1', v: 'local' },
          ],
        },
      ],
    },
    footnote:
      'Without IGMP snooping a switch floods multicast to every port — the whole point is to ask first.',
  },

  bgp: {
    crumb: 'Routing',
    kicker: 'Layer 7 control · Routing · the internet’s master map',
    title: 'BGP',
    sub: 'Border Gateway Protocol',
    lede: [
      'BGP is ',
      { i: 'how the internet agrees where things are.' },
      ' The net is tens of thousands of independent networks — ',
      { a: 'autonomous systems' },
      ' — and BGP is the language they use to ',
      { b: 'advertise which addresses they can reach and along what path.' },
      ' Every route between networks you’ve ever used was chosen by BGP.',
    ],
    takeaway: [
      'BGP lets independent networks ',
      { a: 'advertise the address blocks they reach' },
      ' and pick paths by ',
      { b: 'policy, not just distance.' },
    ],
    points: [
      { k: 'Kind', v: 'Path-vector', note: 'carries the AS path' },
      { k: 'Port', v: '179', note: 'TCP' },
      { k: 'Scope', v: 'Between AS', note: 'the exterior gateway' },
      { k: 'Chooses by', v: 'Policy', note: 'business, not hops' },
    ],
    diagram: {
      caption: 'A prefix propagates outward, each AS prepending itself',
      relay: {
        stops: [
          { t: 'AS 64500', sub: 'owns\n203.0.113.0/24', chip: 'path: 64500', on: true },
          { t: 'AS 64510', sub: 'transit\nprovider', chip: 'path: 64510 64500' },
          { t: 'AS 64520', sub: 'your\nISP', chip: 'path: 64520 64510 64500' },
        ],
      },
      facets: [
        { t: 'Announce', d: 'The origin AS tells its neighbours “I own this prefix.”' },
        { t: 'Prepend & pass on', d: 'Each AS adds its own number, then re-advertises — the path grows.' },
        { t: 'Detect loops', d: 'See your own AS in the path? Reject it — that’s how loops are avoided.' },
      ],
      note: [
        'Every router ends up knowing not just ',
        { i: 'that' },
        ' a prefix is reachable but the ',
        { a: 'full list of networks' },
        ' to cross — and picks among competing paths by ',
        { b: 'local policy' },
        ' first, shortest AS-path only after.',
      ],
    },
    steps: [
      { t: 'Peer over TCP', d: 'Two routers open a TCP 179 session and become neighbours — eBGP between AS, iBGP within one.' },
      { t: 'Exchange prefixes', d: 'Each peer advertises the address blocks it can reach, with the AS-path and other attributes attached.' },
      { t: 'Apply policy', d: 'Local preference, AS-path length and MED decide the best route — often about money, not distance.' },
      { t: 'Announce incrementally', d: 'Only changes are sent after the initial dump; withdrawals pull a prefix back when a link dies.' },
    ],
    beats: {
      kicker: 'Path attributes that decide the winner',
      items: [
        { t: 'Local Pref', d: 'preferred exit, checked first' },
        { t: 'AS-Path', d: 'shorter usually wins' },
        { t: 'MED', d: 'a hint to a neighbour AS' },
        { t: 'Next-Hop', d: 'where to actually send it' },
        { t: 'Communities', d: 'tags that trigger policy' },
        { t: 'Origin', d: 'how the prefix entered BGP' },
      ],
    },
    security: {
      lede: [
        'BGP runs on ',
        { a: 'trust between operators' },
        ' — it believes what peers announce — so a bad or forged advertisement can ',
        { b: 'redirect a chunk of the internet.' },
      ],
      points: [
        { t: 'Prefix hijacking', d: 'An AS announces a block it doesn’t own; traffic to those addresses is drawn to the wrong network.' },
        { t: 'Route leaks', d: 'Re-advertising routes you shouldn’t sends traffic down a path never meant to carry it — often by accident.' },
        { t: 'RPKI & ROV', d: 'Signed records say which AS may originate a prefix; origin validation drops announcements that disagree.' },
        { t: 'Traffic interception', d: 'A subtle hijack passes traffic through, inspects it, then forwards on — hard to notice from the endpoints.' },
        { t: 'Max-prefix & filters', d: 'Prefix limits and strict inbound filters contain a peer that suddenly floods bad or excessive routes.' },
        { t: 'Session hardening', d: 'TCP-AO/MD5 and TTL security stop an outsider from spoofing or resetting the peering itself.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'BGP', on: true }],
    ridesNote:
      'It rides on TCP 179 for a reliable, ordered session — peers stay up for months, exchanging only changes.',
    aside: {
      kind: 'pair',
      title: 'Sessions & messages',
      tables: [
        {
          head: 'Peering',
          rows: [
            { k: 'eBGP', v: 'between AS', ink: 'a' },
            { k: 'iBGP', v: 'within AS', ink: 'a' },
            { k: 'Transit', v: 'vs peer', ink: 'a' },
          ],
        },
        {
          head: 'Messages',
          rows: [
            { k: 'OPEN', v: 'start' },
            { k: 'UPDATE', v: 'routes' },
            { k: 'KEEPALIVE', v: 'alive' },
            { k: 'NOTIFICATION', v: 'error' },
          ],
        },
      ],
    },
    footnote:
      'BGP chooses paths by policy first — the shortest route on the map is often not the one taken.',
  },

  dns: {
    crumb: 'Naming & Config',
    kicker: 'Layer 7 · Naming · the phone book of the internet',
    title: 'DNS',
    sub: 'Domain Name System',
    lede: [
      'DNS is the internet’s ',
      { i: 'directory.' },
      ' People type names; machines route to numbers — DNS ',
      { a: 'translates a name like example.com into the IP address' },
      ' a packet can actually reach. It is a ',
      { b: 'distributed, hierarchical database' },
      ' that answers billions of lookups a second, almost always over a single small UDP exchange.',
    ],
    takeaway: [
      'DNS turns a ',
      { a: 'name you can read' },
      ' into an ',
      { b: 'address a packet can reach' },
      ' — then caches the answer so it needn’t ask again.',
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'an application service' },
      { k: 'Port', v: '53', note: 'UDP, TCP for large' },
      { k: 'Shape', v: 'Hierarchical tree', note: 'root → TLD → zone' },
      { k: 'Speed trick', v: 'Caching', note: 'answers carry a TTL' },
    ],
    diagram: {
      caption: 'Resolving www.example.com — the recursive walk',
      resolve: {
        ask: {
          left: {
            t: 'Your device',
            d: 'stub resolver asks “where is example.com?”',
            tone: 'a',
          },
          right: { t: 'Recursive resolver', d: 'does the legwork & caches', tone: 'b' },
        },
        bridge: 'If not already cached, the resolver walks the tree from the top…',
        referrals: [
          {
            from: 'Root server',
            tone: 'b',
            text: ['“Ask the ', { s: '.com' }, ' servers” — a referral, not the answer'],
          },
          {
            from: '.com TLD server',
            tone: 'b',
            text: ['“Ask ', { s: 'example.com' }, '’s authoritative server”'],
          },
          {
            from: 'Authoritative',
            tone: 'a',
            text: ['“A record → ', { a: '93.184.216.34' }, '” — the real answer'],
          },
        ],
        answer: {
          left: { t: 'Answer + TTL cached', d: 'next lookup is instant', tone: 'a', filled: true },
          right: {
            t: 'Resolver returns 93.184.216.34',
            d: 'your device connects',
            tone: 'b',
          },
        },
      },
      note: [
        'Each level hands back a ',
        { b: 'referral' },
        ' until the ',
        { a: 'authoritative' },
        ' server gives the record. Every answer carries a ',
        { s: 'TTL' },
        ', so the whole walk usually happens once and then is served from cache.',
      ],
    },
    steps: [
      { t: 'Ask the resolver', d: 'Your device sends one small UDP query to a recursive resolver — often your ISP’s or a public one.' },
      { t: 'Walk the hierarchy', d: 'On a miss the resolver asks root, then the TLD, then the authoritative server — each a referral downward.' },
      { t: 'Return the record', d: 'The authoritative server answers with the record type asked for — an A or AAAA address, an MX, a CNAME.' },
      { t: 'Cache by TTL', d: 'Every layer stores the answer for its time-to-live, so repeat lookups skip the walk entirely.' },
    ],
    beats: {
      kicker: 'Common record types',
      items: [
        { t: 'A / AAAA', d: 'name → IPv4 / IPv6' },
        { t: 'CNAME', d: 'an alias to another name' },
        { t: 'MX', d: 'where mail is delivered' },
        { t: 'NS', d: 'a zone’s name servers' },
        { t: 'TXT', d: 'free text: SPF, verification' },
        { t: 'PTR', d: 'reverse: IP → name' },
      ],
    },
    security: {
      lede: [
        'DNS is early in almost every connection and was ',
        { a: 'designed with no authentication' },
        ', which makes it both a prime target and a favourite ',
        { b: 'covert channel.' },
      ],
      points: [
        { t: 'Cache poisoning', d: 'A forged reply slips a wrong address into a resolver’s cache, sending everyone to the attacker’s host.' },
        { t: 'DNSSEC', d: 'Signs records with a chain of trust from the root, so a resolver can detect tampering.' },
        { t: 'DoH & DoT', d: 'DNS over HTTPS/TLS encrypts the query itself, hiding which sites you look up from the network.' },
        { t: 'DDoS amplification', d: 'A tiny spoofed query provokes a large reply aimed at the victim — open resolvers make it worse.' },
        { t: 'DNS tunnelling', d: 'Malware hides data inside seemingly innocent lookups to smuggle it past a firewall.' },
        { t: 'Domain hijacking', d: 'Stolen registrar credentials repoint a whole domain; registry locks and MFA are the defence.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'DNS', on: true }],
    ridesNote:
      'Nearly always a single UDP datagram on port 53; queries too large for one packet fall back to TCP.',
    aside: {
      kind: 'pair',
      title: 'Anatomy & ports',
      tables: [
        {
          head: 'The name tree',
          rows: [
            { k: '.', v: 'root', ink: 'a' },
            { k: '.com', v: 'TLD', ink: 'a' },
            { k: 'example', v: 'zone', ink: 'a' },
            { k: 'www', v: 'host', ink: 'a' },
          ],
        },
        {
          head: 'Ports',
          rows: [
            { k: '53/udp', v: 'queries' },
            { k: '53/tcp', v: 'large · zone' },
            { k: '853', v: 'DoT' },
            { k: '443', v: 'DoH' },
          ],
        },
      ],
    },
    footnote:
      'Caching is why the internet feels instant — the tree is only walked when a TTL runs out.',
  },

  dhcp: {
    crumb: 'Naming & Config',
    kicker: 'Layer 7 · Config · how a device joins a network',
    title: 'DHCP',
    sub: 'Dynamic Host Configuration Protocol',
    lede: [
      'DHCP is the ',
      { i: 'welcome desk.' },
      ' When a device joins a network it has no address, no gateway, no resolver — DHCP ',
      { a: 'hands it all of that in one short exchange' },
      ', then ',
      { b: 'leases the address for a fixed time.' },
      ' It is why plugging in or joining Wi-Fi simply works, with nothing to configure by hand.',
    ],
    takeaway: [
      'DHCP gives a joining device its ',
      { a: 'address, gateway and resolver' },
      ' in one exchange — on a ',
      { b: 'lease it must renew.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'a config service' },
      { k: 'Ports', v: '67 · 68', note: 'UDP — server, client' },
      { k: 'Exchange', v: 'DORA', note: '4 messages' },
      { k: 'Grants a', v: 'Lease', note: 'time-limited, renewed' },
    ],
    diagram: {
      caption: 'The DORA handshake — Discover, Offer, Request, Acknowledge',
      exchange: {
        lanes: { left: 'Client (no address yet)', right: 'DHCP server' },
        messages: [
          { label: '1 · DISCOVER — broadcast “is anyone a DHCP server?”', dir: 'right' },
          { label: '2 · OFFER — “you can have 192.168.1.42”', dir: 'left' },
          { label: '3 · REQUEST — “yes, I’ll take that one” (still a broadcast)', dir: 'right' },
          {
            label: '4 · ACK — address + gateway + DNS + lease time',
            dir: 'left',
            card: {
              quote: 'What the ACK carries',
              rows: [
                { k: 'IP address + subnet mask', v: '192.168.1.42 / 24' },
                { k: 'Default gateway', v: '192.168.1.1' },
                { k: 'DNS resolver', v: 'option 6' },
                { k: 'Lease time', v: 'e.g. 24 h' },
              ],
            },
          },
        ],
        note: [
          'The client starts with ',
          { a: 'no address at all' },
          ', so it ',
          { s: 'broadcasts' },
          '. Halfway through the lease it quietly renews with the same server — no broadcast needed.',
        ],
      },
    },
    steps: [
      { t: 'Discover a server', d: 'With no address, the client broadcasts to 255.255.255.255 — any DHCP server on the segment hears it.' },
      { t: 'Take an offer', d: 'Servers offer a free address from the pool; the client picks one and formally requests it.' },
      { t: 'Receive the config', d: 'The ACK brings the address, subnet, gateway, DNS resolvers and a lease time in one packet.' },
      { t: 'Renew the lease', d: 'At about half the lease the client renews directly; let it lapse and the address returns to the pool.' },
    ],
    beats: {
      kicker: 'Beyond one segment',
      items: [
        { t: 'Relay agent', d: 'forwards broadcasts across a router' },
        { t: 'Reservation', d: 'a fixed IP pinned to a MAC' },
        { t: 'DHCPv6', d: 'the IPv6 counterpart' },
      ],
    },
    security: {
      lede: [
        'DHCP begins with ',
        { a: 'unauthenticated discovery on the local network' },
        ', so whoever answers first sets your gateway and DNS — a powerful position for ',
        { b: 'an attacker on the same segment.' },
      ],
      points: [
        { t: 'Rogue DHCP server', d: 'A fake server answers first and hands out its own gateway & DNS — a clean man-in-the-middle.' },
        { t: 'DHCP snooping', d: 'Switches learn which port the real server is on and drop offers from any other — the core defence.' },
        { t: 'Pool starvation', d: 'Flooding requests with spoofed MACs drains the pool so no one else can get an address.' },
        { t: 'DNS redirection', d: 'Because DHCP sets the resolver, a bad lease quietly points every lookup at an attacker’s DNS.' },
        { t: 'Rogue routes (opt 121)', d: 'Classless static routes in a lease can steer traffic around a VPN — the “TunnelVision” trick.' },
        { t: 'Port security & 802.1X', d: 'Authenticating the device before it ever reaches DHCP keeps rogue clients off the segment.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'DHCP', on: true }],
    ridesNote:
      'Broadcast UDP: server on 67, client on 68 — it must work before the device has any address at all.',
    aside: {
      kind: 'pair',
      title: 'DORA & options',
      tables: [
        {
          head: 'DORA',
          rows: [
            { k: 'Discover', v: 'client', ink: 'a' },
            { k: 'Offer', v: 'server', ink: 'b' },
            { k: 'Request', v: 'client', ink: 'a' },
            { k: 'Ack', v: 'server', ink: 'b' },
          ],
        },
        {
          head: 'Key options',
          rows: [
            { k: '1', v: 'subnet mask' },
            { k: '3', v: 'gateway' },
            { k: '6', v: 'DNS' },
            { k: '51', v: 'lease time' },
          ],
        },
      ],
    },
    footnote:
      'Whoever answers the broadcast first sets your gateway — which is exactly why snooping matters.',
  },

  http: {
    crumb: 'Web & Transfer',
    kicker: 'Layer 7 · Application protocol',
    title: 'HTTP',
    sub: 'the HyperText Transfer Protocol',
    lede: [
      'HTTP is the ',
      { i: 'request-and-response language of the web.' },
      ' A client ',
      { a: 'asks for a resource with a method and a path' },
      ', the server ',
      { a: 'answers with a status code, headers and a body' },
      ', and ',
      { b: 'each exchange stands on its own' },
      ' — simple, text-based, and everywhere.',
    ],
    takeaway: [
      'HTTP is a ',
      { a: 'request and a response' },
      ' — the client asks, the server answers, ',
      { b: 'one exchange at a time.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'Application' },
      { k: 'Port', v: '80 · 443', note: '443 = HTTPS' },
      { k: 'Model', v: 'Request / response', note: 'client asks first' },
      { k: 'State', v: 'Stateless', note: 'cookies add memory' },
    ],
    diagram: {
      caption: 'The client asks, the server answers',
      exchange: {
        lanes: { left: 'Browser', right: 'Web server' },
        messages: [
          {
            label: 'Request',
            dir: 'right',
            card: {
              quote: 'GET /index.html HTTP/1.1',
              lines: ['Host: example.com', 'Accept: text/html'],
            },
          },
          {
            label: 'Response',
            dir: 'left',
            card: {
              quote: 'HTTP/1.1 200 OK',
              lines: ['Content-Type: text/html', '<!doctype html> … the page'],
            },
          },
        ],
        note: [
          'A ',
          { a: 'method and path' },
          ' go up, a ',
          { b: 'status code and body' },
          ' come back. The server keeps no memory of the request once it’s answered.',
        ],
      },
    },
    steps: [
      { t: 'Open a connection', d: 'The browser resolves the name via DNS and opens a TCP connection — wrapped in TLS for HTTPS.' },
      { t: 'Send a request', d: 'A method (GET, POST…), a path and headers — optionally a body for data being submitted.' },
      { t: 'Server responds', d: 'A status code (200, 404, 500…), headers describing the content, and the body itself.' },
      { t: 'Reuse or close', d: 'The connection is kept alive for more requests, or closed. State is carried by cookies and tokens, not HTTP itself.' },
    ],
    security: {
      lede: [
        'Plain HTTP is ',
        { a: 'readable and forgeable in transit' },
        ', and its flexibility makes the app above it ',
        { b: 'the web’s biggest attack surface.' },
      ],
      points: [
        { t: 'Use HTTPS', d: 'Plain HTTP is sniffable and modifiable en route — TLS makes it HTTPS.' },
        { t: 'Injection & XSS', d: 'Unsanitised parameters and bodies feed SQL injection and cross-site scripting.' },
        { t: 'Session hijacking', d: 'Stealing a cookie steals the session — mark cookies Secure and HttpOnly.' },
        { t: 'Security headers', d: 'HSTS, CSP and CORS headers harden a site against whole classes of attack.' },
        { t: 'Request smuggling', d: 'Disagreements over request boundaries let attackers sneak requests past proxies.' },
        { t: 'CSRF', d: 'Because requests carry cookies automatically, forged cross-site requests need tokens to stop.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'TLS' }, { t: 'HTTP', on: true }],
    aside: {
      kind: 'pair',
      title: 'Methods & status codes',
      tables: [
        {
          head: 'Methods',
          rows: [
            { k: 'GET', v: 'read', ink: 'a' },
            { k: 'POST', v: 'create', ink: 'a' },
            { k: 'PUT', v: 'replace', ink: 'a' },
            { k: 'DELETE', v: 'remove', ink: 'a' },
          ],
        },
        {
          head: 'Status',
          rows: [
            { k: '2xx', v: 'ok' },
            { k: '3xx', v: 'redirect' },
            { k: '4xx', v: 'you erred' },
            { k: '5xx', v: 'server erred' },
          ],
        },
      ],
    },
    footnote: 'HTTP/2 and HTTP/3 change how it travels — the request/response model stays the same.',
  },

  tls: {
    crumb: 'Security',
    kicker: 'Layer 6 · Security · wraps the transport',
    title: 'TLS',
    sub: 'Transport Layer Security',
    lede: [
      'TLS is the ',
      { i: 'envelope the web travels in.' },
      ' Before any data flows, client and server ',
      { a: 'run a handshake to agree on keys and check the server’s certificate' },
      ', and from then on every byte is ',
      { a: 'encrypted, tamper-evident and bound to who they’re talking to' },
      ' — it is the ',
      { b: 'S in HTTPS.' },
    ],
    takeaway: [
      'TLS turns a plain connection into a ',
      { a: 'private, verified channel' },
      ' — agree on keys once, then ',
      { b: 'encrypt everything after.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 6', note: 'above TCP, below the app' },
      { k: 'Port', v: 'None of its own', note: '443 with HTTP' },
      { k: 'Provides', v: 'Privacy + identity', note: 'encrypt & authenticate' },
      { k: 'Current', v: 'TLS 1.3', note: '2018 · 1-RTT handshake' },
    ],
    diagram: {
      caption: 'The handshake, then encrypted records',
      exchange: {
        lanes: { left: 'Client', right: 'Server' },
        messages: [
          {
            label: 'ClientHello',
            dir: 'right',
            card: {
              quote: 'Supported versions: TLS 1.3',
              lines: ['Cipher suites + client random', 'Key share (ephemeral public key)'],
            },
          },
          {
            label: 'ServerHello + Certificate',
            dir: 'left',
            card: {
              quote: 'Chosen cipher + server key share',
              lines: ['Certificate (signed by a CA)', 'Finished — switch to encrypted'],
            },
          },
          { label: 'Encrypted application data', dir: 'both' },
        ],
        note: [
          'Both sides mix their ',
          { a: 'key shares' },
          ' into the same secret without ever sending it. The ',
          { b: 'certificate' },
          ' proves the server is who it claims — then every record after is sealed.',
        ],
      },
    },
    steps: [
      { t: 'Hello & negotiate', d: 'Over an open TCP connection, both sides agree a TLS version and cipher suite and trade random values.' },
      { t: 'Prove identity', d: 'The server sends a certificate chain; the client checks it against a trusted CA and the hostname.' },
      { t: 'Derive a shared key', d: 'An ephemeral (ECDHE) key exchange lets both compute the same secret — giving forward secrecy.' },
      { t: 'Encrypt everything', d: 'Application data flows as authenticated, encrypted records — sessions can resume to skip the full handshake.' },
    ],
    security: {
      lede: [
        'TLS is the web’s baseline defence — but its ',
        { a: 'security rests on the certificate chain being validated' },
        ', and old versions and weak ciphers ',
        { b: 'quietly undo the whole guarantee.' },
      ],
      points: [
        { t: 'Certificate validation', d: 'Skip the chain, expiry or hostname check and an attacker’s certificate sails through unnoticed.' },
        { t: 'Downgrade attacks', d: 'A meddler forces the connection onto an old version or weak cipher it can break — disable them.' },
        { t: 'Forward secrecy', d: 'Ephemeral keys mean a stolen server key can’t decrypt yesterday’s recorded traffic.' },
        { t: 'Man-in-the-middle', d: 'Corporate proxies and attackers alike intercept TLS — certificate pinning narrows who’s trusted.' },
        { t: 'Expired & misissued certs', d: 'Lapsed or wrongly issued certificates break trust; automation (ACME) and CT logs keep them honest.' },
        { t: 'Encrypted ≠ safe', d: 'TLS hides traffic in transit — it says nothing about whether the server itself is malicious.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'TLS', on: true }, { t: 'HTTP' }],
    aside: {
      kind: 'pair',
      title: 'Handshake & versions',
      tables: [
        {
          head: 'Handshake',
          rows: [
            { k: 'Hello', v: 'negotiate', ink: 'a' },
            { k: 'Cert', v: 'identity', ink: 'a' },
            { k: 'Key', v: 'exchange', ink: 'a' },
            { k: 'Finished', v: 'encrypt', ink: 'a' },
          ],
        },
        {
          head: 'Versions',
          rows: [
            { k: '1.3', v: 'current' },
            { k: '1.2', v: 'common' },
            { k: '1.1 / 1.0', v: 'retired' },
            { k: 'SSL 3', v: 'broken' },
          ],
        },
      ],
    },
    footnote:
      'TLS 1.3 folds identity and key exchange into one round trip — faster, and safer by default.',
  },

  ssh: {
    crumb: 'Security',
    kicker: 'Layer 7 · Security · the encrypted remote shell',
    title: 'SSH',
    sub: 'Secure Shell',
    lede: [
      'SSH is ',
      { i: 'the way in.' },
      ' It gives an administrator an ',
      { a: 'encrypted, authenticated channel to a remote machine' },
      ' — a shell, a file transfer, a tunnel — over a network that can’t be trusted. It replaced Telnet and rlogin, which sent ',
      { b: 'passwords in the clear,' },
      ' and is now the backbone of server operations.',
    ],
    takeaway: [
      'SSH proves ',
      { a: 'both ends’ identity' },
      ', then opens an encrypted channel that can carry ',
      { b: 'a shell, files, or any tunnelled port.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'over a TCP connection' },
      { k: 'Port', v: '22', note: 'TCP' },
      { k: 'Authenticates', v: 'Both ends', note: 'host key + user key' },
      { k: 'Version', v: 'SSH-2', note: '1996 · SSH-1 broken' },
    ],
    diagram: {
      caption: 'Three layers, built one on the last',
      layers: {
        lanes: { left: 'Client', right: 'Server' },
        items: [
          {
            head: '1 · Transport layer — key exchange & host key',
            tone: 'a',
            lines: [
              ['Diffie-Hellman derives a shared session key — the channel is encrypted from here on.'],
              [
                'Server presents its ',
                { s: 'host key' },
                '; the client checks it against ',
                { m: 'known_hosts' },
                ' — is this really the server?',
              ],
            ],
          },
          {
            head: '2 · User authentication — prove who you are',
            tone: 'b',
            lines: [
              [
                { s: 'Public key:' },
                ' client signs a challenge with its private key; server checks authorized_keys.',
              ],
              ['Or password, or keyboard-interactive (MFA) — all inside the already-encrypted channel.'],
            ],
          },
          {
            head: '3 · Connection layer — multiplexed channels',
            tone: 'plain',
            lines: [
              [
                'One connection carries many channels at once — an interactive shell, an SFTP transfer, and forwarded ports, all multiplexed.',
              ],
            ],
          },
        ],
      },
      note: [
        'Encrypt first, ',
        { a: 'verify the server' },
        ', then ',
        { b: 'authenticate the user' },
        ' — only then does any shell or file traffic flow, and it can all share one connection.',
      ],
    },
    steps: [
      { t: 'Agree a session key', d: 'Over TCP 22, a Diffie-Hellman exchange gives both sides a shared secret without ever sending it.' },
      { t: 'Verify the host key', d: 'The client matches the server’s key to known_hosts — that first-connect fingerprint prompt is this check.' },
      { t: 'Authenticate the user', d: 'A key pair is the norm — the private key stays on the client, its public half sits in authorized_keys.' },
      { t: 'Open channels', d: 'Run a shell, tunnel a port, or hand off to SFTP — many channels multiplex over the one connection.' },
    ],
    beats: {
      kicker: 'What people do with it',
      items: [
        { t: 'Remote shell', d: 'a terminal on the server' },
        { t: 'SFTP / SCP', d: 'encrypted file transfer' },
        { t: 'Port forwarding', d: 'tunnel any TCP service' },
        { t: 'Git transport', d: 'push over git@' },
        { t: 'Jump hosts', d: 'hop through a bastion' },
        { t: 'SOCKS proxy', d: 'a dynamic tunnel' },
      ],
    },
    security: {
      lede: [
        'SSH is the front door to servers, so it is ',
        { a: 'relentlessly probed' },
        ' — and its power to tunnel makes it a favourite for ',
        { b: 'moving quietly once inside.' },
      ],
      points: [
        { t: 'Keys over passwords', d: 'Disabling password auth stops the endless brute-force attempts against port 22 outright.' },
        { t: 'Host-key checking', d: 'Blindly accepting a changed key opens the door to a man-in-the-middle — verify the fingerprint.' },
        { t: 'Key sprawl', d: 'Forgotten authorized_keys entries become standing back doors; rotate and audit them.' },
        { t: 'Agent forwarding risk', d: 'A compromised jump host can hijack a forwarded agent to reach everything you can — scope it.' },
        { t: 'Tunnelling & exfil', d: 'The same port forwarding admins love lets an intruder smuggle traffic straight past a firewall.' },
        { t: 'Bastion & certificates', d: 'Short-lived SSH certificates and a single bastion beat scattering static keys across a fleet.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'SSH', on: true }],
    ridesNote:
      'SSH provides its own encryption — it rides straight on TCP rather than through TLS.',
    aside: {
      kind: 'pair',
      title: 'Layers & auth',
      tables: [
        {
          head: 'The layers',
          rows: [
            { k: 'Transport', v: 'encrypt', ink: 'a' },
            { k: 'Auth', v: 'identity', ink: 'a' },
            { k: 'Connection', v: 'channels', ink: 'a' },
          ],
        },
        {
          head: 'Auth methods',
          rows: [
            { k: 'Public key', v: 'preferred' },
            { k: 'Certificate', v: 'at scale' },
            { k: 'Keyboard', v: 'MFA' },
            { k: 'Password', v: 'weakest' },
          ],
        },
      ],
    },
    footnote: 'A key pair beats a password every time — the private half never leaves your machine.',
  },

  smtp: {
    crumb: 'Mail',
    kicker: 'Layer 7 · Mail · how a message gets delivered',
    title: 'SMTP',
    sub: 'Simple Mail Transfer Protocol',
    lede: [
      'SMTP is the ',
      { i: 'postal service of email.' },
      ' It is a ',
      { a: 'push protocol' },
      ' — it moves a message from your client to your provider, then from server to server, until it lands in the recipient’s mailbox. Reading that mail is another protocol’s job; SMTP only ever ',
      { b: 'carries it forward.' },
    ],
    takeaway: [
      'SMTP only ever ',
      { a: 'pushes mail forward' },
      ' — retrieving it from the mailbox is ',
      { b: 'IMAP’s and POP3’s job.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'a text command dialog' },
      { k: 'Ports', v: '587 · 25', note: 'submit · relay · 465' },
      { k: 'Direction', v: 'Push only', note: 'sends, never fetches' },
      { k: 'Secured by', v: 'STARTTLS', note: '+ SPF · DKIM · DMARC' },
    ],
    diagram: {
      caption: 'A message’s journey — and the SMTP dialog that carries it',
      relay: {
        stops: [
          { t: 'Your client', sub: 'MUA', on: true },
          { t: 'Your server', sub: 'MSA / MTA' },
          { t: 'Their server', sub: 'MX / MTA' },
          { t: 'Recipient', sub: 'MUA', end: true },
        ],
        legs: ['587', '25', 'IMAP'],
      },
      dialog: {
        label: 'The envelope conversation',
        rows: [
          { who: 'C →', tone: 'a', text: 'HELO / EHLO mail.example.com' },
          { who: 'C →', tone: 'a', text: 'MAIL FROM:<me@example.com>' },
          { who: 'C →', tone: 'a', text: 'RCPT TO:<you@other.net>' },
          { who: 'C →', tone: 'a', text: 'DATA … headers, body, then “.”' },
          { who: 'S ←', tone: 'b', text: '250 OK — message queued for delivery' },
        ],
      },
      note: [
        'The ',
        { a: 'envelope' },
        ' (MAIL FROM / RCPT TO) decides delivery — separately from the From: header you see. If the next hop is down, the server ',
        { b: 'queues and retries' },
        ' rather than losing the mail.',
      ],
    },
    steps: [
      { t: 'Submit', d: 'Your client hands the message to its server on port 587, authenticated and over TLS.' },
      { t: 'Find the MX', d: 'The server looks up the recipient domain’s MX record in DNS to learn which host accepts its mail.' },
      { t: 'Relay server to server', d: 'It connects to that MX on port 25 and runs the same envelope dialog to hand the message over.' },
      { t: 'Queue, retry, or bounce', d: 'Accepted mail lands in the mailbox; a temporary failure is retried, a permanent one bounces back.' },
    ],
    beats: {
      kicker: 'The anti-forgery trio',
      items: [
        { t: 'SPF', d: 'which servers may send for a domain' },
        { t: 'DKIM', d: 'a signature proving nothing changed' },
        { t: 'DMARC', d: 'the policy tying the two together' },
      ],
    },
    security: {
      lede: [
        'SMTP was built for a ',
        { a: 'trusting network' },
        ' where any server would relay for anyone — so almost every layer of email security since has been about ',
        { b: 'proving a message is really from who it claims.' },
      ],
      points: [
        { t: 'Spoofing', d: 'The From: header is free text; SPF, DKIM and DMARC exist because SMTP alone can’t vouch for a sender.' },
        { t: 'Open relays', d: 'A server that relays for anyone becomes a spam cannon — authenticated submission closed that door.' },
        { t: 'Phishing & BEC', d: 'Look-alike domains and forged display names carry most business email compromise — DMARC blunts it.' },
        { t: 'Opportunistic TLS', d: 'STARTTLS encrypts server-to-server hops, but a downgrade is possible — MTA-STS enforces it.' },
        { t: 'Reputation & blocklists', d: 'A sending IP’s history decides whether mail is trusted, greylisted or dropped before content is even read.' },
        { t: 'Harvesting & enumeration', d: 'VRFY and verbose RCPT errors leak valid addresses; hardened servers give nothing away.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'TLS' }, { t: 'SMTP', on: true }],
    ridesNote:
      'A reliable TCP session carries the text dialog; STARTTLS upgrades it to encryption mid-conversation.',
    aside: {
      kind: 'pair',
      title: 'Ports & verbs',
      tables: [
        {
          head: 'Ports',
          rows: [
            { k: '587', v: 'submission' },
            { k: '25', v: 'relay' },
            { k: '465', v: 'implicit TLS' },
            { k: '2525', v: 'alt submit' },
          ],
        },
        {
          head: 'Key verbs',
          rows: [
            { k: 'EHLO', v: 'greet' },
            { k: 'MAIL FROM', v: 'sender' },
            { k: 'RCPT TO', v: 'recipient' },
            { k: 'DATA', v: 'the message' },
          ],
        },
      ],
    },
    footnote:
      'The envelope, not the From: header, decides delivery — which is exactly why spoofing was so easy.',
  },

  websocket: {
    crumb: 'Web & Transfer',
    kicker: 'Layer 7 · Web · a persistent two-way channel',
    title: 'WebSocket',
    sub: 'Full-duplex over the web',
    lede: [
      'WebSocket is ',
      { i: 'the open line.' },
      ' HTTP is request-then-response — the server can’t speak unprompted. WebSocket ',
      { a: 'upgrades a single HTTP connection into a persistent channel' },
      ' where ',
      { b: 'either side can send a message at any time.' },
      ' It is how chat, live dashboards and multiplayer games stay in sync.',
    ],
    takeaway: [
      'WebSocket starts as HTTP, then ',
      { a: 'upgrades to a lasting channel' },
      ' where ',
      { b: 'both ends push freely.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'over one TCP conn' },
      { k: 'Ports', v: '80 · 443', note: 'ws:// · wss://' },
      { k: 'Direction', v: 'Full-duplex', note: 'both ways, anytime' },
      { k: 'Starts as', v: 'HTTP', note: 'then Upgrade: 101' },
    ],
    diagram: {
      caption: 'The HTTP upgrade, then a channel that stays open',
      exchange: {
        lanes: { left: 'Browser', right: 'Server' },
        messages: [
          {
            label: 'HTTP GET with Upgrade: websocket',
            dir: 'right',
            card: {
              quote: 'Connection: Upgrade · Sec-WebSocket-Key: …',
              gloss: ['A normal request on the same port — proxies and firewalls wave it through'],
            },
          },
          {
            label: '101 Switching Protocols',
            dir: 'left',
            card: {
              filled: true,
              quote: 'Sec-WebSocket-Accept confirms the key — the connection is now a WebSocket',
            },
          },
          {
            label: 'Messages flow both ways as framed data',
            dir: 'both',
            card: {
              tone: 'quiet',
              rows: [
                { k: 'Text / Binary frames', v: 'the payload', ink: 'a' },
                { k: 'Ping / Pong', v: 'keep-alive', ink: 'a' },
                { k: 'Close', v: 'graceful end', ink: 'a' },
              ],
            },
          },
        ],
        note: [
          'After the ',
          { b: '101' },
          ' the HTTP semantics fall away — no more requests and responses, just a ',
          { a: 'stream of frames' },
          ' either side sends whenever it has something to say.',
        ],
      },
    },
    steps: [
      { t: 'Handshake over HTTP', d: 'The client sends an Upgrade request; the server answers 101 and both switch off HTTP semantics.' },
      { t: 'Exchange frames', d: 'Small framed messages — text or binary — travel in either direction with almost no overhead.' },
      { t: 'Stay alive', d: 'Ping/Pong control frames keep the connection open through idle periods and detect a dead peer.' },
      { t: 'Close cleanly', d: 'Either end sends a Close frame with a status code; the app usually reconnects with backoff.' },
    ],
    beats: {
      kicker: 'Why not just poll?',
      items: [
        { t: 'Polling', d: 'ask repeatedly, wasteful & laggy' },
        { t: 'SSE', d: 'server→client only, one way' },
        { t: 'WebSocket', d: 'both ways, one open socket' },
      ],
    },
    security: {
      lede: [
        'A long-lived channel that ',
        { a: 'skips the usual per-request checks' },
        ' needs its own discipline — the browser’s same-origin rules ',
        { b: 'don’t protect it the way they protect fetches.' },
      ],
      points: [
        { t: 'Always use wss://', d: 'Plain ws:// is cleartext; wss:// runs the whole channel over TLS, just like HTTPS.' },
        { t: 'Cross-site hijacking', d: 'The handshake isn’t bound by CORS — check the Origin header and use a token, not just a cookie.' },
        { t: 'Authenticate the upgrade', d: 'Auth happens once at connect — validate it there, and re-check authorization on sensitive messages.' },
        { t: 'Validate every frame', d: 'Messages arrive outside the request pipeline, so input validation must live in the socket handler.' },
        { t: 'Resource exhaustion', d: 'Idle open sockets tie up memory; cap connections per user and time out the silent ones.' },
        { t: 'Proxy blind spot', d: 'Many WAFs inspect the handshake but not the frames — put message-level checks on the server.' },
      ],
    },
    rides: [{ t: 'TCP' }, { t: 'TLS' }, { t: 'HTTP' }, { t: 'WS', on: true }],
    ridesNote:
      'It borrows HTTP just long enough to open on port 443, then keeps that TCP connection for itself.',
    aside: {
      kind: 'pair',
      title: 'Frames & schemes',
      tables: [
        {
          head: 'Frame types',
          rows: [
            { k: 'Text', v: 'UTF-8', ink: 'a' },
            { k: 'Binary', v: 'bytes', ink: 'a' },
            { k: 'Ping/Pong', v: 'alive', ink: 'a' },
            { k: 'Close', v: 'code', ink: 'a' },
          ],
        },
        {
          head: 'Schemes',
          rows: [
            { k: 'ws://', v: '80' },
            { k: 'wss://', v: '443 · TLS' },
            { k: 'Upgrade', v: '101' },
            { k: 'Origin', v: 'check' },
          ],
        },
      ],
    },
    footnote: 'Same-origin rules don’t guard the handshake — check the Origin header yourself.',
  },

  tcp: {
    crumb: 'Transport',
    kicker: 'Layer 4 · Transport protocol',
    title: 'TCP',
    sub: 'the Transmission Control Protocol',
    lede: [
      'TCP is how two programs get ',
      { i: 'a reliable, ordered stream of bytes' },
      ' across an unreliable network. It ',
      { a: 'opens a connection with a handshake' },
      ', ',
      { a: 'numbers every byte and acknowledges it' },
      ', and ',
      { b: 'resends anything that goes missing' },
      ' — the workhorse under the web, email and most of the internet.',
    ],
    takeaway: [
      'TCP turns unreliable packets into a ',
      { a: 'reliable, in-order byte stream' },
      ' — ',
      { b: 'nothing lost, nothing out of order.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 4', note: 'Transport' },
      { k: 'Protocol number', v: 'IP 6', note: 'rides on IP' },
      { k: 'Delivery', v: 'Reliable', note: 'ordered & acked' },
      { k: 'Connection', v: 'Stateful', note: '3-way handshake' },
    ],
    diagram: {
      caption: 'The three-way handshake, then the stream',
      exchange: {
        lanes: { left: 'Client', right: 'Server' },
        messages: [
          { label: 'SYN', gloss: 'seq = x · “let’s talk”', dir: 'right' },
          { label: 'SYN + ACK', gloss: 'seq = y, ack = x+1', dir: 'left' },
          { label: 'ACK', gloss: 'ack = y+1 · “agreed”', dir: 'right' },
        ],
        settled: 'Connection established — bytes now flow both ways, each one acknowledged',
        note: [
          'Three messages agree on starting sequence numbers, so both sides can tell ',
          { a: 'which byte is which' },
          ' and spot anything missing. Only then does data move.',
        ],
      },
      header: {
        label: 'Every segment carries this header',
        ruler: ['0', '16 bits', '31'],
        rows: [
          [{ t: 'Source port' }, { t: 'Destination port' }],
          [{ t: 'Sequence number', hi: true }],
          [{ t: 'Acknowledgement number', hi: true }],
          [
            { t: 'Offset', w: 64, small: true },
            { t: 'Flags · SYN ACK FIN RST', alt: true, small: true },
            { t: 'Window size', w: 120, small: true },
          ],
          [{ t: 'Checksum' }, { t: 'Urgent pointer' }],
          [{ t: 'Options (if any)', faint: true }],
        ],
        payload: 'Data — the bytes being carried',
      },
    },
    steps: [
      { t: 'Open with a handshake', d: 'SYN, SYN-ACK, ACK — both ends agree to talk and pick starting sequence numbers.' },
      { t: 'Number every byte', d: 'Data is split into segments, each byte given a sequence number so the far end can reassemble it in order.' },
      { t: 'Acknowledge & retransmit', d: 'The receiver ACKs what arrived; anything unacknowledged is resent, so nothing is lost.' },
      { t: 'Control the flow', d: 'A sliding window and congestion control tune the send rate to what the receiver and network can handle — then a FIN closes it.' },
    ],
    security: {
      lede: [
        'TCP’s connection state makes it reliable — and gives attackers ',
        { a: 'state to exhaust' },
        ' and ',
        { b: 'a session to hijack.' },
        ' On its own it carries no encryption.',
      ],
      points: [
        { t: 'SYN flood', d: 'Half-open connections pile up to exhaust the server; SYN cookies defend against it.' },
        { t: 'Session hijacking', d: 'Guessing or sniffing sequence numbers lets an attacker inject into a live connection.' },
        { t: 'RST injection', d: 'A forged reset packet can tear a connection down — a classic censorship and DoS trick.' },
        { t: 'No confidentiality', d: 'TCP sends in the clear — wrap it in TLS for privacy and integrity.' },
        { t: 'Port scanning', d: 'The handshake’s responses reveal which ports are open — the first step of recon.' },
        { t: 'State exhaustion', d: 'Every connection costs memory; floods of them are a denial-of-service vector.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP', on: true }, { t: 'HTTP, TLS, …' }],
    aside: {
      kind: 'header',
      title: 'The header, in brief',
      rows: [
        { k: 'Source port', v: 'who sent it' },
        { k: 'Destination port', v: 'which service' },
        { k: 'Sequence number', v: 'byte position', hi: true },
        { k: 'Acknowledgement', v: 'next expected', hi: true },
        { k: 'Flags', v: 'SYN · ACK · FIN · RST' },
        { k: 'Window size', v: 'flow control' },
      ],
    },
    footnote: 'Reliability is TCP’s whole promise — for speed without it, see UDP and QUIC.',
  },

  udp: {
    crumb: 'Transport',
    kicker: 'Layer 4 · Transport protocol',
    title: 'UDP',
    sub: 'the User Datagram Protocol',
    lede: [
      'UDP is the ',
      { i: 'fire-and-forget' },
      ' transport. It ',
      { a: 'wraps data in a tiny header and sends it' },
      ', with ',
      { a: 'no handshake and no acknowledgements' },
      ' — and ',
      { b: 'no promise it will arrive.' },
      ' What it trades away in safety it wins back in speed.',
    ],
    takeaway: [
      'UDP sends datagrams with ',
      { a: 'no setup and no guarantees' },
      ' — ',
      { b: 'fast, thin, and best-effort.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 4', note: 'Transport' },
      { k: 'Protocol number', v: 'IP 17', note: 'rides on IP' },
      { k: 'Delivery', v: 'Best-effort', note: 'no ordering, no ACK' },
      { k: 'Connection', v: 'Stateless', note: 'no handshake' },
    ],
    diagram: {
      caption: 'No handshake — just send and hope',
      exchange: {
        lanes: { left: 'Sender', right: 'Receiver' },
        messages: [
          { label: 'Datagram', gloss: 'just the data, addressed to a port', dir: 'right' },
          { label: 'Datagram', gloss: 'next one — no waiting for a reply', dir: 'right' },
          { label: 'Datagram lost', gloss: 'no retransmit — it’s simply gone', dir: 'lost' },
        ],
        settled: 'No connection, no ACK, no order — if it matters, the application must handle it',
      },
      header: {
        label: 'The whole header is just 8 bytes',
        ruler: ['0', '16 bits', '31'],
        rows: [
          [
            { t: 'Source port', hi: true },
            { t: 'Destination port', hi: true },
          ],
          [{ t: 'Length' }, { t: 'Checksum' }],
        ],
        payload: 'Data — the bytes being carried',
        note: [
          'Four small fields, then the data. There’s nothing to set up and nothing to remember — which is exactly why UDP is ',
          { a: 'so fast and so cheap.' },
        ],
      },
    },
    steps: [
      { t: 'Skip the handshake', d: 'There’s no connection to open — the first packet is the data, sent immediately.' },
      { t: 'Wrap in a tiny header', d: 'Just source and destination ports, a length and a checksum — eight bytes in all.' },
      { t: 'Send and forget', d: 'The datagram goes out with no acknowledgement; a lost one is simply gone.' },
      { t: 'Leave the rest to the app', d: 'If order or reliability matter, the application (or a layer like QUIC) adds them on top.' },
    ],
    security: {
      lede: [
        'Having no handshake makes UDP fast — and makes it ',
        { a: 'trivial to spoof' },
        ' and ',
        { b: 'a favourite tool for amplification attacks.' },
      ],
      points: [
        { t: 'Amplification / reflection', d: 'A small spoofed request draws a huge reply to the victim — DNS and NTP are classic amplifiers.' },
        { t: 'Easy source spoofing', d: 'With no handshake to complete, the source address is never verified.' },
        { t: 'No confidentiality', d: 'UDP is plaintext — secure it with DTLS or ride it under QUIC.' },
        { t: 'Flood attacks', d: 'Stateless floods are cheap to send and hard to filter without rate limits.' },
        { t: 'Firewall handling', d: 'With no connection to track, stateful firewalls treat UDP with cruder rules.' },
        { t: 'Quiet scanning', d: 'Closed ports may not reply at all, so UDP scans are slow but stealthy.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP', on: true }, { t: 'DNS, RTP, QUIC, …' }],
    aside: {
      kind: 'compare',
      title: 'TCP or UDP?',
      cols: ['TCP', 'UDP'],
      rows: [
        { k: 'Setup', a: 'Handshake', b: 'None' },
        { k: 'Reliability', a: 'Guaranteed', b: 'Best-effort' },
        { k: 'Order', a: 'Kept', b: 'Not kept' },
        { k: 'Best for', a: 'Web, mail, files', b: 'Voice, video, games' },
      ],
    },
    footnote: 'When every millisecond counts more than every packet, you choose UDP.',
  },

  quic: {
    crumb: 'Transport',
    kicker: 'Layer 4 · Transport · a reliable, encrypted stream on top of UDP',
    title: 'QUIC',
    sub: 'UDP-Based Multiplexed and Secure Transport',
    lede: [
      'QUIC is a ',
      { i: 'fresh take on transport.' },
      ' It rebuilds TCP’s reliability ',
      { a: 'on top of UDP' },
      ', folds TLS 1.3 encryption into the handshake, and carries ',
      { b: 'many independent streams at once' },
      ' — so one lost packet no longer stalls all the others. It is the transport under HTTP/3.',
    ],
    takeaway: [
      'QUIC gives TCP’s reliability ',
      { a: 'without TCP’s connection-wide head-of-line blocking' },
      ' — encrypted by default and ',
      { b: 'fast to connect.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 4', note: 'built over UDP' },
      { k: 'Port', v: '443', note: 'UDP' },
      { k: 'Encryption', v: 'Built in', note: 'TLS 1.3, always' },
      { k: 'Standardised', v: '2021', note: 'RFC 9000' },
    ],
    diagram: {
      caption:
        'One connection, many independent streams — and why a loss no longer stalls them all',
      panels: [
        {
          title: 'TCP + TLS — one byte stream',
          lanes: [{ blocks: ['ok', 'stuck', 'idle', 'idle'] }],
          note: 'A lost segment blocks everything queued behind it — head-of-line blocking.',
        },
        {
          title: 'QUIC — independent streams',
          on: true,
          lanes: [
            { label: 'S1', blocks: ['ok', 'ok'] },
            { label: 'S2', blocks: ['stuck', 'idle'] },
            { label: 'S3', blocks: ['ok', 'ok'] },
          ],
          note: 'Only stream 2 waits for its retransmit; 1 and 3 keep flowing.',
        },
      ],
      facets: [
        { t: '1-RTT connect', d: 'Transport + TLS handshake combine, so data flows after a single round trip.' },
        { t: '0-RTT resume', d: 'A returning client can send data in the very first packet.' },
        { t: 'Connection IDs', d: 'Identify a connection by ID, not IP:port — so it survives a network change.' },
      ],
      note: [
        'Because QUIC lives in ',
        { a: 'user space over UDP' },
        ', browsers ship changes without waiting on the OS — and a phone moving from Wi-Fi to cellular ',
        { b: 'keeps the same connection' },
        ' by its Connection ID.',
      ],
    },
    steps: [
      { t: 'Connect and encrypt at once', d: 'The transport and TLS 1.3 handshakes merge into one exchange — there is no unencrypted QUIC.' },
      { t: 'Open many streams', d: 'Each request gets its own stream, delivered and flow-controlled independently of the others.' },
      { t: 'Recover per stream', d: 'Loss delays the stream data carried in the missing packet, while unaffected streams can keep progressing; loss detection and congestion control live in QUIC itself.' },
      { t: 'Migrate seamlessly', d: 'A Connection ID lets the session follow the client across a new IP — no reconnect, no dropped download.' },
    ],
    beats: {
      kicker: 'Where it beats TCP + TLS',
      items: [
        { t: 'No TCP-wide HOL', d: 'independent stream delivery' },
        { t: 'Faster setup', d: '1-RTT, or 0-RTT resume' },
        { t: 'Migration', d: 'survives an IP change' },
        { t: 'Encrypted transport', d: 'even headers are protected' },
        { t: 'Evolves fast', d: 'user space, not the kernel' },
        { t: 'Less ossified', d: 'middleboxes can’t meddle' },
      ],
    },
    security: {
      lede: [
        'Encrypting the transport itself is ',
        { a: 'a privacy win' },
        ' — but it also ',
        { b: 'blinds the middleboxes' },
        ' that used to inspect traffic, moving the security battle to the endpoints.',
      ],
      points: [
        { t: 'Encrypted by default', d: 'Nearly everything but a little routing metadata is protected — no passive on-path snooping.' },
        { t: 'Harder to inspect', d: 'Firewalls and IDS that parsed TCP now see opaque UDP — visibility must move onto the host.' },
        { t: '0-RTT replay', d: 'Early data can be replayed by an attacker, so it must be restricted to safe, idempotent requests.' },
        { t: 'UDP flood & amplification', d: 'A Retry token forces address validation before the server commits work to a new client.' },
        { t: 'UDP sometimes blocked', d: 'Networks that throttle UDP 443 force a fall back to TCP — clients keep a TLS/TCP path ready.' },
        { t: 'Patch in user space', d: 'Living in the app means fixes ship on the release cadence, not a slow OS kernel update.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'QUIC', on: true }, { t: 'HTTP/3' }],
    ridesNote:
      'UDP is only the envelope — QUIC adds the reliability, ordering, encryption and multiplexing on top.',
    aside: {
      kind: 'pair',
      title: 'Features & setup',
      tables: [
        {
          head: 'Built in',
          rows: [
            { k: 'Streams', v: 'many', ink: 'a' },
            { k: 'TLS 1.3', v: 'always', ink: 'a' },
            { k: 'Conn ID', v: 'migrate', ink: 'a' },
            { k: 'Congestion', v: 'its own', ink: 'a' },
          ],
        },
        {
          head: 'Connect cost',
          rows: [
            { k: 'New', v: '1-RTT' },
            { k: 'Resumed', v: '0-RTT' },
            { k: 'TCP+TLS', v: '2–3 RTT' },
            { k: 'Port', v: '443/udp' },
          ],
        },
      ],
    },
    footnote:
      'Reliability without TCP’s connection-wide head-of-line blocking — the reason HTTP/3 chose QUIC.',
  },

  ethernet: {
    crumb: 'The Link',
    kicker: 'Layer 2 · The Link · the frame everything rides in',
    title: 'Ethernet',
    sub: 'IEEE 802.3',
    lede: [
      'Ethernet is ',
      { i: 'the wire’s own language.' },
      ' It ',
      { a: 'wraps data in a frame addressed by MAC' },
      ', ',
      { a: 'signals it onto copper, fibre or the air' },
      ', and ',
      { b: 'lets each station keep only what is addressed to it' },
      ' — the link layer almost every network begins at.',
    ],
    takeaway: [
      'Ethernet ',
      { a: 'frames data and addresses it by MAC' },
      ' — ',
      { b: 'the local delivery every higher layer is carried by.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 2', note: 'Data Link' },
      { k: 'Address', v: '48-bit MAC', note: 'burned in' },
      { k: 'Payload', v: '1500 bytes', note: 'the standard MTU' },
      { k: 'Speeds', v: '10 M – 800 G', note: 'one frame throughout' },
    ],
    diagram: {
      caption: 'A MAC address, and the frame it addresses',
      anatomy: {
        specimen: { a: '1c:6f:65', sep: ':', b: 'aa:bb:cc' },
        halves: [
          { kicker: 'First 24 bits', t: 'OUI', d: 'which vendor made the card' },
          { kicker: 'Last 24 bits', t: 'Device ID', d: 'which card that vendor made' },
        ],
        note: [
          'Six bytes, written in hex. All ones — ',
          { m: 'ff:ff:ff:ff:ff:ff' },
          ' — is the broadcast address every station accepts.',
        ],
      },
      header: {
        label: 'Every frame on the wire looks like this',
        rows: [
          [
            { t: 'Preamble + SFD', w: 130, small: true, faint: true },
            { t: 'Destination MAC', hi: true },
            { t: 'Source MAC', hi: true },
          ],
          [
            { t: 'EtherType / Length', w: 170, small: true, alt: true },
            { t: 'Payload — 46 to 1500 bytes' },
          ],
          [{ t: 'Frame Check Sequence (CRC-32)', faint: true, small: true }],
        ],
        note: [
          'The ',
          { b: 'EtherType' },
          ' says what is inside — 0x0800 for IPv4, 0x0806 for ARP, 0x86DD for IPv6 — which is how one wire carries every protocol above it.',
        ],
      },
    },
    steps: [
      { t: 'Frame the data', d: 'The NIC prepends destination and source MAC addresses and an EtherType saying what the payload is.' },
      { t: 'Signal it out', d: 'The frame becomes voltage, light or radio on the medium, preceded by a preamble that syncs the receiver’s clock.' },
      { t: 'Every station reads the header', d: 'Each NIC checks the destination MAC and keeps only frames for its own address, or for a broadcast or subscribed multicast.' },
      { t: 'Check and hand up', d: 'The CRC at the tail catches corruption; a good frame is stripped and its payload passed up by EtherType.' },
    ],
    beats: {
      kicker: 'The same frame, many media',
      items: [
        { t: 'Twisted pair', d: '1000BASE-T over Cat5e/6' },
        { t: 'Fibre', d: '10G and up, over distance' },
        { t: 'PoE', d: 'power on the same pairs' },
      ],
    },
    security: {
      lede: [
        'Ethernet has ',
        { a: 'no authentication and no encryption' },
        ' — anything on the segment can be read, and a MAC address ',
        { b: 'proves nothing about who sent a frame.' },
      ],
      points: [
        { t: 'Sniffing', d: 'A NIC in promiscuous mode on a shared or mirrored port reads every frame that passes.' },
        { t: 'MAC spoofing', d: 'The source address is written by software, so it can be set to anything at all.' },
        { t: 'CAM table flooding', d: 'Flooding a switch with fake MACs can force it to broadcast, turning it back into a hub.' },
        { t: '802.1X', d: 'Port-based access control authenticates the device before it may send a single frame.' },
        { t: 'MACsec', d: '802.1AE encrypts frames hop by hop, closing the gap that plain Ethernet leaves open.' },
        { t: 'Physical access is access', d: 'A live port in a lobby is a live port on the LAN — disable what isn’t in use.' },
      ],
    },
    rides: [{ t: 'The medium' }, { t: 'Ethernet', on: true }, { t: 'IP, ARP, …' }],
    ridesNote:
      'Nothing carries Ethernet — it is the bottom of the stack the software can see, sitting straight on the physical layer.',
    aside: {
      kind: 'pair',
      title: 'Frame & EtherTypes',
      tables: [
        {
          head: 'Frame fields',
          rows: [
            { k: 'Dest MAC', v: '6 bytes', ink: 'a' },
            { k: 'Src MAC', v: '6 bytes', ink: 'a' },
            { k: 'EtherType', v: '2 bytes', ink: 'a' },
            { k: 'FCS', v: '4 bytes', ink: 'a' },
          ],
        },
        {
          head: 'Common types',
          rows: [
            { k: '0x0800', v: 'IPv4' },
            { k: '0x0806', v: 'ARP' },
            { k: '0x86DD', v: 'IPv6' },
            { k: '0x8100', v: '802.1Q' },
          ],
        },
      ],
    },
    footnote:
      'The frame has barely changed since 1980 — only the speed of the wire under it has.',
  },

  '802-1q': {
    crumb: 'The Link',
    kicker: 'Layer 2 · The Link · many networks on one wire',
    title: '802.1Q',
    sub: 'VLAN tagging',
    lede: [
      '802.1Q is ',
      { i: 'a label that keeps networks apart.' },
      ' It ',
      { a: 'inserts a four-byte tag into the Ethernet frame' },
      ', ',
      { a: 'naming which VLAN the frame belongs to' },
      ', so ',
      { b: 'one physical link can carry many isolated networks' },
      ' without their traffic ever mixing.',
    ],
    takeaway: [
      '802.1Q ',
      { a: 'tags a frame with its VLAN' },
      ' — so one cable carries many networks that ',
      { b: 'still cannot see each other.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 2', note: 'inside the frame' },
      { k: 'Tag size', v: '4 bytes', note: 'after the source MAC' },
      { k: 'VLAN IDs', v: '1 – 4094', note: '12 bits' },
      { k: 'Carried on', v: 'Trunk ports', note: 'access ports are untagged' },
    ],
    diagram: {
      caption: 'The tag slipped into an ordinary frame',
      header: {
        label: 'Four bytes, inserted after the source address',
        rows: [
          [{ t: 'Destination MAC' }, { t: 'Source MAC' }],
          [
            { t: 'TPID 0x8100', w: 120, small: true, hi: true },
            { t: 'PCP', w: 52, small: true, alt: true },
            { t: 'DEI', w: 52, small: true, faint: true },
            { t: 'VLAN ID (12 bits)', hi: true, small: true },
          ],
          [{ t: 'EtherType' }, { t: 'Payload' }],
        ],
        note: [
          'A switch reads the ',
          { a: 'VLAN ID' },
          ' and will only forward the frame out of ports that belong to that VLAN. The ',
          { b: 'PCP' },
          ' field carries priority, which is how voice traffic gets ahead of a file copy.',
        ],
      },
    },
    steps: [
      { t: 'Assign the port', d: 'An access port is configured for one VLAN; anything arriving on it belongs to that network.' },
      { t: 'Tag on the trunk', d: 'When the frame leaves for another switch, the switch inserts the 802.1Q tag naming its VLAN.' },
      { t: 'Forward within the VLAN', d: 'The receiving switch reads the tag and considers only the ports in that VLAN — the rest never see it.' },
      { t: 'Strip on the way out', d: 'Delivering to an access port, the tag is removed again; the host never knows it was there.' },
    ],
    beats: {
      kicker: 'Terms worth knowing',
      items: [
        { t: 'Access port', d: 'one VLAN, untagged' },
        { t: 'Trunk port', d: 'many VLANs, tagged' },
        { t: 'Native VLAN', d: 'the untagged one on a trunk' },
      ],
    },
    security: {
      lede: [
        'VLANs are ',
        { a: 'the standard way to segment a LAN' },
        ' — but the separation is a switch configuration, and ',
        { b: 'a misconfigured trunk undoes all of it.' },
      ],
      points: [
        { t: 'VLAN hopping', d: 'Double-tagging exploits the native VLAN to send a frame into a VLAN the attacker isn’t in.' },
        { t: 'Switch spoofing', d: 'A host that negotiates a trunk gets every VLAN at once — disable dynamic trunking on access ports.' },
        { t: 'Prune the trunk', d: 'Allow only the VLANs a link actually needs, rather than all 4094 by default.' },
        { t: 'Unused native VLAN', d: 'Give the native VLAN an ID that carries nothing, so a stray untagged frame lands nowhere.' },
        { t: 'Not a firewall', d: 'VLANs separate broadcast domains; what may cross between them is an ACL’s job.' },
        { t: 'Segmentation pays', d: 'Guests, cameras and payment systems on their own VLANs shrink what one breach reaches.' },
      ],
    },
    rides: [{ t: 'Ethernet' }, { t: '802.1Q', on: true }, { t: 'IP, …' }],
    ridesNote:
      'It isn’t carried by Ethernet so much as it is part of it — the tag lives inside the frame header itself.',
    aside: {
      kind: 'pair',
      title: 'The tag & the ranges',
      tables: [
        {
          head: 'Tag fields',
          rows: [
            { k: 'TPID', v: '0x8100', ink: 'a' },
            { k: 'PCP', v: 'priority', ink: 'a' },
            { k: 'DEI', v: 'drop hint', ink: 'a' },
            { k: 'VID', v: 'the VLAN', ink: 'a' },
          ],
        },
        {
          head: 'VLAN IDs',
          rows: [
            { k: '0', v: 'priority only' },
            { k: '1', v: 'default' },
            { k: '2 – 4094', v: 'usable' },
            { k: '4095', v: 'reserved' },
          ],
        },
      ],
    },
    footnote:
      'Q-in-Q stacks a second tag, which is how a carrier carries a customer’s VLANs inside its own.',
  },

  ppp: {
    crumb: 'The Link',
    kicker: 'Layer 2 · The Link · a link between exactly two',
    title: 'PPP',
    sub: 'Point-to-Point Protocol',
    lede: [
      'PPP is ',
      { i: 'the handshake for a link with only two ends.' },
      ' Where Ethernet addresses many stations on a shared medium, PPP ',
      { a: 'frames traffic over a single dedicated link' },
      ', ',
      { a: 'negotiates the options both sides will use' },
      ', and ',
      { b: 'authenticates the far end before any data flows.' },
    ],
    takeaway: [
      'PPP ',
      { a: 'brings up a two-ended link and agrees its terms' },
      ' — ',
      { b: 'framing, authentication and addressing in one negotiation.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 2', note: 'Data Link' },
      { k: 'Topology', v: 'Point-to-point', note: 'no addresses needed' },
      { k: 'Negotiates', v: 'LCP + NCP', note: 'link, then network' },
      { k: 'Seen as', v: 'PPPoE', note: 'DSL and fibre' },
    ],
    diagram: {
      caption: 'Bringing the link up, one phase at a time',
      exchange: {
        lanes: { left: 'Your end', right: 'The far end' },
        messages: [
          {
            label: '1 · LCP — agree how to talk',
            dir: 'right',
            card: {
              quote: 'Configure-Request → Configure-Ack',
              gloss: ['Maximum frame size, authentication method, compression, keepalives'],
            },
          },
          {
            label: '2 · Authenticate — prove who you are',
            dir: 'left',
            card: {
              quote: 'CHAP challenge → response → success',
              gloss: ['A hashed challenge, so the password never crosses the link'],
            },
          },
          {
            label: '3 · NCP — configure the network layer',
            dir: 'right',
            card: {
              tone: 'plain',
              quote: 'IPCP assigns an IP address — the link is now open for traffic',
            },
          },
        ],
        note: [
          'Nothing is assumed: ',
          { a: 'every option is negotiated' },
          ', identity is checked, and only then does IP get an address. A ',
          { b: 'Terminate' },
          ' request or a missed keepalive brings the whole link back down.',
        ],
      },
    },
    steps: [
      { t: 'Establish with LCP', d: 'The Link Control Protocol negotiates frame size, authentication and keepalives until both ends agree.' },
      { t: 'Authenticate', d: 'CHAP challenges the far end with a nonce it must hash with the shared secret; PAP sends a password and is obsolete.' },
      { t: 'Configure with NCP', d: 'A network control protocol — IPCP for IPv4 — assigns addresses and options for each protocol to be carried.' },
      { t: 'Carry, then tear down', d: 'Frames flow until either side sends a terminate request or the echo keepalives stop being answered.' },
    ],
    beats: {
      kicker: 'Where you still meet it',
      items: [
        { t: 'PPPoE', d: 'PPP inside Ethernet, for DSL and fibre' },
        { t: 'PPTP / L2TP', d: 'PPP tunnelled for older VPNs' },
        { t: 'Serial & console', d: 'the original leased-line use' },
      ],
    },
    security: {
      lede: [
        'PPP was the first link layer to ',
        { a: 'authenticate before carrying traffic' },
        ' — but the mechanisms it shipped with are ',
        { b: 'old, and some are broken outright.' },
      ],
      points: [
        { t: 'Never PAP', d: 'PAP sends the password in the clear over the link; CHAP or EAP is the minimum.' },
        { t: 'CHAP is only a hash', d: 'It resists replay but not an offline crack of a weak secret — length still matters.' },
        { t: 'MS-CHAPv2 is broken', d: 'Its strength reduces to a single DES key; treat any tunnel relying on it as plaintext.' },
        { t: 'No confidentiality', d: 'PPP authenticates the link but doesn’t encrypt it — wrap it in IPsec or use a modern VPN.' },
        { t: 'PPPoE on shared media', d: 'A rogue concentrator on the segment can answer discovery and become the far end.' },
        { t: 'Credential reuse', d: 'ISP PPPoE credentials sit in router config in plain text more often than anyone would like.' },
      ],
    },
    rides: [{ t: 'The link' }, { t: 'PPP', on: true }, { t: 'IP, IPv6, …' }],
    ridesNote:
      'On DSL and fibre it is PPPoE — the same negotiation, carried inside Ethernet frames to reach the ISP.',
    aside: {
      kind: 'pair',
      title: 'Phases & auth',
      tables: [
        {
          head: 'Phases',
          rows: [
            { k: 'LCP', v: 'link options', ink: 'a' },
            { k: 'Auth', v: 'identity', ink: 'a' },
            { k: 'NCP', v: 'addresses', ink: 'a' },
            { k: 'Terminate', v: 'shut down', ink: 'a' },
          ],
        },
        {
          head: 'Auth methods',
          rows: [
            { k: 'EAP', v: 'preferred' },
            { k: 'CHAP', v: 'challenge' },
            { k: 'MS-CHAPv2', v: 'broken' },
            { k: 'PAP', v: 'plaintext' },
          ],
        },
      ],
    },
    footnote:
      'A link with two ends needs no MAC addresses — which is why PPP’s header is so much smaller than Ethernet’s.',
  },

  icmpv6: {
    crumb: 'The Internet Layer',
    kicker: 'Layer 3 · The Internet Layer · errors, discovery and autoconfiguration',
    title: 'ICMPv6',
    sub: 'Control Messages for IPv6',
    lede: [
      'ICMPv6 does ',
      { i: 'far more than its IPv4 namesake.' },
      ' It carries the ',
      { a: 'errors and diagnostics you expect' },
      ', but it also absorbed ',
      { a: 'ARP, router discovery and multicast membership' },
      ' — so on IPv6 a host ',
      { b: 'cannot function without it at all.' },
    ],
    takeaway: [
      'ICMPv6 is IPv6’s ',
      { a: 'nervous system' },
      ' — errors, neighbour discovery and autoconfiguration ',
      { b: 'all ride on it.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3', note: 'beside IPv6 itself' },
      { k: 'Port', v: 'None', note: 'IPv6 next header 58' },
      { k: 'Replaces', v: 'ARP + more', note: 'NDP, RS/RA, MLD' },
      { k: 'Blockable?', v: 'No', note: 'IPv6 breaks without it' },
    ],
    diagram: {
      caption: 'A host joining an IPv6 network, entirely over ICMPv6',
      exchange: {
        lanes: { left: 'New host', right: 'Router & neighbours' },
        messages: [
          {
            label: 'Router Solicitation (type 133)',
            dir: 'right',
            card: {
              tone: 'b',
              quote: 'Router Advertisement (type 134) comes back',
              gloss: ['“The prefix here is 2001:db8:1::/64, and I am your default router”'],
            },
          },
          {
            label: 'Build an address, then check nobody has it',
            dir: 'right',
            card: {
              quote: 'Neighbour Solicitation for its own new address',
              gloss: ['Duplicate Address Detection — silence means the address is free'],
            },
          },
          {
            label: 'Resolve a neighbour’s MAC — ARP’s job, done here',
            dir: 'both',
            card: {
              tone: 'plain',
              quote: 'Neighbour Solicitation → Neighbour Advertisement (types 135 / 136)',
            },
          },
        ],
        note: [
          'No DHCP, no ARP, no broadcast: a host ',
          { a: 'learns the prefix from the router' },
          ', builds its own address, and resolves neighbours over ',
          { b: 'multicast ICMPv6' },
          ' — which is why filtering it blindly breaks IPv6 entirely.',
        ],
      },
    },
    steps: [
      { t: 'Find the routers', d: 'A Router Solicitation asks who routes here; the Router Advertisement answers with the prefix and options.' },
      { t: 'Autoconfigure an address', d: 'The host builds an address from the advertised /64 and its own interface identifier — SLAAC.' },
      { t: 'Check for duplicates', d: 'Duplicate Address Detection solicits its own candidate address; no answer means it is safe to use.' },
      { t: 'Resolve and report', d: 'Neighbour Solicitation/Advertisement replace ARP, and error types report unreachable, too big and time exceeded.' },
    ],
    beats: {
      kicker: 'Message types worth knowing',
      items: [
        { t: '1 / 3 / 4', d: 'Unreachable, Time Exceeded, Param Problem' },
        { t: '2', d: 'Packet Too Big — PMTUD lives here' },
        { t: '128 / 129', d: 'Echo Request / Reply (ping6)' },
        { t: '133 / 134', d: 'Router Solicitation / Advertisement' },
        { t: '135 / 136', d: 'Neighbour Solicitation / Advertisement' },
        { t: '130 – 132', d: 'Multicast Listener Discovery' },
      ],
    },
    security: {
      lede: [
        'Because ICMPv6 carries ',
        { a: 'configuration as well as diagnostics' },
        ', spoofing it is far more powerful than spoofing ICMP was — and ',
        { b: 'blocking it outright breaks the network.' },
      ],
      points: [
        { t: 'Rogue RAs', d: 'A forged Router Advertisement makes an attacker the default router for the whole segment.' },
        { t: 'RA Guard', d: 'Switches drop advertisements arriving on ports where no router should be — the core defence.' },
        { t: 'NDP spoofing', d: 'Neighbour Advertisements are as forgeable as ARP replies; SEND and ND inspection help.' },
        { t: 'Don’t filter type 2', d: 'Dropping Packet Too Big silently breaks Path MTU Discovery and connections hang.' },
        { t: 'DAD denial of service', d: 'Answering every duplicate check stops any host on the link from claiming an address.' },
        { t: 'Filter selectively', d: 'Permit types 1–4, 128/129 and the link-local NDP set; drop the rest at the border.' },
      ],
    },
    rides: [{ t: 'Ethernet' }, { t: 'IPv6' }, { t: 'ICMPv6', on: true }],
    ridesNote:
      'Carried directly in IPv6 as next header 58 — and the protocol IPv6 itself depends on to work at all.',
    aside: {
      kind: 'compare',
      title: 'IPv4 or IPv6 control?',
      cols: ['ICMP', 'ICMPv6'],
      rows: [
        { k: 'Errors', a: 'Yes', b: 'Yes' },
        { k: 'Address resolution', a: 'ARP does it', b: 'NDP, built in' },
        { k: 'Router discovery', a: 'DHCP', b: 'RS / RA' },
        { k: 'Safe to block', a: 'Mostly not', b: 'Never' },
      ],
    },
    footnote:
      'On IPv4 you may filter ICMP and get away with it; on IPv6 that is the same as unplugging the cable.',
  },

  nat: {
    crumb: 'The Internet Layer',
    kicker: 'Layer 3 · The Internet Layer · many hosts, one address',
    title: 'NAT',
    sub: 'Network Address Translation',
    lede: [
      'NAT is ',
      { i: 'the reason your whole house shares one address.' },
      ' At the edge of a network it ',
      { a: 'rewrites the source address and port of every outgoing packet' },
      ', ',
      { a: 'remembers the mapping it made' },
      ', and ',
      { b: 'reverses it on the way back' },
      ' — an ingenious workaround for IPv4 running out of addresses.',
    ],
    takeaway: [
      'NAT ',
      { a: 'rewrites addresses at the border' },
      ' so many private hosts share one public IP — and ',
      { b: 'the mapping table is what makes replies find their way home.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3 / 4', note: 'address and port' },
      { k: 'Common form', v: 'PAT', note: 'many → one, by port' },
      { k: 'Keeps', v: 'State', note: 'a translation table' },
      { k: 'On IPv6', v: 'Not needed', note: 'addresses aren’t scarce' },
    ],
    diagram: {
      caption: 'One public address, shared by rewriting ports',
      header: {
        label: 'The translation table, entry by entry',
        rows: [
          [
            { t: 'Inside (private)', hi: true },
            { t: 'Outside (public)', alt: true },
          ],
          [{ t: '10.0.0.9 : 51000' }, { t: '203.0.113.7 : 40001' }],
          [{ t: '10.0.0.12 : 52000' }, { t: '203.0.113.7 : 40002' }],
          [{ t: '10.0.0.9 : 51001' }, { t: '203.0.113.7 : 40003' }],
        ],
        note: [
          'Two hosts may pick the same source port, so NAT gives each flow ',
          { a: 'its own public port' },
          '. A reply to 40002 can therefore only belong to one conversation — and ',
          { b: 'an unsolicited packet matches nothing and is dropped.' },
        ],
      },
    },
    steps: [
      { t: 'Packet leaves', d: 'A host sends out a packet with a private source address that is not routable on the internet.' },
      { t: 'Rewrite and record', d: 'The gateway swaps in its public address and a free port, and stores the pair in its table.' },
      { t: 'Reply comes back', d: 'The return packet is addressed to that public port; the gateway looks the port up in the table.' },
      { t: 'Restore and deliver', d: 'It writes the original private address and port back in and forwards the packet to the right host.' },
    ],
    beats: {
      kicker: 'Kinds of translation',
      items: [
        { t: 'Static NAT', d: 'one private ↔ one public' },
        { t: 'Dynamic NAT', d: 'a pool, first come first served' },
        { t: 'PAT / overload', d: 'many behind one, by port' },
        { t: 'Port forwarding', d: 'a hole punched inward' },
        { t: 'Hairpin NAT', d: 'inside reaching its own public IP' },
        { t: 'CGNAT', d: 'the ISP NATs you too' },
      ],
    },
    security: {
      lede: [
        'NAT ',
        { a: 'hides internal hosts as a side effect' },
        ' — genuinely useful — but it is ',
        { b: 'an addressing trick, not a security policy.' },
      ],
      points: [
        { t: 'Not a firewall', d: 'It drops unsolicited inbound because nothing matches, not because a rule said to. Add real filtering.' },
        { t: 'Port forwarding', d: 'Every forwarded port is a deliberate route straight to an internal host — audit them.' },
        { t: 'UPnP opens holes', d: 'Software on the LAN can ask the router to forward ports with no one approving it.' },
        { t: 'State exhaustion', d: 'The translation table is finite; a flood of flows fills it and new connections fail.' },
        { t: 'Attribution is hard', d: 'Behind CGNAT thousands share one address, so logs need the port and the timestamp too.' },
        { t: 'Breaks end-to-end', d: 'Protocols that carry addresses inside the payload — SIP, FTP — need helpers or they fail.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'NAT', on: true }, { t: 'TCP / UDP' }],
    ridesNote:
      'NAT isn’t a protocol on the wire at all — it is a rewrite performed on packets as they cross the border.',
    aside: {
      kind: 'pair',
      title: 'Private ranges & state',
      tables: [
        {
          head: 'Private IPv4',
          rows: [
            { k: '10/8', v: 'large', ink: 'a' },
            { k: '172.16/12', v: 'medium', ink: 'a' },
            { k: '192.168/16', v: 'home', ink: 'a' },
            { k: '100.64/10', v: 'CGNAT' },
          ],
        },
        {
          head: 'What it tracks',
          rows: [
            { k: 'Src IP:port', v: 'inside' },
            { k: 'Pub IP:port', v: 'outside' },
            { k: 'Protocol', v: 'TCP/UDP' },
            { k: 'Timeout', v: 'idle age-out' },
          ],
        },
      ],
    },
    footnote:
      'NAT bought IPv4 an extra twenty years — and is the single biggest thing IPv6 was designed to make unnecessary.',
  },

  ospf: {
    crumb: 'Routing',
    kicker: 'Layer 3 control · Routing · everyone draws the same map',
    title: 'OSPF',
    sub: 'Open Shortest Path First',
    lede: [
      'OSPF is ',
      { i: 'how routers inside one organisation agree on the shape of it.' },
      ' Every router ',
      { a: 'floods a description of its own links to all the others' },
      ', so each ',
      { a: 'builds an identical map of the network' },
      ' and then ',
      { b: 'runs Dijkstra on it to find the shortest path to everywhere.' },
    ],
    takeaway: [
      'OSPF gives every router ',
      { a: 'the same map of the network' },
      ' — then each ',
      { b: 'computes its own shortest paths from it.' },
    ],
    points: [
      { k: 'Kind', v: 'Link-state', note: 'a map, not rumours' },
      { k: 'Protocol', v: 'IP 89', note: 'straight on IP' },
      { k: 'Scope', v: 'Within an AS', note: 'an interior gateway protocol' },
      { k: 'Metric', v: 'Cost', note: 'from bandwidth' },
    ],
    diagram: {
      caption: 'Flood the links, build the map, run the algorithm',
      exchange: {
        lanes: { left: 'This router', right: 'Every other router in the area' },
        messages: [
          {
            label: '1 · Hello — find the neighbours',
            dir: 'both',
            card: {
              tone: 'plain',
              quote: 'Multicast to 224.0.0.5 until both sides list each other — adjacency formed',
            },
          },
          {
            label: '2 · Flood link-state advertisements',
            dir: 'right',
            card: {
              quote: '“I connect to A at cost 10, and to B at cost 100”',
              gloss: ['Every LSA is passed on unchanged, so all routers receive all of them'],
            },
          },
          {
            label: '3 · Everyone holds the same database',
            dir: 'left',
            card: {
              tone: 'b',
              quote: 'The link-state database is identical on every router in the area',
              gloss: ['Run Dijkstra over it and the shortest path to each prefix falls out'],
            },
          },
        ],
        note: [
          'Because the map is shared rather than summarised, OSPF ',
          { a: 'converges fast and cannot form the loops distance-vector protocols can' },
          '. A link failure ',
          { b: 'floods one small update' },
          ' and everyone recomputes.',
        ],
      },
    },
    steps: [
      { t: 'Meet the neighbours', d: 'Hello packets on each interface find adjacent routers and keep the adjacency alive.' },
      { t: 'Describe your links', d: 'Each router originates LSAs listing its interfaces, their neighbours and the cost of each.' },
      { t: 'Flood and synchronise', d: 'LSAs are reflooded until every router in the area holds an identical link-state database.' },
      { t: 'Run shortest path first', d: 'Each router runs Dijkstra over that database to build its own routing table — cheapest total cost wins.' },
    ],
    beats: {
      kicker: 'Structure and terms',
      items: [
        { t: 'Area 0', d: 'the backbone every area attaches to' },
        { t: 'ABR', d: 'a router between two areas' },
        { t: 'DR / BDR', d: 'elected, to stop full-mesh flooding' },
        { t: 'Cost', d: 'reference bandwidth ÷ link speed' },
        { t: 'LSA types', d: 'router, network, summary, external' },
        { t: 'OSPFv3', d: 'the same idea, for IPv6' },
      ],
    },
    security: {
      lede: [
        'A routing protocol decides ',
        { a: 'where every packet goes' },
        ', so a router that is allowed to speak OSPF and shouldn’t be can ',
        { b: 'pull traffic wherever it likes.' },
      ],
      points: [
        { t: 'Authenticate adjacencies', d: 'Without it, any host that sends Hellos becomes a neighbour — use HMAC-SHA, not the old MD5.' },
        { t: 'Passive interfaces', d: 'Turn OSPF off on ports facing users; only router-to-router links should carry it.' },
        { t: 'False LSAs', d: 'A rogue router advertising an attractive cost draws traffic through itself.' },
        { t: 'Database overload', d: 'Flooding excessive LSAs exhausts memory and CPU on every router in the area.' },
        { t: 'Filter redistribution', d: 'Routes pulled in from BGP or elsewhere should be filtered, or a mistake propagates everywhere.' },
        { t: 'It carries no encryption', d: 'The topology of your whole network is on the wire in the clear; segment where that matters.' },
      ],
    },
    rides: [{ t: 'Ethernet' }, { t: 'IP' }, { t: 'OSPF', on: true }],
    ridesNote:
      'Carried straight in IP as protocol 89, with its own reliable flooding — it does not use TCP the way BGP does.',
    aside: {
      kind: 'compare',
      title: 'OSPF or BGP?',
      cols: ['BGP', 'OSPF'],
      rows: [
        { k: 'Between', a: 'Organisations', b: 'Inside one' },
        { k: 'Kind', a: 'Path-vector', b: 'Link-state' },
        { k: 'Chooses by', a: 'Policy', b: 'Lowest cost' },
        { k: 'Converges', a: 'Slowly', b: 'In seconds' },
      ],
    },
    footnote:
      'Every router holding the same map is what makes OSPF fast — and what makes a forged advertisement so effective.',
  },

  rip: {
    crumb: 'Routing',
    kicker: 'Layer 3 control · Routing · the oldest way to share a route',
    title: 'RIP',
    sub: 'Routing Information Protocol',
    lede: [
      'RIP is ',
      { i: 'routing by rumour.' },
      ' Each router simply ',
      { a: 'tells its neighbours the list of networks it can reach and how many hops away they are' },
      ', and they ',
      { a: 'pass it on with one added to each count' },
      '. It is ',
      { b: 'simple to the point of being fragile' },
      ' — and largely of historical interest now.',
    ],
    takeaway: [
      'RIP shares ',
      { a: 'a list of destinations and hop counts' },
      ' with its neighbours — ',
      { b: 'easy to run, slow to converge, and capped at 15 hops.' },
    ],
    points: [
      { k: 'Kind', v: 'Distance-vector', note: 'rumours, not a map' },
      { k: 'Port', v: 'UDP 520', note: '521 for RIPng' },
      { k: 'Metric', v: 'Hop count', note: '16 means unreachable' },
      { k: 'Status', v: 'Legacy', note: 'OSPF replaced it' },
    ],
    diagram: {
      caption: 'A route learned second-hand, one hop at a time',
      relay: {
        stops: [
          { t: 'Router A', sub: 'owns\n10.1.0.0/16', chip: 'hops: 0', on: true },
          { t: 'Router B', sub: 'hears it\nfrom A', chip: 'hops: 1' },
          { t: 'Router C', sub: 'hears it\nfrom B', chip: 'hops: 2', end: true },
        ],
        legs: ['every 30 s', 'every 30 s'],
      },
      facets: [
        { t: 'Announce the table', d: 'Every 30 seconds a router broadcasts its whole routing table to its neighbours.' },
        { t: 'Add a hop', d: 'A neighbour that accepts a route adds one to the count and advertises it onward.' },
        { t: 'Prefer fewer hops', d: 'The lowest hop count wins — regardless of whether that link is fast or slow.' },
      ],
      note: [
        'No router ever sees the topology — only ',
        { a: 'what its neighbours claim' },
        '. That is why a failure takes minutes to propagate, and why ',
        { b: 'a hop count of 16 has to mean “unreachable”' },
        ' to stop a count-to-infinity loop.',
      ],
    },
    steps: [
      { t: 'Advertise the whole table', d: 'Every thirty seconds a router sends its full list of known networks and their hop counts.' },
      { t: 'Learn and increment', d: 'A neighbour records any better route it hears, adding one hop, and points at the sender as next hop.' },
      { t: 'Age out what stops arriving', d: 'A route not refreshed within 180 seconds is marked unreachable, then removed.' },
      { t: 'Fight the loops', d: 'Split horizon, poison reverse and hold-down timers exist purely to stop bad news circulating forever.' },
    ],
    beats: {
      kicker: 'Its three versions',
      items: [
        { t: 'RIPv1', d: 'classful, broadcast, no masks' },
        { t: 'RIPv2', d: 'classless, multicast, auth' },
        { t: 'RIPng', d: 'the IPv6 version, UDP 521' },
      ],
    },
    security: {
      lede: [
        'RIP believes whatever a neighbour says and, in its first version, ',
        { a: 'had no authentication at all' },
        ' — so on any reachable segment it is ',
        { b: 'trivially poisoned.' },
      ],
      points: [
        { t: 'Route injection', d: 'An unauthenticated update advertising a low hop count pulls traffic to the attacker.' },
        { t: 'RIPv2 authentication', d: 'It supports a shared key — plain text in the original spec, and MD5 at best.' },
        { t: 'Broadcast exposure', d: 'RIPv1 broadcasts the entire routing table to the segment, mapping the network for anyone listening.' },
        { t: 'Slow convergence', d: 'Minutes of stale routing after a failure is a denial of service in its own right.' },
        { t: 'Use passive interfaces', d: 'Never send updates out of a port that faces users or servers.' },
        { t: 'Prefer OSPF', d: 'On any modern network the honest security advice is to not run RIP at all.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'RIP', on: true }],
    ridesNote:
      'Unusually for a routing protocol it rides on UDP 520 — cheap to send, with no reliability underneath it.',
    aside: {
      kind: 'pair',
      title: 'Timers & limits',
      tables: [
        {
          head: 'Timers',
          rows: [
            { k: 'Update', v: '30 s', ink: 'a' },
            { k: 'Invalid', v: '180 s', ink: 'a' },
            { k: 'Hold-down', v: '180 s', ink: 'a' },
            { k: 'Flush', v: '240 s', ink: 'a' },
          ],
        },
        {
          head: 'Limits',
          rows: [
            { k: 'Max hops', v: '15' },
            { k: 'Infinity', v: '16' },
            { k: 'Metric', v: 'hops only' },
            { k: 'Scale', v: 'small nets' },
          ],
        },
      ],
    },
    footnote:
      'Fifteen hops was generous in 1988 — today it is the clearest sign RIP has been outgrown.',
  },

  'is-is': {
    crumb: 'Routing',
    kicker: 'Layer 3 control · Routing · the carrier’s link-state protocol',
    title: 'IS-IS',
    sub: 'Intermediate System to Intermediate System',
    lede: [
      'IS-IS is ',
      { i: 'OSPF’s quieter, tougher cousin.' },
      ' It is a link-state protocol that ',
      { a: 'floods link descriptions until every router shares one map' },
      ', but it ',
      { a: 'runs directly on the link rather than over IP' },
      ' — which is exactly why ',
      { b: 'large carriers and datacentre fabrics prefer it.' },
    ],
    takeaway: [
      'IS-IS builds ',
      { a: 'the same shared map as OSPF' },
      ', but travels below IP — ',
      { b: 'so the routing protocol cannot be attacked through the network it routes.' },
    ],
    points: [
      { k: 'Kind', v: 'Link-state', note: 'like OSPF' },
      { k: 'Runs on', v: 'Layer 2', note: 'CLNS, not IP' },
      { k: 'Levels', v: 'L1 / L2', note: 'area and backbone' },
      { k: 'Found in', v: 'Carriers', note: 'and large fabrics' },
    ],
    diagram: {
      caption: 'Two levels: inside an area, and between them',
      layers: {
        items: [
          {
            head: 'Level 1 — inside an area',
            tone: 'a',
            lines: [
              ['Routers flood LSPs describing their own links to every other router in the same area.'],
              [
                'Each builds an identical database and runs SPF over it — ',
                { s: 'exactly as OSPF does' },
                ', with different names.',
              ],
            ],
          },
          {
            head: 'Level 2 — the backbone between areas',
            tone: 'b',
            lines: [
              ['L2 routers form their own contiguous backbone and carry routes between areas.'],
              ['A router can be L1, L2, or both at once — the boundary sits on the router, not on the link.'],
            ],
          },
          {
            head: 'Carried in TLVs — which is why it aged so well',
            tone: 'plain',
            lines: [
              [
                'Everything IS-IS advertises is a type-length-value, so IPv6, segment routing and traffic engineering were all added ',
                { s: 'without a new protocol version.' },
              ],
            ],
          },
        ],
      },
      note: [
        'Running on the link rather than on IP means an IS-IS adjacency ',
        { a: 'cannot be reached from the routed network at all' },
        ' — and the same protocol instance carries ',
        { b: 'IPv4 and IPv6 together' },
        ', where OSPF needs two.',
      ],
    },
    steps: [
      { t: 'Form adjacencies', d: 'Hello PDUs on each link find neighbours and agree the level — L1 within an area, L2 across the backbone.' },
      { t: 'Flood link-state PDUs', d: 'Each router originates an LSP describing its links and metrics; LSPs are reflooded until all agree.' },
      { t: 'Synchronise the database', d: 'CSNPs and PSNPs let neighbours compare summaries and request only what they are missing.' },
      { t: 'Compute shortest paths', d: 'SPF runs over the identical database on each router to produce its forwarding table.' },
    ],
    beats: {
      kicker: 'Why carriers pick it',
      items: [
        { t: 'Below IP', d: 'unreachable from the data plane' },
        { t: 'One instance', d: 'IPv4 and IPv6 together' },
        { t: 'TLV extensibility', d: 'new features, same version' },
        { t: 'Flat scaling', d: 'huge single areas in practice' },
        { t: 'Segment routing', d: 'added as TLVs, cleanly' },
        { t: 'Fast flooding', d: 'tuned for very large fabrics' },
      ],
    },
    security: {
      lede: [
        'Sitting below IP gives IS-IS ',
        { a: 'a genuinely smaller attack surface' },
        ' than OSPF — but an attacker with ',
        { b: 'access to the link itself is still an adjacency away.' },
      ],
      points: [
        { t: 'Not IP-reachable', d: 'You cannot send an IS-IS packet from across the internet; you have to be on the link.' },
        { t: 'Authenticate anyway', d: 'HMAC-SHA on hellos and LSPs stops a device plugged into the fabric from becoming a neighbour.' },
        { t: 'LSP flooding attacks', d: 'A malicious router can churn LSPs and force constant SPF runs across the whole area.' },
        { t: 'Metric manipulation', d: 'Advertising an attractive metric draws traffic through a router that shouldn’t carry it.' },
        { t: 'Guard the console', d: 'Because the control plane isn’t on IP, physical and management access is the real boundary.' },
        { t: 'No confidentiality', d: 'The topology is readable to anyone on the link — MACsec is what encrypts it.' },
      ],
    },
    ridesTitle: 'Sits beside the stack',
    ridesJoin: '↔',
    rides: [{ t: 'Ethernet' }, { t: 'IS-IS', on: true }, { t: 'routes IP' }],
    ridesNote:
      'It routes IP without being carried by it — the protocol travels in its own layer-2 frames, as CLNS always did.',
    aside: {
      kind: 'compare',
      title: 'IS-IS or OSPF?',
      cols: ['OSPF', 'IS-IS'],
      rows: [
        { k: 'Carried on', a: 'IP protocol 89', b: 'The link itself' },
        { k: 'IPv6', a: 'A second instance', b: 'Same instance' },
        { k: 'Extending it', a: 'New LSA types', b: 'New TLVs' },
        { k: 'Typical home', a: 'Enterprise', b: 'Carrier, fabric' },
      ],
    },
    footnote:
      'Designed for a protocol suite that lost to TCP/IP — and it outlived the suite by routing IP instead.',
  },

  sctp: {
    crumb: 'Transport',
    kicker: 'Layer 4 · Transport · reliable messages, several streams',
    title: 'SCTP',
    sub: 'Stream Control Transmission Protocol',
    lede: [
      'SCTP is ',
      { i: 'what you would design if you started transport again.' },
      ' It keeps TCP’s reliability but ',
      { a: 'delivers whole messages rather than a byte stream' },
      ', ',
      { a: 'carries many independent streams in one association' },
      ', and ',
      { b: 'can hold that association open across several IP addresses at once.' },
    ],
    takeaway: [
      'SCTP is ',
      { a: 'reliable like TCP, message-based like UDP' },
      ' — with multiple streams and ',
      { b: 'multi-homing built in.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 4', note: 'Transport' },
      { k: 'Protocol', v: 'IP 132', note: 'beside TCP and UDP' },
      { k: 'Unit', v: 'Message', note: 'boundaries preserved' },
      { k: 'Endpoints', v: 'Multi-homed', note: 'several IPs, one association' },
    ],
    diagram: {
      caption: 'One association, several streams, more than one path',
      panels: [
        {
          title: 'TCP — one stream, one path',
          lanes: [{ blocks: ['ok', 'stuck', 'idle', 'idle'] }],
          note: 'A loss blocks the byte stream, and the connection is tied to one address pair.',
        },
        {
          title: 'SCTP — independent streams, spare paths',
          on: true,
          lanes: [
            { label: 'S1', blocks: ['ok', 'ok'] },
            { label: 'S2', blocks: ['stuck', 'idle'] },
            { label: 'S3', blocks: ['ok', 'ok'] },
          ],
          note: 'Only stream 2 waits; and if the primary path dies, the association moves to another address.',
        },
      ],
      facets: [
        { t: '4-way handshake', d: 'A signed cookie in the third message means the server keeps no state until the client proves it is real.' },
        { t: 'Message boundaries', d: 'What you send is what the far end receives — no reassembling a stream into records yourself.' },
        { t: 'Multi-homing', d: 'Both ends list several addresses; heartbeats watch them and failover is automatic.' },
      ],
      note: [
        'The cookie handshake makes SCTP ',
        { a: 'immune to SYN-flood-style state exhaustion' },
        ', and multi-homing gives it ',
        { b: 'failover no other common transport has' },
        ' — which is why telecom signalling runs on it.',
      ],
    },
    steps: [
      { t: 'Associate with a cookie', d: 'INIT, INIT-ACK with a signed cookie, COOKIE-ECHO, COOKIE-ACK — the server allocates nothing until step three.' },
      { t: 'Send messages, not bytes', d: 'Data chunks carry message boundaries and a stream number, so streams are delivered independently.' },
      { t: 'Acknowledge selectively', d: 'SACK reports exactly what arrived; only genuinely missing chunks are retransmitted.' },
      { t: 'Watch every path', d: 'Heartbeats probe the alternate addresses, and traffic moves to a healthy one if the primary fails.' },
    ],
    beats: {
      kicker: 'Where it is actually used',
      items: [
        { t: 'Telecom signalling', d: 'SIGTRAN, and 4G/5G core interfaces' },
        { t: 'WebRTC data channels', d: 'SCTP over DTLS in the browser' },
        { t: 'Rarely on the open net', d: 'middleboxes drop IP protocol 132' },
      ],
    },
    security: {
      lede: [
        'SCTP fixed some of TCP’s weaknesses by design — but being ',
        { a: 'unfamiliar to middleboxes' },
        ' means it is ',
        { b: 'both under-inspected and often simply blocked.' },
      ],
      points: [
        { t: 'No SYN flood', d: 'The cookie handshake means a flood of INITs costs the server no memory at all.' },
        { t: 'Firewall blind spots', d: 'Many firewalls and IDS don’t parse protocol 132, so SCTP traffic passes uninspected.' },
        { t: 'Port scanning', d: 'SCTP INIT scans find open services that a TCP-only scan misses entirely.' },
        { t: 'Multi-homing surprises', d: 'An association can move to an address the firewall policy never anticipated.' },
        { t: 'No encryption', d: 'SCTP is plaintext; DTLS over SCTP is what WebRTC uses to secure it.' },
        { t: 'NAT hostility', d: 'Most NAT gateways cannot translate it, which is much of why it stayed off the public internet.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'SCTP', on: true }, { t: 'signalling, data channels' }],
    ridesNote:
      'A sibling of TCP and UDP rather than a layer on them — IP carries it directly as protocol 132.',
    aside: {
      kind: 'compare',
      title: 'TCP, UDP or SCTP?',
      cols: ['TCP', 'SCTP'],
      rows: [
        { k: 'Delivery', a: 'Byte stream', b: 'Messages' },
        { k: 'Streams', a: 'One', b: 'Many' },
        { k: 'Addresses', a: 'One pair', b: 'Multi-homed' },
        { k: 'Handshake', a: '3-way', b: '4-way, cookie' },
      ],
    },
    footnote:
      'Technically the best of the three transports, and the least deployed — the internet had already set around TCP.',
  },

  mdns: {
    crumb: 'Naming & Config',
    kicker: 'Layer 7 · Naming · DNS with nobody in charge',
    title: 'mDNS',
    sub: 'Multicast DNS',
    lede: [
      'mDNS is ',
      { i: 'name resolution without a name server.' },
      ' A device that wants to find ',
      { m: 'printer.local' },
      ' simply ',
      { a: 'asks the whole local link over multicast' },
      ', and ',
      { a: 'the machine that owns the name answers for itself' },
      ' — ',
      { b: 'which is how a printer or a speaker appears the moment you plug it in.' },
    ],
    takeaway: [
      'mDNS resolves ',
      { a: '.local names by asking the whole segment' },
      ' — ',
      { b: 'no server, no configuration, no administrator.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'DNS message format' },
      { k: 'Port', v: '5353', note: 'UDP, multicast' },
      { k: 'Scope', v: 'Local link', note: 'never routed' },
      { k: 'Domain', v: '.local', note: 'reserved for it' },
    ],
    diagram: {
      caption: 'Asking everyone, and letting the owner answer',
      exchange: {
        lanes: { left: 'Your laptop', right: 'Everything on the segment', rightMuted: true },
        messages: [
          {
            label: 'Query — multicast to 224.0.0.251 : 5353',
            dir: 'right',
            card: {
              quote: '“Who is printer.local?”',
              gloss: ['Every device on the link receives it; all but one stay silent'],
            },
          },
          {
            label: 'Response — also multicast, from the owner',
            dir: 'left',
            card: {
              quote: '“printer.local is 192.168.1.30”',
              gloss: ['Sent to the group, so everyone else can cache it too and save a future query'],
            },
          },
          {
            label: 'Service discovery on top — DNS-SD',
            dir: 'both',
            card: {
              tone: 'plain',
              quote: '“Any _ipp._tcp here?” — browse by service type, not by name',
            },
          },
        ],
        note: [
          'Answers are multicast rather than unicast so that ',
          { a: 'every listener learns from someone else’s question' },
          '. Records carry a TTL and are announced again as they expire — and ',
          { b: 'a departing device sends a goodbye with TTL 0.' },
        ],
      },
    },
    steps: [
      { t: 'Claim a name', d: 'On joining, a device probes for its desired .local name three times; silence means it may take it.' },
      { t: 'Announce it', d: 'It multicasts its records so everyone on the link can cache the name and address together.' },
      { t: 'Answer queries', d: 'When a query for its name arrives on the group address, only the owner responds — to the group.' },
      { t: 'Browse by service', d: 'DNS-SD adds PTR, SRV and TXT records so clients can ask “what printers are here?” rather than for a name.' },
    ],
    beats: {
      kicker: 'The names it goes by',
      items: [
        { t: 'Bonjour', d: 'Apple’s implementation' },
        { t: 'Avahi', d: 'the Linux one' },
        { t: 'DNS-SD', d: 'service discovery on top' },
      ],
    },
    security: {
      lede: [
        'mDNS trusts ',
        { a: 'anyone on the same segment to answer for any name' },
        ' — convenient at home, and ',
        { b: 'a ready-made spoofing and reconnaissance channel anywhere else.' },
      ],
      points: [
        { t: 'Name spoofing', d: 'Nothing stops a host answering for printer.local — the fastest reply wins.' },
        { t: 'Device enumeration', d: 'Listening to the group address alone maps every device, its name and its services.' },
        { t: 'Leaks host names', d: 'Laptops announce names like “anna-macbook” to any network they join, including public Wi-Fi.' },
        { t: 'Reflection attacks', d: 'Exposed 5353 on a WAN interface has been used to amplify DDoS — it should never be reachable.' },
        { t: 'Keep it off guest VLANs', d: 'Blocking multicast between client ports stops discovery being used to browse other tenants.' },
        { t: 'Disable when unused', d: 'On servers and in datacentres there is rarely a reason for it to be running at all.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'mDNS', on: true }],
    ridesNote:
      'The same message format as DNS, sent to a multicast group with a TTL of 1 — it is designed never to leave the link.',
    aside: {
      kind: 'compare',
      title: 'DNS or mDNS?',
      cols: ['DNS', 'mDNS'],
      rows: [
        { k: 'Server', a: 'Required', b: 'None' },
        { k: 'Scope', a: 'Global', b: 'One link' },
        { k: 'Port', a: '53', b: '5353' },
        { k: 'Answers', a: 'The resolver', b: 'The owner itself' },
      ],
    },
    footnote:
      'Zero configuration is the whole point — and the reason it will answer to anyone who asks.',
  },

  'http-2': {
    crumb: 'Web & Transfer',
    kicker: 'Layer 7 · Web · the same HTTP, sent far better',
    title: 'HTTP/2',
    sub: 'HTTP, multiplexed',
    lede: [
      'HTTP/2 changes ',
      { i: 'how HTTP travels, not what it says.' },
      ' The methods, headers and status codes are unchanged, but it ',
      { a: 'carries many requests at once over one TCP connection' },
      ', ',
      { a: 'compresses repeated headers away' },
      ', and ',
      { b: 'is binary rather than text' },
      ' — ending the era of six connections per origin.',
    ],
    takeaway: [
      'HTTP/2 keeps HTTP’s meaning and ',
      { a: 'multiplexes it into one binary connection' },
      ' — ',
      { b: 'many requests in flight, headers compressed.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'over one TCP conn' },
      { k: 'Port', v: '443', note: 'in practice always TLS' },
      { k: 'Framing', v: 'Binary', note: 'streams and frames' },
      { k: 'Headers', v: 'HPACK', note: 'compressed, indexed' },
    ],
    diagram: {
      caption: 'One connection carrying many requests at once',
      panels: [
        {
          title: 'HTTP/1.1 — a queue per connection',
          lanes: [{ blocks: ['ok', 'stuck', 'idle', 'idle'] }],
          note: 'One response at a time; browsers opened six connections just to work around it.',
        },
        {
          title: 'HTTP/2 — interleaved streams',
          on: true,
          lanes: [
            { label: 'S1', blocks: ['ok', 'ok'] },
            { label: 'S3', blocks: ['ok', 'ok'] },
            { label: 'S5', blocks: ['ok', 'ok'] },
          ],
          note: 'Requests and responses interleave as frames on one connection, in any order.',
        },
      ],
      facets: [
        { t: 'Streams', d: 'Each request/response pair is a numbered stream; frames from many streams interleave freely.' },
        { t: 'HPACK', d: 'Headers repeated on every request are sent once and referenced by index afterwards.' },
        { t: 'Priority & flow control', d: 'A client can say which streams matter, and either end can throttle per stream.' },
      ],
      note: [
        'The gain is real but it stops at the transport: because everything shares ',
        { a: 'one TCP connection' },
        ', a single lost packet still stalls every stream underneath it — ',
        { b: 'the head-of-line blocking QUIC was built to remove.' },
      ],
    },
    steps: [
      { t: 'Negotiate at the handshake', d: 'ALPN inside the TLS handshake agrees “h2” before any request is sent — no extra round trip.' },
      { t: 'Open streams', d: 'Each request takes a new odd-numbered stream ID; many can be open on the connection at once.' },
      { t: 'Send binary frames', d: 'HEADERS and DATA frames from different streams interleave, so nothing waits its turn.' },
      { t: 'Reassemble per stream', d: 'The far end sorts frames by stream ID back into the requests and responses HTTP has always had.' },
    ],
    beats: {
      kicker: 'What changed, what didn’t',
      items: [
        { t: 'Same semantics', d: 'methods, headers, status codes' },
        { t: 'New framing', d: 'binary, not text' },
        { t: 'One connection', d: 'not six per origin' },
        { t: 'HPACK', d: 'header compression' },
        { t: 'Server push', d: 'added, then abandoned' },
        { t: 'Still TCP', d: 'so still head-of-line blocked' },
      ],
    },
    security: {
      lede: [
        'Everything true of HTTP is still true here — plus ',
        { a: 'new state to exhaust' },
        ': streams, header tables and priority trees are ',
        { b: 'all things a client can abuse cheaply.' },
      ],
      points: [
        { t: 'Rapid Reset', d: 'CVE-2023-44487: open and cancel streams endlessly to make a server do unbounded work.' },
        { t: 'Cap concurrent streams', d: 'SETTINGS_MAX_CONCURRENT_STREAMS is the throttle that keeps one client from taking the server.' },
        { t: 'HPACK bombs', d: 'A crafted header table can expand into far more memory than the bytes sent suggest.' },
        { t: 'Request smuggling', d: 'Downgrading h2 to HTTP/1.1 at a proxy re-introduces boundary disagreements.' },
        { t: 'TLS is effectively required', d: 'Browsers only speak h2 over TLS, so the transport is encrypted by default.' },
        { t: 'Inspection is harder', d: 'Binary framing means tooling that grepped HTTP text no longer sees anything useful.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'TLS' }, { t: 'HTTP/2', on: true }],
    ridesNote:
      'ALPN in the TLS handshake is how client and server agree on h2 before the first request is written.',
    aside: {
      kind: 'compare',
      title: 'HTTP/1.1 or HTTP/2?',
      cols: ['HTTP/1.1', 'HTTP/2'],
      rows: [
        { k: 'Format', a: 'Text', b: 'Binary frames' },
        { k: 'Concurrency', a: '6 connections', b: 'One, multiplexed' },
        { k: 'Headers', a: 'Repeated', b: 'HPACK indexed' },
        { k: 'HOL blocking', a: 'Per connection', b: 'Still, at TCP' },
      ],
    },
    footnote:
      'HTTP/2 fixed HTTP’s concurrency and left TCP’s — which is precisely the gap HTTP/3 closes.',
  },

  'http-3': {
    crumb: 'Web & Transfer',
    kicker: 'Layer 7 · Web · HTTP with TCP taken out from under it',
    title: 'HTTP/3',
    sub: 'HTTP over QUIC',
    lede: [
      'HTTP/3 is ',
      { i: 'HTTP/2’s multiplexing, finally done properly.' },
      ' It keeps the same semantics and streams but ',
      { a: 'runs on QUIC over UDP instead of TCP' },
      ', so ',
      { a: 'loss on one stream does not stall every other stream' },
      ' and ',
      { b: 'the connection survives a change of network entirely.' },
    ],
    takeaway: [
      'HTTP/3 moves HTTP onto QUIC — ',
      { a: 'no TCP connection-wide head-of-line blocking' },
      ', a faster handshake, and ',
      { b: 'a session that follows you between networks.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'over QUIC' },
      { k: 'Port', v: '443/udp', note: 'not TCP' },
      { k: 'Encryption', v: 'Always', note: 'TLS 1.3 inside QUIC' },
      { k: 'Standardised', v: '2022', note: 'RFC 9114' },
    ],
    diagram: {
      caption: 'The same request, one layer lower down',
      panels: [
        {
          title: 'HTTP/2 over TCP',
          lanes: [
            { label: 'S1', blocks: ['ok', 'idle'] },
            { label: 'S3', blocks: ['stuck', 'idle'] },
            { label: 'S5', blocks: ['ok', 'idle'] },
          ],
          note: 'Streams are independent to HTTP — but TCP below delivers in order, so one loss stalls all of them.',
        },
        {
          title: 'HTTP/3 over QUIC',
          on: true,
          lanes: [
            { label: 'S1', blocks: ['ok', 'ok'] },
            { label: 'S3', blocks: ['stuck', 'idle'] },
            { label: 'S5', blocks: ['ok', 'ok'] },
          ],
          note: 'QUIC knows about streams, so unaffected streams keep moving while missing stream data is recovered.',
        },
      ],
      facets: [
        { t: 'QPACK', d: 'Header compression rebuilt for QUIC streams; a stream can still wait for referenced table updates, but not for unrelated packet delivery.' },
        { t: 'Alt-Svc', d: 'A server advertises h3 over its HTTP/2 response; the browser upgrades on the next visit.' },
        { t: 'Connection migration', d: 'Wi-Fi to cellular keeps the same connection ID — the download doesn’t restart.' },
      ],
      note: [
        'The application layer barely changed: ',
        { a: 'the same methods, headers and status codes' },
        ' ride on a transport that finally matches how the web actually behaves — and ',
        { b: 'clients keep a TCP path ready in case UDP 443 is blocked.' },
      ],
    },
    steps: [
      { t: 'Discover the upgrade', d: 'An Alt-Svc header or an HTTPS DNS record tells the client that h3 is available on UDP 443.' },
      { t: 'Open a QUIC connection', d: 'One round trip sets up transport and TLS 1.3 together — or zero, resuming a previous session.' },
      { t: 'Request on a stream', d: 'Each request takes its own QUIC stream, headers compressed with QPACK.' },
      { t: 'Recover independently', d: 'Missing data is recovered without stalling unaffected streams, and the connection can survive an IP change.' },
    ],
    beats: {
      kicker: 'What it inherits from QUIC',
      items: [
        { t: 'Per-stream loss', d: 'no cross-stream stalling' },
        { t: '0-RTT resume', d: 'data in the first packet' },
        { t: 'Connection IDs', d: 'migration between networks' },
        { t: 'Encrypted transport', d: 'headers protected too' },
        { t: 'User-space', d: 'shipped by the browser' },
        { t: 'UDP fallback', d: 'TCP path kept in reserve' },
      ],
    },
    security: {
      lede: [
        'HTTP/3 is ',
        { a: 'encrypted end to end by construction' },
        ' — good for users, and a real change for anyone who relied on ',
        { b: 'reading HTTP off the wire to defend a network.' },
      ],
      points: [
        { t: 'Content is protected', d: 'HTTP content and most QUIC fields are encrypted; IP addresses, UDP ports, packet sizes and timing remain observable.' },
        { t: 'Middleboxes go blind', d: 'Appliances that parsed HTTP now see opaque UDP — inspection has to move to the endpoints.' },
        { t: '0-RTT replay', d: 'Early data can be replayed, so only idempotent requests belong in it.' },
        { t: 'Amplification limits', d: 'A server may not send much more than it received until the client’s address is validated.' },
        { t: 'UDP filtering', d: 'Networks that block UDP 443 silently push everyone back to HTTP/2 — watch for the fallback.' },
        { t: 'Same app-layer risks', d: 'XSS, CSRF and injection are untouched by any of this; they live above the transport.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'QUIC' }, { t: 'HTTP/3', on: true }],
    ridesNote:
      'TLS is not a separate layer here — QUIC has it built in, so there is no “HTTP/3 without encryption”.',
    aside: {
      kind: 'compare',
      title: 'HTTP/2 or HTTP/3?',
      cols: ['HTTP/2', 'HTTP/3'],
      rows: [
        { k: 'Transport', a: 'TCP', b: 'QUIC / UDP' },
        { k: 'HOL blocking', a: 'Across streams at TCP', b: 'Limited to affected stream data' },
        { k: 'Handshake', a: '2–3 RTT', b: '1-RTT or 0' },
        { k: 'Headers', a: 'HPACK', b: 'QPACK' },
      ],
    },
    footnote:
      'Thirty years on, the web finally stopped assuming its transport had to be a single ordered stream.',
  },

  ftp: {
    crumb: 'Web & Transfer',
    kicker: 'Layer 7 · Transfer · two connections, and a lot of history',
    title: 'FTP',
    sub: 'File Transfer Protocol',
    lede: [
      'FTP is ',
      { i: 'older than almost everything else here.' },
      ' Unusually, it ',
      { a: 'uses one connection for commands and a second for each file' },
      ', ',
      { a: 'sends its commands as readable text' },
      ' — and ',
      { b: 'sends the password that way too' },
      ', which is why it has been steadily replaced.',
    ],
    takeaway: [
      'FTP splits ',
      { a: 'commands and data onto separate connections' },
      ' — an elegant idea in 1971 that is now ',
      { b: 'a firewall headache and a plaintext password.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'a text command dialog' },
      { k: 'Ports', v: '21 · 20', note: 'control · data' },
      { k: 'Connections', v: 'Two', note: 'active or passive' },
      { k: 'Status', v: 'Superseded', note: 'use SFTP or FTPS' },
    ],
    diagram: {
      caption: 'One channel to talk, another to carry the file',
      exchange: {
        lanes: { left: 'Client', right: 'Server' },
        messages: [
          {
            label: 'Control connection — port 21, stays open',
            dir: 'right',
            card: {
              quote: 'USER anna → PASS … → 230 Logged on',
              gloss: ['Every command and its reply travel here, in readable text'],
            },
          },
          {
            label: 'PASV — “where should I connect for the data?”',
            dir: 'left',
            card: {
              quote: '227 Entering Passive Mode (203,0,113,7,195,80)',
              gloss: ['The server names a second port; the client opens the data connection to it'],
            },
          },
          {
            label: 'Data connection — the file itself, then closed',
            dir: 'both',
            card: {
              tone: 'plain',
              quote: 'RETR report.pdf → the bytes flow on the second connection → 226 Transfer complete',
            },
          },
        ],
        note: [
          'In ',
          { a: 'passive mode' },
          ' the client opens both connections, which is what lets FTP work from behind NAT. In the older ',
          { b: 'active mode' },
          ' the server connects back to the client — and almost every firewall now refuses that.',
        ],
      },
    },
    steps: [
      { t: 'Open the control channel', d: 'The client connects to port 21 and logs in with USER and PASS — in clear text unless FTPS is in use.' },
      { t: 'Agree a data channel', d: 'PASV (or the old PORT) settles which side opens the second connection and on which port.' },
      { t: 'Transfer the file', d: 'RETR, STOR or LIST runs over the fresh data connection, which closes when the transfer ends.' },
      { t: 'Repeat or quit', d: 'The control connection stays open for the next command; QUIT ends the session.' },
    ],
    beats: {
      kicker: 'The variants',
      items: [
        { t: 'FTPS', d: 'FTP wrapped in TLS' },
        { t: 'SFTP', d: 'unrelated — file transfer over SSH' },
        { t: 'Anonymous FTP', d: 'the old public archive' },
      ],
    },
    security: {
      lede: [
        'FTP was designed for a network where ',
        { a: 'nobody was listening' },
        '. Credentials and data both cross ',
        { b: 'in the clear, and the second connection defeats simple firewalling.' },
      ],
      points: [
        { t: 'Plaintext credentials', d: 'USER and PASS are readable to anyone on the path — this alone disqualifies it.' },
        { t: 'Plaintext data', d: 'The file itself is unencrypted, so confidentiality and integrity are both absent.' },
        { t: 'Firewall complexity', d: 'The dynamic second port needs a protocol helper to inspect the control channel and open it.' },
        { t: 'Bounce attacks', d: 'The old PORT command could make a server open connections to a third party — port scanning by proxy.' },
        { t: 'Anonymous write', d: 'Writable anonymous servers became distribution points for whatever anyone uploaded.' },
        { t: 'Use SFTP or FTPS', d: 'Either encrypts credentials and content; SFTP also needs only one port.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'FTP', on: true }],
    ridesNote:
      'Two TCP connections rather than one — the control channel persists while data channels come and go.',
    aside: {
      kind: 'pair',
      title: 'Commands & modes',
      tables: [
        {
          head: 'Commands',
          rows: [
            { k: 'USER / PASS', v: 'log in', ink: 'a' },
            { k: 'PASV', v: 'passive mode', ink: 'a' },
            { k: 'RETR / STOR', v: 'get / put', ink: 'a' },
            { k: 'LIST', v: 'directory', ink: 'a' },
          ],
        },
        {
          head: 'Modes',
          rows: [
            { k: 'Passive', v: 'client opens both' },
            { k: 'Active', v: 'server calls back' },
            { k: 'ASCII', v: 'line endings fixed' },
            { k: 'Binary', v: 'bytes as-is' },
          ],
        },
      ],
    },
    footnote:
      'Still running on more servers than anyone would like — usually because something old depends on it.',
  },

  sftp: {
    crumb: 'Web & Transfer',
    kicker: 'Layer 7 · Transfer · file transfer inside an SSH session',
    title: 'SFTP',
    sub: 'SSH File Transfer Protocol',
    lede: [
      'SFTP is ',
      { i: 'not FTP with encryption bolted on' },
      ' — it is a different protocol entirely, ',
      { a: 'run as a subsystem inside an ordinary SSH connection' },
      '. That gives it ',
      { a: 'SSH’s authentication and encryption for free' },
      ', over ',
      { b: 'a single port that a firewall already understands.' },
    ],
    takeaway: [
      'SFTP is ',
      { a: 'a file protocol carried inside SSH' },
      ' — one port, one authentication, ',
      { b: 'encrypted from the first byte.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'an SSH subsystem' },
      { k: 'Port', v: '22', note: 'the SSH port, only' },
      { k: 'Encryption', v: 'Inherited', note: 'from SSH' },
      { k: 'Relation to FTP', v: 'None', note: 'despite the name' },
    ],
    diagram: {
      caption: 'A file channel opened inside an existing SSH connection',
      layers: {
        items: [
          {
            head: '1 · SSH does the hard part',
            tone: 'a',
            lines: [
              ['Key exchange, host-key verification and user authentication all happen first, exactly as for a shell.'],
              ['By the time SFTP starts, the channel is already encrypted and both ends are identified.'],
            ],
          },
          {
            head: '2 · Open the sftp subsystem',
            tone: 'b',
            lines: [
              [
                'The client requests a channel of type ',
                { m: 'subsystem' },
                ' named sftp; the server starts its file-transfer server on it.',
              ],
            ],
          },
          {
            head: '3 · Packet-based file operations',
            tone: 'plain',
            lines: [
              [
                'OPEN, READ, WRITE, STAT, RENAME, REMOVE — structured requests with a request id, not a text dialog. Resuming a transfer is just a READ at an offset.',
              ],
            ],
          },
        ],
      },
      note: [
        'Because it is a channel, SFTP ',
        { a: 'multiplexes alongside a shell on the same connection' },
        ' — and because SSH already authenticated, there is ',
        { b: 'no second login and no second port to open.' },
      ],
    },
    steps: [
      { t: 'Connect over SSH', d: 'The usual SSH handshake runs: key exchange, host key check, then user authentication by key or password.' },
      { t: 'Request the subsystem', d: 'The client opens a channel and asks for the sftp subsystem rather than a shell.' },
      { t: 'Exchange versioned packets', d: 'Both sides agree a protocol version, then work in binary request/response packets carrying a request id.' },
      { t: 'Operate on files', d: 'Handles are opened, read and written at explicit offsets — which is what makes resume and random access work.' },
    ],
    beats: {
      kicker: 'Three things often confused',
      items: [
        { t: 'SFTP', d: 'a subsystem of SSH — this page' },
        { t: 'FTPS', d: 'the old FTP, wrapped in TLS' },
        { t: 'SCP', d: 'an older SSH copy, now deprecated' },
      ],
    },
    security: {
      lede: [
        'SFTP inherits ',
        { a: 'everything SSH gets right' },
        ' — so its risks are mostly about ',
        { b: 'what a legitimate account is allowed to reach once it is in.' },
      ],
      points: [
        { t: 'Encrypted by default', d: 'There is no unencrypted mode; confidentiality and integrity come from the SSH transport.' },
        { t: 'Key-based access', d: 'Authorised keys work here as for a shell — and are equally easy to leave behind.' },
        { t: 'Chroot the users', d: 'Without a restricted directory an SFTP account can read wherever the OS permissions allow.' },
        { t: 'Disable the shell', d: 'An account meant only for files should not also grant an interactive login.' },
        { t: 'Host-key checking', d: 'The same first-connect fingerprint prompt is what stops a man-in-the-middle — don’t train users past it.' },
        { t: 'One port to guard', d: 'Everything is on 22, which makes the firewall simple and the brute-force target obvious.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'SSH' }, { t: 'SFTP', on: true }],
    ridesNote:
      'It is a channel inside SSH, not a protocol beside it — which is why it needs no port or credentials of its own.',
    aside: {
      kind: 'compare',
      title: 'FTP or SFTP?',
      cols: ['FTP', 'SFTP'],
      rows: [
        { k: 'Ports', a: '21 + a data port', b: '22 only' },
        { k: 'Credentials', a: 'Plaintext', b: 'Encrypted' },
        { k: 'Data', a: 'Plaintext', b: 'Encrypted' },
        { k: 'Firewalls', a: 'Needs a helper', b: 'One rule' },
      ],
    },
    footnote:
      'The name is the only thing it shares with FTP — everything under it is SSH.',
  },

  grpc: {
    crumb: 'Web & Transfer',
    kicker: 'Layer 7 · Web · calling a function on another machine',
    title: 'gRPC',
    sub: 'Remote Procedure Call over HTTP/2',
    lede: [
      'gRPC makes a network call ',
      { i: 'look like calling a function.' },
      ' A ',
      { m: '.proto' },
      ' file ',
      { a: 'defines the methods and message types' },
      ', code is generated for both sides, and the call ',
      { a: 'travels as a compact binary message over HTTP/2' },
      ' — with ',
      { b: 'streaming in either or both directions.' },
    ],
    takeaway: [
      'gRPC turns a contract into ',
      { a: 'generated client and server code' },
      ', carried as ',
      { b: 'binary messages over HTTP/2 streams.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'on HTTP/2' },
      { k: 'Port', v: '443', note: 'usually, over TLS' },
      { k: 'Encoding', v: 'Protobuf', note: 'binary, schema-first' },
      { k: 'Calls', v: '4 kinds', note: 'unary and streaming' },
    ],
    diagram: {
      caption: 'A contract, generated code, and one HTTP/2 stream per call',
      exchange: {
        lanes: { left: 'Client stub', right: 'Server implementation' },
        messages: [
          {
            label: 'The contract both sides are generated from',
            dir: 'both',
            card: {
              tone: 'quiet',
              rows: [
                { k: 'service Atlas', v: 'the interface', ink: 'a' },
                { k: 'rpc GetProtocol', v: 'the method', ink: 'a' },
                { k: 'message Request', v: 'typed fields', ink: 'a' },
                { k: 'message Reply', v: 'typed fields', ink: 'a' },
              ],
            },
          },
          {
            label: 'Call — a POST to /Atlas/GetProtocol on a new stream',
            dir: 'right',
            card: {
              quote: 'HEADERS + a length-prefixed protobuf message',
              gloss: ['The stub serialises the request; the wire carries bytes, not JSON'],
            },
          },
          {
            label: 'Response — message, then a trailing status',
            dir: 'left',
            card: {
              quote: 'The reply message, then grpc-status: 0',
              gloss: ['Errors are a status code in the trailers, not an HTTP status'],
            },
          },
        ],
        note: [
          'Because each call is ',
          { a: 'its own HTTP/2 stream' },
          ', a single connection carries many calls at once — and a method declared ',
          { b: 'streaming keeps its stream open' },
          ' to send a sequence of messages rather than one.',
        ],
      },
    },
    steps: [
      { t: 'Write the contract', d: 'A .proto file declares the service, its methods and every message type, with numbered fields.' },
      { t: 'Generate both sides', d: 'protoc produces a typed client stub and a server interface in whatever languages are involved.' },
      { t: 'Call over a stream', d: 'The stub serialises the message and sends it as an HTTP/2 POST on a fresh stream.' },
      { t: 'Return status in trailers', d: 'The reply comes back on the same stream, followed by a grpc-status trailer saying whether it worked.' },
    ],
    beats: {
      kicker: 'The four call types',
      items: [
        { t: 'Unary', d: 'one request, one reply' },
        { t: 'Server streaming', d: 'one request, many replies' },
        { t: 'Client streaming', d: 'many requests, one reply' },
        { t: 'Bidirectional', d: 'both, at once' },
        { t: 'Deadlines', d: 'every call carries a timeout' },
        { t: 'gRPC-Web', d: 'a proxy for browsers' },
      ],
    },
    security: {
      lede: [
        'gRPC gets ',
        { a: 'TLS and a typed schema for free' },
        ', which removes whole classes of bug — but its ',
        { b: 'binary framing hides it from most inspection tooling.' },
      ],
      points: [
        { t: 'TLS by default', d: 'Channel credentials are the normal path; insecure channels are a deliberate opt-out.' },
        { t: 'Schema is not authorisation', d: 'Types validate shape, not permission — check who may call each method.' },
        { t: 'Set deadlines', d: 'A call without a deadline can pin server resources indefinitely; propagate them across hops.' },
        { t: 'Message size limits', d: 'The default cap exists for a reason — raising it invites memory exhaustion.' },
        { t: 'Reflection in production', d: 'Server reflection lets anyone enumerate every method you expose; disable it outside development.' },
        { t: 'Opaque to WAFs', d: 'Protobuf over HTTP/2 is unreadable to appliances expecting JSON — put checks in the service.' },
      ],
    },
    rides: [{ t: 'TCP' }, { t: 'TLS' }, { t: 'HTTP/2' }, { t: 'gRPC', on: true }],
    ridesNote:
      'It is not a new transport — gRPC is a convention for using HTTP/2 streams, which is why proxies can route it.',
    aside: {
      kind: 'compare',
      title: 'REST or gRPC?',
      cols: ['REST / JSON', 'gRPC'],
      rows: [
        { k: 'Contract', a: 'Documented', b: 'Generated' },
        { k: 'Payload', a: 'Text JSON', b: 'Binary protobuf' },
        { k: 'Streaming', a: 'Awkward', b: 'First class' },
        { k: 'Readable on wire', a: 'Yes', b: 'No' },
      ],
    },
    footnote:
      'The schema is the API — change a field number and both sides stop understanding each other.',
  },

  imap: {
    crumb: 'Mail',
    kicker: 'Layer 7 · Mail · the mailbox stays on the server',
    title: 'IMAP',
    sub: 'Internet Message Access Protocol',
    lede: [
      'IMAP is ',
      { i: 'how you read mail that never leaves the server.' },
      ' Rather than downloading a message and owning it, a client ',
      { a: 'browses folders and fetches only the parts it needs' },
      ', and ',
      { a: 'every flag and folder change is stored centrally' },
      ' — so ',
      { b: 'phone, laptop and webmail all show the same mailbox.' },
    ],
    takeaway: [
      'IMAP keeps the mailbox ',
      { a: 'on the server and synchronises state' },
      ' — which is why ',
      { b: 'reading a message on your phone marks it read everywhere.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'a text command dialog' },
      { k: 'Ports', v: '993 · 143', note: 'TLS · STARTTLS' },
      { k: 'Model', v: 'Server-side', note: 'folders and flags' },
      { k: 'Fetches', v: 'Selectively', note: 'headers, or one part' },
    ],
    diagram: {
      caption: 'Browsing a mailbox you never actually download',
      exchange: {
        lanes: { left: 'Mail client', right: 'IMAP server' },
        messages: [
          {
            label: 'Log in and pick a folder',
            dir: 'right',
            card: {
              quote: 'a1 LOGIN anna … → a2 SELECT INBOX',
              gloss: ['The server reports how many messages exist and which are unseen'],
            },
          },
          {
            label: 'Fetch only what is needed to draw the list',
            dir: 'left',
            card: {
              quote: 'a3 FETCH 1:50 (FLAGS ENVELOPE)',
              gloss: ['Subjects, senders and flags — the bodies stay on the server until opened'],
            },
          },
          {
            label: 'State changes are stored centrally',
            dir: 'both',
            card: {
              tone: 'plain',
              quote: 'a4 STORE 7 +FLAGS (\\Seen) — and every other device sees it read',
            },
          },
        ],
        note: [
          'Because the ',
          { a: 'server holds the truth' },
          ', clients are caches rather than owners. ',
          { b: 'IDLE' },
          ' keeps the connection open so the server can push news of a new message instead of being polled.',
        ],
      },
    },
    steps: [
      { t: 'Connect and authenticate', d: 'The client opens a TLS connection to 993 and logs in — or upgrades port 143 with STARTTLS.' },
      { t: 'Select a mailbox', d: 'SELECT or EXAMINE opens a folder and reports its message count, unseen count and validity.' },
      { t: 'Fetch what you need', d: 'Envelopes and flags to draw the list; a single MIME part when the user actually opens something.' },
      { t: 'Change state on the server', d: 'Flags, moves and deletions are STORE and COPY commands — every client sees the same result.' },
    ],
    beats: {
      kicker: 'Things it does that POP3 can’t',
      items: [
        { t: 'Server folders', d: 'a real hierarchy, synced' },
        { t: 'Shared flags', d: 'read state across devices' },
        { t: 'Partial fetch', d: 'one attachment, not the mail' },
        { t: 'Server-side search', d: 'no download to find things' },
        { t: 'IDLE', d: 'push instead of polling' },
        { t: 'Multiple clients', d: 'all consistent at once' },
      ],
    },
    security: {
      lede: [
        'IMAP is ',
        { a: 'a standing door to everything a person has ever written' },
        ' — and because clients stay logged in for months, ',
        { b: 'a stolen credential is rarely noticed quickly.' },
      ],
      points: [
        { t: 'Always implicit TLS', d: 'Port 993 from the start; plain 143 without STARTTLS puts the password on the wire.' },
        { t: 'Legacy auth bypasses MFA', d: 'Basic IMAP login predates it — disable it, or one password is the whole account.' },
        { t: 'App passwords leak', d: 'Long-lived per-client secrets are rarely rotated and often stored in plain text.' },
        { t: 'Silent mailbox rules', d: 'An intruder’s forwarding or auto-delete rule quietly exfiltrates mail for months.' },
        { t: 'Full-history exposure', d: 'Unlike POP3, a compromise reaches the entire archive, not just what is undownloaded.' },
        { t: 'OAuth instead', d: 'Modern clients use a token that can be scoped and revoked without changing the password.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'TLS' }, { t: 'IMAP', on: true }],
    ridesNote:
      'A long-lived TCP session — often held open for hours with IDLE so new mail can be pushed rather than polled.',
    aside: {
      kind: 'compare',
      title: 'IMAP or POP3?',
      cols: ['POP3', 'IMAP'],
      rows: [
        { k: 'Mail lives', a: 'On the device', b: 'On the server' },
        { k: 'Folders', a: 'Inbox only', b: 'Full hierarchy' },
        { k: 'Many devices', a: 'Poorly', b: 'By design' },
        { k: 'Offline', a: 'Naturally', b: 'Needs a cache' },
      ],
    },
    footnote:
      'SMTP delivered it and IMAP shows it to you — two protocols, one mailbox.',
  },

  pop3: {
    crumb: 'Mail',
    kicker: 'Layer 7 · Mail · download it and take it away',
    title: 'POP3',
    sub: 'Post Office Protocol, version 3',
    lede: [
      'POP3 is ',
      { i: 'the simplest possible way to collect mail.' },
      ' A client ',
      { a: 'connects, lists what is waiting, downloads it' },
      ', and ',
      { a: 'classically deletes it from the server' },
      ' — the mailbox is a doormat, and ',
      { b: 'once collected the mail lives on one machine only.' },
    ],
    takeaway: [
      'POP3 ',
      { a: 'downloads mail and hands ownership to the device' },
      ' — simple, offline-friendly, and ',
      { b: 'hopeless once you have more than one device.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'a tiny text dialog' },
      { k: 'Ports', v: '995 · 110', note: 'TLS · STARTTLS' },
      { k: 'Model', v: 'Download', note: 'then usually delete' },
      { k: 'Commands', v: 'About ten', note: 'that is the whole protocol' },
    ],
    diagram: {
      caption: 'Three states, and then it is over',
      layers: {
        lanes: { left: 'Client', right: 'Server' },
        items: [
          {
            head: '1 · Authorisation',
            tone: 'a',
            lines: [
              [{ m: 'USER anna' }, ' then ', { m: 'PASS …' }, ' — or APOP, or SASL over TLS.'],
              ['The mailbox is locked for this session: no other client may collect at the same time.'],
            ],
          },
          {
            head: '2 · Transaction',
            tone: 'b',
            lines: [
              [
                { m: 'STAT' },
                ' — 4 messages, 91 KB. ',
                { m: 'LIST' },
                ' sizes them, ',
                { m: 'RETR n' },
                ' downloads one.',
              ],
              [
                { m: 'DELE n' },
                ' marks a message for deletion — but nothing is actually removed yet.',
              ],
            ],
          },
          {
            head: '3 · Update',
            tone: 'plain',
            lines: [
              [
                { m: 'QUIT' },
                ' commits the deletions and releases the lock. Drop the connection instead and every DELE is forgotten — which is the protocol’s one safety net.',
              ],
            ],
          },
        ],
      },
      note: [
        'There are no folders, no flags and no server-side search: POP3 knows only ',
        { a: 'a numbered list of messages waiting' },
        '. Clients that keep mail on the server use ',
        { b: 'a “leave a copy” option' },
        ' the protocol was never really designed around.',
      ],
    },
    steps: [
      { t: 'Authorise', d: 'The client connects over TLS and logs in; the server locks the mailbox for the duration.' },
      { t: 'List what is waiting', d: 'STAT gives a count and total size; LIST numbers each message and its length.' },
      { t: 'Retrieve and mark', d: 'RETR downloads a message in full — there is no fetching just the headers — and DELE marks it for removal.' },
      { t: 'Quit to commit', d: 'QUIT applies the deletions and unlocks the mailbox; the mail now exists only on that device.' },
    ],
    beats: {
      kicker: 'Where it still fits',
      items: [
        { t: 'One device only', d: 'a single desktop client' },
        { t: 'Poor connectivity', d: 'collect, then work offline' },
        { t: 'Small servers', d: 'nothing to store long-term' },
      ],
    },
    security: {
      lede: [
        'POP3 is old enough that ',
        { a: 'its default was a plaintext password' },
        ' — and its download-and-delete habit means ',
        { b: 'the only copy of your mail may be on a laptop with no backup.' },
      ],
      points: [
        { t: 'Use 995, not 110', d: 'Implicit TLS from the first byte; plain 110 without STARTTLS exposes the password and the mail.' },
        { t: 'Legacy auth', d: 'Like IMAP, basic POP3 login sidesteps modern MFA — disable it where you can.' },
        { t: 'One copy, no backup', d: 'Deleting from the server moves the risk to the endpoint, which is rarely backed up as well.' },
        { t: 'No audit trail', d: 'Mail collected and removed leaves little server-side evidence for an investigation.' },
        { t: 'Mailbox locking', d: 'The exclusive lock means a stuck session can deny the real user access to their mail.' },
        { t: 'Prefer IMAP', d: 'Central storage is easier to secure, back up and monitor than a fleet of laptops.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'TLS' }, { t: 'POP3', on: true }],
    ridesNote:
      'A short TCP session — connect, collect, disconnect — rather than the long-lived connection IMAP keeps open.',
    aside: {
      kind: 'pair',
      title: 'Commands & ports',
      tables: [
        {
          head: 'The whole protocol',
          rows: [
            { k: 'STAT', v: 'count & size', ink: 'a' },
            { k: 'LIST', v: 'message list', ink: 'a' },
            { k: 'RETR', v: 'download', ink: 'a' },
            { k: 'DELE / QUIT', v: 'mark / commit', ink: 'a' },
          ],
        },
        {
          head: 'Ports',
          rows: [
            { k: '995', v: 'implicit TLS' },
            { k: '110', v: 'plain / STARTTLS' },
            { k: 'Lock', v: 'one session' },
            { k: 'State', v: 'none kept' },
          ],
        },
      ],
    },
    footnote:
      'Designed when you had one computer and a dial-up line — and it still behaves exactly as though you do.',
  },

  rtp: {
    crumb: 'Real-time & Media',
    kicker: 'Layer 7 · Media · audio and video, while it is happening',
    title: 'RTP',
    sub: 'Real-time Transport Protocol',
    lede: [
      'RTP carries ',
      { i: 'media that is worth less the later it arrives.' },
      ' It rides on UDP and adds only what live audio and video need: ',
      { a: 'a timestamp so playback can be paced' },
      ', ',
      { a: 'a sequence number so loss and reordering are visible' },
      ', and ',
      { b: 'a payload type saying which codec produced the bytes.' },
    ],
    takeaway: [
      'RTP adds ',
      { a: 'timing and sequence to a UDP stream' },
      ' — enough to play media smoothly, and ',
      { b: 'deliberately not enough to retransmit it.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'on UDP' },
      { k: 'Port', v: 'Negotiated', note: 'even ports, by SIP or SDP' },
      { k: 'Adds', v: 'Timing', note: 'timestamp + sequence' },
      { k: 'Paired with', v: 'RTCP', note: 'the quality reports' },
    ],
    diagram: {
      caption: 'The three fields that make a stream playable',
      header: {
        label: 'The RTP header — twelve bytes in front of the media',
        ruler: ['0', '16 bits', '31'],
        rows: [
          [
            { t: 'V·P·X·CC', w: 96, small: true, faint: true },
            { t: 'M', w: 40, small: true, alt: true },
            { t: 'Payload type', w: 120, small: true, alt: true },
            { t: 'Sequence number', hi: true, small: true },
          ],
          [{ t: 'Timestamp', hi: true }],
          [{ t: 'SSRC — which source this stream is', hi: true }],
          [{ t: 'CSRC list, if a mixer combined several sources', faint: true, small: true }],
        ],
        payload: 'The encoded audio or video frame',
        note: [
          'The ',
          { a: 'sequence number' },
          ' shows what went missing and what arrived out of order; the ',
          { a: 'timestamp' },
          ' says when it should be played, not when it turned up. A jitter buffer uses both to ',
          { b: 'turn a bumpy network into steady playback.' },
        ],
      },
    },
    steps: [
      { t: 'Get a port from signalling', d: 'SIP or WebRTC negotiates the addresses, ports and codecs in SDP before any media flows.' },
      { t: 'Packetise the media', d: 'The encoder’s output is split into packets, each stamped with a sequence number and a media timestamp.' },
      { t: 'Send over UDP', d: 'Packets go out at the media’s own pace — a late packet is worse than a missing one, so nothing is retransmitted.' },
      { t: 'Buffer, reorder, conceal', d: 'The receiver holds a small jitter buffer, reorders by sequence, and conceals whatever never arrived.' },
    ],
    beats: {
      kicker: 'The family around it',
      items: [
        { t: 'RTCP', d: 'loss, jitter and round-trip reports' },
        { t: 'SRTP', d: 'the encrypted profile' },
        { t: 'SDP', d: 'describes what the stream will be' },
        { t: 'SSRC', d: 'identifies each source in a session' },
        { t: 'Jitter buffer', d: 'trades latency for smoothness' },
        { t: 'FEC / NACK', d: 'recovery that beats retransmission' },
      ],
    },
    security: {
      lede: [
        'Plain RTP is ',
        { a: 'an unencrypted, unauthenticated media stream' },
        ' — anyone on the path can ',
        { b: 'record the call, or inject audio into it.' },
      ],
      points: [
        { t: 'Use SRTP', d: 'The secure profile encrypts and authenticates each packet; WebRTC refuses to send anything else.' },
        { t: 'Eavesdropping', d: 'Captured RTP replays as audio with ordinary tools — no cryptanalysis involved.' },
        { t: 'Injection', d: 'Without authentication, a forged packet with a plausible sequence number is simply played.' },
        { t: 'Key exchange matters', d: 'SRTP is only as good as DTLS-SRTP or MIKEY delivering the keys; SDES in clear SDP is not enough.' },
        { t: 'Port range exposure', d: 'Media uses a wide dynamic UDP range — open it narrowly and pin it to the signalling.' },
        { t: 'Amplification risk', d: 'Open relays and turn servers left unauthenticated get used to bounce traffic at someone else.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'RTP', on: true }],
    ridesNote:
      'UDP is chosen deliberately: TCP’s retransmissions would deliver audio that is correct and far too late.',
    aside: {
      kind: 'pair',
      title: 'Header & companions',
      tables: [
        {
          head: 'Key fields',
          rows: [
            { k: 'Sequence', v: 'loss & order', ink: 'a' },
            { k: 'Timestamp', v: 'playback pace', ink: 'a' },
            { k: 'SSRC', v: 'which source', ink: 'a' },
            { k: 'Payload type', v: 'which codec', ink: 'b' },
          ],
        },
        {
          head: 'Alongside',
          rows: [
            { k: 'RTCP', v: 'quality reports' },
            { k: 'SRTP', v: 'encryption' },
            { k: 'SDP', v: 'the offer' },
            { k: 'ICE', v: 'NAT traversal' },
          ],
        },
      ],
    },
    footnote:
      'Real time means on time — which is why RTP would rather drop a packet than wait for it.',
  },

  sip: {
    crumb: 'Real-time & Media',
    kicker: 'Layer 7 · Media · the protocol that rings the phone',
    title: 'SIP',
    sub: 'Session Initiation Protocol',
    lede: [
      'SIP ',
      { i: 'sets up the call and then gets out of the way.' },
      ' It ',
      { a: 'finds the person you are calling wherever they are registered' },
      ', ',
      { a: 'negotiates what media both ends can handle' },
      ', and ',
      { b: 'hands the actual audio and video to RTP' },
      ' — signalling, never the call itself.',
    ],
    takeaway: [
      'SIP ',
      { a: 'locates the callee and negotiates the session' },
      ' — then ',
      { b: 'the media flows directly over RTP, without it.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'HTTP-like text' },
      { k: 'Ports', v: '5060 · 5061', note: 'plain · TLS' },
      { k: 'Carries', v: 'Signalling', note: 'not the media' },
      { k: 'Describes with', v: 'SDP', note: 'codecs and ports' },
    ],
    diagram: {
      caption: 'Ringing, answering, and then getting out of the way',
      exchange: {
        lanes: { left: 'Caller', right: 'Callee' },
        messages: [
          {
            label: 'INVITE — with an SDP offer',
            dir: 'right',
            card: {
              quote: 'INVITE sip:anna@example.com SIP/2.0',
              gloss: ['“I can do Opus and H.264, send media to 203.0.113.7:16384”'],
            },
          },
          {
            label: '180 Ringing, then 200 OK with the answer',
            dir: 'left',
            card: {
              quote: '200 OK — SDP answer',
              gloss: ['“Opus it is; send mine to 198.51.100.4:24000” — the media path is now agreed'],
            },
          },
          {
            label: 'ACK — and the call is up',
            dir: 'both',
            card: {
              tone: 'plain',
              quote: 'RTP flows directly between the endpoints — SIP is silent until BYE',
            },
          },
        ],
        note: [
          'SIP’s job ends once both sides know ',
          { a: 'where to send media and in what codec' },
          '. The audio never touches the signalling path — which is why a call can sound fine while ',
          { b: 'the SIP server is somewhere else entirely.' },
        ],
      },
    },
    steps: [
      { t: 'Register a location', d: 'A phone REGISTERs its current address against its SIP URI, so it can be found later.' },
      { t: 'Invite with an offer', d: 'An INVITE carries an SDP offer listing codecs and the address media should be sent to.' },
      { t: 'Answer and agree', d: 'Provisional responses ring the phone; 200 OK returns the SDP answer choosing from the offer.' },
      { t: 'Talk, then hang up', d: 'RTP flows directly end to end; BYE ends the dialog, and re-INVITE changes it mid-call.' },
    ],
    beats: {
      kicker: 'Methods and pieces',
      items: [
        { t: 'REGISTER', d: 'say where you are' },
        { t: 'INVITE / ACK', d: 'start a session' },
        { t: 'BYE / CANCEL', d: 'end or abandon it' },
        { t: 'Proxy / registrar', d: 'the servers that route it' },
        { t: 'SDP', d: 'the media description' },
        { t: 'ICE / STUN / TURN', d: 'getting through NAT' },
      ],
    },
    security: {
      lede: [
        'SIP is ',
        { a: 'plain text on a well-known port' },
        ' and reaches the phone system, which makes it ',
        { b: 'one of the most relentlessly scanned services on the internet.' },
      ],
      points: [
        { t: 'Toll fraud', d: 'A cracked extension is used to place expensive international calls, often within hours of exposure.' },
        { t: 'Registration hijacking', d: 'A forged REGISTER points someone’s number at the attacker, who then receives their calls.' },
        { t: 'Use SIPS and SRTP', d: 'TLS on 5061 for signalling, SRTP for media — plain SIP reveals who called whom, and when.' },
        { t: 'Scanning and enumeration', d: 'Automated tools sweep 5060 constantly, probing extensions and default passwords.' },
        { t: 'Caller ID is a claim', d: 'The From header is set by the caller — the whole basis of spoofed calls and vishing.' },
        { t: 'Rate-limit and fail2ban', d: 'Lock accounts on repeated failures and never expose a PBX directly to the internet.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP / TCP / TLS' }, { t: 'SIP', on: true }, { t: 'sets up RTP' }],
    ridesNote:
      'Signalling and media take different paths — SIP may cross several proxies while RTP goes straight between the phones.',
    aside: {
      kind: 'pair',
      title: 'Responses & roles',
      tables: [
        {
          head: 'Response classes',
          rows: [
            { k: '1xx', v: 'ringing', ink: 'a' },
            { k: '2xx', v: 'answered', ink: 'a' },
            { k: '3xx', v: 'moved' },
            { k: '4xx – 6xx', v: 'failed' },
          ],
        },
        {
          head: 'Servers',
          rows: [
            { k: 'Registrar', v: 'where you are' },
            { k: 'Proxy', v: 'routes requests' },
            { k: 'Redirect', v: 'points elsewhere' },
            { k: 'B2BUA', v: 'sits in the middle' },
          ],
        },
      ],
    },
    footnote:
      'It looks like HTTP because it was designed to — request lines, headers and status codes, all to set up a call.',
  },

  webrtc: {
    crumb: 'Real-time & Media',
    kicker: 'Layer 7 · Media · a call over a direct or relayed path',
    title: 'WebRTC',
    sub: 'Real-time communication in the browser',
    lede: [
      'WebRTC is ',
      { i: 'a whole calling stack built into the browser.' },
      ' It ',
      { a: 'finds a path between two peers through their NATs' },
      ', ',
      { a: 'encrypts the media without asking' },
      ', and ',
      { b: 'sends audio, video and data directly between them' },
      ' — with no plugin, using a direct path when possible or a TURN relay when necessary.',
    ],
    takeaway: [
      'WebRTC gets two browsers ',
      { a: 'communicating across NAT with ICE' },
      ', with ',
      { b: 'encryption that cannot be turned off.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'a browser API' },
      { k: 'Ports', v: 'Dynamic UDP', note: 'chosen by ICE' },
      { k: 'Encryption', v: 'Mandatory', note: 'DTLS-SRTP' },
      { k: 'Signalling', v: 'Yours', note: 'the spec leaves it out' },
    ],
    diagram: {
      caption: 'Two peers, three problems: find, agree, secure',
      layers: {
        items: [
          {
            head: '1 · Signalling — the part you build yourself',
            tone: 'a',
            lines: [
              [
                'The spec deliberately omits it: use WebSocket, HTTP, SIP, anything. It carries the ',
                { s: 'SDP offer and answer' },
                ' between the two peers.',
              ],
            ],
          },
          {
            head: '2 · ICE — find a path that actually works',
            tone: 'b',
            lines: [
              [
                { s: 'STUN' },
                ' asks a public server “what does my address look like from outside?” to discover the NAT mapping.',
              ],
              [
                'Candidates are gathered and tested in pairs; if nothing direct works, ',
                { s: 'TURN' },
                ' relays the media as a last resort.',
              ],
            ],
          },
          {
            head: '3 · DTLS-SRTP — secure before a single frame',
            tone: 'plain',
            lines: [
              [
                'A DTLS handshake over the chosen path derives the SRTP keys. There is no unencrypted WebRTC — media and data channels are both protected.',
              ],
            ],
          },
        ],
      },
      note: [
        'Once ICE settles, ',
        { a: 'media and data use the selected candidate pair' },
        '. A direct path is preferred, but when connectivity checks cannot establish one, traffic goes through ',
        { b: 'a TURN relay' },
        ' — which costs bandwidth someone has to pay for.',
      ],
    },
    steps: [
      { t: 'Exchange an offer', d: 'One peer creates an SDP offer; your own signalling channel carries it to the other, which answers.' },
      { t: 'Gather candidates', d: 'ICE collects host, STUN-discovered and TURN-relayed addresses and trades them with the peer.' },
      { t: 'Find a working pair', d: 'Candidate pairs are probed until one succeeds — direct if possible, relayed if not.' },
      { t: 'Secure and stream', d: 'DTLS derives SRTP keys over that path; audio, video and data channels then flow between the peers.' },
    ],
    beats: {
      kicker: 'The pieces it is made of',
      items: [
        { t: 'ICE', d: 'the path-finding framework' },
        { t: 'STUN', d: 'discover your public address' },
        { t: 'TURN', d: 'relay when nothing else works' },
        { t: 'SDP', d: 'offer and answer' },
        { t: 'SRTP', d: 'the encrypted media' },
        { t: 'Data channels', d: 'SCTP over DTLS' },
      ],
    },
    security: {
      lede: [
        'WebRTC is ',
        { a: 'encrypted by mandate rather than by option' },
        ' — its real risks are about ',
        { b: 'what a peer-to-peer connection reveals, and what your signalling lets through.' },
      ],
      points: [
        { t: 'IP address leakage', d: 'ICE candidates expose local and public addresses to the peer — the classic “WebRTC leak” past a VPN.' },
        { t: 'Signalling is your problem', d: 'The spec secures the media and leaves authentication of the offer entirely to you.' },
        { t: 'Consent and permissions', d: 'Camera and microphone need explicit user permission, and browsers show an indicator throughout.' },
        { t: 'TURN credentials', d: 'An open relay is bandwidth theft; issue short-lived, per-session credentials.' },
        { t: 'Media is end to end', d: 'A relay forwards packets it cannot read — but an SFU that re-encrypts them can.' },
        { t: 'Fingerprint the DTLS', d: 'The SDP carries a certificate fingerprint; verifying it is what binds the media to the signalling.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'DTLS / SRTP' }, { t: 'WebRTC', on: true }],
    ridesNote:
      'Not one protocol but an assembled stack — ICE to find the path, DTLS to secure it, SRTP and SCTP to fill it.',
    aside: {
      kind: 'pair',
      title: 'Paths & channels',
      tables: [
        {
          head: 'Candidate types',
          rows: [
            { k: 'Host', v: 'a local address', ink: 'a' },
            { k: 'Server reflexive', v: 'via STUN', ink: 'a' },
            { k: 'Relayed', v: 'via TURN', ink: 'b' },
            { k: 'Peer reflexive', v: 'found in probing' },
          ],
        },
        {
          head: 'What flows',
          rows: [
            { k: 'Audio / video', v: 'SRTP' },
            { k: 'Data', v: 'SCTP / DTLS' },
            { k: 'Reports', v: 'RTCP' },
            { k: 'Keys', v: 'DTLS handshake' },
          ],
        },
      ],
    },
    footnote:
      'The browser ships an entire real-time stack — the only part left to you is telling the two peers about each other.',
  },

  ssl: {
    crumb: 'Security',
    kicker: 'Layer 6 · Security · the name that outlived the protocol',
    title: 'SSL',
    sub: 'Secure Sockets Layer — deprecated',
    lede: [
      'SSL is ',
      { i: 'what TLS used to be called.' },
      ' Netscape shipped it in 1995, the IETF took it over and ',
      { a: 'renamed version 3.1 to TLS 1.0' },
      ', and ',
      { a: 'every SSL version has since been broken and formally prohibited' },
      '. The name survives everywhere — ',
      { b: 'but nothing you use today is actually SSL.' },
    ],
    takeaway: [
      'SSL is ',
      { a: 'the retired ancestor of TLS' },
      ' — the word is still used everywhere, and ',
      { b: 'the protocol itself must never be enabled.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 6', note: 'where TLS sits now' },
      { k: 'Versions', v: '2.0 · 3.0', note: 'both prohibited' },
      { k: 'Status', v: 'Broken', note: 'RFC 6176 · RFC 7568' },
      { k: 'Use instead', v: 'TLS 1.2+', note: '1.3 for preference' },
    ],
    diagram: {
      caption: 'One protocol, renamed once and superseded four times',
      relay: {
        stops: [
          { t: 'SSL 2.0', sub: '1995\nbroken by design', chip: 'prohibited', on: true },
          { t: 'SSL 3.0', sub: '1996\nPOODLE, 2014', chip: 'prohibited' },
          { t: 'TLS 1.0 – 1.1', sub: '1999 – 2006\nretired 2021', chip: 'deprecated' },
          { t: 'TLS 1.2 / 1.3', sub: '2008 · 2018\nwhat you run', chip: 'current', end: true },
        ],
        legs: ['renamed', 'hardened', 'modernised'],
      },
      facets: [
        { t: 'SSL 2.0', d: 'No handshake protection and a weak MAC — prohibited outright by RFC 6176.' },
        { t: 'SSL 3.0', d: 'POODLE exploited its CBC padding; RFC 7568 prohibited it in 2015.' },
        { t: 'The name stuck', d: '“SSL certificate”, OpenSSL, ssl_protocols — the word outlived the thing by decades.' },
      ],
      note: [
        'If a service still negotiates SSL 3.0 it is not merely old, it is ',
        { a: 'decryptable by a patient attacker on the path' },
        '. The right reading of “SSL” in any modern document is ',
        { b: 'simply “TLS”.' },
      ],
    },
    steps: [
      { t: 'It began at Netscape', d: 'SSL 2.0 shipped in 1995 to make web commerce possible; 3.0 followed a year later as a redesign.' },
      { t: 'The IETF took over', d: 'SSL 3.1 was standardised as TLS 1.0 in 1999 — a small change of protocol and a large change of name.' },
      { t: 'Both versions fell', d: 'Weak MACs, downgrade attacks and finally POODLE in 2014 left nothing salvageable.' },
      { t: 'The word remained', d: 'Certificates, libraries and config directives still say SSL while speaking nothing but TLS.' },
    ],
    beats: {
      kicker: 'Where the word still appears',
      items: [
        { t: '“SSL certificate”', d: 'it is an X.509 cert, used by TLS' },
        { t: 'OpenSSL', d: 'the library, very much current' },
        { t: 'ssl_protocols', d: 'nginx config, listing TLS versions' },
      ],
    },
    security: {
      lede: [
        'There is no configuration in which SSL is acceptable: ',
        { a: 'both versions are cryptographically broken' },
        ', and leaving them enabled ',
        { b: 'lets an attacker downgrade a modern client to them.' },
      ],
      points: [
        { t: 'POODLE', d: 'Padding oracle on downgraded legacy encryption — the attack that finished SSL 3.0 in 2014.' },
        { t: 'DROWN', d: 'A server still offering SSL 2.0 anywhere could be used to decrypt its own modern TLS sessions.' },
        { t: 'Downgrade dance', d: 'Clients that retried with older versions on failure handed attackers the choice of protocol.' },
        { t: 'Disable explicitly', d: 'Set the minimum version to TLS 1.2; do not rely on defaults in old software.' },
        { t: 'Audit what you offer', d: 'A scan showing SSLv3 in the accepted list is a finding, whether or not anything uses it.' },
        { t: 'Compliance requires it', d: 'PCI DSS and most baselines have prohibited SSL entirely for years.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'SSL', on: true }, { t: 'HTTP, …' }],
    ridesNote:
      'It sat exactly where TLS sits now — between the transport and the application — which is why the swap was invisible.',
    aside: {
      kind: 'compare',
      title: 'SSL or TLS?',
      cols: ['SSL', 'TLS'],
      rows: [
        { k: 'Latest version', a: '3.0, 1996', b: '1.3, 2018' },
        { k: 'Status', a: 'Prohibited', b: 'Current' },
        { k: 'Handshake', a: 'Unprotected', b: 'Authenticated' },
        { k: 'Should you run it', a: 'Never', b: 'Always' },
      ],
    },
    footnote:
      'When someone says SSL they almost always mean TLS — and if they really mean SSL, that is the problem.',
  },

  ipsec: {
    crumb: 'Security',
    kicker: 'Layer 3 · Security · encryption below the application',
    title: 'IPsec',
    sub: 'IP Security',
    lede: [
      'IPsec ',
      { i: 'encrypts at the network layer, so nothing above needs to know.' },
      ' It ',
      { a: 'authenticates and encrypts whole IP packets' },
      ', ',
      { a: 'negotiating keys with IKE before any traffic passes' },
      ' — which is what lets ',
      { b: 'two offices behave as one network across the public internet.' },
    ],
    takeaway: [
      'IPsec secures ',
      { a: 'the packet rather than the connection' },
      ' — so every application above it is protected ',
      { b: 'without being changed at all.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3', note: 'Network' },
      { k: 'Protocols', v: 'ESP · AH', note: 'IP 50 · 51' },
      { k: 'Key exchange', v: 'IKEv2', note: 'UDP 500 · 4500' },
      { k: 'Modes', v: 'Tunnel · transport', note: 'site-to-site · host' },
    ],
    diagram: {
      caption: 'The original packet, wrapped whole inside a new one',
      header: {
        label: 'ESP in tunnel mode — what actually crosses the internet',
        rows: [
          [
            { t: 'New IP header', w: 150, small: true, alt: true },
            { t: 'ESP header', w: 110, small: true, hi: true },
            { t: 'Encrypted payload', hi: true },
            { t: 'ESP auth', w: 90, small: true, hi: true },
          ],
          [{ t: 'inside the encryption: the original IP header + the original payload', faint: true, small: true }],
        ],
        note: [
          'In ',
          { a: 'tunnel mode' },
          ' the entire original packet — addresses included — is encrypted and given a fresh outer header addressed gateway to gateway. An observer sees ',
          { b: 'two gateways talking, and nothing about who is really behind them.' },
        ],
      },
    },
    steps: [
      { t: 'Negotiate with IKE', d: 'IKEv2 authenticates the peers, by certificate or pre-shared key, and derives keys over UDP 500.' },
      { t: 'Establish the SAs', d: 'A pair of security associations is set up — one per direction — each with its own keys and parameters.' },
      { t: 'Protect every packet', d: 'ESP encrypts and authenticates each packet; AH authenticates only, and is rarely used now.' },
      { t: 'Rekey and tear down', d: 'SAs expire on time or volume and are rekeyed; DPD notices when the far end has gone away.' },
    ],
    beats: {
      kicker: 'The pieces',
      items: [
        { t: 'ESP', d: 'encrypt + authenticate — the one you want' },
        { t: 'AH', d: 'authenticate only; NAT breaks it' },
        { t: 'IKEv2', d: 'the modern key exchange' },
        { t: 'Tunnel mode', d: 'site to site, whole packet' },
        { t: 'Transport mode', d: 'host to host, payload only' },
        { t: 'NAT-T', d: 'ESP inside UDP 4500' },
      ],
    },
    security: {
      lede: [
        'IPsec is ',
        { a: 'strong cryptography with a great many knobs' },
        ' — most real failures are not breaks but ',
        { b: 'weak pre-shared keys and obsolete algorithms left enabled.' },
      ],
      points: [
        { t: 'Pre-shared key weakness', d: 'IKEv1 aggressive mode with a PSK can be captured and cracked offline — use certificates or EAP.' },
        { t: 'Retire old crypto', d: 'DES, 3DES, MD5 and DH groups 1, 2 and 5 should all be off; use AES-GCM and a modern group.' },
        { t: 'IKEv1 is legacy', d: 'IKEv2 is simpler, faster to rekey and has fewer footguns — migrate where you can.' },
        { t: 'AH and NAT', d: 'AH authenticates the outer header, so any NAT on the path breaks it; ESP with NAT-T is the answer.' },
        { t: 'Perfect forward secrecy', d: 'Enable PFS on rekey so one compromised key doesn’t unlock previously captured traffic.' },
        { t: 'Tunnel ≠ authorisation', d: 'A site-to-site tunnel joins two networks; what may cross it is still a firewall’s decision.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'IPsec', on: true }, { t: 'the original packet' }],
    ridesNote:
      'Unlike TLS it is not carried by a transport — ESP is an IP protocol in its own right, wrapping packets rather than streams.',
    aside: {
      kind: 'compare',
      title: 'IPsec or TLS?',
      cols: ['TLS', 'IPsec'],
      rows: [
        { k: 'Protects', a: 'One connection', b: 'Every packet' },
        { k: 'Apps must', a: 'Use it', b: 'Know nothing' },
        { k: 'Typical use', a: 'Client to server', b: 'Site to site' },
        { k: 'Sees addresses', a: 'Yes', b: 'No, in tunnel mode' },
      ],
    },
    footnote:
      'Encrypting at layer 3 means the application never finds out — which is its great strength and its great blind spot.',
  },

  dtls: {
    crumb: 'Security',
    kicker: 'Layer 6 · Security · TLS for traffic that cannot wait',
    title: 'DTLS',
    sub: 'Datagram Transport Layer Security',
    lede: [
      'DTLS is ',
      { i: 'TLS with TCP’s assumptions removed.' },
      ' TLS needs an ordered, reliable stream; datagram traffic has neither. DTLS ',
      { a: 'adds sequence numbers and its own retransmission to the handshake' },
      ', ',
      { a: 'makes each record independently decryptable' },
      ', and ',
      { b: 'lets a lost packet stay lost.' },
    ],
    takeaway: [
      'DTLS gives UDP ',
      { a: 'TLS-grade encryption' },
      ' without demanding reliability — ',
      { b: 'each record stands on its own.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 6', note: 'over UDP' },
      { k: 'Port', v: 'The app’s own', note: 'no port of its own' },
      { k: 'Based on', v: 'TLS', note: '1.2 and 1.3' },
      { k: 'Used by', v: 'WebRTC', note: 'and CoAP, and VPNs' },
    ],
    diagram: {
      caption: 'What had to change to run TLS over datagrams',
      layers: {
        items: [
          {
            head: '1 · The handshake retransmits itself',
            tone: 'a',
            lines: [
              [
                'TCP used to guarantee the handshake arrived. DTLS numbers its own handshake messages and ',
                { s: 'retransmits any that go unanswered.' },
              ],
            ],
          },
          {
            head: '2 · A cookie stops amplification',
            tone: 'b',
            lines: [
              [
                'The server answers a ClientHello with a ',
                { s: 'HelloVerifyRequest' },
                ' carrying a cookie; only a client that echoes it is real.',
              ],
              ['Nothing is allocated and no large response is sent until that address is proven.'],
            ],
          },
          {
            head: '3 · Records are independent',
            tone: 'plain',
            lines: [
              [
                'Each record carries an explicit sequence number and can be decrypted alone. A dropped datagram costs one record — it does not desynchronise the cipher.',
              ],
            ],
          },
        ],
      },
      note: [
        'That last change is the whole point: TLS over UDP without it would ',
        { a: 'break permanently on the first lost packet' },
        '. With it, DTLS can carry ',
        { b: 'real-time media that would rather drop a frame than wait.' },
      ],
    },
    steps: [
      { t: 'Hello, then a cookie', d: 'The client’s ClientHello is answered with a cookie it must echo — proving its source address is real.' },
      { t: 'Complete the handshake', d: 'The rest proceeds as TLS, with DTLS numbering and retransmitting messages that go missing.' },
      { t: 'Protect each record', d: 'Every record gets an explicit sequence number so it can be decrypted independently of the others.' },
      { t: 'Tolerate loss', d: 'Missing records are simply absent; a replay window catches duplicates and old packets.' },
    ],
    beats: {
      kicker: 'Where you meet it',
      items: [
        { t: 'WebRTC', d: 'DTLS-SRTP keys every browser call' },
        { t: 'CoAP', d: 'securing constrained IoT devices' },
        { t: 'OpenVPN / AnyConnect', d: 'UDP-mode VPNs' },
      ],
    },
    security: {
      lede: [
        'DTLS inherits ',
        { a: 'TLS’s cryptography and its configuration mistakes' },
        ' alike — plus the ',
        { b: 'amplification risk that comes with answering UDP at all.' },
      ],
      points: [
        { t: 'Always require the cookie', d: 'Skipping HelloVerifyRequest turns the server into a DDoS amplifier for spoofed sources.' },
        { t: 'Replay protection', d: 'The sliding receive window must be enabled, or an old captured record can be replayed.' },
        { t: 'Same cipher hygiene', d: 'DTLS 1.3, modern AEAD suites, and no version older than 1.2.' },
        { t: 'Certificate validation', d: 'As with TLS, a chain not checked against a trusted root proves nothing at all.' },
        { t: 'Fragmentation care', d: 'Handshake messages larger than the MTU are fragmented by DTLS itself — a known source of bugs.' },
        { t: 'Constrained devices', d: 'IoT stacks often ship weak defaults; pre-shared keys must still be long and unique.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'DTLS', on: true }, { t: 'SRTP, CoAP, …' }],
    ridesNote:
      'It has no port of its own — DTLS secures whatever UDP port the application it protects already uses.',
    aside: {
      kind: 'compare',
      title: 'TLS or DTLS?',
      cols: ['TLS', 'DTLS'],
      rows: [
        { k: 'Transport', a: 'TCP', b: 'UDP' },
        { k: 'Lost packet', a: 'TCP resends', b: 'Record is gone' },
        { k: 'Handshake loss', a: 'TCP handles it', b: 'DTLS retransmits' },
        { k: 'Anti-amplification', a: 'Not needed', b: 'Cookie required' },
      ],
    },
    footnote:
      'Every encrypted browser call runs on it — DTLS is the least famous protocol most people use daily.',
  },

  'oauth-2': {
    crumb: 'Identity & Auth',
    kicker: 'Layer 7 · Authorisation · access without the password',
    title: 'OAuth 2.0',
    sub: 'Delegated authorisation',
    lede: [
      'OAuth is ',
      { i: 'how you let an app do something on your behalf without giving it your password.' },
      ' You ',
      { a: 'approve a specific, limited permission at the provider itself' },
      ', the app ',
      { a: 'receives a token rather than a credential' },
      ', and ',
      { b: 'that token can be scoped, expired and revoked.' },
    ],
    takeaway: [
      'OAuth grants an app ',
      { a: 'a scoped, revocable token' },
      ' instead of your password — it answers ',
      { b: '“what may this app do?”, not “who are you?”' },
    ],
    points: [
      { k: 'Answers', v: 'Authorisation', note: 'not authentication' },
      { k: 'Issues', v: 'Access tokens', note: '+ refresh tokens' },
      { k: 'Flow', v: 'Auth code + PKCE', note: 'the one to use' },
      { k: 'Version', v: '2.0 / 2.1', note: '1.0 is unrelated' },
    ],
    diagram: {
      caption: 'The authorisation code flow, with PKCE',
      exchange: {
        lanes: { left: 'The app', right: 'The provider' },
        messages: [
          {
            label: '1 · Redirect the user to the provider',
            dir: 'right',
            card: {
              quote: 'GET /authorize?client_id=…&scope=read:files&code_challenge=…',
              gloss: ['The app never sees the login — the user authenticates at the provider itself'],
            },
          },
          {
            label: '2 · The user approves, a code comes back',
            dir: 'left',
            card: {
              quote: 'Redirect back with ?code=abc123',
              gloss: ['A short-lived, single-use code — useless on its own without the verifier'],
            },
          },
          {
            label: '3 · Exchange the code for a token',
            dir: 'right',
            card: {
              tone: 'plain',
              quote: 'POST /token with the code and code_verifier → access_token + refresh_token',
            },
          },
        ],
        note: [
          'PKCE binds the code to the app that started the flow, so ',
          { a: 'an intercepted code cannot be redeemed by anyone else' },
          '. The app ends up with ',
          { b: 'a token limited to the scopes the user actually approved.' },
        ],
      },
    },
    steps: [
      { t: 'Ask for specific scopes', d: 'The app redirects to the provider naming exactly what it wants — read:files, not everything.' },
      { t: 'The user approves at the provider', d: 'Authentication and consent happen on the provider’s own page; the app never handles the password.' },
      { t: 'Redeem the code', d: 'The app exchanges the one-time code, plus its PKCE verifier, for an access token at the token endpoint.' },
      { t: 'Use, refresh, revoke', d: 'The access token is short-lived; a refresh token renews it, and the user can revoke both at any time.' },
    ],
    beats: {
      kicker: 'Flows, good and retired',
      items: [
        { t: 'Auth code + PKCE', d: 'the answer for every client type' },
        { t: 'Client credentials', d: 'machine to machine, no user' },
        { t: 'Device code', d: 'TVs and things with no keyboard' },
        { t: 'Implicit', d: 'retired — tokens in the URL' },
        { t: 'Password grant', d: 'retired — defeats the point' },
        { t: 'Refresh token', d: 'renew without asking again' },
      ],
    },
    security: {
      lede: [
        'OAuth is ',
        { a: 'a framework, not a finished protocol' },
        ' — most breaches come from ',
        { b: 'implementing an optional part badly, or using a flow that should have been retired.' },
      ],
      points: [
        { t: 'Exact redirect URIs', d: 'Wildcard or partial matching lets an attacker have the code delivered to their own site.' },
        { t: 'PKCE everywhere', d: 'Not just for mobile — OAuth 2.1 makes it mandatory for confidential clients too.' },
        { t: 'The state parameter', d: 'Without it, an attacker can graft their own authorisation onto a victim’s session — CSRF on the callback.' },
        { t: 'Never the password grant', d: 'Handing the app your credentials is precisely what OAuth exists to avoid.' },
        { t: 'Consent phishing', d: 'A convincing app asking for sweeping scopes is a real attack — users approve without reading.' },
        { t: 'Not authentication', d: 'A valid token proves access was granted, not who the user is. That is what OIDC adds.' },
      ],
    },
    rides: [{ t: 'TCP' }, { t: 'TLS' }, { t: 'HTTP' }, { t: 'OAuth 2.0', on: true }],
    ridesNote:
      'Ordinary HTTPS requests and redirects — OAuth adds no wire protocol of its own, only endpoints and parameters.',
    aside: {
      kind: 'pair',
      title: 'Tokens & roles',
      tables: [
        {
          head: 'Tokens',
          rows: [
            { k: 'Access', v: 'short-lived', ink: 'a' },
            { k: 'Refresh', v: 'renews it', ink: 'a' },
            { k: 'Code', v: 'single use', ink: 'a' },
            { k: 'Scope', v: 'the limit', ink: 'a' },
          ],
        },
        {
          head: 'Roles',
          rows: [
            { k: 'Resource owner', v: 'the user' },
            { k: 'Client', v: 'the app' },
            { k: 'Auth server', v: 'issues tokens' },
            { k: 'Resource server', v: 'the API' },
          ],
        },
      ],
    },
    footnote:
      '“Sign in with Google” is not OAuth doing authentication — it is OIDC, sitting on top of it.',
  },

  oidc: {
    crumb: 'Identity & Auth',
    kicker: 'Layer 7 · Authentication · the identity layer on OAuth',
    title: 'OIDC',
    sub: 'OpenID Connect',
    lede: [
      'OIDC is ',
      { i: 'the thin layer that turns OAuth into a login.' },
      ' It reuses OAuth’s flow exactly, but ',
      { a: 'adds an ID token — a signed JWT stating who the user is' },
      ', ',
      { a: 'and a standard userinfo endpoint' },
      ' — so an app can ',
      { b: 'verify an identity rather than merely hold a permission.' },
    ],
    takeaway: [
      'OIDC adds ',
      { a: 'a signed ID token to OAuth' },
      ' — which is what makes ',
      { b: '“sign in with…” an authentication rather than a guess.' },
    ],
    points: [
      { k: 'Answers', v: 'Authentication', note: 'who the user is' },
      { k: 'Built on', v: 'OAuth 2.0', note: 'same endpoints' },
      { k: 'Returns', v: 'ID token', note: 'a signed JWT' },
      { k: 'Scope', v: 'openid', note: 'the one that triggers it' },
    ],
    diagram: {
      caption: 'The same flow, with one extra token that means something',
      exchange: {
        lanes: { left: 'The app', right: 'The identity provider' },
        messages: [
          {
            label: 'Authorise, asking for the openid scope',
            dir: 'right',
            card: {
              quote: 'scope=openid profile email &nonce=…',
              gloss: ['The openid scope is what turns an OAuth request into an OIDC one'],
            },
          },
          {
            label: 'Token response — with an id_token alongside',
            dir: 'left',
            card: {
              tone: 'b',
              quote: 'access_token + id_token (a signed JWT)',
              rows: [
                { k: 'iss', v: 'who issued it' },
                { k: 'sub', v: 'the user, stably' },
                { k: 'aud', v: 'this app, and no other' },
                { k: 'exp / nonce', v: 'freshness' },
              ],
            },
          },
          {
            label: 'Verify the signature and every claim',
            dir: 'both',
            card: {
              tone: 'plain',
              quote: 'Keys fetched from the provider’s JWKS endpoint — then the user is logged in',
            },
          },
        ],
        note: [
          'The ID token is ',
          { a: 'for the app, about the user' },
          ' — which is why checking ',
          { m: 'aud' },
          ' matters: a token minted for a different app ',
          { b: 'must never be accepted as a login here.' },
        ],
      },
    },
    steps: [
      { t: 'Request the openid scope', d: 'An ordinary OAuth authorisation request, plus scope=openid and a nonce for replay protection.' },
      { t: 'Receive an ID token', d: 'The token response includes a signed JWT describing the authentication that just happened.' },
      { t: 'Validate it properly', d: 'Check the signature against the provider’s JWKS, then iss, aud, exp and the nonce you sent.' },
      { t: 'Fetch more if needed', d: 'The userinfo endpoint returns profile claims that were too large or too fresh for the token.' },
    ],
    beats: {
      kicker: 'What it standardised',
      items: [
        { t: 'ID token', d: 'a signed JWT about the login' },
        { t: 'Discovery', d: '/.well-known/openid-configuration' },
        { t: 'JWKS', d: 'the public keys, fetched and rotated' },
        { t: 'Userinfo', d: 'one endpoint for profile claims' },
        { t: 'Standard claims', d: 'sub, email, name — the same everywhere' },
        { t: 'Logout', d: 'front-channel and back-channel' },
      ],
    },
    security: {
      lede: [
        'An ID token is ',
        { a: 'only as good as its validation' },
        ' — a library that decodes a JWT without checking the signature ',
        { b: 'accepts whatever anyone chooses to send.' },
      ],
      points: [
        { t: 'Verify the signature', d: 'Against the provider’s JWKS, and never trust the alg header — reject “none” outright.' },
        { t: 'Check aud and iss', d: 'A valid token from the right provider for the wrong app is not a login for yours.' },
        { t: 'Use the nonce', d: 'It binds the token to your request and stops an old one being replayed.' },
        { t: 'sub, not email', d: 'Email addresses change and can be reassigned; sub is the provider’s stable identifier.' },
        { t: 'Rotate keys gracefully', d: 'Cache JWKS but honour kid, or a routine key rotation logs everyone out.' },
        { t: 'ID token is not an API key', d: 'It authenticates the user to the app; the access token is what calls the API.' },
      ],
    },
    rides: [{ t: 'TLS' }, { t: 'HTTP' }, { t: 'OAuth 2.0' }, { t: 'OIDC', on: true }],
    ridesNote:
      'Strictly a profile of OAuth — the same endpoints and redirects, with one extra scope and one extra token.',
    aside: {
      kind: 'compare',
      title: 'OAuth or OIDC?',
      cols: ['OAuth 2.0', 'OIDC'],
      rows: [
        { k: 'Question', a: 'May it do this?', b: 'Who is this?' },
        { k: 'Returns', a: 'Access token', b: '+ ID token' },
        { k: 'Token format', a: 'Opaque, often', b: 'A signed JWT' },
        { k: 'Use for login', a: 'No', b: 'Yes' },
      ],
    },
    footnote:
      'Using an OAuth access token as proof of identity is the classic mistake OIDC was written to end.',
  },

  saml: {
    crumb: 'Identity & Auth',
    kicker: 'Layer 7 · Authentication · single sign-on, by signed XML',
    title: 'SAML',
    sub: 'Security Assertion Markup Language',
    lede: [
      'SAML is ',
      { i: 'enterprise single sign-on, done in XML.' },
      ' An application ',
      { a: 'redirects the browser to the company’s identity provider' },
      ', which authenticates the user and ',
      { a: 'posts back a digitally signed assertion' },
      ' — ',
      { b: 'the browser carries the proof, and no password ever reaches the application.' },
    ],
    takeaway: [
      'SAML lets one ',
      { a: 'identity provider vouch for a user to many applications' },
      ' — ',
      { b: 'the assertion is signed XML, carried by the browser.' },
    ],
    points: [
      { k: 'Answers', v: 'Authentication', note: 'and attributes' },
      { k: 'Format', v: 'Signed XML', note: 'not JSON' },
      { k: 'Binding', v: 'HTTP POST', note: 'via the browser' },
      { k: 'Version', v: '2.0', note: 'since 2005' },
    ],
    diagram: {
      caption: 'The browser carries a signed assertion between two parties',
      resolve: {
        ask: {
          left: { t: 'The application', d: 'service provider — “who are you?”', tone: 'a' },
          right: { t: 'The browser', d: 'redirected, carrying the request', tone: 'b' },
        },
        bridge: 'The user has no session, so the SP sends them to the IdP to prove themselves…',
        referrals: [
          {
            from: 'Identity provider',
            tone: 'b',
            text: ['Authenticates the user — password, MFA, whatever the company requires'],
          },
          {
            from: 'Assertion',
            tone: 'b',
            text: ['Builds a signed XML statement: this subject, these attributes, valid until…'],
          },
          {
            from: 'HTTP POST',
            tone: 'a',
            text: ['The browser posts it back to the SP’s Assertion Consumer Service URL'],
          },
        ],
        answer: {
          left: {
            t: 'Signature verified',
            d: 'against the IdP’s known certificate',
            tone: 'a',
            filled: true,
          },
          right: { t: 'Session created', d: 'the user is logged in', tone: 'b' },
        },
      },
      note: [
        'The two servers may never talk to each other: ',
        { a: 'the browser is the courier' },
        '. Trust rests entirely on the ',
        { b: 'IdP’s signing certificate being known to the SP in advance' },
        ' — exchanged once, in metadata.',
      ],
    },
    steps: [
      { t: 'Hit the application', d: 'With no session, the SP builds an AuthnRequest and redirects the browser to the identity provider.' },
      { t: 'Authenticate centrally', d: 'The IdP checks the user however the organisation requires — and reuses its own session if there is one.' },
      { t: 'Sign an assertion', d: 'It builds an XML assertion naming the subject and attributes, signs it, and posts it back through the browser.' },
      { t: 'Verify and admit', d: 'The SP checks the signature, audience, conditions and timestamps, then creates a local session.' },
    ],
    beats: {
      kicker: 'The vocabulary',
      items: [
        { t: 'IdP', d: 'identity provider — vouches' },
        { t: 'SP', d: 'service provider — the app' },
        { t: 'Assertion', d: 'the signed statement' },
        { t: 'Metadata', d: 'certificates and endpoints, exchanged' },
        { t: 'SP-initiated', d: 'start at the app' },
        { t: 'IdP-initiated', d: 'start at the portal' },
      ],
    },
    security: {
      lede: [
        'SAML’s security is ',
        { a: 'entirely a matter of validating the XML signature correctly' },
        ' — and XML signature validation has been ',
        { b: 'a rich source of critical bugs for twenty years.' },
      ],
      points: [
        { t: 'Signature wrapping', d: 'XSW attacks move the signed element so a parser validates one part and reads another.' },
        { t: 'Canonicalisation bugs', d: 'Comment injection has repeatedly let attackers change the asserted username past a valid signature.' },
        { t: 'Check the audience', d: 'An assertion minted for another SP must be rejected, however genuine its signature.' },
        { t: 'Enforce conditions', d: 'NotBefore, NotOnOrAfter and single-use IDs are what stop an old assertion being replayed.' },
        { t: 'Certificate expiry', d: 'IdP signing certificates expire and take every integration down at once — track and rotate them.' },
        { t: 'IdP-initiated is riskier', d: 'An unsolicited assertion has no request to correlate with; prefer SP-initiated flows.' },
      ],
    },
    rides: [{ t: 'TLS' }, { t: 'HTTP' }, { t: 'SAML', on: true }],
    ridesNote:
      'Carried by browser redirects and form posts — the identity provider and the application need no direct connection.',
    aside: {
      kind: 'compare',
      title: 'SAML or OIDC?',
      cols: ['SAML', 'OIDC'],
      rows: [
        { k: 'Format', a: 'Signed XML', b: 'Signed JWT' },
        { k: 'Built for', a: 'Web apps', b: 'Apps and APIs' },
        { k: 'Mobile', a: 'Awkward', b: 'Native' },
        { k: 'Still used', a: 'Widely, in enterprise', b: 'Everywhere new' },
      ],
    },
    footnote:
      'Twenty years old and still the backbone of corporate SSO — largely because it already works everywhere.',
  },

  kerberos: {
    crumb: 'Identity & Auth',
    kicker: 'Layer 7 · Authentication · tickets from a trusted third party',
    title: 'Kerberos',
    sub: 'Ticket-based authentication',
    lede: [
      'Kerberos ',
      { i: 'proves who you are without your password ever crossing the network.' },
      ' A central authority ',
      { a: 'issues you a time-limited ticket once, when you log in' },
      ', and that ticket ',
      { a: 'buys further tickets for individual services' },
      ' — ',
      { b: 'so every server can verify you without ever being told your secret.' },
    ],
    takeaway: [
      'Kerberos trades ',
      { a: 'one login for a ticket' },
      ', and that ticket for service tickets — ',
      { b: 'the password itself never travels.' },
    ],
    points: [
      { k: 'Answers', v: 'Authentication', note: 'mutual, both ways' },
      { k: 'Port', v: '88', note: 'UDP and TCP' },
      { k: 'Issues', v: 'Tickets', note: 'TGT, then service tickets' },
      { k: 'Found in', v: 'Active Directory', note: 'its largest deployment' },
    ],
    diagram: {
      caption: 'One login, then a ticket for each service',
      exchange: {
        lanes: { left: 'You', right: 'KDC and services' },
        messages: [
          {
            label: '1 · AS-REQ — ask the Authentication Service',
            dir: 'right',
            card: {
              tone: 'b',
              quote: 'AS-REP returns a Ticket Granting Ticket',
              gloss: [
                'Encrypted with a key derived from your password — only you can open it, so the password never travels',
              ],
            },
          },
          {
            label: '2 · TGS-REQ — present the TGT, ask for one service',
            dir: 'right',
            card: {
              tone: 'b',
              quote: 'TGS-REP returns a service ticket for, say, the file server',
              gloss: ['The KDC never asks for your password again — the TGT is the proof'],
            },
          },
          {
            label: '3 · AP-REQ — hand the ticket to the service itself',
            dir: 'both',
            card: {
              tone: 'plain',
              quote: 'The service decrypts it with its own key — and can prove itself back to you',
            },
          },
        ],
        note: [
          'The service and the KDC never talk during this: the ticket is ',
          { a: 'encrypted with the service’s own key' },
          ', so being able to read it is proof enough. Timestamps inside ',
          { b: 'are why every clock must be within five minutes.' },
        ],
      },
    },
    steps: [
      { t: 'Authenticate once', d: 'The KDC returns a Ticket Granting Ticket encrypted so that only your password’s key can unlock it.' },
      { t: 'Buy a service ticket', d: 'Presenting the TGT to the ticket granting service yields a ticket for one specific service.' },
      { t: 'Present it to the service', d: 'The service decrypts the ticket with its own long-term key — no call back to the KDC needed.' },
      { t: 'Mutual, and time-limited', d: 'The service can prove itself in return, and every ticket expires, typically within ten hours.' },
    ],
    beats: {
      kicker: 'The parts',
      items: [
        { t: 'KDC', d: 'the trusted third party' },
        { t: 'TGT', d: 'the ticket that buys tickets' },
        { t: 'SPN', d: 'names the service a ticket is for' },
        { t: 'Realm', d: 'the administrative domain' },
        { t: 'keytab', d: 'a service’s long-term key on disk' },
        { t: 'Clock skew', d: 'five minutes, and it matters' },
      ],
    },
    security: {
      lede: [
        'Kerberos is ',
        { a: 'cryptographically sound and operationally sharp-edged' },
        ' — nearly every attack targets ',
        { b: 'weak service passwords or a stolen ticket, not the protocol itself.' },
      ],
      points: [
        { t: 'Kerberoasting', d: 'Any user can request a service ticket and crack it offline — service accounts need long random passwords.' },
        { t: 'Pass-the-ticket', d: 'A ticket lifted from memory is as good as the login; it needs no password at all.' },
        { t: 'Golden ticket', d: 'Compromise the krbtgt key and an attacker mints valid TGTs for anyone, indefinitely.' },
        { t: 'Pre-authentication', d: 'Accounts with it disabled can be AS-REP roasted — a crackable reply for the asking.' },
        { t: 'Clock discipline', d: 'Skew beyond five minutes breaks authentication outright; NTP is a dependency, not a nicety.' },
        { t: 'Delegation is dangerous', d: 'Unconstrained delegation lets a compromised server impersonate every user who touched it.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP / TCP' }, { t: 'Kerberos', on: true }],
    ridesNote:
      'Large tickets outgrow a UDP datagram, so clients fall back to TCP on the same port 88.',
    aside: {
      kind: 'pair',
      title: 'Tickets & terms',
      tables: [
        {
          head: 'Exchanges',
          rows: [
            { k: 'AS-REQ/REP', v: 'get a TGT', ink: 'a' },
            { k: 'TGS-REQ/REP', v: 'get a service ticket', ink: 'a' },
            { k: 'AP-REQ/REP', v: 'use it', ink: 'a' },
          ],
        },
        {
          head: 'Lifetimes',
          rows: [
            { k: 'TGT', v: '~10 hours' },
            { k: 'Renewable', v: '~7 days' },
            { k: 'Service', v: 'shorter' },
            { k: 'Skew', v: '5 minutes' },
          ],
        },
      ],
    },
    footnote:
      'Named for the three-headed dog because the exchange has three parties — you, the service, and the KDC between.',
  },

  radius: {
    crumb: 'Identity & Auth',
    kicker: 'Layer 7 · AAA · may this device onto the network at all?',
    title: 'RADIUS',
    sub: 'Remote Authentication Dial-In User Service',
    lede: [
      'RADIUS answers ',
      { i: 'the question asked before any traffic is allowed.' },
      ' A switch, Wi-Fi controller or VPN ',
      { a: 'forwards a joining device’s credentials to a central server' },
      ', which ',
      { a: 'replies accept or reject — often with a VLAN to put them on' },
      ' — and then ',
      { b: 'logs the whole session for accounting.' },
    ],
    takeaway: [
      'RADIUS centralises ',
      { a: 'authentication, authorisation and accounting' },
      ' for network access — ',
      { b: 'the switch asks, the server decides.' },
    ],
    points: [
      { k: 'Answers', v: 'AAA', note: 'authn, authz, accounting' },
      { k: 'Ports', v: '1812 · 1813', note: 'auth · accounting' },
      { k: 'Transport', v: 'UDP', note: 'with its own retries' },
      { k: 'Carried by', v: '802.1X', note: 'EAP over the LAN' },
    ],
    diagram: {
      caption: 'Three parties: the device, the switch, and the server',
      relay: {
        stops: [
          { t: 'Supplicant', sub: 'the laptop\nor phone', on: true },
          { t: 'Authenticator', sub: 'switch, AP\nor VPN', chip: 'no decision of its own' },
          { t: 'RADIUS server', sub: 'checks the\ndirectory', end: true },
        ],
        legs: ['EAP over LAN', 'RADIUS · 1812'],
      },
      facets: [
        { t: 'Access-Request', d: 'The authenticator forwards the identity and credentials it was given, with the port it arrived on.' },
        { t: 'Access-Accept', d: 'The reply may also carry attributes — a VLAN, an ACL, a session timeout to enforce.' },
        { t: 'Accounting', d: 'Start, interim and stop records on 1813 record who was on, for how long, and how much they moved.' },
      ],
      note: [
        'The switch is ',
        { a: 'a relay, not a judge' },
        ' — it holds the port closed until the server says otherwise. That is what makes ',
        { b: 'one policy apply across every access point and every switch at once.' },
      ],
    },
    steps: [
      { t: 'The port stays shut', d: 'With 802.1X, a switch port passes nothing but EAP until the device has authenticated.' },
      { t: 'Forward as Access-Request', d: 'The authenticator wraps the credentials in RADIUS and sends them to the server on 1812.' },
      { t: 'Accept, reject or challenge', d: 'The server checks the directory and answers — often adding the VLAN or ACL to apply.' },
      { t: 'Account for the session', d: 'Start and stop records on 1813 give a complete picture of who was connected, and when.' },
    ],
    beats: {
      kicker: 'What it is used for',
      items: [
        { t: '802.1X wired', d: 'authenticate before the port opens' },
        { t: 'WPA2/3-Enterprise', d: 'per-user Wi-Fi, no shared key' },
        { t: 'VPN access', d: 'the gateway asks RADIUS' },
        { t: 'Dynamic VLAN', d: 'the reply chooses the network' },
        { t: 'CoA', d: 'change or kill a live session' },
        { t: 'Admin login', d: 'router and switch management' },
      ],
    },
    security: {
      lede: [
        'RADIUS is old enough that ',
        { a: 'its packet protection is a shared secret and MD5' },
        ' — modern deployments must ',
        { b: 'tunnel it, or rely on EAP to protect what actually matters.' },
      ],
      points: [
        { t: 'Weak by design', d: 'Only the password attribute is obscured, using MD5 with the shared secret — the rest is plaintext.' },
        { t: 'BlastRADIUS', d: 'CVE-2024-3596 forges responses via MD5 collisions; Message-Authenticator must be required.' },
        { t: 'Strong shared secrets', d: 'Long and unique per client — a reused secret compromises every device that has it.' },
        { t: 'Use EAP-TLS', d: 'Certificate-based EAP means no password is exposed even if RADIUS itself is observed.' },
        { t: 'RadSec', d: 'RADIUS over TLS on 2083 fixes the transport properly; use it wherever both ends support it.' },
        { t: 'Validate the server cert', d: 'Clients that don’t check it will hand credentials to any evil-twin AP that asks.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'RADIUS', on: true }, { t: 'carries EAP' }],
    ridesNote:
      'UDP with application-level retries — and RadSec now offers the same protocol over TLS on TCP 2083.',
    aside: {
      kind: 'compare',
      title: 'RADIUS or TACACS+?',
      cols: ['RADIUS', 'TACACS+'],
      rows: [
        { k: 'Transport', a: 'UDP', b: 'TCP 49' },
        { k: 'Encrypts', a: 'The password', b: 'The whole body' },
        { k: 'AAA', a: 'Combined', b: 'Separated' },
        { k: 'Typical use', a: 'Network access', b: 'Device admin' },
      ],
    },
    footnote:
      'Written for dial-up modems in 1991 — and still the thing deciding whether your laptop may join the Wi-Fi.',
  },

  ldap: {
    crumb: 'Identity & Auth',
    kicker: 'Layer 7 · Directory · the tree of users, groups and devices',
    title: 'LDAP',
    sub: 'Lightweight Directory Access Protocol',
    lede: [
      'LDAP is ',
      { i: 'the read-mostly database an organisation keeps of itself.' },
      ' Users, groups, printers and servers live in ',
      { a: 'a hierarchical tree of entries with attributes' },
      ', and applications ',
      { a: 'bind to it, search it, and read what they are allowed to' },
      ' — ',
      { b: 'one directory that everything else asks about identity.' },
    ],
    takeaway: [
      'LDAP holds ',
      { a: 'the organisation’s directory as a tree' },
      ' — ',
      { b: 'bind to authenticate, search to find, and everything else reads from it.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'binary, not text' },
      { k: 'Ports', v: '636 · 389', note: 'LDAPS · STARTTLS' },
      { k: 'Shape', v: 'A tree', note: 'DNs from leaf to root' },
      { k: 'Behind', v: 'Active Directory', note: 'and OpenLDAP, and more' },
    ],
    diagram: {
      caption: 'A distinguished name is a path up the tree',
      anatomy: {
        specimen: { a: 'cn=Anna Rai,ou=Engineering', sep: ',', b: 'dc=example,dc=com' },
        halves: [
          { kicker: 'Leftmost', t: 'The entry', d: 'this person, in this unit' },
          { kicker: 'Rightmost', t: 'The root', d: 'the organisation’s base DN' },
        ],
        note: [
          'Read right to left it is a path down from the base: ',
          { m: 'dc=com' },
          ' → ',
          { m: 'dc=example' },
          ' → ',
          { m: 'ou=Engineering' },
          ' → the entry itself.',
        ],
      },
      header: {
        label: 'The operations, and that is nearly all of them',
        rows: [
          [
            { t: 'BIND — authenticate', hi: true },
            { t: 'SEARCH — the one everyone uses', hi: true },
          ],
          [{ t: 'ADD' }, { t: 'MODIFY' }, { t: 'DELETE' }, { t: 'COMPARE' }],
          [{ t: 'UNBIND — close the session', faint: true, small: true }],
        ],
        note: [
          'A search takes a base DN, a scope and a filter like ',
          { m: '(&(objectClass=user)(memberOf=cn=admins,…))' },
          ' — which is how an application asks ',
          { a: '“is this person in that group?”' },
          ' without holding the answer itself.',
        ],
      },
    },
    steps: [
      { t: 'Bind to the directory', d: 'A simple bind sends a DN and password; SASL binds use Kerberos or a certificate instead.' },
      { t: 'Search from a base', d: 'Give a base DN, a scope — base, one level or subtree — and a filter naming what you want.' },
      { t: 'Read the attributes', d: 'Entries come back as attribute/value pairs; ask only for the ones you need.' },
      { t: 'Modify if permitted', d: 'ADD, MODIFY and DELETE change the tree, subject to the directory’s own access controls.' },
    ],
    beats: {
      kicker: 'Terms you will meet',
      items: [
        { t: 'DN', d: 'distinguished name — the full path' },
        { t: 'Base DN', d: 'where a search starts' },
        { t: 'objectClass', d: 'what kind of entry it is' },
        { t: 'Schema', d: 'which attributes are allowed' },
        { t: 'Filter', d: 'the query language, in parentheses' },
        { t: 'Referral', d: '“that branch lives elsewhere”' },
      ],
    },
    security: {
      lede: [
        'LDAP holds ',
        { a: 'the map of who everyone is' },
        ', which makes it both a prize for reconnaissance and ',
        { b: 'a place where one injection flaw can bypass a login.' },
      ],
      points: [
        { t: 'Never plain 389', d: 'A simple bind sends the password in clear text — use LDAPS on 636 or STARTTLS, always.' },
        { t: 'LDAP injection', d: 'Unescaped input in a filter can turn a login check into a query that always matches.' },
        { t: 'Anonymous bind', d: 'If enabled, anyone can enumerate every user, group and machine in the organisation.' },
        { t: 'Service account sprawl', d: 'Bind accounts with read-everything rights end up in config files across the estate.' },
        { t: 'Signing and channel binding', d: 'Unsigned LDAP is relayable — the mitigation for a long-standing class of AD attacks.' },
        { t: 'Rich reconnaissance', d: 'Group membership and descriptions map an organisation’s privilege structure precisely.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'TCP' }, { t: 'TLS' }, { t: 'LDAP', on: true }],
    ridesNote:
      'A long-lived TCP session carrying BER-encoded messages — compact and binary, not a text dialog like SMTP.',
    aside: {
      kind: 'pair',
      title: 'Operations & scopes',
      tables: [
        {
          head: 'Operations',
          rows: [
            { k: 'BIND', v: 'authenticate', ink: 'a' },
            { k: 'SEARCH', v: 'query', ink: 'a' },
            { k: 'MODIFY', v: 'change', ink: 'a' },
            { k: 'UNBIND', v: 'close', ink: 'a' },
          ],
        },
        {
          head: 'Search scopes',
          rows: [
            { k: 'base', v: 'this entry' },
            { k: 'one', v: 'its children' },
            { k: 'sub', v: 'the whole branch' },
            { k: 'Filter', v: '(attr=value)' },
          ],
        },
      ],
    },
    footnote:
      'Every “log in with your company account” eventually becomes an LDAP search behind the scenes.',
  },

  ntp: {
    crumb: 'Time & Management',
    kicker: 'Layer 7 · Time · keeping network clocks aligned',
    title: 'NTP',
    sub: 'Network Time Protocol',
    lede: [
      'NTP ',
      { i: 'keeps networked machines closely aligned on time.' },
      ' It ',
      { a: 'measures the round trip to a reference clock and works out the offset' },
      ', ',
      { a: 'then steers the local clock towards it rather than jumping' },
      ' — ',
      { b: 'because certificates, logs, Kerberos and TOTP all fall apart without it.' },
    ],
    takeaway: [
      'NTP works out ',
      { a: 'the offset between two clocks by timing a round trip' },
      ' — then ',
      { b: 'disciplines the local one towards its selected time sources.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'a tiny UDP exchange' },
      { k: 'Port', v: '123', note: 'UDP' },
      { k: 'Accuracy', v: 'Path-dependent', note: 'sub-ms on a fast LAN; often tens of ms remotely' },
      { k: 'Hierarchy', v: 'Strata', note: '0 is the reference clock' },
    ],
    diagram: {
      caption: 'Four timestamps are enough to find the offset',
      exchange: {
        lanes: { left: 'Client', right: 'Time server' },
        messages: [
          {
            label: 'Request — carrying T1, when it left',
            dir: 'right',
            card: {
              quote: 'T1 = the client’s clock at transmit',
              gloss: ['The server notes T2 on arrival and T3 as it replies'],
            },
          },
          {
            label: 'Reply — carrying T1, T2 and T3',
            dir: 'left',
            card: {
              tone: 'b',
              quote: 'The client records T4 on arrival — four timestamps in hand',
              rows: [
                { k: 'Round trip', v: '(T4−T1) − (T3−T2)' },
                { k: 'Offset', v: '((T2−T1) + (T3−T4)) / 2' },
              ],
            },
          },
          {
            label: 'Steer, don’t jump',
            dir: 'both',
            card: {
              tone: 'plain',
              quote: 'Small offsets are corrected by slewing the clock; a large offset may require a step',
            },
          },
        ],
        note: [
          'The arithmetic assumes the path is ',
          { a: 'symmetric in each direction' },
          ' — which is why an asymmetric route quietly costs accuracy. Polling several servers lets a client ',
          { b: 'discard the one that disagrees with the rest.' },
        ],
      },
    },
    steps: [
      { t: 'Stamp and send', d: 'The client records when it sent the request; the server records arrival and departure and returns all three.' },
      { t: 'Compute offset and delay', d: 'Four timestamps give both the round-trip delay and how far the local clock is out.' },
      { t: 'Filter and select', d: 'Several servers are polled; outliers are rejected and the best-agreeing set is combined.' },
      { t: 'Discipline the clock', d: 'Small errors are corrected by slewing the clock’s rate; only a large one is stepped outright.' },
    ],
    beats: {
      kicker: 'Strata and relatives',
      items: [
        { t: 'Stratum 0', d: 'the atomic clock or GPS itself' },
        { t: 'Stratum 1', d: 'a server attached directly to one' },
        { t: 'Stratum 2+', d: 'servers synced to those above' },
        { t: 'SNTP', d: 'the simplified client-only subset' },
        { t: 'PTP', d: 'sub-microsecond, with hardware help' },
        { t: 'NTS', d: 'NTP with authentication, at last' },
      ],
    },
    security: {
      lede: [
        'Time underpins ',
        { a: 'certificate validity, log correlation, Kerberos and one-time codes' },
        ' — so an attacker who can ',
        { b: 'move your clock can break all of them at once.' },
      ],
      points: [
        { t: 'Amplification', d: 'The old monlist command returned huge replies to tiny spoofed queries — a classic DDoS vector.' },
        { t: 'Time-shifting attacks', d: 'Push a clock forward and expired certificates become valid; push it back and revocation is undone.' },
        { t: 'Use NTS', d: 'Network Time Security authenticates the server, closing the gap plain NTP leaves wide open.' },
        { t: 'Poll several sources', d: 'Multiple independent servers let the client outvote one that has been tampered with.' },
        { t: 'Restrict your server', d: 'Answer queries, but disable remote configuration and status commands entirely.' },
        { t: 'Kerberos depends on it', d: 'Five minutes of skew and domain authentication simply stops working.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'NTP', on: true }],
    ridesNote:
      'Deliberately a single small datagram each way — anything heavier would add delay and spoil the measurement.',
    aside: {
      kind: 'pair',
      title: 'Timestamps & strata',
      tables: [
        {
          head: 'The four times',
          rows: [
            { k: 'T1', v: 'client sends', ink: 'a' },
            { k: 'T2', v: 'server receives', ink: 'b' },
            { k: 'T3', v: 'server replies', ink: 'b' },
            { k: 'T4', v: 'client receives', ink: 'a' },
          ],
        },
        {
          head: 'Strata',
          rows: [
            { k: '0', v: 'reference clock' },
            { k: '1', v: 'directly attached' },
            { k: '2 – 15', v: 'each step down' },
            { k: '16', v: 'unsynchronised' },
          ],
        },
      ],
    },
    footnote:
      'Nothing notices NTP until it fails — and then certificates, logins and logs all fail together.',
  },

  snmp: {
    crumb: 'Time & Management',
    kicker: 'Layer 7 · Management · asking devices how they are',
    title: 'SNMP',
    sub: 'Simple Network Management Protocol',
    lede: [
      'SNMP is ',
      { i: 'how a monitoring system knows anything.' },
      ' Every managed device exposes ',
      { a: 'a tree of numbered values — interface counters, temperature, uptime' },
      ' — which a manager ',
      { a: 'polls on a schedule' },
      ', and the device ',
      { b: 'sends a trap of its own accord when something goes wrong.' },
    ],
    takeaway: [
      'SNMP exposes a device’s state as ',
      { a: 'a numbered tree that a manager polls' },
      ' — and lets the device ',
      { b: 'shout a trap when it cannot wait to be asked.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'over UDP' },
      { k: 'Ports', v: '161 · 162', note: 'polls · traps' },
      { k: 'Data model', v: 'MIB / OID', note: 'a numbered tree' },
      { k: 'Version', v: 'v3', note: 'the only secure one' },
    ],
    diagram: {
      caption: 'An OID is a path down the management tree',
      anatomy: {
        specimen: { a: '1.3.6.1.2.1', sep: '.', b: '2.2.1.10.3' },
        halves: [
          { kicker: 'The prefix', t: 'mib-2', d: 'the standard tree everyone implements' },
          { kicker: 'The rest', t: 'ifInOctets.3', d: 'bytes received on interface 3' },
        ],
        note: [
          'A MIB file is just a dictionary translating those numbers into names — the wire only ever carries ',
          { m: '1.3.6.1.2.1.2.2.1.10.3' },
          '.',
        ],
      },
      dialog: {
        label: 'The handful of operations',
        rows: [
          { who: 'M →', tone: 'a', text: 'GET 1.3.6.1.2.1.1.3.0 — what is your uptime?' },
          { who: 'D ←', tone: 'b', text: 'RESPONSE — 42 days, 06:11:23' },
          { who: 'M →', tone: 'a', text: 'GETNEXT / GETBULK — walk the whole interface table' },
          { who: 'M →', tone: 'a', text: 'SET — change a value, if you are permitted' },
          { who: 'D ←', tone: 'b', text: 'TRAP on 162 — “interface 3 just went down”' },
        ],
      },
      note: [
        'Polling gives you ',
        { a: 'a graph over time' },
        '; traps give you ',
        { b: 'the moment something changed' },
        '. Most monitoring uses both — the poll for trends, the trap for the alert.',
      ],
    },
    steps: [
      { t: 'Expose a MIB', d: 'The device publishes its state as a tree of OIDs — counters, gauges, strings and tables.' },
      { t: 'Poll on a schedule', d: 'The manager GETs specific OIDs, or walks a table with GETNEXT and GETBULK, every minute or so.' },
      { t: 'Graph the deltas', d: 'Counters only ever increase; the monitoring system subtracts successive polls to get a rate.' },
      { t: 'Receive traps', d: 'The device sends an unsolicited trap or inform to port 162 when a threshold or link state changes.' },
    ],
    beats: {
      kicker: 'Three versions, one choice',
      items: [
        { t: 'v1', d: 'community string, plaintext' },
        { t: 'v2c', d: 'faster, still plaintext' },
        { t: 'v3', d: 'users, auth and encryption' },
      ],
    },
    security: {
      lede: [
        'SNMP v1 and v2c authenticate with ',
        { a: 'a single shared string sent in the clear' },
        ' — and the default is famously ',
        { m: 'public' },
        ', which makes an unhardened device ',
        { b: 'an open book and sometimes an open door.' },
      ],
      points: [
        { t: 'Community strings', d: 'v1/v2c send them unencrypted; anyone on the path reads them and can then poll at will.' },
        { t: 'Default “public”', d: 'Scanners sweep for it constantly — one hit maps a device’s interfaces, routes and neighbours.' },
        { t: 'Write access is worse', d: 'A writable community string lets an attacker reconfigure the device, not merely read it.' },
        { t: 'Use v3 only', d: 'Per-user authentication with SHA and encryption with AES — there is no reason to run anything else.' },
        { t: 'Amplification', d: 'A small GETBULK can return a very large response, which has been used to reflect DDoS traffic.' },
        { t: 'Restrict by source', d: 'Only the monitoring system should be able to reach 161 at all — enforce it on the device and the firewall.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP' }, { t: 'SNMP', on: true }],
    ridesNote:
      'UDP keeps polling thousands of devices cheap — and is why a trap that goes missing is simply never noticed.',
    aside: {
      kind: 'pair',
      title: 'Operations & versions',
      tables: [
        {
          head: 'Operations',
          rows: [
            { k: 'GET', v: 'one value', ink: 'a' },
            { k: 'GETNEXT', v: 'walk the tree', ink: 'a' },
            { k: 'GETBULK', v: 'a table at once', ink: 'a' },
            { k: 'SET / TRAP', v: 'change / alert', ink: 'b' },
          ],
        },
        {
          head: 'Security',
          rows: [
            { k: 'v1 / v2c', v: 'community, clear' },
            { k: 'v3 noAuth', v: 'still no' },
            { k: 'v3 authNoPriv', v: 'signed only' },
            { k: 'v3 authPriv', v: 'the right answer' },
          ],
        },
      ],
    },
    footnote:
      'The S has never been the accurate letter — but the tree of counters behind it runs every network graph you have seen.',
  },

  syslog: {
    crumb: 'Time & Management',
    kicker: 'Layer 7 · Management · every device’s log, in one place',
    title: 'Syslog',
    sub: 'Event logging',
    lede: [
      'Syslog is ',
      { i: 'the oldest and most universal way to say what just happened.' },
      ' A device ',
      { a: 'emits a one-line message tagged with a facility and a severity' },
      ', and ',
      { a: 'ships it to a central collector' },
      ' — so that ',
      { b: 'the evidence lives somewhere the compromised machine cannot reach.' },
    ],
    takeaway: [
      'Syslog sends ',
      { a: 'one line per event, tagged by facility and severity' },
      ', to a collector — ',
      { b: 'off the box, where it can still be trusted.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'one line per event' },
      { k: 'Ports', v: '514 · 6514', note: 'UDP/TCP · TLS' },
      { k: 'Severity', v: '0 – 7', note: 'emergency to debug' },
      { k: 'Modern form', v: 'RFC 5424', note: 'structured data' },
    ],
    diagram: {
      caption: 'What a single log line actually contains',
      header: {
        label: 'An RFC 5424 message, field by field',
        rows: [
          [
            { t: '<34>', w: 70, small: true, hi: true },
            { t: '1', w: 40, small: true, faint: true },
            { t: '2026-08-14T21:04:11Z', small: true, alt: true },
            { t: 'fw-edge-01', w: 120, small: true },
          ],
          [
            { t: 'sshd', w: 90, small: true },
            { t: '4021', w: 70, small: true, faint: true },
            { t: 'MSGID', w: 90, small: true, faint: true },
            { t: '[origin ip="203.0.113.9"] structured data', small: true },
          ],
          [{ t: 'Failed password for invalid user admin from 203.0.113.9' }],
        ],
        note: [
          'The leading ',
          { a: 'priority' },
          ' packs two numbers into one: facility × 8 + severity. ',
          { m: '<34>' },
          ' is facility 4 (auth) at severity 2 (critical) — which is how a collector routes and alerts ',
          { b: 'before it has parsed a word of the message.' },
        ],
      },
    },
    steps: [
      { t: 'Tag the event', d: 'The program picks a facility — auth, mail, kern, local0–7 — and a severity from 0 to 7.' },
      { t: 'Format the line', d: 'Priority, timestamp, hostname, application and the message itself; RFC 5424 adds structured key/value data.' },
      { t: 'Ship it off the box', d: 'Sent to a collector over UDP, TCP or TLS — so it survives the machine that produced it.' },
      { t: 'Filter, store, alert', d: 'The collector routes by facility and severity into storage, and raises alerts on what matters.' },
    ],
    beats: {
      kicker: 'The severities',
      items: [
        { t: '0 – 1', d: 'emergency, alert — wake someone' },
        { t: '2 – 3', d: 'critical, error — act today' },
        { t: '4 – 5', d: 'warning, notice — worth reading' },
        { t: '6 – 7', d: 'info, debug — volume lives here' },
        { t: 'Facilities', d: 'auth, kern, mail, daemon, local0–7' },
        { t: 'RFC 5424', d: 'structured data, proper timestamps' },
      ],
    },
    security: {
      lede: [
        'Logs are ',
        { a: 'the evidence an investigation depends on' },
        ' — which makes them the first thing an intruder edits, and why ',
        { b: 'plain UDP syslog can be both forged and silently dropped.' },
      ],
      points: [
        { t: 'Ship them off the host', d: 'A local log on a compromised box is worth little; a copy on a collector is what survives.' },
        { t: 'UDP loses messages', d: 'No delivery guarantee at all — under load or attack, the interesting lines are the ones that vanish.' },
        { t: 'Forgery is trivial', d: 'Anything can send a syslog packet claiming any hostname; use TLS on 6514 to authenticate senders.' },
        { t: 'No confidentiality', d: 'Messages routinely contain usernames, IPs and paths, in clear text over the network by default.' },
        { t: 'Clocks must agree', d: 'Correlating events across devices is impossible if their timestamps disagree — NTP first.' },
        { t: 'Retention and integrity', d: 'Write-once storage and defined retention are what make logs admissible rather than merely present.' },
      ],
    },
    rides: [{ t: 'IP' }, { t: 'UDP / TCP / TLS' }, { t: 'Syslog', on: true }],
    ridesNote:
      'UDP 514 is the traditional default and the least reliable; TCP keeps the messages, and TLS on 6514 also proves who sent them.',
    aside: {
      kind: 'pair',
      title: 'Severities & transports',
      tables: [
        {
          head: 'Severity',
          rows: [
            { k: '0 emerg', v: 'system unusable', ink: 'a' },
            { k: '2 crit', v: 'critical', ink: 'a' },
            { k: '4 warning', v: 'worth a look' },
            { k: '7 debug', v: 'noise, mostly' },
          ],
        },
        {
          head: 'Transports',
          rows: [
            { k: '514/udp', v: 'lossy default' },
            { k: '514/tcp', v: 'reliable' },
            { k: '6514/tls', v: 'authenticated' },
            { k: 'RELP', v: 'guaranteed' },
          ],
        },
      ],
    },
    footnote:
      'Written at Berkeley in the 1980s with no specification at all — and still what almost every device logs with.',
  },
};
