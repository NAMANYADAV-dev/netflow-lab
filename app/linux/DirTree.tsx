import Link from 'next/link';
import {
  ArrowRight,
  File,
  Folder,
  FolderOpen,
  HardDrive,
  LinkSimple,
} from '@phosphor-icons/react/dist/ssr';
import {
  dirsByGroup,
  linuxDirBySlug,
  linuxDirHref,
  type LinuxDir,
  type TreeEntryKind,
  type TreeGroupId,
} from '@/lib/linux-tree';
import styles from './tree.module.css';

/* The directory tree, drawn rather than typed.

   A terminal's `tree` lists nineteen names in alphabetical order and leaves the
   reader to work out which matter. Here the root branches into the five jobs
   first, each in its own colour, and the directories hang off the job they do —
   so the colour a directory wears says what kind of thing lives in it before
   its name has been read. */

/** the colour class for a group — also worn by that group's directory pages */
export const groupClass: Record<TreeGroupId, string> = {
  system: styles.gSystem,
  data: styles.gData,
  people: styles.gPeople,
  kernel: styles.gKernel,
  scratch: styles.gScratch,
};

export default function DirTree() {
  const root = linuxDirBySlug.slash;

  return (
    <div className={styles.tree}>
      <Link href={linuxDirHref(root)} className={styles.root}>
        <span className={styles.rootMark}>/</span>
        <span>
          <span className={styles.rootName}>The root directory</span>
          <span className={styles.rootNote}>Every path starts here</span>
        </span>
      </Link>

      <ol className={styles.groups}>
        {dirsByGroup.map((group, index) => (
          <li className={`${styles.group} ${groupClass[group.id]}`} key={group.id}>
            <div className={styles.groupHead}>
              <span className={styles.groupTag}>
                <span className={styles.groupNum}>{index + 1}</span>
                {group.name}
              </span>
              <span className={styles.groupBlurb}>{group.blurb}</span>
            </div>

            <ul className={styles.nodes}>
              {group.dirs
                .filter((dir) => dir.slug !== 'slash')
                .map((dir) => (
                  <li key={dir.slug}>
                    <Link href={linuxDirHref(dir)} className={styles.node}>
                      <Folder weight="duotone" size={26} className={styles.nodeIcon} aria-hidden="true" />
                      <span className={styles.nodeBody}>
                        <span className={styles.nodePath}>
                          {dir.path}
                          {dir.linkTo && <span className={styles.nodeLink}>&rarr; {dir.linkTo}</span>}
                        </span>
                        <span className={styles.nodeSub}>{dir.sub}</span>
                      </span>
                      <ArrowRight size={16} className={styles.nodeArrow} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

const kindLabel: Record<TreeEntryKind, string> = {
  dir: 'directory',
  file: 'file',
  link: 'link',
  dev: 'device',
};

const kindClass: Record<TreeEntryKind, string> = {
  dir: styles.kDir,
  file: styles.kFile,
  link: styles.kLink,
  dev: styles.kDev,
};

function KindIcon({ kind }: { kind: TreeEntryKind }) {
  const props = { size: 22, weight: 'duotone' as const, 'aria-hidden': true };
  if (kind === 'dir') return <Folder {...props} />;
  if (kind === 'link') return <LinkSimple {...props} />;
  if (kind === 'dev') return <HardDrive {...props} />;
  return <File {...props} />;
}

/* One directory opened up: its path as the trunk, and what is inside as the
   branches. Each kind of entry — directory, file, link, device — has its own
   mark and colour, so the listing can be read at a glance. */
export function InsideTree({ dir }: { dir: LinuxDir }) {
  return (
    <div className={`${styles.inside} ${groupClass[dir.group]}`}>
      <div className={styles.insideHead}>
        <FolderOpen weight="duotone" size={28} aria-hidden="true" />
        <span className={styles.insidePath}>{dir.path}</span>
      </div>

      <ul className={styles.entries}>
        {dir.inside.map((item) => (
          <li className={`${styles.entry} ${kindClass[item.kind]}`} key={item.name}>
            <span className={styles.entryIcon}>
              <KindIcon kind={item.kind} />
            </span>
            <span className={styles.entryName}>{item.name}</span>
            <span className={styles.entryKind}>{kindLabel[item.kind]}</span>
            <span className={styles.entryText}>{item.d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
