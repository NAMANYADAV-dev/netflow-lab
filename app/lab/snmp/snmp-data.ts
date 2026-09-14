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

export type Tone = 'a' | 'b' | 'ok' | 'rst' | 'dim' | 'text';

export const toneVar: Record<Tone, string> = {
  a: 'var(--a)',
  b: 'var(--b)',
  ok: 'var(--ok)',
  rst: 'var(--rst)',
  dim: 'var(--text3)',
  text: 'var(--text)',
};

/** req = manager → agent on 161 · resp = agent → manager on 161 · trap = agent → manager on 162 */
export type Flow = 'req' | 'resp' | 'trap';

export const flowTone: Record<Flow, Tone> = { req: 'b', resp: 'a', trap: 'rst' };

export type HeaderField = { k: string; v: string; tone?: Tone; note: string };
export type VarBind = { oid: string; name: string; type: string; value: string; note?: string };

export type SnmpStep = {
  /** the PDU's short name, as it is written on the wire */
  tag: string;
  /** what kind of message this is, in plain words */
  label: string;
  /** the PDU's proper name */
  pdu: string;
  flow: Flow;
  walkLabel: string;
  /** what happened, in one plain sentence */
  title: string;
  /** what the sender says, as a speech bubble */
  callout: string;
  /** what a stranger on the path can read about this datagram */
  exposure: { text: string; tone: Tone };
  /** the varbinds cross the wire encrypted */
  sealed?: boolean;
  header: HeaderField[];
  varbinds: VarBind[];
  simple: string;
  technical: string;
  packet: string;
};

export const ENGINE_ID = '8000000903001c58a43b81';

const cleartext = { text: 'Anyone on the network can read this — even the password “public”', tone: 'rst' } as const;

