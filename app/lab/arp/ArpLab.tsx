'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowCounterClockwise,
  Graph,
  MagnifyingGlass,
  Package,
  Skull,
} from '@phosphor-icons/react';
import { AttackDiagram, NormalDiagram } from './ArpDiagram';
import styles from './arp-lab.module.css';

type Scenario = 'normal' | 'attack';
type ReadingMode = 'simple' | 'technical' | 'packet';

type Beat = {
  /** the rule colour across the step card, the tick, and the kicker */
  c: string;
  /** one-word name for the transport readout */
  k: string;
  t: string;
  simple: string;
  technical: string;
  packet: string;
};

const normalBeats: Beat[] = [
  { c: 'var(--b)', k: 'Cache miss', t: 'The cache is empty',
    simple: 'PC-A wants to talk to 192.168.1.7, but it doesn’t know that host’s hardware address yet — so it can’t build a frame.',
    technical: 'ARP cache lookup for 192.168.1.7 → miss. An Ethernet frame needs a destination MAC, and there isn’t one on file.',
    packet: 'arp -a  →  (no entry for 192.168.1.7)' },
  { c: 'var(--a)', k: 'Build', t: 'Build the ARP request',
    simple: 'Fill in the packet on the left: what are we asking, and which IP are we asking about?',
    technical: 'Assemble the request: EtherType 0x0806, opcode 1, target protocol address 192.168.1.7, target hardware address left unknown.',
    packet: 'type=0x0806 htype=1 ptype=0x0800 op=1 tpa=192.168.1.7 tha=00:00:00:00:00:00' },
  { c: 'var(--a)', k: 'Addressed', t: 'Addressed to everyone',
    simple: 'We don’t know who owns that IP, so the question is sent to the whole network at once.',
    technical: 'Destination Ethernet address is the broadcast address ff:ff:ff:ff:ff:ff — every NIC on the segment accepts the frame.',
    packet: 'eth.dst=ff:ff:ff:ff:ff:ff  eth.src=00:1a:2b:00:0a:01' },
  { c: 'var(--a)', k: 'Broadcast', t: 'The switch floods it',
    simple: 'The switch sends a copy out of every port. The question reaches all six hosts at once.',
    technical: 'With no forwarding entry for the broadcast address, the switch floods the frame to every port in the broadcast domain.',
    packet: 'flood → ports 1..6 (broadcast domain)' },
  { c: 'var(--a)', k: 'Read', t: 'Every host reads it',
    simple: 'Each host opens the frame and asks itself the same thing: “Is that my address?”',
    technical: 'All six hosts receive the request and compare the target protocol address against their own configured IP.',
    packet: '6 × compare  tpa == local_ip ?' },
  { c: 'var(--ok)', k: 'Match', t: 'Only the owner matches',
    simple: 'Just one host owns 192.168.1.7. The other five quietly ignore the question.',
    technical: '192.168.1.7 matches host D. The five non-matching hosts silently drop the frame — no reply.',
    packet: 'match: D (192.168.1.7)  ·  5 × drop' },
  { c: 'var(--b)', k: 'Reply', t: 'A direct answer',
    simple: 'The owner answers PC-A alone, telling it the hardware address it was looking for.',
    technical: 'Host D sends a unicast ARP reply (opcode 2) straight back to PC-A, its MAC in the sender-hardware field.',
    packet: 'op=2 sha=1c:6f:65:aa:b3:07 → unicast 00:1a:2b:00:0a:01' },
  { c: 'var(--ok)', k: 'Cache', t: 'Store it for next time',
    simple: 'PC-A remembers the pair, so it won’t have to ask again for the next few minutes.',
    technical: 'PC-A writes 192.168.1.7 → 1c:6f:65:aa:b3:07 into its ARP cache with a short dynamic timeout.',
    packet: 'cache += 192.168.1.7  1c:6f:65:aa:b3:07  (dynamic ~4m)' },
  { c: 'var(--ok)', k: 'Done', t: 'Now the data flows',
    simple: 'The address is known, so real traffic goes straight to that host — no more asking.',
    technical: 'Frames are now unicast directly to 1c:6f:65:aa:b3:07 until the cache entry expires.',
    packet: 'eth.dst=1c:6f:65:aa:b3:07  data …' },
];

