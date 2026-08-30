/* The Telnet lab logs into a router twice.

   Character mode is Telnet as most people meet it: every keystroke is its own
   packet and the server echoes your own letters back so your screen can show
   them. Line mode moves buffering and echo to the client — four segments
   instead of twenty-five. The tap reads the password either way, which is the
   whole point: efficiency and confidentiality are different problems. */

export type TerminalMode = 'char' | 'line';

/** what a single crossing is carrying */
export type RowKind = 'tcp' | 'iac' | 'data' | 'keys' | 'secret';

export type Row = {
  dir: 'out' | 'in';
  kind: RowKind;
  label: string;
  /** the byte-level detail, shown outside Simple mode */
  tail: string;
  /** true when the on-path observer can read this crossing */
  tap: boolean;
};

export type TapLine = { t: string; c: 'rst' | 'sim' | 'a' | 'b' | 'text3' };

export type TelnetStep = {
  /** short name for the advance button and the explain footer */
  tag: string;
  at: string;
  ms: number;
  rows: Row[];
  tap: TapLine[];
  /** the client's visible terminal at this point */
  screen: string[];
  simple: string;
  technical: string;
  packet: string;
};

export const charSteps: TelnetStep[] = [
  { tag: 'CONNECT', at: 'TCP opens on port 23 — and that is all the security there is', ms: 12,
    rows: [{ dir: 'out', kind: 'tcp', label: 'SYN → 203.0.113.20:23', tail: 'session established · 0 bytes of terminal data', tap: false }],
    tap: [],
    screen: ['Trying 203.0.113.20...', 'Connected to 203.0.113.20.'],
    simple: 'Telnet has no login step of its own. It opens an ordinary TCP connection to port 23 and starts sending characters. No key exchange, no certificate, nothing.',
    technical: 'Three-way handshake to 203.0.113.20:23 from ephemeral port 54118. Once ESTABLISHED, everything after this is a raw byte stream — your keystrokes, the server’s output, and Telnet’s own control bytes, interleaved.',
    packet: '192.168.1.10:54118 > 203.0.113.20:23 [SYN] → [SYN,ACK] → [ACK]   ESTABLISHED' },
  { tag: 'NEGOTIATE', at: 'IAC negotiation — the two ends configure the terminal', ms: 26,
    rows: [
      { dir: 'out', kind: 'iac', label: 'IAC WILL TERMINAL-TYPE · IAC DO SUPPRESS-GO-AHEAD', tail: 'ff fb 18   ff fd 03', tap: true },
      { dir: 'in', kind: 'iac', label: 'IAC DO TERMINAL-TYPE · IAC WILL ECHO', tail: 'ff fd 18   ff fb 01 — "I will echo for you"', tap: true },
    ],
    tap: [
      { t: 'ff fb 18 ff fd 03   ff fd 18 ff fb 01 ff fd 01', c: 'sim' },
      { t: '→ option negotiation, no payload yet', c: 'text3' },
    ],
    screen: [],
    simple: 'Before anything you type moves, the two ends agree on how the terminal behaves — including the crucial one: the server offers to echo your characters back to you.',
    technical: 'Commands are three bytes: IAC (0xFF) + WILL/WONT/DO/DONT + option code. The server sending WILL ECHO (ff fb 01) takes over echoing; the client stops printing locally and waits for the round trip. SUPPRESS-GO-AHEAD retires the half-duplex heritage.',
    packet: 'C→S  ff fb 18  ff fd 03      S→C  ff fd 18  ff fb 01  ff fd 01' },
  { tag: 'BANNER', at: 'The login prompt arrives as ordinary bytes', ms: 38,
    rows: [{ dir: 'in', kind: 'data', label: '"\\r\\nUser Access Verification\\r\\nUsername: "', tail: '37 bytes of ASCII · no framing, no structure', tap: true }],
    tap: [
      { t: '0d 0a 55 73 65 72 20 41 63 63 65 73 73 ...', c: 'a' },
      { t: '"User Access Verification\\r\\nUsername: "', c: 'a' },
    ],
    screen: ['', 'User Access Verification', 'Username: '],
    simple: 'The prompt you are about to type into is just text the server sent. Telnet has no concept of a form or a field — the server prints something, you send characters back.',
    technical: 'No message boundaries exist. The server writes the prompt into the stream; the client prints whatever arrives. Anything that looks like structure — prompts, menus, field positions — is convention plus cursor codes, not protocol.',
    packet: 'S→C  0d 0a "User Access Verification" 0d 0a "Username: "  (37 bytes)' },
  { tag: 'KEYSTROKES', at: 'Typing "admin" — five keystrokes, ten segments', ms: 71,
    rows: [
      { dir: 'out', kind: 'keys', label: 'a  d  m  i  n  — one segment per keystroke', tail: '5 segments · 1 data byte each · 41 bytes of headers each', tap: true },
      { dir: 'in', kind: 'keys', label: 'a  d  m  i  n  — echoed straight back', tail: '5 more segments, so your own letters can appear', tap: true },
    ],
    tap: [
      { t: 'C→S "a"  S→C "a"  C→S "d"  S→C "d"  ... ×5', c: 'a' },
      { t: 'username = admin', c: 'rst' },
    ],
    screen: ['', 'User Access Verification', 'Username: admin'],
    simple: 'This is character mode. Every key you press leaves immediately as its own packet, and the server sends the same letter back so your screen can show it. Five letters cost ten trips.',
    technical: 'Each keystroke is a TCP segment carrying one payload byte under 40+ bytes of IP and TCP headers, then a remote echo segment back. Delayed ACK and Nagle blunt it slightly, but the pattern holds: interactive Telnet is header, not data.',
    packet: 'C→S len=1 "a"   S→C len=1 "a"   C→S len=1 "d"   S→C len=1 "d"  ... ×5' },
  { tag: 'PASSWORD', at: 'Echo goes off — and the password crosses anyway', ms: 104,
    rows: [
      { dir: 'in', kind: 'iac', label: '"Password: " · IAC WONT ECHO', tail: 'ff fc 01 — the server stops echoing so nothing prints', tap: true },
      { dir: 'out', kind: 'secret', label: 'h u n t e r 2  — 7 segments, nothing comes back', tail: 'blank on your screen · fully readable on the wire', tap: true },
    ],
    tap: [
      { t: 'ff fc 01   "Password: "', c: 'sim' },
      { t: '68 75 6e 74 65 72 32', c: 'rst' },
      { t: 'password = hunter2   ← recovered in TCP sequence order', c: 'rst' },
    ],
    screen: ['', 'Username: admin', 'Password: '],
    simple: 'The blank you see is a courtesy: the server simply stops echoing. The characters still travel one at a time in plain ASCII, and anything between you and the server can read them in order.',
    technical: 'WONT ECHO (ff fc 01) suppresses display only. Payload bytes 68 75 6e 74 65 72 32 traverse every switch, AP and router on the path as cleartext. Reassembly takes no cryptanalysis — just the capture, sorted by sequence number.',
    packet: 'S→C ff fc 01 "Password: "   C→S len=1 68 · 75 · 6e · 74 · 65 · 72 · 32' },
  { tag: 'PROMPT', at: 'Authenticated — and the whole session behaves the same way', ms: 139,
    rows: [
      { dir: 'in', kind: 'data', label: '"\\r\\nRouter>" — you are in', tail: 'privileged exec is one enable password away', tap: true },
      { dir: 'out', kind: 'data', label: 'every subsequent character, both directions', tail: 'commands, config, show output — all readable', tap: true },
    ],
    tap: [
      { t: '"\\r\\nRouter>"   "show run\\r"', c: 'a' },
      { t: '8,214 bytes of running-config captured', c: 'rst' },
      { t: '→ enable secret, SNMP community, ACLs — all in the clear', c: 'rst' },
    ],
    screen: ['', 'Username: admin', 'Password: ', '', 'Router> show run'],
    simple: 'Nothing changes after login. Every command you type and every line the device prints back moves in the clear, one character at a time, for as long as the session lasts.',
    technical: 'The session is now a bidirectional cleartext stream until FIN. Interface names, ACLs, SNMP community strings and the enable password all pass through the same tap. This is why Telnet management is disabled on anything that matters.',
    packet: 'S→C "\\r\\nRouter>"   C→S "show run\\r"   S→C 8,214 bytes of configuration' },
];

