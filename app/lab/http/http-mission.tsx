import type { ScenarioMission } from '../LabMission';
import type { Visit } from './http-data';

/* Mission, step prompts and end-of-lab questions for each HTTP scenario.
   nudges[i] is asked before step i + 1 plays. */
export const MISSIONS: Record<Visit, ScenarioMission> = {
  first: {
    mission: 'Fetch example.com/index.html and count how many requests one page really takes.',
    nudges: [
      'HTTP can’t move bytes on its own. What has to exist before the browser can send anything?',
      'The connection is open. What short plain-text message does the browser write?',
      'The server has read the request. What does it need to work out before it can reply?',
      'The server found the resource. What comes back first, before the page itself?',
      'The status line and headers have arrived. What follows right behind them on the same connection?',
      'While reading the HTML, the browser finds a stylesheet, a script and an image. What does it do?',
    ],
    checks: [
      {
        q: 'How many HTTP requests did loading one page take?',
        options: [
          'One.',
          'Two: one for the headers and one for the body.',
          'Four: the HTML, then a stylesheet, a script and an image.',
        ],
        correct: 2,
        why: 'The HTML names other resources, and the browser requests each one separately, all over the same connection. One page cost four requests.',
      },
      {
        q: 'What does the server remember about you between requests?',
        options: [
          'Nothing. Each request stands on its own.',
          'The last page you asked for.',
          'Everything you have requested so far.',
        ],
        correct: 0,
        why: 'HTTP is stateless. Anything the server needs to know, like who you are, has to travel with each request, for example in a cookie.',
      },
    ],
  },
  revisit: {
    mission: 'Reload the same page — and find the request that sends no page back.',
    nudges: [
      'The browser was just on this site. Does it need to build a brand-new connection?',
      'The browser already has a copy of the page. What can it add to the GET so the server doesn’t resend it?',
      'The server received the tag of the copy the browser holds. What does it compare it with?',
      'The tags match. How much of the page does the server need to send?',
    ],
    checks: [
      {
        q: 'Why does the revisit feel instant?',
        options: [
          'The server sends the page faster the second time.',
          'The server replies 304 Not Modified with no body, so the browser uses its cached copy.',
          'The browser skips the request completely.',
        ],
        correct: 1,
        why: 'The browser still asks, but conditionally. The tag matches, so the server answers 304 with a 0-byte body and the page comes from the browser’s cache.',
      },
      {
        q: 'What does the If-None-Match header carry?',
        options: [
          'The ETag of the copy the browser already has.',
          'The user’s password.',
          'The size of the page in bytes.',
        ],
        correct: 0,
        why: 'The browser sends back the ETag it saved last time. If the server’s current tag for the resource is the same, the page hasn’t changed and there is nothing to send.',
      },
    ],
  },
};