const attackBeats: Beat[] = [
  { c: 'var(--ok)', k: 'Baseline', t: 'Trust is already in place',
    simple: 'PC-A knows the gateway’s MAC and trusts it. Everything bound for the internet goes through 192.168.1.1.',
    technical: 'ARP cache holds 192.168.1.1 → 5e:aa:1f:00:00:01. Nothing authenticates this entry — ARP simply trusts it.',
    packet: 'cache: 192.168.1.1  5e:aa:1f:00:00:01  (dynamic)' },
  { c: 'var(--rst)', k: 'Intruder', t: 'An attacker joins the LAN',
    simple: 'A malicious host connects to the same network. It wants to sit between PC-A and the gateway.',
    technical: 'Attacker at 192.168.1.66 (de:ad:be:ef:13:37) shares the broadcast domain — no special access needed.',
    packet: 'attacker: 192.168.1.66  de:ad:be:ef:13:37' },
  { c: 'var(--rst)', k: 'Forge', t: 'It forges a reply',
    simple: 'The attacker writes a lie: “the gateway 192.168.1.1 is at MY hardware address.”',
    technical: 'Crafts an ARP reply op=2, spa=192.168.1.1, sha=de:ad:be:ef:13:37 — an answer nobody requested.',
    packet: 'op=2  spa=192.168.1.1  sha=de:ad:be:ef:13:37' },
  { c: 'var(--rst)', k: 'Inject', t: 'Sent unsolicited',
    simple: 'Nobody asked, but the attacker sends its fake reply straight to PC-A anyway.',
    technical: 'A gratuitous ARP reply is injected toward PC-A. ARP has no way to verify who really sent it.',
    packet: 'eth.dst=00:1a:2b:00:0a:01  arp.reply  spa=192.168.1.1' },
  { c: 'var(--rst)', k: 'Poison', t: 'The cache is poisoned',
    simple: 'PC-A believes it — there are no checks — and overwrites the gateway’s real MAC with the attacker’s.',
    technical: 'PC-A overwrites 192.168.1.1 → de:ad:be:ef:13:37. Unauthenticated ARP trusts the most recent reply.',
    packet: 'cache[192.168.1.1] = de:ad:be:ef:13:37  (OVERWRITTEN)' },
  { c: 'var(--rst)', k: 'Redirect', t: 'Traffic goes to the attacker',
    simple: 'Now everything PC-A sends “to the internet” is delivered to the attacker first.',
    technical: 'Frames meant for the gateway are addressed to de:ad:be:ef:13:37 — handed to the attacker.',
    packet: 'eth.dst=de:ad:be:ef:13:37  (was the gateway)' },
  { c: 'var(--rst)', k: 'Relay', t: 'Man in the middle',
    simple: 'The attacker quietly forwards it to the real gateway, so PC-A notices nothing wrong.',
    technical: 'Attacker relays to real gateway 5e:aa:1f:00:00:01 — a transparent MITM that can read or alter traffic.',
    packet: 'ATK → gateway 5e:aa:1f:00:00:01  (relay)' },
  { c: 'var(--rst)', k: 'Exposed', t: 'Everything is readable',
    simple: 'Anything not encrypted — logins, messages, cookies — the attacker can now read or change.',
    technical: 'All PC-A ↔ gateway traffic transits the attacker. Cleartext is exposed; sessions can be hijacked.',
    packet: 'intercept ↑  read / modify in transit' },
  { c: 'var(--ok)', k: 'Defend', t: 'How to shut it down',
    simple: 'Switches can lock IP-to-MAC pairs, and static entries or encryption defeat the trick outright.',
    technical: 'Dynamic ARP Inspection + DHCP snooping block forged replies; static ARP and TLS remove the payoff.',
    packet: 'defense: DAI · DHCP-snoop · static-arp · TLS' },
];

