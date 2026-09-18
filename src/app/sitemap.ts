import type { MetadataRoute } from "next";
import { CONTACT_PATH } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

/**
 * Served at /sitemap.xml.
 *
 * The site is one scrolling page plus /contact, so this is deliberately two
 * entries and not a list of `#section` anchors — a fragment is not a
 * separate URL and Google drops sitemaps that claim otherwise.
 *
 * `lastModified` is stamped at build time. That is honest for a statically
 * exported marketing site: every deploy rebuilds it, so the build time is
 * genuinely when the page last changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl(CONTACT_PATH),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