export const lineSteps: TelnetStep[] = [
  { tag: 'CONNECT', at: 'Same TCP connection — with LINEMODE requested', ms: 14,
    rows: [
      { dir: 'out', kind: 'tcp', label: 'SYN → :23 · IAC DO LINEMODE', tail: 'ff fd 22 — "let me buffer the line myself"', tap: true },
      { dir: 'in', kind: 'iac', label: 'IAC WILL LINEMODE · IAC WONT ECHO', tail: 'the server hands echoing back to the client', tap: true },
    ],
    tap: [
      { t: 'ff fd 22   ff fb 22 ff fc 01', c: 'sim' },
      { t: '→ LINEMODE agreed, remote echo off', c: 'text3' },
    ],
    screen: ['Connected to 203.0.113.20.'],
    simple: 'The client asks to handle lines itself. The server agrees and stops echoing — from here your own machine prints what you type, and nothing leaves until you press Enter.',
    technical: 'Option 34 (LINEMODE, RFC 1184) plus WONT ECHO moves editing and echo to the client. Local editing means backspace, ^U and cursor keys never touch the wire — a correction costs nothing instead of two segments.',
    packet: 'C→S  ff fd 22      S→C  ff fb 22  ff fc 01' },
  { tag: 'BANNER', at: 'The prompt still arrives as plain bytes', ms: 27,
    rows: [{ dir: 'in', kind: 'data', label: '"\\r\\nUser Access Verification\\r\\nUsername: "', tail: 'unchanged — line mode changes the client, not the text', tap: true }],
    tap: [{ t: '0d 0a "User Access Verification" 0d 0a "Username: "', c: 'a' }],
    screen: ['', 'User Access Verification', 'Username: '],
    simple: 'The server side of the conversation looks exactly the same. Line mode is about when your keystrokes leave, not about what the server sends.',
    technical: 'Server output is unaffected by LINEMODE; only the client’s input handling changes. Prompt detection is still convention — the client has no idea a password is being asked for.',
    packet: 'S→C  0d 0a "User Access Verification" 0d 0a "Username: "  (37 bytes)' },
  { tag: 'LINE', at: '"admin" leaves as one segment, on Enter', ms: 33,
    rows: [{ dir: 'out', kind: 'keys', label: '"admin\\r\\n" — the complete line, once', tail: '1 segment · 7 data bytes · nothing echoed back', tap: true }],
    tap: [
      { t: '61 64 6d 69 6e 0d 0a   "admin\\r\\n"', c: 'a' },
      { t: 'username = admin   (one packet)', c: 'rst' },
    ],
    screen: ['', 'User Access Verification', 'Username: admin'],
    simple: 'You type the whole word with no network traffic at all — your own terminal shows it. Only when you press Enter does one packet carry the finished line.',
    technical: 'The client buffers, echoes locally, and forwards on CR. Five keystrokes plus any edits collapse to a single 7-byte payload with no return traffic. Latency stops being visible while typing.',
    packet: 'C→S len=7  61 64 6d 69 6e 0d 0a   (one segment, no echo)' },
  { tag: 'PASSWORD', at: 'One segment — and the tap still gets all of it', ms: 48,
    rows: [
      { dir: 'in', kind: 'data', label: '"Password: "', tail: 'no echo change needed — the client already owns echo', tap: true },
      { dir: 'out', kind: 'secret', label: '"hunter2\\r\\n" — one segment, plain ASCII', tail: '1 packet instead of 7 · exactly as readable', tap: true },
      { dir: 'in', kind: 'data', label: '"\\r\\nRouter>"', tail: 'authenticated, session open', tap: true },
    ],
    tap: [
      { t: '68 75 6e 74 65 72 32 0d 0a', c: 'rst' },
      { t: 'password = hunter2   ← one packet, no reassembly needed', c: 'rst' },
      { t: 'traffic −80% · exposure −0%', c: 'rst' },
    ],
    screen: ['', 'Username: admin', 'Password: ', '', 'Router>'],
    simple: 'Here is the point of the lab: line mode made the session efficient and quiet, and did nothing at all for secrecy. One packet holds the password instead of seven — that is an easier capture, not a harder one.',
    technical: 'Payload 68 75 6e 74 65 72 32 0d 0a in a single segment. Total session traffic drops by roughly 80%, exposure drops by zero. Confidentiality is not a mode of Telnet; it requires a different protocol underneath.',
    packet: 'C→S len=9  68 75 6e 74 65 72 32 0d 0a   S→C "\\r\\nRouter>"' },
];

export const stepsFor = (mm: TerminalMode) => (mm === 'line' ? lineSteps : charSteps);

/** the step at which the password has crossed and the tap holds it */
export const secretStep = (mm: TerminalMode) => (mm === 'line' ? 4 : 5);

/** running segment count after each step */
export const segmentsSent: Record<TerminalMode, number[]> = {
  char: [3, 6, 7, 17, 25, 28],
  line: [2, 3, 4, 7],
};

export const tapColor = (c: TapLine['c']) =>
  c === 'rst' ? 'var(--rst)'
    : c === 'sim' ? 'var(--sim)'
      : c === 'a' ? 'var(--a)'
        : c === 'b' ? 'var(--b)' : 'var(--text3)';
