import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

/**
 * Served at /robots.txt.
 *
 * Everything is crawlable — there is nothing here that should not be
 * indexed, and a marketing site that blocks paths it does not need to only
 * risks blocking a resource Google needs to render the page.
 *
 * The AI crawlers are allowed on purpose: this is a product people find by
 * asking about student mental health, and being quotable in an assistant's
 * answer is the same distribution goal as ranking in a SERP.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      /*
       * No Disallow at all, deliberately. Everything under /_next is the
       * JavaScript and CSS Google needs to render this page — block it and
       * the rendered DOM the crawler scores is a blank one. There is nothing
       * else here worth hiding from an index.
       */
      { userAgent: "*", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
