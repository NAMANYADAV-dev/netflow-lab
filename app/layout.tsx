import type { Metadata } from 'next';
import { Archivo, Source_Serif_4 } from 'next/font/google';
import PressPlates from '@/components/PressPlates';
import { site } from '@/lib/site';
import './broadsheet.css';

/* Two voices, the way a broadsheet actually sets one.

   The serif carries what is read — headlines, decks, body. Loading it through
   next/font self-hosts the files and inlines the @font-face, so there is no
   render-blocking round trip to fonts.googleapis.com the way the design
   source's @import had. `variable` publishes the family as --font-serif, which
   is what the --font-heading/--font-body tokens resolve to.

   The grotesque carries the furniture — kickers, tags, table heads, captions,
   the small tracked capitals a serif was never cut to set. Neither is given a
   `weight`, so next/font fetches the variable cut of each: one file apiece for
   the whole range, rather than a file per weight. */
const serif = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const gothic = Archivo({
  subsets: ['latin'],
  variable: '--font-gothic',
  display: 'swap',
});

export const metadata: Metadata = {
  /* every relative URL below — canonicals, og:url, the share image — is
     resolved against this, so it has to be absolute and it has to be right */
  metadataBase: new URL(site.origin),
  title: {
    default: 'The Protocol Atlas · NetFlow Lab',
    /* pages already write their own full title, so the template only catches
       any that forget: they still end up branded rather than bare */
    template: '%s · NetFlow Lab',
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  category: 'technology',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: '/',
    title: 'The Protocol Atlas · NetFlow Lab',
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Protocol Atlas · NetFlow Lab',
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${gothic.variable}`}>
      <body>
        {children}
        {/* the separation filters have to live in the document for the url(#…)
            references to resolve, and outside any one section so nothing can
            strand them */}
        <PressPlates />
      </body>
    </html>
  );
}
