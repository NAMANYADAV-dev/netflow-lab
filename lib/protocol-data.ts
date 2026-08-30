/* The protocol catalogue. Ported from The Bench.dc.html in the Claude Design
   project — the authoritative list. The Bench, the Atlas's category grid and the
   nav's Protocols menu all read it, so the counts and names have one home. */

export type ProtocolCategory = { id: string; name: string; blurb: string };

export const protocolCategories: ProtocolCategory[] = [
  { id: 'link', name: 'The Link', blurb: 'On the wire — framing and local addressing.' },
  { id: 'net', name: 'The Internet Layer', blurb: 'Addressing and best-effort delivery across networks.' },
  { id: 'route', name: 'Routing', blurb: 'How routers learn and choose the path.' },
  { id: 'transport', name: 'Transport', blurb: 'End-to-end delivery between two processes.' },
  { id: 'naming', name: 'Naming & Config', blurb: 'Finding names and joining a network.' },
  { id: 'web', name: 'Web & Transfer', blurb: 'The request/response protocols of the web.' },
  { id: 'mail', name: 'Mail', blurb: 'Moving and reading electronic mail.' },
  { id: 'media', name: 'Real-time & Media', blurb: 'Live voice, video and the sessions that carry them.' },
  { id: 'security', name: 'Security', blurb: 'Encrypting and authenticating what crosses the wire.' },
  { id: 'auth', name: 'Identity & Auth', blurb: 'Proving who a user or a device is.' },
  { id: 'ops', name: 'Time & Management', blurb: 'Clocks, metrics and logs for the fleet.' },
];

export type Protocol = {
  id: string;
  abbr: string;
  name: string;
  cat: string;
  /** the common default port or protocol number; "—" where there isn't one */
  port: string;
  fn: string;
  /** ids of the protocols it is usually seen with */
  rel: string[];
  /** the encapsulation it rides in, outermost first — only where it is the
      clearest thing to show about the protocol */
  stack?: string[];
};

