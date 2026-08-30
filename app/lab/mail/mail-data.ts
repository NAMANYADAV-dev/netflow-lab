/* One email, followed the whole way — and the point is that no single protocol
   carries it.

   SMTP pushes: laptop → her server → his server → a file in his mailbox, and
   then it stops. It never reaches a phone. Getting it out of that mailbox is a
   different job with a different protocol, and which one Bob picked changes
   where his mail ends up living. Running IMAP and POP3 over the same five
   opening steps is what makes that difference visible. */

export type Pickup = 'imap' | 'pop';

/** the colour keys the wire log uses, resolved against the lab palette */
export type WireTone = 'a' | 'b' | 'ok' | 'rst' | 'sim' | 'text3';

export type WireLine = { t: string; c: WireTone };

export type MailStep = {
  /** short name for the advance button and the explain header */
  tag: string;
  /** the checklist line */
  at: string;
  /** which protocol is doing the work, shown as a tag beside the step */
  proto: string;
  wire: WireLine[];
  simple: string;
  technical: string;
  packet: string;
};

/* the five that are the same however Bob reads his mail */
const shared: MailStep[] = [
  { tag: 'SEND', at: 'Alice writes the mail and hits Send', proto: '—',
    wire: [{ t: '(nothing on the network yet — the mail is still a draft on her laptop)', c: 'text3' }],
    simple: 'Nothing has travelled anywhere. The mail is text sitting on Alice’s laptop. Pressing Send is the moment her app has to hand it to a server — and to do that it needs a protocol.',
    technical: 'The client (MUA) composes an RFC 5322 message: headers (From, To, Subject, Date) followed by a blank line and the body. Nothing is transmitted until it opens a submission connection.',
    packet: 'From: alice@example.com\nTo: bob@corp.net\nSubject: Q3 numbers\n\nHere are the numbers.' },

  { tag: 'HAND OFF 1', at: 'Laptop → her own outgoing server', proto: 'SMTP 587',
    wire: [
      { t: 'S: 220 smtp.example.com ESMTP ready', c: 'a' },
      { t: 'C: EHLO laptop.example.com', c: 'b' },
      { t: 'C: STARTTLS · AUTH LOGIN alice •••', c: 'sim' },
      { t: 'C: MAIL FROM:<alice@example.com>', c: 'b' },
      { t: 'C: RCPT TO:<bob@corp.net>', c: 'b' },
      { t: 'S: 250 OK · queued as 8A21F', c: 'ok' },
    ],
    simple: 'Her app does not phone Bob. It hands the mail to one server it trusts — her provider’s outgoing server — and logs in first, so only Alice can send as Alice. That hand-off is SMTP.',
    technical: 'This is submission (RFC 6409) on port 587: STARTTLS then SMTP AUTH, then the envelope (MAIL FROM / RCPT TO) which is separate from the visible From: header. Accepting the message transfers responsibility for it.',
    packet: '220 ESMTP ready → EHLO → STARTTLS → AUTH LOGIN → MAIL FROM:<alice@example.com> → RCPT TO:<bob@corp.net> → DATA → 250 OK' },

  { tag: 'LOOK UP', at: 'Which server owns corp.net mail?', proto: 'DNS',
    wire: [
      { t: '? MX corp.net', c: 'b' },
      { t: '= 10 mx.corp.net', c: 'a' },
      { t: '? A mx.corp.net = 203.0.113.20', c: 'a' },
    ],
    simple: 'The server reads the part after the @ and asks DNS a very specific question: who accepts mail for corp.net? The answer is an MX record. No mail moves during this step.',
    technical: 'MX lookup with preference values, then A/AAAA resolution of the chosen host. MX is what makes email addresses portable — the domain need not be the mail host.',
    packet: 'dig MX corp.net → 10 mx.corp.net. → dig A mx.corp.net → 203.0.113.20' },

  { tag: 'HAND OFF 2', at: 'Her server → Bob’s mail server', proto: 'SMTP 25',
    wire: [
      { t: 'S: 220 mx.corp.net ESMTP', c: 'a' },
      { t: 'C: EHLO smtp.example.com', c: 'b' },
      { t: 'C: MAIL FROM:<alice@example.com>', c: 'b' },
      { t: 'C: RCPT TO:<bob@corp.net>', c: 'b' },
      { t: 'C: DATA … 2,104 bytes … .', c: 'b' },
      { t: 'S: 250 2.0.0 Ok: queued', c: 'ok' },
    ],
    simple: 'A second, completely separate SMTP conversation — server to server, no password this time, port 25. Same protocol, different relationship. This is the hop that crosses the internet.',
    technical: 'Relay on port 25 is unauthenticated by design, which is why SPF, DKIM and DMARC exist to judge whether this sender was allowed to use that domain.',
    packet: '220 mx.corp.net ESMTP → EHLO → MAIL FROM → RCPT TO → DATA → 250 2.0.0 Ok: queued as 4C7B1' },

  { tag: 'DELIVER', at: 'Written into Bob’s mailbox — SMTP is done', proto: 'SMTP ends',
    wire: [
      { t: '→ written to /var/mail/bob (2,104 bytes)', c: 'ok' },
      { t: 'C: QUIT · S: 221 Bye', c: 'text3' },
      { t: '→ SMTP’s job is over. Bob’s phone has not been contacted.', c: 'sim' },
    ],
    simple: 'The mail is now a file in Bob’s mailbox on the server. This is where SMTP stops — it never reaches a phone or a laptop. Bob could be asleep with his phone off; the mail is already delivered.',
    technical: 'The MTA passes the message to the local delivery agent, which appends it to the mailbox store (mbox/Maildir) and applies filters. Delivery is complete and durable at this point; retrieval is a separate, later, client-initiated event.',
    packet: 'LDA → /var/mail/bob · message 1 · 2104 octets · flags: none yet' },
];