const answersByScenario = {
  normal: [
    { t: 'PC-A already knew host D’s MAC before it asked.', ok: false },
    { t: 'The reply now has a known destination — PC-A — so there’s no need to disturb everyone again.', ok: true },
    { t: 'Broadcasts are only permitted in one direction on a switch.', ok: false },
  ],
  attack: [
    { t: 'ARP has no authentication — a host accepts any reply and overwrites its cache.', ok: true },
    { t: 'The attacker guessed PC-A’s login password.', ok: false },
    { t: 'Switches always trust the host with the highest IP.', ok: false },
  ],
} as const;

const inspectByScenario = {
  normal: [
    { k: 'eth.dst', v: 'ff:ff:ff:ff:ff:ff', note: 'Broadcast — delivered to every host on the segment.', c: 'var(--a)' },
    { k: 'eth.src', v: '00:1a:2b:00:0a:01', note: 'PC-A’s own hardware address.', c: 'var(--text3)' },
    { k: 'ethertype', v: '0x0806', note: 'Marks the payload as ARP.', c: 'var(--a)' },
    { k: 'htype / ptype', v: '1 / 0x0800', note: 'Ethernet hardware, IPv4 protocol.', c: 'var(--text3)' },
    { k: 'opcode', v: '1  (request)', note: 'A question, not an answer.', c: 'var(--a)' },
    { k: 'sha / spa', v: '00:1a:2b:00:0a:01 / 192.168.1.10', note: 'Sender hardware + protocol address (PC-A).', c: 'var(--text3)' },
    { k: 'tha', v: '00:00:00:00:00:00', note: 'Target hardware address — unknown, the whole reason we’re asking.', c: 'var(--b)' },
    { k: 'tpa', v: '192.168.1.7', note: 'Target protocol address — the IP we want resolved.', c: 'var(--b)' },
  ],
  attack: [
    { k: 'eth.dst', v: '00:1a:2b:00:0a:01', note: 'Aimed straight at PC-A, the victim.', c: 'var(--rst)' },
    { k: 'eth.src', v: 'de:ad:be:ef:13:37', note: 'The attacker’s real hardware address.', c: 'var(--text3)' },
    { k: 'ethertype', v: '0x0806', note: 'A perfectly normal-looking ARP frame.', c: 'var(--text3)' },
    { k: 'opcode', v: '2  (reply)', note: 'A reply PC-A never requested — gratuitous.', c: 'var(--rst)' },
    { k: 'spa', v: '192.168.1.1', note: 'Claims to be the gateway — this is the lie.', c: 'var(--rst)' },
    { k: 'sha', v: 'de:ad:be:ef:13:37', note: 'Binds the gateway’s IP to the attacker’s MAC.', c: 'var(--rst)' },
    { k: 'tpa', v: '192.168.1.10', note: 'PC-A — the cache being poisoned.', c: 'var(--b)' },
    { k: 'tha', v: '00:1a:2b:00:0a:01', note: 'PC-A’s hardware address.', c: 'var(--text3)' },
  ],
} as const;

const ethOptions = ['0x0800', '0x0806', '0x86DD'];
const opOptions = [{ v: '1', label: '1 · request' }, { v: '2', label: '2 · reply' }];
const dstOptions = [
  { v: 'bc', mac: 'ff:ff:ff:ff:ff:ff', hint: 'broadcast — all hosts' },
  { v: 'uni', mac: '1c:6f:65:aa:b3:07', hint: 'unicast — one host' },
];
const speedOptions = [0.5, 1, 2];
const modeOptions: { v: ReadingMode; label: string }[] = [
  { v: 'simple', label: 'Simple' },
  { v: 'technical', label: 'Technical' },
  { v: 'packet', label: 'Packet' },
];

const LAST_BEAT = 8;

/** the coach mark above whichever builder field is still waiting to be filled */
function Coach({ text, tone }: { text: string; tone: 'a' | 'ok' }) {
  return (
    <div className={styles.coach} style={{ color: `var(--${tone})` }}>
      <span>{text}</span>
      <i />
    </div>
  );
}

