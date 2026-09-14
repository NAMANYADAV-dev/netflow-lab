/* The lab shows SNMP; this file shows how to do it.

   For each stretch of the exchange, the Net-SNMP command that sends the same
   message, and what the lab's router would print back. Every command targets
   127.0.0.1 — an agent on the reader's own computer — so nobody practises on
   a device they do not own.

   Flags and config lines follow the Ubuntu 22.04 (Net-SNMP 5.9.1) manual
   pages: -Cn/-Cr on snmpbulkget, SHA-256 and AES on -a/-x, createUser in
   /var/lib/snmp/snmpd.conf, `rouser USER priv`, and the fact that the stock
   agent only shares the system subtree until a view line adds interfaces. */

import type { Scenario } from './snmp-data';

export type Command = {
  /** a short note above the command, when there is more than one terminal */
  label?: string;
  cmd: string;
};

export type Practice = {
  goal: string;
  commands: Command[];
  /** what the lab's router would print — the reader's own values differ */
  output?: string[];
  /** said in words where the exact output is not worth reproducing */
  outputNote?: string;
  tip: string;
};

const AGENT = '127.0.0.1';

const uptime: Practice = {
  goal: 'ask a device how long it has been running',
  commands: [{ cmd: `snmpget -v2c -c public ${AGENT} 1.3.6.1.2.1.1.3.0` }],
  output: ['iso.3.6.1.2.1.1.3.0 = Timeticks: (365108300) 42 days, 6:11:23.00'],
  tip: '-v2c picks the version, -c public is the password, and 1.3.6.1.2.1.1.3.0 is the uptime value this step asked for.',
};

const bulk: Practice = {
  goal: 'get the interface table in one request',
  commands: [{
    cmd: `snmpbulkget -v2c -c public -Cn1 -Cr3 ${AGENT} 1.3.6.1.2.1.1.3 1.3.6.1.2.1.2.2.1.2 1.3.6.1.2.1.2.2.1.8 1.3.6.1.2.1.2.2.1.10`,
  }],
  output: [
    'iso.3.6.1.2.1.1.3.0 = Timeticks: (365108312) 42 days, 6:11:23.12',
    'iso.3.6.1.2.1.2.2.1.2.1 = STRING: "GigabitEthernet0/0"',
    'iso.3.6.1.2.1.2.2.1.8.1 = INTEGER: 1',
    'iso.3.6.1.2.1.2.2.1.10.1 = Counter32: 2871403112',
    '…six more lines, for ports 2 and 3',
  ],
  tip: '-Cn1 fetches the first value once, and -Cr3 steps the other three forward three rows. On a computer the first interface is usually lo, the loopback.',
};

const counter: Practice = {
  goal: 'read a byte counter twice and work out the speed',
  commands: [{
    label: 'run it, wait 60 seconds, run it again',
    cmd: `snmpget -v2c -c public ${AGENT} 1.3.6.1.2.1.1.3.0 1.3.6.1.2.1.2.2.1.10.3`,
  }],
  output: [
    'iso.3.6.1.2.1.1.3.0 = Timeticks: (365114312) 42 days, 6:12:23.12',
    'iso.3.6.1.2.1.2.2.1.10.3 = Counter32: 1542275210',
  ],
  tip: 'Change the final .3 to an interface number from the bulk step. Then (second − first) × 8 ÷ seconds between them = bits per second.',
};

const trap: Practice = {
  goal: 'catch an alarm (a trap)',
  commands: [
    { label: 'terminal 1 — listen on UDP 162', cmd: 'sudo snmptrapd -f -Lo' },
    {
      label: 'terminal 2 — send the same linkDown alarm',
      cmd: `snmptrap -v2c -c public ${AGENT} '' 1.3.6.1.6.3.1.1.5.3 1.3.6.1.2.1.2.2.1.1.3 i 3 1.3.6.1.2.1.2.2.1.7.3 i 1 1.3.6.1.2.1.2.2.1.8.3 i 2`,
    },
  ],
  outputNote: 'Terminal 1 prints the trap the moment it arrives: the uptime, linkDown (1.3.6.1.6.3.1.1.5.3) and the three interface values.',
  tip: 'The empty \'\' means “use this computer’s uptime”, and each i marks an INTEGER value. The receiver ignores traps until step 5 of the setup guide.',
};

const locked = (discovery: boolean): Practice => ({
  goal: 'ask the same question with SNMPv3, signed and locked',
  commands: [{
    cmd: `snmpget -v3 -l authPriv -u nms-ro -a SHA-256 -A authpass123 -x AES -X privpass123 ${AGENT} 1.3.6.1.2.1.1.3.0`,
  }],
  output: ['iso.3.6.1.2.1.1.3.0 = Timeticks: (365108342) 42 days, 6:11:23.42'],
  tip: discovery
    ? 'You never ask for the router’s ID yourself — snmpget does steps 1 and 2 on its own. Add -d to the command to see those packets, printed in hex.'
    : 'Change -A to a wrong password and run it again: the agent rejects the signature, and snmpget reports an authentication failure instead of an answer.',
});

/** the practice for where the reader is in the story, or nothing before it starts */
export function practiceFor(sc: Scenario, step: number): Practice | null {
  if (step === 0) return null;
  if (sc === 'secure') return locked(step <= 2);
  if (step <= 2) return uptime;
  if (step <= 4) return bulk;
  if (step <= 6) return counter;
  return trap;
}

export type SetupStep = { title: string; body: string; commands: string[] };

export const setup: SetupStep[] = [
  {
    title: 'Open a Linux terminal',
    body: 'On Windows, open PowerShell as administrator, run this, restart, then open “Ubuntu” from the Start menu. Already on Ubuntu? Skip this step.',
    commands: ['wsl --install'],
  },
  {
    title: 'Install the tools, the agent and the trap receiver',
    body: 'snmp gives you snmpget and the other commands, snmpd is the agent that answers them, and snmptrapd receives alarms.',
    commands: ['sudo apt update', 'sudo apt install -y snmp snmpd snmptrapd'],
  },
  {
    title: 'Let the agent share its interface counters',
    body: 'Out of the box the agent answers only on 127.0.0.1 and shares only basic system information. This one line adds the interface table.',
    commands: [
      "echo 'view systemonly included .1.3.6.1.2.1.2' | sudo tee -a /etc/snmp/snmpd.conf",
      'sudo service snmpd restart',
    ],
  },
  {
    title: 'Create the SNMPv3 user nms-ro',
    body: 'The agent has to be stopped while its user file is edited, and each password needs at least 8 characters.',
    commands: [
      'sudo service snmpd stop',
      'echo \'createUser nms-ro SHA-256 "authpass123" AES "privpass123"\' | sudo tee -a /var/lib/snmp/snmpd.conf',
      "echo 'rouser nms-ro priv' | sudo tee -a /etc/snmp/snmpd.conf",
      'sudo service snmpd start',
    ],
  },
  {
    title: 'Allow the lab’s traps',
    body: 'The trap receiver drops every alarm until it is told which community to accept. Stopping the background copy frees port 162 for the one you start by hand.',
    commands: [
      "echo 'authCommunity log public' | sudo tee -a /etc/snmp/snmptrapd.conf",
      'sudo service snmptrapd stop',
    ],
  },
];
