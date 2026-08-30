import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import HttpsLab from './HttpsLab';

export const metadata = pageMeta({
  title: 'HTTPS / TLS Lab · Protocol Labs · NetFlow Lab',
  description:
    'Send a password over port 80 and read it off the wire, then repeat over TLS 1.3 to see encrypted content, certificate validation, and the metadata that remains observable.',
  path: '/lab/https',
});

export default function HttpsLabPage() {
  return (
    <>
      <LabsHeader activeLab="HTTPS / TLS" />
      <HttpsLab />
      <LabsFooter lab="https" />
    </>
  );
}