export const pollSteps: SnmpStep[] = [
  {
    tag: 'GET', pdu: 'GetRequest', flow: 'req',
    walkLabel: 'GET — “how long have you been up?”',
    label: 'Question',
    title: 'The monitoring server asked the router how long it has been running.',
    callout: 'How long have you been up?',
    exposure: cleartext,
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
    simple: 'The server wants to know how long the router has been switched on, so it sends one small question. The password — the word “public” — travels right alongside it, unhidden.',
    technical: 'GetRequest-PDU (0xA0) from 10.0.0.50:49732 to 10.0.0.1:161: version 1 (v2c), community "public", request-id 18342, one varbind — 1.3.6.1.2.1.1.3.0 with a NULL value. The trailing .0 is the instance: sysUpTime is a scalar, and a scalar has exactly one instance, .0.',
    packet: '10.0.0.50:49732 → 10.0.0.1:161  v2c  community=public  get-request  id=18342  1.3.6.1.2.1.1.3.0 = NULL',
  },
  {
    tag: 'RESPONSE', pdu: 'Response', flow: 'resp',
    walkLabel: 'RESPONSE — 42 days, 06:11:23',
    label: 'Answer',
    title: 'The router answered: up for 42 days, 6 hours and 11 minutes.',
    callout: '42 days, 6 hours, 11 minutes',
    exposure: cleartext,
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
    simple: 'The router replies with a single number. SNMP counts time in hundredths of a second, so 365,108,300 means 42 days, 6 hours and 11 minutes.',
    technical: 'Response-PDU (0xA2) back to the manager’s source port: request-id 18342, error-status noError. TimeTicks is an unsigned 32-bit count of hundredths of a second, so it wraps after about 497 days — an uptime that goes backwards means a reboot or a wrap.',
    packet: '10.0.0.1:161 → 10.0.0.50:49732  v2c  community=public  get-response  id=18342  1.3.6.1.2.1.1.3.0 = Timeticks: (365108300) 42 days, 6:11:23.00',
  },
  {
    tag: 'GETBULK', pdu: 'GetBulkRequest', flow: 'req',
    walkLabel: 'GETBULK — the interface table in one ask',
    label: 'Bulk question',
    title: 'The server asked for all three router ports in a single message.',
    callout: 'Tell me about all three ports',
    exposure: cleartext,
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
    simple: 'Instead of asking about each port one at a time, the server asks for the name, the status and the byte count of all three ports at once. One question instead of nine.',
    technical: 'GetBulkRequest-PDU (0xA5). non-repeaters = 1: the first varbind is fetched once. max-repetitions = 3: each of the other three is walked forward three times. Every varbind has GETNEXT semantics — the agent returns the next OID in the tree — which is why it asks for 1.3.6.1.2.1.1.3 rather than …1.3.0: asking for .3.0 would return whatever comes after sysUpTime.',
    packet: '10.0.0.50:49732 → 10.0.0.1:161  v2c  community=public  getBulkRequest  id=18343  N=1 M=3  1.3.6.1.2.1.1.3  1.3.6.1.2.1.2.2.1.2  1.3.6.1.2.1.2.2.1.8  1.3.6.1.2.1.2.2.1.10',
  },
  {
    tag: 'RESPONSE', pdu: 'Response', flow: 'resp',
    walkLabel: 'RESPONSE — ten values, three rows',
    label: 'Answer',
    title: 'The router sent back each port’s name, its status and its total bytes.',
    callout: 'Here are rows 1, 2 and 3',
    exposure: cleartext,
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
    simple: 'Back come ten values: the clock, then a name, a status and a byte count for each port. The byte count is a running total since the router started — it is not a speed.',
    technical: 'Response-PDU with 1 + (3 × 3) = 10 varbinds, ordered repetition by repetition: row 1’s three columns, then row 2’s, then row 3’s. ifInOctets is a Counter32 — it only ever increases and wraps at 4,294,967,295. On a 1 Gbit/s link that is about 34 seconds of traffic, which is why fast interfaces are polled on the 64-bit ifHCInOctets.',
    packet: '10.0.0.1:161 → 10.0.0.50:49732  v2c  community=public  get-response  id=18343  10 varbinds  …  1.3.6.1.2.1.2.2.1.10.3 = Counter32: 1204775210',
  },
  {
    tag: 'GET', pdu: 'GetRequest', flow: 'req',
    walkLabel: 'GET — the same counter, 60 s later',
    label: 'Question',
    title: 'One minute later, the server asked for the same byte count again.',
    callout: 'Your byte count again, please',
    exposure: cleartext,
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
    simple: 'The server waits one minute and asks for the Gi0/2 byte count again — together with the router’s clock, so it knows exactly how much time has passed.',
    technical: 'A plain GetRequest for two exact instances, so no GETNEXT semantics: 1.3.6.1.2.1.1.3.0 and 1.3.6.1.2.1.2.2.1.10.3. Reading sysUpTime with the counter pins the interval to the agent’s own clock — a poll delayed on the manager side would otherwise skew the rate.',
    packet: '10.0.0.50:49732 → 10.0.0.1:161  v2c  community=public  get-request  id=18344  1.3.6.1.2.1.1.3.0  1.3.6.1.2.1.2.2.1.10.3',
  },
  {
    tag: 'RESPONSE', pdu: 'Response', flow: 'resp',
    walkLabel: 'RESPONSE — subtract, and it becomes a speed',
    label: 'Answer',
    title: 'The count grew by 337,500,000 bytes in 60 seconds — that is 45 Mbit/s.',
    callout: '1,542,275,210 bytes so far',
    exposure: cleartext,
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
    simple: 'The count went up by 337,500,000 bytes in exactly 60 seconds. Bytes × 8 gives bits, and ÷ 60 seconds gives 45 megabits per second. Every traffic graph is made this way.',
    technical: 'rate = (1,542,275,210 − 1,204,775,210) × 8 ÷ ((365,114,312 − 365,108,312) ÷ 100) = 337,500,000 × 8 ÷ 60.00 = 45,000,000 bit/s. Had the second reading been smaller, the counter wrapped (add 2³²) or the device rebooted — and sysUpTime going backwards is how the two are told apart.',
    packet: '10.0.0.1:161 → 10.0.0.50:49732  v2c  community=public  get-response  id=18344  1.3.6.1.2.1.1.3.0 = Timeticks: (365114312)  1.3.6.1.2.1.2.2.1.10.3 = Counter32: 1542275210',
  },
  {
    tag: 'TRAP', pdu: 'SNMPv2-Trap', flow: 'trap',
    walkLabel: 'TRAP — the router speaks first, on 162',
    label: 'Alarm',
    title: 'A cable was pulled out, and the router raised the alarm by itself.',
    callout: 'Gi0/2 just went down!',
    exposure: cleartext,
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
    simple: 'Nobody asked this time. Someone unplugged Gi0/2, so the router sends an alarm straight away on its own port, 162, instead of waiting for the next question.',
    technical: 'SNMPv2-Trap-PDU (0xA7) to 10.0.0.50:162. The first two varbinds are mandatory: sysUpTime.0, and snmpTrapOID.0 naming the event — linkDown, 1.3.6.1.6.3.1.1.5.3. The rest are the objects IF-MIB defines for linkDown: ifIndex, ifAdminStatus up, ifOperStatus down — up by configuration but down in fact is a fault, not a shutdown. A trap is never acknowledged; an InformRequest carries the same content and does expect a Response.',
    packet: '10.0.0.1:57203 → 10.0.0.50:162  v2c  community=public  snmpV2-trap  id=7031  snmpTrapOID.0 = linkDown  ifIndex.3 = 3  ifAdminStatus.3 = up(1)  ifOperStatus.3 = down(2)',
  },
];

