import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * X-Powered-By: Next.js on every response. No value to anyone but someone
   * fingerprinting the stack, and it is a header on every request.
   */
  poweredByHeader: false,

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
    ];
  },
};

export default nextConfig;
