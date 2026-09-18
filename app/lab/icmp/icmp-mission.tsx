import type { ScenarioMission } from '../LabMission';
import type { IcmpTool } from './icmp-data';

/* Mission, step prompts and end-of-lab questions for each ICMP scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<IcmpTool, ScenarioMission> = {
  ping: {
    mission: 'Ping the web server at 203.0.113.20 and watch the hop counter fall on the way there.',
    nudges: [
      'Ping wants to know whether 203.0.113.20 is reachable. What kind of message does it build first?',
      'The echo request reaches the first router. What must the router do to the TTL before forwarding it?',
      'Another router on the path. What happens to the TTL this time?',
      'The echo request reached the server. What does the server do with it?',
      'The echo reply is heading home. What does ping measure when it arrives?',
    ],
    checks: [
      {
        q: 'What happens to the TTL at every router?',
        options: [
          'It goes up by one.',
          'It goes down by one.',
          'It stays the same.',
        ],
        correct: 1,
        why: 'Every router takes one off the TTL (64 → 63 → 62). If it ever reaches 0 the packet is dropped, so a lost packet can’t circle forever.',
      },
      {
        q: 'Which ICMP messages does ping use?',
        options: [
          'Type 11, Time Exceeded.',
          'Type 3, Destination Unreachable.',
          'Type 8 echo request, answered by type 0 echo reply.',
        ],
        correct: 2,
        why: 'Ping sends an echo request (type 8) and the target copies the payload back in an echo reply (type 0). Type 11 is the message traceroute relies on.',
      },
    ],
  },
  trace: {
    mission: 'Map the path to 203.0.113.20 using nothing but packets that die on purpose.',
    nudges: [
      'Traceroute’s first probe has a TTL of exactly 1. Where will it die, and what does that router send back?',
      'The first router reported itself. What TTL should the next probe use to reach one hop further?',
      'Two routers are mapped. With TTL 3 the probe survives both. What happens this time?',
    ],
    checks: [
      {
        q: 'How does traceroute find each router on the path?',
        options: [
          'It sends probes with TTL 1, 2, 3…, and each router that drops one replies with ICMP Time Exceeded.',
          'It asks every router for its name.',
          'It reads the ISP’s routing table.',
        ],
        correct: 0,
        why: 'A probe dies where its TTL reaches 0, and that router sends back ICMP type 11 from its own address. Raising the TTL by one each time reveals the next hop.',
      },
      {
        q: 'How does traceroute know it has reached the destination?',
        options: [
          'The last router says so.',
          'It gets a real reply from the target instead of a Time Exceeded.',
          'The TTL reaches 64.',
        ],
        correct: 1,
        why: 'The third probe lives long enough to arrive, and the answer comes from the server itself, not a complaint from a router. That means the path is fully mapped.',
      },
    ],
  },
};
