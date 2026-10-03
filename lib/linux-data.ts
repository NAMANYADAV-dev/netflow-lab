import type { Rich } from '@/components/RichText';
import { LINUX_HREF } from './atlas-data';

/* The Linux section, in two parts: the shell — moving around, managing files,
   processes and permissions — and then the network, the commands that show a
   protocol at work on a real host.

   Each entry is one command and one captured session. The session is the
   point of the page — the reader is shown the output they will actually get,
   and the lines worth reading carry a number that the notes underneath answer.

   Every address in a session is from a range reserved for documentation or
   private use (192.0.2.0/24, 198.51.100.0/24, 192.168.0.0/16), so nothing here
   points at a host that exists. */

export type LinuxPartId = 'shell' | 'network';

export const linuxParts: { id: LinuxPartId; name: string; note: string }[] = [
  { id: 'shell', name: 'The shell', note: 'Moving around, and managing files, processes and permissions.' },
  { id: 'network', name: 'The network', note: 'The commands that show a protocol at work.' },
];

export type LinuxGroup = { id: string; part: LinuxPartId; name: string; blurb: string };

export const linuxGroups: LinuxGroup[] = [
  { id: 'nav', part: 'shell', name: 'Navigation', blurb: 'Where you are, what is here, and how to get somewhere else.' },
  { id: 'files', part: 'shell', name: 'File management', blurb: 'Making, copying, moving and removing files and directories.' },
  { id: 'proc', part: 'shell', name: 'Process & service management', blurb: 'What is running, how to stop it, and what starts at boot.' },
  { id: 'perm', part: 'shell', name: 'Users & permissions', blurb: 'Who owns a file, who may touch it, and how to act as root.' },
  { id: 'iface', part: 'network', name: 'Interfaces & addressing', blurb: 'What the host has plugged in, and what it calls itself.' },
  { id: 'route', part: 'network', name: 'Routing & neighbours', blurb: 'Where a packet goes next, and whose MAC that is.' },
  { id: 'names', part: 'network', name: 'Names', blurb: 'Asking the DNS, and finding out who the host asks.' },
  { id: 'sockets', part: 'network', name: 'Sockets & transfer', blurb: 'What is listening, and what a request really sends.' },
  { id: 'reach', part: 'network', name: 'Reachability', blurb: 'Whether the other end answers, and by which path.' },
  { id: 'capture', part: 'network', name: 'Capture & filtering', blurb: 'Reading packets off the wire, and deciding which may pass.' },
];

export type TermLine = {
  text: string;
  /** the 1-based note this line is answered by */
  n?: number;
  /** a further command typed at the prompt, rather than output */
  run?: boolean;
};

export type LinuxCommand = {
  slug: string;
  /** the command as it is typed — the page title */
  cmd: string;
  group: string;
  /** the package that ships it */
  pkg: string;
  fn: string;
  kicker: string;
  sub: string;
  lede: Rich;
  takeaway: Rich;
  points: { k: string; v: string; note: string }[];
  session: {
    /** the full line typed at the prompt */
    run: string;
    /** `#` when the command needs root, `$` otherwise */
    prompt: '$' | '#';
    lines: TermLine[];
    notes: { t: string; d: string }[];
  };
  recipes: { run: string; d: string }[];
  security: { lede: Rich; points: { t: string; d: string }[] };
  /** protocol ids from protocol-data — the protocols this command shows;
      empty for the shell commands, which show none */
  protocols: string[];
  /** slugs of the commands worth reading next */
  related: string[];
  footnote: string;
};

