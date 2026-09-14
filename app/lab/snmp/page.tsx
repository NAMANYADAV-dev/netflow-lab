import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import SnmpLab from './SnmpLab';

export const metadata = pageMeta({
  title: 'SNMP Lab · Protocol Labs · NetFlow Lab',
  description:
    'Poll a router’s counters over SNMP, turn two readings into a traffic rate, catch a linkDown trap on UDP 162 — then ask the same question with SNMPv3 authPriv.',
  path: '/lab/snmp',
});

export default function SnmpLabPage() {
  return (
    <>
      <LabsHeader activeLab="SNMP" />
      <SnmpLab />
      <LabsFooter lab="snmp" />
    </>
  );
}
