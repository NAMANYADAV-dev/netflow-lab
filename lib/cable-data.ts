import type { Rich } from '@/components/RichText';

export type Cable = {
  slug: string;
  name: string;
  shortName: string;
  spec: string;
  fn: string;
  kicker: string;
  sub: string;
  lede: Rich;
  takeaway: Rich;
  points: { k: string; v: string; note: string }[];
  anatomy: { t: string; d: string }[];
  uses: { t: string; d: string }[];
  security: { lede: Rich; points: { t: string; d: string }[] };
  tags: string[];
  imageAlt: string;
  footnote: string;
};

export const cables: Cable[] = [
  {
    slug: 'coaxial',
    name: 'Coaxial Cable',
    shortName: 'Coaxial',
    spec: 'Copper · shielded RF',
    fn: 'A centre conductor and an outer shield share one axis, carrying broadband, video and radio-frequency signals with controlled impedance.',
    kicker: 'Physical media · shielded copper',
    sub: 'one conductor inside another',
    lede: [
      'Coaxial cable carries an electrical signal along a ',
      { a: 'single centre conductor' },
      ' while a concentric shield provides the return path and blocks interference. The dielectric between them keeps the spacing—and therefore the ',
      { b: 'impedance—predictable' },
      '.',
    ],
    takeaway: [
      'Coax works because its ',
      { a: 'signal and shield share the same axis' },
      '—a controlled path that keeps radio-frequency energy in and outside noise out.',
    ],
    points: [
      { k: 'Signal', v: 'Electrical / RF', note: 'voltage carried on copper' },
      { k: 'Common impedance', v: '75 Ω or 50 Ω', note: 'match cable, connector and equipment' },
      { k: 'Typical connector', v: 'F-type / BNC', note: 'threaded or bayonet termination' },
      { k: 'Typical use', v: 'Broadband & video', note: 'DOCSIS, television, CCTV and RF' },
    ],
    anatomy: [
      { t: 'Centre conductor', d: 'Solid copper or copper-clad steel carries the primary electrical signal down the cable.' },
      { t: 'Dielectric insulator', d: 'A precisely sized insulating layer holds the conductor in the middle and establishes the cable impedance.' },
      { t: 'Foil and braided shield', d: 'The outer conductor completes the circuit while rejecting electromagnetic and radio-frequency interference.' },
      { t: 'Jacket and termination', d: 'The sheath protects the assembly; the fitted F-type or BNC connector must preserve the same geometry.' },
    ],
    uses: [
      { t: 'RG-6 broadband runs', d: 'The common 75-ohm cable between a provider drop, splitter, modem and television equipment.' },
      { t: 'CCTV and baseband video', d: 'Coax remains useful where a durable, shielded point-to-point video path is needed.' },
      { t: 'Radio-frequency systems', d: '50-ohm families connect antennas, radios, test equipment and other RF hardware.' },
    ],
    security: {
      lede: [
        'The shield limits accidental radiation, but coax is still a ',
        { b: 'physical bearer of the traffic' },
        '. Protect the route, connectors and shared plant just as carefully as the devices at either end.',
      ],
      points: [
        { t: 'Physical tapping', d: 'An exposed run can be split or coupled. Restrict access to risers, cabinets, splitters and demarcation points.' },
        { t: 'Ingress and leakage', d: 'Loose or poorly fitted connectors let interference in and signal energy out, degrading service and exposing faults.' },
        { t: 'Shared-medium risk', d: 'Cable access networks share upstream plant. Encryption and provider-side isolation remain essential.' },
        { t: 'Impedance mismatch', d: 'Mixing 50-ohm and 75-ohm parts creates reflections and loss that can look like an attack or outage.' },
        { t: 'Grounding', d: 'Bond shields according to the installation standard to reduce shock, surge and ground-loop hazards.' },
        { t: 'Inspect the path', d: 'Unexpected splitters, adapters or fresh terminations are worth investigating during a physical audit.' },
      ],
    },
    tags: ['RG-6', '75 Ω', '50 Ω', 'F-type', 'BNC', 'DOCSIS', 'CCTV'],
    imageAlt: 'Annotated anatomy of a high-performance coaxial cable',
    footnote: 'Cable family, impedance and connector must match the equipment—the plug fitting is not proof that the electrical system matches.',
  },
  {
    slug: 'fiber-optic',
    name: 'Fiber Optic Cable',
    shortName: 'Fiber Optic',
    spec: 'Glass · light pulses',
    fn: 'A glass core guides pulses of light with high bandwidth, long reach and immunity to electromagnetic interference.',
    kicker: 'Physical media · optical',
    sub: 'light guided through glass',
    lede: [
      'Fiber optic cable turns bits into ',
      { a: 'pulses of light' },
      ' and guides them through an ultrapure glass core. Because no electrical signal crosses the link, fiber delivers high capacity over long distances and is ',
      { b: 'immune to electromagnetic interference' },
      '.',
    ],
    takeaway: [
      'Fiber carries data as ',
      { a: 'light confined inside a glass core' },
      '—fast, long-reaching and electrically isolated from end to end.',
    ],
    points: [
      { k: 'Signal', v: 'Light pulses', note: 'generated and received by optics' },
      { k: 'Core types', v: 'Single / multimode', note: 'reach and optics differ' },
      { k: 'Typical connector', v: 'LC / SC / MTP', note: 'polish and cleanliness matter' },
      { k: 'Typical use', v: 'Backbone links', note: 'campus, datacentre, metro and long-haul' },
    ],
    anatomy: [
      { t: 'Core strand', d: 'Ultrapure glass carries the light. Single-mode uses a very small core; multimode uses a wider one.' },
      { t: 'Cladding', d: 'Glass with a lower refractive index surrounds the core and keeps light guided along the path.' },
      { t: 'Buffer and strength members', d: 'Coatings and aramid yarn protect the fragile glass from moisture, crushing and pull tension.' },
      { t: 'Jacket and connector', d: 'The outer sheath suits the environment, while a clean, correctly polished connector aligns the cores.' },
    ],
    uses: [
      { t: 'Single-mode backbone', d: 'OS1/OS2 fiber and laser optics serve campus, metro, provider and long-distance links.' },
      { t: 'Multimode datacentre', d: 'OM3/OM4 fiber supports short, high-speed links inside buildings and equipment rooms.' },
      { t: 'Electrical isolation', d: 'Fiber crosses noisy industrial areas and links buildings without carrying ground potential or lightning current.' },
    ],
    security: {
      lede: [
        'Fiber does not radiate like copper and is ',
        { a: 'harder to tap without disturbance' },
        ', but it is not magically secure. Protect the path and encrypt sensitive traffic end to end.',
      ],
      points: [
        { t: 'Bend and cut attacks', d: 'A tight bend or physical cut can degrade or stop a link. Secure trays, ducts, handholes and patch panels.' },
        { t: 'Optical tapping', d: 'Specialised couplers can siphon light. Monitor unexpected loss and keep critical paths physically controlled.' },
        { t: 'Dirty connectors', d: 'Dust on an end face causes loss and reflection. Inspect and clean before every mating.' },
        { t: 'Optical power', d: 'Wrong optics or excessive received power can damage equipment. Match wavelength, reach and link budget.' },
        { t: 'Route diversity', d: 'Two logical links in the same conduit share one failure. Use physically diverse paths where resilience matters.' },
        { t: 'Encryption still matters', d: 'Fiber protects the medium, not the data. MACsec, IPsec or application encryption protects the payload.' },
      ],
    },
    tags: ['OS1 / OS2', 'OM3 / OM4', 'LC', 'SC', 'MTP', 'SFP / QSFP', 'Ethernet'],
    imageAlt: 'Annotated anatomy of a high-performance fiber optic cable',
    footnote: 'A fiber link is a system: cable, connector polish, wavelength and transceiver type must all agree.',
  },
  {
    slug: 'utp',
    name: 'UTP Cable',
    shortName: 'UTP',
    spec: 'Twisted pair · unshielded copper',
    fn: 'Four balanced copper pairs use carefully controlled twists to reject noise without a metallic shield—the everyday medium for Ethernet LANs.',
    kicker: 'Physical media · balanced copper',
    sub: 'noise cancelled by twisting',
    lede: [
      'Unshielded twisted-pair cable carries Ethernet over ',
      { a: 'four balanced copper pairs' },
      '. Each pair is twisted at a different rate, so interference reaches both conductors similarly and the receiver can cancel it as ',
      { b: 'common-mode noise' },
      '.',
    ],
    takeaway: [
      'UTP succeeds through ',
      { a: 'balance, twist geometry and correct termination' },
      '—not through a metal shield. Preserve those three qualities all the way into the jack.',
    ],
    points: [
      { k: 'Signal', v: 'Balanced electrical', note: 'differential signalling over copper pairs' },
      { k: 'Conductors', v: '4 twisted pairs', note: 'eight wires in a standard Ethernet cable' },
      { k: 'Typical connector', v: '8P8C “RJ45”', note: 'terminate to T568A or T568B' },
      { k: 'Channel length', v: 'Up to 100 m', note: '90 m permanent link plus patch cords' },
    ],
    anatomy: [
      { t: 'Copper conductors', d: 'Solid conductors suit permanent links; stranded conductors improve flexibility in patch leads.' },
      { t: 'Pair twists', d: 'Each colour-coded pair has its own twist rate to control crosstalk and reject external noise.' },
      { t: 'Separator, when fitted', d: 'Higher-category cables may use a spline to keep pairs apart and preserve performance.' },
      { t: 'Outer jacket', d: 'The jacket protects the pairs and indicates ratings such as riser, plenum, indoor or outdoor use.' },
    ],
    uses: [
      { t: 'Horizontal LAN cabling', d: 'Cat5e, Cat6 and Cat6A links connect outlets to access switches in homes and offices.' },
      { t: 'Power over Ethernet', d: 'The same pairs can deliver data and DC power to phones, cameras and wireless access points.' },
      { t: 'Patch leads', d: 'Short stranded cables connect endpoints and patch panels while tolerating regular movement.' },
    ],
    security: {
      lede: [
        'UTP is inexpensive and accessible, so the strongest control is often ',
        { b: 'physical ownership of every outlet and cable route' },
        '. Treat an active wall port as a path into the network.',
      ],
      points: [
        { t: 'Rogue attachment', d: 'Unused live ports invite unknown devices. Disable them or enforce 802.1X and port security.' },
        { t: 'Electromagnetic noise', d: 'Keep data cable away from motors, fluorescent ballasts and power conductors to avoid intermittent faults.' },
        { t: 'Pair untwist', d: 'Excessive untwisting at a jack increases crosstalk. Keep the original twists as close to the contacts as possible.' },
        { t: 'Copper tapping', d: 'An accessible run can be bridged or replaced. Secure closets, trays, ceilings and patch fields.' },
        { t: 'PoE safety', d: 'Use compliant cable and terminations; bundled high-power PoE links must meet temperature and current limits.' },
        { t: 'Test, do not guess', d: 'Wiremap alone does not prove category performance. Certify important permanent links.' },
      ],
    },
    tags: ['Cat5e', 'Cat6', 'Cat6A', '8P8C', 'T568A', 'T568B', 'PoE'],
    imageAlt: 'Annotated diagram of an unshielded twisted-pair Ethernet cable',
    footnote: 'The category printed on a jacket only becomes real link performance when the cable, jacks, patch cords and installation all meet that category.',
  },
  {
    slug: 'stp',
    name: 'STP Cable',
    shortName: 'STP',
    spec: 'Twisted pair · shielded copper',
    fn: 'Twisted copper pairs add foil or braid shielding for electrically noisy environments where installation and bonding are carefully controlled.',
    kicker: 'Physical media · shielded twisted pair',
    sub: 'balanced pairs inside a shield',
    lede: [
      'Shielded twisted-pair cable combines differential signalling with a ',
      { a: 'metallic screen around the pairs' },
      '. The shield improves immunity to electromagnetic interference, but only when the connectors, patch panels and bonding plan preserve a ',
      { b: 'continuous, intentional path' },
      '.',
    ],
    takeaway: [
      'STP is a complete screened channel—not simply a heavier cable. Its benefit depends on ',
      { a: 'shield continuity and correct bonding' },
      ' from one end of the link to the other.',
    ],
    points: [
      { k: 'Signal', v: 'Balanced electrical', note: 'twisting still performs the primary cancellation' },
      { k: 'Shield forms', v: 'Foil / braid', note: 'overall screen, pair screens or both' },
      { k: 'Typical connector', v: 'Shielded 8P8C', note: 'metal shell continues the screen' },
      { k: 'Typical use', v: 'Noisy environments', note: 'industrial, broadcast and dense pathways' },
    ],
    anatomy: [
      { t: 'Twisted conductors', d: 'Four balanced pairs carry Ethernet exactly as they do in unshielded category cable.' },
      { t: 'Pair or overall screen', d: 'Foil and braid configurations reduce external noise and alien crosstalk.' },
      { t: 'Drain wire', d: 'Some designs include a conductor that makes the foil screen practical to terminate and bond.' },
      { t: 'Shielded termination', d: 'A screened jack and patch panel maintain coverage and connect the channel to the bonding system.' },
    ],
    uses: [
      { t: 'Industrial Ethernet', d: 'Screened cable protects links routed near drives, motors and other strong noise sources.' },
      { t: 'High-density pathways', d: 'Cat6A screened systems can control alien crosstalk where many cables share a tray.' },
      { t: 'Broadcast and technical rooms', d: 'Predictable noise performance helps in facilities containing RF and high-power equipment.' },
    ],
    security: {
      lede: [
        'A shield can improve availability by reducing interference, but poor bonding can create a ',
        { b: 'new fault path' },
        '. Follow the cabling and electrical standards for the building rather than improvising a ground.',
      ],
      points: [
        { t: 'Shield continuity', d: 'An unshielded plug or patch cord breaks the screened channel and weakens the expected protection.' },
        { t: 'Bonding errors', d: 'Incorrect earthing can create voltage differences and unwanted currents. Use the approved telecommunications bonding system.' },
        { t: 'False confidence', d: 'Shielding does not stop physical taps or rogue endpoints. Apply the same port and access controls as UTP.' },
        { t: 'Installation damage', d: 'Crushing, tight bends and excessive pull force disturb pair geometry and screen coverage.' },
        { t: 'Compatibility', d: 'Use jacks, panels and cords designed for the same cable construction and category.' },
        { t: 'Certification', d: 'Test shield continuity as well as wiremap, length, loss and crosstalk on critical links.' },
      ],
    },
    tags: ['F/UTP', 'S/FTP', 'Cat6A', 'Shielded 8P8C', 'Bonding', 'PoE', 'EMI'],
    imageAlt: 'Annotated diagram of a shielded twisted-pair Ethernet cable',
    footnote: 'Shielded cabling is a channel and bonding design. Mixing screened cable with unshielded components defeats the reason for choosing it.',
  },
];

export const cableBySlug: Record<string, Cable> = Object.fromEntries(
  cables.map((cable) => [cable.slug, cable]),
);

export const cableMenu = cables.filter(
  (cable) => cable.slug === 'coaxial' || cable.slug === 'fiber-optic',
);

export function cableHref(cable: Pick<Cable, 'slug'>) {
  return `/cables/${cable.slug}`;
}

export function cableNeighbours(slug: string) {
  const index = cables.findIndex((cable) => cable.slug === slug);
  return {
    prev: index > 0 ? cables[index - 1] : undefined,
    next: index >= 0 && index < cables.length - 1 ? cables[index + 1] : undefined,
  };
}