/* the mailbox stays put and the devices are windows onto it */
const imapSteps: MailStep[] = [
  { tag: 'PICK UP', at: 'Phone opens the mailbox where it lies', proto: 'IMAP 993',
    wire: [
      { t: 'C: a001 LOGIN bob •••', c: 'b' },
      { t: 'C: a002 SELECT INBOX', c: 'b' },
      { t: 'S: * 1 EXISTS · * 1 RECENT', c: 'ok' },
      { t: 'C: a003 FETCH 1 (ENVELOPE FLAGS)', c: 'b' },
      { t: 'S: * 1 FETCH (ENVELOPE ("Alice" "Q3 numbers"))', c: 'a' },
    ],
    simple: 'The phone does not take the mail away. It looks inside the mailbox and shows Bob a copy — the original stays on the server. It can even fetch just the subject line and leave a big attachment behind.',
    technical: 'IMAP is a remote-access protocol over server-side state: folders, UIDs and flags live on the server, and FETCH can request ENVELOPE, BODYSTRUCTURE or one MIME part. The client is a cache. Port 143 is IMAP itself (upgradable with STARTTLS); 993 is the same protocol inside implicit TLS — identical commands, different wrapper.',
    packet: 'a001 LOGIN → a002 SELECT INBOX → * 1 EXISTS → a003 FETCH 1 (ENVELOPE BODYSTRUCTURE FLAGS) → 640 bytes' },

  { tag: 'AGREE', at: 'He reads it — and the laptop already knows', proto: 'IMAP 993',
    wire: [
      { t: 'C: a004 STORE 1 +FLAGS (\\Seen)', c: 'sim' },
      { t: 'S: * 1 FETCH (FLAGS (\\Seen))', c: 'ok' },
      { t: 'C: b001 LOGIN · b002 SELECT INBOX  [laptop]', c: 'b' },
      { t: 'S: * 1 EXISTS · * 1 FETCH (FLAGS (\\Seen))', c: 'ok' },
      { t: '→ the laptop never spoke to the phone. Both read the server.', c: 'sim' },
    ],
    simple: 'The read mark is stored in the mailbox, not on the phone. So when the laptop opens the same mailbox, the mail is already there and already marked read. Your devices are not syncing with each other — they are both reading one mailbox.',
    technical: 'Flags are server-side and broadcast to every client with the mailbox selected; IDLE lets the server push * n EXISTS the instant SMTP delivers. Consistency comes from the storage model, not from peer sync.',
    packet: 'a004 STORE 1 +FLAGS (\\Seen) → * 1 FETCH (FLAGS (\\Seen)) · laptop: b002 SELECT INBOX → same UID, same flags' },

  { tag: 'REPLY', at: 'Bob replies — and IMAP cannot carry it', proto: 'SMTP 587',
    wire: [
      { t: 'C: (new connection) EHLO phone.corp.net → smtp.corp.net:587', c: 'b' },
      { t: 'C: AUTH LOGIN bob ••• · MAIL FROM:<bob@corp.net>', c: 'b' },
      { t: 'S: 250 OK — and the whole journey runs again, backwards', c: 'ok' },
    ],
    simple: 'Hitting Reply does not answer down the IMAP connection. The phone opens a brand-new SMTP conversation to its own outgoing server, and the four hand-offs you just watched happen again in the other direction.',
    technical: 'IMAP is read/modify only; the sole write path is APPEND into a Sent folder. Outbound mail always leaves via submission (587), which is why a mail client is configured with two servers.',
    packet: 'phone → smtp.corp.net:587 · AUTH · MAIL FROM:<bob@corp.net> · RCPT TO:<alice@example.com> · then IMAP APPEND "Sent"' },
];

