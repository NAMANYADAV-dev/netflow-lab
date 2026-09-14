/* The SNMP lab: one monitoring server, one router, two conversations.

   Poll & trap is how most networks are actually watched. The manager asks on
   UDP 161 — once for the clock, once for a table, then the same counter a
   minute later — and the two readings become a rate. When a link fails the
   router does not wait to be asked: it sends a trap to UDP 162.

   Secure is the same first question asked with SNMPv3. The manager cannot
   sign or encrypt anything until it knows the router's engine ID, so the
   exchange opens with a request built to be refused.

   Every number below is meant to agree with every other: sysUpTime ticks in
   hundredths of a second, the second poll is exactly 6,000 ticks after the
   first, and the uptime is the 42 days the SNMP protocol page quotes. */

export type Scenario = 'poll' | 'secure';

export type Tone = 'a' | 'b' | 'ok' | 'rst' | 'sim' | 'dim' | 'text';

export const toneVar: Record<Tone, string> = {
  a: 'var(--a)',
  b: 'var(--b)',
  ok: 'var(--ok)',
  rst: 'var(--rst)',
  sim: 'var(--sim)',
  dim: 'var(--text3)',
  text: 'var(--text)',
};

/** req = manager → agent on 161 · resp = agent → manager on 161 · trap = agent → manager on 162 */
export type Flow = 'req' | 'resp' | 'trap';

export const flowTone: Record<Flow, Tone> = { req: 'b', resp: 'a', trap: 'rst' };

export type HeaderField = { k: string; v: string; tone?: Tone; note: string };
export type VarBind = { oid: string; name: string; type: string; value: string; note?: string };
export type WireLine = { text: string; tone: Tone };

export type SnmpStep = {
  /** the chip on the wire */
  tag: string;
  /** the PDU's proper name */
  pdu: string;
  flow: Flow;
  /** seconds since the first datagram of the scenario */
  at: string;
  walkLabel: string;
  /** the six plain words beside whichever machine is acting */
  callout: string;
  chipSub: string;
  /** what a stranger on the path can read about this datagram */
  exposure: { text: string; tone: Tone };
  /** the varbinds cross the wire encrypted */
  sealed?: boolean;
  /** MIB nodes the PDU names, keyed into mibTree */
  touches: string[];
  header: HeaderField[];
  varbinds: VarBind[];
  wire: WireLine[];
  simple: string;
  technical: string;
  packet: string;
};

export const ENGINE_ID = '8000000903001c58a43b81';

const cleartext = { text: 'community "public" · readable by anyone on the path', tone: 'rst' } as const;

