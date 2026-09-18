import type { ScenarioMission } from '../LabMission';
import type { Pickup } from './mail-data';

const mission = 'Follow one email from Alice’s laptop to Bob’s phone — and name the protocol at every box.';

/* the first five steps are the same in both scenarios: SMTP gets the mail to
   Bob's mailbox, and only the pick-up differs */
const sharedNudges = [
  'Nothing has left Alice’s laptop yet. What has to happen before any protocol gets involved?',
  'Alice pressed Send. Her app won’t contact Bob directly. Who does it hand the mail to first, and with which protocol?',
  'Alice’s server has mail for bob@corp.net. What does it need to find out before it can pass the mail on?',
  'DNS named corp.net’s mail server. How does Alice’s server get the mail there?',
  'Bob’s server accepted the mail. Where does it put it, and is SMTP finished?',
];

/* Mission, step prompts and end-of-lab questions for each pick-up scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<Pickup, ScenarioMission> = {
  imap: {
    mission,
    nudges: [
      ...sharedNudges,
      'The mail is in Bob’s mailbox. How does his phone see it with IMAP, and does the original stay on the server?',
      'Bob reads the mail on his phone. What will his laptop show when it opens the same mailbox?',
      'Bob hits Reply. Can the IMAP connection carry his reply?',
    ],
    checks: [
      {
        q: 'Which protocol delivers the mail into Bob’s mailbox?',
        options: [
          'IMAP.',
          'SMTP.',
          'DNS.',
        ],
        correct: 1,
        why: 'SMTP carries the mail twice: laptop → Alice’s server on 587, then Alice’s server → Bob’s server on 25. It stops at Bob’s mailbox. IMAP only reads it from there.',
      },
      {
        q: 'Why does the laptop already show the mail as read?',
        options: [
          'The phone synced with the laptop directly.',
          'The laptop guessed from the phone’s activity.',
          'The read flag is stored in the mailbox on the server, and both devices read that one mailbox.',
        ],
        correct: 2,
        why: 'With IMAP the mail and its flags live on the server. Your devices don’t sync with each other; they all look at the same mailbox.',
      },
    ],
  },
  pop: {
    mission,
    nudges: [
      ...sharedNudges,
      'The mail is in Bob’s mailbox. This phone uses POP3. What does it do with the message?',
      'The phone downloaded the message and then deleted it. What will the laptop find when it logs in?',
      'Bob hits Reply. Can POP3 send it?',
    ],
    checks: [
      {
        q: 'How does Alice’s server find where to deliver mail for corp.net?',
        options: [
          'It asks DNS for corp.net’s MX record.',
          'It broadcasts the mail across the internet.',
          'Alice types the server name into her app.',
        ],
        correct: 0,
        why: 'The server reads the part after the @ and asks DNS who accepts mail for corp.net. The MX record names that server. No mail moves during the lookup.',
      },
      {
        q: 'Why is the laptop’s inbox empty?',
        options: [
          'The laptop’s login failed.',
          'The phone downloaded the message and then deleted it with DELE.',
          'POP3 can’t show mail older than a day.',
        ],
        correct: 1,
        why: 'The login worked. The phone sent RETR, then DELE and QUIT, so the server copy is gone. Deleting is the client’s choice; a POP3 client can also be set to leave mail on the server.',
      },
    ],
  },
};
