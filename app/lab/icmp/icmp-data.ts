/* The two ICMP stories this lab tells.

   Ping and traceroute use the same protocol and the same field — the IP hop
   counter — for opposite ends. Ping wants the packet to survive; traceroute
   sends packets designed to die, one hop later each time, and reads the
   addresses of the routers that complain. Both are written out step by step
   here so the diagram, the console and the prose all read from one source. */

export type IcmpTool = 'ping' | 'trace';

export type IcmpStep = {
  /** out = still travelling, arrive = delivered, reply = answer coming home,
      expire = the hop counter hit zero and a router reported it */
  kind: 'out' | 'arrive' | 'reply' | 'expire';
  /** node the packet has reached at this step */
  to: string;
  /** set when the step's answer originates somewhere other than `to` */
  from?: string;
  ttl: number;
  type: number;
  code: number;
  /** short label for the console header */
  at: string;
  /** hop counter shown on each router at this step */
  ttlAt: Record<string, number>;
  simple: string;
  technical: string;
  packet: string;
};

export const pingSteps: IcmpStep[] = [
  { kind: 'out', to: 'sw', ttl: 64, type: 8, code: 0, at: 'PC-1 → gateway', ttlAt: {},
    simple: 'Ping builds a tiny message whose only purpose is to ask "are you there?". No web page, no data — just a question and a bit of padding.',
    technical: 'ICMP Echo Request: type 8, code 0, identifier 0x4f21, sequence 1, 56 bytes of payload. It rides directly inside IP — there is no TCP or UDP layer here.',
    packet: 'ip.proto=1 (ICMP)  icmp.type=8 code=0  id=0x4f21 seq=1  ttl=64' },
  { kind: 'out', to: 'rt', ttl: 63, type: 8, code: 0, at: 'router hop 1', ttlAt: { rt: 63 },
    simple: 'The router passes it along and, as every router must, knocks one off the packet’s hop counter.',
    technical: 'Router forwards toward the default route and decrements TTL 64→63. The switch before it changed nothing — layer 2 devices never touch the TTL.',
    packet: 'rt 192.168.1.1: ttl 64 → 63   nat 192.168.1.10 → 80.12.16.10' },
  { kind: 'out', to: 'isp', ttl: 62, type: 8, code: 0, at: 'ISP hop 2', ttlAt: { rt: 63, isp: 62 },
    simple: 'Another router, another point off the counter. This counter is the only thing stopping a lost packet from circling forever.',
    technical: 'ISP router decrements 63→62 and re-checksums the IP header. Had the TTL reached 0 here, this router would have dropped the packet and sent back ICMP Time Exceeded.',
    packet: 'isp 80.12.16.1: ttl 63 → 62   checksum recalculated' },
  { kind: 'arrive', to: 'web', ttl: 62, type: 8, code: 0, at: 'echo request received', ttlAt: { rt: 63, isp: 62 },
    simple: 'The server gets the question. Because it is an echo request, it simply copies the payload back with a different label on it.',
    technical: 'Destination host receives type 8, flips it to type 0 (Echo Reply), keeps the same identifier and sequence, and copies the 56-byte payload verbatim.',
    packet: 'recv icmp.type=8 → send icmp.type=0  id=0x4f21 seq=1 (payload echoed)' },
  { kind: 'reply', to: 'pc1', from: 'web', ttl: 62, type: 0, code: 0, at: 'echo reply → PC-1', ttlAt: { rt: 63, isp: 62 },
    simple: 'The reply comes home and ping measures how long the round trip took. That number is the whole point of the exercise.',
    technical: 'Reply arrives with matching id/seq, so ping pairs it with the request it sent and reports the elapsed time. If the server starts the reply at TTL 64, the displayed TTL 62 is consistent with the two routers shown on the return path.',
    packet: '64 bytes from 203.0.113.20: icmp_seq=1 ttl=62 time=24.4 ms' },
];

export const traceSteps: IcmpStep[] = [
  { kind: 'expire', to: 'rt', ttl: 1, type: 11, code: 0, at: 'probe ttl=1', ttlAt: { rt: 0 },
    simple: 'Traceroute cheats: it sends a probe with a hop counter of exactly 1, so the very first router has to throw it away — and complain.',
    technical: 'Probe leaves with TTL=1. The first router decrements it to 0, discards the packet, and returns ICMP Time Exceeded (type 11, code 0) from its own address — which is how you learn that address.',
    packet: 'send ttl=1 → rt: ttl 1→0 → DROP → icmp type=11 code=0 from 192.168.1.1' },
  { kind: 'expire', to: 'isp', ttl: 2, type: 11, code: 0, at: 'probe ttl=2', ttlAt: { rt: 1, isp: 0 },
    simple: 'Now a probe with a counter of 2. It survives the first router and dies at the second — which reports itself in turn.',
    technical: 'TTL=2 survives hop 1 (2→1) and expires at hop 2 (1→0). ICMP Time Exceeded arrives from 80.12.16.1. Each error message names its own sender — that is the map.',
    packet: 'send ttl=2 → rt: 2→1 → isp: 1→0 → DROP → icmp type=11 from 80.12.16.1' },
  { kind: 'reply', to: 'web', ttl: 3, type: 0, code: 0, at: 'probe ttl=3 — arrived', ttlAt: { rt: 2, isp: 1 },
    simple: 'The third probe finally survives long enough to arrive. A real answer instead of a complaint means the path is fully mapped.',
    technical: 'TTL=3 reaches the destination, which answers with Echo Reply (type 0) rather than Time Exceeded. Traceroute sees a non-error response, prints the last line and stops.',
    packet: 'send ttl=3 → reaches 203.0.113.20 → icmp type=0 (echo reply)  trace complete' },
];

export const stepsFor = (tool: IcmpTool) => (tool === 'ping' ? pingSteps : traceSteps);
