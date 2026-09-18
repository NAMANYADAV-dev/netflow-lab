import type { ScenarioMission } from '../LabMission';
import type { TerminalMode } from './telnet-data';

/* Mission, step prompts and end-of-lab questions for each Telnet scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<TerminalMode, ScenarioMission> = {
  char: {
    mission: 'Watch a password cross a café network in plain ASCII — one byte at a time.',
    nudges: [
      'Telnet has no login protocol of its own. What does the client do first?',
      'TCP is open. Before any typing, what do the two ends need to agree on?',
      'The terminal is set up. How does the login prompt reach you?',
      'You type “admin” in character mode. How many packets does each key cost?',
      'The server stops echoing while you type the password. Does that stop the characters crossing in the clear?',
      'You are logged in. Does anything about the session’s security change from here on?',
    ],
    checks: [
      {
        q: 'Why can anyone on the network read the Telnet password?',
        options: [
          'Telnet uses a weak cipher that is easy to break.',
          'The server prints it on the screen.',
          'It is sent as plain ASCII with no encryption at all.',
        ],
        correct: 2,
        why: 'Telnet has no encryption. Every character, password included, crosses the network as readable ASCII, and anything between you and the server can capture it.',
      },
      {
        q: 'In character mode, why does typing “admin” take ten segments?',
        options: [
          'Each key leaves as its own segment, and the server echoes it back in another.',
          'Every letter is sent twice for reliability.',
          'TCP always splits data into one byte per segment.',
        ],
        correct: 0,
        why: 'In character mode each keystroke is sent immediately, and the server echoes it so your screen can show it. Five letters, two segments each.',
      },
    ],
  },
  line: {
    mission: 'Prove that line mode fixes the chattiness and nothing else.',
    nudges: [
      'Same TCP connection, but the client wants to handle whole lines itself. What does it ask for?',
      'Line mode is on. Does it change what the server sends, like the login prompt?',
      'You type “admin”. When does anything actually leave your machine?',
      'You type the password and press Enter. Can a tap on the network still read it?',
    ],
    checks: [
      {
        q: 'What did line mode actually fix?',
        options: [
          'It encrypted the password.',
          'The number of packets: a whole line leaves at once instead of one key at a time.',
          'Nothing at all.',
        ],
        correct: 1,
        why: 'Your own terminal handles the typing and echo, and nothing is sent until Enter. The session gets far quieter, and that is all that changes.',
      },
      {
        q: 'Is the password safer in line mode?',
        options: [
          'Yes, because the echo is off.',
          'Yes, because it is harder to capture.',
          'No. It is still plain text, and now it sits in a single packet.',
        ],
        correct: 2,
        why: 'Line mode changes when bytes leave, not what they look like. One packet holding the whole password is an easier capture, not a harder one. Use SSH instead.',
      },
    ],
  },
};
