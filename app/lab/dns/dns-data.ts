/* The DNS lab runs the same lookup twice.

   Cold, nobody anywhere holds the name, so all four caches miss and the
   resolver has to walk the tree: root, .com, then the zone's own server. Warm,
   the first three caches still miss — and then the resolver hits, and the three
   servers on the right are never contacted at all. Running the two next to each
   other is the point: the tree is the exception, the cache is the rule. */

export type Cache = 'cold' | 'warm';

/** where the step is happening: a rung of the cache ladder, a spoke of the tree
    walk (0 root, 1 TLD, 2 authoritative), the cache write, or the way home */
export type Arc = 'br' | 'os' | 'rt' | 'rs' | 0 | 1 | 2 | 'cache' | 'down';

export type DnsStep = {
  arc: Arc;
  /** set on the two warm-cache steps, which light the cache green */
  warm?: boolean;
  /** short label for the explain panel footer */
  at: string;
  simple: string;
  technical: string;
  packet: string;
};

export const coldSteps: DnsStep[] = [
  { arc: 'br', at: 'browser cache — MISS',
    simple: 'Before anything touches the network, your browser checks its own little notebook. Nothing there for this name.',
    technical: 'Chrome keeps an in-process DNS cache with short TTLs (about 60s). A hit here costs no packets at all. This is a miss.',
    packet: 'chrome://net-internals dns cache  →  www.example.com  NOT FOUND' },
  { arc: 'os', at: 'OS cache + hosts — MISS',
    simple: 'Next the operating system looks: first the hosts file, then its own cache. Still nothing.',
    technical: 'The stub resolver checks /etc/hosts (or the Windows equivalent) and the OS-level cache. A hosts entry would win outright and end the lookup here.',
    packet: 'hosts file: no entry   ·   os resolver cache: MISS' },
  { arc: 'rt', at: 'router — MISS, forwards on',
    simple: 'Now the question leaves your machine. The home router is asked — but a router is not a real resolver. It keeps a small cache, and on a miss it just passes the question along.',
    technical: 'The stub sends its recursive query (RD=1) to the configured server, usually the router at 192.168.1.1. The router is a forwarder: cache miss, so it forwards the same query upstream and does no walking itself.',
    packet: '→ 192.168.1.1:53  RD=1  ·  forwarder cache MISS  ·  relayed to 1.1.1.1' },
  { arc: 'rs', at: 'resolver cache — MISS',
    simple: 'The public resolver checks its own much bigger cache. Empty for this name too — so somebody finally has to go and find out.',
    technical: 'Cache miss at 1.1.1.1 on www.example.com/A and on every parent label. With nothing cached, the resolver falls back to its hard-coded root hints.',
    packet: '1.1.1.1 cache lookup → MISS   fallback: root hints (13 root server addresses)' },
  { arc: 0, at: 'root — referral to .com',
    simple: 'It asks a root server. The root does not know the address — and never will — but it knows exactly who is in charge of .com.',
    technical: 'Root responds with AA=0, no ANSWER section, and an AUTHORITY section naming the .com nameservers, plus their addresses as glue in ADDITIONAL.',
    packet: '← root 198.41.0.4: ANSWER=0 AUTHORITY=13 (NS a.gtld-servers.net)  ADDITIONAL: 192.5.6.30' },
  { arc: 1, at: '.com TLD — referral to example.com',
    simple: 'Same question, new server. The .com server does not hold the address either, but it knows which nameserver owns example.com.',
    technical: 'The identical query goes to the TLD server. Another referral: AUTHORITY names ns1.example.com, ADDITIONAL carries its glue address.',
    packet: '← .com: ANSWER=0 AUTHORITY=2 (NS ns1.example.com)  ADDITIONAL: 198.51.100.5' },
  { arc: 2, at: 'authoritative — the answer',
    simple: 'The third server actually owns this name, so this time the reply is the address itself, not another signpost.',
    technical: 'The authoritative server answers with AA=1 and an ANSWER section containing the A record: 93.184.216.34, TTL 300.',
    packet: '← ns1: flags AA=1  ANSWER=1  www.example.com. 300 IN A 93.184.216.34' },
  { arc: 'cache', at: 'answer cached',
    simple: 'Before passing it on, the resolver writes the answer down — along with how long it is allowed to keep it. That note is what makes the next lookup free.',
    technical: 'The resolver caches the A record for its TTL (300s) and the NS records for theirs (172800s). TTL is set by the zone owner, not the resolver.',
    packet: 'cache store: www.example.com A 93.184.216.34 ttl=300   .com NS ttl=172800' },
  { arc: 'down', at: 'answer walks back down',
    simple: 'The address travels home the way the question came — and every stop it passes writes it down. Ask again in a minute and it never gets this far.',
    technical: 'The resolver returns the answer with RA=1 and AA=0 — recursive, not authoritative. The forwarder, the OS and the browser each cache it on the way past. Only now can PC-1 open a TCP connection.',
    packet: '→ router → os → browser → PC-1   RA=1 AA=0   A 93.184.216.34   time=48ms' },
];

