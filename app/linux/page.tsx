import { pageMeta } from '@/lib/seo';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { LINUX_INTRO_HREF } from '@/lib/atlas-data';
import { linuxByPart, linuxCommands, linuxGroups, linuxHref } from '@/lib/linux-data';
import shell from '../shell.module.css';
import styles from './linux.module.css';

export const metadata = pageMeta({
  title: 'Linux Commands · NetFlow Lab',
  description:
    'Linux commands for navigation, files, reading logs, disk space, processes and permissions, and for networking — ls, cp, grep, df, ps, chmod, ip, ss, dig, tcpdump — each with its switches and a session read line by line.',
  path: '/linux',
});

export default function LinuxPage() {
  return (
    <div className={shell.page}>
      <SiteHeader motto="The command line section" current="linux" />

      <main>
      <section className={`${shell.wrap} ${styles.hero}`}>
        <div>
          <div className={styles.kicker}>The system, from a shell</div>
          <h1 className={styles.title}>Linux commands, read one line at a time.</h1>
          <p className={styles.lede}>
            <em>The shell first, then the network.</em> Moving around, managing and reading files,
            disks, processes and permissions — and then the commands that show each protocol at
            work on a real host. Every one comes with a session, the lines worth reading
            numbered, a note on what each of them means, and the switches worth knowing.
          </p>
          <Link href={LINUX_INTRO_HREF} className={styles.introLink}>
            New to Linux? What it is, and how its tree is laid out &rarr;
          </Link>
        </div>

        <div className={styles.count}>
          <div className={styles.countRow}>
            <span className={styles.countNum}>{linuxCommands.length}</span>
          </div>
          <div className={styles.countLabel}>commands · {linuxGroups.length} groups</div>
        </div>
      </section>

      {linuxByPart.map((part) => (
      <section className={`${shell.wrap} ${styles.catalogue}`} id={`part-${part.id}`} key={part.id}>
        <div className={`${shell.sectionHead} ${styles.partHead}`}>
          <div className={shell.sectionHeadRow}>
            <h2 className={shell.sectionTitle}>{part.name}</h2>
            <span className={shell.sectionNote}>{part.note}</span>
          </div>
        </div>

        <div>
        {part.groups.map((group) => (
          <div className={styles.group} id={`group-${group.id}`} key={group.id}>
            <div>
              <h3 className={styles.groupName}>{group.name}</h3>
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
                    <h4 className={styles.cardSub}>{command.sub}</h4>
                    <p className={styles.cardText}>{command.fn}</p>
                    <span className={styles.cardLink}>Read the session &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        </div>
      </section>
      ))}
      </main>

      <SiteFooter note="Sessions are illustrative. Output differs between distributions and versions — read the fields, not the exact spacing." />
    </div>
  );
}
