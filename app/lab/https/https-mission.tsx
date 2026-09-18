import type { ScenarioMission } from '../LabMission';
import type { Wire } from './https-data';

/* Mission, step prompts and end-of-lab questions for each HTTPS scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<Wire, ScenarioMission> = {
  tls: {
    mission: 'Send a password to example.com and find out exactly what the café wi-fi can read.',
    nudges: [
      'HTTPS still needs a transport underneath it. What gets built first, before any encryption?',
      'The TCP pipe is open. What does the browser send to start the TLS handshake?',
      'The browser offered versions, ciphers and a key share. What does the server send back?',
      'The server sent a certificate claiming to be example.com. What should the browser do before trusting it?',
      'Both sides have swapped public key shares. How do they end up with the same secret without ever sending it?',
      'The keys are ready. What happens to the GET request the browser was going to send anyway?',
      'The encrypted request reached the server. How does the reply travel back?',
    ],
    checks: [
      {
        q: 'What can the café wi-fi still see during this HTTPS request?',
        options: [
          'Your password and the page contents.',
          'The server’s IP address, port 443, and the hostname in the ClientHello.',
          'Nothing at all.',
        ],
        correct: 1,
        why: 'The request and the reply are encrypted. The addresses, the port, the size and timing of the traffic, and (without ECH, as in this lab) the hostname in the ClientHello are still visible.',
      },
      {
        q: 'Why does the browser check the certificate?',
        options: [
          'To make the connection faster.',
          'Because the shared secret key is stored inside it.',
          'To be sure it is encrypting to the real example.com and not an impostor.',
        ],
        correct: 2,
        why: 'Encrypting to the wrong party is worthless. The browser checks that the name matches, the certificate hasn’t expired, and it is signed by an authority the machine already trusts.',
      },
    ],
  },
  plain: {
    mission: 'Send the same password over port 80 — and read it back off the wire yourself.',
    nudges: [
      'Same site, but port 80. Is there anything to negotiate before sending data?',
      'The pipe is open and there is no TLS. How does the request with your password leave the machine?',
      'The request is crossing the café wi-fi as plain text. Who along the way can read it?',
      'The server answers over the same unencrypted connection. What does the reply expose?',
    ],
    checks: [
      {
        q: 'Over plain HTTP, who can read your password?',
        options: [
          'Only the server.',
          'Every device on the path: the wi-fi, the ISP, any proxy.',
          'Nobody, because the Authorization header is hidden.',
        ],
        correct: 1,
        why: 'Nothing is encrypted. Every hop between you and the server sees the full request, Authorization header included, and the full reply.',
      },
      {
        q: 'What did someone on the wi-fi have to break to read it?',
        options: [
          'Nothing. It was never encrypted.',
          'The TLS encryption.',
          'The server’s password database.',
        ],
        correct: 0,
        why: 'Nothing had to be cracked. Plain HTTP sends everything as readable text, and you saw no warning while it happened.',
      },
    ],
  },
};
