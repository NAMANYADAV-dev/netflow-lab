import type { ScenarioMission } from '../LabMission';
import type { Scenario } from './snmp-data';

/* Mission, step prompts and end-of-lab questions for each SNMP scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<Scenario, ScenarioMission> = {
  poll: {
    mission: <>Watch a router: measure how busy port <code>Gi0/2</code> is, then <b>catch the alarm</b> when it fails.</>,
    nudges: [
      'The server wants to know how long the router has been up. What kind of message does it send?',
      'The router received a GetRequest for its uptime. What does it send back?',
      'Now the server wants the name, status and byte count of all three ports. Does it need nine separate questions?',
      'The router received one GetBulk. What comes back?',
      'A byte count is a running total, not a speed. What does the server need to turn it into a rate?',
      'The router answers the second reading. What can the server work out now?',
      'Someone unplugs Gi0/2. Does the router wait to be asked about it?',
    ],
    checks: [
      {
        q: 'Why is SNMPv2c risky on a network you don’t trust?',
        options: [
          'It runs over TCP, which is slow.',
          'The community string (“public”) travels in plain text with every request.',
          'It can’t read interface counters.',
        ],
        correct: 1,
        why: 'The community string is the only password v2c has, and it rides unhidden alongside every question. Anyone who can see the traffic can read it and reuse it.',
      },
      {
        q: 'How is the 45 Mbit/s traffic rate worked out?',
        options: [
          'The router reports its speed directly.',
          'By counting the packets on the wire.',
          'From two readings of the byte counter 60 seconds apart: the difference × 8 ÷ 60.',
        ],
        correct: 2,
        why: 'The counter is a running total since boot. It grew by 337,500,000 bytes in 60 s: × 8 gives bits, ÷ 60 gives 45 Mbit/s. Every traffic graph is built this way.',
      },
    ],
  },
  secure: {
    mission: <>Ask the router the same question with <b>SNMPv3</b>, so nobody else can read the answer.</>,
    nudges: [
      'In SNMPv3 a key only works for one router’s engine ID, and the server doesn’t know it yet. What does it send first?',
      'The router received an empty discovery request. What does its reply contain?',
      'The server now has the engine ID and the clock. How does it send the real question?',
      'The router answers. How does the server know the reply is genuine, and how does it read it?',
    ],
    checks: [
      {
        q: 'Why does the first SNMPv3 request get a Report instead of an answer?',
        options: [
          'The password was wrong.',
          'The server didn’t know the router’s engine ID and clock yet, so it sent an empty discovery request.',
          'SNMPv3 always refuses the first request on purpose.',
        ],
        correct: 1,
        why: 'v3 keys are tied to one router’s engine ID. The discovery request is turned down, but the Report carries the engine ID and clock, which is everything needed to build a key only this router accepts.',
      },
      {
        q: 'What does authPriv add to the request?',
        options: [
          'A signature so it can’t be faked, and encryption so it can’t be read.',
          'A longer community string.',
          'A faster transport.',
        ],
        correct: 0,
        why: '“auth” signs the message so the other side can prove it is genuine and unchanged. “Priv” encrypts it, so an eavesdropper sees only scrambled bytes.',
      },
    ],
  },
};
