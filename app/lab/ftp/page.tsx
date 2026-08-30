import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import FtpLab from './FtpLab';

export const metadata = pageMeta({
  title: 'FTP Lab · Protocol Labs · NetFlow Lab',
  description:
    'Download one file over two TCP connections, decode the port in a 227 reply, then see this lab’s simulated NAT block the server-initiated active-mode data connection.',
  path: '/lab/ftp',
});

export default function FtpLabPage() {
  return (
    <>
      <LabsHeader activeLab="FTP" />
      <FtpLab />
      <LabsFooter lab="ftp" />
    </>
  );
}
