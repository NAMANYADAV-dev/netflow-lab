import type { Rich } from '@/components/RichText';
import { LINUX_HREF } from './atlas-data';

/* The Linux directory tree, one record per top-level directory.

   The layout described is the Filesystem Hierarchy Standard as current
   Debian-family and Fedora-family systems ship it, where /bin, /sbin and /lib
   are links into /usr. Where distributions differ, the record says so rather
   than picking a side.

   Each directory belongs to one of five groups, and the group is what gives it
   its colour in the tree — so a reader learns the five jobs before the
   nineteen names. */

export type TreeGroupId = 'system' | 'data' | 'people' | 'kernel' | 'scratch';

export type TreeGroup = { id: TreeGroupId; name: string; blurb: string };

export const treeGroups: TreeGroup[] = [
  {
    id: 'system',
    name: 'The system itself',
    blurb:
      'Programs, libraries and the kernel. Installed by the package manager — not somewhere to keep your own files.',
  },
  {
    id: 'data',
    name: 'Configuration and changing data',
    blurb:
      'The settings, and everything that grows while the system runs: logs, caches, databases and what a server hands out.',
  },
  {
    id: 'people',
    name: 'The people',
    blurb: 'Where users keep their own files — and, kept apart from them, the administrator.',
  },
  {
    id: 'kernel',
    name: 'Windows into the kernel',
    blurb:
      'Not on any disk. The kernel makes these up as they are read: processes, hardware and devices, presented as files.',
  },
  {
    id: 'scratch',
    name: 'Scratch space and mount points',
    blurb: 'Files that need not survive a reboot, and the empty directories where other disks are attached.',
  },
];

/** what an entry inside a directory is — it picks the mark drawn beside it */
export type TreeEntryKind = 'dir' | 'file' | 'link' | 'dev';

export type LinuxDir = {
  /** `slash` for /, otherwise the directory's name without the leading / */
  slug: string;
  /** the path as it is written — the page title */
  path: string;
  group: TreeGroupId;
  /** where the name points, when the directory is a link on current systems */
  linkTo?: string;
  /** the directory in a few words */
  sub: string;
  /** one sentence: what lives here */
  fn: string;
  lede: Rich;
  takeaway: Rich;
  points: { k: string; v: string; note: string }[];
  why: { t: string; d: string }[];
  inside: { name: string; kind: TreeEntryKind; d: string }[];
  recipes: { run: string; d: string }[];
  care: { t: string; d: string }[];
  /** slugs of the directories worth reading next */
  related: string[];
  footnote: string;
};

