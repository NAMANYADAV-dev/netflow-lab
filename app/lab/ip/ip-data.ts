/* The two journeys this lab tells.

   Both start at PC-1 with the same command. The only thing that differs is the
   destination address — and that single comparison against the subnet mask is
   what decides whether a packet ever meets a router at all. Running the local
   path next to the remote one is the point of the lab: no gateway, no NAT and
   an untouched TTL is what "same subnet" actually looks like on the wire. */

export type IpDest = 'remote' | 'local';

export type IpStep = {
  /** the link the datagram is crossing, or null when it is being processed in place */
  seg: [string, string] | null;
  /** node doing the work at this step */
  from: string;
  ttl: number;
  src: string;
  dst: string;
  /** true once the router has rewritten the source address */
  nat: boolean;
  /** short label for the panel header */
  at: string;
  simple: string;
  technical: string;
  packet: string;
};

export const remoteSteps: IpStep[] = [
  { seg: null, from: 'pc1', ttl: 64, src: '192.168.1.10:52310', dst: '203.0.113.20:443', nat: false, at: 'PC-1',
    simple: 'PC-1 wants a page from the web server. First it must decide: is that address on my own network, or somewhere else?',
    technical: 'PC-1 ANDs 203.0.113.20 against its mask 255.255.255.0. Result is not 192.168.1.0/24 — the destination is remote.',
    packet: 'route lookup: 203.0.113.20 & /24 → not local → use default gateway 192.168.1.1' },
  { seg: ['pc1', 'sw'], from: 'pc1', ttl: 64, src: '192.168.1.10:52310', dst: '203.0.113.20:443', nat: false, at: 'wire → switch',
    simple: 'Because the target is remote, PC-1 hands the packet to its default gateway — the router. The IP addresses inside do not change.',
    technical: 'Frame is addressed to the gateway MAC, but the IP header still says dst 203.0.113.20. L2 changes hop to hop; L3 does not.',
    packet: 'eth.dst=router_mac  ip.src=192.168.1.10  ip.dst=203.0.113.20  ttl=64' },
  { seg: ['sw', 'rt'], from: 'sw', ttl: 64, src: '192.168.1.10:52310', dst: '203.0.113.20:443', nat: false, at: 'switch → router',
    simple: 'The switch is not a router — it just moves the frame to the right port. It never looks at the IP address.',
    technical: 'Switch forwards on destination MAC via its CAM table. The IP header is untouched; TTL is not decremented by an L2 device.',
    packet: 'switch: CAM hit → egress port 5  (ip header unmodified, ttl still 64)' },
  { seg: null, from: 'rt', ttl: 63, src: '80.12.16.10:40001', dst: '203.0.113.20:443', nat: true, at: 'ROUTER',
    simple: 'The router rewrites the sender’s private address to its own public one, and notes the swap so replies can find their way home.',
    technical: 'NAT/PAT: src 192.168.1.10:52310 → 80.12.16.10:40001, recorded in the translation table. TTL 64→63 and the checksum is recomputed.',
    packet: 'nat: 192.168.1.10:52310 → 80.12.16.10:40001   ttl=63   checksum recalculated' },
  { seg: ['rt', 'isp'], from: 'rt', ttl: 62, src: '80.12.16.10:40001', dst: '203.0.113.20:443', nat: true, at: 'ISP hop',
    simple: 'Out on the internet, every router the packet passes takes one off its time-to-live counter.',
    technical: 'Each hop decrements TTL by 1 and re-checksums. If TTL ever hits 0 the packet is dropped and ICMP Time Exceeded is returned.',
    packet: 'isp router: ttl 63 → 62   next-hop lookup in BGP table' },
  { seg: ['isp', 'web'], from: 'isp', ttl: 61, src: '80.12.16.10:40001', dst: '203.0.113.20:443', nat: true, at: '→ web server',
    simple: 'One more hop and the packet reaches the server that owns that address.',
    technical: 'Final hop delivers to 203.0.113.20. TTL 62→61; the destination address matches a local interface.',
    packet: 'ttl 62 → 61   ip.dst matches local interface → deliver upward' },
  { seg: null, from: 'web', ttl: 61, src: '80.12.16.10:40001', dst: '203.0.113.20:443', nat: true, at: 'DELIVERED',
    simple: 'The server sees its own address, strips the IP wrapper, and hands the contents to the web service listening on port 443.',
    technical: 'Destination matches, so IP de-encapsulates and passes the payload to TCP, which delivers it to the socket on port 443.',
    packet: 'deliver: ip.proto=6 (TCP) → dport 443 → https listener' },
  { seg: ['web', 'pc1'], from: 'web', ttl: 64, src: '203.0.113.20:443', dst: '192.168.1.10:52310', nat: false, at: 'reply → PC-1',
    simple: 'The reply comes back to the router’s public address. The router looks up its note and sends it on to PC-1 — the only machine that asked.',
    technical: 'Reply arrives for 80.12.16.10:40001. The router reverses the translation to 192.168.1.10:52310 and forwards it into the LAN.',
    packet: 'un-nat: 80.12.16.10:40001 → 192.168.1.10:52310   fresh ttl=64 from server' },
];

export const localSteps: IpStep[] = [
  { seg: null, from: 'pc1', ttl: 64, src: '192.168.1.10:52310', dst: '192.168.1.23:445', nat: false, at: 'PC-1',
    simple: 'This time PC-1 wants PC-3, which is on the same network. The decision comes out differently.',
    technical: '192.168.1.23 ANDed with /24 gives 192.168.1.0 — the same subnet PC-1 is on. No gateway needed.',
    packet: 'route lookup: 192.168.1.23 & /24 = 192.168.1.0 → LOCAL → deliver directly' },
  { seg: ['pc1', 'sw'], from: 'pc1', ttl: 64, src: '192.168.1.10:52310', dst: '192.168.1.23:445', nat: false, at: 'wire → switch',
    simple: 'The frame is addressed straight to PC-3, not to the router. The router never sees this packet at all.',
    technical: 'Destination MAC is PC-3’s (from ARP cache). The datagram is handed to the switch for local delivery.',
    packet: 'eth.dst=pc3_mac  ip.dst=192.168.1.23  ttl=64  (gateway not involved)' },
  { seg: ['sw', 'pc3'], from: 'sw', ttl: 64, src: '192.168.1.10:52310', dst: '192.168.1.23:445', nat: false, at: 'switch → PC-3',
    simple: 'The switch delivers it. No router touched it, so nothing was translated and the TTL never moved.',
    technical: 'Single L2 hop. No NAT, no TTL decrement, no public address involved — the packet never left the broadcast domain.',
    packet: 'delivered locally: ttl still 64, src still 192.168.1.10, no NAT entry created' },
];

export const stepsFor = (dest: IpDest) => (dest === 'local' ? localSteps : remoteSteps);