export const linuxCommands: LinuxCommand[] = [
  // ── navigation ────────────────────────────────────────────────────────
  {
    slug: 'pwd',
    cmd: 'pwd',
    group: 'nav',
    pkg: 'shell builtin',
    fn: 'Prints the absolute path of the directory the shell is working in right now.',
    kicker: 'Linux · navigation',
    sub: 'where am I',
    lede: [
      { m: 'pwd' },
      ' prints the working directory: ',
      { a: 'the one place every relative path is measured from' },
      '. It is the smallest command in the shell and the first one to run when a script or a copy ',
      { b: 'lands somewhere you did not expect' },
      '.',
    ],
    takeaway: [
      'Every relative path is ',
      { a: 'relative to this directory' },
      ' — so know it before you type one.',
    ],
    points: [
      { k: 'Prints', v: 'Working directory', note: 'always an absolute path' },
      { k: 'Stands for', v: 'Print working directory', note: 'no arguments needed' },
      { k: 'Also held in', v: '$PWD', note: 'the shell keeps it updated' },
      { k: 'Needs root', v: 'Never', note: 'it only reads' },
    ],
    session: {
      run: 'pwd',
      prompt: '$',
      lines: [
        { text: '/home/user/projects/netflow', n: 1 },
        { text: 'cd /var/www/current', run: true },
        { text: 'pwd', run: true },
        { text: '/var/www/current', n: 2 },
        { text: 'pwd -P', run: true },
        { text: '/var/www/releases/2026-09-30', n: 3 },
      ],
      notes: [
        { t: 'The path starts at the root', d: 'The leading slash is the top of the filesystem. Read left to right, each name is a directory inside the one before it.' },
        { t: 'This is the logical path', d: 'The shell reports the names you travelled through. "current" is a symbolic link, and pwd shows it as you typed it.' },
        { t: '-P shows where you physically are', d: 'With the link resolved, the real directory is a dated release folder. The two answers differ only when a symlink is in the path.' },
      ],
    },
    recipes: [
      { run: 'echo $PWD', d: 'The same answer from the shell variable — the form to use inside scripts.' },
      { run: 'pwd -P', d: 'Resolves every symbolic link and prints the physical directory.' },
      { run: 'cd "$(dirname "$0")" && pwd', d: 'Inside a script: move to the script\'s own folder and confirm it, so relative paths behave.' },
      { run: 'echo $OLDPWD', d: 'The directory you were in before the last cd.' },
    ],
    security: {
      lede: [
        'A command does what it does ',
        { b: 'wherever the shell happens to be' },
        '. Most accidents with destructive commands are a correct command run in the wrong directory.',
      ],
      points: [
        { t: 'Check before deleting', d: 'Run pwd before any rm or mv that uses a relative path or a wildcard. It costs one second.' },
        { t: 'Symlinked directories', d: 'A logical path can hide that you are really inside another filesystem or another user\'s tree. -P shows the truth.' },
        { t: 'Scripts and cron', d: 'A scheduled job does not start where you tested it. Set the directory explicitly rather than assuming it.' },
      ],
    },
    protocols: [],
    related: ['cd', 'ls'],
    footnote: 'pwd is built into the shell; /usr/bin/pwd also exists and behaves the same for everyday use.',
  },
  {
    slug: 'ls',
    cmd: 'ls',
    group: 'nav',
    pkg: 'coreutils',
    fn: 'Lists the contents of a directory — names, and with -l the type, permissions, owner, size and date of each entry.',
    kicker: 'Linux · navigation',
    sub: 'what is in here',
    lede: [
      { m: 'ls' },
      ' lists a directory. On its own it prints names; with ',
      { m: '-l' },
      ' it prints ',
      { a: 'one line of facts per entry' },
      ' — what kind of thing it is, who may do what to it, who owns it, how big it is and when it last changed. That long line is ',
      { b: 'the most-read output on any Linux system' },
      '.',
    ],
    takeaway: [
      'The first ten characters of an ls -l line say ',
      { a: 'what the entry is and who may touch it' },
      '.',
    ],
    points: [
      { k: 'Lists', v: 'Directory entries', note: 'the current one by default' },
      { k: 'Everyday flags', v: '-la', note: 'long format, hidden files too' },
      { k: 'Hidden means', v: 'Starts with a dot', note: 'a naming habit, not a lock' },
      { k: 'Readable sizes', v: '-h', note: 'K, M and G instead of bytes' },
    ],
    session: {
      run: 'ls -la',
      prompt: '$',
      lines: [
        { text: 'total 24' },
        { text: 'drwxr-xr-x  4 user user 4096 Sep 30 10:12 .', n: 1 },
        { text: 'drwxr-xr-x 18 user user 4096 Sep 28 09:40 ..' },
        { text: '-rwxr-xr-x  1 user user 1830 Sep 29 17:03 deploy.sh', n: 2 },
        { text: '-rw-------  1 user user  412 Sep 30 10:12 .env', n: 3 },
        { text: 'drwxr-xr-x  8 user user 4096 Sep 30 09:58 .git' },
        { text: 'lrwxrwxrwx  1 user user   12 Sep 29 17:05 logs -> /var/log/app', n: 4 },
        { text: '-rw-r--r--  1 user user 2264 Sep 30 10:02 README.md', n: 5 },
      ],
      notes: [
        { t: 'The first character is the type', d: '"d" is a directory, "-" a regular file, "l" a symbolic link. The dot is this directory itself, and the two dots below it are its parent.' },
        { t: 'Then three groups of three', d: 'rwx for the owner, r-x for the group, r-x for everyone else. The x on a file means it may be run as a program.' },
        { t: 'Dotfiles only appear with -a', d: '.env is hidden from a plain ls. Its rw------- mode means only the owner can read or write it — right for a file of secrets.' },
        { t: 'The arrow marks a symbolic link', d: 'logs is a pointer to /var/log/app. Its own permissions are always shown as rwxrwxrwx; the target\'s are what count.' },
        { t: 'The rest of the line, left to right', d: 'Link count, owner, group, size in bytes, the time the content last changed, and the name.' },
      ],
    },
    recipes: [
      { run: 'ls -lh /var/log', d: 'Long listing of another directory with sizes in K, M and G.' },
      { run: 'ls -lt | head', d: 'Newest first — the quickest way to see what just changed.' },
      { run: 'ls -ld /etc/ssh', d: 'Describes the directory itself rather than listing what is inside it.' },
      { run: 'ls -R src', d: 'Lists every subdirectory beneath src as well.' },
    ],
    security: {
      lede: [
        'An ls -l line is ',
        { b: 'a permission audit of one file' },
        '. Reading it properly finds most local misconfigurations before an attacker does.',
      ],
      points: [
        { t: 'World-writable entries', d: 'A "w" in the last group of three lets any user on the system change the file. On a script that root runs, that is a way to become root.' },
        { t: 'Secrets left readable', d: 'Keys, .env files and backups should show rw------- or stricter. An r in the last group publishes them to every local user.' },
        { t: 'Hidden is not protected', d: 'A leading dot only hides a name from a casual listing. Always look with -a, especially in web roots and home directories.' },
      ],
    },
    protocols: [],
    related: ['cd', 'chmod'],
    footnote: 'Sort order follows the system locale, which usually ignores leading dots and letter case.',
  },
  {
    slug: 'cd',
    cmd: 'cd',
    group: 'nav',
    pkg: 'shell builtin',
    fn: 'Changes the shell\'s working directory, by absolute path, by relative path, or by one of its shortcuts.',
    kicker: 'Linux · navigation',
    sub: 'going somewhere else',
    lede: [
      { m: 'cd' },
      ' moves the shell to another directory. It takes ',
      { a: 'an absolute path, which starts at the root' },
      ', or a relative one, which starts from where you are. It prints nothing when it works — ',
      { b: 'silence is success' },
      ', as with most Unix commands.',
    ],
    takeaway: [
      'A path that begins with a slash means the same thing everywhere. One that does not ',
      { a: 'depends on where you are standing' },
      '.',
    ],
    points: [
      { k: 'Changes', v: 'Working directory', note: 'for this shell only' },
      { k: 'No argument', v: 'Goes home', note: 'the same as cd ~' },
      { k: 'Up one level', v: 'cd ..', note: 'two dots are the parent' },
      { k: 'Back again', v: 'cd -', note: 'the previous directory' },
    ],
    session: {
      run: 'cd /var/log',
      prompt: '$',
      lines: [
        { text: 'pwd', run: true },
        { text: '/var/log', n: 1 },
        { text: 'cd nginx', run: true, n: 2 },
        { text: 'cd ..', run: true, n: 3 },
        { text: 'cd -', run: true },
        { text: '/var/log/nginx', n: 4 },
        { text: 'cd', run: true, n: 5 },
        { text: 'pwd', run: true },
        { text: '/home/user' },
      ],
      notes: [
        { t: 'An absolute path works from anywhere', d: '/var/log begins at the root, so it names the same directory no matter where the shell was.' },
        { t: 'A relative path starts from here', d: 'No leading slash: "nginx" is looked for inside the current directory, giving /var/log/nginx.' },
        { t: 'Two dots are the parent', d: 'Every directory contains an entry called ".." that points one level up. This returns to /var/log.' },
        { t: 'A dash is "where I just was"', d: 'cd - swaps back to the previous directory and prints it, so you can flip between two places.' },
        { t: 'Nothing at all means home', d: 'cd with no argument goes to your home directory. The tilde, ~, is shorthand for the same place.' },
      ],
    },
    recipes: [
      { run: 'cd ~/projects', d: 'The tilde expands to your home directory, so this works from anywhere.' },
      { run: 'cd ../..', d: 'Up two levels in one step.' },
      { run: 'cd "My Documents"', d: 'Quote a name that contains spaces, or the shell reads it as two arguments.' },
      { run: 'pushd /etc && popd', d: 'Remembers where you were on a stack and returns to it — handy when hopping between several places.' },
    ],
    security: {
      lede: [
        'To enter a directory you need ',
        { b: 'the execute bit on it' },
        ', not the read bit — a detail that explains most "Permission denied" answers from cd.',
      ],
      points: [
        { t: 'x on a directory means "may enter"', d: 'Without it nobody can cd in or reach anything beneath, whatever the files\' own permissions say.' },
        { t: 'Check that cd worked', d: 'In a script, "cd build; rm -rf *" deletes the wrong directory if cd failed. Write "cd build && …" or stop on error.' },
        { t: 'Path traversal', d: 'The same ".." that takes you up a level is how a careless web application is talked into reading files outside its folder.' },
      ],
    },
    protocols: [],
    related: ['pwd', 'ls'],
    footnote: 'cd is a shell builtin: it has to be, because a separate program could not change the shell\'s own directory.',
  },
  {
    slug: 'find',
    cmd: 'find',
    group: 'nav',
    pkg: 'findutils',
    fn: 'Walks a directory tree and prints every entry that passes the tests you give it — by name, age, size, owner or permissions.',
    kicker: 'Linux · navigation',
    sub: 'where is that file',
    lede: [
      { m: 'find' },
      ' starts at a directory and visits everything beneath it, printing ',
      { a: 'each entry that passes every test' },
      ' you list. Tests are joined by "and" unless you say otherwise, and a match can be ',
      { b: 'handed straight to another command' },
      ' with ',
      { m: '-exec' },
      '.',
    ],
    takeaway: [
      'find answers by ',
      { a: 'what a file is like' },
      ', not only by what it is called.',
    ],
    points: [
      { k: 'Shape', v: 'find WHERE TESTS', note: 'start point first, then tests' },
      { k: 'Searches', v: 'The live tree', note: 'no index, always current' },
      { k: 'Quote patterns', v: "'*.log'", note: 'or the shell expands them first' },
      { k: 'Act on matches', v: '-exec', note: 'or -delete, with care' },
    ],
    session: {
      run: "find /var/log -name '*.log' -mtime -1 -size +1M",
      prompt: '$',
      lines: [
        { text: '/var/log/nginx/access.log', n: 1 },
        { text: '/var/log/app/worker.log', n: 2 },
        { text: "find: '/var/log/private': Permission denied", n: 3 },
      ],
      notes: [
        { t: 'Every match is printed as a path', d: 'The path begins with the starting point you gave, so results can be pasted straight into another command.' },
        { t: 'All three tests had to pass', d: 'The name ends in .log, the content changed within the last day, and the file is larger than one mebibyte. Tests are "and" by default.' },
        { t: 'Errors arrive mixed in', d: 'find could not enter a directory it has no rights to. Add 2>/dev/null to hide these, or run it with sudo to search there too.' },
      ],
    },
    recipes: [
      { run: 'find . -type d -name node_modules', d: 'Only directories with that exact name, starting from here.' },
      { run: "find . -name '*.tmp' -delete", d: 'Deletes every match. Run it once without -delete first and read the list.' },
      { run: "find . -name '*.sh' -exec chmod +x {} +", d: 'Runs a command on the matches; {} is replaced by the file names.' },
      { run: 'find /home -user asha -newer /tmp/mark', d: 'Files owned by one user that changed after a reference file did.' },
    ],
    security: {
      lede: [
        'find is the standard audit tool for a filesystem: it can list ',
        { b: 'every file with a dangerous permission' },
        ' in a single line.',
      ],
      points: [
        { t: 'Set-uid programs', d: '"find / -perm -4000 -type f" lists every program that runs as its owner. Each one outside the usual set deserves an explanation.' },
        { t: 'World-writable files', d: '"find / -xdev -perm -0002 -type f" finds files any user may modify — a common route to privilege escalation.' },
        { t: '-delete and -exec are final', d: 'A wrong test deletes the wrong thousand files. Always print first, then add the action.' },
      ],
    },
    protocols: [],
    related: ['ls', 'rm'],
    footnote: 'find reads the directory tree every time. For a quick name-only search of an indexed system, locate is faster.',
  },

  // ── file management ───────────────────────────────────────────────────
  {
    slug: 'mkdir',
    cmd: 'mkdir',
    group: 'files',
    pkg: 'coreutils',
    fn: 'Creates directories — one at a time, or a whole nested path in a single step with -p.',
    kicker: 'Linux · file management',
    sub: 'making room',
    lede: [
      { m: 'mkdir' },
      ' creates a directory. By default the parent has to exist already and the name must be free; ',
      { m: '-p' },
      ' removes both conditions, ',
      { a: 'creating every missing level' },
      ' and staying quiet if the directory is already there — which is why ',
      { b: 'scripts almost always use it' },
      '.',
    ],
    takeaway: [
      'mkdir -p means ',
      { a: '"make sure this path exists"' },
      ' — safe to run once or a hundred times.',
    ],
    points: [
      { k: 'Creates', v: 'Directories', note: 'empty ones' },
      { k: 'Nested paths', v: '-p', note: 'parents made as needed' },
      { k: 'Default mode', v: '755', note: '777 minus the umask of 022' },
      { k: 'Opposite', v: 'rmdir', note: 'removes an empty directory' },
    ],
    session: {
      run: 'mkdir -p site/assets/img',
      prompt: '$',
      lines: [
        { text: 'mkdir site', run: true },
        { text: "mkdir: cannot create directory 'site': File exists", n: 1 },
        { text: 'ls -ld site', run: true },
        { text: 'drwxr-xr-x 3 user user 4096 Sep 30 10:20 site', n: 2 },
        { text: 'mkdir -m 700 site/private', run: true, n: 3 },
        { text: 'ls -ld site/private', run: true },
        { text: 'drwx------ 2 user user 4096 Sep 30 10:21 site/private', n: 4 },
      ],
      notes: [
        { t: 'Without -p, an existing name is an error', d: 'The first command already created site, assets and img in one go and printed nothing. Asking again without -p fails.' },
        { t: 'The mode comes from the umask', d: 'A new directory asks for rwxrwxrwx and the umask of 022 removes write for group and others, leaving rwxr-xr-x.' },
        { t: '-m sets the permissions at creation', d: 'The directory never exists with looser permissions, even for a moment — better than mkdir followed by chmod.' },
        { t: 'Only the owner may enter', d: 'drwx------ shuts out the group and everyone else entirely.' },
      ],
    },
    recipes: [
      { run: 'mkdir -p logs/{app,nginx,db}', d: 'Brace expansion: three subdirectories in one command.' },
      { run: 'mkdir -pv a/b/c', d: 'Prints a line for each directory it actually had to create.' },
      { run: 'mkdir -m 700 ~/.ssh', d: 'The mode SSH insists on for its configuration directory.' },
      { run: 'rmdir empty-dir', d: 'Removes a directory only if nothing is inside it — a safe way to tidy up.' },
    ],
    security: {
      lede: [
        'A directory\'s permissions decide ',
        { b: 'who can create, rename and delete the files in it' },
        ' — regardless of what the files themselves allow.',
      ],
      points: [
        { t: 'Write on a directory is powerful', d: 'Anyone with write permission on a directory can delete or replace files in it, even files they cannot read.' },
        { t: 'Create it private', d: 'For anything sensitive use -m 700 at creation. Tightening afterwards leaves a window where it was open.' },
        { t: 'Shared temp directories', d: 'A predictable directory name under /tmp can be created first by another user. Use mktemp -d instead.' },
      ],
    },
    protocols: [],
    related: ['cp', 'chmod'],
    footnote: 'The default mode depends on the umask, which is 022 on most systems and 077 on hardened ones.',
  },
  {
    slug: 'cp',
    cmd: 'cp',
    group: 'files',
    pkg: 'coreutils',
    fn: 'Copies files and directories, optionally preserving their permissions, ownership and timestamps.',
    kicker: 'Linux · file management',
    sub: 'a second copy',
    lede: [
      { m: 'cp' },
      ' copies a source to a destination. For a directory it needs to be told to recurse, and the flag worth learning is ',
      { m: '-a' },
      ': it recurses and ',
      { a: 'keeps permissions, ownership, timestamps and links exactly as they were' },
      '. By default cp will ',
      { b: 'overwrite an existing file without asking' },
      '.',
    ],
    takeaway: [
      'A copy is only a backup if it keeps ',
      { a: 'the metadata as well as the bytes' },
      ' — that is what -a is for.',
    ],
    points: [
      { k: 'Shape', v: 'cp SOURCE DEST', note: 'last argument is the target' },
      { k: 'Directories', v: '-r or -a', note: '-a also preserves metadata' },
      { k: 'Overwrites', v: 'Silently', note: 'use -i to be asked' },
      { k: 'See progress', v: '-v', note: 'one line per file copied' },
    ],
    session: {
      run: 'cp -av config/ config.bak/',
      prompt: '$',
      lines: [
        { text: "'config/' -> 'config.bak/'", n: 1 },
        { text: "'config/app.yaml' -> 'config.bak/app.yaml'", n: 2 },
        { text: "'config/tls' -> 'config.bak/tls'" },
        { text: "'config/tls/server.key' -> 'config.bak/tls/server.key'", n: 3 },
        { text: 'ls -l config.bak/tls/server.key', run: true },
        { text: '-rw------- 1 user user 1704 Sep 12 08:15 config.bak/tls/server.key', n: 4 },
      ],
      notes: [
        { t: 'The directory itself is created first', d: 'config.bak did not exist, so it became the copy. Had it existed, the copy would have landed inside it as config.bak/config.' },
        { t: '-v narrates every file', d: 'Source on the left, destination on the right. Without -v a successful cp prints nothing at all.' },
        { t: '-a went down into the subdirectory', d: 'Archive mode implies recursion, so the tls folder and the key inside it came along.' },
        { t: 'The copy kept its date and mode', d: 'Still rw------- and still dated the twelfth. A plain cp -r would have stamped it with today\'s time.' },
      ],
    },
    recipes: [
      { run: 'cp -i notes.txt backup/', d: 'Asks before overwriting a file of the same name.' },
      { run: 'cp -u *.conf /etc/app/', d: 'Copies only files that are newer than the copy already there.' },
      { run: 'cp file{,.bak}', d: 'Brace expansion for "cp file file.bak" — the quickest backup before an edit.' },
      { run: 'cp -a /src/. /dest/', d: 'Copies the contents of a directory, hidden files included, into an existing one.' },
    ],
    security: {
      lede: [
        'Copying a file can quietly ',
        { b: 'change who owns it and who may read it' },
        ', which matters most for exactly the files worth copying.',
      ],
      points: [
        { t: 'Ownership changes hands', d: 'Without -a, the copy belongs to whoever ran cp. A root-made copy of a user\'s file is now root\'s; a user\'s copy of a readable secret is now theirs.' },
        { t: 'Backups of secrets', d: 'A .bak of a key or config file is as sensitive as the original. Check its mode and where it sits — especially inside a web root.' },
        { t: 'Silent overwrite', d: 'cp replaces the destination without warning. Use -i interactively and -n in scripts that must not clobber.' },
      ],
    },
    protocols: [],
    related: ['mv', 'rm'],
    footnote: 'For large or remote copies, rsync does the same job and can resume, verify and show progress.',
  },
  {
    slug: 'mv',
    cmd: 'mv',
    group: 'files',
    pkg: 'coreutils',
    fn: 'Moves a file or directory to another place, or gives it a new name — in Linux the two are the same operation.',
    kicker: 'Linux · file management',
    sub: 'move, which is also rename',
    lede: [
      { m: 'mv' },
      ' moves things, and there is no separate rename command because ',
      { a: 'renaming is moving to a new name in the same place' },
      '. Within one filesystem it is instant whatever the size; across two, it ',
      { b: 'copies the data and then deletes the original' },
      '.',
    ],
    takeaway: [
      'Inside one filesystem, mv changes ',
      { a: 'only the name the data is filed under' },
      ' — the data itself never moves.',
    ],
    points: [
      { k: 'Shape', v: 'mv SOURCE DEST', note: 'a new name or a directory' },
      { k: 'Renames', v: 'Yes', note: 'the same command' },
      { k: 'Overwrites', v: 'Silently', note: '-i asks, -n refuses' },
      { k: 'Directories', v: 'No flag needed', note: 'unlike cp and rm' },
    ],
    session: {
      run: 'mv -v report.txt archive/',
      prompt: '$',
      lines: [
        { text: "renamed 'report.txt' -> 'archive/report.txt'", n: 1 },
        { text: 'mv -v draft.md final.md', run: true },
        { text: "renamed 'draft.md' -> 'final.md'", n: 2 },
        { text: 'mv -n notes.txt archive/', run: true, n: 3 },
        { text: 'mv -v big.iso /mnt/usb/', run: true },
        { text: "copied 'big.iso' -> '/mnt/usb/big.iso'", n: 4 },
        { text: "removed 'big.iso'" },
      ],
      notes: [
        { t: 'The destination is a directory, so the file goes into it', d: 'The name is kept. mv calls it "renamed" because that is literally what happened to the path.' },
        { t: 'The destination is a new name, so it is a rename', d: 'Same directory, different name. Nothing was copied.' },
        { t: '-n refuses to overwrite', d: 'archive/notes.txt already existed, so mv did nothing and said nothing. Without -n it would have replaced it.' },
        { t: 'Across filesystems it is a copy and a delete', d: 'The USB stick is a different filesystem, so the data really had to travel. This is the slow case, and the one that can fail halfway.' },
      ],
    },
    recipes: [
      { run: 'mv -i *.log old/', d: 'Moves several files into a directory, asking before any overwrite.' },
      { run: 'mv old-name/ new-name/', d: 'Renames a directory — no recursive flag is needed.' },
      { run: 'mv -b config.yaml /etc/app/', d: 'Keeps a backup of any file it would have overwritten, with a ~ on the end.' },
      { run: 'mv -- -odd-name.txt fixed.txt', d: 'The double dash ends the options, so a name starting with a dash is treated as a file.' },
    ],
    security: {
      lede: [
        'mv has ',
        { b: 'no undo and no warning' },
        ' when the destination exists, and it carries a file\'s old permissions to its new home.',
      ],
      points: [
        { t: 'Overwriting is silent', d: 'Moving onto an existing name destroys what was there. -n in scripts and -i at the prompt are cheap insurance.' },
        { t: 'Permissions travel with the file', d: 'A file moved into a web root keeps the owner and mode it had before. Check them after the move, not before.' },
        { t: 'Replacing a file atomically', d: 'Writing a new version beside the old one and then mv-ing it over is the safe way to update a config: readers see the old file or the new, never half of each.' },
      ],
    },
    protocols: [],
    related: ['cp', 'rm'],
    footnote: 'A rename within one filesystem is atomic; a move between filesystems is not.',
  },
  {
    slug: 'rm',
    cmd: 'rm',
    group: 'files',
    pkg: 'coreutils',
    fn: 'Removes files, and with -r whole directory trees. There is no recycle bin: what it removes is gone.',
    kicker: 'Linux · file management',
    sub: 'gone means gone',
    lede: [
      { m: 'rm' },
      ' removes the names you give it. With ',
      { m: '-r' },
      ' it works down through a directory and removes everything inside. Nothing is moved to a trash folder — ',
      { a: 'the space is simply marked free' },
      ' — so the only real protection is ',
      { b: 'reading the command before pressing Enter' },
      '.',
    ],
    takeaway: [
      'rm does not ask, does not explain and does not keep a copy — ',
      { a: 'you are the confirmation step' },
      '.',
    ],
    points: [
      { k: 'Removes', v: 'Files', note: 'directories need -r' },
      { k: 'Undo', v: 'None', note: 'no trash, no history' },
      { k: 'Ask first', v: '-i', note: 'or -I for one question' },
      { k: 'Never prompt', v: '-f', note: 'also hides errors' },
    ],
    session: {
      run: 'rm -ri build/',
      prompt: '$',
      lines: [
        { text: "rm: descend into directory 'build/'? y", n: 1 },
        { text: "rm: remove regular file 'build/app.js'? y", n: 2 },
        { text: "rm: remove regular file 'build/app.css'? y" },
        { text: "rm: remove directory 'build/'? y", n: 3 },
        { text: 'ls build', run: true },
        { text: "ls: cannot access 'build': No such file or directory", n: 4 },
      ],
      notes: [
        { t: '-r lets rm go into a directory', d: 'Without it rm refuses directories altogether. The question appears because of -i.' },
        { t: '-i asks about every single file', d: 'Slow, but you see exactly what is about to go. -I asks once for the whole operation instead.' },
        { t: 'The directory goes last', d: 'It can only be removed once it is empty, so rm works from the inside out.' },
        { t: 'There is nothing to restore', d: 'The names are gone and no copy was kept. Recovery now means a backup or a snapshot.' },
      ],
    },
    recipes: [
      { run: 'rm -I *.log', d: 'One confirmation before removing more than three files — a sensible default to alias.' },
      { run: 'rm -rf node_modules', d: 'Removes a tree without asking and without complaining. The command to read twice.' },
      { run: 'rm -- -file.txt', d: 'Removes a file whose name starts with a dash.' },
      { run: 'ls *.tmp && rm *.tmp', d: 'List what the pattern matches first; remove only if the list is right.' },
    ],
    security: {
      lede: [
        'rm is where a small typing mistake becomes ',
        { b: 'a large and permanent one' },
        ' — and deleting a file is still not the same as destroying its contents.',
      ],
      points: [
        { t: 'A stray space', d: '"rm -rf /var/www /tmp" and "rm -rf /var/www/ tmp" differ by one space. An empty variable in "rm -rf $DIR/" is worse: it becomes "rm -rf /".' },
        { t: 'Deleted is not erased', d: 'rm frees the space but the data stays on the disk until overwritten. Sensitive files need shred or full-disk encryption.' },
        { t: 'Never as root by habit', d: 'A normal user can only delete their own files. The same command under sudo can delete the system.' },
      ],
    },
    protocols: [],
    related: ['mv', 'find'],
    footnote: 'GNU rm refuses to act on "/" itself by default, but not on "/*" — the safeguard is narrower than it sounds.',
  },

  // ── process & service management ──────────────────────────────────────
  {
    slug: 'ps',
    cmd: 'ps',
    group: 'proc',
    pkg: 'procps',
    fn: 'Takes a snapshot of the running processes — who owns each, its process ID, and how much CPU and memory it is using.',
    kicker: 'Linux · process & service management',
    sub: 'what is running',
    lede: [
      { m: 'ps' },
      ' prints a snapshot of the process table. ',
      { m: 'ps aux' },
      ' is the form to remember: ',
      { a: 'every process, from every user, with its owner and resource use' },
      '. The number in the PID column is ',
      { b: 'the handle every other management command needs' },
      '.',
    ],
    takeaway: [
      'Everything running on the machine is ',
      { a: 'a process with a number and an owner' },
      ' — and ps is the list.',
    ],
    points: [
      { k: 'Shows', v: 'A snapshot', note: 'not a live view — that is top' },
      { k: 'Everyday form', v: 'ps aux', note: 'all users, with details' },
      { k: 'Key column', v: 'PID', note: 'the process ID' },
      { k: 'Tree view', v: 'ps -ef --forest', note: 'who started what' },
    ],
    session: {
      run: 'ps aux --sort=-%mem | head -5',
      prompt: '$',
      lines: [
        { text: 'USER         PID %CPU %MEM     VSZ    RSS TTY      STAT START   TIME COMMAND', n: 1 },
        { text: 'mysql        934  1.2 11.4 1789432 462180 ?        Ssl  Sep28  41:07 /usr/sbin/mysqld', n: 2 },
        { text: 'user        4120  3.8  4.1 1104332 166924 pts/0    Sl+  09:58   0:42 node server.js', n: 3 },
        { text: 'root           1  0.0  0.3  168940  11560 ?        Ss   Sep28   0:14 /sbin/init', n: 4 },
        { text: 'root         801  0.0  0.2   15432   9120 ?        Ss   Sep28   0:00 sshd: /usr/sbin/sshd -D' },
      ],
      notes: [
        { t: 'RSS is the memory that matters', d: 'RSS is the physical memory in use, in kibibytes. VSZ is everything the process has reserved, most of which it may never touch.' },
        { t: 'A question mark means no terminal', d: 'mysqld is a daemon: nobody typed it into a shell. In STAT, S is sleeping, s a session leader and l multi-threaded.' },
        { t: 'pts/0 is somebody\'s terminal', d: 'This one was started by hand in a shell. The + in STAT says it is in the foreground of that terminal.' },
        { t: 'PID 1 is the first process', d: 'init — systemd on most systems — is started by the kernel and is the ancestor of everything else.' },
      ],
    },
    recipes: [
      { run: 'ps -ef --forest', d: 'Draws the parent-child tree, so you can see which process started which.' },
      { run: 'ps -u www-data', d: 'Only the processes owned by one user.' },
      { run: 'pgrep -a nginx', d: 'Finds processes by name and prints their PIDs — tidier than piping ps into grep.' },
      { run: 'top', d: 'The same table, refreshed live and sorted by CPU. Press q to leave.' },
    ],
    security: {
      lede: [
        'The process list is ',
        { b: 'the inventory of what the machine is actually doing' },
        ', and it is visible to every local user by default.',
      ],
      points: [
        { t: 'Secrets on the command line', d: 'Arguments appear in the COMMAND column for everyone to read. A password passed as a flag is a password published.' },
        { t: 'Processes that do not belong', d: 'An unfamiliar name, a binary running from /tmp, or a web-server user running a shell are all classic signs of a compromise.' },
        { t: 'Who it runs as', d: 'The USER column is the blast radius. A service that does not need root should not appear here as root.' },
      ],
    },
    protocols: [],
    related: ['kill', 'systemctl'],
    footnote: 'ps accepts both BSD-style options (aux) and Unix-style ones (-ef); the two families print different columns.',
  },
  {
    slug: 'kill',
    cmd: 'kill',
    group: 'proc',
    pkg: 'shell builtin',
    fn: 'Sends a signal to a process — by default a polite request to finish, and with -9 an order the process cannot refuse.',
    kicker: 'Linux · process & service management',
    sub: 'asking a process to stop',
    lede: [
      'Despite the name, ',
      { m: 'kill' },
      ' only ',
      { a: 'delivers a signal to a process ID' },
      '. The default, SIGTERM, asks the program to clean up and exit, and a well-written program does. SIGKILL is different: ',
      { b: 'the kernel removes the process without telling it' },
      ', so nothing gets saved or closed.',
    ],
    takeaway: [
      'Ask with ',
      { a: 'TERM first' },
      ', and reach for KILL only when asking has failed.',
    ],
    points: [
      { k: 'Sends', v: 'A signal', note: 'to one or more PIDs' },
      { k: 'Default', v: 'SIGTERM (15)', note: 'a request to exit cleanly' },
      { k: 'Last resort', v: 'SIGKILL (9)', note: 'cannot be caught or ignored' },
      { k: 'Allowed on', v: 'Your own processes', note: 'root may signal any' },
    ],
    session: {
      run: 'kill 4120',
      prompt: '$',
      lines: [
        { text: 'ps -p 4120', run: true },
        { text: '    PID TTY          TIME CMD', n: 1 },
        { text: 'kill 4188', run: true },
        { text: 'ps -p 4188', run: true },
        { text: '    PID TTY          TIME CMD' },
        { text: '   4188 pts/0    00:00:07 worker', n: 2 },
        { text: 'kill -9 4188', run: true, n: 3 },
        { text: 'kill -l | head -2', run: true },
        { text: ' 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL       5) SIGTRAP', n: 4 },
        { text: ' 6) SIGABRT      7) SIGBUS       8) SIGFPE       9) SIGKILL     10) SIGUSR1' },
      ],
      notes: [
        { t: 'A header and nothing else means it worked', d: 'kill printed nothing; ps finds no process 4120. The program received SIGTERM, shut down cleanly and exited.' },
        { t: 'This one ignored the request', d: 'Process 4188 is still listed after a plain kill. It is stuck, or it handles SIGTERM and chose to carry on.' },
        { t: '-9 is not a request', d: 'SIGKILL is acted on by the kernel, not the program. It always works, and the process gets no chance to flush files or release locks.' },
        { t: 'Signals have numbers and names', d: 'kill -l lists them. SIGHUP (1) traditionally means "reload your configuration"; SIGINT (2) is what Ctrl+C sends.' },
      ],
    },
    recipes: [
      { run: 'kill -HUP 1042', d: 'Asks a daemon to re-read its configuration without stopping.' },
      { run: 'pkill -f "node server.js"', d: 'Signals every process whose command line matches, without looking up PIDs.' },
      { run: 'kill -STOP 4120 && kill -CONT 4120', d: 'Freezes a process and later lets it continue.' },
      { run: 'kill -0 4120 && echo alive', d: 'Signal 0 sends nothing: it only tests whether the process exists and you may signal it.' },
    ],
    security: {
      lede: [
        'A signal is ',
        { b: 'the bluntest control there is over a running program' },
        ', which is why who may send one is tightly restricted.',
      ],
      points: [
        { t: '-9 can corrupt data', d: 'A database killed mid-write has no chance to finish. Use the service manager or SIGTERM and wait before escalating.' },
        { t: 'Killing security tooling', d: 'Stopping the logging or monitoring agent is an early step in many intrusions. Alert when those processes disappear.' },
        { t: 'PIDs are reused', d: 'A PID noted a minute ago may now belong to another process. Check with ps immediately before sending a signal as root.' },
      ],
    },
    protocols: [],
    related: ['ps', 'systemctl'],
    footnote: 'kill is a shell builtin with an identical /usr/bin/kill; killall and pkill select processes by name instead.',
  },
  {
    slug: 'systemctl',
    cmd: 'systemctl',
    group: 'proc',
    pkg: 'systemd',
    fn: 'Controls systemd services — start, stop, restart, enable at boot — and reports the state of each one.',
    kicker: 'Linux · process & service management',
    sub: 'running the services',
    lede: [
      { m: 'systemctl' },
      ' is how services are managed on a systemd machine. It keeps two things apart that are easy to confuse: ',
      { a: 'whether a service is running now' },
      ', and ',
      { b: 'whether it will be started at boot' },
      '. start and stop change the first; enable and disable change the second.',
    ],
    takeaway: [
      '"Active" is about ',
      { a: 'this moment' },
      '; "enabled" is about the next boot. A service can be either without the other.',
    ],
    points: [
      { k: 'Controls', v: 'systemd units', note: 'services, timers, mounts' },
      { k: 'Needs root', v: 'To change', note: 'status is unprivileged' },
      { k: 'Now', v: 'start / stop', note: 'restart, reload' },
      { k: 'At boot', v: 'enable / disable', note: '--now does both' },
    ],
    session: {
      run: 'systemctl status nginx',
      prompt: '$',
      lines: [
        { text: '● nginx.service - A high performance web server and a reverse proxy server' },
        { text: '     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; preset: enabled)', n: 1 },
        { text: '     Active: active (running) since Mon 2026-09-28 09:40:12 IST; 2 days ago', n: 2 },
        { text: '   Main PID: 1042 (nginx)', n: 3 },
        { text: '      Tasks: 2 (limit: 4601)' },
        { text: '     Memory: 6.8M' },
        { text: '     CGroup: /system.slice/nginx.service', n: 4 },
        { text: '             ├─1042 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"' },
        { text: '             └─1043 "nginx: worker process"' },
      ],
      notes: [
        { t: 'Loaded: where the unit is and whether it starts at boot', d: 'The path is the unit file systemd read. "enabled" means it will be started automatically on the next boot.' },
        { t: 'Active: what is true right now', d: 'Running, and for how long. A service that crashed reads "failed" here, with the exit code beside it.' },
        { t: 'Main PID is the process systemd watches', d: 'If this process exits, systemd considers the service stopped and applies its restart policy.' },
        { t: 'The control group is the whole service', d: 'Every process the service started is listed, so nothing is left behind when it is stopped.' },
      ],
    },
    recipes: [
      { run: 'sudo systemctl restart nginx', d: 'Stops and starts the service. "reload" re-reads the configuration without dropping connections, where the service supports it.' },
      { run: 'sudo systemctl enable --now nginx', d: 'Starts it now and sets it to start at every boot, in one step.' },
      { run: 'systemctl --failed', d: 'Lists every unit that is in a failed state — the first thing to check after a reboot.' },
      { run: 'journalctl -u nginx -n 50', d: 'The last fifty log lines the service wrote — where the reason for a failure usually is.' },
    ],
    security: {
      lede: [
        'Every enabled service is ',
        { b: 'code that starts by itself and keeps running' },
        '. The list of them is the machine\'s standing attack surface.',
      ],
      points: [
        { t: 'Disable what you do not use', d: 'A stopped service comes back at reboot unless it is also disabled. "systemctl list-unit-files --state=enabled" is the list to prune.' },
        { t: 'Persistence', d: 'A new unit file is a favourite way for an intruder to survive a reboot. Unfamiliar entries under /etc/systemd/system deserve a close look.' },
        { t: 'Run as less than root', d: 'A unit can set User=, and sandboxing options such as ProtectSystem= and NoNewPrivileges= limit what a compromised service can reach.' },
      ],
    },
    protocols: [],
    related: ['ps', 'sudo'],
    footnote: 'Applies to systemd distributions, which is nearly all of them; older systems use "service" and init scripts.',
  },

  // ── users & permissions ───────────────────────────────────────────────
  {
    slug: 'chmod',
    cmd: 'chmod',
    group: 'perm',
    pkg: 'coreutils',
    fn: 'Changes the permission bits on a file or directory — who may read it, write to it, and execute it.',
    kicker: 'Linux · users & permissions',
    sub: 'who may do what',
    lede: [
      { m: 'chmod' },
      ' sets the mode of a file: read, write and execute, ',
      { a: 'once each for the owner, the group and everyone else' },
      '. It takes the mode as three octal digits, or as letters that ',
      { b: 'change only the bits you name' },
      ' and leave the rest alone.',
    ],
    takeaway: [
      'Each digit is a sum — ',
      { a: 'read 4, write 2, execute 1' },
      ' — so 640 is "owner reads and writes, group reads, others nothing".',
    ],
    points: [
      { k: 'Changes', v: 'The mode bits', note: 'rwx for user, group, other' },
      { k: 'Octal form', v: '644, 755, 600', note: 'sets all nine bits at once' },
      { k: 'Symbolic form', v: 'u+x, go-w', note: 'adjusts only what is named' },
      { k: 'Allowed for', v: 'The owner', note: 'and root' },
    ],
    session: {
      run: 'chmod 640 secrets.env',
      prompt: '$',
      lines: [
        { text: 'ls -l secrets.env', run: true },
        { text: '-rw-r----- 1 user www-data 412 Sep 30 10:12 secrets.env', n: 1 },
        { text: 'chmod u+x,go-rwx deploy.sh', run: true, n: 2 },
        { text: 'ls -l deploy.sh', run: true },
        { text: '-rwx------ 1 user user 1830 Sep 29 17:03 deploy.sh', n: 3 },
        { text: 'chmod -R g+w shared/', run: true, n: 4 },
      ],
      notes: [
        { t: '640, digit by digit', d: '6 is 4+2, read and write, for the owner. 4 is read for the group www-data. 0 is nothing for everyone else.' },
        { t: 'The symbolic form names who, then what', d: 'u is the owner, g the group, o others. u+x adds execute for the owner; go-rwx removes everything from group and others.' },
        { t: 'Only the named bits changed', d: 'The owner kept read and write and gained execute. Group and others lost every permission they had.' },
        { t: '-R applies it to a whole tree', d: 'Every file and directory under shared/ gains group write. Powerful, and rarely what you want for both files and directories alike.' },
      ],
    },
    recipes: [
      { run: 'chmod +x script.sh', d: 'Makes a script executable for everyone who can read it.' },
      { run: 'chmod 600 ~/.ssh/id_ed25519', d: 'The mode SSH requires on a private key — it refuses to use one that others can read.' },
      { run: 'chmod -R u=rwX,go=rX public/', d: 'Capital X adds execute only to directories and to files that already had it — the right way to open up a tree.' },
      { run: 'stat -c "%a %n" file', d: 'Prints the current mode in octal, for when the letters are hard to read.' },
    ],
    security: {
      lede: [
        'Permission bits are ',
        { b: 'the first and most-used access control on the system' },
        ', and the common mistakes are all in the direction of too much.',
      ],
      points: [
        { t: 'Never 777', d: 'It lets every user and every compromised service modify the file. It "fixes" a permission error by removing the protection.' },
        { t: 'Set-uid and set-gid', d: 'A leading 4 or 2 makes a program run as its owner or group. On a root-owned binary that is a direct path to root; grant it almost never.' },
        { t: 'Recursive changes', d: '"chmod -R 755" marks every file executable; "chmod -R 644" makes every directory unenterable. Use X, or find with -type.' },
      ],
    },
    protocols: [],
    related: ['chown', 'ls'],
    footnote: 'The nine mode bits are the classic model. ACLs and SELinux or AppArmor can add further rules on top of them.',
  },
  {
    slug: 'chown',
    cmd: 'chown',
    group: 'perm',
    pkg: 'coreutils',
    fn: 'Changes which user and which group own a file or directory.',
    kicker: 'Linux · users & permissions',
    sub: 'whose file is it',
    lede: [
      { m: 'chown' },
      ' changes the owner and group recorded on a file. The permission bits say what the owner, the group and others may do; ',
      { a: 'chown decides who those words refer to' },
      '. Because giving a file away could be used to dodge quotas and blame, ',
      { b: 'only root may change an owner' },
      '.',
    ],
    takeaway: [
      'chmod sets the rules for owner, group and others — ',
      { a: 'chown says who the owner and group are' },
      '.',
    ],
    points: [
      { k: 'Changes', v: 'Owner and group', note: 'written as user:group' },
      { k: 'Needs root', v: 'For the owner', note: 'always' },
      { k: 'Whole tree', v: '-R', note: 'recursive' },
      { k: 'Group only', v: 'chgrp', note: 'or chown :group' },
    ],
    session: {
      run: 'chown -v www-data:www-data /var/www/site/index.html',
      prompt: '#',
      lines: [
        { text: "changed ownership of '/var/www/site/index.html' from root:root to www-data:www-data", n: 1 },
        { text: 'chown -R deploy: /var/www/site', run: true, n: 2 },
        { text: 'ls -ld /var/www/site', run: true },
        { text: 'drwxr-xr-x 4 deploy deploy 4096 Sep 30 10:31 /var/www/site', n: 3 },
        { text: 'chown :www-data /var/www/site/uploads', run: true, n: 4 },
      ],
      notes: [
        { t: 'user:group sets both at once', d: 'The file was created by root, so the web server could not write to it. -v reports the change that was made.' },
        { t: 'A trailing colon means "and their own group"', d: '"deploy:" sets the owner to deploy and the group to deploy\'s login group. -R applies it to everything beneath.' },
        { t: 'Third and fourth columns are owner and group', d: 'ls -l confirms it. The permission bits did not change — only whom they apply to.' },
        { t: 'A leading colon changes only the group', d: 'The owner stays as it is; the group becomes www-data, so the web server can be given write access to just this directory.' },
      ],
    },
    recipes: [
      { run: 'sudo chown $USER: file', d: 'Takes ownership of a file for yourself and your own group.' },
      { run: 'sudo chown -R --from=root:root deploy: /srv/app', d: 'Changes only the entries currently owned by root, leaving everything else untouched.' },
      { run: 'sudo chown --reference=a.txt b.txt', d: 'Gives one file the same owner and group as another.' },
      { run: 'id deploy', d: 'Shows a user\'s numeric ID and every group they belong to — worth checking first.' },
    ],
    security: {
      lede: [
        'Ownership decides ',
        { b: 'who is allowed to change the permissions' },
        ', so a wrong owner undermines every mode bit set afterwards.',
      ],
      points: [
        { t: 'Do not let the server own its code', d: 'If the web-server user owns the application files, a flaw in the application can rewrite the application. Give it only its upload and cache directories.' },
        { t: 'Recursive chown as root', d: 'A typo in the path of "chown -R" can re-own system directories and break the machine. Check the path, then run it.' },
        { t: 'Symbolic links', d: 'With -R, a link pointing outside the tree can redirect the change to a file elsewhere. chown does not follow them by default — do not add -L without a reason.' },
      ],
    },
    protocols: [],
    related: ['chmod', 'sudo'],
    footnote: 'Ownership is stored as numeric IDs; the names shown come from /etc/passwd and /etc/group on the machine doing the listing.',
  },
  {
    slug: 'sudo',
    cmd: 'sudo',
    group: 'perm',
    pkg: 'sudo',
    fn: 'Runs a single command as root, or as another user, after checking the caller is permitted to — and logs that it happened.',
    kicker: 'Linux · users & permissions',
    sub: 'one command as root',
    lede: [
      { m: 'sudo' },
      ' runs ',
      { a: 'one command with another user\'s privileges' },
      ', root by default. It asks for your own password, checks a rule file to see whether you are allowed, and ',
      { b: 'records the command in the log' },
      '. That is the whole point: administration by named people, one visible command at a time.',
    ],
    takeaway: [
      'sudo exists so that nobody has to ',
      { a: 'log in as root' },
      ' — and so that every root action has a name on it.',
    ],
    points: [
      { k: 'Runs as', v: 'root', note: 'or -u another user' },
      { k: 'Asks for', v: 'Your password', note: 'not root\'s' },
      { k: 'Rules live in', v: '/etc/sudoers', note: 'edit only with visudo' },
      { k: 'Remembers for', v: '~15 minutes', note: 'then asks again' },
    ],
    session: {
      run: 'sudo systemctl restart nginx',
      prompt: '$',
      lines: [
        { text: '[sudo] password for user:', n: 1 },
        { text: 'sudo -l', run: true },
        { text: 'User user may run the following commands on netflow:', n: 2 },
        { text: '    (ALL : ALL) ALL' },
        { text: 'sudo -u postgres whoami', run: true },
        { text: 'postgres', n: 3 },
        { text: 'sudo tail -1 /var/log/auth.log', run: true },
        { text: 'Sep 30 10:41:07 netflow sudo:     user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/usr/bin/tail -1 /var/log/auth.log', n: 4 },
      ],
      notes: [
        { t: 'It wants your password, not root\'s', d: 'You prove who you are; the rules decide what you may do. Nothing is echoed as you type.' },
        { t: '-l lists what you are allowed', d: '(ALL : ALL) ALL means any command, as any user or group. A locked-down account would show a short list of specific commands instead.' },
        { t: '-u runs as someone other than root', d: 'Here the command ran as the postgres service account — the right way to do database administration without a root shell.' },
        { t: 'Every use is written down', d: 'Who, from which terminal, in which directory, as whom, and the exact command. This log line is what an audit reads.' },
      ],
    },
    recipes: [
      { run: 'sudo !!', d: 'Re-runs the previous command with sudo — for the moment after "Permission denied".' },
      { run: 'sudo -k', d: 'Forgets the cached password immediately, so the next sudo asks again.' },
      { run: 'sudo visudo', d: 'Edits the rule file with a syntax check, so a mistake cannot lock everyone out.' },
      { run: 'sudo -i', d: 'Opens a root shell. Convenient, and it trades away the one-command-at-a-time record.' },
    ],
    security: {
      lede: [
        'sudo is ',
        { b: 'the gate between an ordinary account and the whole machine' },
        ', so its rule file is among the most security-relevant files on the system.',
      ],
      points: [
        { t: 'NOPASSWD', d: 'A rule that skips the password turns any compromise of that account into root at once. Keep it for narrow, specific commands if at all.' },
        { t: 'Commands that can run commands', d: 'Allowing sudo on an editor, a pager, find or tar hands over a root shell, because each can launch one. Review rules with that in mind.' },
        { t: 'Least privilege', d: 'Grant the commands a role needs, not ALL. And prefer "sudo command" to a root shell, so the log stays meaningful.' },
      ],
    },
    protocols: [],
    related: ['chown', 'systemctl'],
    footnote: 'The log is /var/log/auth.log on Debian-family systems and /var/log/secure on Red Hat ones; journalctl shows it on both.',
  },

  // ── interfaces & addressing ───────────────────────────────────────────
  {
    slug: 'ip-addr',
    cmd: 'ip addr',
    group: 'iface',
    pkg: 'iproute2',
    fn: 'Lists every interface with the IPv4 and IPv6 addresses assigned to it, and adds or removes them.',
    kicker: 'Linux · interfaces & addressing',
    sub: 'what this host calls itself',
    lede: [
      { m: 'ip addr' },
      ' prints each network interface with ',
      { a: 'the addresses bound to it' },
      ' — the MAC on the link, the IPv4 address and prefix, and the IPv6 addresses the kernel configured for itself. It replaced ',
      { m: 'ifconfig' },
      ', which ',
      { b: 'cannot show more than one address per interface' },
      ' properly.',
    ],
    takeaway: [
      'An address belongs to ',
      { a: 'an interface, not to the machine' },
      ' — one host is as many addresses as it has links.',
    ],
    points: [
      { k: 'Reads', v: 'Addresses per link', note: 'IPv4, IPv6 and the MAC' },
      { k: 'Short form', v: 'ip a', note: 'every object name abbreviates' },
      { k: 'Needs root', v: 'Only to change', note: 'reading is unprivileged' },
      { k: 'Replaces', v: 'ifconfig', note: 'net-tools, long unmaintained' },
    ],
    session: {
      run: 'ip addr show eth0',
      prompt: '$',
      lines: [
        { text: '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000', n: 1 },
        { text: '    link/ether 52:54:00:3a:9c:1e brd ff:ff:ff:ff:ff:ff', n: 2 },
        { text: '    inet 192.168.1.42/24 brd 192.168.1.255 scope global dynamic noprefixroute eth0', n: 3 },
        { text: '       valid_lft 85912sec preferred_lft 85912sec', n: 4 },
        { text: '    inet6 fe80::5054:ff:fe3a:9c1e/64 scope link', n: 5 },
        { text: '       valid_lft forever preferred_lft forever' },
      ],
      notes: [
        { t: 'The flags are two different kinds of "up"', d: 'UP means an administrator enabled the interface. LOWER_UP means the link itself has carrier — a cable is in and the far end answers. UP without LOWER_UP is an unplugged port.' },
        { t: 'link/ether is the layer-2 address', d: 'The MAC this interface puts in every Ethernet frame it sends, followed by the broadcast address frames to everyone are sent to.' },
        { t: 'inet is the IPv4 address and its prefix', d: '/24 says the first 24 bits name the network, so 192.168.1.0 to 192.168.1.255 is on-link. "dynamic" says the address came from DHCP rather than being typed in.' },
        { t: 'The lifetimes are the DHCP lease', d: 'valid_lft counts down the seconds until the address must be renewed or dropped. A statically configured address reads "forever".' },
        { t: 'fe80:: is the link-local IPv6 address', d: 'The kernel assigns one to every IPv6-capable interface without asking anyone. "scope link" means it is never routed off this segment.' },
      ],
    },
    recipes: [
      { run: 'ip -br addr', d: 'One line per interface — name, state and addresses. The form to reach for first.' },
      { run: 'ip -4 addr show dev eth0', d: 'Only the IPv4 addresses of one interface; -6 does the same for IPv6.' },
      { run: 'ip addr add 192.168.1.50/24 dev eth0', d: 'Binds a second address to the interface. Lost at reboot unless the network manager also knows it.' },
      { run: 'ip addr del 192.168.1.50/24 dev eth0', d: 'Removes exactly that address and prefix, leaving the others in place.' },
    ],
    security: {
      lede: [
        'The address list is the first thing an attacker reads after landing on a host, because it ',
        { b: 'maps every network the machine can reach' },
        '. It is equally the first thing a defender should read.',
      ],
      points: [
        { t: 'Unexpected interfaces', d: 'A tun, tap or wg interface nobody remembers creating is a tunnel out of the network. Account for every one.' },
        { t: 'Dual-homed hosts', d: 'A machine with an address in two segments is a bridge between them, whatever the firewall diagram says.' },
        { t: 'Secondary addresses', d: 'An extra address on a live interface can impersonate a neighbour or quietly host a service. ifconfig would not have shown it.' },
        { t: 'IPv6 nobody planned for', d: 'Link-local and autoconfigured IPv6 addresses appear by default. If the firewall only filters IPv4, they are an open side door.' },
        { t: 'Changes do not persist', d: 'An address added by hand vanishes at reboot — convenient for an intruder, and a reason to compare live state with the configuration.' },
        { t: 'MAC as identity', d: 'The link/ether value is trivially changed. Port security and DHCP reservations that trust it are trusting a claim.' },
      ],
    },
    protocols: ['ip4', 'ip6', 'eth', 'dhcp'],
    related: ['ip-link', 'ip-route'],
    footnote: 'Output is from iproute2 on a current kernel; field order and flags vary slightly between releases.',
  },
  {
    slug: 'ip-link',
    cmd: 'ip link',
    group: 'iface',
    pkg: 'iproute2',
    fn: 'Shows and changes the layer-2 state of each interface — up or down, MTU, MAC address and carrier.',
    kicker: 'Linux · interfaces & addressing',
    sub: 'the link under the address',
    lede: [
      { m: 'ip link' },
      ' works one layer below ',
      { m: 'ip addr' },
      ': it deals with ',
      { a: 'the interface as a device' },
      ' — whether it is enabled, whether it has carrier, how large a frame it will send. It is also how virtual links are made: ',
      { b: 'VLANs, bridges and veth pairs' },
      ' are all created here.',
    ],
    takeaway: [
      'Before asking whether a host has the right address, ask ',
      { a: 'whether the link is up at all' },
      '.',
    ],
    points: [
      { k: 'Reads', v: 'Link state', note: 'carrier, MTU, MAC' },
      { k: 'Short form', v: 'ip l', note: 'or ip -br l for a table' },
      { k: 'Needs root', v: 'To change', note: 'set, add and delete' },
      { k: 'Layer', v: 'Data link', note: 'no IP addresses here' },
    ],
    session: {
      run: 'ip -br link',
      prompt: '$',
      lines: [
        { text: 'lo               UNKNOWN        00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP>', n: 1 },
        { text: 'eth0             UP             52:54:00:3a:9c:1e <BROADCAST,MULTICAST,UP,LOWER_UP>', n: 2 },
        { text: 'wlan0            DOWN           a4:5e:60:c1:7b:02 <NO-CARRIER,BROADCAST,MULTICAST,UP>', n: 3 },
        { text: 'eth0.20@eth0     UP             52:54:00:3a:9c:1e <BROADCAST,MULTICAST,UP,LOWER_UP>', n: 4 },
      ],
      notes: [
        { t: 'Loopback reports UNKNOWN, and that is healthy', d: 'lo has no physical carrier to detect, so its operational state is never "UP". The flags still show it enabled and working.' },
        { t: 'UP in the second column is the operational state', d: 'The kernel has carrier and the interface can pass frames. This is the column to read when a host "has no network".' },
        { t: 'DOWN with NO-CARRIER is enabled but unconnected', d: 'The administrator turned wlan0 on — UP is in the flags — but it is not associated to anything. The fault is the link, not the configuration.' },
        { t: 'name@parent is a virtual link', d: 'eth0.20 is an 802.1Q sub-interface riding on eth0: frames it sends leave eth0 tagged with VLAN 20. It shares the parent\'s MAC.' },
      ],
    },
    recipes: [
      { run: 'ip link set eth0 up', d: 'Enables the interface. "down" disables it — and drops your SSH session if that is how you got in.' },
      { run: 'ip link set eth0 mtu 9000', d: 'Raises the MTU for jumbo frames. Every device on the segment has to agree, or large packets vanish.' },
      { run: 'ip link add link eth0 name eth0.20 type vlan id 20', d: 'Creates a tagged sub-interface for VLAN 20 on top of eth0.' },
      { run: 'ip -s link show eth0', d: 'Adds packet, error and drop counters — the quickest evidence of a bad cable or a duplex mismatch.' },
    ],
    security: {
      lede: [
        'Link settings decide ',
        { b: 'what the interface will accept off the wire' },
        ' before any firewall rule runs, so they are worth auditing in their own right.',
      ],
      points: [
        { t: 'Promiscuous mode', d: 'A PROMISC flag means the interface accepts frames addressed to other hosts. Expected during a capture; suspicious otherwise.' },
        { t: 'MAC spoofing', d: '"ip link set address" rewrites the MAC in one line. It defeats MAC filtering and can hijack a neighbour\'s DHCP lease.' },
        { t: 'VLAN hopping', d: 'A host on a trunk port can create a sub-interface for any VLAN. Keep user ports in access mode so tags are dropped.' },
        { t: 'Rogue bridges', d: 'Two interfaces enslaved to a bridge join two networks at layer 2, below where most monitoring looks.' },
        { t: 'Error counters', d: 'Rising RX errors point to a failing cable or optic — and occasionally to a tap that was fitted carelessly.' },
        { t: 'MTU mismatch', d: 'A wrong MTU fails only for large packets, which looks like a selective block. Check it before blaming a firewall.' },
      ],
    },
    protocols: ['eth', 'vlan'],
    related: ['ip-addr', 'ip-neigh'],
    footnote: 'Changes made with ip link are live and temporary; the distribution\'s network manager owns the persistent configuration.',
  },

  // ── routing & neighbours ──────────────────────────────────────────────
  {
    slug: 'ip-route',
    cmd: 'ip route',
    group: 'route',
    pkg: 'iproute2',
    fn: 'Prints the kernel routing table and answers which interface and next hop a given destination will use.',
    kicker: 'Linux · routing & neighbours',
    sub: 'where a packet goes next',
    lede: [
      { m: 'ip route' },
      ' shows the table the kernel consults for every outgoing packet. Each line pairs ',
      { a: 'a destination prefix with a way to reach it' },
      ' — directly on a link, or via a gateway. When several lines match, ',
      { b: 'the longest prefix wins' },
      ', and the default route is simply the shortest prefix there is.',
    ],
    takeaway: [
      'A host does not know the path to anywhere — it knows only ',
      { a: 'the next hop' },
      ', and trusts that hop to know the one after.',
    ],
    points: [
      { k: 'Reads', v: 'Routing table', note: 'the main table by default' },
      { k: 'Short form', v: 'ip r', note: 'replaces route -n' },
      { k: 'Decides by', v: 'Longest prefix', note: 'then lowest metric' },
      { k: 'Best single use', v: 'ip route get', note: 'asks the kernel directly' },
    ],
    session: {
      run: 'ip route',
      prompt: '$',
      lines: [
        { text: 'default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.42 metric 100', n: 1 },
        { text: '10.8.0.0/24 dev wg0 proto kernel scope link src 10.8.0.2', n: 2 },
        { text: '172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1 linkdown', n: 3 },
        { text: '192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.42 metric 100', n: 4 },
      ],
      notes: [
        { t: 'default is the route of last resort', d: 'It is 0.0.0.0/0 written as a word: anything no other line matches is handed to 192.168.1.1. "proto dhcp" records that the DHCP client installed it.' },
        { t: 'A tunnel is just another route', d: 'Traffic for 10.8.0.0/24 leaves through wg0. No gateway is named because the far end is reached directly over the tunnel.' },
        { t: 'linkdown marks a route that cannot be used', d: 'docker0 exists but has no carrier — no container is attached — so the route is present and dead.' },
        { t: 'scope link means no router is involved', d: 'Hosts in 192.168.1.0/24 are on the same segment. The kernel will ARP for them and send the frame straight there.' },
      ],
    },
    recipes: [
      { run: 'ip route get 192.0.2.10', d: 'Asks the kernel which route it would actually pick for that destination — interface, gateway and source address in one line.' },
      { run: 'ip route add 10.20.0.0/16 via 192.168.1.254', d: 'Adds a static route through a second gateway. Temporary until it is written into the network configuration.' },
      { run: 'ip -6 route', d: 'The IPv6 table, which is separate and usually populated by router advertisements.' },
      { run: 'ip route show table all', d: 'Every table, including the local and policy-routing ones that the plain command hides.' },
    ],
    security: {
      lede: [
        'Whoever controls a host\'s routes controls ',
        { b: 'which box sees its traffic' },
        '. A changed route is quieter than a changed firewall rule and does more.',
      ],
      points: [
        { t: 'A rewritten default', d: 'Pointing the default route at an attacker-held host puts them in the path of everything. Compare it with what DHCP should have issued.' },
        { t: 'More-specific routes', d: 'A /32 for one destination overrides the default without disturbing anything else — a targeted interception that is easy to miss.' },
        { t: 'Split-tunnel leaks', d: 'With a VPN up, check that the sensitive prefixes really route to the tunnel. "ip route get" settles it in one line.' },
        { t: 'Policy routing', d: 'Rules in "ip rule" can send traffic to another table entirely. The main table can look clean while packets follow a different one.' },
        { t: 'Forwarding left on', d: 'A host with net.ipv4.ip_forward=1 and two interfaces is a router. Confirm that is intended.' },
        { t: 'ICMP redirects', d: 'A host that accepts redirects lets any neighbour install a route. Most servers should have accept_redirects disabled.' },
      ],
    },
    protocols: ['ip4', 'ip6', 'dhcp', 'ospf', 'bgp'],
    related: ['ip-neigh', 'traceroute'],
    footnote: 'Only the main table is shown. Hosts running containers, VPNs or policy routing usually have more than one.',
  },
  {
    slug: 'ip-neigh',
    cmd: 'ip neigh',
    group: 'route',
    pkg: 'iproute2',
    fn: 'Shows the neighbour table — the IP-to-MAC mappings learned by ARP for IPv4 and neighbour discovery for IPv6.',
    kicker: 'Linux · routing & neighbours',
    sub: 'whose MAC is that',
    lede: [
      { m: 'ip neigh' },
      ' lists what the host has learned about ',
      { a: 'the machines on its own segment' },
      ': which MAC answers for which IP address, and how fresh that answer is. It is the ARP cache and its IPv6 equivalent in one table, and it is ',
      { b: 'where on-link delivery succeeds or fails' },
      '.',
    ],
    takeaway: [
      'Routing picks the next hop by IP — but the frame is addressed to ',
      { a: 'a MAC from this table' },
      '.',
    ],
    points: [
      { k: 'Reads', v: 'Neighbour table', note: 'the ARP and NDP cache' },
      { k: 'Short form', v: 'ip n', note: 'replaces arp -n' },
      { k: 'Scope', v: 'One segment', note: 'never crosses a router' },
      { k: 'Entries expire', v: 'In seconds', note: 'then are re-verified' },
    ],
    session: {
      run: 'ip neigh',
      prompt: '$',
      lines: [
        { text: '192.168.1.1 dev eth0 lladdr 3c:84:6a:12:f0:01 REACHABLE', n: 1 },
        { text: '192.168.1.57 dev eth0 lladdr b8:27:eb:44:0d:9a STALE', n: 2 },
        { text: '192.168.1.90 dev eth0 FAILED', n: 3 },
        { text: 'fe80::3e84:6aff:fe12:f001 dev eth0 lladdr 3c:84:6a:12:f0:01 router REACHABLE', n: 4 },
      ],
      notes: [
        { t: 'REACHABLE is a mapping confirmed recently', d: 'The gateway at 192.168.1.1 answered within the last few tens of seconds. lladdr is the link-layer address frames for it are sent to.' },
        { t: 'STALE is not a fault', d: 'The entry has not been confirmed lately. The kernel will still use it and quietly re-check it the next time a packet goes that way.' },
        { t: 'FAILED means nobody answered the ARP request', d: 'There is no lladdr because no host claimed 192.168.1.90. The machine is off, on another VLAN, or the address is simply unused.' },
        { t: 'The IPv6 entry is the same router', d: 'The MAC matches the first line: this is the gateway seen through neighbour discovery. "router" records that it sent router advertisements.' },
      ],
    },
    recipes: [
      { run: 'ip neigh show dev eth0', d: 'Only the neighbours learned on one interface.' },
      { run: 'ip neigh flush dev eth0', d: 'Empties the cache for that interface, forcing every mapping to be re-learned. The first thing to try after a device was swapped.' },
      { run: 'ip neigh replace 192.168.1.1 lladdr 3c:84:6a:12:f0:01 dev eth0 nud permanent', d: 'Pins the gateway\'s MAC so no ARP reply can change it.' },
      { run: 'ip -s neigh', d: 'Adds how long ago each entry was used, confirmed and updated.' },
    ],
    security: {
      lede: [
        'ARP has no authentication: a host ',
        { b: 'believes whichever reply arrived last' },
        '. This table is where that trust is recorded, and where its abuse shows up.',
      ],
      points: [
        { t: 'ARP spoofing', d: 'A neighbour that answers for the gateway\'s IP inserts itself into every conversation leaving the segment.' },
        { t: 'One MAC, two IPs', d: 'The same lladdr against the gateway and against another host is the classic signature of a poisoned cache.' },
        { t: 'A gateway MAC that changes', d: 'Note the legitimate value once. A different one tomorrow is either new hardware or an interception.' },
        { t: 'Static entries', d: 'A permanent entry for the gateway cannot be overwritten by a forged reply — practical on servers, tedious on laptops.' },
        { t: 'Switch-side defence', d: 'Dynamic ARP inspection and DHCP snooping drop forged replies before any host sees them. The real fix is in the switch.' },
        { t: 'IPv6 has the same hole', d: 'Neighbour discovery can be spoofed just as ARP can. RA guard and ND inspection are the equivalents.' },
      ],
    },
    protocols: ['arp', 'eth', 'icmp6', 'ip4'],
    related: ['ip-route', 'tcpdump'],
    footnote: 'Entry states and their timers come from the kernel\'s neighbour subsystem and are tunable per interface.',
  },

  // ── names ─────────────────────────────────────────────────────────────
  {
    slug: 'dig',
    cmd: 'dig',
    group: 'names',
    pkg: 'bind9-dnsutils',
    fn: 'Sends a DNS query to a resolver of your choosing and prints the whole response, section by section.',
    kicker: 'Linux · names',
    sub: 'asking the DNS directly',
    lede: [
      { m: 'dig' },
      ' builds one DNS query, sends it, and shows ',
      { a: 'everything that came back' },
      ' — header flags, the question, the answer records and how long it took. Because it talks to the resolver itself and ',
      { b: 'ignores the host\'s own lookup rules' },
      ', it tells you what the DNS says rather than what the machine concluded.',
    ],
    takeaway: [
      'When a name will not resolve, dig separates ',
      { a: 'what the DNS answered' },
      ' from what the host did with the answer.',
    ],
    points: [
      { k: 'Speaks', v: 'DNS', note: 'UDP 53, TCP when asked' },
      { k: 'Default record', v: 'A', note: 'name the type to change it' },
      { k: 'Short output', v: '+short', note: 'just the answer' },
      { k: 'Bypasses', v: '/etc/hosts', note: 'and nsswitch entirely' },
    ],
    session: {
      run: 'dig example.com',
      prompt: '$',
      lines: [
        { text: '; <<>> DiG 9.18.28 <<>> example.com' },
        { text: ';; Got answer:' },
        { text: ';; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 41207', n: 1 },
        { text: ';; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1', n: 2 },
        { text: '' },
        { text: ';; QUESTION SECTION:' },
        { text: ';example.com.                   IN      A' },
        { text: '' },
        { text: ';; ANSWER SECTION:' },
        { text: 'example.com.            3600    IN      A       192.0.2.10', n: 3 },
        { text: '' },
        { text: ';; Query time: 18 msec', n: 4 },
        { text: ';; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)', n: 5 },
        { text: ';; MSG SIZE  rcvd: 56' },
      ],
      notes: [
        { t: 'status is the verdict', d: 'NOERROR means the query was answered. NXDOMAIN means the name does not exist; SERVFAIL means the resolver could not get an answer at all.' },
        { t: 'The flags say who did the work', d: 'qr marks this as a response, rd that recursion was requested, ra that the server offers it. An "aa" flag would mean the answer came from the authoritative server itself.' },
        { t: 'The answer record, left to right', d: 'Name, time-to-live in seconds, class, type, value. 3600 is how long any resolver may cache this before asking again.' },
        { t: 'Query time exposes caching', d: 'Run it twice: a second answer in 0 msec came from the resolver\'s cache, and its TTL will have counted down.' },
        { t: 'SERVER is who actually answered', d: '127.0.0.53 is the local systemd-resolved stub, not the upstream resolver. Add @server to ask a specific one.' },
      ],
    },
    recipes: [
      { run: 'dig +short example.com AAAA', d: 'Just the IPv6 addresses, one per line — the form for scripts.' },
      { run: 'dig @192.0.2.53 example.com MX', d: 'Asks a named resolver for the mail exchangers, bypassing the one the host is configured with.' },
      { run: 'dig +trace example.com', d: 'Walks the delegation from the root servers down, showing which server handed off to which.' },
      { run: 'dig -x 192.0.2.10', d: 'A reverse lookup: the PTR record that maps an address back to a name.' },
    ],
    security: {
      lede: [
        'DNS decides where every connection goes, and by default ',
        { b: 'nothing in the answer is authenticated' },
        '. dig is the tool for checking whether the answer you received is the one that was published.',
      ],
      points: [
        { t: 'Compare resolvers', d: 'Ask the local resolver and an independent one. Different answers for the same name mean something is rewriting DNS.' },
        { t: 'DNSSEC', d: '"dig +dnssec" returns the signatures. An "ad" flag in the response means a validating resolver checked them.' },
        { t: 'Zone transfers', d: '"dig axfr" against a misconfigured server returns the whole zone — every hostname the organisation has.' },
        { t: 'TTL as evidence', d: 'A very short TTL on a record that should be stable is a mark of fast-flux hosting and of hijacked records.' },
        { t: 'TXT as a channel', d: 'Data can be smuggled out in DNS queries and replies. Unusual TXT volume to one domain deserves a look.' },
        { t: 'Reconnaissance', d: 'MX, NS, TXT and SPF records describe an organisation\'s mail and hosting to anyone who asks. Publish only what must be public.' },
      ],
    },
    protocols: ['dns', 'udp', 'tcp', 'mdns'],
    related: ['resolvectl', 'curl'],
    footnote: 'dig ships with BIND\'s client utilities; the package is dnsutils on Debian-family systems and bind-utils on Red Hat ones.',
  },
  {
    slug: 'resolvectl',
    cmd: 'resolvectl',
    group: 'names',
    pkg: 'systemd',
    fn: 'Reports which DNS servers and search domains each interface is using under systemd-resolved, and resolves names the way the host does.',
    kicker: 'Linux · names',
    sub: 'who this host really asks',
    lede: [
      'On a systemd machine ',
      { m: '/etc/resolv.conf' },
      ' usually names only 127.0.0.53, a local stub. ',
      { m: 'resolvectl' },
      ' shows what lies behind it: ',
      { a: 'the real resolvers, per interface' },
      ', and which link a given name will be sent to. With a VPN up there are ',
      { b: 'two sets of DNS servers at once' },
      ', and this is the only place that says so.',
    ],
    takeaway: [
      'Name resolution on a modern host is ',
      { a: 'per link, not per machine' },
      ' — the question is which interface gets the query.',
    ],
    points: [
      { k: 'Talks to', v: 'systemd-resolved', note: 'the local stub resolver' },
      { k: 'Stub address', v: '127.0.0.53', note: 'what resolv.conf points at' },
      { k: 'Resolves like', v: 'The host', note: 'unlike dig' },
      { k: 'Older name', v: 'systemd-resolve', note: 'same tool, renamed' },
    ],
    session: {
      run: 'resolvectl status',
      prompt: '$',
      lines: [
        { text: 'Global' },
        { text: '       Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported', n: 1 },
        { text: 'resolv.conf mode: stub', n: 2 },
        { text: '' },
        { text: 'Link 2 (eth0)' },
        { text: '    Current Scopes: DNS' },
        { text: 'Current DNS Server: 192.168.1.1', n: 3 },
        { text: '       DNS Servers: 192.168.1.1' },
        { text: '        DNS Domain: lan' },
        { text: '' },
        { text: 'Link 5 (wg0)' },
        { text: '    Current Scopes: DNS' },
        { text: 'Current DNS Server: 10.8.0.1' },
        { text: '       DNS Servers: 10.8.0.1' },
        { text: '        DNS Domain: ~corp.example', n: 4 },
      ],
      notes: [
        { t: 'The protocol line is the feature list', d: 'A minus means off. Here multicast names, LLMNR and DNS-over-TLS are all disabled, and answers are not DNSSEC-validated.' },
        { t: 'stub mode explains resolv.conf', d: 'Applications are told to ask 127.0.0.53, and systemd-resolved forwards from there. The real servers never appear in the file.' },
        { t: 'Each link has its own resolver', d: 'eth0 learned 192.168.1.1 from DHCP. "Current" is the one in use when several are listed.' },
        { t: 'The tilde makes a routing domain', d: '~corp.example sends names under corp.example to the VPN\'s resolver and nothing else. Without the tilde it would also be a search suffix.' },
      ],
    },
    recipes: [
      { run: 'resolvectl query example.com', d: 'Resolves a name the way an application would, and reports which link and protocol answered.' },
      { run: 'resolvectl flush-caches', d: 'Empties the local cache — the step to take after changing a record and still seeing the old answer.' },
      { run: 'resolvectl dns eth0 192.0.2.53', d: 'Sets the resolver for one link until the next network change.' },
      { run: 'resolvectl statistics', d: 'Cache hits and misses, and how many answers passed or failed DNSSEC validation.' },
    ],
    security: {
      lede: [
        'The resolver a host uses ',
        { b: 'sees every name it looks up' },
        ' and can answer with any address it likes. Knowing exactly which one that is matters more than which firewall is in front.',
      ],
      points: [
        { t: 'DNS leaks', d: 'With a VPN up, queries for public names may still go out of eth0 to the local network\'s resolver. The per-link view shows it.' },
        { t: 'A resolver from DHCP', d: 'Any network that hands out a lease also hands out a DNS server. On untrusted Wi-Fi, that is the network operator\'s choice, not yours.' },
        { t: 'LLMNR and mDNS', d: 'Both answer names by asking the whole segment, and anyone may reply. Disable them where they are not needed.' },
        { t: 'DNS over TLS', d: 'DNSOverTLS=yes encrypts queries to the resolver, hiding them from the local network — though not from the resolver.' },
        { t: 'Validation off', d: 'DNSSEC=no means forged answers are accepted without complaint. Know which of your hosts validate.' },
        { t: 'Cache poisoning', d: 'A bad answer is cached for its whole TTL. Flushing is part of cleaning up after a DNS incident.' },
      ],
    },
    protocols: ['dns', 'mdns', 'dhcp', 'tls'],
    related: ['dig', 'ip-addr'],
    footnote: 'Applies to hosts running systemd-resolved. Where it is not in use, /etc/resolv.conf is the whole story.',
  },

  // ── sockets & transfer ────────────────────────────────────────────────
  {
    slug: 'ss',
    cmd: 'ss',
    group: 'sockets',
    pkg: 'iproute2',
    fn: 'Lists the sockets on a host — what is listening on which port, which connections are open, and which process owns each.',
    kicker: 'Linux · sockets & transfer',
    sub: 'what is listening here',
    lede: [
      { m: 'ss' },
      ' reads socket state straight from the kernel: ',
      { a: 'every listening port and every open connection' },
      ', with the process behind it. It replaced ',
      { m: 'netstat' },
      ' and answers the two questions that come up constantly — ',
      { b: 'is the service actually listening, and on which address' },
      '.',
    ],
    takeaway: [
      'A service that listens on 127.0.0.1 and one that listens on 0.0.0.0 look identical from the inside — and ',
      { a: 'completely different from the network' },
      '.',
    ],
    points: [
      { k: 'Reads', v: 'Kernel sockets', note: 'TCP, UDP, UNIX and more' },
      { k: 'Everyday flags', v: '-tlnp', note: 'TCP, listening, numeric, process' },
      { k: 'Needs root', v: 'For other users', note: 'to see their process names' },
      { k: 'Replaces', v: 'netstat', note: 'faster on busy hosts' },
    ],
    session: {
      run: 'ss -tlnp',
      prompt: '#',
      lines: [
        { text: 'State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process' },
        { text: 'LISTEN  0       4096     127.0.0.53%lo:53           0.0.0.0:*      users:(("systemd-resolve",pid=612,fd=15))', n: 1 },
        { text: 'LISTEN  0       128            0.0.0.0:22           0.0.0.0:*      users:(("sshd",pid=801,fd=3))', n: 2 },
        { text: 'LISTEN  0       511          127.0.0.1:8080         0.0.0.0:*      users:(("node",pid=4120,fd=21))', n: 3 },
        { text: 'LISTEN  0       128               [::]:22              [::]:*      users:(("sshd",pid=801,fd=4))', n: 4 },
      ],
      notes: [
        { t: 'Bound to one interface', d: '127.0.0.53%lo is the DNS stub, tied to the loopback device. Nothing off the machine can reach it.' },
        { t: '0.0.0.0 means every IPv4 address', d: 'sshd accepts connections on whichever address the host has, on every interface. This is what "exposed" looks like.' },
        { t: '127.0.0.1 is local only', d: 'The node process on 8080 is reachable from this machine and nowhere else. The usual reason a service "works locally but not remotely".' },
        { t: '[::] is the IPv6 wildcard', d: 'A separate socket for the same daemon. A firewall that only filters IPv4 leaves this one open.' },
      ],
    },
    recipes: [
      { run: 'ss -tunlp', d: 'Adds UDP to the listing — DNS, DHCP and NTP listeners do not appear with -t alone.' },
      { run: 'ss -tn state established', d: 'Only the connections that are open right now, with both ends\' addresses and ports.' },
      { run: 'ss -tn dst 192.0.2.10', d: 'Filters by peer: every connection this host has to one address.' },
      { run: 'ss -ti', d: 'Per-connection TCP internals — congestion window, round-trip time and retransmits.' },
    ],
    security: {
      lede: [
        'Every listening socket is ',
        { b: 'a door, and ss is the list of doors' },
        '. Reading it is the cheapest security review a host can get.',
      ],
      points: [
        { t: 'Wildcard binds', d: 'Anything on 0.0.0.0 or [::] is exposed on every interface. Databases and admin panels should rarely appear that way.' },
        { t: 'Listeners nobody recognises', d: 'A high port owned by an unfamiliar process is how a backdoor looks. Follow the pid to its binary.' },
        { t: 'Compare with a scan', d: 'What ss lists and what nmap finds from outside should agree. A port open here and closed there is a firewall; the reverse is a concern.' },
        { t: 'Outbound connections', d: 'Established connections to unexpected addresses are how command-and-control and exfiltration show up.' },
        { t: 'A rootkit can lie', d: 'ss asks the kernel. If the kernel is compromised the answer is too — which is why an external scan is the cross-check.' },
        { t: 'IPv6 listeners', d: 'Daemons often bind both families. Audit the [::] lines with the same care as the IPv4 ones.' },
      ],
    },
    protocols: ['tcp', 'udp', 'ssh', 'dns', 'http'],
    related: ['curl', 'tcpdump'],
    footnote: 'Process names appear only for sockets the caller may inspect; run as root to see them all.',
  },
  {
    slug: 'curl',
    cmd: 'curl',
    group: 'sockets',
    pkg: 'curl',
    fn: 'Makes one request over HTTP, HTTPS or a dozen other protocols and shows every stage — the connection, the TLS handshake, the headers.',
    kicker: 'Linux · sockets & transfer',
    sub: 'one request, fully visible',
    lede: [
      { m: 'curl' },
      ' sends a single request and, with ',
      { m: '-v' },
      ', narrates ',
      { a: 'each layer on the way' },
      ': the address chosen, the TCP connection, the TLS negotiation and certificate, then the request and response headers. It is ',
      { b: 'a browser with nothing hidden' },
      ' — no cache, no cookies, no retries unless you ask.',
    ],
    takeaway: [
      'A page that will not load has failed at ',
      { a: 'one particular layer' },
      ' — and curl -v says which.',
    ],
    points: [
      { k: 'Speaks', v: 'HTTP & HTTPS', note: 'plus FTP, SMTP and more' },
      { k: 'See everything', v: '-v', note: 'handshake and headers' },
      { k: 'Headers only', v: '-I', note: 'a HEAD request' },
      { k: 'Follows redirects', v: 'Only with -L', note: 'off by default' },
    ],
    session: {
      run: 'curl -v https://example.com/',
      prompt: '$',
      lines: [
        { text: '*   Trying 192.0.2.10:443...', n: 1 },
        { text: '* Connected to example.com (192.0.2.10) port 443', n: 2 },
        { text: '* ALPN: curl offers h2,http/1.1' },
        { text: '* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384', n: 3 },
        { text: '*  subject: CN=example.com' },
        { text: '*  SSL certificate verify ok.', n: 4 },
        { text: '* using HTTP/2' },
        { text: '> GET / HTTP/2', n: 5 },
        { text: '> Host: example.com' },
        { text: '> User-Agent: curl/8.5.0' },
        { text: '> Accept: */*' },
        { text: '>' },
        { text: '< HTTP/2 200', n: 6 },
        { text: '< content-type: text/html; charset=UTF-8' },
        { text: '< content-length: 1256' },
      ],
      notes: [
        { t: 'DNS has already happened', d: 'The name was resolved before this line. "Trying" is the TCP connection attempt; a hang here is a routing or firewall problem.' },
        { t: 'Connected means the handshake completed', d: 'SYN, SYN-ACK, ACK all succeeded. From here down, any failure is above the transport layer.' },
        { t: 'The TLS version and cipher both sides agreed', d: 'TLS 1.3 with an AEAD cipher. An old version here is a server that needs attention.' },
        { t: 'The certificate chained to a trusted root', d: 'Name, validity dates and issuer all checked out. A failure stops the request before any HTTP is sent.' },
        { t: 'Lines starting > are what curl sent', d: 'The request line and headers, exactly as they went out. This is where to confirm a header or token is really being sent.' },
        { t: 'Lines starting < are the server\'s reply', d: 'The status first, then the response headers. The body follows after a blank line.' },
      ],
    },
    recipes: [
      { run: 'curl -sI https://example.com', d: 'Response headers only, with the progress meter silenced.' },
      { run: 'curl -L -o page.html https://example.com', d: 'Follows redirects and saves the body to a file.' },
      { run: 'curl --resolve example.com:443:192.0.2.20 https://example.com', d: 'Sends the request to a specific address while keeping the right hostname and certificate check — testing one server behind a load balancer.' },
      { run: 'curl -w "%{time_connect} %{time_starttransfer}\\n" -so /dev/null https://example.com', d: 'Prints how long the connection and the first byte took, and nothing else.' },
    ],
    security: {
      lede: [
        'curl runs wherever a shell does, which makes it both ',
        { b: 'the standard test tool and the standard download tool for attackers' },
        '. Its flags can also quietly switch off the protection TLS provides.',
      ],
      points: [
        { t: 'Never normalise -k', d: '--insecure skips certificate verification, so the request can be intercepted by anyone on the path. It does not belong in a script.' },
        { t: 'Piping to a shell', d: '"curl … | sh" runs whatever the server sends at that moment. Download, read, then run.' },
        { t: 'Credentials on the command line', d: 'A password in -u or in the URL lands in shell history and in the process list. Use a netrc file or a prompt.' },
        { t: 'Server-side request forgery', d: 'An application that fetches a user-supplied URL can be pointed at internal addresses. curl is how that is demonstrated.' },
        { t: 'Reading the headers', d: 'Missing Strict-Transport-Security or a permissive CORS header shows up in one -I request.' },
        { t: 'A common exfiltration path', d: 'An outbound POST from a server that has no reason to make one is worth an alert.' },
      ],
    },
    protocols: ['http', 'http2', 'tls', 'tcp', 'dns', 'ftp'],
    related: ['dig', 'ss'],
    footnote: 'Verbose output is abridged here; a real run also prints the certificate dates, issuer and the full response headers.',
  },

  // ── reachability ──────────────────────────────────────────────────────
  {
    slug: 'ping',
    cmd: 'ping',
    group: 'reach',
    pkg: 'iputils',
    fn: 'Sends ICMP echo requests to a host and times the replies — the first test of whether the other end is reachable at all.',
    kicker: 'Linux · reachability',
    sub: 'is the other end there',
    lede: [
      { m: 'ping' },
      ' sends an ICMP echo request and waits for the echo reply, reporting ',
      { a: 'the round-trip time of each one' },
      ' and the loss across all of them. It proves the path works at the network layer in both directions — and ',
      { b: 'nothing about any port or service above it' },
      '.',
    ],
    takeaway: [
      'A reply proves the path. Silence proves only that ',
      { a: 'something, somewhere, dropped ICMP' },
      '.',
    ],
    points: [
      { k: 'Speaks', v: 'ICMP echo', note: 'type 8 out, type 0 back' },
      { k: 'Stops', v: 'Never, by default', note: 'use -c to set a count' },
      { k: 'Measures', v: 'Round-trip time', note: 'and packet loss' },
      { k: 'Says nothing of', v: 'Ports', note: 'no TCP or UDP involved' },
    ],
    session: {
      run: 'ping -c 4 192.0.2.10',
      prompt: '$',
      lines: [
        { text: 'PING 192.0.2.10 (192.0.2.10) 56(84) bytes of data.', n: 1 },
        { text: '64 bytes from 192.0.2.10: icmp_seq=1 ttl=56 time=11.8 ms', n: 2 },
        { text: '64 bytes from 192.0.2.10: icmp_seq=2 ttl=56 time=12.1 ms' },
        { text: '64 bytes from 192.0.2.10: icmp_seq=3 ttl=56 time=11.6 ms' },
        { text: '64 bytes from 192.0.2.10: icmp_seq=4 ttl=56 time=12.4 ms' },
        { text: '' },
        { text: '--- 192.0.2.10 ping statistics ---' },
        { text: '4 packets transmitted, 4 received, 0% packet loss, time 3005ms', n: 3 },
        { text: 'rtt min/avg/max/mdev = 11.612/11.975/12.401/0.302 ms', n: 4 },
      ],
      notes: [
        { t: '56(84) is payload and total size', d: '56 bytes of data, plus 8 of ICMP header and 20 of IPv4 header, makes an 84-byte packet.' },
        { t: 'ttl hints at the distance', d: 'The reply left with a TTL of 64 and arrived with 56, so it crossed eight routers. icmp_seq going up without gaps means none were lost.' },
        { t: 'Loss is the figure that matters', d: '0% across four packets. Anything persistently above zero on a wired path is a fault worth chasing.' },
        { t: 'mdev is the jitter', d: 'How far the times strayed from the average. Low and steady is a healthy path; a large mdev is what makes voice calls break up.' },
      ],
    },
    recipes: [
      { run: 'ping -c 4 -i 0.2 192.0.2.10', d: 'Four packets, a fifth of a second apart — a faster sample.' },
      { run: 'ping -M do -s 1472 192.0.2.10', d: 'Forbids fragmentation and sends a full 1500-byte packet. If it fails where a smaller one succeeds, the path MTU is lower.' },
      { run: 'ping -6 2001:db8::10', d: 'The same test over IPv6, using ICMPv6.' },
      { run: 'ping -I eth0 192.0.2.10', d: 'Sends from one named interface, to test a specific uplink on a multi-homed host.' },
    ],
    security: {
      lede: [
        'ICMP is routinely filtered, so ping is ',
        { b: 'a weaker test than it looks' },
        ' — and the protocol it rides is useful to attackers in ways echo requests hide.',
      ],
      points: [
        { t: 'Silence is not absence', d: 'Many hosts and most cloud firewalls drop echo requests. A host that does not answer ping may be serving perfectly on 443.' },
        { t: 'Ping sweeps', d: 'Pinging a whole range is the oldest way to find live hosts. Rate-limiting or filtering echo slows it, but does not stop a port scan.' },
        { t: 'Do not block all ICMP', d: 'Path MTU discovery depends on ICMP errors. Dropping everything breaks large transfers in ways that are painful to diagnose.' },
        { t: 'ICMP tunnelling', d: 'The echo payload can carry arbitrary data. Unusually large or frequent pings to one host deserve a second look.' },
        { t: 'Fingerprinting', d: 'The initial TTL — 64, 128 or 255 — suggests the operating system at the far end.' },
        { t: 'Amplification', d: 'Echo requests to a broadcast address once drew replies from every host on it. Directed broadcasts should stay off.' },
      ],
    },
    protocols: ['icmp', 'icmp6', 'ip4', 'ip6'],
    related: ['traceroute', 'ip-route'],
    footnote: 'Times depend entirely on the path. Compare a reading with the same host\'s own history, not with a number from somewhere else.',
  },
  {
    slug: 'traceroute',
    cmd: 'traceroute',
    group: 'reach',
    pkg: 'traceroute',
    fn: 'Reveals each router between this host and a destination by sending packets whose TTL expires one hop further each time.',
    kicker: 'Linux · reachability',
    sub: 'which way the packet went',
    lede: [
      { m: 'traceroute' },
      ' sends probes with a TTL of 1, then 2, then 3. Each router that decrements the TTL to zero ',
      { a: 'discards the probe and reports back' },
      ' with an ICMP time-exceeded message, and that reply gives away the router\'s address. The result is ',
      { b: 'the forward path, one hop per line' },
      '.',
    ],
    takeaway: [
      'The TTL exists to kill packets caught in a loop — traceroute ',
      { a: 'uses that safety mechanism as a flashlight' },
      '.',
    ],
    points: [
      { k: 'Relies on', v: 'TTL expiry', note: 'ICMP time-exceeded replies' },
      { k: 'Default probe', v: 'UDP', note: '-I for ICMP, -T for TCP' },
      { k: 'Probes per hop', v: '3', note: 'three timings on each line' },
      { k: 'Shows', v: 'Forward path only', note: 'the return may differ' },
    ],
    session: {
      run: 'traceroute -n 192.0.2.10',
      prompt: '$',
      lines: [
        { text: 'traceroute to 192.0.2.10 (192.0.2.10), 30 hops max, 60 byte packets' },
        { text: ' 1  192.168.1.1  0.412 ms  0.388 ms  0.371 ms', n: 1 },
        { text: ' 2  10.20.0.1  3.104 ms  2.987 ms  3.220 ms', n: 2 },
        { text: ' 3  * * *', n: 3 },
        { text: ' 4  198.51.100.33  9.871 ms  9.640 ms  10.012 ms' },
        { text: ' 5  192.0.2.10  11.902 ms  11.754 ms  12.031 ms', n: 4 },
      ],
      notes: [
        { t: 'Hop 1 is your own gateway', d: 'Three probes, three round-trip times. Sub-millisecond is what a healthy local link looks like.' },
        { t: 'The jump in latency marks a slower link', d: 'From 0.4 ms to 3 ms: the packet left the building. The time is cumulative to that hop, not the cost of that hop alone.' },
        { t: 'Stars are a router that did not reply', d: 'It forwarded the probes — later hops answered — but sends no time-exceeded messages, or rate-limits them. Not a fault.' },
        { t: 'The last line is the destination itself', d: 'Its time should match what ping reports. If the trace ends in stars instead, the path or the target is dropping the probe type.' },
      ],
    },
    recipes: [
      { run: 'traceroute -I 192.0.2.10', d: 'Probes with ICMP echo instead of UDP, which more firewalls allow.' },
      { run: 'traceroute -T -p 443 192.0.2.10', d: 'Probes with TCP SYNs to port 443 — follows the path real web traffic takes. Needs root.' },
      { run: 'tracepath 192.0.2.10', d: 'A sibling tool that needs no privileges and reports the path MTU as it goes.' },
      { run: 'mtr -n 192.0.2.10', d: 'Runs traceroute continuously and shows loss per hop — the better tool for an intermittent fault.' },
    ],
    security: {
      lede: [
        'A trace is ',
        { b: 'a map of somebody\'s network, drawn from outside' },
        '. That makes it a standard step in reconnaissance, and a reason many routers stay quiet.',
      ],
      points: [
        { t: 'Topology disclosure', d: 'Router addresses and reverse names reveal providers, sites and internal numbering. Filter time-exceeded at the edge if that matters.' },
        { t: 'Finding the firewall', d: 'The hop where probes stop being answered is usually the filtering device, and the probe type that gets through shows its rules.' },
        { t: 'Loss at one hop', d: 'Loss that appears at a middle hop but not at the destination is just that router rate-limiting replies — not a real problem.' },
        { t: 'Asymmetric paths', d: 'The return path is invisible here. A trace that looks clean one way can hide a fault in the other direction.' },
        { t: 'Unexpected detours', d: 'A path that suddenly crosses an unfamiliar network may be a routing leak or a BGP hijack. Compare it with a known-good trace.' },
        { t: 'Load balancing', d: 'Equal-cost paths mean successive probes can take different routes, so one line may show several addresses.' },
      ],
    },
    protocols: ['icmp', 'udp', 'ip4', 'tcp', 'bgp'],
    related: ['ping', 'ip-route'],
    footnote: 'The -n flag skips reverse DNS for speed. Without it, each hop is also shown by name.',
  },

  // ── capture & filtering ───────────────────────────────────────────────
  {
    slug: 'tcpdump',
    cmd: 'tcpdump',
    group: 'capture',
    pkg: 'tcpdump',
    fn: 'Captures packets from an interface and prints one line per packet, filtered by an expression you supply.',
    kicker: 'Linux · capture & filtering',
    sub: 'reading the wire itself',
    lede: [
      { m: 'tcpdump' },
      ' attaches to an interface and prints ',
      { a: 'every packet that matches a filter' },
      ' — timestamp, addresses, ports and the protocol\'s own fields. When two machines disagree about what was sent, the capture is ',
      { b: 'the only account neither of them wrote' },
      '.',
    ],
    takeaway: [
      'Logs record what a program believed happened. A capture records ',
      { a: 'what was actually on the wire' },
      '.',
    ],
    points: [
      { k: 'Reads', v: 'Raw packets', note: 'via libpcap' },
      { k: 'Needs root', v: 'Yes', note: 'or CAP_NET_RAW' },
      { k: 'Filter language', v: 'BPF', note: 'host, port, tcp, and, or, not' },
      { k: 'Save for later', v: '-w file.pcap', note: 'open it in Wireshark' },
    ],
    session: {
      run: "tcpdump -ni eth0 -c 3 'tcp port 443'",
      prompt: '#',
      lines: [
        { text: 'listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes' },
        { text: '14:02:11.482913 IP 192.168.1.42.51844 > 192.0.2.10.443: Flags [S], seq 2812344571, win 64240, options [mss 1460,sackOK,nop,wscale 7], length 0', n: 1 },
        { text: '14:02:11.494760 IP 192.0.2.10.443 > 192.168.1.42.51844: Flags [S.], seq 1094023318, ack 2812344572, win 65160, options [mss 1460,sackOK,nop,wscale 7], length 0', n: 2 },
        { text: '14:02:11.494811 IP 192.168.1.42.51844 > 192.0.2.10.443: Flags [.], ack 1, win 502, length 0', n: 3 },
        { text: '3 packets captured', n: 4 },
      ],
      notes: [
        { t: 'Flags [S] is the SYN', d: 'The client, from ephemeral port 51844, asks to open a connection to port 443 and announces its initial sequence number.' },
        { t: 'Flags [S.] is the SYN-ACK', d: 'The dot is the ACK bit. The server acknowledges the client\'s sequence number plus one and offers its own. About 12 ms after the SYN — that gap is the round-trip time.' },
        { t: 'Flags [.] completes the handshake', d: 'A bare ACK from the client. tcpdump now prints relative numbers, so "ack 1" means one past the server\'s initial sequence.' },
        { t: '-c 3 stopped the capture', d: 'Without a count it runs until interrupted. "length 0" on all three confirms no application data has moved yet — that begins with the next packet.' },
      ],
    },
    recipes: [
      { run: 'tcpdump -ni any port 53', d: 'DNS on every interface — the quickest way to see which names a host is asking for.' },
      { run: 'tcpdump -ni eth0 -w capture.pcap host 192.0.2.10', d: 'Writes full packets for one peer to a file, to open in Wireshark later.' },
      { run: "tcpdump -ni eth0 'tcp[tcpflags] & (tcp-syn|tcp-rst) != 0'", d: 'Only SYN and RST packets: every connection attempt and every refusal.' },
      { run: 'tcpdump -ni eth0 -e arp', d: 'ARP requests and replies with the Ethernet headers shown — who is claiming which address.' },
    ],
    security: {
      lede: [
        'A capture shows everything that is not encrypted, to ',
        { b: 'whoever is able to run one' },
        '. It is the defender\'s best evidence and the reason plaintext protocols are a liability.',
      ],
      points: [
        { t: 'Plaintext is readable', d: 'Telnet, FTP and plain HTTP put credentials on the wire as text. One capture with -A is all it takes to prove it.' },
        { t: 'Capture files are sensitive', d: 'A pcap holds whatever crossed the link — session cookies, internal names, sometimes passwords. Store and share it accordingly.' },
        { t: 'Who may capture', d: 'CAP_NET_RAW is close to full visibility of the host\'s traffic. Grant it deliberately, not by adding users to a group.' },
        { t: 'TLS limits the view', d: 'Encrypted traffic shows addresses, ports, timing and the server name in the handshake — not the content.' },
        { t: 'Scans are obvious here', d: 'A burst of SYNs to many ports from one source, answered by RSTs, is a port scan as it looks on the wire.' },
        { t: 'Capture where it matters', d: 'A host sees only its own traffic on a switched network. Seeing more needs a mirror port or a tap.' },
      ],
    },
    protocols: ['tcp', 'udp', 'ip4', 'eth', 'arp', 'tls'],
    related: ['ss', 'ip-neigh'],
    footnote: 'TCP options are shortened in this sample; a real capture also prints timestamps in each option list.',
  },
  {
    slug: 'nft',
    cmd: 'nft',
    group: 'capture',
    pkg: 'nftables',
    fn: 'Reads and edits the kernel packet filter — the tables, chains and rules that decide which packets a host accepts, forwards or drops.',
    kicker: 'Linux · capture & filtering',
    sub: 'which packets may pass',
    lede: [
      { m: 'nft' },
      ' is the front end to nftables, the packet filter that replaced iptables. Rules live in ',
      { a: 'chains hooked into the packet path' },
      ' and are read top to bottom: the first rule with a verdict ends the walk, and the chain\'s ',
      { b: 'policy decides whatever reaches the bottom' },
      '.',
    ],
    takeaway: [
      'A firewall is ',
      { a: 'an ordered list with a default' },
      ' — and the default is the most important line in it.',
    ],
    points: [
      { k: 'Controls', v: 'Netfilter', note: 'the in-kernel packet filter' },
      { k: 'Needs root', v: 'Always', note: 'even to list the rules' },
      { k: 'Replaces', v: 'iptables', note: 'one tool for IPv4 and IPv6' },
      { k: 'Front ends', v: 'ufw, firewalld', note: 'both generate rules like these' },
    ],
    session: {
      run: 'nft list ruleset',
      prompt: '#',
      lines: [
        { text: 'table inet filter {', n: 1 },
        { text: '        chain input {' },
        { text: '                type filter hook input priority filter; policy drop;', n: 2 },
        { text: '                ct state established,related accept', n: 3 },
        { text: '                iifname "lo" accept' },
        { text: '                ip protocol icmp accept' },
        { text: '                tcp dport 22 accept', n: 4 },
        { text: '                counter packets 318 bytes 21904 drop', n: 5 },
        { text: '        }' },
        { text: '}' },
      ],
      notes: [
        { t: 'inet covers both address families', d: 'One table filters IPv4 and IPv6 together, which closes the old gap where only the IPv4 rules were ever written.' },
        { t: 'The hook and the policy', d: '"hook input" attaches the chain to packets addressed to this host. "policy drop" is the default: anything no rule accepts is discarded.' },
        { t: 'Connection tracking does the heavy lifting', d: 'Replies to connections this host opened are accepted here, so the rules below only have to describe new inbound traffic.' },
        { t: 'One opening', d: 'New TCP connections to port 22 are let in. This single line is the host\'s entire inbound attack surface.' },
        { t: 'The counter shows what was refused', d: '318 packets reached the end of the chain and were dropped. A number that climbs quickly is a scan in progress.' },
      ],
    },
    recipes: [
      { run: 'nft add rule inet filter input tcp dport 443 accept', d: 'Appends a rule opening HTTPS. Appended after a final drop rule it would never be reached — order matters.' },
      { run: 'nft -a list chain inet filter input', d: 'Lists one chain with rule handles, the numbers needed to delete or insert a specific rule.' },
      { run: 'nft delete rule inet filter input handle 7', d: 'Removes exactly one rule by its handle.' },
      { run: 'nft -f /etc/nftables.conf', d: 'Loads a whole ruleset from a file in one atomic step — the way to make changes that survive a reboot.' },
    ],
    security: {
      lede: [
        'The ruleset is the host\'s own statement of ',
        { b: 'what it is willing to hear' },
        '. Most firewall failures are not clever bypasses — they are a rule in the wrong place or a default left open.',
      ],
      points: [
        { t: 'Default deny', d: 'A policy of accept with a few drop rules fails open. Start from drop and list what is allowed.' },
        { t: 'Rule order', d: 'The first matching verdict wins. A broad accept near the top silently cancels every drop beneath it.' },
        { t: 'Do not lock yourself out', d: 'Apply changes over SSH with a timed rollback, and keep the established,related rule first.' },
        { t: 'Outbound matters too', d: 'An output chain that allows everything lets a compromised host call out freely. Egress filtering limits the damage.' },
        { t: 'Log before dropping', d: 'A drop with no log line is invisible. Count and rate-limit the log so a scan cannot fill the disk.' },
        { t: 'One source of truth', d: 'Docker, firewalld and hand-written rules all write to the same kernel tables. Read the live ruleset, not just the config file.' },
      ],
    },
    protocols: ['tcp', 'udp', 'icmp', 'ip4', 'ip6', 'nat'],
    related: ['ss', 'tcpdump'],
    footnote: 'A minimal host ruleset. Production rulesets usually add logging, rate limits and a forward chain.',
  },
];

