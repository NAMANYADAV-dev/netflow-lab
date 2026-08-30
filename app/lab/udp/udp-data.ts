/* The UDP lab tells one story twice.

   Four datagrams leave the same socket over two different wires. On the clean
   wire all four arrive; on the congested one, number three dies in a full
   router queue and nothing anywhere reports it. Running the two side by side
   is the whole lesson: the silence after the loss is not a failure of the
   simulation, it is the protocol behaving exactly as specified. */

export type Wire = 'clean' | 'lossy';

export type UdpStep = {
  /** datagram number, or 0 for the socket-open step that sends nothing */
  dg: number;
  /** true when this datagram dies in the router queue */
  lost: boolean;
  /** short label for the explain panel footer */
  at: string;
  simple: string;
  technical: string;
  packet: string;
};

/** the datagram that the congested router drops */
export const LOST_DG = 3;

const build: UdpStep = {
  dg: 0, lost: false, at: 'socket opened',
  simple: 'There is nothing to set up. No handshake, no agreement, no connection — the app just writes to a socket and the datagram leaves. That is the entire ceremony.',
  technical: 'UDP is connectionless: no SYN, no state machine, no window. The header is 8 bytes — source port, destination port, length, checksum — and then your payload.',
  packet: 'socket(AF_INET, SOCK_DGRAM)  →  sendto(203.0.113.20:5060)   header = 8 bytes',
};

function datagram(n: number, lossy: boolean): UdpStep {
  const lost = lossy && n === LOST_DG;
  return {
    dg: n,
    lost,
    at: lost ? `datagram ${n} — dropped` : `datagram ${n} delivered`,
    simple: lost
      ? 'Datagram 3 hits a congested router with a full queue, and the router throws it away. Nobody is told. The sender has already moved on; the receiver never knew to expect it.'
      : n === 1
        ? 'The first datagram arrives and the app can use it immediately — there was no connection to wait for.'
        : 'Another datagram arrives, independent of the ones around it. UDP keeps no record that the others existed.',
    technical: lost
      ? 'Queue overflow at the intermediate router. UDP has no acknowledgement, so neither end detects the loss — there is no sequence number to reveal a gap and no timer to expire.'
      : 'Each datagram is delivered up to the socket bound to port 5060 as soon as it arrives. Ordering and completeness are the application’s problem, not UDP’s.',
    packet: lost
      ? 'router queue full → DROP  (no icmp sent, no ack expected, no retransmit)'
      : 'recv 172 bytes  sport=52310 dport=5060 len=172 cksum=0x8f31  → socket',
  };
}

export const stepsFor = (wire: Wire): UdpStep[] => {
  const lossy = wire === 'lossy';
  return [build, datagram(1, lossy), datagram(2, lossy), datagram(3, lossy), datagram(4, lossy)];
};

export const udpTraits = (lossy: boolean) => [
  'Sends immediately — first datagram leaves before TCP would have finished saying hello.',
  'Eight bytes of header. No state to keep on either side.',
  lossy
    ? 'Lost #3 and reported nothing — there is no mechanism that could.'
    : 'No acknowledgements came back, because none were ever expected.',
  'Order and completeness are the application’s job if it wants them.',
];

export const tcpTraits = (lossy: boolean) => [
  'Three-way handshake first — nothing sends until both ends agree.',
  'Twenty bytes of header, plus a connection to remember.',
  lossy
    ? 'Would spot the gap in sequence numbers and retransmit #3.'
    : 'Would ACK every segment and hold the stream in order.',
  'Guarantees order and delivery — by making everyone wait for it.',
];
