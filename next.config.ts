import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * X-Powered-By: Next.js on every response. No value to anyone but someone
   * fingerprinting the stack, and it is a header on every request.
   */
  poweredByHeader: false,

  experimental: {
    /*
     * app/global-not-found.tsx is the 404 for a URL that matches no route.
     *
     * The site has two root layouts, one per language (app/(ja) and app/en),
     * so there is no single layout for Next to wrap a not-found page in, and
     * an app/not-found.tsx cannot exist without one. This flag is the
     * documented way to give such an app a 404 of its own — a complete
     * document, prerendered once and served with a 404 status. Without it
     * an unknown URL still 404s, but as Next's unstyled built-in page.
     *
     * Experimental in Next 16.2: check node_modules/next/dist/docs
     * (file-conventions/not-found.md) when upgrading, in case it has become
     * the default or been renamed.
     */
    globalNotFound: true,
  },

  images: {
    /*
     * AVIF first, WebP behind it. next/image only serves a format the
     * browser advertises, so this is a straight size win on the two
     * photographic sections — and image weight is an LCP input, which is an
     * input to ranking.
     */
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          /*
           * Referer is how partner sites, press coverage and Search Console
           * attribute traffic. The browser default already sends the origin
           * cross-site; stating it means a future default change cannot
           * quietly turn referrals into "direct".
           */
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        /*
         * Generated once per deploy and immutable within it, but Next serves
         * the OG route uncached by default — which makes every scrape a cold
         * render and, on a slow one, a card that fails to appear at all.
         */
        source: "/(opengraph-image|twitter-image)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        /* The English card (app/en/opengraph-image.tsx), for the same reason. */
        source: "/en/(opengraph-image|twitter-image)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
