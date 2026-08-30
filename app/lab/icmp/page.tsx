import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import IcmpLab from './IcmpLab';

export const metadata = pageMeta({
  title: 'ICMP Lab · Protocol Labs · NetFlow Lab',
  description:
    'Ping a host and watch the hop counter fall, then map the same path with traceroute — probes built to expire one hop later each time.',
  path: '/lab/icmp',
});

export default function IcmpLabPage() {
  return (
    <>
      <LabsHeader activeLab="ICMP" />
      <IcmpLab />
      <LabsFooter lab="icmp" />
    </>
  );
}
