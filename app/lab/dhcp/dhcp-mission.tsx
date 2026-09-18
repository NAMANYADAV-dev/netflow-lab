import type { ScenarioMission } from '../LabMission';
import type { Scenario } from './dhcp-data';

/* Mission, step prompts and end-of-lab questions for each DHCP scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<Scenario, ScenarioMission> = {
  fresh: {
    mission: 'Get PC-1 onto the network from nothing but a MAC address.',
    nudges: [
      'PC-1 has no IP address and doesn’t know where a DHCP server is. Who can it send its first message to?',
      'A server heard the call. What does it need to send back so PC-1 can actually use the network?',
      'PC-1 has an offer, but more than one server could have made one. How does it accept this one and let the others know?',
      'PC-1 asked for the address. What does the server still have to do before the lease is final?',
    ],
    checks: [
      {
        q: 'Why is the DISCOVER sent as a broadcast?',
        options: [
          'Broadcasts are faster than unicast.',
          'The client has no address and doesn’t know where the server is, so it has to reach everyone.',
          'DHCP servers only listen on the broadcast address.',
        ],
        correct: 1,
        why: 'With no IP of its own and no idea where a server lives, the client can’t address anyone directly. Sending to 255.255.255.255 reaches every host on the segment, and a server answers.',
      },
      {
        q: 'What does PC-1 actually get at the end of DORA?',
        options: [
          'Just an IP address.',
          'A permanent address that it now owns.',
          'An address plus mask, gateway, DNS servers and a lease time.',
        ],
        correct: 2,
        why: 'The OFFER and ACK carry the whole configuration: address, mask (option 1), gateway (option 3), DNS servers (option 6) and lease time (option 51). The address is only borrowed until the lease runs out.',
      },
    ],
  },
  renew: {
    mission: 'Keep the address you already have — with two packets and no broadcast.',
    nudges: [
      'The address works and nothing is broken. What on the lease clock makes PC-1 act?',
      'PC-1 has an address and knows which server issued it. Does it need to broadcast this time?',
      'The server got a renewal request for an address it already handed out. What does it send back?',
    ],
    checks: [
      {
        q: 'Why is the renewal REQUEST sent unicast instead of broadcast?',
        options: [
          'The client already has an address and knows which server gave it.',
          'Broadcasts are blocked once a lease exists.',
          'Renewal uses a different protocol from DORA.',
        ],
        correct: 0,
        why: 'At T1 the client has a working IP and the server’s identity (option 54), so it can ask that server directly. Nobody else on the segment needs to hear it.',
      },
      {
        q: 'When does the client start trying to renew?',
        options: [
          'Only once the lease has fully expired.',
          'At T1, halfway through the lease.',
          'Only when the machine reboots.',
        ],
        correct: 1,
        why: 'T1 is 50% of the lease (12 h of 24 h). Renewing early means the address never lapses. If that server has gone quiet, the client asks any server at T2 (21 h, 87.5%).',
      },
    ],
  },
};
