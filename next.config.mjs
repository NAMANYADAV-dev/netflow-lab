/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

/* Everything this site loads is its own: next/font self-hosts the typeface,
   the photographs are files in public/, and nothing calls out to a third party.
   So the policy can name 'self' and stop there — every origin below that is not
   'self' would be dead weight, and dead weight in a CSP is what later gets
   loosened "because something broke".

   Two relaxations are real and worth stating plainly:

   script-src 'unsafe-inline' — Next.js ships its own inline bootstrap scripts
   with every page. Locking these down needs a per-request nonce, which needs
   middleware, which makes every page dynamic — a heavy price for a static
   reference site whose only text input is compared against a string and never
   rendered as markup. Revisit this the day the site grows a real input.

   style-src 'unsafe-inline' — the labs colour their SVG diagrams through React
   style props, which become inline style attributes. There is no way around it
   short of rewriting every diagram to use classes only. */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  /* frame-ancestors above already covers this; kept for browsers and scanners
     that still look for the older header */
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  /* the site asks for none of these, so refuse them for everyone */
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /* This is the secure default; stated explicitly so a future refactor cannot
     accidentally publish readable production source maps. */
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: isDev
          ? securityHeaders
          : [
            ...securityHeaders,
            /* HTTPS-only, and only in production — sending this over plain
               http during local work would pin localhost to https. No
               `preload`: that is a one-way door and belongs to whoever owns
               the domain, not to this file. */
            { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          ],
      },
    ];
  },
};

export default nextConfig;
