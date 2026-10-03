import type { LinuxCommand } from '../linux-data';
import type { LinuxSwitch } from '../linux-switches';
import * as files from './files';
import * as network from './network';
import * as process from './process';
import * as system from './system';
import * as text from './text';
import * as users from './users';

/* The second batch of commands, split across files by subject so that no one
   file has to hold a hundred records. linux-data merges `moreCommands` into
   the catalogue group by group, and linux-switches does the same with
   `moreSwitches`. These files import only types from those two, so there is
   no cycle at run time. */

const parts = [files, text, system, process, users, network];

export const moreCommands: LinuxCommand[] = parts.flatMap((part) => part.commands);

export const moreSwitches: Record<string, LinuxSwitch[]> = Object.assign(
  {},
  ...parts.map((part) => part.switches),
);
