import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import TcpLab from './TcpLab';

export const metadata = pageMeta({
  title: 'TCP Lab · Protocol Labs · NetFlow Lab',
  description:
    'Open a TCP connection segment by segment: the three-way handshake, the sequence numbers behind it, and the four-way teardown.',
  path: '/lab/tcp',
});

export default function TcpLabPage() {
  return (
    <>
      <LabsHeader activeLab="TCP" />
      <TcpLab />
      <LabsFooter lab="tcp" />
    </>
  );
}
