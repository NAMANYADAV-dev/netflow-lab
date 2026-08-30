# NetFlow Lab

An interactive, standards-based networking field guide with visual protocol explanations, animated diagrams, and hands-on protocol labs.

NetFlow Lab helps students understand what happens between devices—from the frame on a local network to the application data exchanged across the internet. The website focuses on learning through clear explanations, packet flows, simulations, and practical examples.

> This is an educational simulation. It does not generate or capture real network traffic.

## Highlights

- 48 networking protocols organised into 11 protocol categories
- 12 interactive protocol labs with step-by-step packet flows
- Visual guides for the OSI and TCP/IP models
- Network device, cable, and connector references
- Animated protocol diagrams and simplified packet views
- Simple, Technical, and Packet learning modes in the labs
- Light and dark themes
- Desktop and laptop focused interface
- Standards-based explanations with RFC references where relevant
- Security headers, Content Security Policy, and production-safe defaults

## Interactive Labs

| Lab | What it demonstrates |
| --- | --- |
| ARP | Address resolution, broadcast requests, unicast replies, and ARP spoofing |
| TCP | Three-way handshake, sequence numbers, acknowledgements, and teardown |
| ICMP | Ping, traceroute behaviour, message types, and codes |
| IP | Addressing, routing decisions, TTL, and NAT behaviour |
| UDP | Connectionless delivery, packet loss, and transport trade-offs |
| DNS | Recursive resolution, authoritative servers, and caching |
| HTTP | Requests, responses, state, and connection reuse |
| HTTPS / TLS | Encryption, certificates, handshakes, and visible metadata |
| FTP | Control and data connections with active and passive modes |
| DHCP | Address assignment using DORA and lease renewal |
| Mail | SMTP delivery with IMAP and POP3 retrieval |
| Telnet | Cleartext remote access and why encrypted alternatives are required |

## Technology Stack

- Next.js 16
- React 19
- TypeScript
- CSS Modules
- Phosphor Icons

The project has no database, authentication system, analytics service, or third-party API dependency.

## Getting Started

### Requirements

- Node.js 20.9 or newer
- npm

### Installation

```bash
git clone <your-repository-url>
cd netflow-lab
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run ESLint checks |
| `npm run typecheck` | Run TypeScript checks without generating files |
| `npm run build` | Create an optimised production build |
| `npm run start` | Run the production build locally |

## Environment Configuration

The application does not require secrets or API keys.

For a custom production domain, set the following public environment variable:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

This value is used for canonical URLs, Open Graph metadata, robots information, and the sitemap. Vercel's production project URL is used automatically when available.

## Deployment

The easiest deployment option is Vercel:

1. Push this repository to GitHub.
2. Import the GitHub repository into Vercel.
3. Keep the detected framework as Next.js.
4. Add `NEXT_PUBLIC_SITE_URL` when using a custom domain.
5. Deploy.

Before deploying elsewhere, use:

```bash
npm run lint
npm run typecheck
npm run build
```

## Project Structure

```text
app/                  Pages, layouts, labs, metadata, and page styles
components/           Shared navigation, footer, diagrams, and interactive UI
lib/                  Protocol, device, cable, lab, SEO, and site data
public/photo/         Website images grouped by devices, cables, and connectors
next.config.mjs       Next.js configuration and production security headers
```

## Security

The production configuration includes:

- Content Security Policy
- HTTPS enforcement with HSTS in production
- Clickjacking protection
- MIME-sniffing protection
- Restricted browser permissions
- Strict referrer handling
- Production browser source maps disabled
- No client-side secrets or service credentials

The labs are defensive educational simulations intended for localhost, classrooms, personal study, and other authorised environments.

## Accuracy and Limitations

Protocol behaviour and field values follow the referenced standards, but topology, timing, packet volume, and edge cases are intentionally simplified for learning. The simulations should not be treated as packet-capture, monitoring, or penetration-testing tools.

## Author

Created by **Naman Yadav** as a computer networking and cybersecurity learning project.

## Licence

No open-source licence has been added yet. Until a licence is provided, normal copyright restrictions apply.