export const protocols: Protocol[] = [
  // ── the link ──────────────────────────────────────────────────────────
  { id: 'eth', abbr: 'Ethernet', name: '802.3', cat: 'link', port: '—', fn: 'Carries frames across the physical link, addressed by 48-bit MAC.', rel: ['arp', 'vlan', 'ip4'] },
  { id: 'arp', abbr: 'ARP', name: 'Address Resolution', cat: 'link', port: '—', fn: 'Maps an IP address to the MAC that owns it on the local segment.', rel: ['eth', 'ip4'] },
  { id: 'vlan', abbr: '802.1Q', name: 'VLAN tagging', cat: 'link', port: '—', fn: 'Tags frames so one physical wire can carry many isolated networks.', rel: ['eth'] },
  { id: 'ppp', abbr: 'PPP', name: 'Point-to-Point', cat: 'link', port: '—', fn: 'Frames traffic over a single point-to-point link and negotiates it up.', rel: ['eth', 'ip4'] },

  // ── the internet layer ────────────────────────────────────────────────
  { id: 'ip4', abbr: 'IPv4', name: 'Internet Protocol v4', cat: 'net', port: 'IP', fn: 'Best-effort, connectionless delivery to a 32-bit address anywhere on the internet.', rel: ['ip6', 'icmp', 'tcp', 'udp'], stack: ['eth', 'ip4'] },
  { id: 'ip6', abbr: 'IPv6', name: 'Internet Protocol v6', cat: 'net', port: 'IP', fn: 'The successor: 128-bit addressing, no NAT required, native autoconfiguration.', rel: ['ip4', 'icmp6', 'nat'] },
  { id: 'icmp', abbr: 'ICMP', name: 'Control Messages', cat: 'net', port: 'IP 1', fn: 'Errors and diagnostics for IPv4 — unreachables, time-exceeded, and ping.', rel: ['ip4'] },
  { id: 'icmp6', abbr: 'ICMPv6', name: 'Control Messages v6', cat: 'net', port: 'IP 58', fn: 'ICMP for IPv6, and the neighbour discovery that replaces ARP.', rel: ['ip6'] },
  { id: 'nat', abbr: 'NAT', name: 'Address Translation', cat: 'net', port: '—', fn: 'Rewrites addresses at the edge so many private hosts share one public IP.', rel: ['ip4', 'ip6'] },
  { id: 'igmp', abbr: 'IGMP', name: 'Group Management', cat: 'net', port: 'IP 2', fn: 'Hosts subscribe to multicast groups so routers only forward the streams a segment wants.', rel: ['ip4', 'icmp'], stack: ['eth', 'ip4', 'igmp'] },

  // ── routing ───────────────────────────────────────────────────────────
  { id: 'ospf', abbr: 'OSPF', name: 'Open Shortest Path First', cat: 'route', port: 'IP 89', fn: 'Link-state interior routing: every router builds the same map, then runs Dijkstra.', rel: ['isis', 'bgp', 'ip4'] },
  { id: 'bgp', abbr: 'BGP', name: 'Border Gateway', cat: 'route', port: 'TCP 179', fn: 'The path-vector protocol that stitches the autonomous systems of the internet together.', rel: ['ospf', 'ip4'], stack: ['ip4', 'tcp', 'bgp'] },
  { id: 'rip', abbr: 'RIP', name: 'Routing Information', cat: 'route', port: 'UDP 520', fn: 'The oldest distance-vector IGP — simple hop counts, small networks.', rel: ['ospf'] },
  { id: 'isis', abbr: 'IS-IS', name: 'Intermediate System', cat: 'route', port: '—', fn: 'A link-state IGP favoured inside large carrier and datacentre backbones.', rel: ['ospf'] },

  // ── transport ─────────────────────────────────────────────────────────
  { id: 'tcp', abbr: 'TCP', name: 'Transmission Control', cat: 'transport', port: 'IP 6', fn: 'A reliable, ordered byte stream: a handshake, sequence numbers, acknowledgements and retransmission.', rel: ['udp', 'tls', 'http', 'ip4'], stack: ['ip4', 'tcp'] },
  { id: 'udp', abbr: 'UDP', name: 'User Datagram', cat: 'transport', port: 'IP 17', fn: 'Fire-and-forget datagrams — no handshake, no ordering, no guarantees. Fast and thin.', rel: ['tcp', 'quic', 'dns'], stack: ['ip4', 'udp'] },
  { id: 'quic', abbr: 'QUIC', name: 'UDP-Based Secure Transport', cat: 'transport', port: 'UDP 443', fn: 'Reliable, multiplexed, encrypted streams built on UDP — the transport under HTTP/3.', rel: ['udp', 'http3', 'tls'], stack: ['ip4', 'udp', 'quic'] },
  { id: 'sctp', abbr: 'SCTP', name: 'Stream Control', cat: 'transport', port: 'IP 132', fn: 'Message-oriented transport with multiple streams and multi-homed endpoints.', rel: ['tcp', 'udp'] },

  // ── naming & config ───────────────────────────────────────────────────
  { id: 'dns', abbr: 'DNS', name: 'Domain Name System', cat: 'naming', port: '53', fn: 'Translates names people can read into the addresses machines route to.', rel: ['dhcp', 'mdns', 'udp'], stack: ['ip4', 'udp', 'dns'] },
  { id: 'dhcp', abbr: 'DHCP', name: 'Host Configuration', cat: 'naming', port: '67 · 68', fn: 'Hands a joining host its address, gateway and resolver in one exchange.', rel: ['dns', 'ip4'] },
  { id: 'mdns', abbr: 'mDNS', name: 'Multicast DNS', cat: 'naming', port: '5353', fn: 'Zero-configuration name resolution on the local link — .local without a server.', rel: ['dns'] },

  // ── web & transfer ────────────────────────────────────────────────────
  { id: 'http', abbr: 'HTTP', name: 'HyperText Transfer', cat: 'web', port: '80', fn: 'The request/response protocol of the web: methods, headers, status codes, bodies.', rel: ['http2', 'tls', 'ws', 'dns'], stack: ['ip4', 'tcp', 'http'] },
  { id: 'http2', abbr: 'HTTP/2', name: 'HTTP, multiplexed', cat: 'web', port: '443', fn: 'Many concurrent requests over one TCP connection, with header compression.', rel: ['http', 'http3', 'grpc'], stack: ['ip4', 'tcp', 'tls', 'http2'] },
  { id: 'http3', abbr: 'HTTP/3', name: 'HTTP over QUIC', cat: 'web', port: '443/udp', fn: 'HTTP carried on QUIC — independent streams avoid TCP connection-wide head-of-line blocking.', rel: ['http2', 'quic'], stack: ['ip4', 'udp', 'quic', 'http3'] },
  { id: 'ws', abbr: 'WebSocket', name: 'Full-duplex web', cat: 'web', port: '80 · 443', fn: 'Upgrades one HTTP connection into a persistent, two-way message channel.', rel: ['http', 'tls'], stack: ['ip4', 'tcp', 'tls', 'ws'] },
  { id: 'ftp', abbr: 'FTP', name: 'File Transfer', cat: 'web', port: '20 · 21', fn: 'The original file transfer protocol — a control channel and a separate data channel.', rel: ['sftp', 'tcp'] },
  { id: 'sftp', abbr: 'SFTP', name: 'SSH File Transfer', cat: 'web', port: '22', fn: 'File transfer tunnelled inside an encrypted SSH session.', rel: ['ssh', 'ftp'] },
  { id: 'grpc', abbr: 'gRPC', name: 'Remote Procedure Call', cat: 'web', port: '443', fn: 'Typed, streaming RPC over HTTP/2 using protocol-buffer messages.', rel: ['http2'], stack: ['ip4', 'tcp', 'tls', 'http2', 'grpc'] },

  // ── mail ──────────────────────────────────────────────────────────────
  { id: 'smtp', abbr: 'SMTP', name: 'Simple Mail Transfer', cat: 'mail', port: '25 · 587', fn: 'Pushes mail from client to server and between servers along the delivery path.', rel: ['imap', 'pop3', 'tls'], stack: ['ip4', 'tcp', 'tls', 'smtp'] },
  { id: 'imap', abbr: 'IMAP', name: 'Message Access', cat: 'mail', port: '143 · 993', fn: 'Reads and manages mail while it stays on the server, synced across devices.', rel: ['smtp', 'pop3'] },
  { id: 'pop3', abbr: 'POP3', name: 'Post Office', cat: 'mail', port: '110 · 995', fn: 'Downloads messages to a client; the client may keep the server copy or mark it for deletion.', rel: ['smtp', 'imap'] },

  // ── real-time & media ─────────────────────────────────────────────────
  { id: 'rtp', abbr: 'RTP', name: 'Real-time Transport', cat: 'media', port: 'UDP', fn: 'Carries live audio and video with timestamps and sequence numbers over UDP.', rel: ['sip', 'webrtc', 'udp'], stack: ['ip4', 'udp', 'rtp'] },
  { id: 'sip', abbr: 'SIP', name: 'Session Initiation', cat: 'media', port: '5060 · 5061', fn: 'Sets up, changes and tears down calls and multimedia sessions.', rel: ['rtp', 'webrtc'], stack: ['ip4', 'udp', 'sip'] },
  { id: 'webrtc', abbr: 'WebRTC', name: 'Real-time in the browser', cat: 'media', port: '—', fn: 'Encrypted browser media and data over an ICE-selected path: direct when possible, relayed through TURN when needed.', rel: ['rtp', 'dtls', 'sip'] },

  // ── security ──────────────────────────────────────────────────────────
  { id: 'tls', abbr: 'TLS', name: 'Transport Layer Security', cat: 'security', port: '443', fn: 'Wraps a transport stream in encryption and authenticates the server with a certificate.', rel: ['ssl', 'ssh', 'tcp', 'http'], stack: ['ip4', 'tcp', 'tls'] },
  { id: 'ssl', abbr: 'SSL', name: 'Secure Sockets (legacy)', cat: 'security', port: '—', fn: 'TLS predecessor, now deprecated — the name survives in everyday speech.', rel: ['tls'] },
  { id: 'ipsec', abbr: 'IPsec', name: 'IP Security', cat: 'security', port: 'IP 50 · 51', fn: 'Encrypts and authenticates at the network layer — the basis of site-to-site VPNs.', rel: ['ip4', 'ip6'] },
  { id: 'ssh', abbr: 'SSH', name: 'Secure Shell', cat: 'security', port: '22', fn: 'An encrypted channel for remote shells, tunnels and file transfer.', rel: ['tls', 'sftp'] },
  { id: 'dtls', abbr: 'DTLS', name: 'Datagram TLS', cat: 'security', port: '—', fn: 'TLS adapted for datagrams — secures UDP-based media and WebRTC.', rel: ['tls', 'udp', 'webrtc'] },

  // ── identity & auth ───────────────────────────────────────────────────
  { id: 'oauth', abbr: 'OAuth 2.0', name: 'Delegated Authorization', cat: 'auth', port: '—', fn: 'Grants an app scoped access to your account without handing over your password.', rel: ['oidc', 'saml'] },
  { id: 'oidc', abbr: 'OIDC', name: 'OpenID Connect', cat: 'auth', port: '—', fn: 'An identity layer on top of OAuth — who the user is, as a signed token.', rel: ['oauth', 'saml'] },
  { id: 'saml', abbr: 'SAML', name: 'Security Assertion', cat: 'auth', port: '—', fn: 'Browser single sign-on through signed XML assertions between providers.', rel: ['oidc', 'oauth'] },
  { id: 'kerberos', abbr: 'Kerberos', name: 'Ticket Authentication', cat: 'auth', port: '88', fn: 'Mutual authentication with time-limited tickets from a trusted third party.', rel: ['ldap', 'radius'] },
  { id: 'radius', abbr: 'RADIUS', name: 'Network Access AAA', cat: 'auth', port: '1812 · 1813', fn: 'Centralised authentication, authorisation and accounting for network access.', rel: ['ldap', 'kerberos'] },
  { id: 'ldap', abbr: 'LDAP', name: 'Directory Access', cat: 'auth', port: '389 · 636', fn: 'Queries and updates a directory of users, groups and devices.', rel: ['kerberos', 'radius'] },

  // ── time & management ─────────────────────────────────────────────────
  { id: 'ntp', abbr: 'NTP', name: 'Network Time', cat: 'ops', port: '123', fn: 'Synchronises system clocks to selected time sources; accuracy depends on the source, path and network conditions.', rel: ['snmp', 'syslog'] },
  { id: 'snmp', abbr: 'SNMP', name: 'Network Management', cat: 'ops', port: '161 · 162', fn: 'Polls devices for metrics and receives their traps when something changes.', rel: ['syslog', 'ntp'] },
  { id: 'syslog', abbr: 'Syslog', name: 'Event Logging', cat: 'ops', port: '514', fn: 'Streams log events from devices to a central collector.', rel: ['snmp', 'ntp'] },
];