export const pollSteps: SnmpStep[] = [
  {
    tag: 'GET', pdu: 'GetRequest', flow: 'req', at: '0.000 s',
    walkLabel: 'GET — “how long have you been up?”',
    callout: 'How long have you been up?',
    chipSub: 'id 18342 · sysUpTime.0',
    exposure: cleartext,
    touches: ['sysUpTime'],
    header: [
      { k: 'version', v: '1 · v2c', note: 'v1 is 0, v2c is 1, v3 is 3' },
      { k: 'community', v: 'public', tone: 'rst', note: 'the whole of v2c security, in clear' },
      { k: 'pdu', v: 'GetRequest · 0xA0', tone: 'b', note: 'fetch exactly these OIDs' },
      { k: 'request-id', v: '18342', note: 'how the reply finds its question' },
      { k: 'error-status', v: '0', note: 'always zero in a request' },
    ],
    varbinds: [
      { oid: '1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', type: 'NULL', value: '—', note: 'a request carries names, not values' },
    ],
    wire: [
      { text: '  0.000  10.0.0.50:49732 → 10.0.0.1:161   get-request     id=18342  sysUpTime.0', tone: 'b' },
      { text: '         ↳ community "public" in plaintext — in this packet and in every reply', tone: 'rst' },
    ],
    simple: 'The monitoring server asks the router one precise question: how long have you been running? It names the exact value it wants by number — and attaches the password, the community string, in plain text.',
    technical: 'GetRequest-PDU (0xA0) from 10.0.0.50:49732 to 10.0.0.1:161: version 1 (v2c), community "public", request-id 18342, one varbind — 1.3.6.1.2.1.1.3.0 with a NULL value. The trailing .0 is the instance: sysUpTime is a scalar, and a scalar has exactly one instance, .0.',
    packet: '10.0.0.50:49732 → 10.0.0.1:161  v2c  community=public  get-request  id=18342  1.3.6.1.2.1.1.3.0 = NULL',
  },
  {
    tag: 'RESPONSE', pdu: 'Response', flow: 'resp', at: '0.003 s',
    walkLabel: 'RESPONSE — 42 days, 06:11:23',
    callout: '42 days, 6 hours, 11 minutes',
    chipSub: 'id 18342 · 365108300',
    exposure: cleartext,
    touches: ['sysUpTime'],
    header: [
      { k: 'pdu', v: 'Response · 0xA2', tone: 'a', note: 'the same shape, now with values' },
      { k: 'request-id', v: '18342', tone: 'ok', note: 'matches — this answers that' },
      { k: 'error-status', v: 'noError · 0', tone: 'ok', note: 'a missing object is flagged per varbind' },
      { k: 'community', v: 'public', tone: 'rst', note: 'echoed back, just as readable' },
      { k: 'value type', v: 'TimeTicks', note: 'hundredths of a second, 32-bit' },
    ],
    varbinds: [
      { oid: '1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', type: 'TimeTicks', value: '365108300', note: '42 days, 06:11:23.00' },
    ],
    wire: [
      { text: '  0.003  10.0.0.1:161 → 10.0.0.50:49732   get-response    id=18342  sysUpTime.0 = 365108300 (42d 06:11:23.00)', tone: 'a' },
    ],
    simple: 'The router answers with one number: 365,108,300. That is not seconds — SNMP counts uptime in hundredths of a second — so it reads as 42 days, 6 hours, 11 minutes and 23 seconds.',
    technical: 'Response-PDU (0xA2) back to the manager’s source port: request-id 18342, error-status noError. TimeTicks is an unsigned 32-bit count of hundredths of a second, so it wraps after about 497 days — an uptime that goes backwards means a reboot or a wrap.',
    packet: '10.0.0.1:161 → 10.0.0.50:49732  v2c  community=public  get-response  id=18342  1.3.6.1.2.1.1.3.0 = Timeticks: (365108300) 42 days, 6:11:23.00',
  },
  {
    tag: 'GETBULK', pdu: 'GetBulkRequest', flow: 'req', at: '0.120 s',
    walkLabel: 'GETBULK — the interface table in one ask',
    callout: 'Send me three interface rows',
    chipSub: 'id 18343 · N=1 M=3',
    exposure: cleartext,
    touches: ['sysUpTime', 'ifDescr', 'ifOperStatus', 'ifInOctets'],
    header: [
      { k: 'pdu', v: 'GetBulkRequest · 0xA5', tone: 'b', note: 'new in v2c — v1 walked a cell at a time' },
      { k: 'request-id', v: '18343', note: 'a fresh id for a fresh question' },
      { k: 'non-repeaters', v: '1', tone: 'b', note: 'the first varbind: fetch once' },
      { k: 'max-repetitions', v: '3', tone: 'b', note: 'the other three: step forward 3 times' },
      { k: 'community', v: 'public', tone: 'rst', note: 'still in every packet' },
    ],
    varbinds: [
      { oid: '1.3.6.1.2.1.1.3', name: 'sysUpTime', type: 'NULL', value: '—', note: 'no .0 — GETBULK returns what comes next' },
      { oid: '1.3.6.1.2.1.2.2.1.2', name: 'ifDescr', type: 'NULL', value: '—', note: 'a column, not a cell' },
      { oid: '1.3.6.1.2.1.2.2.1.8', name: 'ifOperStatus', type: 'NULL', value: '—', note: 'a column, not a cell' },
      { oid: '1.3.6.1.2.1.2.2.1.10', name: 'ifInOctets', type: 'NULL', value: '—', note: 'a column, not a cell' },
    ],
    wire: [
      { text: '  0.120  10.0.0.50:49732 → 10.0.0.1:161   getBulkRequest  id=18343  N=1 M=3  sysUpTime · ifDescr · ifOperStatus · ifInOctets', tone: 'b' },
    ],
    simple: 'Fetching interfaces one value at a time would cost a round trip per cell. GETBULK asks once: “the clock, then the next three rows of these three columns.” It names columns, not cells — each one means “whatever comes after this”.',
    technical: 'GetBulkRequest-PDU (0xA5). non-repeaters = 1: the first varbind is fetched once. max-repetitions = 3: each of the other three is walked forward three times. Every varbind has GETNEXT semantics — the agent returns the next OID in the tree — which is why it asks for 1.3.6.1.2.1.1.3 rather than …1.3.0: asking for .3.0 would return whatever comes after sysUpTime.',
    packet: '10.0.0.50:49732 → 10.0.0.1:161  v2c  community=public  getBulkRequest  id=18343  N=1 M=3  1.3.6.1.2.1.1.3  1.3.6.1.2.1.2.2.1.2  1.3.6.1.2.1.2.2.1.8  1.3.6.1.2.1.2.2.1.10',
  },
  {
    tag: 'RESPONSE', pdu: 'Response', flow: 'resp', at: '0.126 s',
    walkLabel: 'RESPONSE — ten values, three rows',
    callout: 'Here are rows 1, 2 and 3',
    chipSub: 'id 18343 · 10 varbinds',
    exposure: cleartext,
    touches: ['sysUpTime', 'ifDescr', 'ifOperStatus', 'ifInOctets'],
    header: [
      { k: 'pdu', v: 'Response · 0xA2', tone: 'a', note: 'one reply for the whole walk' },
      { k: 'request-id', v: '18343', tone: 'ok', note: 'matches the GETBULK' },
      { k: 'varbinds', v: '10', tone: 'a', note: '1 + 3 × 3, row by row' },
      { k: 'error-status', v: 'noError · 0', tone: 'ok', note: 'every column had three rows' },
      { k: 'ifInOctets.3', v: '1,204,775,210', tone: 'a', note: 'a running total — not a speed' },
    ],
    varbinds: [
      { oid: '1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', type: 'TimeTicks', value: '365108312', note: '42 days, 06:11:23.12' },
      { oid: '1.3.6.1.2.1.2.2.1.2.1', name: 'ifDescr.1', type: 'OCTET STRING', value: '"GigabitEthernet0/0"' },
      { oid: '1.3.6.1.2.1.2.2.1.8.1', name: 'ifOperStatus.1', type: 'INTEGER', value: 'up(1)' },
      { oid: '1.3.6.1.2.1.2.2.1.10.1', name: 'ifInOctets.1', type: 'Counter32', value: '2871403112' },
      { oid: '1.3.6.1.2.1.2.2.1.2.2', name: 'ifDescr.2', type: 'OCTET STRING', value: '"GigabitEthernet0/1"' },
      { oid: '1.3.6.1.2.1.2.2.1.8.2', name: 'ifOperStatus.2', type: 'INTEGER', value: 'up(1)' },
      { oid: '1.3.6.1.2.1.2.2.1.10.2', name: 'ifInOctets.2', type: 'Counter32', value: '918224507' },
      { oid: '1.3.6.1.2.1.2.2.1.2.3', name: 'ifDescr.3', type: 'OCTET STRING', value: '"GigabitEthernet0/2"' },
      { oid: '1.3.6.1.2.1.2.2.1.8.3', name: 'ifOperStatus.3', type: 'INTEGER', value: 'up(1)' },
      { oid: '1.3.6.1.2.1.2.2.1.10.3', name: 'ifInOctets.3', type: 'Counter32', value: '1204775210', note: 'the one this lab watches' },
    ],
    wire: [
      { text: '  0.126  10.0.0.1:161 → 10.0.0.50:49732   get-response    id=18343  10 varbinds · ifInOctets.3 = 1204775210', tone: 'a' },
      { text: '         ↳ baseline stored · next poll in 60 s', tone: 'dim' },
    ],
    simple: 'One reply carries ten values: the clock, then a name, a status and a byte count for each of three interfaces. The byte counts are huge because they are running totals since boot, not a speed. One reading of a counter tells you almost nothing.',
    technical: 'Response-PDU with 1 + (3 × 3) = 10 varbinds, ordered repetition by repetition: row 1’s three columns, then row 2’s, then row 3’s. ifInOctets is a Counter32 — it only ever increases and wraps at 4,294,967,295. On a 1 Gbit/s link that is about 34 seconds of traffic, which is why fast interfaces are polled on the 64-bit ifHCInOctets.',
    packet: '10.0.0.1:161 → 10.0.0.50:49732  v2c  community=public  get-response  id=18343  10 varbinds  …  1.3.6.1.2.1.2.2.1.10.3 = Counter32: 1204775210',
  },
  {
    tag: 'GET', pdu: 'GetRequest', flow: 'req', at: '60.120 s',
    walkLabel: 'GET — the same counter, 60 s later',
    callout: 'Your byte count again, please',
    chipSub: 'id 18344 · 2 varbinds',
    exposure: cleartext,
    touches: ['sysUpTime', 'ifInOctets'],
    header: [
      { k: 'pdu', v: 'GetRequest · 0xA0', tone: 'b', note: 'exact instances, no walking' },
      { k: 'request-id', v: '18344', note: 'sixty seconds after 18343' },
      { k: 'varbinds', v: '2', note: 'the clock rides with the counter' },
      { k: 'interval', v: '60 s', note: 'set by the NMS, not the protocol' },
      { k: 'community', v: 'public', tone: 'rst', note: 'and again' },
    ],
    varbinds: [
      { oid: '1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', type: 'NULL', value: '—', note: 'pins the interval to the agent’s clock' },
      { oid: '1.3.6.1.2.1.2.2.1.10.3', name: 'ifInOctets.3', type: 'NULL', value: '—', note: 'the counter, one minute on' },
    ],
    wire: [
      { text: ' 60.120  10.0.0.50:49732 → 10.0.0.1:161   get-request     id=18344  sysUpTime.0 · ifInOctets.3', tone: 'b' },
    ],
    simple: 'A minute passes. The monitoring server asks for the same byte counter again — and for the clock in the same breath, so it knows exactly how much time lies between the two readings instead of trusting its own schedule.',
    technical: 'A plain GetRequest for two exact instances, so no GETNEXT semantics: 1.3.6.1.2.1.1.3.0 and 1.3.6.1.2.1.2.2.1.10.3. Reading sysUpTime with the counter pins the interval to the agent’s own clock — a poll delayed on the manager side would otherwise skew the rate.',
    packet: '10.0.0.50:49732 → 10.0.0.1:161  v2c  community=public  get-request  id=18344  1.3.6.1.2.1.1.3.0  1.3.6.1.2.1.2.2.1.10.3',
  },
  {
    tag: 'RESPONSE', pdu: 'Response', flow: 'resp', at: '60.124 s',
    walkLabel: 'RESPONSE — subtract, and it becomes a speed',
    callout: '1,542,275,210 bytes so far',
    chipSub: 'id 18344 · ifInOctets.3',
    exposure: cleartext,
    touches: ['sysUpTime', 'ifInOctets'],
    header: [
      { k: 'pdu', v: 'Response · 0xA2', tone: 'a', note: 'two values back' },
      { k: 'request-id', v: '18344', tone: 'ok', note: 'matches' },
      { k: 'Δ octets', v: '337,500,000', tone: 'a', note: 'second reading − first' },
      { k: 'Δ time', v: '60.00 s', tone: 'a', note: '6,000 ticks of the agent’s clock' },
      { k: 'rate', v: '45.0 Mbit/s', tone: 'ok', note: 'Δ octets × 8 ÷ Δ time' },
    ],
    varbinds: [
      { oid: '1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', type: 'TimeTicks', value: '365114312', note: '42 days, 06:12:23.12 — 6,000 ticks on' },
      { oid: '1.3.6.1.2.1.2.2.1.10.3', name: 'ifInOctets.3', type: 'Counter32', value: '1542275210', note: '+337,500,000 since the last poll' },
    ],
    wire: [
      { text: ' 60.124  10.0.0.1:161 → 10.0.0.50:49732   get-response    id=18344  sysUpTime.0 = 365114312 · ifInOctets.3 = 1542275210', tone: 'a' },
      { text: '         ↳ (1542275210 − 1204775210) × 8 ÷ 60.00 s = 45.0 Mbit/s', tone: 'ok' },
    ],
    simple: 'The counter has grown by 337,500,000 bytes in exactly 60 seconds. Multiply by eight for bits and divide by the time: 45 megabits per second. Every traffic graph you have ever seen is this subtraction, repeated every minute.',
    technical: 'rate = (1,542,275,210 − 1,204,775,210) × 8 ÷ ((365,114,312 − 365,108,312) ÷ 100) = 337,500,000 × 8 ÷ 60.00 = 45,000,000 bit/s. Had the second reading been smaller, the counter wrapped (add 2³²) or the device rebooted — and sysUpTime going backwards is how the two are told apart.',
    packet: '10.0.0.1:161 → 10.0.0.50:49732  v2c  community=public  get-response  id=18344  1.3.6.1.2.1.1.3.0 = Timeticks: (365114312)  1.3.6.1.2.1.2.2.1.10.3 = Counter32: 1542275210',
  },
  {
    tag: 'TRAP', pdu: 'SNMPv2-Trap', flow: 'trap', at: '111.120 s',
    walkLabel: 'TRAP — the router speaks first, on 162',
    callout: 'Gi0/2 just went down!',
    chipSub: 'linkDown · ifIndex 3',
    exposure: cleartext,
    touches: ['sysUpTime', 'snmpTrapOID', 'ifIndex', 'ifAdminStatus', 'ifOperStatus'],
    header: [
      { k: 'pdu', v: 'SNMPv2-Trap · 0xA7', tone: 'rst', note: 'nobody asked for this' },
      { k: 'destination', v: '10.0.0.50:162', tone: 'rst', note: 'the manager’s listening port' },
      { k: 'request-id', v: '7031', note: 'present, but nothing will match it' },
      { k: 'snmpTrapOID.0', v: 'linkDown', tone: 'rst', note: '1.3.6.1.6.3.1.1.5.3 names the event' },
      { k: 'reply', v: 'none', tone: 'a', note: 'an InformRequest would get one' },
    ],
    varbinds: [
      { oid: '1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', type: 'TimeTicks', value: '365119412', note: 'when it happened — 42 days, 06:13:14.12' },
      { oid: '1.3.6.1.6.3.1.1.4.1.0', name: 'snmpTrapOID.0', type: 'OBJECT IDENTIFIER', value: 'linkDown', note: 'which event — 1.3.6.1.6.3.1.1.5.3' },
      { oid: '1.3.6.1.2.1.2.2.1.1.3', name: 'ifIndex.3', type: 'INTEGER', value: '3', note: 'which interface' },
      { oid: '1.3.6.1.2.1.2.2.1.7.3', name: 'ifAdminStatus.3', type: 'INTEGER', value: 'up(1)', note: 'nobody shut it down…' },
      { oid: '1.3.6.1.2.1.2.2.1.8.3', name: 'ifOperStatus.3', type: 'INTEGER', value: 'down(2)', note: '…so this is a fault' },
    ],
    wire: [
      { text: '111.120  10.0.0.1:57203 → 10.0.0.50:162  snmpV2-trap     id=7031   linkDown · ifIndex.3 = 3 · ifOperStatus.3 = down(2)', tone: 'rst' },
      { text: '         ↳ unsolicited, on 162 · no response, no retry — if this datagram is lost, nobody knows', tone: 'dim' },
    ],
    simple: 'Nobody asked this time. A cable is pulled on the router’s third port, and instead of waiting up to a minute to be polled, the router tells the monitoring server at once — on a different port, 162, where the server sits listening.',
    technical: 'SNMPv2-Trap-PDU (0xA7) to 10.0.0.50:162. The first two varbinds are mandatory: sysUpTime.0, and snmpTrapOID.0 naming the event — linkDown, 1.3.6.1.6.3.1.1.5.3. The rest are the objects IF-MIB defines for linkDown: ifIndex, ifAdminStatus up, ifOperStatus down — up by configuration but down in fact is a fault, not a shutdown. A trap is never acknowledged; an InformRequest carries the same content and does expect a Response.',
    packet: '10.0.0.1:57203 → 10.0.0.50:162  v2c  community=public  snmpV2-trap  id=7031  snmpTrapOID.0 = linkDown  ifIndex.3 = 3  ifAdminStatus.3 = up(1)  ifOperStatus.3 = down(2)',
  },
];

