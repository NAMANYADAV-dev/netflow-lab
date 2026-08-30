import { pageMeta } from '@/lib/seo';
import LabsHeader from '../LabsHeader';
import LabsFooter from '../LabsFooter';
import MailLab from './MailLab';

export const metadata = pageMeta({
  title: 'Mail Lab · Protocol Labs · NetFlow Lab',
  description:
    'Follow one email from Alice’s laptop to Bob’s phone: SMTP delivers it to a mailbox, IMAP reads it in place, while this POP3 scenario downloads it and explicitly deletes the server copy.',
  path: '/lab/mail',
});

export default function MailLabPage() {
  return (
    <>
      <LabsHeader activeLab="Mail" />
      <MailLab />
      <LabsFooter lab="mail" />
    </>
  );
}
