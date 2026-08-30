/* The HTTP lab runs one page load twice.

   First visit: a GET goes out, a 200 comes back with the HTML — and then
   parsing that HTML turns up a stylesheet, a script and an image, so one page
   costs four requests. Revisit: the browser still holds the copy, so it asks a
   conditional question instead and gets a 304 with no body at all. The pair is
   the lesson — the fastest response is the one that sends nothing. */

export type Visit = 'first' | 'revisit';

/** out = client→server · in = server→client · self = server-side work ·
    pipe = the TCP connection that was already there */
export type Dir = 'out' | 'in' | 'self' | 'pipe';

export type HttpStep = {
  dir: Dir;
  /** the label drawn on the arrow, and the walk checklist entry */
  at: string;
  simple: string;
  technical: string;
  /* raw bytes, with the CRLFs written out the way a capture shows them */
  packet: string;
};

export const firstSteps: HttpStep[] = [
  { dir: 'pipe', at: 'TCP connection already open',
    simple: 'Before a single word of HTTP is spoken, TCP has already built the pipe. HTTP just talks through it — it has no way of moving bytes on its own.',
    technical: 'A three-way handshake to 203.0.113.20:80 completed first, so an ESTABLISHED socket exists. HTTP is a request/response protocol layered on top of that reliable stream.',
    packet: 'tcp 49512 > 80  ESTABLISHED   (handshake done, 0 bytes of HTTP sent)' },
  { dir: 'out', at: 'GET /index.html — the request',
    simple: 'The browser writes a short note in plain text: the word GET, the path it wants, and which site it means. That note is the entire request.',
    technical: 'Request line METHOD SP path SP HTTP/1.1, then headers, then a blank line. Host is mandatory in 1.1 — one IP can serve thousands of sites, so the name must travel in the request.',
    packet: 'GET /index.html HTTP/1.1\\r\\nHost: example.com\\r\\nAccept: text/html\\r\\n\\r\\n' },
  { dir: 'self', at: 'Server resolves path to a resource',
    simple: 'The server reads the note, works out which file or program answers that path, and gets a reply ready. It does not remember you from last time.',
    technical: 'The path maps to a resource — a file on disk, a route in an application, a cached render. The server picks a status code and builds the response headers.',
    packet: 'map /index.html -> /var/www/example/index.html  (13,412 bytes, etag "a3f1c")' },
  { dir: 'in', at: '200 OK + headers',
    simple: 'Back comes a status line — 200 means found it, here it is — followed by labels describing what is coming: what type it is, how long it is, how long you may keep it.',
    technical: 'Status line HTTP/1.1 200 OK, then response headers. Content-Length frames the body on the stream, Content-Type tells the browser how to parse it, ETag and Cache-Control drive revalidation later.',
    packet: 'HTTP/1.1 200 OK\\r\\nContent-Type: text/html\\r\\nContent-Length: 13412\\r\\nETag: "a3f1c"\\r\\nCache-Control: max-age=300\\r\\n\\r\\n' },
  { dir: 'in', at: 'Body streams — 13,412 bytes',
    simple: 'Then the page itself arrives, right behind the labels, in the same connection. The browser starts drawing before the last byte lands.',
    technical: 'The body follows the blank line as raw octets on the same TCP stream. The browser parses incrementally, so layout begins long before Content-Length bytes have been read.',
    packet: '<!doctype html><html> … 13,412 octets … </html>   (single response body)' },
  { dir: 'out', at: '3 more requests — same connection',
    simple: 'Reading the HTML, the browser discovers it also needs a stylesheet, a script and an image. Each one is a brand new request. One page cost four.',
    technical: 'Subresources found during parse are fetched as separate request/response pairs. Connection: keep-alive means they reuse the socket instead of paying a new handshake each time.',
    packet: 'GET /style.css · GET /app.js · GET /hero.jpg   (keep-alive, no new handshake)' },
];

export const revisitSteps: HttpStep[] = [
  { dir: 'pipe', at: 'TCP connection reused',
    simple: 'Same pipe as before. Nothing new to build.',
    technical: 'The keep-alive socket from the previous exchange is still open, so no handshake cost.',
    packet: 'tcp 49512 > 80  ESTABLISHED  (reused, keep-alive)' },
  { dir: 'out', at: 'Conditional GET — If-None-Match',
    simple: 'The browser still has the page from last time, but it is not sure it is current. So it asks a smarter question: send it only if it changed.',
    technical: 'The cached response carried ETag "a3f1c". The browser replays it in If-None-Match, turning an unconditional GET into a conditional one — a validation request, not a fetch.',
    packet: 'GET /index.html HTTP/1.1\\r\\nHost: example.com\\r\\nIf-None-Match: "a3f1c"\\r\\n\\r\\n' },
  { dir: 'self', at: 'Server compares the tag',
    simple: 'The server looks at the file, works out its current tag, and sees it matches what the browser already has.',
    technical: 'The server recomputes the validator for the resource and compares it to If-None-Match. Equal means the cached copy is still byte-identical.',
    packet: 'etag(/index.html) = "a3f1c"  ==  If-None-Match  ->  fresh' },
  { dir: 'in', at: '304 Not Modified — 0 byte body',
    simple: 'And it answers with almost nothing: use what you already have. No page is sent at all — that is why a revisit feels instant.',
    technical: 'HTTP/1.1 304 with no message body. The browser serves its stored copy and refreshes its freshness lifetime. 13,412 bytes saved for the cost of a ~180 byte exchange.',
    packet: 'HTTP/1.1 304 Not Modified\\r\\nETag: "a3f1c"\\r\\nCache-Control: max-age=300\\r\\n\\r\\n   (body: none)' },
];

export const stepsFor = (visit: Visit) => (visit === 'revisit' ? revisitSteps : firstSteps);

/** the packet strings carry their CRLFs as visible escapes; this pulls the
    start line back out for the one-line label under a diagram arrow */
export const startLine = (packet: string) => packet.split('\\r\\n')[0];

export const firstWire = [
  { text: '> GET /index.html HTTP/1.1', color: 'var(--b)' },
  { text: '> Host: example.com', color: 'var(--b)' },
  { text: '> Accept: text/html,*/*   ·   Connection: keep-alive', color: 'var(--text2)' },
  { text: '< HTTP/1.1 200 OK', color: 'var(--ok)' },
  { text: '< Content-Type: text/html; charset=utf-8', color: 'var(--a)' },
  { text: '< Content-Length: 13412   ·   ETag: "a3f1c"   ·   Cache-Control: max-age=300', color: 'var(--a)' },
  { text: '< (13,412 bytes of html)', color: 'var(--text2)' },
  { text: '> GET /style.css  ·  GET /app.js  ·  GET /hero.jpg      3 more round trips, same socket', color: 'var(--text3)' },
];

export const revisitWire = [
  { text: '> GET /index.html HTTP/1.1', color: 'var(--b)' },
  { text: '> Host: example.com', color: 'var(--b)' },
  { text: '> If-None-Match: "a3f1c"        the whole point of this request', color: 'var(--a)' },
  { text: '< HTTP/1.1 304 Not Modified', color: 'var(--ok)' },
  { text: '< ETag: "a3f1c"  ·  Cache-Control: max-age=300', color: 'var(--text2)' },
  { text: '< (no body — 13,412 bytes not sent)', color: 'var(--ok)' },
];

/** how many wire lines are visible after each step */
export const wireCounts: Record<Visit, number[]> = {
  first: [0, 3, 3, 6, 7, 8],
  revisit: [0, 3, 3, 6],
};
