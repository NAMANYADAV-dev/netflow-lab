import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import UdpLab from './UdpLab';

export const metadata = pageMeta({
  title: 'UDP Lab · Protocol Labs · NetFlow Lab',
  description:
    'Fire four datagrams with no handshake and no acknowledgement, then run the same stream across a congested wire and watch nobody report the one that vanishes.',
  path: '/lab/udp',
});

export default function UdpLabPage() {
  return (
    <>
      <LabsHeader activeLab="UDP" />
      <UdpLab />
      <LabsFooter lab="udp" />
    </>
  );
}