export const secureSteps: SnmpStep[] = [
  {
    tag: 'GET', pdu: 'GetRequest · discovery', flow: 'req', at: '0.000 s',
    walkLabel: 'GET — no credentials, built to be refused',
    callout: 'Who are you, exactly?',
    chipSub: 'engineID (empty) · noAuthNoPriv',
    exposure: { text: 'noAuthNoPriv · nothing secret sent yet', tone: 'a' },
    touches: [],
    header: [
      { k: 'msgVersion', v: '3', tone: 'b', note: 'the version number finally matches' },
      { k: 'msgID', v: '20411', note: 'v3 moves the id into the header' },
      { k: 'msgFlags', v: '0x04 · reportable', tone: 'a', note: 'no auth, no priv — nothing to protect' },
      { k: 'engine ID', v: '(empty)', tone: 'rst', note: 'the manager does not know it yet' },
      { k: 'msgUserName', v: '(empty)', note: 'no user until there is an engine' },
      { k: 'security model', v: '3 · USM', note: 'user-based security' },
    ],
    varbinds: [],
    wire: [
      { text: '  0.000  10.0.0.50:49733 → 10.0.0.1:161   get-request     msgID=20411  engineID=(empty)  user=(empty)  no varbinds', tone: 'b' },
      { text: '         ↳ noAuthNoPriv and reportable — sent only so that it will be refused', tone: 'dim' },
    ],
    simple: 'SNMPv3 ties every password to one specific device, so before the manager can prove who it is, it has to learn the router’s identity. It sends an empty, unauthenticated request purely to be told no.',
    technical: 'A discovery message per RFC 3414 §4: msgFlags = reportable, securityLevel noAuthNoPriv, msgAuthoritativeEngineID and msgUserName zero-length, an empty varbind list. USM localises every user’s keys to the agent’s snmpEngineID, so the manager cannot compute a valid HMAC — let alone a cipher key — until it has that ID.',
    packet: '10.0.0.50:49733 → 10.0.0.1:161  v3  msgID=20411  flags=reportable  engineID=(empty)  user=(empty)  get-request  (no varbinds)',
  },
  {
    tag: 'REPORT', pdu: 'Report', flow: 'resp', at: '0.002 s',
    walkLabel: 'REPORT — engine ID, boots and time',
    callout: 'I am engine …a43b81',
    chipSub: 'engineID 80000009…a43b81',
    exposure: { text: 'engine ID, boots and time · public by design', tone: 'a' },
    touches: ['usmStatsUnknownEngineIDs'],
    header: [
      { k: 'pdu', v: 'Report · 0xA8', tone: 'a', note: 'a refusal that carries answers' },
      { k: 'engine ID', v: '80 00 00 09 03 00 1c 58 a4 3b 81', tone: 'ok', note: 'enterprise 9 · format 3 · a MAC' },
      { k: 'engineBoots', v: '17', tone: 'ok', note: 'times this engine has restarted' },
      { k: 'engineTime', v: '3,651,083 s', tone: 'ok', note: 'seconds since boot — 42 days' },
      { k: 'msgFlags', v: '0x00', note: 'a report is never reportable' },
      { k: 'time window', v: '± 150 s', note: 'outside it, messages are rejected' },
    ],
    varbinds: [
      { oid: '1.3.6.1.6.3.15.1.1.4.0', name: 'usmStatsUnknownEngineIDs.0', type: 'Counter32', value: '3', note: 'why the request was refused' },
    ],
    wire: [
      { text: '  0.002  10.0.0.1:161 → 10.0.0.50:49733   report          msgID=20411  usmStatsUnknownEngineIDs.0 = 3', tone: 'a' },
      { text: `         ↳ engineID=${ENGINE_ID}  boots=17  time=3651083`, tone: 'a' },
    ],
    simple: 'The router refuses — but the refusal is useful. It carries the router’s engine ID, how many times it has rebooted, and how long it has been up. With those, the manager can build keys only this router will accept, and stamp its messages with a time the router will believe.',
    technical: 'Report-PDU (0xA8) with usmStatsUnknownEngineIDs.0, and the agent’s snmpEngineID, snmpEngineBoots and snmpEngineTime in the security parameters. RFC 3414 also describes a second, authenticated round with boots and time set to zero, answered by usmStatsNotInTimeWindows; many managers take boots and time from this Report instead, and this lab does too. A message more than 150 seconds outside that clock is rejected, which is what stops a captured request being replayed later.',
    packet: `10.0.0.1:161 → 10.0.0.50:49733  v3  msgID=20411  engineID=${ENGINE_ID}  boots=17  time=3651083  report  1.3.6.1.6.3.15.1.1.4.0 = Counter32: 3`,
  },
  {
    tag: 'GET · authPriv', pdu: 'GetRequest · authPriv', flow: 'req', at: '0.041 s',
    walkLabel: 'GET — signed, then sealed',
    callout: 'Uptime — signed and sealed',
    chipSub: 'user nms-ro · encryptedPDU',
    exposure: { text: 'scopedPDU encrypted · the user name is not', tone: 'ok' },
    sealed: true,
    touches: ['sysUpTime'],
    header: [
      { k: 'msgFlags', v: '0x07 · auth · priv · report', tone: 'ok', note: 'authPriv — the right answer' },
      { k: 'msgUserName', v: 'nms-ro', tone: 'a', note: 'in the clear: it picks the key' },
      { k: 'auth params', v: '24-byte HMAC-SHA-256', tone: 'ok', note: 'change one bit and it fails' },
      { k: 'priv params', v: '8-byte salt · AES-128', tone: 'ok', note: 'no two ciphertexts alike' },
      { k: 'boots · time', v: '17 · 3,651,083', note: 'inside the 150 s window' },
      { k: 'scopedPDU', v: 'encrypted', tone: 'ok', note: 'context and GetRequest, sealed' },
    ],
    varbinds: [
      { oid: '1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', type: 'NULL', value: '—', note: 'the same question as the v2c poll' },
    ],
    wire: [
      { text: '  0.041  10.0.0.50:49733 → 10.0.0.1:161   encryptedPDU    msgID=20412  user=nms-ro  authPriv', tone: 'b' },
      { text: '         ↳ readable: addresses, ports, msgID, user name, engine ID, boots, time · sealed: the OID being asked for', tone: 'dim' },
    ],
    simple: 'Now the real question — the same “how long have you been up?” as before. This time the question is encrypted, and the whole message is signed with a key only this user and this router share. Anyone watching sees who is asking, but not what.',
    technical: 'msgFlags = auth | priv | reportable, securityLevel authPriv. The scopedPDU — contextEngineID, contextName and the GetRequest — is encrypted with AES-128 in CFB mode (RFC 3826) using the 8-byte salt in msgPrivacyParameters. The whole message is then authenticated with HMAC-SHA-256 truncated to 24 bytes (RFC 7860). msgUserName, the engine ID, boots and time stay in the clear: they are needed to find the key before anything can be decrypted.',
    packet: `10.0.0.50:49733 → 10.0.0.1:161  v3  msgID=20412  flags=auth|priv|reportable  user=nms-ro  engineID=${ENGINE_ID}  encryptedPDU: privKey unknown`,
  },
  {
    tag: 'RESPONSE · authPriv', pdu: 'Response · authPriv', flow: 'resp', at: '0.044 s',
    walkLabel: 'RESPONSE — the answer nobody else can read',
    callout: '42 days — for your eyes only',
    chipSub: 'user nms-ro · encryptedPDU',
    exposure: { text: 'scopedPDU encrypted · the user name is not', tone: 'ok' },
    sealed: true,
    touches: ['sysUpTime'],
    header: [
      { k: 'msgFlags', v: '0x03 · auth · priv', tone: 'ok', note: 'a response is not reportable' },
      { k: 'msgID', v: '20412', tone: 'ok', note: 'matches the request' },
      { k: 'HMAC', v: 'verified', tone: 'ok', note: 'from this router, unaltered' },
      { k: 'scopedPDU', v: 'decrypted · AES-128', tone: 'ok', note: 'only the manager holds the key' },
      { k: 'community', v: 'none', tone: 'ok', note: 'v3 has no community string' },
      { k: 'msgUserName', v: 'nms-ro', tone: 'a', note: 'still readable on the wire' },
    ],
    varbinds: [
      { oid: '1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', type: 'TimeTicks', value: '365108342', note: '42 days, 06:11:23.42' },
    ],
    wire: [
      { text: '  0.044  10.0.0.1:161 → 10.0.0.50:49733   encryptedPDU    msgID=20412  user=nms-ro  authPriv', tone: 'a' },
      { text: '         ↳ HMAC-SHA-256 verified, AES-128 decrypted on the manager: sysUpTime.0 = 365108342', tone: 'ok' },
    ],
    simple: 'The router gives the same kind of answer it did in the plaintext poll — 42 days — but sealed. The manager checks the signature first, so it knows the reply really came from the router and was not changed on the way, and only then decrypts it.',
    technical: 'Response-PDU inside an encrypted scopedPDU, msgFlags = auth | priv (responses are never reportable). The manager verifies the HMAC before decrypting, then matches msgID 20412. The data is the same as the v2c exchange; what changed is who can read it and whether anyone could have forged it. There is no community string anywhere in the message.',
    packet: '10.0.0.1:161 → 10.0.0.50:49733  v3  msgID=20412  flags=auth|priv  user=nms-ro  encryptedPDU: privKey unknown  ↳ decrypted: 1.3.6.1.2.1.1.3.0 = Timeticks: (365108342)',
  },
];

