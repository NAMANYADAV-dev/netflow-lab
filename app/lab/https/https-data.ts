/* The HTTPS lab sends the same password twice.

   Over port 80 it is readable by every device the bytes pass through — no
   attack needed, nothing was ever closed. Over port 443 the identical request
   goes out sealed, and the observer keeps only metadata. The pair is the point:
   TLS did not change the request, only its wrapping. */

export type Wire = 'tls' | 'plain';

/** out = client→server · in = server→client · self = local work ·
    pipe = the transport underneath · both = a secret each side computes alone */
export type Dir = 'out' | 'in' | 'self' | 'pipe' | 'both';

export type TlsStep = {
  dir: Dir;
  /** the label drawn on the arrow, and the walk checklist entry */
  at: string;
  simple: string;
  technical: string;
  packet: string;
};

/** index of the first step whose bytes are inside the TLS record layer */
export const ENCRYPTED_FROM = 5;

export const tlsSteps: TlsStep[] = [
  { dir: 'pipe', at: 'TCP connection open to port 443',
    simple: 'Nothing is encrypted yet. TCP builds an ordinary pipe first — the same pipe a plaintext site would use. Port 443 only signals intent.',
    technical: 'A three-way handshake to 203.0.113.20:443 completes in the clear. TLS is a record layer that runs inside that stream; the port number is a convention, not protection.',
    packet: 'tcp 51884 > 443  ESTABLISHED   (0 bytes of TLS, 0 bytes of HTTP)' },
  { dir: 'out', at: 'ClientHello — versions, ciphers, key share',
    simple: 'The browser opens with the TLS versions and ciphers it supports plus a key share. This lab models a normal ClientHello without ECH, so the requested hostname is still visible.',
    technical: 'This ClientHello carries supported_versions, cipher suites, plaintext server_name (SNI), and an ephemeral X25519 key_share. Encrypted Client Hello (ECH), when supported and successfully negotiated, can protect SNI and other sensitive ClientHello fields.',
    packet: '16 03 01 01 2c  ClientHello  versions=[1.3]  key_share=x25519  server_name=example.com' },
  { dir: 'in', at: 'ServerHello + certificate (already encrypted)',
    simple: 'The server picks one cipher, sends back its own half of the secret, and attaches its certificate — a signed claim that it really is example.com.',
    technical: 'ServerHello selects TLS_AES_128_GCM_SHA256 and returns its key_share. From that point both sides can derive handshake keys, so Certificate, CertificateVerify and Finished are already sent encrypted — TLS 1.3 encrypts most of its own handshake.',
    packet: '16 03 03 00 7a  ServerHello  cipher=TLS_AES_128_GCM_SHA256  |  17 03 03 0b f2  Certificate (encrypted)' },
  { dir: 'self', at: 'Browser verifies the certificate chain',
    simple: 'Here is the part people forget. The browser checks the certificate: does the name match, has it expired, and is it signed by an authority this machine already trusts? Encryption with the wrong party is worthless.',
    technical: 'The client validates CN/SAN against the requested host, checks validity dates and revocation, and walks the chain to a root in the local trust store. CertificateVerify proves the server holds the matching private key. A failure here is what shows the browser warning page.',
    packet: 'CN=example.com  SAN=example.com,www.example.com  issuer=R3  chain -> ISRG Root X1 (trusted)  valid 63d' },
  { dir: 'both', at: 'Both sides derive the same keys — never sent',
    simple: 'Each side combines its own private half with the other side’s public half and lands on the identical secret. That secret never crossed the wire, so capturing every packet does not reveal it.',
    technical: 'ECDHE over X25519 produces a shared secret, fed through HKDF to derive traffic keys and IVs for each direction. The private halves are ephemeral and discarded after the session, which is what gives forward secrecy. Finished messages confirm both sides derived the same thing.',
    packet: 'ECDHE(x25519) -> HKDF-Extract/Expand -> client_write_key, server_write_key   |  Finished verified' },
  { dir: 'out', at: 'The same GET — now ciphertext',
    simple: 'Now the browser writes exactly the request it would have written anyway, password and all, and hands it to TLS. What leaves the machine is unreadable bytes.',
    technical: 'The HTTP request is unchanged — same method, path, headers, Authorization. It becomes the plaintext of a TLS application_data record, sealed with AES-128-GCM. The record header leaks only type and length.',
    packet: '17 03 03 01 8f  application_data  399 bytes  (GET /account + Authorization, sealed)' },
  { dir: 'in', at: '200 OK — ciphertext back',
    simple: 'The reply comes back the same way: encrypted on the wire, decrypted the instant it arrives. To you it looks like an ordinary page. To anyone in between it never had any content at all.',
    technical: 'The response, headers and body together, rides in application_data records under the server write key. Integrity is part of the AEAD tag, so a tampered record fails to decrypt rather than arriving corrupted.',
    packet: '17 03 03 0d 41  application_data  3,393 bytes  (200 OK + JSON body, sealed)' },
];