export const linuxDirs: LinuxDir[] = [
  /* ── the system itself ─────────────────────────────────────────────────── */
  {
    slug: 'slash',
    path: '/',
    group: 'system',
    sub: 'the root of the tree',
    fn: 'The root directory. Every other path on the system starts here.',
    lede: [
      { i: 'The root directory is the top of the tree.' },
      ' It has no parent and no name of its own — just the slash. ',
      { a: 'Every file on the system is somewhere beneath it' },
      ', and a second disk or a USB stick does not get a letter of its own: ',
      { b: 'it is attached to a directory inside this tree.' },
    ],
    takeaway: ['One tree, one root. ', { a: 'Every absolute path' }, ' begins with this slash.'],
    points: [
      { k: 'Holds', v: 'Everything', note: 'All other directories hang off it' },
      { k: 'On disk', v: 'Yes', note: 'The root filesystem, mounted first at boot' },
      { k: 'Who writes', v: 'root', note: 'Ordinary users cannot create files here' },
      { k: 'Parent', v: 'None', note: '.. in / leads back to / itself' },
    ],
    why: [
      {
        t: 'One tree instead of drive letters',
        d: 'Windows gives each disk a letter. Linux gives the whole system a single tree, and each disk or partition is mounted onto a directory in it. A program never needs to know which disk a file is on.',
      },
      {
        t: 'The first thing mounted',
        d: 'At boot the kernel mounts the root filesystem before anything else. It must contain enough to bring the rest of the system up — which is why the essential directories live directly under it.',
      },
      {
        t: 'A fixed starting point',
        d: 'Because every absolute path starts at /, a path such as /etc/hosts means the same file whoever types it and wherever they are standing.',
      },
    ],
    inside: [
      { name: 'usr', kind: 'dir', d: 'Installed programs and libraries — most of the operating system.' },
      { name: 'etc', kind: 'dir', d: 'System-wide configuration, as text files.' },
      { name: 'home', kind: 'dir', d: 'One directory for each user.' },
      { name: 'var', kind: 'dir', d: 'Logs, caches and other data that changes as the system runs.' },
      { name: 'bin', kind: 'link', d: 'A link to usr/bin, kept so old paths still work.' },
      { name: 'proc', kind: 'dir', d: 'A view of the running kernel, not stored on any disk.' },
    ],
    recipes: [
      { run: 'ls /', d: 'List the top level of the tree — the directories described in this section.' },
      { run: 'cd /', d: 'Go to the root. From here every path can be written without the leading slash.' },
      { run: 'df -h /', d: 'Show which disk holds the root filesystem, and how full it is.' },
      { run: 'findmnt', d: 'Show every filesystem mounted into the tree, and the directory each is attached to.' },
    ],
    care: [
      {
        t: 'Keep your files out of it',
        d: 'Nothing of yours belongs directly in /. Personal files go in your home directory, and a full root filesystem can stop the system from booting or logging in.',
      },
      {
        t: 'Mind a path that starts with /',
        d: 'A command run as root against / acts on the whole system. Read a recursive command such as rm -r or chmod -R twice before pressing Enter.',
      },
    ],
    related: ['usr', 'etc', 'home'],
    footnote:
      'The layout under / follows the Filesystem Hierarchy Standard. Distributions add a few of their own, such as /snap or /lost+found.',
  },
  {
    slug: 'usr',
    path: '/usr',
    group: 'system',
    sub: 'installed programs and libraries',
    fn: 'Installed programs, libraries and their documentation — most of the operating system.',
    lede: [
      { i: '/usr holds the software.' },
      ' Nearly every program the package manager installs lands here, along with ',
      { a: 'the libraries it needs and the manual pages that describe it' },
      '. It is the largest directory on most systems, and ',
      { b: 'it is meant to be read, not written to, in normal use.' },
    ],
    takeaway: ['If a command came from a package, ', { a: 'it lives under /usr.' }],
    points: [
      { k: 'Holds', v: 'Software', note: 'Programs, libraries, documentation' },
      { k: 'On disk', v: 'Yes', note: 'Usually the biggest part of the system' },
      { k: 'Who writes', v: 'Package manager', note: 'apt, dnf or pacman, running as root' },
      { k: 'Name', v: 'Unix System Resources', note: 'Not “user” — a common misreading' },
    ],
    why: [
      {
        t: 'One place for shareable software',
        d: 'Everything in /usr is the same on every machine running the same release. That makes it safe to mount read-only, or to share between machines.',
      },
      {
        t: 'Programs separated from data',
        d: 'Software sits here; its settings go in /etc and its changing data in /var. Replacing a program then never disturbs its configuration.',
      },
      {
        t: 'A place for your own builds',
        d: '/usr/local mirrors the same layout for software you compile or install by hand, so the package manager never overwrites it.',
      },
    ],
    inside: [
      { name: 'bin', kind: 'dir', d: 'The commands every user can run: ls, cp, grep, ssh.' },
      { name: 'sbin', kind: 'dir', d: 'Administration commands, mostly for root.' },
      { name: 'lib', kind: 'dir', d: 'Shared libraries and kernel modules.' },
      { name: 'share', kind: 'dir', d: 'Files that do not depend on the CPU: manual pages, icons, time zones.' },
      { name: 'local', kind: 'dir', d: 'Software installed by the administrator, outside the package manager.' },
      { name: 'include', kind: 'dir', d: 'Header files, needed only when compiling programs.' },
    ],
    recipes: [
      { run: 'ls /usr/bin | wc -l', d: 'Count the commands installed on this machine.' },
      { run: 'which ls', d: 'Show the full path of a command — almost always somewhere under /usr.' },
      { run: 'du -sh /usr', d: 'Show how much disk space the installed software takes.' },
      { run: 'ls /usr/local/bin', d: 'List the programs installed by hand rather than from a package.' },
    ],
    care: [
      {
        t: 'Leave it to the package manager',
        d: 'A file edited or deleted by hand under /usr is overwritten or missed at the next update. Install and remove software with apt, dnf or pacman.',
      },
      {
        t: 'Put your own software in /usr/local',
        d: 'A program you build yourself belongs in /usr/local, where updates will not touch it and it is easy to find later.',
      },
    ],
    related: ['bin', 'lib', 'opt'],
    footnote:
      'Some distributions also keep /usr/lib64 for 64-bit libraries, and /usr/libexec for helper programs not meant to be run directly.',
  },
  {
    slug: 'bin',
    path: '/bin',
    group: 'system',
    linkTo: 'usr/bin',
    sub: 'everyday commands',
    fn: 'The commands every user can run. On current systems, a link to /usr/bin.',
    lede: [
      { i: '/bin is where the everyday commands are found.' },
      ' The name is short for binaries — programs ready to run. ',
      { a: 'ls, cp, cat and the shell itself are all here' },
      ', and on a current system ',
      { b: '/bin is simply a link that points at /usr/bin.' },
    ],
    takeaway: ['Type a command, and ', { a: 'the shell finds it here.' }],
    points: [
      { k: 'Holds', v: 'Commands', note: 'Programs any user may run' },
      { k: 'On disk', v: 'A link', note: 'Points to usr/bin on current systems' },
      { k: 'Who writes', v: 'Package manager', note: 'Not a place for your own scripts' },
      { k: 'Name', v: 'Binaries', note: 'Executable programs' },
    ],
    why: [
      {
        t: 'Commands needed before /usr existed',
        d: 'On early Unix machines /usr was a separate disk, mounted late. /bin held the few commands needed to boot and to repair the system before that disk was available.',
      },
      {
        t: 'Why it is now a link',
        d: 'Modern systems mount everything early, so the split no longer helps. /bin was merged into /usr/bin and left behind as a link, so that scripts beginning #!/bin/sh still work.',
      },
      {
        t: 'How the shell finds a command',
        d: 'The shell searches the directories listed in the PATH variable. /usr/bin is on that list, which is why ls runs without typing its full path.',
      },
    ],
    inside: [
      { name: 'bash', kind: 'file', d: 'The shell that reads what you type.' },
      { name: 'ls', kind: 'file', d: 'Lists the contents of a directory.' },
      { name: 'cp', kind: 'file', d: 'Copies files and directories.' },
      { name: 'cat', kind: 'file', d: 'Prints the contents of a file.' },
      { name: 'grep', kind: 'file', d: 'Finds the lines in a file that match a pattern.' },
      { name: 'sh', kind: 'link', d: 'A link to the system’s default script shell.' },
    ],
    recipes: [
      { run: 'ls -ld /bin', d: 'Show that /bin is a link, and where it points.' },
      { run: 'echo $PATH', d: 'List the directories the shell searches for a command, in order.' },
      { run: 'which bash', d: 'Show the full path of the program a command name runs.' },
      { run: 'file /bin/ls', d: 'Show what kind of file a command is — a compiled program or a script.' },
    ],
    care: [
      {
        t: 'Do not add your own scripts here',
        d: 'Personal scripts belong in ~/bin or ~/.local/bin, and system-wide ones in /usr/local/bin. Files placed in /bin get mixed up with the system’s own.',
      },
      {
        t: 'A changed binary is a warning sign',
        d: 'An attacker who replaces ls or ps can hide files and processes. Package tools such as dpkg --verify or rpm -V compare the installed files against what the package shipped.',
      },
    ],
    related: ['usr', 'sbin', 'lib'],
    footnote:
      'On a few distributions /bin is still a real directory separate from /usr/bin. The commands inside are the same.',
  },
  {
    slug: 'sbin',
    path: '/sbin',
    group: 'system',
    linkTo: 'usr/sbin',
    sub: 'administration commands',
    fn: 'Commands for administering the system. On current systems, a link to /usr/sbin.',
    lede: [
      { i: '/sbin holds the system administration commands.' },
      ' These are the programs that ',
      { a: 'partition disks, configure the network and manage users' },
      '. Anyone can usually look at them, but ',
      { b: 'most of them only do their job when run as root.' },
    ],
    takeaway: ['The tools that change the system, ', { a: 'kept apart from the everyday ones.' }],
    points: [
      { k: 'Holds', v: 'Admin commands', note: 'Disk, network, user and boot tools' },
      { k: 'On disk', v: 'A link', note: 'Points to usr/sbin on current systems' },
      { k: 'Who runs', v: 'Mostly root', note: 'Usually through sudo' },
      { k: 'Name', v: 'System binaries', note: 'The s is for system' },
    ],
    why: [
      {
        t: 'A separate shelf for dangerous tools',
        d: 'Formatting a disk and listing a directory are not the same kind of act. Keeping the administration commands apart makes it clear which is which.',
      },
      {
        t: 'Kept off ordinary users’ PATH',
        d: 'On some distributions /sbin is only on root’s PATH. A normal user who types fdisk may be told the command is not found, although it is installed.',
      },
    ],
    inside: [
      { name: 'ip', kind: 'file', d: 'Shows and changes interfaces, addresses and routes.' },
      { name: 'fdisk', kind: 'file', d: 'Reads and edits a disk’s partition table.' },
      { name: 'mkfs', kind: 'file', d: 'Creates a filesystem on a partition.' },
      { name: 'useradd', kind: 'file', d: 'Creates a user account.' },
      { name: 'reboot', kind: 'file', d: 'Restarts the machine.' },
      { name: 'sshd', kind: 'file', d: 'The SSH server program.' },
    ],
    recipes: [
      { run: 'ls -ld /sbin', d: 'Show that /sbin is a link, and where it points.' },
      { run: 'ls /usr/sbin | head', d: 'List the first few administration commands installed.' },
      { run: 'sudo fdisk -l', d: 'Run an administration command with root’s rights — here, list the disks.' },
      { run: 'which ip', d: 'Find which directory an administration command lives in.' },
    ],
    care: [
      {
        t: 'These commands act at once',
        d: 'mkfs and fdisk do not ask twice. Check the device name before running anything that writes to a disk.',
      },
      {
        t: '“Command not found” may mean PATH',
        d: 'If an administration command seems to be missing, try it with sudo or by its full path before installing anything.',
      },
    ],
    related: ['bin', 'usr', 'root'],
    footnote: 'Where exactly a given tool lives — /usr/bin or /usr/sbin — varies a little between distributions.',
  },
  {
    slug: 'lib',
    path: '/lib',
    group: 'system',
    linkTo: 'usr/lib',
    sub: 'shared libraries and kernel modules',
    fn: 'Shared libraries the programs depend on, and the kernel’s modules. A link to /usr/lib.',
    lede: [
      { i: '/lib holds code that programs share.' },
      ' A library is a file of ready-made functions that many programs load instead of each carrying its own copy. ',
      { a: 'Almost every command depends on at least one' },
      ', and ',
      { b: 'the kernel’s drivers are kept here too, as modules.' },
    ],
    takeaway: ['Programs are in /bin. ', { a: 'What they need in order to run is here.' }],
    points: [
      { k: 'Holds', v: 'Libraries', note: 'Files ending in .so, and kernel modules' },
      { k: 'On disk', v: 'A link', note: 'Points to usr/lib on current systems' },
      { k: 'Who writes', v: 'Package manager', note: 'Installed as dependencies' },
      { k: 'Like', v: '.dll files', note: 'The Windows equivalent of a .so' },
    ],
    why: [
      {
        t: 'One copy, used by many',
        d: 'The C library is used by nearly every program on the system. Keeping one shared copy saves disk and memory, and a security fix to it reaches every program at once.',
      },
      {
        t: 'Drivers loaded on demand',
        d: 'Kernel modules — drivers for network cards, filesystems and more — sit under /lib/modules and are loaded only when the hardware is present.',
      },
    ],
    inside: [
      { name: 'x86_64-linux-gnu', kind: 'dir', d: 'The shared libraries for this CPU type, on Debian-family systems.' },
      { name: 'libc.so.6', kind: 'file', d: 'The C library — the one almost everything depends on.' },
      { name: 'modules', kind: 'dir', d: 'Kernel modules, in one directory per kernel version.' },
      { name: 'firmware', kind: 'dir', d: 'Firmware files that drivers load into hardware.' },
      { name: 'systemd', kind: 'dir', d: 'systemd’s own programs and the unit files shipped by packages.' },
    ],
    recipes: [
      { run: 'ldd /bin/ls', d: 'List the libraries a program needs, and where each was found.' },
      { run: 'ls /lib/modules', d: 'List the kernel versions that have modules installed.' },
      { run: 'lsmod', d: 'List the kernel modules loaded right now.' },
      { run: 'uname -r', d: 'Print the running kernel’s version — the name of its modules directory.' },
    ],
    care: [
      {
        t: 'A missing library stops a program',
        d: 'Deleting or replacing a file here can break every program that uses it — including the shell and the package manager needed to fix it.',
      },
      {
        t: 'Libraries are a place to hide',
        d: 'A malicious library loaded into every process sees everything those processes do. /etc/ld.so.preload should normally not exist; if it does, find out why.',
      },
    ],
    related: ['usr', 'bin', 'boot'],
    footnote: 'Fedora-family systems keep 64-bit libraries in /lib64, which links to /usr/lib64.',
  },
  {
    slug: 'boot',
    path: '/boot',
    group: 'system',
    sub: 'the kernel and the boot loader',
    fn: 'The kernel itself, and the files the boot loader needs to start it.',
    lede: [
      { i: '/boot holds what the machine needs before Linux is running.' },
      ' The boot loader reads ',
      { a: 'the kernel and an initial RAM disk' },
      ' from here and starts them. Once the system is up, ',
      { b: 'nothing here is touched again until the next kernel update.' },
    ],
    takeaway: ['Small, rarely looked at, and ', { a: 'the machine cannot start without it.' }],
    points: [
      { k: 'Holds', v: 'The kernel', note: 'And the boot loader’s files' },
      { k: 'On disk', v: 'Often its own partition', note: 'Small, and kept simple' },
      { k: 'Who writes', v: 'Kernel updates', note: 'Through the package manager' },
      { k: 'Read', v: 'At power-on', note: 'By GRUB or another boot loader' },
    ],
    why: [
      {
        t: 'The boot loader needs a simple place',
        d: 'A boot loader understands only a few filesystems. Keeping the kernel on a small, plain partition means it can be read even when the rest of the disk is encrypted or uses something more complex.',
      },
      {
        t: 'More than one kernel is kept',
        d: 'An update installs the new kernel beside the old one. If the new one fails to boot, the previous one can be chosen from the boot menu.',
      },
    ],
    inside: [
      { name: 'vmlinuz-6.8.0-45-generic', kind: 'file', d: 'The kernel, compressed. The version number varies.' },
      { name: 'initrd.img-6.8.0-45-generic', kind: 'file', d: 'A small temporary system that loads the drivers needed to reach the real disk.' },
      { name: 'config-6.8.0-45-generic', kind: 'file', d: 'The options this kernel was built with.' },
      { name: 'grub', kind: 'dir', d: 'The boot loader’s configuration and modules.' },
      { name: 'efi', kind: 'dir', d: 'The EFI system partition, on machines that boot with UEFI.' },
    ],
    recipes: [
      { run: 'ls -lh /boot', d: 'List the installed kernels and their sizes.' },
      { run: 'uname -r', d: 'Show which of those kernels is running now.' },
      { run: 'df -h /boot', d: 'Check how full /boot is — a full one makes kernel updates fail.' },
      { run: 'cat /proc/cmdline', d: 'Show the options the boot loader passed to the running kernel.' },
    ],
    care: [
      {
        t: 'A full /boot blocks updates',
        d: 'Old kernels pile up on a small partition. Remove them with the package manager — sudo apt autoremove on Debian and Ubuntu — never by deleting the files.',
      },
      {
        t: 'It is usually not encrypted',
        d: 'Even with full-disk encryption, /boot is often left readable so the machine can start. Someone with physical access could alter it, which is what Secure Boot exists to detect.',
      },
    ],
    related: ['lib', 'slash', 'proc'],
    footnote: 'File names here carry the kernel version, so they differ on every system and after every update.',
  },

  /* ── configuration and changing data ───────────────────────────────────── */
  {
    slug: 'etc',
    path: '/etc',
    group: 'data',
    sub: 'system-wide configuration',
    fn: 'System-wide configuration, kept as plain text files.',
    lede: [
      { i: '/etc is where the system’s settings live.' },
      ' Users, host names, DNS servers, services — ',
      { a: 'each is a plain text file you can read and edit' },
      '. There is no registry and no hidden database: ',
      { b: 'to change how a machine behaves, you change a file here.' },
    ],
    takeaway: ['To know how a machine is set up, ', { a: 'read /etc.' }],
    points: [
      { k: 'Holds', v: 'Configuration', note: 'Text files, one or more per program' },
      { k: 'On disk', v: 'Yes', note: 'Small, and worth backing up' },
      { k: 'Who writes', v: 'root', note: 'Most files are readable by everyone' },
      { k: 'Name', v: 'Et cetera', note: 'Said “et-see”' },
    ],
    why: [
      {
        t: 'Settings separated from programs',
        d: 'Because configuration is not mixed in with the software, a program can be upgraded or reinstalled without losing how it was set up.',
      },
      {
        t: 'Text can be managed like text',
        d: 'A plain file can be searched with grep, compared with diff, copied to another machine and kept in version control. That is what makes Linux servers easy to automate.',
      },
      {
        t: 'It makes each machine itself',
        d: 'Two servers with the same packages differ only in /etc and their data. Back up /etc, and you have the machine’s identity.',
      },
    ],
    inside: [
      { name: 'passwd', kind: 'file', d: 'The list of user accounts. Despite the name, no passwords.' },
      { name: 'shadow', kind: 'file', d: 'The password hashes. Readable only by root.' },
      { name: 'hosts', kind: 'file', d: 'Names mapped to addresses, checked before the DNS.' },
      { name: 'resolv.conf', kind: 'file', d: 'Which DNS servers the host asks.' },
      { name: 'fstab', kind: 'file', d: 'Which filesystems are mounted at boot, and where.' },
      { name: 'ssh', kind: 'dir', d: 'The SSH server’s and client’s settings, and the host keys.' },
      { name: 'systemd', kind: 'dir', d: 'Service definitions added or overridden by the administrator.' },
    ],
    recipes: [
      { run: 'cat /etc/os-release', d: 'Show which distribution and version this machine runs.' },
      { run: 'cat /etc/hosts', d: 'Show the names this host resolves without asking the DNS.' },
      { run: 'grep -r "Port" /etc/ssh/', d: 'Search every file in a configuration directory for a setting.' },
      { run: 'sudo cp /etc/fstab /etc/fstab.bak', d: 'Keep a copy of a file before editing it.' },
    ],
    care: [
      {
        t: 'Copy before you edit',
        d: 'A typing mistake in fstab or sudoers can leave a machine unable to boot or you unable to become root. Keep a copy, and use visudo for the sudoers file.',
      },
      {
        t: 'This is what an attacker reads first',
        d: 'passwd lists the accounts, shadow holds the hashes, and configuration files often contain passwords. Check that secrets are readable only by those who need them.',
      },
      {
        t: 'Changes need a reload',
        d: 'Editing a service’s file does not change the running service. Reload or restart it with systemctl for the new setting to take effect.',
      },
    ],
    related: ['var', 'home', 'usr'],
    footnote: 'Many programs read every file in a .d directory, such as /etc/apt/sources.list.d, so settings can be added without editing the main file.',
  },
  {
    slug: 'var',
    path: '/var',
    group: 'data',
    sub: 'data that changes as the system runs',
    fn: 'Data that changes as the system runs: logs, caches, queues and databases.',
    lede: [
      { i: '/var holds the files that keep changing.' },
      ' The name is short for variable. ',
      { a: 'Logs grow, caches fill, mail and print jobs queue up' },
      ' — all of it here, so that ',
      { b: 'the rest of the system can stay still while this part moves.' },
    ],
    takeaway: ['When something went wrong, ', { a: 'the record of it is in /var/log.' }],
    points: [
      { k: 'Holds', v: 'Changing data', note: 'Logs, caches, databases, queues' },
      { k: 'On disk', v: 'Yes', note: 'Often its own partition on servers' },
      { k: 'Who writes', v: 'Services', note: 'Each under its own account' },
      { k: 'Name', v: 'Variable', note: 'Its contents never stop changing' },
    ],
    why: [
      {
        t: 'Growth kept in one place',
        d: 'Logs can fill a disk. On its own partition, a full /var stops the logging but leaves the root filesystem with room to boot and be repaired.',
      },
      {
        t: 'Lets /usr stay read-only',
        d: 'Programs live in /usr and never write there. Anything they need to save while running goes to /var instead.',
      },
    ],
    inside: [
      { name: 'log', kind: 'dir', d: 'System and service logs. The first place to look when something fails.' },
      { name: 'lib', kind: 'dir', d: 'State that services keep between restarts, including databases.' },
      { name: 'cache', kind: 'dir', d: 'Data that can be regenerated, such as downloaded packages.' },
      { name: 'spool', kind: 'dir', d: 'Jobs waiting to be handled: mail, printing, scheduled tasks.' },
      { name: 'www', kind: 'dir', d: 'The default web root on many distributions.' },
      { name: 'tmp', kind: 'dir', d: 'Temporary files that are kept across a reboot.' },
    ],
    recipes: [
      { run: 'sudo tail -f /var/log/syslog', d: 'Watch the system log as new lines arrive. Fedora-family systems use /var/log/messages.' },
      { run: 'sudo du -sh /var/* | sort -h', d: 'Find which part of /var is taking the space.' },
      { run: 'journalctl -u ssh --since today', d: 'Read one service’s log entries from systemd’s journal.' },
      { run: 'ls -lt /var/log | head', d: 'List the logs most recently written to.' },
    ],
    care: [
      {
        t: 'Watch it for space',
        d: 'A full /var stops services that cannot write their logs or data. Log rotation normally prevents this; a runaway log is the usual cause when it does not.',
      },
      {
        t: 'Logs are evidence',
        d: 'auth.log records every login and sudo use. Attackers try to edit or delete it, which is why important servers send their logs to another machine as well.',
      },
    ],
    related: ['etc', 'tmp', 'srv'],
    footnote: 'Log file names differ: Debian and Ubuntu write auth.log and syslog, Fedora and RHEL write secure and messages.',
  },
  {
    slug: 'opt',
    path: '/opt',
    group: 'data',
    sub: 'self-contained add-on software',
    fn: 'Add-on software that ships as one self-contained bundle.',
    lede: [
      { i: '/opt is for software that keeps to itself.' },
      ' Instead of spreading its files across /usr, ',
      { a: 'a program installed here keeps everything in one directory of its own' },
      '. It is where ',
      { b: 'commercial and third-party applications usually install.' },
    ],
    takeaway: ['One directory per product. ', { a: 'Delete the directory, and it is gone.' }],
    points: [
      { k: 'Holds', v: 'Add-on software', note: 'One directory per product' },
      { k: 'On disk', v: 'Yes', note: 'Often empty on a fresh install' },
      { k: 'Who writes', v: 'root', note: 'Usually a vendor’s installer' },
      { k: 'Name', v: 'Optional', note: 'Not part of the base system' },
    ],
    why: [
      {
        t: 'Keeps vendor software apart',
        d: 'A product that brings its own libraries would clash with the system’s if it were unpacked into /usr. In /opt it cannot.',
      },
      {
        t: 'Easy to remove',
        d: 'Everything the program owns is under one directory, so removing it does not mean hunting for files across the system.',
      },
    ],
    inside: [
      { name: 'google', kind: 'dir', d: 'Google Chrome, when installed from Google’s package.' },
      { name: 'containerd', kind: 'dir', d: 'Files installed alongside Docker.' },
      { name: 'product/bin', kind: 'dir', d: 'A bundle’s own programs — not on PATH unless it is added.' },
      { name: 'product/lib', kind: 'dir', d: 'The libraries the bundle brings with it.' },
    ],
    recipes: [
      { run: 'ls /opt', d: 'List the add-on software installed on this machine.' },
      { run: 'du -sh /opt/*', d: 'Show how much space each product takes.' },
      { run: 'ls -l /opt/google/chrome', d: 'Look inside one bundle to see its own programs and libraries.' },
      { run: 'export PATH="$PATH:/opt/product/bin"', d: 'Add a bundle’s programs to the directories the shell searches.' },
    ],
    care: [
      {
        t: 'It may not update itself',
        d: 'Software unpacked into /opt by hand is not known to the package manager, so system updates skip it. Keeping it patched is your job.',
      },
      {
        t: 'Check who owns it',
        d: 'A program in /opt that any user can modify, but which root runs, is a route to becoming root. The files should belong to root.',
      },
    ],
    related: ['usr', 'srv', 'etc'],
    footnote: 'The names inside /opt depend entirely on what has been installed. “product” above stands for any vendor’s directory.',
  },
  {
    slug: 'srv',
    path: '/srv',
    group: 'data',
    sub: 'data this host serves to others',
    fn: 'Data this host serves to others, such as a web site or file share.',
    lede: [
      { i: '/srv is for the data a server hands out.' },
      ' The files of a web site, an FTP area, a shared repository — ',
      { a: 'whatever this machine exists to serve' },
      '. The standard sets it aside for that purpose, though ',
      { b: 'many distributions leave it empty and use /var/www instead.' },
    ],
    takeaway: ['The data the machine serves, ', { a: 'kept apart from the machine itself.' }],
    points: [
      { k: 'Holds', v: 'Served data', note: 'Web, FTP and file-share content' },
      { k: 'On disk', v: 'Yes', note: 'Empty on most desktop systems' },
      { k: 'Who writes', v: 'The administrator', note: 'Its layout is yours to choose' },
      { k: 'Name', v: 'Service', note: 'Data for services' },
    ],
    why: [
      {
        t: 'Site data in a known place',
        d: 'An administrator arriving at an unfamiliar server can look in one directory to find what it serves, without reading every service’s configuration.',
      },
      {
        t: 'Simple to back up',
        d: 'Programs can be reinstalled; the site’s content cannot. With the content in one tree, the backup is one path.',
      },
    ],
    inside: [
      { name: 'www', kind: 'dir', d: 'Web site files, where the administrator has chosen /srv for them.' },
      { name: 'ftp', kind: 'dir', d: 'The files an FTP server offers.' },
      { name: 'git', kind: 'dir', d: 'Repositories shared from this host.' },
      { name: 'nfs', kind: 'dir', d: 'Directories exported to other machines over NFS.' },
    ],
    recipes: [
      { run: 'ls /srv', d: 'See whether this machine keeps served data here at all.' },
      { run: 'sudo mkdir -p /srv/www/example', d: 'Create a directory for a site’s files.' },
      { run: 'du -sh /srv', d: 'Show how much data the host is serving.' },
      { run: 'grep -r "root" /etc/nginx/sites-enabled/', d: 'Find where a web server is actually told to serve from.' },
    ],
    care: [
      {
        t: 'Anything here may be public',
        d: 'A file under a web root is one request away from the internet. Backups, .git directories and files holding passwords do not belong in it.',
      },
      {
        t: 'Give services only what they need',
        d: 'The web server should be able to read the site and write only where uploads go. A site writable throughout can be rewritten by whoever breaks in.',
      },
    ],
    related: ['var', 'opt', 'etc'],
    footnote: 'The standard does not fix a layout inside /srv. The directory names above are common choices, not requirements.',
  },

  /* ── the people ────────────────────────────────────────────────────────── */
  {
    slug: 'home',
    path: '/home',
    group: 'people',
    sub: 'users’ own files',
    fn: 'One directory per user, for their own files and personal settings.',
    lede: [
      { i: '/home is where people keep their files.' },
      ' Each user has a directory named after them, and ',
      { a: 'inside it they may create, change and delete whatever they like' },
      '. It is written ~ for short, and ',
      { b: 'it is the one part of the tree that belongs to you rather than to the system.' },
    ],
    takeaway: ['The system owns the rest of the tree. ', { a: 'This part is yours.' }],
    points: [
      { k: 'Holds', v: 'Personal files', note: 'One directory for each user' },
      { k: 'On disk', v: 'Yes', note: 'Often its own partition' },
      { k: 'Who writes', v: 'Each user', note: 'Only inside their own directory' },
      { k: 'Short form', v: '~', note: 'The tilde means your home directory' },
    ],
    why: [
      {
        t: 'Users kept apart from each other',
        d: 'Each home directory is owned by its user. One person’s files are not another’s to change, and on many systems not even to read.',
      },
      {
        t: 'Your data survives a reinstall',
        d: 'With /home on its own partition, the operating system can be replaced while the documents and settings stay where they are.',
      },
      {
        t: 'Settings travel with the user',
        d: 'Personal configuration is stored as hidden files in the home directory, so each user gets their own shell and application setup.',
      },
    ],
    inside: [
      { name: 'user', kind: 'dir', d: 'One user’s home directory. Yours is named after your login.' },
      { name: 'user/Documents', kind: 'dir', d: 'Ordinary folders, as on any desktop system.' },
      { name: 'user/.bashrc', kind: 'file', d: 'Commands run each time a shell starts: aliases, the prompt, PATH.' },
      { name: 'user/.ssh', kind: 'dir', d: 'SSH keys and the list of known hosts.' },
      { name: 'user/.config', kind: 'dir', d: 'Per-user settings for most applications.' },
      { name: 'user/.bash_history', kind: 'file', d: 'The commands typed in earlier sessions.' },
    ],
    recipes: [
      { run: 'cd ~', d: 'Go to your home directory. Plain cd does the same.' },
      { run: 'echo $HOME', d: 'Print the full path of your home directory.' },
      { run: 'ls -la ~', d: 'List everything in it, including the hidden files that begin with a dot.' },
      { run: 'du -sh ~/* | sort -h', d: 'Find what is taking the space in your home directory.' },
    ],
    care: [
      {
        t: 'Guard ~/.ssh',
        d: 'A private key is a way in to every machine that trusts it. The directory should be readable by you alone — SSH refuses to use keys that are not.',
      },
      {
        t: 'History remembers what you typed',
        d: 'A password passed on the command line ends up in .bash_history in plain text. It is one of the first files read on a compromised account.',
      },
      {
        t: 'Dot files run code',
        d: '.bashrc is executed at every login. A line added there by someone else runs as you, each time you open a terminal.',
      },
    ],
    related: ['root', 'etc', 'tmp'],
    footnote: '“user” stands for a login name. Service accounts usually have their home elsewhere, such as /var/lib.',
  },
  {
    slug: 'root',
    path: '/root',
    group: 'people',
    sub: 'the administrator’s home',
    fn: 'The home directory of root, the administrator account.',
    lede: [
      { i: '/root is the home directory of the root user.' },
      ' It is not the root of the tree — that is /. ',
      { a: 'It is simply where the administrator’s own files and settings are kept' },
      ', and ',
      { b: 'it is closed to every other user.' },
    ],
    takeaway: [{ a: '/' }, ' is the root directory. ', { b: '/root' }, ' is root’s home. They are not the same.'],
    points: [
      { k: 'Holds', v: 'root’s own files', note: 'Settings, history, keys' },
      { k: 'On disk', v: 'Yes', note: 'On the root filesystem' },
      { k: 'Who reads', v: 'root only', note: 'Others get “Permission denied”' },
      { k: 'Short form', v: '~', note: 'When you are logged in as root' },
    ],
    why: [
      {
        t: 'Available when /home is not',
        d: '/home is often a separate partition or a network share. If it fails to mount, root can still log in to repair the system, because root’s home is on the root filesystem.',
      },
      {
        t: 'Kept apart from ordinary users',
        d: 'The administrator’s keys, scripts and history are more sensitive than anyone else’s, so they are not placed beside the other home directories.',
      },
    ],
    inside: [
      { name: '.bashrc', kind: 'file', d: 'root’s shell settings.' },
      { name: '.bash_history', kind: 'file', d: 'The commands run as root in earlier sessions.' },
      { name: '.ssh', kind: 'dir', d: 'Keys allowed to log in as root, and root’s own keys.' },
      { name: '.profile', kind: 'file', d: 'Commands run at login.' },
    ],
    recipes: [
      { run: 'ls /root', d: 'As an ordinary user this fails with “Permission denied” — which is the point.' },
      { run: 'sudo ls -la /root', d: 'List root’s home with root’s rights.' },
      { run: 'sudo -i', d: 'Start a shell as root. It opens in /root.' },
      { run: 'ls -ld /root', d: 'Show the permissions on the directory itself: owner only.' },
    ],
    care: [
      {
        t: 'Do not work as root by habit',
        d: 'A mistake made as root has no safety net. Use your own account and sudo for the single command that needs it.',
      },
      {
        t: 'Check who may log in as root',
        d: '/root/.ssh/authorized_keys lists the keys that can log in as root directly. An entry there that nobody recognises is serious.',
      },
    ],
    related: ['home', 'slash', 'sbin'],
    footnote: 'On Ubuntu the root account has no password by default; administration is done through sudo.',
  },

  /* ── windows into the kernel ───────────────────────────────────────────── */
  {
    slug: 'proc',
    path: '/proc',
    group: 'kernel',
    sub: 'processes and kernel state, as files',
    fn: 'Running processes and kernel state, presented as files.',
    lede: [
      { i: '/proc is a view of the running system, not a place on a disk.' },
      ' The kernel creates its contents at the moment you read them. ',
      { a: 'Every running process appears as a directory named by its number' },
      ', and ',
      { b: 'tools such as ps and top work by reading those files.' },
    ],
    takeaway: ['Nothing here is stored. ', { a: 'It is the kernel, answering.' }],
    points: [
      { k: 'Holds', v: 'Live kernel data', note: 'Processes, memory, CPU, mounts' },
      { k: 'On disk', v: 'No', note: 'Generated in memory when read' },
      { k: 'Who writes', v: 'The kernel', note: 'A few files accept settings from root' },
      { k: 'Size', v: 'Zero', note: 'Files report 0 bytes yet have contents' },
    ],
    why: [
      {
        t: 'Everything is a file',
        d: 'Rather than a special tool for each question, the kernel answers through files. Anything that can read a file can ask how much memory is free.',
      },
      {
        t: 'One directory per process',
        d: 'Each process gets /proc/ followed by its process id. Inside are its command line, its open files, its memory map and its environment.',
      },
      {
        t: 'Settings that take effect at once',
        d: 'Files under /proc/sys are kernel settings. Writing to one changes the running kernel immediately — it is how IP forwarding is switched on.',
      },
    ],
    inside: [
      { name: 'cpuinfo', kind: 'file', d: 'The processor: model, cores, features.' },
      { name: 'meminfo', kind: 'file', d: 'Memory in use and free.' },
      { name: '1', kind: 'dir', d: 'The first process started — systemd, on most systems.' },
      { name: 'self', kind: 'link', d: 'A link to the directory of whichever process is reading it.' },
      { name: 'net', kind: 'dir', d: 'Network state, including the ARP table and interface counters.' },
      { name: 'sys', kind: 'dir', d: 'Kernel settings that can be read and changed.' },
    ],
    recipes: [
      { run: 'cat /proc/cpuinfo', d: 'Show the processor’s details.' },
      { run: 'cat /proc/meminfo | head -3', d: 'Show total, free and available memory.' },
      { run: 'cat /proc/sys/net/ipv4/ip_forward', d: 'Check whether this host forwards packets: 1 is yes, 0 is no.' },
      { run: 'ls -l /proc/$$/fd', d: 'List the files your own shell has open. $$ is the shell’s process id.' },
    ],
    care: [
      {
        t: 'Changes here are lost at reboot',
        d: 'A value written under /proc/sys lasts only until the machine restarts. To keep it, put it in /etc/sysctl.conf or a file in /etc/sysctl.d.',
      },
      {
        t: 'A process reveals a lot',
        d: 'A process’s command line is readable by every user, so a password given as an argument is visible to all. Its environment is readable by its owner and root.',
      },
    ],
    related: ['sys', 'dev', 'run'],
    footnote: 'The numbered directories change from moment to moment, as processes start and exit.',
  },
  {
    slug: 'sys',
    path: '/sys',
    group: 'kernel',
    sub: 'hardware and drivers',
    fn: 'Hardware and drivers as the kernel sees them, presented as files.',
    lede: [
      { i: '/sys is the kernel’s map of the hardware.' },
      ' Like /proc it is made up on demand, but it is organised by device rather than by process. ',
      { a: 'Every network card, disk and USB port is a directory' },
      ', and ',
      { b: 'each of its properties is a small file holding one value.' },
    ],
    takeaway: ['/proc is about processes. ', { a: '/sys is about devices.' }],
    points: [
      { k: 'Holds', v: 'Devices and drivers', note: 'One directory per device' },
      { k: 'On disk', v: 'No', note: 'Generated by the kernel' },
      { k: 'Who writes', v: 'The kernel', note: 'Some values can be set by root' },
      { k: 'Also called', v: 'sysfs', note: 'The filesystem’s own name' },
    ],
    why: [
      {
        t: 'A tidier successor to /proc',
        d: '/proc grew a jumble of hardware information over the years. /sys was added to give devices a consistent layout: one directory per device, one value per file.',
      },
      {
        t: 'Hardware you can script',
        d: 'Because each property is a file, a shell script can read a battery level or set a screen’s brightness with nothing more than cat and echo.',
      },
    ],
    inside: [
      { name: 'class/net', kind: 'dir', d: 'One entry per network interface, with its MAC address, state and counters.' },
      { name: 'block', kind: 'dir', d: 'The disks and their partitions.' },
      { name: 'devices', kind: 'dir', d: 'Every device, arranged by how it is connected.' },
      { name: 'class/power_supply', kind: 'dir', d: 'Batteries and mains adapters.' },
      { name: 'module', kind: 'dir', d: 'The loaded kernel modules and their parameters.' },
    ],
    recipes: [
      { run: 'ls /sys/class/net', d: 'List the network interfaces the kernel knows about.' },
      { run: 'cat /sys/class/net/eth0/address', d: 'Read an interface’s MAC address.' },
      { run: 'cat /sys/class/net/eth0/operstate', d: 'Read whether the link is up or down.' },
      { run: 'cat /sys/block/sda/size', d: 'Read a disk’s size, counted in 512-byte sectors.' },
    ],
    care: [
      {
        t: 'Writes act on real hardware',
        d: 'Writing to a file here can switch a device off or change how it behaves, immediately. Read first; write only when you know what the file controls.',
      },
      {
        t: 'Interface names differ',
        d: 'eth0 is the classic name. Current systems use names such as enp3s0 or ens33, so list /sys/class/net before assuming one.',
      },
    ],
    related: ['proc', 'dev', 'run'],
    footnote: 'The interface and disk names above are examples. Yours depend on the hardware.',
  },
  {
    slug: 'dev',
    path: '/dev',
    group: 'kernel',
    sub: 'devices, as files',
    fn: 'Devices presented as files: disks, terminals, and the null device.',
    lede: [
      { i: '/dev is where devices appear as files.' },
      ' A disk, a terminal, a source of random numbers — ',
      { a: 'each has a name here that programs open, read and write like any file' },
      '. The kernel creates the entries as hardware is found, and ',
      { b: 'what is written to one goes straight to the device.' },
    ],
    takeaway: ['A disk is a file. So is a terminal. ', { a: 'So is nothing at all.' }],
    points: [
      { k: 'Holds', v: 'Device files', note: 'Disks, terminals, pseudo-devices' },
      { k: 'On disk', v: 'No', note: 'Kept in memory, filled in by udev' },
      { k: 'Who writes', v: 'The kernel', note: 'Entries appear as hardware does' },
      { k: 'Two kinds', v: 'Block and character', note: 'Disks, and streams such as terminals' },
    ],
    why: [
      {
        t: 'One way to talk to everything',
        d: 'A program that can write to a file can write to a disk, a serial port or a printer. No separate interface is needed for each kind of hardware.',
      },
      {
        t: 'Useful devices that are not hardware',
        d: 'Some entries are provided by the kernel itself: one that discards whatever is written to it, one that supplies endless zeros, one that supplies random bytes.',
      },
    ],
    inside: [
      { name: 'sda', kind: 'dev', d: 'The first disk. Its partitions are sda1, sda2 and so on.' },
      { name: 'nvme0n1', kind: 'dev', d: 'The first NVMe solid-state drive.' },
      { name: 'null', kind: 'dev', d: 'Discards everything written to it. Reading it gives nothing.' },
      { name: 'zero', kind: 'dev', d: 'Supplies as many zero bytes as are asked for.' },
      { name: 'urandom', kind: 'dev', d: 'Supplies random bytes — for keys and passwords.' },
      { name: 'tty', kind: 'dev', d: 'The terminal the current process is attached to.' },
    ],
    recipes: [
      { run: 'lsblk', d: 'List the disks and partitions, with where each is mounted.' },
      { run: 'command > /dev/null 2>&1', d: 'Run a command and throw away everything it prints.' },
      { run: 'head -c 16 /dev/urandom | base64', d: 'Produce 16 random bytes as readable text.' },
      { run: 'ls -l /dev/sda', d: 'The first letter of the listing is b for a block device, c for a character device.' },
    ],
    care: [
      {
        t: 'Writing to a disk device destroys it',
        d: 'Output sent to /dev/sda overwrites the disk from its first byte, filesystem and all. With dd, check the of= name against lsblk before running it.',
      },
      {
        t: 'Disk names can change',
        d: 'sda and sdb are handed out in the order disks are found, which can differ between boots. Configuration should refer to a filesystem by its UUID instead.',
      },
    ],
    related: ['sys', 'proc', 'mnt'],
    footnote: 'Device names depend on the hardware: SATA and USB disks are sd*, NVMe drives nvme*, virtual disks often vd*.',
  },
  {
    slug: 'run',
    path: '/run',
    group: 'kernel',
    sub: 'state since the last boot',
    fn: 'State since the last boot: process ids, sockets and lock files.',
    lede: [
      { i: '/run holds what is true only while the system is up.' },
      ' Which process id a service has, the socket other programs use to reach it, who is logged in — ',
      { a: 'facts about this boot, and no other' },
      '. It lives in memory, and ',
      { b: 'it starts empty every time the machine does.' },
    ],
    takeaway: ['Written at boot, ', { a: 'gone at shutdown.' }],
    points: [
      { k: 'Holds', v: 'Runtime state', note: 'PID files, sockets, locks' },
      { k: 'On disk', v: 'No', note: 'A tmpfs, held in memory' },
      { k: 'Who writes', v: 'Services', note: 'And systemd, from early in boot' },
      { k: 'Replaced', v: '/var/run', note: 'Now a link that points here' },
    ],
    why: [
      {
        t: 'Needed before the disks are ready',
        d: 'Services start writing state very early in boot, before /var may be mounted. A directory in memory is always available.',
      },
      {
        t: 'Stale state cannot survive',
        d: 'A PID file left over from before a crash would name a process that no longer exists. Because /run is cleared at every boot, that cannot happen.',
      },
    ],
    inside: [
      { name: 'sshd.pid', kind: 'file', d: 'The process id of the running SSH server.' },
      { name: 'systemd', kind: 'dir', d: 'systemd’s own runtime state.' },
      { name: 'user/1000', kind: 'dir', d: 'Per-user runtime files, in a directory named by user id.' },
      { name: 'docker.sock', kind: 'file', d: 'The socket the docker command uses to reach the Docker service.' },
      { name: 'lock', kind: 'dir', d: 'Lock files that stop two programs using one resource at once.' },
    ],
    recipes: [
      { run: 'df -h /run', d: 'Show that /run is a tmpfs — in memory, not on a disk.' },
      { run: 'cat /run/sshd.pid', d: 'Read the process id of a running service.' },
      { run: 'ls -l /var/run', d: 'Show that the old name is now a link to /run.' },
      { run: 'ls /run/user/$(id -u)', d: 'List your own runtime directory.' },
    ],
    care: [
      {
        t: 'Do not store anything here',
        d: 'Whatever is placed in /run is gone after a reboot. It is for programs’ working state, not for files you want to keep.',
      },
      {
        t: 'A socket is a way in',
        d: 'Anyone who can write to docker.sock can control Docker, and through it the whole machine. Check who is allowed to reach each socket.',
      },
    ],
    related: ['proc', 'tmp', 'var'],
    footnote: 'What appears in /run depends on which services are running. Docker’s socket is present only where Docker is installed.',
  },

  /* ── scratch space and mount points ────────────────────────────────────── */
  {
    slug: 'tmp',
    path: '/tmp',
    group: 'scratch',
    sub: 'temporary files',
    fn: 'Temporary files. Any user may write here; nothing is expected to last.',
    lede: [
      { i: '/tmp is shared scratch space.' },
      ' Programs put files here that they need for a moment — ',
      { a: 'a download half-finished, an archive being unpacked' },
      '. Every user can write to it, and ',
      { b: 'the system is free to empty it.' },
    ],
    takeaway: ['Use it freely. ', { a: 'Do not expect to find it again.' }],
    points: [
      { k: 'Holds', v: 'Temporary files', note: 'From any user or program' },
      { k: 'On disk', v: 'Depends', note: 'In memory on some distributions' },
      { k: 'Who writes', v: 'Everyone', note: 'Mode 1777, with the sticky bit' },
      { k: 'Cleared', v: 'Automatically', note: 'At boot, or after some days' },
    ],
    why: [
      {
        t: 'A place anyone may write',
        d: 'A program should not need special rights just to save a working file. /tmp is the one directory on the system open to every user for that.',
      },
      {
        t: 'The sticky bit keeps it safe to share',
        d: 'Although everyone can write here, the sticky bit means a file can be deleted only by its owner or root. One user cannot remove another’s files.',
      },
    ],
    inside: [
      { name: 'systemd-private-…', kind: 'dir', d: 'A private temporary directory that systemd gives to one service.' },
      { name: '.X11-unix', kind: 'dir', d: 'Sockets used by the graphical display.' },
      { name: 'tmp.Xa4kQ9', kind: 'file', d: 'A file created by mktemp, with a random name.' },
      { name: 'ssh-XXXXXX', kind: 'dir', d: 'An SSH agent’s socket, for the length of a session.' },
    ],
    recipes: [
      { run: 'ls -ld /tmp', d: 'Show the permissions: drwxrwxrwt. The final t is the sticky bit.' },
      { run: 'mktemp', d: 'Create a temporary file with a name nobody can guess, and print the name.' },
      { run: 'mktemp -d', d: 'The same, for a temporary directory.' },
      { run: 'df -h /tmp', d: 'See whether /tmp is on a disk or held in memory.' },
    ],
    care: [
      {
        t: 'Never use a predictable name',
        d: 'A script that writes to /tmp/output can be tricked by another user who creates that name first, as a link to a file they want overwritten. Use mktemp.',
      },
      {
        t: 'It is where intruders unpack',
        d: 'Because anyone can write here, tools dropped by an attacker often land in /tmp or /dev/shm. Unexpected executables in either deserve a look.',
      },
      {
        t: 'For files that must last, use /var/tmp',
        d: '/var/tmp is kept across reboots and cleaned less often. /tmp may be emptied without warning.',
      },
    ],
    related: ['var', 'run', 'home'],
    footnote: 'How and when /tmp is cleaned is set by the distribution — commonly by systemd-tmpfiles.',
  },
  {
    slug: 'mnt',
    path: '/mnt',
    group: 'scratch',
    sub: 'a place to mount by hand',
    fn: 'An empty directory where an administrator attaches a filesystem by hand.',
    lede: [
      { i: '/mnt is a spare attachment point.' },
      ' To use a disk, Linux mounts it onto a directory, and the disk’s contents then appear there. ',
      { a: '/mnt is the conventional place to do that temporarily' },
      ' — ',
      { b: 'for a backup drive, a network share, or a disk being repaired.' },
    ],
    takeaway: ['A disk has no letter. ', { a: 'It appears wherever you mount it.' }],
    points: [
      { k: 'Holds', v: 'Nothing, until used', note: 'An empty directory by default' },
      { k: 'On disk', v: 'Yes', note: 'What is mounted on it is elsewhere' },
      { k: 'Who mounts', v: 'root', note: 'With the mount command' },
      { k: 'Name', v: 'Mount', note: 'Attach a filesystem to the tree' },
    ],
    why: [
      {
        t: 'Mounting needs a directory',
        d: 'A filesystem can be mounted on any directory, but it hides whatever was there before. A directory kept empty for the purpose avoids surprises.',
      },
      {
        t: 'Temporary, and by hand',
        d: '/mnt is for mounts the administrator makes for a task and then removes. Mounts that should return at every boot are listed in /etc/fstab instead.',
      },
    ],
    inside: [
      { name: 'backup', kind: 'dir', d: 'A directory made to mount a backup disk on.' },
      { name: 'usb', kind: 'dir', d: 'A directory made to mount a USB stick on.' },
      { name: 'c', kind: 'dir', d: 'Under WSL, the Windows C: drive appears here.' },
      { name: 'nfs', kind: 'dir', d: 'A directory made to mount a network share on.' },
    ],
    recipes: [
      { run: 'sudo mount /dev/sdb1 /mnt', d: 'Attach a partition. Its files now appear under /mnt.' },
      { run: 'sudo umount /mnt', d: 'Detach it. Do this before unplugging the disk.' },
      { run: 'findmnt /mnt', d: 'Show what, if anything, is mounted there.' },
      { run: 'sudo mkdir /mnt/backup', d: 'Make a sub-directory, so several things can be mounted at once.' },
    ],
    care: [
      {
        t: 'Unmount before you unplug',
        d: 'Data waiting to be written is lost if a disk is pulled while mounted. umount finishes the writes; it reports “target is busy” if a program is still using the disk.',
      },
      {
        t: 'Check the mount is really there',
        d: 'If a mount failed, a backup script writing to /mnt/backup fills the root filesystem instead. Scripts should test with findmnt or mountpoint first.',
      },
    ],
    related: ['media', 'dev', 'etc'],
    footnote: 'The directory names inside /mnt are whatever the administrator creates. sdb1 is an example device.',
  },
  {
    slug: 'media',
    path: '/media',
    group: 'scratch',
    sub: 'removable media',
    fn: 'Where removable media — USB sticks, SD cards, discs — is attached automatically.',
    lede: [
      { i: '/media is where removable devices show up.' },
      ' Plug in a USB stick on a desktop system, and ',
      { a: 'it is mounted here automatically, under your user name' },
      '. It does the same job as /mnt, but ',
      { b: 'the system does the mounting rather than you.' },
    ],
    takeaway: ['/mnt is mounted by hand. ', { a: '/media is mounted for you.' }],
    points: [
      { k: 'Holds', v: 'Removable media', note: 'USB sticks, SD cards, optical discs' },
      { k: 'On disk', v: 'Yes', note: 'Empty until something is plugged in' },
      { k: 'Who mounts', v: 'The desktop', note: 'Through udisks, without sudo' },
      { k: 'Layout', v: '/media/user/label', note: 'Named by user and volume label' },
    ],
    why: [
      {
        t: 'Plug in and it works',
        d: 'A desktop user should not need root or a mount command to read a USB stick. The system mounts it under /media on their behalf.',
      },
      {
        t: 'Kept apart from manual mounts',
        d: 'Automatic mounts come and go on their own. Keeping them out of /mnt means they never collide with what an administrator has mounted there.',
      },
    ],
    inside: [
      { name: 'user', kind: 'dir', d: 'A directory per logged-in user, holding their mounted devices.' },
      { name: 'user/USB-DRIVE', kind: 'dir', d: 'A USB stick, named after its volume label.' },
      { name: 'user/3A7F-12C4', kind: 'dir', d: 'A device with no label, named by its filesystem id.' },
      { name: 'cdrom', kind: 'dir', d: 'An optical drive, on systems that have one.' },
    ],
    recipes: [
      { run: 'ls /media/$USER', d: 'List the removable devices mounted for you.' },
      { run: 'lsblk -f', d: 'List every disk with its filesystem, label and mount point.' },
      { run: 'udisksctl unmount -b /dev/sdb1', d: 'Unmount a removable device without sudo.' },
      { run: 'df -h /media/$USER/*', d: 'Show the size and free space of each mounted device.' },
    ],
    care: [
      {
        t: 'Eject before removing',
        d: 'As with any mount, writes may still be pending. Use the eject button or unmount from the terminal before pulling the device out.',
      },
      {
        t: 'Unknown USB sticks are a risk',
        d: 'A device that looks like storage may act as a keyboard and type commands, and files on it may be malicious. Servers often disable automatic mounting altogether.',
      },
    ],
    related: ['mnt', 'dev', 'home'],
    footnote: 'Fedora-family systems mount removable media under /run/media rather than /media.',
  },
];

export const treeGroupById: Record<string, TreeGroup> = Object.fromEntries(
  treeGroups.map((group) => [group.id, group]),
);

export const linuxDirBySlug: Record<string, LinuxDir> = Object.fromEntries(
  linuxDirs.map((dir) => [dir.slug, dir]),
);

/** the directories under each group, in tree order */
export const dirsByGroup = treeGroups.map((group) => ({
  ...group,
  dirs: linuxDirs.filter((dir) => dir.group === group.id),
}));

export function linuxDirHref(dir: Pick<LinuxDir, 'slug'>) {
  return `${LINUX_HREF}/tree/${dir.slug}`;
}

export function linuxDirNeighbours(slug: string) {
  const index = linuxDirs.findIndex((dir) => dir.slug === slug);
  return {
    prev: index > 0 ? linuxDirs[index - 1] : undefined,
    next: index >= 0 && index < linuxDirs.length - 1 ? linuxDirs[index + 1] : undefined,
  };
}
