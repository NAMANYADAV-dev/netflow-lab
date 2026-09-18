import type { ScenarioMission } from '../LabMission';
import type { IpDest } from './ip-data';

const mission = (
  <>
    Route one IP datagram from <code data-tone="a">PC-1 192.168.1.10</code> to{' '}
    <code data-tone="b">203.0.113.20</code>. It carries a TCP segment for port 443 — watch what each layer changes.
  </>
);

/* Mission, step prompts and end-of-lab questions for each IP scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<IpDest, ScenarioMission> = {
  remote: {
    mission,
    nudges: [
      'PC-1 wants to reach 203.0.113.20. What does it have to decide before sending anything?',
      'The destination is on another network. Who does PC-1 hand the packet to?',
      'The frame reaches the switch. Does the switch look at the IP address?',
      'The packet is at the router, about to leave the private network. What has to change in it?',
      'The packet is out on the internet. What happens to its TTL at each router?',
      'One more hop to go. Where does the packet arrive next?',
      'The server received a packet addressed to itself. What does it do with the contents?',
      'The reply comes back to the router’s public address. How does the router know to send it to PC-1?',
    ],
    checks: [
      {
        q: 'Why does PC-1 send the packet to the router instead of straight to 203.0.113.20?',
        options: [
          'The switch told it to.',
          'The destination isn’t on PC-1’s own network, so it goes to the default gateway.',
          'Every packet has to go through the router.',
        ],
        correct: 1,
        why: 'PC-1 compares the destination with its own network, 192.168.1.0/24. 203.0.113.20 is outside it, so PC-1 sends the frame to its default gateway, the router.',
      },
      {
        q: 'What does the router change in the outgoing packet?',
        options: [
          'Nothing. Routers only read packets.',
          'Only the destination address.',
          'The source address and port (NAT), and the TTL.',
        ],
        correct: 2,
        why: 'The router swaps the private source 192.168.1.10:52310 for its public 80.12.16.10:40001, notes the swap for the reply, takes one off the TTL and recalculates the checksum. The destination is untouched.',
      },
    ],
  },
  local: {
    mission,
    nudges: [
      'PC-1 wants PC-3 at 192.168.1.23. Is that on its own network or somewhere else?',
      'PC-3 is local. Who is the frame addressed to this time?',
      'The switch has the frame. Will anything in the IP header change on the way to PC-3?',
    ],
    checks: [
      {
        q: 'Why does the router never see this packet?',
        options: [
          'PC-3 is on the same network, so PC-1 sends it straight there through the switch.',
          'The router is switched off.',
          'Local packets are always broadcast.',
        ],
        correct: 0,
        why: '192.168.1.23 is inside 192.168.1.0/24, so PC-1 addresses the frame directly to PC-3. No router hop is needed.',
      },
      {
        q: 'What happens to the TTL on the way to PC-3?',
        options: [
          'It drops by one at the switch.',
          'It resets to 128.',
          'It stays at 64, because no router touched the packet.',
        ],
        correct: 2,
        why: 'Only routers decrement the TTL. A switch forwards frames without looking inside the IP header, so nothing is translated and the TTL never moves.',
      },
    ],
  },
};
