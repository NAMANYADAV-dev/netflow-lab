import type { ScenarioMission } from '../LabMission';
import type { Cache } from './dns-data';

/* Mission, step prompts and end-of-lab questions for each DNS scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<Cache, ScenarioMission> = {
  cold: {
    mission: 'Turn www.example.com into an address, starting from a resolver that knows nothing.',
    nudges: [
      'Before any packet leaves, where is the closest place this name might already be stored?',
      'The browser didn’t have it. What is the next place to check on the same machine?',
      'Nothing on PC-1 knows the name. Which device on the network does PC-1 send its query to?',
      'The router only forwards. The query reaches the public resolver. What does the resolver check first?',
      'The resolver’s cache is empty. Where does every lookup start when nothing is cached?',
      'Root sent back a referral, not an answer. Who does the resolver ask next?',
      'The .com server named example.com’s own nameserver. What will that server send back?',
      'The resolver has the answer. What does it do with it first, so the next lookup is faster?',
      'The answer heads back to PC-1. What happens at each stop it passes on the way?',
    ],
    checks: [
      {
        q: 'Who actually walks the tree (root → .com → authoritative)?',
        options: [
          'PC-1 itself.',
          'The home router.',
          'The recursive resolver, 1.1.1.1.',
        ],
        correct: 2,
        why: 'PC-1 sends one recursive query and the router only forwards it. The resolver asks root, then .com, then the zone’s own server, and each reply comes back to the resolver. The servers never talk to each other.',
      },
      {
        q: 'What does the root server send back?',
        options: [
          'The IP address of www.example.com.',
          'A referral to the .com nameservers.',
          'An error, because it doesn’t know the name.',
        ],
        correct: 1,
        why: 'Root never holds the address. It replies with no answer and a referral: the .com nameservers in the AUTHORITY section and their glue addresses in ADDITIONAL.',
      },
    ],
  },
  warm: {
    mission: 'Ask for the same name again and find out what the cache just saved you.',
    nudges: [
      'It’s the same name as a minute ago. Will the browser’s short-lived cache still have it?',
      'The browser missed again. What is next on the same machine?',
      'Still nothing on PC-1. Where does the query go now?',
      'The resolver looked this name up a minute ago with a 300-second TTL. What will it find in its cache?',
      'The resolver has the answer. Does it need to contact root, .com or the owner?',
    ],
    checks: [
      {
        q: 'In the warm run, where is the answer found?',
        options: [
          'In the browser cache.',
          'In the resolver’s cache.',
          'At the authoritative server.',
        ],
        correct: 1,
        why: 'The browser, OS and router caches all miss again. The resolver still holds the record with 284 of its 300 seconds left, so it answers without asking anyone.',
      },
      {
        q: 'Who decides how long an answer may be cached?',
        options: [
          'The resolver.',
          'The browser.',
          'The zone owner, through the TTL on the record.',
        ],
        correct: 2,
        why: 'The TTL (300 s here) is set in the zone by the domain’s owner. Every cache that stores the record counts down from it and must ask again once it hits zero.',
      },
    ],
  },
};
