import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import TelnetLab from './TelnetLab';

export const metadata = pageMeta({
  title: 'Telnet Lab · Protocol Labs · NetFlow Lab',
  description:
    'Negotiate a terminal in IAC command bytes, then watch a password cross a café network in plain ASCII — and find out what line mode does and does not fix.',
  path: '/lab/telnet',
});

export default function TelnetLabPage() {
  return (
    <>
      <LabsHeader activeLab="Telnet" />
      <TelnetLab />
      <LabsFooter lab="telnet" />
    </>
  );
}