export const stepsFor = (sc: Scenario) => (sc === 'secure' ? secureSteps : pollSteps);

/** the state line on the console, one entry per step including step 0 */
export const states: Record<Scenario, { text: string; tone: Tone }[]> = {
  poll: [
    { text: 'idle · nothing asked yet', tone: 'dim' },
    { text: 'waiting for a reply', tone: 'b' },
    { text: 'uptime known', tone: 'a' },
    { text: 'walking the interface table', tone: 'b' },
    { text: 'baseline stored', tone: 'a' },
    { text: 'second poll sent', tone: 'b' },
    { text: 'rate · 45.0 Mbit/s', tone: 'ok' },
    { text: 'alarm · Gi0/2 linkDown', tone: 'rst' },
  ],
  secure: [
    { text: 'no engine id · no keys', tone: 'dim' },
    { text: 'discovering the engine', tone: 'b' },
    { text: 'engine known · keys localised', tone: 'a' },
    { text: 'authPriv request sent', tone: 'b' },
    { text: 'verified · decrypted', tone: 'ok' },
  ],
};

export const idle: Record<Scenario, { explain: string; foot: string }> = {
  poll: {
    explain: 'The monitoring server knows one address, 10.0.0.1, and one shared string, “public”. That is all SNMPv2c needs to read a router — which is exactly the problem the Secure scenario exists to show.',
    foot: 'nms 10.0.0.50 · agent 10.0.0.1:161 · community public · poll interval 60 s',
  },
  secure: {
    explain: 'The monitoring server has a v3 user, nms-ro, and two passphrases. It still cannot build a single key: SNMPv3 keys are localised to one device’s engine ID, and it does not know this router’s yet.',
    foot: 'nms 10.0.0.50 · agent 10.0.0.1:161 · user nms-ro · auth SHA-256 · priv AES-128',
  },
};