export const warmSteps: DnsStep[] = [
  { arc: 'br', at: 'browser cache — MISS',
    simple: 'Same four checks as before. The browser still does not have it — its cache is tiny and expires fast.',
    technical: 'Chrome’s in-process cache has already expired this entry (~60s TTL), so the lookup continues outward.',
    packet: 'chrome dns cache → MISS  (entry expired)' },
  { arc: 'os', at: 'OS cache + hosts — MISS',
    simple: 'The operating system does not have it either.',
    technical: 'No hosts entry, and the OS cache does not hold this record. The stub sends its recursive query outward again.',
    packet: 'hosts: no entry  ·  os cache: MISS' },
  { arc: 'rt', at: 'router — MISS, forwards on',
    simple: 'The router forwards the question upstream, exactly as before.',
    technical: 'Forwarder cache miss. The same recursive query is relayed to 1.1.1.1 — the router still does no walking.',
    packet: '→ 192.168.1.1 MISS → relayed to 1.1.1.1:53' },
  { arc: 'rs', warm: true, at: 'resolver cache — HIT',
    simple: 'Here is the difference. The resolver already has the answer written down, with time still left on it. Nobody needs to be asked anything.',
    technical: 'Cache hit at 1.1.1.1 with 284s remaining of the original 300s TTL. Zero external queries are issued — root, TLD and authoritative servers see no traffic.',
    packet: '1.1.1.1 cache → HIT  ttl remaining=284s  (no upstream query)' },
  { arc: 'down', warm: true, at: 'answer walks back down',
    simple: 'The answer comes straight back — about four times faster, and the three servers on the right were never even contacted.',
    technical: 'Served from cache with RA=1 and the decremented TTL. The tree is untouched; the round trip to the resolver is the only network cost.',
    packet: '→ PC-1: www.example.com 284 IN A 93.184.216.34   time=12ms  (cached)' },
];

export const stepsFor = (cache: Cache) => (cache === 'warm' ? warmSteps : coldSteps);

/* dig +trace output, revealed one line per step */
export const coldTrace = [
  { text: '; browser cache        → miss', color: 'var(--text2)' },
  { text: '; os cache + hosts     → miss', color: 'var(--text2)' },
  { text: '; router 192.168.1.1   → miss  (forwarder — relays it on)', color: 'var(--text2)' },
  { text: '; resolver 1.1.1.1     → miss  (falling back to root hints)', color: 'var(--rst)' },
  { text: '.                    518400  IN  NS  a.gtld-servers.net.      ; referral', color: 'var(--a)' },
  { text: 'com.                 172800  IN  NS  ns1.example.com.         ; referral', color: 'var(--a)' },
  { text: 'www.example.com.        300  IN  A   93.184.216.34            ; answer, AA=1', color: 'var(--ok)' },
  { text: '; cached for 300s — the next lookup asks nobody', color: 'var(--b)' },
  { text: ';; Query time: 48 msec  ·  3 servers asked  ·  4 caches now hold it', color: 'var(--text2)' },
];

export const warmTrace = [
  { text: '; browser cache        → miss', color: 'var(--text2)' },
  { text: '; os cache + hosts     → miss', color: 'var(--text2)' },
  { text: '; router 192.168.1.1   → miss  (forwarder — relays it on)', color: 'var(--text2)' },
  { text: '; resolver 1.1.1.1     → HIT   284s of 300s remaining', color: 'var(--ok)' },
  { text: 'www.example.com.        284  IN  A   93.184.216.34', color: 'var(--ok)' },
  { text: ';; Query time: 12 msec  ·  0 servers asked  ·  the tree was never touched', color: 'var(--b)' },
];