export const linuxBySlug: Record<string, LinuxCommand> = Object.fromEntries(
  linuxCommands.map((command) => [command.slug, command]),
);

export const linuxGroupById: Record<string, LinuxGroup> = Object.fromEntries(
  linuxGroups.map((group) => [group.id, group]),
);

export const linuxByGroup = linuxGroups.map((group) => ({
  ...group,
  commands: linuxCommands.filter((command) => command.group === group.id),
}));

export const linuxByPart = linuxParts.map((part) => ({
  ...part,
  groups: linuxByGroup.filter((group) => group.part === part.id),
}));

/* the nav menu shows nine to start with — the shell first, then the network */
const MENU_SLUGS = ['ls', 'cd', 'cp', 'ps', 'chmod', 'ip-addr', 'dig', 'ss', 'tcpdump'];

export const linuxMenu = MENU_SLUGS.map((slug) => linuxBySlug[slug]).filter(
  (command): command is LinuxCommand => Boolean(command),
);

export function linuxHref(command: Pick<LinuxCommand, 'slug'>) {
  return `${LINUX_HREF}/${command.slug}`;
}

export function linuxNeighbours(slug: string) {
  const index = linuxCommands.findIndex((command) => command.slug === slug);
  return {
    prev: index > 0 ? linuxCommands[index - 1] : undefined,
    next: index >= 0 && index < linuxCommands.length - 1 ? linuxCommands[index + 1] : undefined,
  };
}

/** the commands that show a given protocol — the reverse of `protocols` */
export function linuxForProtocol(protocolId: string) {
  return linuxCommands.filter((command) => command.protocols.includes(protocolId));
}
