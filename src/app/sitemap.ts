import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { articlePath, visibleArticles } from "@/lib/newsArticles";
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
 * /contact — in Japanese and in English, which is six entries and not a
 * list of `#section` anchors: a fragment is not a separate URL and Google
 * drops sitemaps that claim otherwise. After them come the news articles
 * (newsEntries, below), each a page of its own in Japanese, and in English
 * as well once it has been translated.
 *
 * Each of those six names its counterpart: `alternates.languages` is the
 * same hreflang set the page's own <head> carries (languageAlternates in
 * lib/seo, which builds both), written here as xhtml:link. The pairing is
 * made twice on purpose — a crawler that reads only the sitemap, or only
 * the pages, gets it either way, and since one function writes both they
 * cannot disagree.
 *
 * Their `lastModified` is stamped at build time. That is honest for a
 * statically exported marketing site: every deploy rebuilds it, so the
 * build time is genuinely when the page last changed. An article's is its
 * own date (see newsEntries).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages = PAGES.flatMap(({ path, changeFrequency, priority }) => {
    const alternates = absoluteAlternates(path);

    return LOCALES.map((locale) => ({
      url: alternates.languages[locale],
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

  return [...pages, ...newsEntries()];
}

/**
 * A page's hreflang set, as languageAlternates in lib/seo writes it into the
 * page's own <head> — relative there, absolute here: a sitemap has no base.
 */
function absoluteAlternates(path: string) {
  const languages = languageAlternates(path);
  return {
    languages: {
      ja: absoluteUrl(languages.ja),
      en: absoluteUrl(languages.en),
      "x-default": absoluteUrl(languages["x-default"]),
    },
  };
}

/** A date with its day: YYYY-MM-DD, not the month-only YYYY-MM. */
const FULL_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * One entry per published news article and language: /news/<slug>, and
 * /en/news/<slug> when the article has an English version.
 *
 * The articles the site shows — visibleArticles in lib/newsArticles, the
 * same list the article routes build their pages from — so an article
 * dated TODO, which has no page, is not listed either. (The dev server
 * shows drafts and so lists them too; nothing crawls that.)
 *
 * An article in both languages is listed twice, each entry naming the
 * pair as the pages above do — the same set its two pages carry in their
 * <head> (components/news/articleRoute). One in Japanese alone is listed
 * once and names no alternates: a pair with one end missing would point a
 * crawler at a 404. The English page exists exactly when the Japanese one
 * is listed and has an English version (`bilingual`), since the date that
 * publishes both is the Japanese file's.
 *
 * lastModified is the article's date, not the build time: an article does
 * not change when the site is redeployed, and a date that moved on every
 * deploy would teach a crawler to ignore it. Only a full YYYY-MM-DD is
 * used. The sitemap schema (sitemaps.org) takes lastmod as a date or a
 * date-time, both of which have a day, and a month-only article has none
 * to give — writing the 1st would state a date the company has not, so
 * such an entry goes without.
 *
 * "yearly" because an announcement, once out, is not rewritten; 0.6, a
 * step under the two short pages, because each is one item from a list.
 */
function newsEntries(): MetadataRoute.Sitemap {
  return visibleArticles("ja").flatMap(({ slug, date, bilingual }) => {
    const entry = {
      ...(date && FULL_DATE.test(date) ? { lastModified: date } : null),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    };
    if (!bilingual) return [{ url: absoluteUrl(articlePath(slug)), ...entry }];

    const alternates = absoluteAlternates(articlePath(slug));
    return LOCALES.map((locale) => ({
      url: alternates.languages[locale],
      ...entry,
      alternates,
    }));
  });
}
