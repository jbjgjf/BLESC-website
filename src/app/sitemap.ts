import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { absoluteUrl, languageAlternates } from "@/lib/seo";
import { CONTACT_PATH } from "@/lib/site";
import { TRUST_PATH } from "@/lib/trust";

/**
 * The site's pages, by their Japanese (bare) path. Each exists in both
 * languages — the same path under /en — so the sitemap is this list times
 * two.
 */
const PAGES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: TRUST_PATH, changeFrequency: "monthly", priority: 0.8 },
  { path: CONTACT_PATH, changeFrequency: "monthly", priority: 0.8 },
] as const;

/**
 * Served at /sitemap.xml.
 *
 * The site is one scrolling page and two short ones — 安全とプライバシー and
 * /contact — in Japanese and in English, so this is deliberately six
 * entries and not a list of `#section` anchors: a fragment is not a
 * separate URL and Google drops sitemaps that claim otherwise.
 *
 * Every entry names its counterpart: `alternates.languages` is the same
 * hreflang set the page's own <head> carries (languageAlternates in
 * lib/seo, which builds both), written here as xhtml:link. The pairing is
 * made twice on purpose — a crawler that reads only the sitemap, or only
 * the pages, gets it either way, and since one function writes both they
 * cannot disagree.
 *
 * `lastModified` is stamped at build time. That is honest for a statically
 * exported marketing site: every deploy rebuilds it, so the build time is
 * genuinely when the page last changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PAGES.flatMap(({ path, changeFrequency, priority }) => {
    const languages = languageAlternates(path);

    /* Relative in the page metadata, absolute here: a sitemap has no base. */
    const alternates = {
      languages: {
        ja: absoluteUrl(languages.ja),
        en: absoluteUrl(languages.en),
        "x-default": absoluteUrl(languages["x-default"]),
      },
    };

    return LOCALES.map((locale) => ({
      url: absoluteUrl(languages[locale]),
      lastModified,
      changeFrequency,
      /*
       * The Japanese home page is the site's front door and keeps the one
       * priority of 1; its English counterpart sits with the other pages.
       */
      priority: locale === "en" && path === "/" ? 0.8 : priority,
      alternates,
    }));
  });
}