export default function ArpLab() {
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState<ReadingMode>('simple');

  // the frame the learner is assembling — nothing is filled in for them
  const [fEth, setFEth] = useState<string | null>(null);
  const [fOp, setFOp] = useState<string | null>(null);
  const [fTip, setFTip] = useState('');
  const [fDst, setFDst] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [tried, setTried] = useState(false);

  const [showInspect, setShowInspect] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);

  const attack = scenario === 'attack';
  const beats = attack ? attackBeats : normalBeats;
  const current = beats[beat] ?? beats[0];
  const answers = answersByScenario[scenario];
  const valid = fEth === '0x0806' && fOp === '1' && fDst === 'bc' && fTip.trim() === '192.168.1.7';

  const startTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    window.clearTimeout(startTimer.current);
  }, []);

  /* One timeout per beat rather than a free-running interval: changing speed or
     scrubbing the timeline re-arms it cleanly, and the run simply stops when
     the last beat lands. */
  useEffect(() => {
    if (!playing || beat >= LAST_BEAT) return;
    const id = window.setTimeout(() => {
      const next = Math.min(LAST_BEAT, beat + 1);
      setBeat(next);
      if (next >= LAST_BEAT) setPlaying(false);
    }, 2000 / speed);
    return () => window.clearTimeout(id);
  }, [playing, speed, beat]);

  const goTo = (n: number) => { setPlaying(false); setBeat(Math.max(0, Math.min(LAST_BEAT, n))); };

  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    if (beat >= LAST_BEAT) setBeat(attack ? 1 : 2);
    setPlaying(true);
  };

  const send = () => {
    if (!valid) { setTried(true); return; }
    setSent(true);
    setBeat(2);
    setTried(false);
    startTimer.current = window.setTimeout(() => setPlaying(true), 420);
  };

  const launch = () => {
    setSent(true);
    setBeat(0);
    setTried(false);
    setAnswer(null);
    startTimer.current = window.setTimeout(() => setPlaying(true), 420);
  };

  const replay = () => {
    window.clearTimeout(startTimer.current);
    setSent(false);
    setPlaying(false);
    setBeat(0);
    setAnswer(null);
  };

  const chooseScenario = (next: Scenario) => {
    if (next === scenario) return;
    window.clearTimeout(startTimer.current);
    setScenario(next);
    setBeat(0);
    setPlaying(false);
    setSent(false);
    setAnswer(null);
    setTried(false);
    setFEth(null);
    setFOp(null);
    setFTip('');
    setFDst(null);
  };

  const openInspect = () => setShowInspect(true);

  const pick = (index: number) => {
    setAnswer(index);
  };

  // which of the four fields the coach mark is currently pointing at, 5 = ready to send
  const guide = !fEth ? 1 : !fOp ? 2 : !fTip.trim() ? 3 : !fDst ? 4 : 5;
  const tipOk = fTip.trim() === '192.168.1.7';
  const cached = beat >= 7;
  const poisoned = beat >= 4;

  return (
    <main className={styles.lab}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.missionBar}>
        <span className={styles.mission}>
          <span className={styles.missionTag} data-tone={attack ? 'rst' : 'a'}>
            {attack && <Skull weight="fill" size={13} />}
            {attack ? 'Threat' : 'Mission'}
          </span>
          {attack ? (
            <h1 className={styles.missionLine}>
              A rogue host forges ARP replies to poison PC-A&apos;s cache and slip into the{' '}
              <b data-tone="rst">middle of every conversation</b>.
            </h1>
          ) : (
            <h1 className={styles.missionLine}>
              PC-A needs to reach <code>192.168.1.7</code> — but it only knows the IP. Resolve its <b>MAC address</b>.
            </h1>
          )}
        </span>

        <div className={styles.scenarioTabs}>
          <button type="button" data-active={!attack} aria-pressed={!attack} data-tone="b" onClick={() => chooseScenario('normal')}>Normal</button>
          <button type="button" data-active={attack} aria-pressed={attack} data-tone="rst" onClick={() => chooseScenario('attack')}>ARP spoofing</button>
        </div>
      </div>

      <div className={styles.workspace}>
        {/* ---------------------------------------------------------- left */}
        <div className={`${styles.panel} ${styles.side}`}>
          <div className={styles.panelHead} data-tone={attack ? 'rst' : 'a'}>
            {attack ? <Skull weight="fill" size={16} color="var(--rst)" /> : <Package weight="duotone" size={16} color="var(--a)" />}
            <span>{attack ? 'attack_console.arp' : 'packet_builder.arp'}</span>
          </div>

          {!attack && !sent && (
            <div className={styles.builderBody}>
              <p className={styles.helper}>Assemble the request field by field. Nothing is filled for you.</p>

              <div className={styles.context}>
                <span>src MAC  00:1a:2b:00:0a:01 <i>(PC-A)</i></span>
                <span>src IP   192.168.1.10 <i>(PC-A)</i></span>
              </div>

              {guide === 1 && <Coach tone="a" text="step 1 of 4 · which payload? pick ARP" />}
              <div className={styles.field}>
                <div className={styles.fieldLabel}>EtherType</div>
                <div className={styles.options} data-bad={tried && fEth !== '0x0806'}>
                  {ethOptions.map((value) => (
                    <button key={value} type="button" className={styles.chip} data-active={fEth === value} aria-pressed={fEth === value}
                      onClick={() => { setFEth(value); setTried(false); }}>{value}</button>
                  ))}
                </div>
              </div>

              {guide === 2 && <Coach tone="a" text="step 2 of 4 · asking, or answering?" />}
              <div className={styles.field}>
                <div className={styles.fieldLabel}>Operation</div>
                <div className={styles.options} data-bad={tried && fOp !== '1'}>
                  {opOptions.map((option) => (
                    <button key={option.v} type="button" className={styles.chip} data-active={fOp === option.v} aria-pressed={fOp === option.v}
                      onClick={() => { setFOp(option.v); setTried(false); }}>{option.label}</button>
                  ))}
                </div>
              </div>

              {guide === 3 && <Coach tone="a" text="step 3 of 4 · type the IP to resolve" />}
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="arp-tip">
                  Target IP <em>— who are we asking about?</em>
                </label>
                <input
                  id="arp-tip"
                  className={styles.input}
                  value={fTip}
                  inputMode="decimal"
                  maxLength={15}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="192.168.1._"
                  data-state={tried && !tipOk ? 'bad' : tipOk ? 'ok' : undefined}
                  onChange={(event) => { setFTip(event.target.value); setTried(false); }}
                />
              </div>

              {guide === 4 && <Coach tone="a" text="step 4 of 4 · so who should hear this?" />}
              <div className={styles.field}>
                <div className={styles.fieldLabel}>Destination MAC — who do we send it to?</div>
                <div className={styles.optionsStack} data-bad={tried && fDst !== 'bc'}>
                  {dstOptions.map((option) => (
                    <button key={option.v} type="button" className={styles.macOption} data-active={fDst === option.v} aria-pressed={fDst === option.v}
                      onClick={() => { setFDst(option.v); setTried(false); }}>
                      <b>{option.mac}</b>
                      <span>{option.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldLast}>
                <div className={styles.fieldLabel}>Target MAC</div>
                <div className={styles.unknown}>
                  <span>00:00:00:00:00:00</span>
                  <em>unknown — that&apos;s the point</em>
                </div>
              </div>

              {guide === 5 && <Coach tone="ok" text="all four set — now click this" />}
              <button type="button" className={styles.sendButton} data-valid={valid} onClick={send}>
                Send onto the wire ▶
              </button>
              {tried && !valid && (
                <p className={styles.hint}>
                  Not quite — an ARP request uses EtherType 0x0806, opcode 1, is addressed to the broadcast MAC,
                  and asks about 192.168.1.7.
                </p>
              )}
            </div>
          )}

          {!attack && sent && (
            <div className={styles.sentBody}>
              <div className={styles.sentLabel}>Frame sent ✓</div>
              <div className={styles.frame}>
                <div><b>eth.dst </b>ff:ff:ff:ff:ff:ff</div>
                <div><b>eth.src </b>00:1a:2b:00:0a:01</div>
                <div><b>type    </b>0x0806 <i>ARP</i></div>
                <div><b>op      </b>1 <i data-tone="text3">request</i></div>
                <div><b>tpa     </b>192.168.1.7</div>
                <div><b>tha     </b>00:00:00:00:00:00</div>
              </div>

              <button type="button" className={styles.inspectButton} onClick={openInspect}>
                <MagnifyingGlass weight="duotone" size={15} /> Inspect frame
              </button>

              <div className={styles.cacheBlock}>
                <div className={styles.cacheHead}>PC-A · ARP cache</div>
                {cached ? (
                  <div className={styles.cacheTable}>
                    <div><span>address</span><span>hw address</span></div>
                    <div><span>192.168.1.7</span><span>1c:6f:65:aa:b3:07</span></div>
                  </div>
                ) : (
                  <div className={styles.emptyCache}>empty — nothing learned yet</div>
                )}
              </div>

              <button type="button" className={styles.resetButton} onClick={replay}>
                <ArrowCounterClockwise weight="duotone" size={14} /> Reset &amp; build again
              </button>
            </div>
          )}

          {attack && !sent && (
            <div className={styles.builderBody}>
              <p className={styles.helper}>
                You&apos;re a rogue host on 192.168.1.0/24. No password, no exploit — one forged ARP reply is enough
                to reroute PC-A&apos;s traffic through you.
              </p>
              <div className={styles.attackRows}>
                <div data-tone="rst"><span>your host</span><span>192.168.1.66 · de:ad:be:ef:13:37</span></div>
                <div data-tone="a"><span>spoof as</span><span>gateway 192.168.1.1</span></div>
                <div data-tone="b"><span>victim</span><span>PC-A 192.168.1.10</span></div>
              </div>
              <button type="button" className={styles.launchButton} onClick={launch}>
                <Skull weight="fill" size={16} /> Launch ARP spoof ▶
              </button>
            </div>
          )}

          {attack && sent && (
            <div className={styles.sentBody}>
              <div className={styles.sentLabel} data-tone="rst">Forged reply injected</div>
              <div className={styles.frame} data-tone="rst">
                <div><b>eth.dst </b>00:1a:2b:00:0a:01</div>
                <div><b>eth.src </b>de:ad:be:ef:13:37</div>
                <div><b>op      </b>2 <i data-tone="rst">reply · gratuitous</i></div>
                <div><b>spa     </b>192.168.1.1 <i data-tone="rst">← the lie</i></div>
                <div><b>sha     </b>de:ad:be:ef:13:37</div>
              </div>

              <button type="button" className={styles.inspectButton} data-tone="rst" onClick={openInspect}>
                <MagnifyingGlass weight="duotone" size={15} /> Inspect forged reply
              </button>

              <div className={styles.cacheBlock}>
                <div className={styles.cacheHead}>PC-A · ARP cache — gateway</div>
                <div className={styles.cacheTable} data-tone={poisoned ? 'rst' : undefined}>
                  <div><span>192.168.1.1</span><span>hw address</span></div>
                  {poisoned
                    ? <div><span>poisoned</span><span>de:ad:be:ef:13:37</span></div>
                    : <div><span>genuine</span><span>5e:aa:1f:00:00:01</span></div>}
                </div>
              </div>

              <button type="button" className={styles.resetButton} data-tone="rst" onClick={replay}>
                <ArrowCounterClockwise weight="duotone" size={14} /> Reset attack
              </button>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------- centre */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <Graph weight="duotone" size={17} color="var(--b)" />
            <span>segment · 192.168.1.0/24</span>
            <span className={styles.live}>● live</span>
          </div>

          <div className={styles.stageBody}>
            {attack ? <AttackDiagram beat={beat} speed={speed} /> : <NormalDiagram beat={beat} speed={speed} />}
          </div>

          <div className={styles.transport}>
            <div className={styles.ticks}>
              {beats.map((item, index) => (
                <button
                  key={item.k}
                  type="button"
                  title={`Beat ${index + 1} · ${item.k}`}
                  aria-label={`Beat ${index + 1} · ${item.k}`}
                  aria-pressed={index === beat}
                  onClick={() => goTo(index)}
                  style={{
                    background: index === beat
                      ? item.c
                      : index < beat
                        ? `color-mix(in srgb, ${item.c} 45%, var(--line))`
                        : 'var(--line)',
                  }}
                />
              ))}
            </div>
            <div className={styles.controls}>
              <button type="button" className={styles.step} title="Step back" aria-label="Step back" onClick={() => goTo(beat - 1)}>◀</button>
              <button type="button" className={styles.play} title="Play / pause" aria-label={playing ? 'Pause' : 'Play'} onClick={togglePlay}>{playing ? '❘❘' : '▶'}</button>
              <button type="button" className={styles.step} title="Step forward" aria-label="Step forward" onClick={() => goTo(beat + 1)}>▶</button>
              <span className={styles.beatReadout}>beat {beat + 1}/9 · {current.k}</span>
              <div className={styles.speeds}>
                {speedOptions.map((value) => (
                  <button key={value} type="button" data-active={speed === value} aria-pressed={speed === value} onClick={() => setSpeed(value)}>{value}×</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- right */}
        <div className={`${styles.lesson} ${styles.side}`}>
          <div className={styles.modeTabs}>
            {modeOptions.map((option) => (
              <button key={option.v} type="button" data-active={mode === option.v} aria-pressed={mode === option.v} onClick={() => setMode(option.v)}>{option.label}</button>
            ))}
          </div>

          <div className={styles.stepCard} style={{ '--beat': current.c } as React.CSSProperties}>
            <div className={styles.stepKicker}>Beat {beat + 1} · {current.k}</div>
            {/* a per-beat title, so it sits under the page heading rather than
                replacing it — the mission line is what this page is about */}
            <h2>{current.t}</h2>
            <p data-kind={mode}>{current[mode]}</p>
          </div>

          {beat >= LAST_BEAT && (
            <div className={styles.challenge}>
              <div className={styles.challengeLabel}>Challenge</div>
              <p>
                {attack
                  ? 'The attacker’s reply worked even though PC-A never asked for it. Why did PC-A believe it?'
                  : 'The question was a broadcast, but the reply came back as a unicast. Why?'}
              </p>
              <div className={styles.answers}>
                {answers.map((option, index) => (
                  <button
                    key={option.t}
                    type="button"
                    data-state={answer === index ? (option.ok ? 'correct' : 'wrong') : undefined}
                    onClick={() => pick(index)}
                  >
                    {option.t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Link href="/lab#labs" className={styles.backLink}>← back to all labs</Link>
          <Link href="/protocols/arp" className={styles.backLink}>read the ARP entry →</Link>
        </div>
      </div>


      {showInspect && (
        <>
          <button type="button" className={styles.inspectorBackdrop} aria-label="Close inspector" onClick={() => setShowInspect(false)} />
          <aside className={styles.inspector} aria-label="Frame inspector">
            <div className={styles.inspectorHead}>
              <b>Frame inspector</b>
              <span data-tone={attack ? 'rst' : 'a'}>{attack ? 'FORGED REPLY' : 'ARP REQUEST'}</span>
              <button type="button" onClick={() => setShowInspect(false)} aria-label="Close inspector">✕</button>
            </div>
            <div className={styles.inspectorRows}>
              {inspectByScenario[scenario].map((field) => (
                <div key={field.k}>
                  <code style={{ color: field.c }}>{field.k}</code>
                  <div>
                    <strong>{field.v}</strong>
                    <p>{field.note}</p>
                  </div>
                </div>
              ))}
              <p className={styles.inspectorNote}>
                Every field traces to <b>RFC 826</b>. This is a model of the frame, not a real capture — see the
                Wireshark view when the lab ends.
              </p>
            </div>
          </aside>
        </>
      )}

    </main>
  );
}
