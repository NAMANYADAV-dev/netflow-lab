import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import IpLab from './IpLab';

export const metadata = pageMeta({
  title: 'IP Lab · Protocol Labs · NetFlow Lab',
  description:
    'Route one datagram out of a LAN and back again — subnet decision, default gateway, NAT translation and a TTL that falls at every router.',
  path: '/lab/ip',
});

export default function IpLabPage() {
  return (
    <>
      <LabsHeader activeLab="IP" />
      <IpLab />
      <LabsFooter lab="ip" />
    </>
  );
}
