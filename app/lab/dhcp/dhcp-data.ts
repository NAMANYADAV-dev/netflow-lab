/* The DHCP lab gets one machine onto the network, twice.

   Fresh boot is DORA: four messages. DISCOVER and REQUEST are broadcasts; this
   scenario also broadcasts OFFER and ACK because the client requests broadcast
   replies with the DHCP flags field. A capable client can clear that flag and
   receive OFFER and ACK by unicast. Renewal is a quiet two-message unicast
   exchange, which is what a working network usually carries. */

export type Scenario = 'fresh' | 'renew';

/** up = client→server · down = server→client · idle = a local timer firing */
export type Flow = 'up' | 'down' | 'idle';
/** how far the frame travels: the whole segment, one port, or nowhere */
export type Cast = 'bcast' | 'ucast' | 'none';

export type DhcpStep = {
  tag: string;
  flow: Flow;
  cast: Cast;
  at: string;
  /** the checklist line: the tag plus the half of `at` after the dash */
  walkLabel: string;
  simple: string;
  technical: string;
  packet: string;
};

export const XID = '0x3f2a91c4';
export const CLIENT_MAC = 'a4:5e:60:c2:11:07';

export const freshSteps: DhcpStep[] = [
  { tag: 'DISCOVER', flow: 'up', cast: 'bcast',
    at: 'DHCPDISCOVER — "is anyone out there?"',
    walkLabel: 'DISCOVER — "is anyone out there?"',
    simple: 'The machine has no address at all, so it cannot address anybody either. All it can do is shout to the whole segment and hope something answers.',
    technical: 'Source 0.0.0.0, destination 255.255.255.255, UDP 68 → 67. ciaddr is zero, chaddr carries the MAC, and a random xid tags the transaction so replies can be matched. The switch floods it out every port.',
    packet: `0.0.0.0:68 > 255.255.255.255:67  BOOTREQUEST  xid=${XID}  chaddr=${CLIENT_MAC}` },
  { tag: 'OFFER', flow: 'down', cast: 'bcast',
    at: 'DHCPOFFER — an address plus everything else',
    walkLabel: 'OFFER — an address plus everything else',
    simple: 'The server picks a free address and offers it — and attaches the rest of the settings the machine needs: the mask, the gateway, who to ask about names, and how long it may keep all of it.',
    technical: 'yiaddr = 192.168.1.10, reserved but not yet committed. Options carry 1 (mask), 3 (router), 6 (DNS), 51 (lease time) and 54 (server identifier). This lab broadcasts the reply because the client set the BROADCAST flag; clients able to receive an early unicast can clear it.',
    packet: '192.168.1.1:67 > 255.255.255.255:68  BOOTREPLY  yiaddr=192.168.1.10  opt53=2  opt51=86400' },
  { tag: 'REQUEST', flow: 'up', cast: 'bcast',
    at: 'DHCPREQUEST — "that one, please"',
    walkLabel: 'REQUEST — "that one, please"',
    simple: 'The machine formally accepts the offer. It shouts again rather than replying quietly, so that any other server that offered knows its offer was refused.',
    technical: 'Broadcast REQUEST echoing option 50 (requested address) and option 54 (the chosen server id). This is what makes DORA four steps rather than two: with several servers on the segment, the losers see the rejection and release their reservations.',
    packet: '0.0.0.0:68 > 255.255.255.255:67  BOOTREQUEST  opt53=3  opt50=192.168.1.10  opt54=192.168.1.1' },
  { tag: 'ACK', flow: 'down', cast: 'bcast',
    at: 'DHCPACK — the lease is committed',
    walkLabel: 'ACK — the lease is committed',
    simple: 'The server writes the binding down and confirms it. Only now does the machine configure the interface and start the clock on the lease.',
    technical: 'ACK commits MAC → 192.168.1.10 in the lease database for 86,400 seconds. This client requested a broadcast reply; with the BROADCAST flag clear, a server normally unicasts OFFER and ACK when possible. The client can then probe for an address conflict before installing the configuration.',
    packet: '192.168.1.1:67 > 255.255.255.255:68  BOOTREPLY  opt53=5  yiaddr=192.168.1.10  lease=86400s' },
];