export const secureSteps: SnmpStep[] = [
  {
    tag: 'GET', pdu: 'GetRequest · discovery', flow: 'req',
    walkLabel: 'GET — no credentials, built to be refused',
    label: 'Question',
    title: 'The server knocked with no password — only to learn the router’s ID.',
    callout: 'Who are you? (no password yet)',
    exposure: { text: 'Nothing secret in it yet', tone: 'a' },
    header: [
      { k: 'msgVersion', v: '3', tone: 'b', note: 'the version number finally matches' },
      { k: 'msgID', v: '20411', note: 'v3 moves the id into the header' },
      { k: 'msgFlags', v: '0x04 · reportable', tone: 'a', note: 'no auth, no priv — nothing to protect' },
      { k: 'engine ID', v: '(empty)', tone: 'rst', note: 'the manager does not know it yet' },
      { k: 'msgUserName', v: '(empty)', note: 'no user until there is an engine' },
      { k: 'security model', v: '3 · USM', note: 'user-based security' },
    ],
    varbinds: [],
    simple: 'With SNMPv3 a password only works for one particular router. The server does not know this router’s ID yet, so it sends an empty question just to find out.',
    technical: 'A discovery message per RFC 3414 §4: msgFlags = reportable, securityLevel noAuthNoPriv, msgAuthoritativeEngineID and msgUserName zero-length, an empty varbind list. USM localises every user’s keys to the agent’s snmpEngineID, so the manager cannot compute a valid HMAC — let alone a cipher key — until it has that ID.',
    packet: '10.0.0.50:49733 → 10.0.0.1:161  v3  msgID=20411  flags=reportable  engineID=(empty)  user=(empty)  get-request  (no varbinds)',
  },
  {
    tag: 'REPORT', pdu: 'Report', flow: 'resp',
    walkLabel: 'REPORT — engine ID, boots and time',
    label: 'Report',
    title: 'The router said no, but its refusal carried the ID the server needed.',
    callout: 'Not yet — but here is my ID',
    exposure: { text: 'The router’s ID is not a secret — anyone can see it', tone: 'a' },
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
    simple: 'The router turns the empty question down, but its reply contains its ID and its clock. That is everything the server needs to build a key only this router will accept.',
    technical: 'Report-PDU (0xA8) with usmStatsUnknownEngineIDs.0, and the agent’s snmpEngineID, snmpEngineBoots and snmpEngineTime in the security parameters. RFC 3414 also describes a second, authenticated round with boots and time set to zero, answered by usmStatsNotInTimeWindows; many managers take boots and time from this Report instead, and this lab does too. A message more than 150 seconds outside that clock is rejected, which is what stops a captured request being replayed later.',
    packet: `10.0.0.1:161 → 10.0.0.50:49733  v3  msgID=20411  engineID=${ENGINE_ID}  boots=17  time=3651083  report  1.3.6.1.6.3.15.1.1.4.0 = Counter32: 3`,
  },
  {
    tag: 'GET · authPriv', pdu: 'GetRequest · authPriv', flow: 'req',
    walkLabel: 'GET — signed, then sealed',
    label: 'Locked question',
    title: 'The server asked again, this time signed and locked with that ID.',
    callout: 'Uptime, please — locked',
    exposure: { text: 'Locked — only the user name “nms-ro” still shows', tone: 'ok' },
    sealed: true,
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
    simple: 'Now the server asks the real question — how long have you been up? It signs the message so nobody can fake it, and locks it so nobody else can read it.',
    technical: 'msgFlags = auth | priv | reportable, securityLevel authPriv. The scopedPDU — contextEngineID, contextName and the GetRequest — is encrypted with AES-128 in CFB mode (RFC 3826) using the 8-byte salt in msgPrivacyParameters. The whole message is then authenticated with HMAC-SHA-256 truncated to 24 bytes (RFC 7860). msgUserName, the engine ID, boots and time stay in the clear: they are needed to find the key before anything can be decrypted.',
    packet: `10.0.0.50:49733 → 10.0.0.1:161  v3  msgID=20412  flags=auth|priv|reportable  user=nms-ro  engineID=${ENGINE_ID}  encryptedPDU: privKey unknown`,
  },
  {
    tag: 'RESPONSE · authPriv', pdu: 'Response · authPriv', flow: 'resp',
    walkLabel: 'RESPONSE — the answer nobody else can read',
    label: 'Locked answer',
    title: 'The router answered in a locked message only the server can open.',
    callout: '42 days — locked for you',
    exposure: { text: 'Locked — only the user name “nms-ro” still shows', tone: 'ok' },
    sealed: true,
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
    simple: 'The router answers the same way, locked. The server checks the signature to be sure the reply is genuine, then unlocks it: 42 days.',
    technical: 'Response-PDU inside an encrypted scopedPDU, msgFlags = auth | priv (responses are never reportable). The manager verifies the HMAC before decrypting, then matches msgID 20412. The data is the same as the v2c exchange; what changed is who can read it and whether anyone could have forged it. There is no community string anywhere in the message.',
    packet: '10.0.0.1:161 → 10.0.0.50:49733  v3  msgID=20412  flags=auth|priv  user=nms-ro  encryptedPDU: privKey unknown  ↳ decrypted: 1.3.6.1.2.1.1.3.0 = Timeticks: (365108342)',
  },
];

