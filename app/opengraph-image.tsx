import { ImageResponse } from 'next/og';
import { site } from '@/lib/site';

/* The card that shows when someone pastes a link into WhatsApp, Slack or a
   tweet. Drawn rather than photographed so it stays legible at thumbnail size:
   the masthead rule, the title, one line of standfirst, and the two counts that
   say what the site actually is. Built at request time by Next's OG renderer,
   so there is no asset to keep in sync with the copy. */

export const alt = 'NetFlow Lab — a field guide to the wire';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/* the broadsheet palette, stated literally: the OG renderer resolves no CSS
   variables and loads no stylesheet */
const INK = '#0c1116';
const PAPER = '#f4f1ea';
const CYAN = '#0b6b80';
const MAGENTA = '#c0356b';
const MUTED = '#5b6670';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          color: INK,
          padding: '64px 72px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* masthead rule */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `3px solid ${INK}`,
            paddingBottom: 18,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: MUTED,
          }}
        >
          <span>{site.name}</span>
          <span>{site.tagline}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 92,
              lineHeight: 1.04,
              letterSpacing: -2,
              fontWeight: 700,
            }}
          >
            The whole stack,
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 92,
              lineHeight: 1.04,
              letterSpacing: -2,
              fontWeight: 700,
              color: CYAN,
            }}
          >
            one protocol at a time.
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 31,
              lineHeight: 1.45,
              color: MUTED,
              maxWidth: 900,
            }}
          >
            From the frame on the wire to the token in a login — read it, then run it.
          </div>
        </div>

        {/* the two counts, the way the site states them */}
        <div
          style={{
            display: 'flex',
            gap: 56,
            alignItems: 'flex-end',
            borderTop: `1px solid ${MUTED}`,
            paddingTop: 22,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 62, fontWeight: 700, color: MAGENTA }}>48</span>
            <span style={{ fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', color: MUTED }}>
              protocols
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 62, fontWeight: 700, color: CYAN }}>11</span>
            <span style={{ fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', color: MUTED }}>
              interactive labs
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