export const protocolById: Record<string, Protocol> = Object.fromEntries(
  protocols.map((p) => [p.id, p]),
);

/* The abbreviation makes a good URL segment for nearly every protocol — "TCP"
   and "HTTP/2" become tcp and http-2 — so the slug is derived rather than typed
   out forty-five times. Only OAuth needs saying, because its version number is
   part of the abbreviation and "oauth-2-0" reads as a mistake. */
const SLUG_OVERRIDES: Record<string, string> = { oauth: 'oauth-2' };

export const protocolSlug = (p: Pick<Protocol, 'id' | 'abbr'>) =>
  SLUG_OVERRIDES[p.id] ??
  p.abbr
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** where a protocol's own page lives */
export const protocolHref = (p: Pick<Protocol, 'id' | 'abbr'>) => `/protocols/${protocolSlug(p)}`;

export const protocolBySlug: Record<string, Protocol> = Object.fromEntries(
  protocols.map((p) => [protocolSlug(p), p]),
);

export const protocolCategoryById: Record<string, ProtocolCategory> = Object.fromEntries(
  protocolCategories.map((c) => [c.id, c]),
);


/** the index and the tray both group the same way */
export const protocolsByCategory = protocolCategories.map((c) => ({
  ...c,
  items: protocols.filter((p) => p.cat === c.id),
}));

export const protocolCount = protocols.length;

/** how many protocols each category holds — the Atlas grid prints these */
export const countByCategory: Record<string, number> = Object.fromEntries(
  protocolCategories.map((c) => [c.id, protocols.filter((p) => p.cat === c.id).length]),
);
