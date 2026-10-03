import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { LINUX_HREF, LINUX_INTRO_HREF } from '@/lib/atlas-data';
import { linuxBySlug, linuxCommands, linuxHref } from '@/lib/linux-data';
import { linuxDirs } from '@/lib/linux-tree';
import { pageMeta } from '@/lib/seo';
import entry from '@/components/entry-page.module.css';
import DirTree from '../DirTree';
import linuxStyles from '../linux.module.css';
import shell from '../../shell.module.css';

export const metadata = pageMeta({
  title: 'What Linux is, and how its tree is laid out · NetFlow Lab',
  description:
    'What Linux is, why servers, phones and network gear run it, and how its directory tree is laid out — /etc, /home, /var, /usr, /proc and the rest, each with a page on what lives there.',
  path: LINUX_INTRO_HREF,
});

/* The page the command entries assume has been read: what the thing is, why it
   is worth learning, and where everything lives. It borrows the entry page's
   geometry so it reads as the first entry of the section, not a separate
   article. */

const points = [
  { k: 'What it is', v: 'A kernel', note: 'Unix-like, and the systems built on it' },
  { k: 'First release', v: '1991', note: 'Linus Torvalds, as a student in Helsinki' },
  { k: 'Licence', v: 'GPL v2', note: 'Free to run, read, change and share' },
  { k: 'Runs on', v: 'Nearly everything', note: 'Servers, Android phones, routers' },
];

const parts = [
  {
    t: 'The kernel',
    d: 'The one program that talks to the hardware. It shares the CPU between processes, hands out memory, drives the disks and network cards, and decides who may touch what. Strictly, this alone is Linux.',
  },
  {
    t: 'The shell',
    d: 'The program that reads what you type and runs it — usually bash. It is how you ask the kernel for things, and every command in this section is typed into one.',
  },
  {
    t: 'The userland',
    d: 'The small tools the shell runs: ls, cp, ps, ip. Most of the everyday ones come from the GNU project, which is why the whole system is sometimes called GNU/Linux.',
  },
  {
    t: 'The distribution',
    d: 'A kernel, a userland, an installer and a package manager, assembled and maintained together. Ubuntu, Debian, Fedora, Arch and Kali are all Linux, packaged with different choices.',
  },
  {
    t: 'The package manager',
    d: 'How software arrives: apt on Debian and Ubuntu, dnf on Fedora, pacman on Arch. One command fetches a program, everything it depends on, and later its updates.',
  },
  {
    t: 'The filesystem',
    d: 'A single tree that starts at / and holds everything — programs, settings, your files, even the devices. There are no drive letters; a second disk is just another branch.',
  },
];

const reasons = [
  {
    t: 'It is free, and open',
    d: 'No licence to buy for one machine or ten thousand, and the source is there to read. When something behaves oddly, the answer is findable rather than hidden.',
  },
  {
    t: 'The servers run it',
    d: 'Most web servers and cloud machines, every supercomputer on the TOP500 list, and the kernel inside every Android phone. Working in IT means meeting it.',
  },
  {
    t: 'The network runs it',
    d: 'Many routers, firewalls and switches are Linux underneath. The ip, ss and tcpdump you learn on a laptop are the same tools on the box in the rack.',
  },
  {
    t: 'Configuration is text',
    d: 'Settings live in plain files under /etc. They can be read, searched, compared, copied to another machine and kept in version control — no hidden registry.',
  },
  {
    t: 'The shell can be scripted',
    d: 'Anything typed once can be saved and run again. A task done by hand on one server becomes a script that does it on a hundred.',
  },
  {
    t: 'Security work lives here',
    d: 'Kali, and most tools for scanning, capturing and analysing, are built for Linux first. Permissions, users and logs are all in the open to inspect.',
  },
];

const paths = [
  {
    run: 'cd /var/log',
    d: 'An absolute path starts with / and means the same place wherever you are standing.',
  },
  {
    run: 'cd Documents/notes',
    d: 'A relative path has no leading / and is read from the directory you are in now.',
  },
  {
    run: 'cd ~',
    d: 'The tilde is your home directory — /home/user for you, /root for the administrator.',
  },
  {
    run: 'cd ..',
    d: 'Two dots mean the directory above; one dot means this one. Names are case-sensitive throughout.',
  },
];

/* the three commands that walk the tree, in the order they are worth reading */
const nextUp = ['pwd', 'ls', 'cd'].map((slug) => linuxBySlug[slug]).filter(Boolean);

