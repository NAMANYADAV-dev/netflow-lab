export type LabTone = 'cyan' | 'orange' | 'green' | 'red';
export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LabStatus = 'Ready' | 'Building' | 'Queued';

export type Lab = {
  abbr: string;
  protocolSlug?: string;
  layer: string;
  description: string;
  difficulty: LabDifficulty;
  status: LabStatus;
  href: string;
  tone: LabTone;
  shape?: 'round';
  start?: boolean;
};

/** The lab catalogue contains display content only. */
export const labs: Lab[] = [
  {
    abbr: 'ARP',
    layer: 'Layer 2 · Address resolution',
    description:
      '“Who has this IP?” Broadcast the question, watch the switch flood, get one unicast answer, fill the cache.',
    difficulty: 'Beginner',
    status: 'Ready',
    href: '/lab/arp',
    protocolSlug: 'arp',
    tone: 'orange',
    start: true,
  },
  {
    abbr: 'TCP',
    layer: 'Layer 4 · Reliable transport',
    description:
      'The three-way handshake, sequence and ACK numbers, and an honest four-way teardown.',
    difficulty: 'Intermediate',
    status: 'Ready',
    href: '/lab/tcp',
    protocolSlug: 'tcp',
    tone: 'cyan',
    shape: 'round',
  },
  {
    abbr: 'ICMP',
    layer: 'Layer 3 · Diagnostics',
    description:
      'Ping: echo request and reply, TTL counting down hop by hop, and how traceroute reads the failures.',
    difficulty: 'Beginner',
    status: 'Ready',
    href: '/lab/icmp',
    protocolSlug: 'icmp',
    tone: 'cyan',
    shape: 'round',
  },
  {
    abbr: 'IP',
    layer: 'Layer 3 · Addressing & routing',
    description:
      'A datagram finds its way across a real LAN: forwarding decision, NAT/PAT at the gateway, TTL falling hop by hop.',
    difficulty: 'Intermediate',
    status: 'Ready',
    href: '/lab/ip',
    protocolSlug: 'ipv4',
    tone: 'cyan',
  },
  {
    abbr: 'UDP',
    layer: 'Layer 4 · Fire and forget',
    description:
      'No handshake, no guarantees. Four datagrams on a clean wire, then one that vanishes—and nobody reports it.',
    difficulty: 'Beginner',
    status: 'Ready',
    href: '/lab/udp',
    protocolSlug: 'udp',
    tone: 'cyan',
    shape: 'round',
  },
  {
    abbr: 'DNS',
    layer: 'Layer 7 · Naming',
    description:
      'Turning a name into an address: four questions, three referrals, one answer—then a warm cache that asks nobody.',
    difficulty: 'Intermediate',
    status: 'Ready',
    href: '/lab/dns',
    protocolSlug: 'dns',
    tone: 'cyan',
  },
  {
    abbr: 'HTTP',
    layer: 'Layer 7 · The web',
    description:
      'One request, one response—in plain text. Then watch a single page turn out to need four of them, and a revisit that sends no page at all.',
    difficulty: 'Beginner',
    status: 'Ready',
    href: '/lab/http',
    protocolSlug: 'http',
    tone: 'orange',
    shape: 'round',
  },
  {
    abbr: 'HTTPS',
    layer: 'Layer 6/7 · Encryption & identity',
    description:
      'Send a password over port 80 and read it off the wire. Then send the same request over TLS 1.3: its content turns opaque while IPs, size, timing and sometimes the hostname remain visible.',
    difficulty: 'Intermediate',
    status: 'Ready',
    href: '/lab/https',
    protocolSlug: 'tls',
    tone: 'green',
  },
  {
    abbr: 'FTP',
    layer: 'Layer 7 · File transfer',
    description:
      'Port 21 carries the conversation, not the file. Watch the second connection get negotiated, then see why a server-initiated active-mode connection is commonly blocked by NAT or a firewall.',
    difficulty: 'Intermediate',
    status: 'Ready',
    href: '/lab/ftp',
    protocolSlug: 'ftp',
    tone: 'orange',
    shape: 'round',
  },
  {
    abbr: 'DHCP',
    layer: 'Layer 7 · Automatic configuration',
    description:
      'A machine with no address shouts into the whole subnet—and four packets later it has an IP, a gateway, DNS and a lease with an expiry date.',
    difficulty: 'Beginner',
    status: 'Ready',
    href: '/lab/dhcp',
    protocolSlug: 'dhcp',
    tone: 'cyan',
    shape: 'round',
  },
  {
    abbr: 'MAIL',
    protocolSlug: 'smtp',
    layer: 'Layer 7 · All three, end to end',
    description:
      'One email from Alice’s laptop to Bob’s phone: SMTP hands it off twice and stops at a mailbox, then IMAP reads it in place—or POP3 downloads it, with optional deletion demonstrated clearly.',
    difficulty: 'Beginner',
    status: 'Ready',
    href: '/lab/mail',
    tone: 'green',
    shape: 'round',
  },
  {
    abbr: 'Telnet',
    layer: 'Layer 7 · Remote terminal',
    description:
      'Negotiate the terminal in IAC command bytes, then type a password into the room. Character mode costs two packets a keystroke; line mode fixes that and nothing else.',
    difficulty: 'Beginner',
    status: 'Ready',
    href: '/lab/telnet',
    tone: 'red',
    shape: 'round',
  },
];

/** Find the hands-on lab paired with an atlas protocol entry. */
export function labForProtocol(slug: string): Lab | undefined {
  return labs.find((lab) => lab.protocolSlug === slug);
}