export const plainSteps: TlsStep[] = [
  { dir: 'pipe', at: 'TCP connection open to port 80',
    simple: 'The same pipe as before. This is the honest baseline: no negotiation, no certificate, nothing to set up.',
    technical: 'A three-way handshake to 203.0.113.20:80 completes and HTTP begins immediately. There is no record layer between the application and the socket.',
    packet: 'tcp 51882 > 80  ESTABLISHED   (no tls layer at all)' },
  { dir: 'out', at: 'GET /account — with your password attached',
    simple: 'The request goes out as typed: the path, the cookie, and an Authorization header holding your username and password.',
    technical: 'Request line, Host, Cookie and Authorization: Basic — base64 of user:pass. Base64 is an encoding, not a cipher; decoding it takes one command and no key.',
    packet: 'GET /account HTTP/1.1\\r\\nHost: example.com\\r\\nAuthorization: Basic bWU6aHVudGVyMg==\\r\\n\\r\\n' },
  { dir: 'self', at: 'The café Wi-Fi reads all of it',
    simple: 'Every device the bytes pass through — the access point, the ISP, a proxy — sees the full text. Nothing has to be broken; it was never closed.',
    technical: 'Any on-path element can capture and modify the stream: hotspot, transit provider, transparent proxy. Passive reading is undetectable, and injection is available too, because nothing authenticates the bytes.',
    packet: 'tcpdump -A -i wlan0 port 80   ->  full request body, credentials included' },
  { dir: 'in', at: '200 OK — and your balance in the clear',
    simple: 'The answer comes back just as readable. Anyone watching now has your password and your account data, and you saw no warning of any kind.',
    technical: 'The response headers and body are plaintext on the wire. No integrity protection either — an on-path attacker can rewrite the body before it reaches the browser.',
    packet: 'HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\n\\r\\n{"user":"me","balance":"$4,182.30"}' },
];

export const stepsFor = (wire: Wire) => (wire === 'plain' ? plainSteps : tlsSteps);

/** the packet strings carry their CRLFs as visible escapes; this pulls the
    start line back out for the one-line label under a diagram arrow */
export const startLine = (packet: string) => packet.split('\\r\\n')[0];

export const plainWire = [
  { text: '> GET /account HTTP/1.1', color: 'var(--rst)' },
  { text: '> Host: example.com', color: 'var(--rst)' },
  { text: '> Cookie: session=8f31c9a2be47…', color: 'var(--rst)' },
  { text: '> Authorization: Basic bWU6aHVudGVyMg==      base64("me:hunter2") — an encoding, not a cipher', color: 'var(--rst)' },
  { text: '< HTTP/1.1 200 OK', color: 'var(--rst)' },
  { text: '< {"user":"me","balance":"$4,182.30"}', color: 'var(--rst)' },
];

export const tlsWire = [
  { text: '> 16 03 01 01 2c 01 00 01 28 03 03 …    ClientHello   server_name=example.com  ← visible here because ECH is not used', color: 'var(--a)' },
  { text: '< 16 03 03 00 7a 02 00 00 76 03 03 …    ServerHello   cipher=TLS_AES_128_GCM_SHA256', color: 'var(--text2)' },
  { text: '< 17 03 03 0b f2 4d a1 c7 39 e0 8b …    (certificate — encrypted in TLS 1.3)', color: 'var(--ok)' },
  { text: '> 17 03 03 00 35 8a c1 04 f7 6e 2d …    (client Finished)', color: 'var(--ok)' },
  { text: '> 17 03 03 01 8f e2 44 9c b1 07 5a …    399 bytes — the request, password and all', color: 'var(--ok)' },
  { text: '< 17 03 03 0d 41 77 be 02 f5 3c 91 …    3,393 bytes — the response', color: 'var(--ok)' },
];

/** how many tap lines are visible after each step */
export const wireCounts: Record<Wire, number[]> = {
  tls: [0, 1, 3, 3, 4, 5, 6],
  plain: [0, 4, 4, 6],
};

export const tapNote: Record<Wire, string> = {
  plain: 'Captured with one command, no key and no attack. The password was never protected — it was typed, encoded, and sent.',
  tls: 'The observer keeps metadata: client and server IPs, port 443, byte counts and timing. In this no-ECH scenario SNI also exposes the hostname; ECH can protect it. The HTTP content is unreadable and cannot be altered undetected.',
};
