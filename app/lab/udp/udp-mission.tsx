import type { ScenarioMission } from '../LabMission';
import type { Wire } from './udp-data';

/* Mission, step prompts and end-of-lab questions for each UDP scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<Wire, ScenarioMission> = {
  clean: {
    mission: 'Send four datagrams to 203.0.113.20:5060 with no handshake, no acknowledgement, and no waiting.',
    nudges: [
      'UDP has no handshake. What does the app need before the first datagram can leave?',
      'The socket is open. What happens to datagram 1?',
      'Datagram 1 arrived. Does UDP keep any record that links it to datagram 2?',
      'Datagram 3 goes out on a clean wire. Will it arrive?',
      'The last datagram. Does the receiver acknowledge anything when the stream ends?',
    ],
    checks: [
      {
        q: 'What does UDP do before sending the first datagram?',
        options: [
          'A three-way handshake.',
          'It asks the receiver for permission.',
          'Nothing. The app writes to a socket and the datagram leaves.',
        ],
        correct: 2,
        why: 'UDP is connectionless: no SYN, no state, no window. The first datagram leaves before TCP would have finished saying hello.',
      },
      {
        q: 'How big is the UDP header?',
        options: [
          '8 bytes.',
          '20 bytes.',
          '40 bytes.',
        ],
        correct: 0,
        why: 'Four 2-byte fields: source port, destination port, length and checksum. TCP’s header is at least 20 bytes.',
      },
    ],
  },
  lossy: {
    mission: 'Send the same four datagrams across a congested wire — and find out who reports the one that vanishes.',
    nudges: [
      'UDP has no handshake. What does the app need before the first datagram can leave?',
      'The wire is congested somewhere along the path. Does datagram 1 still get through?',
      'Datagram 2 goes out. Is anything different so far?',
      'Datagram 3 reaches a router whose queue is full. What happens to it, and who is told?',
      'Datagram 4 goes out after the loss. Does UDP slow down or resend anything?',
    ],
    checks: [
      {
        q: 'Who reports that datagram 3 was lost?',
        options: [
          'The router that dropped it.',
          'Nobody. UDP has no acknowledgements, so neither end notices.',
          'The receiver.',
        ],
        correct: 1,
        why: 'The router silently drops it. UDP has no sequence numbers to reveal a gap and no timer to expire, so the sender has moved on and the receiver never knew to expect it.',
      },
      {
        q: 'If this app needs every datagram, what must it do?',
        options: [
          'Nothing. UDP will resend it automatically.',
          'Send bigger datagrams.',
          'Handle it itself, with sequence numbers and resends, or use TCP instead.',
        ],
        correct: 2,
        why: 'Ordering and completeness are the application’s problem with UDP. Apps that need them build their own on top (as QUIC does) or use TCP.',
      },
    ],
  },
};
