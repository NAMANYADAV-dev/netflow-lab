import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import ArpLab from './ArpLab';

export const metadata = pageMeta({
  title: 'ARP Lab · Protocol Labs · NetFlow Lab',
  description: 'Build an ARP request, watch it flood the segment, and see how ARP spoofing poisons a cache.',
  path: '/lab/arp',
});

export default function ArpLabPage() {
  return (
    <>
      <LabsHeader activeLab="ARP" />
      <ArpLab />
      <LabsFooter lab="arp" />
    </>
  );
}
