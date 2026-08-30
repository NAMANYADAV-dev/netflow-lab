import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import HttpLab from './HttpLab';

export const metadata = pageMeta({
  title: 'HTTP Lab · Protocol Labs · NetFlow Lab',
  description:
    'Step through one page load in plain text — GET, 200, body, then the three requests the HTML turns out to need — and revisit it to earn a 304 with no body at all.',
  path: '/lab/http',
});

export default function HttpLabPage() {
  return (
    <>
      <LabsHeader activeLab="HTTP" />
      <HttpLab />
      <LabsFooter lab="http" />
    </>
  );
}
