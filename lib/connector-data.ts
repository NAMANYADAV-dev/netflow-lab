import type { Rich } from '@/components/RichText';

export type Connector = {
  slug: string;
  name: string;
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

export const connectors: Connector[] = [
  {
    slug: 'rj11',
    name: 'RJ11 Connector',
    spec: 'Modular · telephone & DSL',
    fn: 'A compact modular connector commonly used for one- or two-line telephone wiring and DSL service.',
    kicker: 'Copper connector · modular',
    sub: 'the smaller telephone plug',
    lede: [
      'RJ11 is the familiar narrow modular plug used on telephone leads. In everyday use the name often covers ',
      { a: '6-position plugs with two or four contacts' },
      ', carrying analogue voice or a DSL signal rather than Ethernet.',
    ],
    takeaway: ['RJ11 is for ', { a: 'telephone-style services' }, '. Its smaller body and contact count are not a substitute for an 8P8C Ethernet termination.'],
    points: [
      { k: 'Body', v: '6 positions', note: 'commonly 6P2C or 6P4C' },
      { k: 'Signal', v: 'Voice / DSL', note: 'analogue telephone or broadband pair' },
      { k: 'Cable', v: '2–4 conductors', note: 'flat or twisted telephone cable' },
      { k: 'Locking', v: 'Plastic latch', note: 'press tab to release' },
    ],
    anatomy: [
      { t: 'Modular body', d: 'The clear plastic shell aligns the plug in a six-position jack.' },
      { t: 'Gold contacts', d: 'Two central contacts usually carry one telephone line; extra contacts can carry another pair.' },
      { t: 'Cable crimp', d: 'Contact blades pierce or displace the insulation when the plug is terminated.' },
      { t: 'Retaining latch', d: 'The spring tab holds the plug in the socket and should click without force.' },
    ],
    uses: [
      { t: 'Analogue telephones', d: 'Connects a telephone handset or base to a wall outlet.' },
      { t: 'DSL service', d: 'Carries the provider copper pair between the wall, filter and DSL modem.' },
      { t: 'Legacy control links', d: 'Some alarms, modems and low-speed devices use telephone-style modular wiring.' },
    ],
    security: {
      lede: ['Telephone pairs can expose conversations, dial tone or a management path. Treat accessible jacks as ', { b: 'live physical interfaces' }, '.'],
      points: [
        { t: 'Line tapping', d: 'Accessible copper pairs can be bridged. Secure distribution points and unused outlets.' },
        { t: 'DSL filters', d: 'Missing or incorrect filters can cause noise and service instability on shared voice/DSL wiring.' },
        { t: 'Wrong socket', d: 'Do not force a telephone plug into an Ethernet port; it can bend the outer contacts.' },
        { t: 'Document pairs', d: 'Old telephone plant is often reused. Trace and label it before trusting the destination.' },
      ],
    },
    tags: ['6P2C', '6P4C', 'POTS', 'DSL', 'Modular plug'],
    imageAlt: 'Labelled RJ11 telephone connector and cable',
    footnote: 'RJ11 is a service name often used loosely for small modular plugs; verify the position/contact count and wiring before connecting equipment.',
  },
  {
    slug: 'rj45',
    name: 'RJ45 Connector',
    spec: '8P8C modular · Ethernet',
    fn: 'The eight-contact modular connector used for copper Ethernet patch leads, outlets, switches and network devices.',
    kicker: 'Copper connector · Ethernet',
    sub: 'eight contacts, four pairs',
    lede: [
      'What networking calls an RJ45 plug is normally an ',
      { a: '8P8C modular connector' },
      '. Eight contacts terminate four twisted pairs, with T568A or T568B defining the pin order for Ethernet and Power over Ethernet.',
    ],
    takeaway: ['A good 8P8C termination preserves ', { a: 'pair order and pair twist' }, ' right up to the contacts—appearance alone cannot prove its performance category.'],
    points: [
      { k: 'Contacts', v: '8 positions / 8 contacts', note: 'one contact per conductor' },
      { k: 'Wiring', v: 'T568A or T568B', note: 'use one scheme consistently' },
      { k: 'Cable', v: '4 twisted pairs', note: 'solid or stranded, category-rated' },
      { k: 'Features', v: 'Ethernet + PoE', note: 'data and optional DC power' },
    ],
    anatomy: [
      { t: 'Plug body', d: 'The keyed 8P8C shell positions the contacts and fits a compatible network jack.' },
      { t: 'Contact blades', d: 'Eight plated contacts pierce or displace conductor insulation during crimping.' },
      { t: 'Pair arrangement', d: 'The conductors follow T568A or T568B while each original pair remains together.' },
      { t: 'Strain relief and latch', d: 'The cable grip protects the termination; the latch retains the plug in the port.' },
    ],
    uses: [
      { t: 'Ethernet patching', d: 'Connects computers, switches, routers and patch panels over category copper.' },
      { t: 'Power over Ethernet', d: 'Supplies access points, cameras, phones and sensors over the same channel.' },
      { t: 'Structured cabling', d: 'Keystone jacks and patch panels provide a permanent, standards-based building link.' },
    ],
    security: {
      lede: ['An Ethernet jack is a direct invitation to the LAN unless access is controlled. Combine ', { b: 'physical port ownership with network authentication' }, '.'],
      points: [
        { t: 'Unknown endpoints', d: 'Use 802.1X, NAC or switch port controls rather than trusting anything that plugs in.' },
        { t: 'Bad termination', d: 'Split pairs may pass a basic continuity test but fail under traffic or at higher speeds.' },
        { t: 'PoE negotiation', d: 'Use standards-compliant power sourcing and rated connectors to prevent overheating or damage.' },
        { t: 'Port damage', d: 'Replace plugs with broken latches and protect rarely used ports from dust and debris.' },
      ],
    },
    tags: ['8P8C', 'T568A', 'T568B', 'Cat6', 'Cat6A', 'Ethernet', 'PoE'],
    imageAlt: 'Labelled RJ45 Ethernet connector showing eight contacts',
    footnote: '“RJ45” is the common networking name; 8P8C describes the physical connector more precisely.',
  },
  {
    slug: 'rj11-vs-rj45',
    name: 'RJ11 vs RJ45',
    spec: 'Comparison · telephone vs Ethernet',
    fn: 'A side-by-side guide to the size, contacts, wiring and services of the two familiar modular plugs.',
    kicker: 'Connector comparison · modular',
    sub: 'similar shape, different jobs',
    lede: [
      'RJ11 and RJ45 look related because both use a clear modular shell and spring latch. The important difference is inside: ',
      { a: 'RJ11 is narrower and commonly carries a telephone pair' },
      ', while networking RJ45/8P8C terminates four pairs for Ethernet.',
    ],
    takeaway: ['Identify the ', { a: 'body width, contact count and service' }, ' together. Never choose a connector just because it appears to fit the socket.'],
    points: [
      { k: 'RJ11 body', v: '6 positions', note: 'usually 2 or 4 fitted contacts' },
      { k: 'RJ45 body', v: '8 positions', note: 'all eight contacts fitted' },
      { k: 'RJ11 service', v: 'Voice / DSL', note: 'one or two copper pairs' },
      { k: 'RJ45 service', v: 'Ethernet / PoE', note: 'four balanced pairs' },
    ],
    anatomy: [
      { t: 'Compare the width', d: 'The six-position telephone plug is visibly narrower than the eight-position Ethernet plug.' },
      { t: 'Count the contacts', d: 'RJ11-style leads often populate only the centre contacts; 8P8C uses all eight.' },
      { t: 'Read the cable', d: 'Telephone leads may be flat; Ethernet cable contains four colour-coded twisted pairs.' },
      { t: 'Confirm the port label', d: 'PHONE, LINE or DSL is not LAN. Follow the device label and documentation.' },
    ],
    uses: [
      { t: 'Desk identification', d: 'Separates a telephone lead from an Ethernet patch cable before moving equipment.' },
      { t: 'Modem installation', d: 'DSL may use RJ11 on the provider side and RJ45 Ethernet on the local-network side.' },
      { t: 'Troubleshooting', d: 'Prevents wasted time testing the wrong cable family or wall outlet.' },
    ],
    security: {
      lede: ['The two ports can lead to entirely different systems. Correct identification avoids ', { b: 'equipment damage, exposure and false assumptions' }, '.'],
      points: [
        { t: 'Do not force it', d: 'A small telephone plug can enter some 8P8C jacks and bend their outer contacts.' },
        { t: 'Trace both ends', d: 'A wall plate label can be stale. Confirm the termination at the patch field or demarcation.' },
        { t: 'Protect both services', d: 'Telephone and Ethernet copper can both be tapped when the pathway is accessible.' },
        { t: 'Separate test tools', d: 'Use a tester designed for the service and connector pinout being diagnosed.' },
      ],
    },
    tags: ['RJ11', '8P8C', 'Telephone', 'DSL', 'Ethernet', 'PoE'],
    imageAlt: 'RJ11 and RJ45 connectors compared side by side',
    footnote: 'The latch shape is not enough: count positions, inspect the cable and read the port label before connecting.',
  },
  {
    slug: 'bnc',
    name: 'BNC Connector',
    spec: 'Coaxial · bayonet lock',
    fn: 'A quick quarter-turn coaxial connector used for RF, test equipment, video and legacy networking.',
    kicker: 'Coaxial connector · bayonet',
    sub: 'push, twist and lock',
    lede: ['The BNC connector keeps a coaxial cable’s centre conductor and shield aligned through a ', { a: 'two-lug bayonet coupling' }, '. Push and turn the collar to make a fast, repeatable connection without threads.'],
    takeaway: ['BNC describes the mechanical family—not the whole electrical specification. Match ', { a: 'impedance, frequency rating and cable' }, ' as well as the plug.'],
    points: [
      { k: 'Locking', v: 'Bayonet', note: 'push and quarter-turn' },
      { k: 'Impedance', v: '50 Ω or 75 Ω', note: 'electrically distinct versions' },
      { k: 'Medium', v: 'Coaxial cable', note: 'centre pin plus outer shield' },
      { k: 'Typical use', v: 'RF / video / test', note: 'fast field connection' },
    ],
    anatomy: [
      { t: 'Centre contact', d: 'The pin or socket carries the signal conductor along the connector axis.' },
      { t: 'Dielectric', d: 'Insulation holds the centre contact in position and maintains impedance.' },
      { t: 'Outer body', d: 'The metal shell continues the cable shield and return path.' },
      { t: 'Bayonet collar', d: 'Slots engage two posts on the receptacle and lock with a short twist.' },
    ],
    uses: [
      { t: 'Test instruments', d: 'Oscilloscopes, generators and RF benches use BNC for rapid connection changes.' },
      { t: 'CCTV and video', d: '75-ohm BNC remains common on professional and legacy baseband video equipment.' },
      { t: 'Radio systems', d: '50-ohm versions connect antennas and lower-frequency RF equipment.' },
    ],
    security: {
      lede: ['BNC is easy to disconnect, split and adapt. Protect exposed panels and confirm that every component preserves the ', { b: 'intended impedance and signal path' }, '.'],
      points: [
        { t: 'Impedance mismatch', d: 'A 50-ohm and 75-ohm BNC may mate physically but cause reflections and signal loss.' },
        { t: 'Unexpected tees', d: 'Inspect for splitters and adapters that could tap or incorrectly terminate a shared coax path.' },
        { t: 'Loose bayonet', d: 'A half-turned collar can create intermittent faults. Verify both lugs are engaged.' },
        { t: 'End termination', d: 'Some buses and test setups require a correct terminator at the final port.' },
      ],
    },
    tags: ['BNC', '50 Ω', '75 Ω', 'RF', 'CCTV', 'Bayonet'],
    imageAlt: 'Labelled BNC coaxial connector with bayonet coupling',
    footnote: 'Two BNC connectors that mate are not necessarily an electrical match—check impedance and frequency rating.',
  },
  {
    slug: 'f-type',
    name: 'F-Type Connector',
    spec: '75 Ω coaxial · threaded',
    fn: 'The threaded connector used on RG-6 cable for broadband, cable television and satellite distribution.',
    kicker: 'Coaxial connector · threaded',
    sub: 'the broadband wall connector',
    lede: ['The F-type connector is a simple 75-ohm coax termination in which the cable’s ', { a: 'centre conductor commonly becomes the contact pin' }, '. A threaded nut makes a secure connection for broadband and television plant.'],
    takeaway: ['A properly prepared compression fitting preserves the ', { a: 'shield, dielectric spacing and weather seal' }, ' that make an RG-6 channel dependable.'],
    points: [
      { k: 'Impedance', v: '75 Ω', note: 'broadcast and broadband systems' },
      { k: 'Locking', v: 'Threaded nut', note: 'finger-tight or specified torque' },
      { k: 'Cable', v: 'Usually RG-6', note: 'also other compatible 75-ohm coax' },
      { k: 'Termination', v: 'Compression preferred', note: 'durable and weather resistant' },
    ],
    anatomy: [
      { t: 'Centre conductor', d: 'The prepared cable conductor projects through the connector as the signal pin.' },
      { t: 'Connector body', d: 'The body fits under or around the braid and continues the shield.' },
      { t: 'Compression sleeve', d: 'A tool compresses the rear sleeve into a firm, sealed cable grip.' },
      { t: 'Threaded nut', d: 'The rotating nut secures the connector to a modem, splitter or wall plate.' },
    ],
    uses: [
      { t: 'Cable broadband', d: 'Links provider coax, splitters and a DOCSIS modem.' },
      { t: 'Television distribution', d: 'Connects terrestrial, cable and satellite receivers to 75-ohm coax.' },
      { t: 'Residential wall plates', d: 'Provides a durable field connector for fixed RG-6 runs.' },
    ],
    security: {
      lede: ['A loose or poorly sealed F-connector lets interference enter and signal energy escape. Connector quality directly affects ', { b: 'availability and shared plant health' }, '.'],
      points: [
        { t: 'Ingress', d: 'Stray braid, gaps or loose threads admit RF noise that can disrupt the local and provider network.' },
        { t: 'Signal leakage', d: 'Damaged shielding can radiate upstream traffic and broadcast signals.' },
        { t: 'Weather sealing', d: 'Outdoor fittings need approved boots, seals and drip management to prevent corrosion.' },
        { t: 'Unknown splitters', d: 'Every split adds loss and another accessible branch. Remove abandoned components and document the path.' },
      ],
    },
    tags: ['F-type', 'RG-6', '75 Ω', 'DOCSIS', 'Cable TV', 'Satellite'],
    imageAlt: 'Labelled F-type coaxial compression connector',
    footnote: 'A clean cut, correct strip length and matched compression tool matter more than simply making the connector feel tight.',
  },
  {
    slug: 'lc',
    name: 'LC Connector',
    spec: 'Fiber · 1.25 mm ferrule',
    fn: 'A compact latching fiber connector widely used on SFP-family transceivers and high-density patch panels.',
    kicker: 'Optical connector · small form factor',
    sub: 'compact fiber patching',
    lede: ['LC uses a ', { a: '1.25 mm ceramic ferrule and familiar latch' }, ' to align one fiber in a compact body. Duplex clips pair transmit and receive connectors for most Ethernet links.'],
    takeaway: ['LC provides density without relaxing optical discipline: ', { a: 'inspect, clean and match the polish' }, ' before every connection.'],
    points: [
      { k: 'Ferrule', v: '1.25 mm', note: 'small-form-factor alignment' },
      { k: 'Locking', v: 'Latch', note: 'similar action to a modular plug' },
      { k: 'Forms', v: 'Simplex / duplex', note: 'one or two fibers' },
      { k: 'Polish', v: 'UPC or APC', note: 'blue and green must not be mixed' },
    ],
    anatomy: [
      { t: 'Ferrule', d: 'The ceramic cylinder centres the bare fiber core with microscopic precision.' },
      { t: 'Connector body', d: 'The keyed body controls orientation and protects the ferrule.' },
      { t: 'Latch and duplex clip', d: 'The latch retains the plug while a clip pairs transmit and receive fibers.' },
      { t: 'Boot', d: 'The flexible rear boot limits sharp bends where the cable enters the connector.' },
    ],
    uses: [
      { t: 'SFP and SFP+ optics', d: 'Duplex LC is standard on many 1G, 10G and higher serial optical transceivers.' },
      { t: 'Fiber patch panels', d: 'Its compact body allows high port density in racks and enclosures.' },
      { t: 'Telecom and datacentres', d: 'Single-mode and multimode LC patching serves backbone and equipment links.' },
    ],
    security: {
      lede: ['Optical ports are sensitive physical interfaces. Protect the patch field and treat ', { b: 'cleanliness, bend radius and laser safety' }, ' as availability controls.'],
      points: [
        { t: 'Inspect before connect', d: 'A dirty plug contaminates the socket and causes loss or reflection. Inspect, clean, inspect again.' },
        { t: 'UPC versus APC', d: 'Never mate blue UPC and green APC end faces; their polish geometry differs.' },
        { t: 'Polarity', d: 'Verify transmit reaches receive when building or changing a duplex link.' },
        { t: 'Laser safety', d: 'Never look into a fiber or transceiver. Use an optical power meter and approved procedures.' },
      ],
    },
    tags: ['LC', '1.25 mm', 'UPC', 'APC', 'SFP', 'Single-mode', 'Multimode'],
    imageAlt: 'Labelled LC duplex fiber optic connector',
    footnote: 'Keep dust caps clean and use them only as protection; a capped connector can still need inspection before mating.',
  },
  {
    slug: 'sc',
    name: 'SC Connector',
    spec: 'Fiber · 2.5 mm ferrule',
    fn: 'A square push-pull fiber connector valued for robust handling in telecom, campus and access networks.',
    kicker: 'Optical connector · push-pull',
    sub: 'square, keyed and robust',
    lede: ['SC aligns a single fiber in a ', { a: '2.5 mm ceramic ferrule' }, ' and uses a keyed push-pull body that clicks into an adapter. Its larger shell is easy to handle and remains common in telecom and FTTx systems.'],
    takeaway: ['SC is mechanically simple, but optical compatibility still depends on ', { a: 'fiber type, polish, wavelength and cleanliness' }, '.'],
    points: [
      { k: 'Ferrule', v: '2.5 mm', note: 'robust ceramic alignment' },
      { k: 'Locking', v: 'Push-pull', note: 'keyed square body' },
      { k: 'Forms', v: 'Simplex / duplex', note: 'clips can pair two connectors' },
      { k: 'Polish', v: 'UPC or APC', note: 'commonly blue or green' },
    ],
    anatomy: [
      { t: 'Ferrule', d: 'The 2.5 mm ceramic ferrule holds and centres the polished glass fiber.' },
      { t: 'Keyed housing', d: 'The square body controls rotation and prevents incorrect insertion.' },
      { t: 'Push-pull latch', d: 'The housing locks into the adapter and releases by pulling the body—not the cable.' },
      { t: 'Strain-relief boot', d: 'The boot protects the fiber from tight bends at the rear of the connector.' },
    ],
    uses: [
      { t: 'FTTx access networks', d: 'SC/APC is common where low back-reflection matters in passive optical networks.' },
      { t: 'Campus backbones', d: 'SC adapters appear in established single-mode and multimode patch fields.' },
      { t: 'Telecom equipment', d: 'The robust, easy-to-grip body suits distribution frames and field enclosures.' },
    ],
    security: {
      lede: ['The generous body is easy to handle, but the end face is still microscopic. A clean and controlled patch field prevents ', { b: 'avoidable loss and service interruption' }, '.'],
      points: [
        { t: 'Polish mismatch', d: 'Do not mate SC/UPC to SC/APC even though the outer connector family is the same.' },
        { t: 'Pull the body', d: 'Disconnect by gripping the connector, not the cable, to protect the fiber and latch.' },
        { t: 'Control adapters', d: 'Secure patch panels so unauthorized cross-connects and optical taps are visible.' },
        { t: 'Inspect and clean', d: 'Use a scope and approved cleaning tools before every mating.' },
      ],
    },
    tags: ['SC', '2.5 mm', 'UPC', 'APC', 'FTTx', 'PON', 'Fiber'],
    imageAlt: 'Labelled SC fiber optic connector',
    footnote: 'The green or blue body is a useful clue, but inspect documentation and end-face polish before mating connectors.',
  },
  {
    slug: 'st',
    name: 'ST Connector',
    spec: 'Fiber · bayonet lock',
    fn: 'A round twist-lock fiber connector found in legacy campus, industrial and laboratory multimode installations.',
    kicker: 'Optical connector · bayonet',
    sub: 'legacy fiber with a twist lock',
    lede: ['ST uses a round metal body, a ', { a: '2.5 mm ferrule and bayonet coupling' }, '. Push, twist and lock made it popular in early fiber LANs, although denser LC and SC systems have largely replaced it.'],
    takeaway: ['ST remains serviceable in existing plant, but its ', { a: 'simplex format and low density' }, ' make it more common in maintenance than in new datacentre designs.'],
    points: [
      { k: 'Ferrule', v: '2.5 mm', note: 'spring-loaded alignment' },
      { k: 'Locking', v: 'Bayonet', note: 'push and twist' },
      { k: 'Form', v: 'Simplex', note: 'one connector per fiber' },
      { k: 'Typical plant', v: 'Legacy multimode', note: 'campus, lab and industrial links' },
    ],
    anatomy: [
      { t: 'Ceramic ferrule', d: 'The ferrule centres one polished fiber end.' },
      { t: 'Spring-loaded body', d: 'Spring pressure keeps the paired end faces in contact inside the adapter.' },
      { t: 'Bayonet collar', d: 'Slots engage adapter posts and lock with a short twist.' },
      { t: 'Boot and cable', d: 'The boot limits bending and transfers handling force away from the fiber.' },
    ],
    uses: [
      { t: 'Legacy fiber Ethernet', d: 'Older building backbones and hubs may still present ST ports or patch panels.' },
      { t: 'Laboratory equipment', d: 'Twist-lock handling remains convenient on some optical instruments and trainers.' },
      { t: 'Industrial networks', d: 'Established multimode control networks often retain ST during phased upgrades.' },
    ],
    security: {
      lede: ['Legacy does not mean harmless. Document ST cross-connects, keep them clean and plan migrations before ', { b: 'obsolete parts become an availability risk' }, '.'],
      points: [
        { t: 'Twist fully', d: 'A partly engaged bayonet can create intermittent optical loss.' },
        { t: 'Track polarity', d: 'Two simplex connectors form a duplex link; label transmit and receive clearly.' },
        { t: 'Clean old plant', d: 'Long-idle adapters may contain dust. Inspect both sides before reconnecting.' },
        { t: 'Plan adapters carefully', d: 'Hybrid cords ease migration but add connection points, loss and inventory complexity.' },
      ],
    },
    tags: ['ST', '2.5 mm', 'Bayonet', 'Multimode', 'Legacy LAN', 'Simplex'],
    imageAlt: 'Labelled ST bayonet fiber optic connector',
    footnote: 'When modernizing ST plant, record fiber type and polarity before selecting hybrid patch cords or replacement optics.',
  },
  {
    slug: 'mtp',
    name: 'MTP Connector',
    spec: 'Multi-fiber · push-pull',
    fn: 'A precision MPO-family connector that terminates many fibers at once for parallel optics and high-density trunks.',
    kicker: 'Optical connector · multi-fiber',
    sub: 'many fibers in one connection',
    lede: ['MTP is a high-performance branded MPO connector that aligns an ', { a: 'array of 12, 24 or more fibers' }, ' in one rectangular ferrule. It enables dense trunks and parallel optical links, but introduces polarity and keying rules that must be designed—not guessed.'],
    takeaway: ['With MTP, the connector is only half the design. ', { a: 'Fiber count, gender, key orientation and polarity method' }, ' must agree across the whole channel.'],
    points: [
      { k: 'Fibers', v: '12 / 24 / more', note: 'multiple cores in one ferrule' },
      { k: 'Locking', v: 'Push-pull', note: 'keyed rectangular housing' },
      { k: 'Alignment', v: 'Guide pins', note: 'pinned mates unpinned' },
      { k: 'Typical use', v: 'Parallel optics', note: 'high-density datacentre links' },
    ],
    anatomy: [
      { t: 'Multi-fiber ferrule', d: 'A precision rectangular ferrule presents a row or rows of polished fibers.' },
      { t: 'Guide pins and holes', d: 'Pinned and unpinned connectors mate to align every fiber simultaneously.' },
      { t: 'Keyed housing', d: 'Key-up or key-down orientation participates in the channel polarity plan.' },
      { t: 'Push-pull boot', d: 'The housing locks into an adapter while protecting the ribbon or micro-cable behind it.' },
    ],
    uses: [
      { t: '40G / 100G parallel optics', d: 'Multiple fibers carry transmit and receive lanes between QSFP-family transceivers.' },
      { t: 'High-density trunks', d: 'Preterminated cassettes and panels move many duplex links through one compact cable.' },
      { t: 'Datacentre migration', d: 'Modular trunks can support breakouts and later speed upgrades when polarity is planned.' },
    ],
    security: {
      lede: ['One contaminated or mis-polarized MTP connection can affect many lanes at once. Treat installation records and inspection as ', { b: 'resilience controls' }, '.'],
      points: [
        { t: 'Polarity method', d: 'Document whether the trunk uses Method A, B or C and choose cassettes and cords accordingly.' },
        { t: 'Pinned versus unpinned', d: 'Never force two pinned or two unpinned ends; the channel needs one of each at a direct mating.' },
        { t: 'Inspect every fiber', d: 'A multi-fiber scope reveals contamination across the whole ferrule before mating.' },
        { t: 'Protect the trunk', d: 'A single damaged connector can disrupt many services. Secure routing and keep tested spares.' },
      ],
    },
    tags: ['MTP', 'MPO', '12-fiber', '24-fiber', 'QSFP', 'Parallel optics', 'Polarity'],
    imageAlt: 'Labelled MTP multi-fiber optical connector',
    footnote: 'Before ordering an MTP assembly, specify fiber type, count, polish, pinned/unpinned gender, key orientation and end-to-end polarity.',
  },
];

export const connectorBySlug: Record<string, Connector> = Object.fromEntries(
  connectors.map((connector) => [connector.slug, connector]),
);

export function connectorHref(connector: Pick<Connector, 'slug'>) {
  return `/cables/connectors/${connector.slug}`;
}

export function connectorNeighbours(slug: string) {
  const index = connectors.findIndex((connector) => connector.slug === slug);
  return {
    prev: index > 0 ? connectors[index - 1] : undefined,
    next: index >= 0 && index < connectors.length - 1 ? connectors[index + 1] : undefined,
  };
}