export const stepsFor = (sc: Scenario) => (sc === 'secure' ? secureSteps : pollSteps);

/** the state line on the console, one entry per step including step 0 */
export const states: Record<Scenario, { text: string; tone: Tone }[]> = {
  poll: [
    { text: 'ready', tone: 'dim' },
    { text: 'waiting for a reply', tone: 'b' },
    { text: 'uptime known', tone: 'a' },
    { text: 'asking about the ports', tone: 'b' },
    { text: 'first reading saved', tone: 'a' },
    { text: 'asking again', tone: 'b' },
    { text: 'speed: 45 Mbit/s', tone: 'ok' },
    { text: 'alarm: Gi0/2 is down', tone: 'rst' },
  ],
  secure: [
    { text: 'no router ID yet', tone: 'dim' },
    { text: 'asking for the ID', tone: 'b' },
    { text: 'ID known · key ready', tone: 'a' },
    { text: 'locked question sent', tone: 'b' },
    { text: 'answer unlocked', tone: 'ok' },
  ],
};

export const idle: Record<Scenario, { explain: string; foot: string }> = {
  poll: {
    explain: 'The server knows the router’s address and one shared password, “public”. With SNMPv2c that is all it needs — and anyone else who sees that password can ask too.',
    foot: 'nms 10.0.0.50 · agent 10.0.0.1:161 · community public · poll interval 60 s',
  },
  secure: {
    explain: 'The server has a user name, nms-ro, and a password. But an SNMPv3 password only works together with one router’s ID, and the server does not know this router’s ID yet.',
    foot: 'nms 10.0.0.50 · agent 10.0.0.1:161 · user nms-ro · auth SHA-256 · priv AES-128',
  },
};

/** the two readings the rate is built from — they match the varbinds above */
export const RATE = {
  first: { ticks: 365108312, octets: 1204775210 },
  second: { ticks: 365114312, octets: 1542275210 },
  linkBps: 1_000_000_000,
};
