import { pageMeta } from '@/lib/seo';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { linuxByGroup, linuxCommands, linuxGroups, linuxHref } from '@/lib/linux-data';
import shell from '../shell.module.css';
import styles from './linux.module.css';

export const metadata = pageMeta({
  title: 'Linux Networking Commands · NetFlow Lab',
  description:
    'The Linux commands that show a network at work — ip, ss, dig, ping, traceroute, tcpdump and nft — each with a real session read line by line.',
  path: '/linux',
});

export default function LinuxPage() {
  return (
    <div className={shell.page}>
      <SiteHeader motto="The command line section" current="linux" />

      <main>
      <section className={`${shell.wrap} ${styles.hero}`}>
        <div>
          <div className={styles.kicker}>The network, from a shell</div>
          <h1 className={styles.title}>Linux commands, read one line at a time.</h1>
          <p className={styles.lede}>
            <em>Every protocol on this site leaves a trace on a real host.</em> These are the
            commands that show it — each one with a captured session, the lines worth reading
            numbered, and a note on what every one of them means.
          </p>
        </div>

        <div className={styles.count}>
          <div className={styles.countRow}>
            <span className={styles.countNum}>{linuxCommands.length}</span>
          </div>
          <div className={styles.countLabel}>commands · {linuxGroups.length} groups</div>
        </div>
      </section>

      <section className={`${shell.wrap} ${styles.catalogue}`}>
        {linuxByGroup.map((group) => (
          <div className={styles.group} id={`group-${group.id}`} key={group.id}>
            <div>
              <h2 className={styles.groupName}>{group.name}</h2>
              <p className={styles.groupBlurb}>{group.blurb}</p>
            </div>

            <div className={styles.cards}>
              {group.commands.map((command) => (
                <Link href={linuxHref(command)} className={styles.card} key={command.slug}>
                  <div className={styles.cardTerm}>
                    <span className={styles.cardPrompt} aria-hidden="true">$</span>
                    {command.cmd}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardSpec}>{command.pkg}</div>
                    <h3 className={styles.cardSub}>{command.sub}</h3>
                    <p className={styles.cardText}>{command.fn}</p>
                    <span className={styles.cardLink}>Read the session &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
      </main>

      <SiteFooter note="Sessions are illustrative. Output differs between distributions and versions — read the fields, not the exact spacing." />
    </div>
  );
}
