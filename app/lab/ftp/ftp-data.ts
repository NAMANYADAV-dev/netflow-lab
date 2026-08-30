/* The FTP lab downloads the same file twice.

   Modern clients commonly prefer passive mode: the client dials port 21 to talk,
   then dials a second port to carry. Active is the original 1985 design, where
   the server dials back — and dies at the home router, because nothing inside
   asked for that connection. Port 21 carries the conversation and never one
   byte of any file, in either mode. */

export type DataMode = 'passive' | 'active';

/** out = client→server · in = server→client · pipe = transport up ·
    drop = the packet dies at the router */
export type Dir = 'out' | 'in' | 'pipe' | 'drop';
/** which of the two connections this crossing belongs to */
export type Channel = 'ctrl' | 'data';

export type FtpStep = {
  dir: Dir;
  chan: Channel;
  at: string;
  simple: string;
  technical: string;
  packet: string;
};

export const passiveSteps: FtpStep[] = [
  { dir: 'pipe', chan: 'ctrl', at: 'Control connection open — port 21',
    simple: 'The client dials port 21 and the server answers with a greeting. This connection will stay open for the whole session, but it will never carry a single byte of any file.',
    technical: 'TCP connect to 203.0.113.20:21. The server sends a 220 service-ready reply. From here the control channel exchanges only commands and three-digit replies, in NVT ASCII.',
    packet: 'tcp 51120 > 21  ESTABLISHED\\r\\n220 ProFTPD ready.' },
  { dir: 'out', chan: 'ctrl', at: 'USER / PASS — in the clear',
    simple: 'Login is two commands and two replies, and the password is sent exactly as typed. Anyone on the path reads it.',
    technical: 'USER receives 331 (password required), PASS receives 230 (logged in). No encryption, no hashing, no challenge — the credential is literal text on the wire.',
    packet: 'USER anna\\r\\n331 Password required.\\r\\nPASS c0rrect-horse\\r\\n230 User anna logged in.' },
  { dir: 'out', chan: 'ctrl', at: 'PASV — "you pick a port, I will dial it"',
    simple: 'The client wants a file, but files do not travel on this connection. So it asks the server to open a spare port and wait there.',
    technical: 'PASV asks the server to listen on an ephemeral port and report it. This inverts the original design: the client will originate both connections, which is what lets it work from behind NAT.',
    packet: 'PASV' },
  { dir: 'in', chan: 'ctrl', at: '227 Entering Passive Mode (203,0,113,20,195,80)',
    simple: 'The server answers with six numbers: four for its address, and two that have to be combined into a port number. That is where the data connection will be.',
    technical: 'The 227 reply encodes h1,h2,h3,h4,p1,p2. The port is p1×256+p2 = 195×256+80 = 50000. The server is now listening on 203.0.113.20:50000 for exactly one incoming data connection.',
    packet: '227 Entering Passive Mode (203,0,113,20,195,80)   ->  203.0.113.20:50000' },
  { dir: 'out', chan: 'data', at: 'Second TCP connection — client dials :50000',
    simple: 'Now the client opens a completely new connection to that port. Two connections are live at once: one for talking, one for carrying.',
    technical: 'A fresh three-way handshake from 192.168.1.10:51121 to 203.0.113.20:50000. Outbound from the client, so the home router creates a NAT mapping normally and nothing is blocked.',
    packet: 'tcp 51121 > 50000  SYN → SYN/ACK → ACK   ESTABLISHED   (data connection)' },
  { dir: 'in', chan: 'data', at: 'RETR report.pdf — 2.4 MB flows on the data connection',
    simple: 'The request goes out on the talking connection, and the file itself comes back on the carrying one. Watch which line appears where.',
    technical: 'RETR is sent on the control channel; the server replies 150 there, then streams the file body over the data connection. The control channel stays idle and available — you could send ABOR mid-transfer.',
    packet: 'RETR report.pdf\\r\\n150 Opening BINARY mode data connection (2,464,133 bytes).\\r\\n[data conn] 2,464,133 octets' },
  { dir: 'in', chan: 'ctrl', at: '226 Transfer complete — data connection closes',
    simple: 'The carrying connection closes as soon as the file ends. The talking connection stays open, ready for the next request — which will open yet another connection.',
    technical: 'End of file is signalled by closing the data connection; 226 confirms on the control channel. Each subsequent transfer or LIST repeats the whole PASV dance with a brand new port.',
    packet: '226 Transfer complete.\\r\\ntcp 51121 > 50000  FIN   (control 51120 > 21 still ESTABLISHED)' },
];