/* This branch demonstrates the classic delete-after-download workflow. POP3
   itself does not require deletion: RETR downloads, while the separate DELE
   command marks a message for removal when QUIT enters the UPDATE state. */
const popSteps: MailStep[] = [
  { tag: 'COLLECT', at: 'Phone downloads the message, then explicitly deletes it', proto: 'POP3 995',
    wire: [
      { t: 'S: +OK POP3 ready', c: 'a' },
      { t: 'C: USER bob · PASS ••• · STAT', c: 'b' },
      { t: 'S: +OK 1 2104', c: 'ok' },
      { t: 'C: RETR 1  → 2,104 octets (whole message)', c: 'b' },
      { t: 'C: DELE 1 · QUIT', c: 'rst' },
      { t: 'S: +OK signing off (1 message deleted)', c: 'rst' },
    ],
    simple: 'This POP3 client downloads the whole message, then sends DELE and QUIT to remove the server copy. Deletion is a client choice, not an automatic rule of POP3; another client can be configured to leave the message on the server.',
    technical: 'RETR fetches the complete message (no partial fetch, no MIME part selection); DELE flags and QUIT commits in the UPDATE state. There are no folders and no flags in the POP3 model at all. Port 110 is POP3 in the clear (STARTTLS optional); 995 is the same POP3 inside implicit TLS.',
    packet: '+OK ready → USER/PASS → STAT +OK 1 2104 → RETR 1 → DELE 1 → QUIT → +OK signing off' },

  { tag: 'EMPTY', at: 'Laptop logs in fine — and finds nothing', proto: 'POP3 995',
    wire: [
      { t: 'C: USER bob · PASS ••• · STAT  [laptop]', c: 'b' },
      { t: 'S: +OK 0 0', c: 'rst' },
      { t: '→ nothing broke. The mail lives on the phone now.', c: 'rst' },
    ],
    simple: 'The login worked; the box is empty because the phone explicitly sent DELE and then QUIT. If it had only used RETR, the server copy could still be available.',
    technical: 'POP3 has no IMAP-style folders or shared read flags. With delete-after-download enabled, two clients can become independent archives that silently diverge; leaving server copies changes that outcome but still does not add IMAP-style synchronisation.',
    packet: 'C: STAT → S: +OK 0 0 · no UIDL list, no flags, no folders to compare' },

  { tag: 'REPLY', at: 'Bob replies — and POP3 cannot carry it', proto: 'SMTP 587',
    wire: [
      { t: 'C: (new connection) EHLO phone.corp.net → smtp.corp.net:587', c: 'b' },
      { t: 'C: AUTH LOGIN bob ••• · MAIL FROM:<bob@corp.net>', c: 'b' },
      { t: 'S: 250 OK — and the whole journey runs again, backwards', c: 'ok' },
    ],
    simple: 'POP3 has no command for sending — it only knows LIST, RETR, DELE. The reply goes out over a fresh SMTP conversation, exactly like Alice’s did.',
    technical: 'POP3 is strictly retrieval. Every client is therefore configured with two servers: one to fetch from (995) and one to submit to (587).',
    packet: 'phone → smtp.corp.net:587 · AUTH · MAIL FROM:<bob@corp.net> · RCPT TO:<alice@example.com> · 250 OK' },
];

export const stepsFor = (pickup: Pickup): MailStep[] =>
  shared.concat(pickup === 'pop' ? popSteps : imapSteps);

export const toneVar = (c: WireTone) =>
  c === 'rst' ? 'var(--rst)'
    : c === 'sim' ? 'var(--sim)'
      : c === 'a' ? 'var(--a)'
        : c === 'b' ? 'var(--b)'
          : c === 'ok' ? 'var(--ok)' : 'var(--text3)';

/* which box speaks at each step, and what it says in plain words */
export const sayAt: Record<number, [string, string] | [string, string, string]> = {
  1: ['app', 'Written, not sent yet'],
  2: ['msa', 'Handing it to my server'],
  3: ['msa', 'Who takes mail for corp.net?'],
  4: ['mx', 'Passing it along'],
  5: ['box', 'It lives here now'],
  6: ['phone', 'Reading it where it sits', 'Taking it off the server'],
  7: ['laptop', 'Already marked read', 'Nothing left for me'],
  8: ['reply', 'A reply is a fresh send'],
};
