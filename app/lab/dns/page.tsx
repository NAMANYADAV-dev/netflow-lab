import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import DnsLab from './DnsLab';

export const metadata = pageMeta({
  title: 'DNS Lab · Protocol Labs · NetFlow Lab',
  description:
    'Walk a name down four caches and then up the tree — root, .com, authoritative — and run it again warm to see how much of that work a cache erases.',
  path: '/lab/dns',
});

export default function DnsLabPage() {
  return (
    <>
      <LabsHeader activeLab="DNS" />
      <DnsLab />
      <LabsFooter lab="dns" />
    </>
  );
}
