import type { ScenarioMission } from '../LabMission';
import type { DataMode } from './ftp-data';

/* Mission, step prompts and end-of-lab questions for each FTP scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<DataMode, ScenarioMission> = {
  passive: {
    mission: 'Download report.pdf, and count how many TCP connections it really takes.',
    nudges: [
      'Nothing is connected yet. Which well-known FTP port does the client connect to first?',
      'The server said hello. What does the client have to do before it can ask for files?',
      'The client wants a file, but files don’t travel on this connection. What does it ask the server for?',
      'The server picked a spare port. How does it tell the client where that port is?',
      'The client now knows the server’s address and port. What does it open next?',
      'Two connections are open. Which one carries the RETR command, and which one carries the file?',
      'The file has finished arriving. What happens to each of the two connections?',
    ],
    checks: [
      {
        q: 'How many TCP connections does downloading one file take?',
        options: [
          'One.',
          'Two: the control connection on port 21 and a separate data connection.',
          'Three: one for login, one for commands, one for data.',
        ],
        correct: 1,
        why: 'Commands and replies travel on the control connection to port 21, which stays open for the whole session. The file travels on a second connection opened just for this transfer and closed when it ends.',
      },
      {
        q: 'In passive mode, who opens the data connection?',
        options: [
          'The client, to a port the server chose.',
          'The server, back to the client.',
          'The home router, on behalf of both.',
        ],
        correct: 0,
        why: 'PASV asks the server to listen on a spare port, and the 227 reply names it. The client then connects out to it. An outbound connection passes through NAT with no trouble, which is why passive mode is the default today.',
      },
    ],
  },
  active: {
    mission: 'Fetch the same file the original way — and find out where it dies.',
    nudges: [
      'Same start as passive mode. Where does the client connect first?',
      'Connected. What has to happen before any file commands?',
      'In active mode the client doesn’t ask the server for a port. What does it tell the server instead?',
      'The server was told where to call. Which side opens the data connection this time?',
      'The server’s SYN is heading into a home network behind NAT, and nothing inside asked for it. What will the router do?',
      'The data connection never opened. Which connection is left to report the failure?',
    ],
    checks: [
      {
        q: 'Why does active-mode FTP fail here?',
        options: [
          'The password was wrong.',
          'Port 21 is blocked.',
          'The server’s inbound connection to the client is dropped by the home router.',
        ],
        correct: 2,
        why: 'Login and commands worked fine. The server tried to open a new connection into the home network, and the router had no NAT mapping for an unsolicited SYN, so it threw it away.',
      },
      {
        q: 'Which connection reports the failure?',
        options: [
          'The data connection.',
          'The control connection, with a 425 reply.',
          'Neither. The client just waits forever.',
        ],
        correct: 1,
        why: 'The data connection never existed. The server reports “425 Can’t open data connection” on the control connection, which worked perfectly the whole time.',
      },
    ],
  },
};
