/* The long-form content of each device's own page, ported from the sixteen
   `Device *.dc.html` pages in the Claude Design project.

   Every page answers the same things in the same order — the standfirst, the one
   line to keep, four key points, the diagram, four steps, six security notes and
   a footnote — so the reader learns the page once and afterwards only reads the
   differences. The wording is the design's own.

   The catalogue facts a device shares with the index and the bench (layer, one
   line summary, which protocols it runs, what it sits beside) live in
   device-data.ts; this file holds only what belongs to the page. */

import type { DiagramSpec } from '@/components/DeviceDiagram';
import type { Rich } from '@/components/RichText';

export type DevicePage = {
  /** the middle crumb — the layer band, as the design writes it */
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
  diagram: DiagramSpec;
  /** what the box does, in the order it does it */
  steps: { t: string; d: string }[];
  security: { lede: Rich; points: { t: string; d: string }[] };
  /** the line set against the right of the footer rule */
  footnote: string;
};

export const devicePages: Record<string, DevicePage> = {
  modem: {
    crumb: 'Layer 1 — Physical',
    kicker: 'Layer 1 · Physical device',
    title: 'Modem',
    sub: 'the modulator–demodulator',
    lede: [
      'A modem ',
      { i: 'converts digital data into a signal a phone, cable or fibre line can carry — and back again.' },
      ' It ',
      { a: 'modulates outgoing bits onto the line' },
      ', ',
      { a: 'demodulates the incoming signal into bits' },
      ', and ',
      { b: 'connects your network to the ISP' },
      ' — the translator at the edge of the wire.',
    ],
    takeaway: [
      'A modem ',
      { a: 'turns digital data into a line signal and back' },
      ', ',
      { b: 'linking your network to the ISP.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 1', note: 'Physical' },
      { k: 'Converts', v: 'Digital ↔ line', note: 'the medium’s signal' },
      { k: 'Connects', v: 'You ↔ ISP', note: 'the last mile' },
      { k: 'Pairs with', v: 'A router', note: 'for the LAN' },
    ],
    diagram: {
      caption: 'Digital on one side, the line signal on the other',
      left: { title: 'Your router / LAN', sub: 'digital bits', tag: 'your side' },
      inLabel: 'bits',
      device: { name: 'Modem', line1: 'modulate ⇄', line2: 'demodulate' },
      outLabel: 'line signal',
      right: { title: 'The ISP line', sub: 'cable / DSL / fibre', tag: 'the last mile' },
      table: {
        label: 'Both directions across the line',
        rows: [
          { l: 'outgoing bits', r: '→ modulated onto the line' },
          { l: 'incoming signal ← the return', r: '→ demodulated to bits', hi: true },
        ],
      },
      note: [
        'Your data is digital, but the line carries an analog or line-coded signal. The modem ',
        { a: 'modulates outgoing bits onto it' },
        ' and demodulates the return — the bridge between your network and the ISP.',
      ],
    },
    steps: [
      { t: 'Take digital data', d: 'It receives bits from the router on the local side.' },
      { t: 'Modulate onto the line', d: 'It encodes those bits as the signal the medium carries.' },
      { t: 'Demodulate the return', d: 'Incoming line signals are decoded back into bits.' },
      { t: 'Hand off to the router', d: 'The recovered data goes to the router, which forwards it to the LAN.' },
    ],
    security: {
      lede: [
        'The modem is ',
        { a: 'the physical entry point' },
        ' from the ISP, so it’s ',
        { b: 'the first thing exposed to the outside.' },
      ],
      points: [
        { t: 'Exposed to the WAN', d: 'It faces the public line directly, before any LAN protection.' },
        { t: 'Firmware updates', d: 'Usually ISP-managed, but often neglected and vulnerable.' },
        { t: 'Bridge vs router mode', d: 'In bridge mode a firewall must sit directly behind it.' },
        { t: 'Default credentials', d: 'Change any local admin login it ships with.' },
        { t: 'Physical tampering', d: 'Line taps happen at the point of entry.' },
        { t: 'Pair with a firewall', d: 'Never expose the LAN raw to the modem.' },
      ],
    },
    footnote: 'Home “modem-routers” are two devices in one box — a modem and a router combined.',
  },

  hub: {
    crumb: 'Layer 1 — Physical',
    kicker: 'Layer 1 · Physical device',
    title: 'Hub',
    sub: 'the Ethernet hub',
    lede: [
      'A hub is the simplest way to join computers: it ',
      { i: 'repeats every bit it receives out of every other port.' },
      ' It ',
      { a: 'makes no decisions' },
      ', ',
      { a: 'reads no addresses' },
      ', and ',
      { b: 'puts every host on one shared segment' },
      ' — the switch’s obsolete ancestor.',
    ],
    takeaway: [
      'A hub ',
      { a: 'copies every signal to every port' },
      ' — ',
      { b: 'so all devices share one collision domain.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 1', note: 'Physical' },
      { k: 'Forwards by', v: 'Nothing', note: 'repeats blindly' },
      { k: 'Domain', v: 'One shared', note: 'collision domain' },
      { k: 'Status', v: 'Obsolete', note: 'replaced by switches' },
    ],
    diagram: {
      caption: 'One signal in, the same signal out every port',
      left: { title: 'A sender', sub: 'one host talks', tag: 'on the segment' },
      inLabel: 'bits in · port 1',
      device: { name: 'Hub', line1: 'repeats every bit', line2: 'to every port' },
      outLabel: 'same bits out ×N',
      right: { title: 'Everyone else', sub: 'all ports', tag: 'get a copy' },
      table: {
        label: 'One port in, all ports out',
        rows: [
          { l: 'Port 1 (the sender)', r: 'in' },
          { l: 'Ports 2 · 3 · 4 ← all at once', r: 'out', hi: true },
        ],
      },
      note: [
        'A hub can’t tell devices apart, so one host talking means ',
        { a: 'every other port receives it' },
        ' — and if two talk at once their signals collide and both must resend.',
      ],
    },
    steps: [
      { t: 'Receive bits on a port', d: 'An incoming signal arrives on one of the ports.' },
      { t: 'Regenerate the signal', d: 'It cleans and repeats the raw electrical signal — no framing, no addresses.' },
      { t: 'Repeat to every port', d: 'The same signal goes out of all the other ports simultaneously.' },
      { t: 'Collisions happen', d: 'If two hosts send at once the signals corrupt; CSMA/CD makes both back off and retry.' },
    ],
    security: {
      lede: [
        'Because every port sees every frame, a hub ',
        { a: 'has no privacy' },
        ' and is ',
        { b: 'a sniffer’s dream.' },
      ],
      points: [
        { t: 'Trivial eavesdropping', d: 'Any port can read all traffic on the segment — no effort required.' },
        { t: 'No segmentation', d: 'Everyone shares one broadcast and collision domain.' },
        { t: 'Denial by collision', d: 'The shared segment is easy to flood or jam.' },
        { t: 'No access control', d: 'Nothing authenticates a device before it joins.' },
        { t: 'Replaced for a reason', d: 'Switches fix every one of these problems.' },
        { t: 'A legacy risk', d: 'A forgotten hub is a ready-made covert tap point.' },
      ],
    },
    footnote:
      'Hubs are effectively extinct in new builds — you meet them mainly in old kit and exam questions.',
  },

  repeater: {
    crumb: 'Layer 1 — Physical',
    kicker: 'Layer 1 · Physical device',
    title: 'Repeater',
    sub: 'the signal repeater',
    lede: [
      'A repeater ',
      { i: 'regenerates a weakening signal so a link can run farther than its medium allows.' },
      ' It ',
      { a: 'receives the degraded signal' },
      ', ',
      { a: 'cleans and amplifies it' },
      ', and ',
      { b: 'sends a fresh copy down the next segment' },
      ' — distance, bought one hop at a time.',
    ],
    takeaway: [
      'A repeater ',
      { a: 'rebuilds a fading signal' },
      ' so a cable or wireless link can ',
      { b: 'reach past its normal limit.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 1', note: 'Physical' },
      { k: 'Works on', v: 'The signal', note: 'not the data' },
      { k: 'Adds', v: 'Distance', note: 'beyond medium limit' },
      { k: 'Reads', v: 'Nothing', note: 'no addresses' },
    ],
    diagram: {
      caption: 'A tired signal in, a fresh one out',
      left: { title: 'Arriving signal', sub: 'weak & faded', tag: 'end of the run' },
      inLabel: 'degraded',
      device: { name: 'Repeater', line1: 'clean up', line2: 'and amplify' },
      outLabel: 'regenerated',
      right: { title: 'Leaving signal', sub: 'full strength', tag: 'next segment' },
      note: [
        'Every medium fades over distance. The repeater listens, reconstructs the clean waveform, and drives a ',
        { a: 'fresh copy' },
        ' onward — extending reach without ever touching the data it carries.',
      ],
    },
    steps: [
      { t: 'Receive the weak signal', d: 'The faded incoming signal reaches the end of its usable run.' },
      { t: 'Reconstruct the waveform', d: 'It regenerates the clean signal shape, removing accumulated noise.' },
      { t: 'Amplify to full strength', d: 'The signal is boosted back to its original level.' },
      { t: 'Transmit onward', d: 'A fresh copy is driven down the next segment of the link.' },
    ],
    security: {
      lede: [
        'A repeater is blind to content, so it ',
        { a: 'adds no protection' },
        ' — but its placement ',
        { b: 'can extend a network into the wrong hands.' },
      ],
      points: [
        { t: 'No inspection', d: 'It passes whatever it hears, attack traffic included.' },
        { t: 'No segmentation', d: 'It simply extends one collision and broadcast domain.' },
        { t: 'Physical reach', d: 'Extending a link into an unsecured area exposes it.' },
        { t: 'Wireless range', d: 'A rogue wireless repeater widens the attack surface.' },
        { t: 'A possible tap point', d: 'An inline repeater could be swapped for a tap.' },
        { t: 'Defence in depth', d: 'Put real filtering at L2/L3 — never rely on the repeater.' },
      ],
    },
    footnote: 'A Wi-Fi “extender” is a repeater by another name — the same job, over the air.',
  },

  nic: {
    crumb: 'Layer 2 — Data Link',
    kicker: 'Layer 2 · Data-link device',
    title: 'NIC',
    sub: 'the network interface card',
    lede: [
      'A NIC is ',
      { i: 'the hardware that connects one computer to the network.' },
      ' It ',
      { a: 'carries the host’s burned-in MAC address' },
      ', ',
      { a: 'wraps outgoing data into frames' },
      ', and ',
      { b: 'puts the bits onto the wire' },
      ' — a machine’s one physical door onto the network.',
    ],
    takeaway: [
      'A NIC is a computer’s ',
      { a: 'door onto the network' },
      ', identified by its ',
      { b: 'unique MAC address.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 2', note: 'Data Link' },
      { k: 'Addressed by', v: 'MAC address', note: '48-bit, burned in' },
      { k: 'Its job', v: 'Frames', note: 'bits ↔ the wire' },
      { k: 'Found in', v: 'Every host', note: 'wired & wireless' },
    ],
    diagram: {
      caption: 'The bridge between the computer and the wire',
      left: { title: 'The computer', sub: 'apps & OS', tag: 'has data to send' },
      inLabel: 'raw data',
      device: {
        name: 'NIC',
        line1: 'frames the data',
        line2: 'and stamps its MAC',
        badge: '00:1A:2B:3C:4D:5E',
      },
      outLabel: 'frames on the wire',
      right: { title: 'The network', sub: 'switch & other hosts', tag: 'the shared medium' },
      frame: {
        label: 'Every frame the NIC sends carries its address',
        cells: [
          { k: 'Dest MAC', v: 'where it’s going' },
          { k: 'Src MAC ← this NIC', v: '00:1A:2B:3C:4D:5E', hi: true },
          { k: 'Payload', v: 'the actual data', grow: 1.4 },
        ],
      },
      note: [
        'The computer hands raw data to the NIC. The NIC wraps it in a frame stamped with its own ',
        { a: 'MAC address' },
        ' and signals it onto the wire — and, coming back, it keeps only the frames addressed to that MAC.',
      ],
    },
    steps: [
      { t: 'Take data from the OS', d: 'The operating system hands the NIC a block of data to send.' },
      { t: 'Wrap it in a frame', d: 'The NIC builds an Ethernet frame — destination MAC, its own MAC as the source, then the payload.' },
      { t: 'Signal onto the wire', d: 'The frame is turned into electrical, optical or radio signals and put on the medium.' },
      { t: 'Filter what comes back', d: 'Incoming frames are read, and only those addressed to this MAC (or to a broadcast) go up to the OS.' },
    ],
    security: {
      lede: [
        'The NIC is where a host meets the wire, so it’s both a ',
        { a: 'hardware identity' },
        ' to trust — and a layer an attacker can ',
        { b: 'forge or eavesdrop on.' },
      ],
      points: [
        { t: 'MAC spoofing', d: 'A MAC address can be changed in software, so it proves nothing on its own.' },
        { t: 'Promiscuous mode', d: 'A NIC told to keep every frame, not just its own, is how sniffing starts.' },
        { t: 'MAC filtering', d: 'Allow-lists by MAC are a weak control — easily defeated by spoofing.' },
        { t: 'Network access control', d: '802.1X authenticates the host at the port before the NIC gets to talk.' },
        { t: 'Device fingerprinting', d: 'The MAC’s first three bytes name the vendor, which leaks what the device is.' },
        { t: 'The first hop', d: 'Everything a host sends or receives passes through it — a worthwhile place to monitor.' },
      ],
    },
    footnote: 'A NIC may be a card, a chip on the board, or a USB dongle — the role is the same.',
  },

  switch: {
    crumb: 'Layer 2 — Data Link',
    kicker: 'Layer 2 · Data-link device',
    title: 'Switch',
    sub: 'the LAN switch',
    lede: [
      'A switch is the box that ',
      { i: 'forwards frames inside a single network.' },
      ' It ',
      { a: 'reads the destination MAC address' },
      ', ',
      { a: 'looks it up in its MAC table' },
      ', and ',
      { b: 'sends the frame out only the right port' },
      ' — the wiring hub of a modern LAN.',
    ],
    takeaway: [
      'A switch ',
      { a: 'connects many devices on one network' },
      ' and ',
      { b: 'sends each frame only to the port that needs it.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 2', note: 'Data Link' },
      { k: 'Forwards by', v: 'MAC address', note: 'exact match' },
      { k: 'Learns', v: 'A MAC table', note: 'port ↔ address' },
      { k: 'Typical use', v: 'Every LAN', note: 'access & core' },
    ],
    diagram: {
      caption: 'One network, many ports — each frame to the right one',
      left: { title: 'Laptop A', sub: 'aa:aa:aa', tag: 'on the LAN' },
      inLabel: 'frame in · port 1',
      device: { name: 'Switch', line1: 'forwards by MAC', line2: 'to one port only' },
      outLabel: 'frame out · port 3',
      right: { title: 'Laptop B', sub: 'bb:bb:bb', tag: 'also on the LAN' },
      table: {
        label: 'The switch’s MAC address table',
        rows: [
          { l: 'aa:aa:aa:11:11:11', r: 'port 1' },
          { l: 'bb:bb:bb:22:22:22 ← match', r: 'port 3', hi: true },
          { l: 'cc:cc:cc:33:33:33', r: 'port 5' },
        ],
      },
      note: [
        'A frame from Laptop A addressed to Laptop B (bb:bb:bb) comes in on port 1. The switch finds that MAC on port 3 and sends the frame out ',
        { a: 'only that port' },
        ' — no other device sees it.',
      ],
    },
    steps: [
      { t: 'Read the frame', d: 'A frame arrives; the switch reads its destination MAC address.' },
      { t: 'Look up the port', d: 'It checks its MAC table for that address. If it isn’t there yet, it floods the frame out every port.' },
      { t: 'Learn the source', d: 'It records the source MAC against the port the frame came in on, filling the table over time.' },
      { t: 'Forward to one port', d: 'It sends the frame out only the matching port — full-duplex, so no collisions.' },
    ],
    security: {
      lede: [
        'A switch decides who can talk to whom on the LAN, so it’s ',
        { a: 'a control point' },
        ' — and a target for ',
        { b: 'attacks that fool its table.' },
      ],
      points: [
        { t: 'MAC flooding', d: 'Overflow the table and a switch fails open, flooding traffic like a hub — port security stops it.' },
        { t: 'VLAN segmentation', d: 'Split the LAN into separate broadcast domains so groups can’t reach each other.' },
        { t: 'Port security', d: 'Limit how many MACs a port accepts and shut it on violation.' },
        { t: '802.1X', d: 'Make a device authenticate before its port carries any traffic.' },
        { t: 'DHCP snooping & DAI', d: 'Block rogue DHCP servers and ARP spoofing at the switch.' },
        { t: 'Port mirroring', d: 'A SPAN port copies traffic to an IDS so it can be watched.' },
      ],
    },
    footnote: 'The switch is the quiet workhorse of the LAN — one hangs behind almost every wall port.',
  },

  bridge: {
    crumb: 'Layer 2 — Data Link',
    kicker: 'Layer 2 · Data-link device',
    title: 'Bridge',
    sub: 'the network bridge',
    lede: [
      'A bridge ',
      { i: 'joins two network segments into one.' },
      ' It ',
      { a: 'reads the MAC address on each frame' },
      ', ',
      { a: 'learns which segment every host lives on' },
      ', and ',
      { b: 'only forwards frames that need to cross' },
      ' — the switch’s two-port ancestor.',
    ],
    takeaway: [
      'A bridge ',
      { a: 'connects two segments' },
      ' and ',
      { b: 'forwards a frame across only when it has to.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 2', note: 'Data Link' },
      { k: 'Forwards by', v: 'MAC address', note: 'learned table' },
      { k: 'Ports', v: 'Usually two', note: 'segment A ↔ B' },
      { k: 'Filters', v: 'Local traffic', note: 'keeps it local' },
    ],
    diagram: {
      caption: 'Two segments, joined but not merged',
      left: { title: 'Segment A', sub: 'hosts on side A', tag: 'one domain' },
      inLabel: 'frame arrives',
      device: { name: 'Bridge', line1: 'learns both sides', line2: 'forwards only across' },
      outLabel: 'only if it must cross',
      right: { title: 'Segment B', sub: 'hosts on side B', tag: 'the other domain' },
      table: {
        label: 'What crosses, what stays',
        rows: [
          { l: 'destination on Segment A', r: 'kept local — filtered' },
          { l: 'destination on Segment B ← match', r: 'forwarded across', hi: true },
        ],
      },
      note: [
        'The bridge learns which hosts sit on each side. Traffic staying on one segment it ',
        { a: 'leaves alone' },
        '; only frames crossing between A and B are forwarded — keeping each side quiet.',
      ],
    },
    steps: [
      { t: 'Read the frame’s MACs', d: 'It reads the source and destination MAC addresses.' },
      { t: 'Learn the source’s side', d: 'It records which segment the sender is on.' },
      { t: 'Decide: local or cross?', d: 'It checks whether the destination is on the same segment or the other one.' },
      { t: 'Forward or filter', d: 'Crossing traffic passes through; purely local traffic is dropped, keeping segments separate.' },
    ],
    security: {
      lede: [
        'A bridge ',
        { a: 'contains local traffic' },
        ', giving a little isolation — but ',
        { b: 'it trusts MAC addresses it can’t verify.' },
      ],
      points: [
        { t: 'Traffic containment', d: 'Keeps local frames off the far segment, reducing exposure.' },
        { t: 'MAC spoofing', d: 'A forged source address poisons the learned table.' },
        { t: 'Loop risk', d: 'Bridged loops need Spanning Tree or they storm the network.' },
        { t: 'Limited filtering', d: 'No awareness of IP, ports or application data.' },
        { t: 'A segmentation aid', d: 'Isolates noisy or sensitive groups of hosts.' },
        { t: 'Largely superseded', d: 'Multiport switches do this at scale today.' },
      ],
    },
    footnote: 'A modern switch is essentially a bridge with many ports and dedicated hardware.',
  },

  'access-point': {
    crumb: 'Layer 2 — Data Link',
    kicker: 'Layer 2 · Data-link device',
    title: 'Access Point',
    sub: 'the wireless AP',
    lede: [
      'An access point ',
      { i: 'bridges Wi-Fi clients onto the wired LAN.' },
      ' It ',
      { a: 'speaks 802.11 over the air' },
      ', ',
      { a: 'translates frames to and from Ethernet' },
      ', and ',
      { b: 'lets wireless devices join the same network as wired ones' },
      ' — the doorway between radio and cable.',
    ],
    takeaway: [
      'An access point ',
      { a: 'puts Wi-Fi devices onto the wired network' },
      ' by ',
      { b: 'bridging radio frames to Ethernet.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 2', note: 'Data Link' },
      { k: 'Speaks', v: '802.11', note: 'Wi-Fi radio' },
      { k: 'Bridges', v: 'Air ↔ cable', note: 'onto the LAN' },
      { k: 'Secures', v: 'WPA2 / 3', note: 'encryption' },
    ],
    diagram: {
      caption: 'Radio on one side, cable on the other',
      left: { title: 'Wi-Fi client', sub: 'phone / laptop', tag: 'over the air' },
      inLabel: '802.11 · encrypted',
      device: { name: 'Access Point', line1: '802.11 ⇄ Ethernet', line2: 'bridge the two' },
      outLabel: 'Ethernet · to switch',
      right: { title: 'The wired LAN', sub: 'switch & servers', tag: 'on the cable' },
      table: {
        label: 'Air on one side, cable on the other',
        rows: [
          { l: '802.11 frame (encrypted)', r: 'in ← from the air' },
          { l: 'Ethernet frame ← translated', r: 'out → to the switch', hi: true },
        ],
      },
      note: [
        'The client associates over the air and authenticates with WPA. The AP decrypts its 802.11 frames, ',
        { a: 're-wraps them as Ethernet' },
        ', and hands them to the switch — and back again the other way.',
      ],
    },
    steps: [
      { t: 'Associate the client', d: 'A device finds the SSID and joins the wireless network.' },
      { t: 'Authenticate & encrypt', d: 'WPA2/WPA3 establishes keys so the air link is encrypted.' },
      { t: 'Translate the frames', d: 'It converts between 802.11 (radio) and Ethernet (cable) framing.' },
      { t: 'Bridge to the LAN', d: 'It hands the traffic to the wired switch, joining the two networks.' },
    ],
    security: {
      lede: [
        'The AP is the network’s ',
        { a: 'wireless front door' },
        ' — strong encryption keeps it shut, weak config ',
        { b: 'opens it to anyone in range.' },
      ],
      points: [
        { t: 'WPA2 / WPA3', d: 'Encrypt the air; never run open or legacy WEP.' },
        { t: 'Rogue APs', d: 'An unauthorised AP is a backdoor straight onto the LAN.' },
        { t: 'Evil twin', d: 'A fake SSID lures clients to an attacker’s network.' },
        { t: 'Guest isolation', d: 'Put untrusted devices on a separate SSID and VLAN.' },
        { t: '802.1X / RADIUS', d: 'Per-user enterprise authentication instead of one shared key.' },
        { t: 'Signal reach', d: 'Radio leaks past walls — tune power and placement.' },
      ],
    },
    footnote: 'The AP handles the radio; a switch or router still does the forwarding behind it.',
  },

  router: {
    crumb: 'Layer 3 — Network',
    kicker: 'Layer 3 · Network device',
    title: 'Router',
    sub: 'the IP router',
    lede: [
      'A router is the box that decides ',
      { i: 'which network a packet belongs on next.' },
      ' It ',
      { a: 'reads the destination IP address' },
      ', ',
      { a: 'looks it up in a table of known routes' },
      ', and ',
      { b: 'forwards the packet one hop closer' },
      ' — the join between one network and every other.',
    ],
    takeaway: [
      'A router ',
      { a: 'connects two different networks' },
      ' and ',
      { b: 'forwards packets between them by IP address.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3', note: 'Network' },
      { k: 'Forwards by', v: 'IP address', note: 'Longest-prefix match' },
      { k: 'Boundary', v: 'Separates', note: 'broadcast domains' },
      { k: 'Typical use', v: 'The edge', note: 'home, office, ISP core' },
    ],
    diagram: {
      caption: 'Two different networks, joined by one router',
      left: { title: 'Your laptop', sub: '10.0.0.9', tag: 'Network A · 10.0.0.0/24' },
      inLabel: 'packet out',
      inPort: 'eth0',
      device: {
        name: 'Router',
        line1: 'sits on both networks',
        line2: 'and passes traffic between them',
      },
      outLabel: 'packet in',
      outPort: 'eth1',
      right: { title: 'A server', sub: '203.0.113.5', tag: 'Network B · 203.0.113.0/24' },
      table: {
        label: 'How the router decides where it goes',
        rows: [
          { l: '10.0.0.0/24 (Network A)', r: 'out eth0' },
          { l: '203.0.113.0/24 ← match', r: 'out eth1', hi: true },
          { l: '0.0.0.0/0 (everything else)', r: 'out eth1' },
        ],
      },
      note: [
        'The laptop on Network A can’t reach the server on Network B directly — they’re on different networks. The router sits on both, matches the destination ',
        { a: '203.0.113.5' },
        ' to Network B, and forwards it out eth1.',
      ],
    },
    steps: [
      { t: 'Read the destination', d: 'A frame arrives; the router strips the L2 header and reads the destination IP inside the packet.' },
      { t: 'Look up the route', d: 'It finds the most specific matching prefix in its routing table — the longest-prefix match — to pick an egress interface.' },
      { t: 'Decrement & rewrite', d: 'It drops the TTL by one (killing loops), then wraps the packet in a fresh L2 frame for the next hop.' },
      { t: 'Forward one hop', d: 'Out it goes on the chosen interface. Routing protocols like OSPF and BGP keep the table current in the background.' },
    ],
    security: {
      lede: [
        'Because every packet between networks passes through it, the router is the network’s ',
        { a: 'first line of defence' },
        ' — and, if left open, its ',
        { b: 'first way in.' },
      ],
      points: [
        { t: 'The gatekeeper', d: 'Access-control lists let it drop or allow traffic by IP and port before it ever reaches the LAN.' },
        { t: 'Hides the inside', d: 'NAT masks every internal address behind one public IP, so hosts aren’t directly reachable from outside.' },
        { t: 'Segments the blast radius', d: 'Routing between subnets keeps a breach in one segment from spreading freely across the whole network.' },
        { t: 'A prime target', d: 'Default passwords and stale firmware turn a router into an easy foothold — patch it and change the credentials.' },
        { t: 'Where you watch', d: 'Its logs and flow records are the vantage point for spotting scans, exfiltration and odd traffic patterns.' },
        { t: 'The VPN edge', d: 'It terminates encrypted tunnels, letting remote sites and workers join the network over a trusted link.' },
      ],
    },
    footnote: 'Layer assignments are the classic teaching model — modern routers also filter, NAT and tunnel.',
  },

  'layer-3-switch': {
    crumb: 'Layer 2 / 3',
    kicker: 'Layer 2 / 3 · Multilayer device',
    title: 'Layer-3 Switch',
    sub: 'the multilayer switch',
    lede: [
      'A layer-3 switch ',
      { i: 'switches frames at wire speed and routes between VLANs like a router.' },
      ' It ',
      { a: 'forwards locally by MAC' },
      ', ',
      { a: 'routes between subnets by IP' },
      ', and ',
      { b: 'does both in hardware' },
      ' — the campus network’s workhorse.',
    ],
    takeaway: [
      'A layer-3 switch ',
      { a: 'switches within VLANs and routes between them' },
      ' — ',
      { b: 'routing at switching speed.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 2 & 3', note: 'switch + router' },
      { k: 'Forwards by', v: 'MAC or IP', note: 'whichever fits' },
      { k: 'Speed', v: 'Hardware', note: 'wire-speed routing' },
      { k: 'Typical use', v: 'Campus core', note: 'inter-VLAN' },
    ],
    diagram: {
      caption: 'Switching inside a VLAN, routing between them',
      left: { title: 'VLAN 10', sub: '10.0.10.0/24', tag: 'one subnet' },
      inLabel: 'frame in',
      device: { name: 'L3 Switch', line1: 'switch + route', line2: 'in silicon' },
      outLabel: 'switched or routed',
      right: { title: 'VLAN 20', sub: '10.0.20.0/24', tag: 'another subnet' },
      table: {
        label: 'Switch it or route it?',
        rows: [
          { l: 'same VLAN', r: 'switch by MAC' },
          { l: 'different VLAN ← match', r: 'route by IP', hi: true },
        ],
      },
      note: [
        'Within a VLAN it behaves as a switch, forwarding by MAC. When traffic must cross VLANs it ',
        { a: 'routes by IP' },
        ' — all in hardware, so there’s no router bottleneck between subnets.',
      ],
    },
    steps: [
      { t: 'Receive the frame', d: 'A frame arrives on one of the ports.' },
      { t: 'Same VLAN? switch it', d: 'If the destination is in the same VLAN, forward by MAC as usual.' },
      { t: 'Different subnet? route it', d: 'If it must cross VLANs, look up the destination IP and pick the egress VLAN.' },
      { t: 'Forward in hardware', d: 'A dedicated ASIC does the lookup and forwarding at line rate.' },
    ],
    security: {
      lede: [
        'It’s a routing choke point inside the campus, so it ',
        { a: 'enforces segmentation' },
        ' — and misconfigured, ',
        { b: 'it can bridge networks that shouldn’t meet.' },
      ],
      points: [
        { t: 'VLAN segmentation', d: 'Separate trust zones cleanly by subnet.' },
        { t: 'Inter-VLAN ACLs', d: 'Filter exactly what is allowed to cross between VLANs.' },
        { t: 'VLAN hopping', d: 'Guard against double-tagging and trunk-negotiation attacks.' },
        { t: 'Control-plane protection', d: 'Secure the routing adjacencies it forms.' },
        { t: 'Management plane', d: 'Lock down administrative access tightly.' },
        { t: 'Consistent policy', d: 'Its rules must match the perimeter router’s.' },
      ],
    },
    footnote: 'Layer-3 switches route inside the campus; a router still handles the edge and the internet.',
  },

  'nat-gateway': {
    crumb: 'Layer 3 — Network',
    kicker: 'Layer 3 · Network device',
    title: 'NAT Gateway',
    sub: 'the address translator',
    lede: [
      'A NAT gateway ',
      { i: 'lets many private hosts share one public IP address.' },
      ' It ',
      { a: 'rewrites the source address of outgoing packets' },
      ', ',
      { a: 'tracks each connection in a table' },
      ', and ',
      { b: 'maps the replies back to the right host' },
      ' — the reason your whole home shares one address.',
    ],
    takeaway: [
      'A NAT gateway ',
      { a: 'hides many private addresses behind one public IP' },
      ' and ',
      { b: 'steers each reply back to its host.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3', note: 'Network' },
      { k: 'Rewrites', v: 'The source', note: 'address + port' },
      { k: 'Maps', v: 'Many → one', note: 'private → public' },
      { k: 'Side effect', v: 'Hides hosts', note: 'from outside' },
    ],
    diagram: {
      caption: 'Many private addresses, one public one',
      left: { title: 'Private LAN', sub: '10.0.0.0/24', tag: 'many hosts' },
      inLabel: 'private source',
      device: { name: 'NAT', line1: 'rewrite source', line2: '+ remember' },
      outLabel: 'public source',
      right: { title: 'The internet', sub: 'sees one address', tag: '203.0.113.7' },
      table: {
        label: 'The translation table',
        rows: [
          { l: '10.0.0.9 : 51000 ← match', r: '203.0.113.7 : 40001', hi: true },
          { l: '10.0.0.12 : 52000', r: '203.0.113.7 : 40002' },
        ],
      },
      note: [
        'Each host’s private address and port are rewritten to the one public IP with a unique port. The gateway ',
        { a: 'remembers the mapping' },
        ', so when a reply arrives it knows exactly which host to hand it back to.',
      ],
    },
    steps: [
      { t: 'Packet leaves the LAN', d: 'A host sends out a packet with its private source address.' },
      { t: 'Rewrite the source', d: 'The gateway swaps in the public IP and a fresh source port.' },
      { t: 'Record the mapping', d: 'It stores private ↔ public in its translation table.' },
      { t: 'Translate the reply', d: 'When the reply returns, it looks up the port and restores the private address.' },
    ],
    security: {
      lede: [
        'NAT ',
        { a: 'hides the internal network' },
        ' as a side effect — useful, but ',
        { b: 'not a firewall on its own.' },
      ],
      points: [
        { t: 'Implicit hiding', d: 'Outside hosts can’t address internal machines directly.' },
        { t: 'Not a firewall', d: 'Add real filtering; NAT enforces no policy by itself.' },
        { t: 'Port-forwarding risk', d: 'Every port you open is a hole punched inward.' },
        { t: 'Connection tracking', d: 'The state table is a target for exhaustion attacks.' },
        { t: 'CGNAT & logging', d: 'Attribution needs port-level logs at scale.' },
        { t: 'Pair with a firewall', d: 'Run NAT and a firewall together, never NAT alone.' },
      ],
    },
    footnote: 'NAT is usually a feature of your router, not a separate box — but the role is distinct.',
  },

  firewall: {
    crumb: 'Layers 3–7',
    kicker: 'Layers 3–7 · Security device',
    title: 'Firewall',
    sub: 'the packet / next-gen firewall',
    lede: [
      'A firewall ',
      { i: 'decides which traffic is allowed to pass and which is blocked.' },
      ' It ',
      { a: 'inspects each packet against a policy' },
      ', ',
      { a: 'tracks the state of every connection' },
      ', and ',
      { b: 'drops anything not explicitly permitted' },
      ' — the network’s rule-keeper.',
    ],
    takeaway: [
      'A firewall ',
      { a: 'checks every packet against a policy' },
      ' and ',
      { b: 'blocks whatever isn’t allowed.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layers 3–7', note: 'packet to app' },
      { k: 'Decides by', v: 'Rules', note: 'allow / deny' },
      { k: 'Tracks', v: 'State', note: 'stateful' },
      { k: 'Default', v: 'Deny', note: 'allow-list' },
    ],
    diagram: {
      caption: 'Every packet judged against the rules',
      left: { title: 'Outside', sub: 'incoming traffic', tag: 'untrusted' },
      inLabel: 'packet in',
      device: { name: 'Firewall', line1: 'match the policy', line2: 'allow or drop' },
      outLabel: 'only if allowed',
      right: { title: 'Inside / LAN', sub: 'protected hosts', tag: 'trusted' },
      table: {
        label: 'The rule set, top to bottom',
        rows: [
          { l: 'allow 443/tcp → web ← match', r: 'ALLOW', hi: true },
          { l: 'allow 22/tcp from admin', r: 'ALLOW' },
          { l: 'everything else', r: 'DENY' },
        ],
      },
      note: [
        'The firewall checks each packet against an ordered rule set. A permitted flow passes and its state is remembered; anything not matched by an allow rule hits the final ',
        { a: 'deny' },
        ' and is dropped.',
      ],
    },
    steps: [
      { t: 'Inspect the packet', d: 'It reads addresses, ports and — on next-gen firewalls — the payload.' },
      { t: 'Match against the rules', d: 'Rules are checked top-down; the first match wins.' },
      { t: 'Check the state', d: 'It confirms the packet belongs to an already-allowed connection.' },
      { t: 'Allow or drop', d: 'Permitted traffic passes and is logged; everything else is blocked.' },
    ],
    security: {
      lede: [
        'The firewall ',
        { a: 'is' },
        ' the policy boundary — it’s ',
        { a: 'the network’s primary defence' },
        ' and ',
        { b: 'a prime target to get past.' },
      ],
      points: [
        { t: 'Default deny', d: 'Allow only what is explicitly needed.' },
        { t: 'Stateful inspection', d: 'Track connections, not just isolated packets.' },
        { t: 'Deep packet inspection', d: 'Next-gen firewalls read L7 application data.' },
        { t: 'Segmentation', d: 'Separate zones with rules governing what crosses.' },
        { t: 'Logging & alerting', d: 'The authoritative record of what was blocked.' },
        { t: 'Rule hygiene', d: 'Stale allow rules quietly become open holes.' },
      ],
    },
    footnote: 'Modern “next-gen” firewalls fold in IPS, app awareness and TLS inspection in one box.',
  },

  'load-balancer': {
    crumb: 'Layers 4 / 7',
    kicker: 'Layers 4 / 7 · Service device',
    title: 'Load Balancer',
    sub: 'the traffic distributor',
    lede: [
      'A load balancer ',
      { i: 'spreads incoming connections across a pool of servers.' },
      ' It ',
      { a: 'accepts each request at one address' },
      ', ',
      { a: 'picks a healthy backend' },
      ', and ',
      { b: 'forwards the request there' },
      ' — so no single server carries the whole load.',
    ],
    takeaway: [
      'A load balancer ',
      { a: 'shares traffic across many servers' },
      ' and ',
      { b: 'routes around any that fail.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 4 / 7', note: 'TCP or HTTP' },
      { k: 'Spreads', v: 'Connections', note: 'across a pool' },
      { k: 'Checks', v: 'Health', note: 'drops dead nodes' },
      { k: 'Result', v: 'Scale & uptime', note: 'no single point' },
    ],
    diagram: {
      caption: 'One address in, many servers behind',
      left: { title: 'Clients', sub: 'all hit one address', tag: 'the virtual IP' },
      inLabel: 'request in',
      device: { name: 'Load Balancer', line1: 'pick a healthy', line2: 'backend' },
      outLabel: 'to a live server',
      right: { title: 'Server pool', sub: 'web-1 · web-2 · web-3', tag: 'behind it' },
      table: {
        label: 'The server pool',
        rows: [
          { l: 'web-1 ← chosen', r: 'healthy', hi: true },
          { l: 'web-2', r: 'healthy' },
          { l: 'web-3', r: 'down · skipped' },
        ],
      },
      note: [
        'Clients connect to the balancer’s single virtual address. It health-checks the pool and sends each new request to an available server — ',
        { a: 'spreading the load' },
        ' and routing around web-3, which is down.',
      ],
    },
    steps: [
      { t: 'Accept the request', d: 'Clients connect to one virtual IP, not to any server directly.' },
      { t: 'Health-check the pool', d: 'It continuously tests which backends are alive.' },
      { t: 'Pick a backend', d: 'It chooses one by round-robin, least-connections or a similar rule.' },
      { t: 'Forward & return', d: 'It proxies the request there and passes the response back.' },
    ],
    security: {
      lede: [
        'Sitting in front of every server, the balancer is ',
        { a: 'a natural place to terminate TLS and absorb attacks' },
        ' — and ',
        { b: 'a single point to harden.' },
      ],
      points: [
        { t: 'TLS termination', d: 'Decrypt once, inspect, then re-encrypt to the backends.' },
        { t: 'DDoS absorption', d: 'Spread and rate-limit floods before they reach servers.' },
        { t: 'Health isolation', d: 'Pull a compromised or failing node out of rotation.' },
        { t: 'WAF integration', d: 'Layer-7 balancers can filter application attacks.' },
        { t: 'A single choke point', d: 'It must itself be made redundant.' },
        { t: 'Header hygiene', d: 'Sanitise forwarded headers like X-Forwarded-For.' },
      ],
    },
    footnote: 'A reverse proxy and an L7 load balancer overlap heavily — often the same product.',
  },

  'proxy-server': {
    crumb: 'Layer 7 — Application',
    kicker: 'Layer 7 · Application device',
    title: 'Proxy Server',
    sub: 'the forward / reverse proxy',
    lede: [
      'A proxy ',
      { i: 'stands in the middle of a request, speaking for one side to the other.' },
      ' It ',
      { a: 'receives the request' },
      ', ',
      { a: 'caches, filters or rewrites it' },
      ', and ',
      { b: 'forwards it on in its own name' },
      ' — a broker for clients or servers.',
    ],
    takeaway: [
      'A proxy ',
      { a: 'makes requests on another’s behalf' },
      ', ',
      { b: 'caching and filtering what passes through.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 7', note: 'Application' },
      { k: 'Stands for', v: 'Client or server', note: 'forward / reverse' },
      { k: 'Adds', v: 'Cache & filter', note: 'control' },
      { k: 'Hides', v: 'The real origin', note: 'either side' },
    ],
    diagram: {
      caption: 'Nothing talks end-to-end — the proxy relays',
      left: { title: 'Client', sub: 'asks the proxy', tag: 'never the origin' },
      inLabel: 'request',
      device: { name: 'Proxy', line1: 'cache · filter', line2: 'relay' },
      outLabel: 'fetched on its behalf',
      right: { title: 'Origin server', sub: 'answers the proxy', tag: 'the real source' },
      table: {
        label: 'Cache first, origin second',
        rows: [
          { l: 'already in cache? ← hit', r: 'served instantly', hi: true },
          { l: 'not cached', r: 'fetched from origin, stored' },
        ],
      },
      note: [
        'The client’s request stops at the proxy. If it can answer from cache or policy it does; otherwise it ',
        { a: 'fetches from the origin in its own name' },
        ', stores the result, and returns it — the two ends never speak directly.',
      ],
    },
    steps: [
      { t: 'Receive the request', d: 'The client sends its request to the proxy, not the origin.' },
      { t: 'Apply policy', d: 'It allows, blocks, authenticates or logs as configured.' },
      { t: 'Serve or fetch', d: 'It answers from cache, or fetches from the origin server.' },
      { t: 'Return the response', d: 'It hands the result back in the proxy’s own name.' },
    ],
    security: {
      lede: [
        'Because everything routes through it, a proxy is ',
        { a: 'a powerful control and logging point' },
        ' — and ',
        { b: 'a place to enforce or evade policy.' },
      ],
      points: [
        { t: 'Content filtering', d: 'Block categories, malware and data exfiltration.' },
        { t: 'Access logging', d: 'A full record of who fetched what.' },
        { t: 'TLS inspection', d: 'A reverse proxy can decrypt and scan traffic.' },
        { t: 'Anonymity', d: 'A forward proxy can hide the real client.' },
        { t: 'Cache poisoning', d: 'Stale or forged cache entries are a real risk.' },
        { t: 'Choke-point value', d: 'One place to enforce all web policy.' },
      ],
    },
    footnote: '“Forward” proxies front clients; “reverse” proxies front servers — same idea, opposite direction.',
  },

  gateway: {
    crumb: 'Layer 3+',
    kicker: 'Layer 3+ · Translation device',
    title: 'Gateway',
    sub: 'the protocol gateway',
    lede: [
      'A gateway ',
      { i: 'joins two networks that don’t speak the same language.' },
      ' It ',
      { a: 'receives traffic in one protocol' },
      ', ',
      { a: 'translates it end to end' },
      ', and ',
      { b: 're-emits it in the other' },
      ' — the interpreter between dissimilar systems.',
    ],
    takeaway: [
      'A gateway ',
      { a: 'connects two different kinds of network' },
      ' and ',
      { b: 'translates fully between their protocols.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3 and up', note: 'often to L7' },
      { k: 'Joins', v: 'Unlike networks', note: 'different stacks' },
      { k: 'Does', v: 'Translation', note: 'protocol ↔ protocol' },
      { k: 'Example', v: 'IoT / VoIP', note: 'legacy bridges' },
    ],
    diagram: {
      caption: 'Two protocols that can’t talk — until the gateway',
      left: { title: 'Network A', sub: 'protocol X', tag: 'one stack' },
      inLabel: 'message in X',
      device: { name: 'Gateway', line1: 'translate', line2: 'X ⇄ Y' },
      outLabel: 'message in Y',
      right: { title: 'Network B', sub: 'protocol Y', tag: 'a different stack' },
      table: {
        label: 'Translate, don’t just forward',
        rows: [
          { l: 'protocol X in', r: '→ fully decoded' },
          { l: 'protocol Y out ← re-encoded', r: '→ sent onward', hi: true },
        ],
      },
      note: [
        'A router forwards; a gateway ',
        { a: 'translates' },
        '. It fully decodes traffic in one protocol and re-encodes it in another, letting systems that share no common language interoperate.',
      ],
    },
    steps: [
      { t: 'Receive in protocol X', d: 'Traffic arrives from the first network.' },
      { t: 'Decode the message', d: 'It parses the data all the way up the stack.' },
      { t: 'Re-encode in protocol Y', d: 'It rebuilds the message in the second network’s language.' },
      { t: 'Forward to network B', d: 'The translated message is sent on.' },
    ],
    security: {
      lede: [
        'A gateway ',
        { a: 'reads everything it translates' },
        ', so it’s ',
        { a: 'a natural inspection point' },
        ' — and ',
        { b: 'a bridge that could join zones that shouldn’t meet.' },
      ],
      points: [
        { t: 'Full inspection', d: 'It already parses the entire payload.' },
        { t: 'Translation errors', d: 'Mismatches can leak or corrupt data.' },
        { t: 'Zone bridging', d: 'It can wrongly connect different trust levels.' },
        { t: 'Legacy exposure', d: 'It often fronts old, unpatched systems.' },
        { t: 'A single interpreter', d: 'A bug here affects both sides at once.' },
        { t: 'Strict validation', d: 'Sanitise input on both protocols.' },
      ],
    },
    footnote:
      '“Default gateway” on your PC means the router — but a protocol gateway is a translator, a different role.',
  },

  'vpn-gateway': {
    crumb: 'Layer 3 — Network',
    kicker: 'Layer 3 · Security device',
    title: 'VPN Gateway',
    sub: 'the tunnel concentrator',
    lede: [
      'A VPN gateway ',
      { i: 'lets remote users and sites join the network over an encrypted tunnel.' },
      ' It ',
      { a: 'authenticates the far end' },
      ', ',
      { a: 'encrypts every packet in the tunnel' },
      ', and ',
      { b: 'delivers it onto the internal network' },
      ' — a private link across the public internet.',
    ],
    takeaway: [
      'A VPN gateway ',
      { a: 'builds an encrypted tunnel over the internet' },
      ' so remote hosts ',
      { b: 'join the network as if local.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layer 3', note: 'Network' },
      { k: 'Secures', v: 'Encryption', note: 'IPsec / TLS' },
      { k: 'Joins', v: 'Remote → LAN', note: 'across the internet' },
      { k: 'Verifies', v: 'Identity', note: 'before access' },
    ],
    diagram: {
      caption: 'A private tunnel across the public internet',
      left: { title: 'Remote user', sub: 'at home / on the road', tag: 'across the internet' },
      inLabel: 'encrypted tunnel',
      device: { name: 'VPN Gateway', line1: 'authenticate', line2: '+ encrypt' },
      outLabel: 'decrypted on the LAN',
      right: { title: 'Internal network', sub: 'as if on-site', tag: 'the trusted LAN' },
      table: {
        label: 'Untrusted outside, trusted inside',
        rows: [
          { l: 'across the internet', r: 'encrypted tunnel' },
          { l: 'at the gateway ← decrypted', r: 'placed on the LAN', hi: true },
        ],
      },
      note: [
        'The remote client authenticates, then every packet is encrypted and tunnelled across the untrusted internet. The gateway ',
        { a: 'decrypts it at the edge' },
        ' and places it on the internal network — the user works as if physically present.',
      ],
    },
    steps: [
      { t: 'Authenticate the far end', d: 'It verifies the user, device or certificate.' },
      { t: 'Negotiate keys', d: 'It establishes the encrypted tunnel’s crypto.' },
      { t: 'Encrypt & tunnel', d: 'It wraps each packet and sends it over the internet.' },
      { t: 'Decrypt onto the LAN', d: 'At the edge it unwraps the traffic and delivers it internally.' },
    ],
    security: {
      lede: [
        'The VPN gateway ',
        { a: 'extends the trusted network to outsiders' },
        ', so it’s ',
        { a: 'both a shield' },
        ' and ',
        { b: 'a high-value way in.' },
      ],
      points: [
        { t: 'Strong authentication', d: 'MFA or certificates — never passwords alone.' },
        { t: 'Modern crypto', d: 'Use current IPsec/TLS ciphers only.' },
        { t: 'Least privilege', d: 'Tunnel users to only what they actually need.' },
        { t: 'Split vs full tunnel', d: 'Decide deliberately what routes through it.' },
        { t: 'Patch urgently', d: 'VPN vulnerabilities are actively exploited.' },
        { t: 'Endpoint posture', d: 'Check the device’s health before it joins.' },
      ],
    },
    footnote: 'A VPN gateway is often a role of the firewall rather than a separate appliance.',
  },

  'ids-ips': {
    crumb: 'Layers 3–7',
    kicker: 'Layers 3–7 · Security device',
    title: 'IDS / IPS',
    sub: 'intrusion detection & prevention',
    lede: [
      'An IDS/IPS ',
      { i: 'watches network traffic for signs of attack.' },
      ' It ',
      { a: 'inspects packets against known signatures and behaviour' },
      ', ',
      { a: 'raises an alert on a match' },
      ', and ',
      { b: 'can drop the traffic inline' },
      ' — the network’s alarm, and sometimes its reflex.',
    ],
    takeaway: [
      'An IDS ',
      { a: 'watches for attacks and alerts' },
      '; an IPS ',
      { b: 'sits inline and blocks them.' },
    ],
    points: [
      { k: 'Operates at', v: 'Layers 3–7', note: 'deep inspection' },
      { k: 'Detects by', v: 'Signatures', note: '+ anomalies' },
      { k: 'IDS', v: 'Alerts', note: 'out of band' },
      { k: 'IPS', v: 'Blocks', note: 'inline' },
    ],
    diagram: {
      caption: 'Watching every packet for a known attack',
      left: { title: 'Traffic', sub: 'flowing / mirrored', tag: 'every packet' },
      inLabel: 'inspected',
      device: { name: 'IDS / IPS', line1: 'match signatures', line2: '& behaviour' },
      outLabel: 'passed or dropped',
      right: { title: 'Protected network', sub: 'hosts & servers', tag: 'downstream' },
      table: {
        label: 'Clean or malicious?',
        rows: [
          { l: 'matches nothing', r: 'passes / logged' },
          { l: 'matches a signature ← hit', r: 'alert + drop', hi: true },
        ],
      },
      note: [
        'Every packet is compared against attack signatures and normal-behaviour models. An IDS sits out of band and ',
        { a: 'alerts' },
        '; an IPS sits inline and can drop the malicious flow before it reaches its target.',
      ],
    },
    steps: [
      { t: 'Capture the traffic', d: 'It sits inline, or receives a mirrored copy of the traffic.' },
      { t: 'Inspect deeply', d: 'It compares packets against signatures and anomaly models.' },
      { t: 'Detect a threat', d: 'A signature match or a behavioural outlier is flagged.' },
      { t: 'Alert or block', d: 'An IDS notifies; an IPS drops the flow inline.' },
    ],
    security: {
      lede: [
        'The IDS/IPS is ',
        { a: 'the network’s eyes' },
        ' — its value is ',
        { b: 'only as current as its signatures and tuning.' },
      ],
      points: [
        { t: 'Signature updates', d: 'Stale rules miss the newest attacks.' },
        { t: 'Anomaly detection', d: 'Catches the unknown — at the cost of false positives.' },
        { t: 'Inline placement', d: 'An IPS in the path can also block good traffic.' },
        { t: 'Encrypted blind spots', d: 'It can’t read TLS without decryption.' },
        { t: 'Tuning burden', d: 'Noise buries the real alerts.' },
        { t: 'Feeds the SOC', d: 'Its alerts flow to monitoring and response.' },
      ],
    },
    footnote: 'IDS and IPS are the same engine — the difference is whether it only watches, or also blocks.',
  },
};
