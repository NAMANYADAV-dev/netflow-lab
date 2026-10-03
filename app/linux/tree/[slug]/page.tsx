import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/RichText';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { LINUX_HREF, LINUX_TREE_HREF } from '@/lib/atlas-data';
import {
  linuxDirBySlug,
  linuxDirHref,
  linuxDirNeighbours,
  linuxDirs,
  treeGroupById,
} from '@/lib/linux-tree';
import { pageMeta } from '@/lib/seo';
import entry from '@/components/entry-page.module.css';
import { InsideTree, groupClass } from '../../DirTree';
import linuxStyles from '../../linux.module.css';
import tree from '../../tree.module.css';
import shell from '../../../shell.module.css';

export function generateStaticParams() {
  return linuxDirs.map((dir) => ({ slug: dir.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dir = linuxDirBySlug[slug];
  if (!dir) return {};
  return pageMeta({
    title: `${dir.path} — ${dir.sub} · Linux · NetFlow Lab`,
    description: `${dir.fn} What ${dir.path} is for, why it exists, and what you find inside it.`,
    path: linuxDirHref(dir),
  });
}

export default async function LinuxDirPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dir = linuxDirBySlug[slug];
  if (!dir) notFound();

  const group = treeGroupById[dir.group];
  const { prev, next } = linuxDirNeighbours(dir.slug);
  const related = dir.related.map((s) => linuxDirBySlug[s]).filter(Boolean);

  return (
    <div className={`${shell.page} ${groupClass[dir.group]}`}>
      <SiteHeader motto="The command line section" current="linux" />

      <main>
      <nav className={`${shell.wrap} ${entry.crumbs}`} aria-label="Breadcrumb">
        <Link href={LINUX_HREF} className={entry.crumbLink}>
          Linux
        </Link>
        <span className={entry.crumbSep}>/</span>
        <Link href={LINUX_TREE_HREF} className={entry.crumbLink}>
          The directory tree
        </Link>
        <span className={entry.crumbSep}>/</span>
        <span className={entry.crumbHere}>{dir.path}</span>
      </nav>

      <section className={`${shell.wrap} ${entry.hero}`}>
        <div className={entry.kicker}>
          <Link href={LINUX_TREE_HREF} className={tree.groupChip}>
            {group.name}
          </Link>
        </div>
        <div className={entry.titleRow}>
          <h1 className={`${entry.title} ${tree.pathTitle}`}>{dir.path}</h1>
          <span className={entry.sub}>{dir.sub}</span>
          {dir.linkTo && <span className={tree.linkNote}>&rarr; {dir.linkTo}</span>}
        </div>
        <p className={entry.lede}>
          <RichText parts={dir.lede} />
        </p>
      </section>

      <section className={`${shell.wrap} ${entry.takeawaySection}`}>
        <div className={entry.takeawayRow}>
          <div className={entry.takeawayBar} aria-hidden="true" />
          <p className={entry.takeaway}>
            <RichText parts={dir.takeaway} />
          </p>
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.pointsSection}`}>
        <div className={entry.points}>
          {dir.points.map((point) => (
            <div className={entry.point} key={point.k}>
              <div className={entry.pointKey}>{point.k}</div>
              <div className={entry.pointVal}>{point.v}</div>
              <div className={entry.pointNote}>{point.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>Why it exists</h2>
          <p className={entry.headLede}>
            Every directory at the top of the tree is there for a reason. This is the problem{' '}
            {dir.path} solves.
          </p>
        </div>
        <div className={entry.secGrid}>
          {dir.why.map((item) => (
            <div key={item.t}>
              <div className={entry.secTitle}>{item.t}</div>
              <p className={entry.secText}>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>What you find inside</h2>
          <p className={entry.headLede}>
            Not everything, but the entries worth recognising. Each is marked as a directory, a
            file, a link or a device.
          </p>
        </div>
        <InsideTree dir={dir} />
      </section>

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>At the terminal</h2>
          <p className={entry.headLede}>
            Four commands that show what this directory is doing on a real machine.
          </p>
        </div>
        <div className={linuxStyles.recipes}>
          {dir.recipes.map((recipe) => (
            <div className={linuxStyles.recipe} key={recipe.run}>
              <code className={linuxStyles.recipeRun}>{recipe.run}</code>
              <p className={linuxStyles.recipeText}>{recipe.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>Handle with care</h2>
          <p className={entry.headLede}>
            What goes wrong here, and what someone securing or attacking the machine looks at.
          </p>
        </div>
        <div className={entry.secGrid}>
          {dir.care.map((item) => (
            <div key={item.t}>
              <div className={entry.secTitle}>{item.t}</div>
              <p className={entry.secText}>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.metaSection}`}>
        <div className={entry.metaHead}>
          <h2 className={entry.metaTitle}>Read alongside</h2>
        </div>
        <div className={`${linuxStyles.relatedCards} ${linuxStyles.relatedCardsRow}`}>
          {related.map((r) => (
            <Link
              href={linuxDirHref(r)}
              className={`${tree.dirCard} ${groupClass[r.group]}`}
              key={r.slug}
            >
              <strong>{r.path}</strong>
              <span>{r.fn}</span>
            </Link>
          ))}
        </div>
      </section>

      <nav className={`${shell.wrap} ${entry.pager}`} aria-label="Linux directories">
        {prev ? (
          <Link href={linuxDirHref(prev)} className={entry.pagerLink}>
            &larr; Previous: {prev.path}
          </Link>
        ) : (
          <Link href={LINUX_TREE_HREF} className={entry.pagerLink}>
            &larr; The whole tree
          </Link>
        )}
        <Link href={LINUX_TREE_HREF} className={entry.pagerAll}>
          The whole tree
        </Link>
        {next ? (
          <Link href={linuxDirHref(next)} className={`${entry.pagerLink} ${entry.pagerNext}`}>
            Next: {next.path} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>
      </main>

      <SiteFooter note={dir.footnote} />
    </div>
  );
}
