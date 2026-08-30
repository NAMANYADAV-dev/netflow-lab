import { pageMeta } from '@/lib/seo';
import Link from 'next/link';
import { labs } from '@/lib/lab-data';
import LabsHeader from './LabsHeader';
import LabsFooter from './LabsFooter';
import LabAmbientCanvas from './LabAmbientCanvas';
import LabTopology from './LabTopology';
import LabHeroStats from './LabHeroStats';
import shell from '../shell.module.css';
import styles from './lab.module.css';

export const metadata = pageMeta({
  title: 'Protocol Labs · NetFlow Lab',
  description:
    'Interactive protocol labs for learning how packets resolve, route, handshake and reply.',
  path: '/lab',
});

/* Counted from the catalogue rather than typed out, because the last time this
   was a literal it said "Six" long after the sixth lab stopped being the last
   one. Adding a lab now rewrites the copy instead of quietly falsifying it. */
const numberWords = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
  'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
];
const labCount = numberWords[labs.length] ?? String(labs.length);

const loop = [
  ['Learn', 'A one-screen brief: what problem this protocol solves.'],
  ['Start lab', 'Drop into the network with a mission to complete.'],
  ['Build packet', 'Assemble the frame field by field—nothing pre-filled.'],
  ['Send', 'Release it onto the wire and hand control to the engine.'],
  ['Watch', 'See it flood, route, or reply across the topology.'],
  ['Inspect', 'Open any packet and read every header field.'],
  ['Understand', 'The step explains the move in your chosen mode.'],
  ['Challenge', 'Answer the mission question; get instant feedback.'],
] as const;

const modes = [
  { name: 'Simple', sample: '“Who has this IP?”', note: 'Plain language. Good for the first pass, before any jargon.', tone: 'cyan', kind: 'plain' },
  { name: 'Technical', sample: 'ARP Request (broadcast)', note: 'Real networking terminology—the words you’ll meet in the docs.', tone: 'orange', kind: 'technical' },
  { name: 'Packet', sample: 'EtherType 0x0806 · op=1 · tha=00:00:00:00:00:00', note: 'Representative header and field values from the simulated packet.', tone: 'purple', kind: 'packet' },
] as const;

const networkScopes = [
  {
    name: 'Internet',
    access: 'Public',
    tone: 'cyan',
    nodes: [
      ['YOU', 'Your device'],
      ['ISP', 'Internet provider'],
      ['WWW', 'Public website'],
    ],
    links: ['Public route', 'Web request'],
    definition: 'A public worldwide network that anyone with an internet connection can access.',
  },
  {
    name: 'Intranet',
    access: 'Private',
    tone: 'green',
    nodes: [
      ['STAFF', 'Employee'],
      ['LAN', 'Private network'],
      ['SRV', 'Company server'],
    ],
    links: ['Staff only', 'Internal traffic'],
    definition: 'A private internal network used only by an organization’s authorized members.',
  },
  {
    name: 'Extranet',
    access: 'Trusted access',
    tone: 'orange',
    nodes: [
      ['PARTNER', 'Outside user'],
      ['LOCK', 'Secure gateway'],
      ['ORG', 'Company services'],
    ],
    links: ['Verified login', 'Limited access'],
    definition: 'A protected part of an intranet shared with trusted external users.',
  },
] as const;

