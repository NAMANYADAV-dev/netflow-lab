import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import DhcpLab from './DhcpLab';

export const metadata = pageMeta({
  title: 'DHCP Lab · Protocol Labs · NetFlow Lab',
  description:
    'Take a machine from a bare MAC address to a full configuration with the four-message DORA exchange. This scenario requests broadcast replies, then renews the lease with two quiet unicast packets.',
  path: '/lab/dhcp',
});

export default function DhcpLabPage() {
  return (
    <>
      <LabsHeader activeLab="DHCP" />
      <DhcpLab />
      <LabsFooter lab="dhcp" />
    </>
  );
}
