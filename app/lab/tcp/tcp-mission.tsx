import type { ScenarioMission } from '../LabMission';

/* Mission, step prompts and end-of-lab questions for the TCP lab, which has
   a single scenario. nudges[i] is asked before segment i + 1 is sent. */
export const MISSION: ScenarioMission = {
  mission: (
    <>
      Open a reliable connection to <code>93.184.216.34:443</code> — complete the{' '}
      <b>three-way handshake</b>, then close it cleanly.
    </>
  ),
  nudges: [
    'Nothing is connected yet. What does the client send first, and which number does it include?',
    'The server received a SYN. Which two things does its reply contain?',
    'The client has the server’s SYN-ACK. What is the last step before the connection is open?',
    'The connection is ESTABLISHED and the client has finished sending. How does it start closing?',
    'The server received the client’s FIN, but it may still have data to send. What does it send first?',
    'The server has finished too. What does it send now?',
    'The server sent its FIN. What must the client send to finish the close?',
  ],
  checks: [
    {
      q: 'Why does the SYN-ACK acknowledge the client’s ISN + 1?',
      options: [
        'The server adds 1 to every number it sees.',
        'A SYN uses up one sequence number, so the next byte expected is ISN + 1.',
        'The + 1 is a checksum.',
      ],
      correct: 1,
      why: 'SYN (and FIN) each consume one sequence number even though they carry no data. Acknowledging ISN + 1 says “I got your SYN, the next byte I expect is this one.”',
    },
    {
      q: 'Why does opening take three segments but closing takes four?',
      options: [
        'Each side closes its own half separately, and the server may still have data to send after the client’s FIN.',
        'FIN segments are bigger than SYN segments.',
        'The server doesn’t trust the client’s FIN.',
      ],
      correct: 0,
      why: 'Opening combines the server’s SYN and ACK in one segment. When closing, the server ACKs the client’s FIN straight away but sends its own FIN only once it has finished, so the two can’t always be combined.',
    },
  ],
};
