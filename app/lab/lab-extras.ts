/* What a lab hands the reader once its last step has played: the commands
   that show the same exchange on a real machine, and the Wireshark display
   filter that isolates it in a capture.

   Keyed by the lab's own path so the shared end-of-lab panel can look its lab
   up without each lab passing anything in. `slug` points at the command's page
   in the Linux section, where its output is read line by line.

   Every host named here is either the reader's own machine or a public service
   that is meant to be queried. The capture commands only see traffic on the
   network the reader is already on. */

import { labs, type Lab } from '@/lib/lab-data';

export type RealCommand = {
  cmd: string;
  /** what running it shows, in terms of what the lab just played */
  does: string;
  /** the command's page under /linux, when it has one */
  slug?: string;
};

export type LabExtras = {
  real: RealCommand[];
  /** a Wireshark display filter */
  filter: string;
};

export const labExtras: Record<string, LabExtras> = {
  '/lab/arp': {
    real: [
      { cmd: 'ip neigh show', does: 'The ARP cache your machine holds right now — the table this lab filled in.', slug: 'ip-neigh' },
      { cmd: 'sudo tcpdump -n -e arp', does: 'Requests and replies as they cross your network, MAC addresses included.', slug: 'tcpdump' },
    ],
    filter: 'arp',
  },
  '/lab/tcp': {
    real: [
      { cmd: 'ss -tan', does: 'Every TCP socket on the machine and the state it is in: LISTEN, ESTAB, TIME-WAIT.', slug: 'ss' },
      { cmd: 'curl -sv https://example.com -o /dev/null', does: 'Opens one real connection; the first lines are the handshake completing.', slug: 'curl' },
    ],
    filter: 'tcp.flags.syn == 1 || tcp.flags.fin == 1',
  },
  '/lab/icmp': {
    real: [
      { cmd: 'ping -c 4 example.com', does: 'Four echo requests, four replies, and the TTL each reply arrived with.', slug: 'ping' },
      { cmd: 'traceroute example.com', does: 'The hop-by-hop path, built from the Time Exceeded messages routers send back.', slug: 'traceroute' },
    ],
    filter: 'icmp',
  },
  '/lab/ip': {
    real: [
      { cmd: 'ip route get 1.1.1.1', does: 'The forwarding decision: which gateway and interface the kernel would use.', slug: 'ip-route' },
      { cmd: 'ip addr show', does: 'The addresses and prefix lengths that decide what counts as “local”.', slug: 'ip-addr' },
    ],
    filter: 'ip.addr == 1.1.1.1',
  },
  '/lab/udp': {
    real: [
      { cmd: 'dig example.com', does: 'One UDP datagram out and one back — a whole exchange with no handshake.', slug: 'dig' },
      { cmd: 'ss -uan', does: 'The UDP sockets open on this machine. None of them has a connection state.', slug: 'ss' },
    ],
    filter: 'udp',
  },
  '/lab/dns': {
    real: [
      { cmd: 'dig +trace www.example.com', does: 'Walks root, then .com, then the authoritative server yourself — the resolver’s job, done by hand.', slug: 'dig' },
      { cmd: 'dig www.example.com', does: 'Asks your resolver. Run it twice: the second answer comes from its cache, with a smaller TTL.', slug: 'dig' },
    ],
    filter: 'dns',
  },
  '/lab/http': {
    real: [
      { cmd: 'curl -v http://example.com/', does: 'Prints the request line, every header and the response exactly as they were sent.', slug: 'curl' },
    ],
    filter: 'http',
  },
  '/lab/https': {
    real: [
      { cmd: 'curl -v https://example.com/', does: 'Shows the TLS handshake and the certificate before the request goes out.', slug: 'curl' },
      { cmd: 'openssl s_client -connect example.com:443 -servername example.com', does: 'The handshake on its own, with the full certificate chain the server presented.' },
    ],
    filter: 'tls.handshake',
  },
  '/lab/ftp': {
    real: [
      { cmd: 'curl -v ftp://your-server/', does: 'Against an FTP server you have an account on: the 220 greeting, USER, PASS, PASV and the 227 reply.', slug: 'curl' },
    ],
    filter: 'ftp || ftp-data',
  },
  '/lab/dhcp': {
    real: [
      { cmd: 'sudo tcpdump -n -v port 67 or port 68', does: 'Leave it running and rejoin your network: the four DORA messages scroll past.', slug: 'tcpdump' },
      { cmd: 'ip addr show', does: 'The address the client ended up with, and how long its lease has left (valid_lft).', slug: 'ip-addr' },
    ],
    filter: 'dhcp',
  },
  '/lab/mail': {
    real: [
      { cmd: 'dig +short MX gmail.com', does: 'The lookup from step 3: which servers accept mail for a domain, and in what order.', slug: 'dig' },
      { cmd: 'openssl s_client -quiet -connect imap.gmail.com:993', does: 'Opens the encrypted connection a phone opens. The server answers with its “* OK” greeting.' },
    ],
    filter: 'smtp || imap || pop',
  },
  '/lab/telnet': {
    real: [
      { cmd: 'sudo tcpdump -A -n port 23', does: 'Prints payloads as text. On a Telnet session on your own network, the password is readable in it.', slug: 'tcpdump' },
      { cmd: 'ssh user@host', does: 'What replaced Telnet: the same remote session, encrypted from the first byte.', slug: 'ssh' },
    ],
    filter: 'telnet',
  },
  /* the SNMP lab carries its own "try it for real" commands beside each step */
  '/lab/snmp': { real: [], filter: 'snmp' },
};

/** the lab after this one in the catalogue; none after the last */
export function nextLab(href: string): Lab | undefined {
  const at = labs.findIndex((lab) => lab.href === href);
  return at >= 0 ? labs[at + 1] : undefined;
}