export default function WhatIsLinuxPage() {
  const first = linuxCommands[0];

  return (
    <div className={shell.page}>
      <SiteHeader motto="The command line section" current="linux" />

      <main>
      <nav className={`${shell.wrap} ${entry.crumbs}`} aria-label="Breadcrumb">
        <Link href={LINUX_HREF} className={entry.crumbLink}>
          Linux
        </Link>
        <span className={entry.crumbSep}>/</span>
        <span className={entry.crumbHere}>Start here</span>
      </nav>

      <section className={`${shell.wrap} ${entry.hero}`}>
        <div className={entry.kicker}>Start here · before the commands</div>
        <div className={entry.titleRow}>
          <h1 className={entry.title}>Linux</h1>
          <span className={entry.sub}>what it is, why it is used, and where everything lives</span>
        </div>
        <p className={entry.lede}>
          <em>Linux is an operating system kernel</em> — the program between the hardware and
          everything else — and, loosely, the name for the whole systems built around it. It is{' '}
          <strong className="rich-a">free, open, and driven from a shell</strong>, and it keeps
          everything it has in <strong className="rich-b">one directory tree that starts at /</strong>.
        </p>
      </section>

      <section className={`${shell.wrap} ${entry.takeawaySection}`}>
        <div className={entry.takeawayRow}>
          <div className={entry.takeawayBar} aria-hidden="true" />
          <p className={entry.takeaway}>
            One tree, starting at <strong className="rich-a">/</strong>. Know what lives where,
            and every command has somewhere to point.
          </p>
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.pointsSection}`}>
        <div className={entry.points}>
          {points.map((point) => (
            <div className={entry.point} key={point.k}>
              <div className={entry.pointKey}>{point.k}</div>
              <div className={entry.pointVal}>{point.v}</div>
              <div className={entry.pointNote}>{point.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`} id="what">
        <div className={entry.head}>
          <h2 className={entry.headTitle}>What Linux is</h2>
          <p className={entry.headLede}>
            The word is used for two things: the kernel alone, and a complete system you can
            install. These are the pieces that make up the second.
          </p>
        </div>
        <div className={entry.secGrid}>
          {parts.map((part) => (
            <div key={part.t}>
              <div className={entry.secTitle}>{part.t}</div>
              <p className={entry.secText}>{part.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`} id="why">
        <div className={entry.head}>
          <h2 className={entry.headTitle}>Why it is used</h2>
          <p className={entry.headLede}>
            Not because it is fashionable. It is what the machines behind a network actually
            run, and it lets you see and change how they work.
          </p>
        </div>
        <div className={entry.secGrid}>
          {reasons.map((reason) => (
            <div key={reason.t}>
              <div className={entry.secTitle}>{reason.t}</div>
              <p className={entry.secText}>{reason.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`} id="tree">
        <div className={entry.head}>
          <h2 className={entry.headTitle}>The directory tree</h2>
          <p className={entry.headLede}>
            Everything hangs off one root, written /. The layout is the same on nearly every
            distribution, so learning it once is enough. The {linuxDirs.length - 1} directories
            under it do five jobs, and each job has its own colour — open any directory to see
            what it is for and what is inside.
          </p>
        </div>

        <DirTree />
      </section>

      <section className={`${shell.wrap} ${entry.section}`} id="paths">
        <div className={entry.head}>
          <h2 className={entry.headTitle}>Writing a path</h2>
          <p className={entry.headLede}>
            A path is the route to a file through the tree, with / between each step. Four
            spellings cover almost every one you will type.
          </p>
        </div>
        <div className={linuxStyles.recipes}>
          {paths.map((path) => (
            <div className={linuxStyles.recipe} key={path.run}>
              <code className={linuxStyles.recipeRun}>{path.run}</code>
              <p className={linuxStyles.recipeText}>{path.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.metaSection}`}>
        <div className={entry.metaHead}>
          <h2 className={entry.metaTitle}>Now walk the tree</h2>
        </div>
        <div className={`${linuxStyles.relatedCards} ${linuxStyles.relatedCardsRow}`}>
          {nextUp.map((command) => (
            <Link href={linuxHref(command)} className={linuxStyles.relatedCard} key={command.slug}>
              <strong>{command.cmd}</strong>
              <span>{command.fn}</span>
            </Link>
          ))}
        </div>
      </section>

      <nav className={`${shell.wrap} ${entry.pager}`} aria-label="Linux commands">
        <Link href={LINUX_HREF} className={entry.pagerLink}>
          &larr; All commands
        </Link>
        <Link href={LINUX_HREF} className={entry.pagerAll}>
          All commands
        </Link>
        {first ? (
          <Link href={linuxHref(first)} className={`${entry.pagerLink} ${entry.pagerNext}`}>
            Next: {first.cmd} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>
      </main>

      <SiteFooter note="The layout follows the Filesystem Hierarchy Standard. Distributions differ in the details — some keep /bin and /usr/bin as separate directories." />
    </div>
  );
}
