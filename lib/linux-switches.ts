/* The switches worth knowing for each command, keyed by the command's slug.

   Kept apart from linux-data because it is reference rather than narrative:
   the command record tells one story through one session, and this is the list
   a reader comes back to afterwards — "what was the flag for human-readable
   sizes again". Each command gets the handful that cover everyday use, not its
   whole manual page.

   A switch is written as it is typed. Where one takes a value, the value is
   shown in capitals: `-n NUM`. */

export type LinuxSwitch = { flag: string; d: string };

export const linuxSwitches: Record<string, LinuxSwitch[]> = {
  // ── navigation ────────────────────────────────────────────────────────
  pwd: [
    { flag: '-L', d: 'Logical: print the path as you walked it, symbolic links included. This is the default.' },
    { flag: '-P', d: 'Physical: resolve every symbolic link and print where you really are on disk.' },
  ],
  ls: [
    { flag: '-l', d: 'Long format: permissions, owner, group, size and date, one entry per line.' },
    { flag: '-a', d: 'All: include the hidden entries whose names begin with a dot.' },
    { flag: '-h', d: 'Human-readable sizes — 4.0K, 12M, 1.3G — when used with -l.' },
    { flag: '-R', d: 'Recursive: list every sub-directory beneath as well.' },
    { flag: '-t', d: 'Sort by modification time, newest first.' },
    { flag: '-r', d: 'Reverse the sort order. With -t, oldest first.' },
    { flag: '-S', d: 'Sort by size, largest first.' },
    { flag: '-d', d: 'List the directory itself rather than its contents.' },
  ],
  cd: [
    { flag: '-', d: 'Go back to the directory you were in before the last cd.' },
    { flag: '..', d: 'Go up one level, to the parent directory.' },
    { flag: '~', d: 'Go to your home directory. Plain cd does the same.' },
    { flag: '-P', d: 'Follow the physical path: resolve symbolic links instead of keeping them in the path.' },
  ],
  find: [
    { flag: '-name PATTERN', d: 'Match the file name against a pattern such as "*.log". Case-sensitive.' },
    { flag: '-iname PATTERN', d: 'The same, ignoring upper and lower case.' },
    { flag: '-type f', d: 'Only regular files. Use d for directories, l for symbolic links.' },
    { flag: '-size +100M', d: 'Only files larger than 100 MB. A minus sign means smaller than.' },
    { flag: '-mtime -7', d: 'Only files modified within the last 7 days. +7 means more than 7 days ago.' },
    { flag: '-maxdepth N', d: 'Descend at most N levels below the starting directory.' },
    { flag: '-exec CMD {} \\;', d: 'Run a command on each match; {} is replaced by the file’s path.' },
    { flag: '-delete', d: 'Delete each match. Run the search without it first to see what would go.' },
  ],

  // ── file management ───────────────────────────────────────────────────
  mkdir: [
    { flag: '-p', d: 'Parents: create any missing directories along the path, and do not complain if it already exists.' },
    { flag: '-v', d: 'Verbose: print a line for each directory created.' },
    { flag: '-m MODE', d: 'Set the permissions at creation, for example -m 700.' },
  ],
  cp: [
    { flag: '-r', d: 'Recursive: copy a directory and everything inside it. -R is the same.' },
    { flag: '-a', d: 'Archive: recursive, and keep permissions, ownership, timestamps and links. The one to use for backups.' },
    { flag: '-i', d: 'Interactive: ask before overwriting a file that already exists.' },
    { flag: '-n', d: 'No-clobber: never overwrite an existing file.' },
    { flag: '-u', d: 'Update: copy only when the source is newer than the destination, or the destination is missing.' },
    { flag: '-p', d: 'Preserve the mode, ownership and timestamps of each file.' },
    { flag: '-v', d: 'Verbose: print each file as it is copied.' },
  ],
  mv: [
    { flag: '-i', d: 'Interactive: ask before overwriting an existing file.' },
    { flag: '-n', d: 'No-clobber: never overwrite an existing file.' },
    { flag: '-u', d: 'Update: move only when the source is newer than the destination.' },
    { flag: '-f', d: 'Force: overwrite without asking, even if -i was set by an alias.' },
    { flag: '-v', d: 'Verbose: print each file as it is moved or renamed.' },
  ],
  rm: [
    { flag: '-r', d: 'Recursive: remove a directory and everything inside it. -R is the same.' },
    { flag: '-f', d: 'Force: never ask, and stay silent about files that do not exist.' },
    { flag: '-i', d: 'Interactive: ask before every removal.' },
    { flag: '-I', d: 'Ask once, before removing more than three files or removing recursively.' },
    { flag: '-d', d: 'Remove an empty directory, as rmdir does.' },
    { flag: '-v', d: 'Verbose: print each file as it is removed.' },
  ],
  touch: [
    { flag: '-c', d: 'Do not create the file if it does not exist — only update one that does.' },
    { flag: '-a', d: 'Change only the access time.' },
    { flag: '-m', d: 'Change only the modification time.' },
    { flag: '-d STRING', d: 'Use the given date instead of now, for example -d "2026-01-01 09:00".' },
    { flag: '-r FILE', d: 'Use another file’s timestamps instead of now.' },
  ],
  tar: [
    { flag: '-c', d: 'Create a new archive.' },
    { flag: '-x', d: 'Extract files from an archive.' },
    { flag: '-t', d: 'List the contents of an archive without extracting.' },
    { flag: '-f FILE', d: 'The archive to work on. Nearly every tar command needs it.' },
    { flag: '-z', d: 'Compress or decompress with gzip — the .tar.gz format.' },
    { flag: '-J', d: 'Compress or decompress with xz — smaller, slower. -j is bzip2.' },
    { flag: '-v', d: 'Verbose: print each file as it is added or extracted.' },
    { flag: '-C DIR', d: 'Change to this directory before extracting or adding.' },
  ],

  // ── reading files ─────────────────────────────────────────────────────
  cat: [
    { flag: '-n', d: 'Number every output line.' },
    { flag: '-b', d: 'Number only the lines that are not blank.' },
    { flag: '-s', d: 'Squeeze: show a run of blank lines as a single blank line.' },
    { flag: '-A', d: 'Show all: mark line ends with $, tabs as ^I, and other invisible characters.' },
    { flag: '-E', d: 'Mark the end of each line with $ — shows up trailing spaces.' },
  ],
  grep: [
    { flag: '-i', d: 'Ignore case: match upper and lower case alike.' },
    { flag: '-v', d: 'Invert: print the lines that do not match.' },
    { flag: '-n', d: 'Prefix each match with its line number.' },
    { flag: '-r', d: 'Recursive: search every file under a directory.' },
    { flag: '-c', d: 'Count: print how many lines matched, not the lines themselves.' },
    { flag: '-l', d: 'List only the names of the files that contain a match.' },
    { flag: '-w', d: 'Match whole words only, so "log" does not match "login".' },
    { flag: '-E', d: 'Extended regular expressions: |, + and ? work without backslashes.' },
    { flag: '-A NUM', d: 'Also print NUM lines after each match. -B is before, -C is both.' },
    { flag: '-o', d: 'Print only the part of the line that matched.' },
  ],
  tail: [
    { flag: '-n NUM', d: 'Print the last NUM lines instead of the last 10.' },
    { flag: '-n +NUM', d: 'Print from line NUM to the end of the file.' },
    { flag: '-f', d: 'Follow: keep the file open and print new lines as they are written.' },
    { flag: '-F', d: 'Follow by name: keep following even if the file is rotated and recreated.' },
    { flag: '-c NUM', d: 'Print the last NUM bytes instead of lines.' },
  ],

  // ── disks & space ─────────────────────────────────────────────────────
  df: [
    { flag: '-h', d: 'Human-readable sizes in powers of 1024: K, M, G.' },
    { flag: '-H', d: 'The same, in powers of 1000 — as disk manufacturers count.' },
    { flag: '-T', d: 'Add a column showing each filesystem’s type: ext4, xfs, tmpfs.' },
    { flag: '-i', d: 'Show inodes instead of space — a disk can run out of these while space remains.' },
    { flag: '-x TYPE', d: 'Exclude a filesystem type, for example -x tmpfs.' },
    { flag: '--total', d: 'Add a final line with the grand total.' },
  ],
  du: [
    { flag: '-s', d: 'Summarise: print one total for each argument, not every sub-directory.' },
    { flag: '-h', d: 'Human-readable sizes: K, M, G.' },
    { flag: '-a', d: 'All: report files as well as directories.' },
    { flag: '-c', d: 'Add a grand total at the end.' },
    { flag: '-d NUM', d: 'Report only NUM levels deep. --max-depth=NUM is the same.' },
    { flag: '-x', d: 'Stay on one filesystem: do not cross into other mounted disks.' },
  ],

  // ── process & service management ──────────────────────────────────────
  ps: [
    { flag: 'aux', d: 'BSD style, no dash: every process, with its owner, CPU and memory use.' },
    { flag: '-e', d: 'Every process on the system. -A is the same.' },
    { flag: '-f', d: 'Full format: adds the parent process id and the full command line.' },
    { flag: '-u USER', d: 'Only the processes belonging to this user.' },
    { flag: '-p PID', d: 'Only the process with this id.' },
    { flag: '--forest', d: 'Draw parent and child processes as a tree.' },
    { flag: '-o FIELDS', d: 'Choose the columns yourself, for example -o pid,user,%cpu,cmd.' },
  ],
  kill: [
    { flag: '-l', d: 'List every signal name and its number.' },
    { flag: '-15', d: 'SIGTERM, the default: ask the process to shut down cleanly. Also written -TERM.' },
    { flag: '-9', d: 'SIGKILL: stop the process at once, with no chance to clean up. Also written -KILL.' },
    { flag: '-1', d: 'SIGHUP: for many services, re-read the configuration. Also written -HUP.' },
    { flag: '-STOP', d: 'Pause the process. -CONT resumes it.' },
  ],
  top: [
    { flag: '-b', d: 'Batch mode: print plain text instead of taking over the screen — for scripts and pipes.' },
    { flag: '-n NUM', d: 'Refresh NUM times, then exit.' },
    { flag: '-d SECS', d: 'Wait this many seconds between refreshes.' },
    { flag: '-u USER', d: 'Show only this user’s processes.' },
    { flag: '-p PID', d: 'Watch only the processes with these ids.' },
    { flag: '-H', d: 'Show individual threads instead of whole processes.' },
  ],
  systemctl: [
    { flag: '--now', d: 'With enable or disable, also start or stop the service immediately.' },
    { flag: '--failed', d: 'List only the units that have failed.' },
    { flag: '-t TYPE', d: 'Limit a listing to one unit type, for example -t service.' },
    { flag: '-a', d: 'All: include units that are loaded but inactive.' },
    { flag: '--user', d: 'Talk to your own user’s service manager instead of the system’s.' },
    { flag: '--no-pager', d: 'Print straight to the terminal instead of opening a pager.' },
  ],

  // ── users & permissions ───────────────────────────────────────────────
  chmod: [
    { flag: '-R', d: 'Recursive: apply the change to a directory and everything beneath it.' },
    { flag: '-v', d: 'Verbose: print a line for every file processed.' },
    { flag: '-c', d: 'Changes: print a line only for the files that were actually changed.' },
    { flag: '-f', d: 'Quiet: suppress most error messages.' },
    { flag: '--reference=FILE', d: 'Copy the mode from another file instead of naming one.' },
  ],
  chown: [
    { flag: '-R', d: 'Recursive: change a directory and everything beneath it.' },
    { flag: '-v', d: 'Verbose: print a line for every file processed.' },
    { flag: '-c', d: 'Changes: print a line only for the files that were actually changed.' },
    { flag: '-h', d: 'Change a symbolic link itself, not the file it points to.' },
    { flag: '--from=OWNER:GROUP', d: 'Change only the files currently owned by this user and group.' },
    { flag: '--reference=FILE', d: 'Copy the owner and group from another file.' },
  ],
  chgrp: [
    { flag: '-R', d: 'Recursive: change a directory and everything beneath it.' },
    { flag: '-v', d: 'Verbose: print a line for every file processed.' },
    { flag: '-c', d: 'Changes: print a line only for the files that were actually changed.' },
    { flag: '-h', d: 'Change a symbolic link itself, not the file it points to.' },
    { flag: '-f', d: 'Quiet: suppress most error messages.' },
    { flag: '--reference=FILE', d: 'Copy the group from another file instead of naming one.' },
  ],
  sudo: [
    { flag: '-i', d: 'Start a login shell as root, in root’s home directory.' },
    { flag: '-u USER', d: 'Run the command as this user instead of root.' },
    { flag: '-l', d: 'List what you are allowed to run with sudo.' },
    { flag: '-s', d: 'Start a shell as root, keeping your current directory.' },
    { flag: '-k', d: 'Forget the cached password, so the next sudo asks again.' },
    { flag: '-v', d: 'Refresh the cached password without running anything.' },
    { flag: '-E', d: 'Keep your own environment variables for the command.' },
  ],

  // ── interfaces & addressing ───────────────────────────────────────────
  'ip-addr': [
    { flag: '-br', d: 'Brief: one line per interface — name, state and addresses. Written "ip -br addr".' },
    { flag: '-4', d: 'Show only IPv4 addresses.' },
    { flag: '-6', d: 'Show only IPv6 addresses.' },
    { flag: '-c', d: 'Colour the output, so addresses and states stand out.' },
    { flag: '-s', d: 'Add statistics: packets, bytes and errors per interface.' },
    { flag: '-j', d: 'Print JSON, for scripts. Add -p to make it readable.' },
  ],
  'ip-link': [
    { flag: '-br', d: 'Brief: one line per interface — name, state and MAC address.' },
    { flag: '-s', d: 'Add statistics: packets, bytes, errors and drops.' },
    { flag: '-d', d: 'Details: show the kind of device — bridge, VLAN, bond — and its settings.' },
    { flag: '-c', d: 'Colour the output.' },
    { flag: '-j', d: 'Print JSON, for scripts.' },
  ],
  'ip-route': [
    { flag: '-4', d: 'Show the IPv4 routing table. This is the default.' },
    { flag: '-6', d: 'Show the IPv6 routing table.' },
    { flag: '-d', d: 'Details: show the route type and other attributes usually hidden.' },
    { flag: '-c', d: 'Colour the output.' },
    { flag: '-j', d: 'Print JSON, for scripts.' },
  ],
  'ip-neigh': [
    { flag: '-4', d: 'Show only IPv4 neighbours — the ARP table.' },
    { flag: '-6', d: 'Show only IPv6 neighbours — the NDP table.' },
    { flag: '-s', d: 'Add statistics: how long ago each entry was used and confirmed.' },
    { flag: '-c', d: 'Colour the output.' },
    { flag: '-j', d: 'Print JSON, for scripts.' },
  ],

  // ── names ─────────────────────────────────────────────────────────────
  dig: [
    { flag: '+short', d: 'Print only the answer — the address or name — and nothing else.' },
    { flag: '+trace', d: 'Follow the delegation from the root servers down, one step at a time.' },
    { flag: '-x ADDR', d: 'Reverse lookup: find the name for an IP address.' },
    { flag: '@SERVER', d: 'Ask this DNS server instead of the system’s configured one.' },
    { flag: '-t TYPE', d: 'Ask for a record type: A, AAAA, MX, NS, TXT. The type can also be given bare.' },
    { flag: '+noall +answer', d: 'Hide every section except the answer.' },
    { flag: '+tcp', d: 'Use TCP instead of UDP for the query.' },
  ],
  resolvectl: [
    { flag: '-t TYPE', d: 'With query, ask for a record type such as MX or TXT.' },
    { flag: '-i IFACE', d: 'Limit the command to one interface.' },
    { flag: '-4', d: 'Resolve to IPv4 addresses only.' },
    { flag: '-6', d: 'Resolve to IPv6 addresses only.' },
    { flag: '--no-pager', d: 'Print straight to the terminal instead of opening a pager.' },
  ],

  // ── sockets & transfer ────────────────────────────────────────────────
  ss: [
    { flag: '-t', d: 'TCP sockets only.' },
    { flag: '-u', d: 'UDP sockets only.' },
    { flag: '-l', d: 'Listening sockets only — what is waiting for connections.' },
    { flag: '-n', d: 'Numeric: show port numbers and addresses, do not look up names.' },
    { flag: '-p', d: 'Show the process that owns each socket. Needs root to see other users’.' },
    { flag: '-a', d: 'All: both listening and connected sockets.' },
    { flag: '-s', d: 'Summary: counts of sockets by type.' },
    { flag: '-4', d: 'IPv4 only. -6 is IPv6 only.' },
  ],
  curl: [
    { flag: '-I', d: 'Fetch the response headers only, with a HEAD request.' },
    { flag: '-v', d: 'Verbose: show the connection, the TLS handshake and every header sent and received.' },
    { flag: '-L', d: 'Follow redirects to the final location.' },
    { flag: '-o FILE', d: 'Save the response to this file. -O uses the name from the URL.' },
    { flag: '-s', d: 'Silent: no progress meter. Add -S to still show errors.' },
    { flag: '-H "NAME: VALUE"', d: 'Add a request header.' },
    { flag: '-X METHOD', d: 'Use this request method: POST, PUT, DELETE.' },
    { flag: '-d DATA', d: 'Send this data as the request body — makes the request a POST.' },
    { flag: '-k', d: 'Skip certificate verification. For testing only.' },
  ],

  // ── reachability ──────────────────────────────────────────────────────
  ping: [
    { flag: '-c NUM', d: 'Send NUM requests, then stop and print the summary.' },
    { flag: '-i SECS', d: 'Wait this long between requests. The default is one second.' },
    { flag: '-s SIZE', d: 'Send this many bytes of data in each request.' },
    { flag: '-W SECS', d: 'Wait at most this long for each reply.' },
    { flag: '-t TTL', d: 'Set the starting TTL of the packets sent.' },
    { flag: '-I IFACE', d: 'Send from this interface or source address.' },
    { flag: '-4', d: 'Use IPv4 only. -6 is IPv6 only.' },
    { flag: '-q', d: 'Quiet: print only the summary at the end.' },
  ],
  traceroute: [
    { flag: '-n', d: 'Numeric: show addresses only, do not look up host names. Much faster.' },
    { flag: '-I', d: 'Probe with ICMP echo requests instead of UDP.' },
    { flag: '-T', d: 'Probe with TCP SYN packets — gets through firewalls that drop the others.' },
    { flag: '-p PORT', d: 'The destination port to probe.' },
    { flag: '-m NUM', d: 'Give up after NUM hops. The default is 30.' },
    { flag: '-q NUM', d: 'Send NUM probes per hop instead of three.' },
    { flag: '-w SECS', d: 'Wait at most this long for each reply.' },
  ],

  // ── capture & filtering ───────────────────────────────────────────────
  tcpdump: [
    { flag: '-i IFACE', d: 'Capture on this interface. "any" captures on all of them.' },
    { flag: '-n', d: 'Numeric: do not turn addresses into names. -nn leaves ports as numbers too.' },
    { flag: '-c NUM', d: 'Stop after capturing NUM packets.' },
    { flag: '-w FILE', d: 'Write the raw packets to a file, to open later in Wireshark.' },
    { flag: '-r FILE', d: 'Read packets back from a saved capture file.' },
    { flag: '-v', d: 'Verbose: decode more of each packet. -vv and -vvv go further.' },
    { flag: '-e', d: 'Show the link-layer header: source and destination MAC addresses.' },
    { flag: '-A', d: 'Print each packet’s payload as text.' },
    { flag: '-X', d: 'Print each packet’s payload in hex and text side by side.' },
  ],
  nft: [
    { flag: '-a', d: 'Show each rule’s handle — the number needed to delete or replace it.' },
    { flag: '-f FILE', d: 'Load a ruleset from a file.' },
    { flag: '-c', d: 'Check: parse the commands and report errors without applying anything.' },
    { flag: '-n', d: 'Numeric: show addresses and ports as numbers.' },
    { flag: '-s', d: 'Stateless: leave counters and other changing state out of the listing.' },
    { flag: '-j', d: 'Print JSON, for scripts.' },
  ],
};