/** the two readings the rate is built from — they match the varbinds above */
export const RATE = {
  first: { ticks: 365108312, octets: 1204775210 },
  second: { ticks: 365114312, octets: 1542275210 },
  linkBps: 1_000_000_000,
};

export type MibNode = {
  key: string;
  label: string;
  /** the arc under the parent — several arcs where intermediate nodes are folded */
  arc: string;
  oid: string;
  depth: number;
  /** the nodes folded into `arc`, named */
  via?: string;
};

/* Only the branches this lab touches, in tree order. Folding the deeper SNMP
   module paths keeps the notification and USM objects on screen without eight
   rows of scaffolding above each. */
export const mibTree: MibNode[] = [
  { key: 'iso', label: 'iso', arc: '1', oid: '1', depth: 0 },
  { key: 'org', label: 'org', arc: '3', oid: '1.3', depth: 1 },
  { key: 'dod', label: 'dod', arc: '6', oid: '1.3.6', depth: 2 },
  { key: 'internet', label: 'internet', arc: '1', oid: '1.3.6.1', depth: 3 },
  { key: 'mgmt', label: 'mgmt', arc: '2', oid: '1.3.6.1.2', depth: 4 },
  { key: 'mib2', label: 'mib-2', arc: '1', oid: '1.3.6.1.2.1', depth: 5 },
  { key: 'system', label: 'system', arc: '1', oid: '1.3.6.1.2.1.1', depth: 6 },
  { key: 'sysUpTime', label: 'sysUpTime', arc: '3', oid: '1.3.6.1.2.1.1.3', depth: 7 },
  { key: 'interfaces', label: 'interfaces', arc: '2', oid: '1.3.6.1.2.1.2', depth: 6 },
  { key: 'ifTable', label: 'ifTable', arc: '2', oid: '1.3.6.1.2.1.2.2', depth: 7 },
  { key: 'ifEntry', label: 'ifEntry', arc: '1', oid: '1.3.6.1.2.1.2.2.1', depth: 8 },
  { key: 'ifIndex', label: 'ifIndex', arc: '1', oid: '1.3.6.1.2.1.2.2.1.1', depth: 9 },
  { key: 'ifDescr', label: 'ifDescr', arc: '2', oid: '1.3.6.1.2.1.2.2.1.2', depth: 9 },
  { key: 'ifAdminStatus', label: 'ifAdminStatus', arc: '7', oid: '1.3.6.1.2.1.2.2.1.7', depth: 9 },
  { key: 'ifOperStatus', label: 'ifOperStatus', arc: '8', oid: '1.3.6.1.2.1.2.2.1.8', depth: 9 },
  { key: 'ifInOctets', label: 'ifInOctets', arc: '10', oid: '1.3.6.1.2.1.2.2.1.10', depth: 9 },
  { key: 'snmpV2', label: 'snmpV2', arc: '6', oid: '1.3.6.1.6', depth: 4 },
  { key: 'snmpModules', label: 'snmpModules', arc: '3', oid: '1.3.6.1.6.3', depth: 5 },
  { key: 'snmpTrapOID', label: 'snmpTrapOID', arc: '1.1.4.1', oid: '1.3.6.1.6.3.1.1.4.1', depth: 6, via: 'snmpMIB › snmpTrap' },
  { key: 'usmStatsUnknownEngineIDs', label: 'usmStatsUnknownEngineIDs', arc: '15.1.1.4', oid: '1.3.6.1.6.3.15.1.1.4', depth: 6, via: 'usmMIB › usmStats' },
];

export const mibByKey: Record<string, MibNode> = Object.fromEntries(mibTree.map((node) => [node.key, node]));