export const renewSteps: DhcpStep[] = [
  { tag: 'T1', flow: 'idle', cast: 'none',
    at: 'T1 reached — 12 hours in, half the lease gone',
    walkLabel: 'T1 — 12 hours in, half the lease gone',
    simple: 'Nothing has broken. The address still works. But half the lease has run out, and it is the machine’s job to notice and ask for more time.',
    technical: 'At T1 (50% of the lease) the client leaves BOUND and enters RENEWING. Nothing is on the wire yet; this is a timer firing locally. At T2 (87.5%) it would give up on its own server and broadcast to any server instead.',
    packet: 'state BOUND -> RENEWING   t1=43200s elapsed   lease 86400s   addr 192.168.1.10 still valid' },
  { tag: 'REQUEST', flow: 'up', cast: 'ucast',
    at: 'DHCPREQUEST — unicast, straight to the server',
    walkLabel: 'REQUEST — unicast, straight to the server',
    simple: 'This time it has an address and it knows exactly who gave it out, so it asks quietly and directly. Nobody else on the network hears a thing.',
    technical: 'Unicast from 192.168.1.10:68 to 192.168.1.1:67 with ciaddr filled in. No DISCOVER and no OFFER — renewal is a two-message exchange, because there is nothing left to discover.',
    packet: '192.168.1.10:68 > 192.168.1.1:67  BOOTREQUEST  opt53=3  ciaddr=192.168.1.10  (unicast)' },
  { tag: 'ACK', flow: 'down', cast: 'ucast',
    at: 'DHCPACK — same address, clock reset',
    walkLabel: 'ACK — same address, clock reset',
    simple: 'Granted. Same address as before, and the 24 hours start again from zero. This is why a machine can sit on one address for months without ever repeating the noisy part.',
    technical: 'ACK unicast back, lease timer reset to 86,400s and T1/T2 recomputed. The address is unchanged because the binding was never released — DHCP prefers to hand the same client the same address.',
    packet: '192.168.1.1:67 > 192.168.1.10:68  BOOTREPLY  opt53=5  lease=86400s  (renewed, no change)' },
];

export const stepsFor = (sc: Scenario) => (sc === 'renew' ? renewSteps : freshSteps);

export const freshWire = [
  { text: `0.0.0.0.68 > 255.255.255.255.67   DHCP DISCOVER   xid ${XID}   chaddr ${CLIENT_MAC}`, color: 'var(--b)' },
  { text: '   ↳ flooded to every port — PC-2 and PC-3 receive it and drop it', color: 'var(--text3)' },
  { text: '192.168.1.1.67 > 255.255.255.255.68   DHCP OFFER   yiaddr 192.168.1.10   lease 86400', color: 'var(--a)' },
  { text: '   ↳ options: mask 255.255.255.0 · router 192.168.1.1 · dns 1.1.1.1, 8.8.8.8', color: 'var(--a)' },
  { text: '0.0.0.0.68 > 255.255.255.255.67   DHCP REQUEST   requested 192.168.1.10   server 192.168.1.1', color: 'var(--b)' },
  { text: '   ↳ broadcast on purpose — any other server that offered now withdraws', color: 'var(--text3)' },
  { text: '192.168.1.1.67 > 255.255.255.255.68   DHCP ACK   yiaddr 192.168.1.10   lease 86400', color: 'var(--ok)' },
  { text: '   ↳ interface configured · lease clock started · t1 43200  t2 75600', color: 'var(--ok)' },
];

export const renewWire = [
  { text: '[local] t1 timer fired at 43200s — state BOUND → RENEWING, nothing sent yet', color: 'var(--text3)' },
  { text: '192.168.1.10.68 > 192.168.1.1.67   DHCP REQUEST   ciaddr 192.168.1.10   (unicast)', color: 'var(--b)' },
  { text: '   ↳ no discover, no offer, no broadcast — the switch forwards it out one port', color: 'var(--text3)' },
  { text: '192.168.1.1.67 > 192.168.1.10.68   DHCP ACK   lease 86400   (renewed)', color: 'var(--ok)' },
  { text: '   ↳ same address, timers reset — two packets instead of four', color: 'var(--ok)' },
];

/** how many wire lines are visible after each step */
export const wireCounts: Record<Scenario, number[]> = {
  fresh: [2, 4, 6, 8],
  renew: [1, 3, 5],
};