export const activeSteps: FtpStep[] = [
  { dir: 'pipe', chan: 'ctrl', at: 'Control connection open — port 21',
    simple: 'Identical start: the client dials port 21, the server greets it. Nothing about the mode has come up yet.',
    technical: 'TCP connect to 203.0.113.20:21, 220 reply. Mode is decided per transfer, by which command the client sends next.',
    packet: 'tcp 51120 > 21  ESTABLISHED\\r\\n220 ProFTPD ready.' },
  { dir: 'out', chan: 'ctrl', at: 'USER / PASS — in the clear',
    simple: 'Same cleartext login as before.',
    technical: 'USER → 331, PASS → 230. Plaintext credentials either way; the mode only changes how data connections are built.',
    packet: 'USER anna\\r\\n331 Password required.\\r\\nPASS c0rrect-horse\\r\\n230 User anna logged in.' },
  { dir: 'out', chan: 'ctrl', at: 'PORT 192,168,1,10,195,80 — "call me back here"',
    simple: 'This is the original FTP design. The client opens a spare port of its own, then tells the server to dial in to it. Look closely at the address it just sent.',
    technical: 'PORT h1,h2,h3,h4,p1,p2 names an endpoint the client is now listening on: 192.168.1.10:50000. That is a private RFC 1918 address — meaningless on the public internet, because the client cannot know its own NAT-translated address.',
    packet: 'PORT 192,168,1,10,195,80\\r\\n200 PORT command successful.   (client listening on 192.168.1.10:50000)' },
  { dir: 'in', chan: 'data', at: 'Server dials the client from port 20',
    simple: 'The server now tries to open the data connection itself — inbound, towards your machine, to a port it was just told about.',
    technical: 'RETR is sent, and the server originates a TCP connection from its port 20 to the address in the PORT command. This is the inversion: the data connection travels client-ward, unsolicited.',
    packet: 'RETR report.pdf\\r\\n[server] tcp 20 > 192.168.1.10:50000  SYN →' },
  { dir: 'drop', chan: 'data', at: 'Router drops it — no mapping for an unsolicited SYN',
    simple: 'And it dies at your router. Nothing inside asked for this connection, so the router has no idea who it is for and throws it away. The server hears nothing back.',
    technical: 'The NAT table has no entry matching an inbound SYN to :50000, and the private address in the PORT command was never routable anyway. The packet is discarded silently; the server retries, then times out.',
    packet: 'nat lookup 80.12.16.10:50000 -> no entry   DROP   (SYN unanswered, retry ×3)' },
  { dir: 'in', chan: 'ctrl', at: '425 Can’t open data connection',
    simple: 'The failure is finally reported back on the talking connection — the one that worked perfectly the whole time. Login was fine. Commands were fine. Only the file could not move.',
    technical: 'After the connect timeout the server returns 425 on the control channel. This exact failure — a session that authenticates and then hangs on LIST — is why passive mode became the default in every client.',
    packet: '425 Can’t open data connection.   (control channel still ESTABLISHED)' },
];

export const stepsFor = (dm: DataMode) => (dm === 'active' ? activeSteps : passiveSteps);

/** the packet strings carry their CRLFs as visible escapes */
export const startLine = (packet: string) => packet.split('\\r\\n')[0];

export const passiveWire = [
  { text: '220 ProFTPD 1.3.7 ready.', color: 'var(--ok)' },
  { text: '> USER anna', color: 'var(--b)' },
  { text: '331 Password required for anna.', color: 'var(--text2)' },
  { text: '> PASS c0rrect-horse            sent exactly as typed', color: 'var(--rst)' },
  { text: '230 User anna logged in.', color: 'var(--ok)' },
  { text: '> PASV', color: 'var(--b)' },
  { text: '227 Entering Passive Mode (203,0,113,20,195,80)      ← port 50000 hides in here', color: 'var(--a)' },
  { text: '> RETR report.pdf', color: 'var(--b)' },
  { text: '150 Opening BINARY mode data connection (2,464,133 bytes).', color: 'var(--a)' },
  { text: '   … 2,464,133 bytes travel on the OTHER connection, not this one …', color: 'var(--text3)' },
  { text: '226 Transfer complete.', color: 'var(--ok)' },
];

export const activeWire = [
  { text: '220 ProFTPD 1.3.7 ready.', color: 'var(--ok)' },
  { text: '> USER anna', color: 'var(--b)' },
  { text: '331 Password required for anna.', color: 'var(--text2)' },
  { text: '> PASS c0rrect-horse            sent exactly as typed', color: 'var(--rst)' },
  { text: '230 User anna logged in.', color: 'var(--ok)' },
  { text: '> PORT 192,168,1,10,195,80      a private address — unroutable from outside', color: 'var(--rst)' },
  { text: '200 PORT command successful.', color: 'var(--text2)' },
  { text: '> RETR report.pdf', color: 'var(--b)' },
  { text: '   … server dialling 192.168.1.10:50000 … no reply … retry … no reply …', color: 'var(--text3)' },
  { text: '425 Can’t open data connection.', color: 'var(--rst)' },
];

/** how many control-channel lines are visible after each step */
export const wireCounts: Record<DataMode, number[]> = {
  passive: [0, 5, 6, 7, 8, 10, 11],
  active: [0, 5, 7, 8, 9, 10],
};