export default function LabPage() {
  return (
    <div className={shell.page}>
      <LabsHeader />

      <main className={styles.lab}>
        <div className={styles.instrumentGrid} aria-hidden="true" />
        <LabAmbientCanvas />

        <section className={`${styles.measure} ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>Interactive Protocol Labs · the wire, hands-on</div>
            <h1>Don&apos;t read how a protocol works. Watch it work.</h1>
            <p className={styles.heroLede}>
              Pick a protocol, build a real packet, and send it into a live network—then watch it
              travel, resolve and reply, field by field. Every lab is a measuring instrument, not
              a cartoon.
            </p>
            <div className={styles.heroActions}>
              <Link href="#labs" className={styles.primaryButton}>Browse the labs &rarr;</Link>
              <Link href="/lab/arp" className={styles.secondaryButton}>
                <span>New?</span> Start with ARP &rarr;
              </Link>
            </div>
            <LabHeroStats />
          </div>

          <LabTopology />
        </section>

        <section className={`${styles.measure} ${styles.section}`} id="labs">
          <div className={styles.sectionHeading}>
            <h2>{labCount} labs, one familiar system</h2>
            <p>
              Each lab shares familiar reading modes, step-by-step controls, packet detail and clear
              simulation labels. Protocol-specific tools appear where they help the lesson.
            </p>
          </div>

          <div className={styles.labGrid}>
            {labs.map((lab) => (
              <Link
                href={lab.href}
                className={styles.labCard}
                data-ready={lab.status === 'Ready'}
                key={lab.abbr}
              >
                <div className={styles.cardTop}>
                  <div className={styles.labName}>
                    <span className={styles.labDot} data-tone={lab.tone} data-shape={lab.shape} />
                    <strong>{lab.abbr}</strong>
                  </div>
                  <div className={styles.statusRow}>
                    {lab.start && <span className={styles.startTag}>Start here</span>}
                  </div>
                </div>
                <div className={styles.layer}>{lab.layer}</div>
                <p>{lab.description}</p>
                <div className={styles.cardMeta}>
                  <span data-difficulty={lab.difficulty.toLowerCase()}>{lab.difficulty}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.band} id="loop">
          <div className={`${styles.measure} ${styles.bandInner}`}>
            <div className={styles.eyebrow}>The learning loop</div>
            <h2>Every lab follows the same learning loop</h2>
            <div className={styles.loop}>
              {loop.map(([title, description], index) => (
                <div className={styles.loopStep} key={title}>
                  <div className={styles.stepRail}><span>{index + 1}</span><i /></div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.measure} ${styles.section}`}>
          <div className={styles.sectionHeading}>
            <h2>Three ways to read the same packet</h2>
            <p>Switch modes at any step. The network does not change—only how much it tells you does.</p>
          </div>
          <div className={styles.modeGrid}>
            {modes.map((mode) => (
              <article className={styles.modeCard} data-tone={mode.tone} key={mode.name}>
                <div>{mode.name}</div>
                <strong data-kind={mode.kind}>{mode.sample}</strong>
                <p>{mode.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.measure} ${styles.networkScopeSection}`} id="network-scopes">
          <div className={styles.sectionHeading}>
            <div className={styles.eyebrow}>Who is allowed inside?</div>
            <h2>Internet, intranet and extranet—at a glance</h2>
            <p>Same networking idea, different access boundary. Follow each diagram from left to right.</p>
          </div>

          <div className={styles.scopeGrid}>
            {networkScopes.map((scope) => (
              <article className={styles.scopeCard} data-tone={scope.tone} key={scope.name}>
                <div className={styles.scopeCardTop}>
                  <h3>{scope.name}</h3>
                  <span>{scope.access}</span>
                </div>

                <div className={styles.scopeDiagram} aria-label={`${scope.name} connection diagram`}>
                  {scope.nodes.map(([code, label], index) => (
                    <div className={styles.scopeStage} key={code}>
                      <div className={styles.scopeNode}>
                        <span className={styles.scopeNodeSignal} aria-hidden="true" />
                        <strong>{code}</strong>
                        <small>{label}</small>
                      </div>
                      {index < scope.nodes.length - 1 && (
                        <div className={styles.scopeLink} aria-hidden="true">
                          <small>{scope.links[index]}</small>
                          <span className={styles.scopeRail} />
                          <i className={styles.scopePacket}>DATA</i>
                          <b>›</b>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.scopeLegend} aria-hidden="true">
                  <span><i /> Packet moving</span>
                  <b>Left → right</b>
                </div>

                <p><strong>{scope.name}:</strong> {scope.definition}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.measure} ${styles.honestySection}`}>
          <div className={styles.honestyIcon} aria-hidden="true">🛡</div>
          <div>
            <h2>This is a simulation—and it says so</h2>
            <p>Your browser is not putting real packets or frames on a wire. Each lab is a standards-based teaching model: field values and protocol behaviour follow the cited specifications, while topology, timing and edge cases are intentionally simplified. Every lab is clearly marked <strong>Simulated</strong>.</p>
            <p>Each lab ends with a <code>Wireshark view</code>—the same exchange as you would actually capture it, so the model lines up with the real world.</p>
          </div>
        </section>

        <section className={`${styles.measure} ${styles.finalCta}`}>
          <h2>Pick a protocol. Send a packet.</h2>
          {/* the span names the two ends of the catalogue: ARP at layer 2, TLS
              at the top — "reliable transport" stopped being the ceiling once
              the web and encryption labs landed */}
          <p>{labCount} labs, one engine—from address resolution to the encrypted web. New to this? ARP is the gentlest place to begin.</p>
          <div>
            <Link href="#labs" className={styles.primaryButton}>Browse the labs &rarr;</Link>
            <Link href="/lab/arp" className={styles.secondaryButton}>Start with ARP</Link>
          </div>
        </section>

      </main>
      <LabsFooter />
    </div>
  );
}
