import SiteFooter from '@/components/SiteFooter';

const labFooterNotes = {
  arp: 'Broadcast the question, unicast the answer · RFC 826',
  dhcp: 'Shout into the room, get handed an identity, borrow it for a while · DORA · RFC 2131',
  dns: 'Nobody holds the whole tree · every server knows only who to ask next · RFC 1035',
  ftp: 'Two connections, one session · the older protocol that predates NAT · RFC 959',
  http: 'Request and response are stateless · applications add state with cookies or tokens · RFC 9110',
  https: 'Private, authenticated, and still fully readable by the server · TLS 1.3 · RFC 8446',
  icmp: 'ICMP rides directly in IP · types and codes, no TCP/UDP ports · RFC 792',
  ip: 'Destination IP drives the route · NAT may rewrite the source · RFC 791',
  mail: 'SMTP pushes · IMAP 993 and POP3 995 pull · one email, three protocols',
  tcp: 'SYN/FIN each consume one sequence number · every field traces to RFC 9293',
  telnet: 'Negotiate the terminal, then type your password into the room · port 23 · RFC 854',
  udp: 'UDP adds ports and a checksum · no delivery, ordering or retry guarantee · RFC 768',
} as const;

export default function LabsFooter({ lab }: { lab?: keyof typeof labFooterNotes }) {
  return <SiteFooter note={lab ? labFooterNotes[lab] : 'standards-based learning · simulation, honestly labelled'} />;
}
