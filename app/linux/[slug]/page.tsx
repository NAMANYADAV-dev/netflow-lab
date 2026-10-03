import Link from 'next/link';
import { notFound } from 'next/navigation';
import RichText from '@/components/RichText';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { BENCH_HREF, LINUX_HREF } from '@/lib/atlas-data';
import {
  linuxBySlug,
  linuxCommands,
  linuxGroupById,
  linuxHref,
  linuxNeighbours,
} from '@/lib/linux-data';
import { linuxSwitches } from '@/lib/linux-switches';
import { protocolById, protocolHref, protocolSlug } from '@/lib/protocol-data';
import { protocolPages } from '@/lib/protocol-pages';
import { pageMeta } from '@/lib/seo';
import entry from '@/components/entry-page.module.css';
import Terminal from '../Terminal';
import linuxStyles from '../linux.module.css';
import shell from '../../shell.module.css';

export function generateStaticParams() {
  return linuxCommands.map((command) => ({ slug: command.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const command = linuxBySlug[slug];
  if (!command) return {};
  return pageMeta({
    title: `${command.cmd} · Linux · NetFlow Lab`,
    description: command.fn,
    path: `/linux/${slug}`,
  });
}

export default async function LinuxCommandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const command = linuxBySlug[slug];
  if (!command) notFound();

  const group = linuxGroupById[command.group];
  const { prev, next } = linuxNeighbours(command.slug);
  const protocols = command.protocols.map((id) => protocolById[id]).filter(Boolean);
  const related = command.related.map((s) => linuxBySlug[s]).filter(Boolean);
  const switches = linuxSwitches[command.slug] ?? [];

  return (
    <div className={shell.page}>
      <SiteHeader motto="The command line section" current="linux" />

      <main>
      <nav className={`${shell.wrap} ${entry.crumbs}`} aria-label="Breadcrumb">
        <Link href={LINUX_HREF} className={entry.crumbLink}>
          Linux
        </Link>
        <span className={entry.crumbSep}>/</span>
        <span>{group?.name}</span>
        <span className={entry.crumbSep}>/</span>
        <span className={entry.crumbHere}>{command.cmd}</span>
      </nav>

      <section className={`${shell.wrap} ${entry.hero}`}>
        <div className={entry.kicker}>{command.kicker}</div>
        <div className={entry.titleRow}>
          <h1 className={`${entry.title} ${linuxStyles.cmdTitle}`}>{command.cmd}</h1>
          <span className={entry.sub}>{command.sub}</span>
        </div>
        <p className={entry.lede}>
          <RichText parts={command.lede} />
        </p>
      </section>

      <section className={`${shell.wrap} ${entry.takeawaySection}`}>
        <div className={entry.takeawayRow}>
          <div className={entry.takeawayBar} aria-hidden="true" />
          <p className={entry.takeaway}>
            <RichText parts={command.takeaway} />
          </p>
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.pointsSection}`}>
        <div className={entry.points}>
          {command.points.map((point) => (
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
          <h2 className={entry.headTitle}>At the terminal</h2>
          <p className={entry.headLede}>
            Read the session first, then the notes: each numbered line in the output is answered
            by the note with the same number.
          </p>
        </div>

        <Terminal session={command.session} pkg={command.pkg} />

        <div className={entry.steps}>
          <div className={entry.stepsKicker}>Reading the output</div>
          <h3 className={entry.stepsTitle}>What the numbered lines are telling you</h3>
          <div className={entry.stepGrid}>
            {command.session.notes.map((note, index) => (
              <div className={entry.step} key={note.t}>
                <div className={entry.stepNum}>{index + 1}</div>
                <div>
                  <div className={entry.stepTitle}>{note.t}</div>
                  <p className={entry.stepText}>{note.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {switches.length > 0 && (
        <section className={`${shell.wrap} ${entry.section}`} id="switches">
          <div className={entry.head}>
            <h2 className={entry.headTitle}>Switches</h2>
            <p className={entry.headLede}>
              A switch changes how the command behaves. These are the ones used day to day;{' '}
              <span className="rich-m">man {command.cmd.split(' ')[0]}</span> lists the rest.
              Single-letter switches can usually be joined, so{' '}
              <span className="rich-m">-l -a</span> may be written{' '}
              <span className="rich-m">-la</span>.
            </p>
          </div>
          <dl className={linuxStyles.switches}>
            {switches.map((item) => (
              <div className={linuxStyles.switchRow} key={item.flag}>
                <dt>
                  <code className={linuxStyles.switchFlag}>{item.flag}</code>
                </dt>
                <dd className={linuxStyles.switchText}>{item.d}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>Variations worth knowing</h2>
          <p className={entry.headLede}>
            The same tool, pointed at a narrower question. These four cover most of what it is
            reached for day to day.
          </p>
        </div>
        <div className={linuxStyles.recipes}>
          {command.recipes.map((recipe) => (
            <div className={linuxStyles.recipe} key={recipe.run}>
              <code className={linuxStyles.recipeRun}>{recipe.run}</code>
              <p className={linuxStyles.recipeText}>{recipe.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.section}`}>
        <div className={entry.head}>
          <h2 className={entry.headTitle}>In cybersecurity</h2>
          <p className={entry.headLede}>
            <RichText parts={command.security.lede} />
          </p>
        </div>
        <div className={entry.secGrid}>
          {command.security.points.map((point) => (
            <div key={point.t}>
              <div className={entry.secTitle}>{point.t}</div>
              <p className={entry.secText}>{point.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${shell.wrap} ${entry.metaSection}`}>
        <div className={entry.metaCols}>
          <div>
            {/* the shell commands show no protocol, so they say where they are
                filed instead of leaving the column empty */}
            <div className={entry.metaHead}>
              <h2 className={entry.metaTitle}>
                {protocols.length > 0 ? 'Protocols it shows' : 'Filed under'}
              </h2>
            </div>
            <div className={entry.chipRow}>
              {protocols.length === 0 && group && (
                <Link href={`${LINUX_HREF}#group-${group.id}`} className={entry.protoChip}>
                  {group.name}
                </Link>
              )}
              {protocols.map((p) => (
                <Link
                  /* a protocol without a written page falls back to the Bench,
                     as the nav chips do */
                  href={protocolPages[protocolSlug(p)] ? protocolHref(p) : BENCH_HREF}
                  className={entry.protoChip}
                  key={p.id}
                  title={p.name}
                >
                  {p.abbr}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className={entry.metaHead}>
              <h2 className={entry.metaTitle}>Read alongside</h2>
            </div>
            <div className={linuxStyles.relatedCards}>
              {related.map((r) => (
                <Link href={linuxHref(r)} className={linuxStyles.relatedCard} key={r.slug}>
                  <strong>{r.cmd}</strong>
                  <span>{r.fn}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <nav className={`${shell.wrap} ${entry.pager}`} aria-label="Linux commands">
        {prev ? (
          <Link href={linuxHref(prev)} className={entry.pagerLink}>
            &larr; Previous: {prev.cmd}
          </Link>
        ) : (
          <Link href={LINUX_HREF} className={entry.pagerLink}>
            &larr; All commands
          </Link>
        )}
        <Link href={LINUX_HREF} className={entry.pagerAll}>
          All commands
        </Link>
        {next ? (
          <Link href={linuxHref(next)} className={`${entry.pagerLink} ${entry.pagerNext}`}>
            Next: {next.cmd} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>
      </main>

      <SiteFooter note={command.footnote} />
    </div>
  );
}
