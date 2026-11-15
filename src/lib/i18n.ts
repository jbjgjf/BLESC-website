/**
 * The site's two languages, and the one rule for where each lives.
 *
 * Japanese is the default and keeps the bare paths (/, /contact, /safety).
 * English is the same page tree under /en (/en, /en/contact, /en/safety).
 * Every page exists in both, with one exception: the news articles
 * (/news/<slug>) are written in Japanese only. Nothing is English-only.
 * switchLocalePath, at the bottom, is what keeps a language switch from
 * leading to a page that is not there.
 *
 * How a component learns its language:
 * - a server component takes a `locale` prop, handed down from the page;
 * - a client component calls useLocale() (components/LocaleProvider), which
 *   the layout sets for everything it renders.
 * Neither reads the pathname to decide what language to speak — the route
 * decides once, at the top.
 */

export const LOCALES = ["ja", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ja";

export const isLocale = (v: string | undefined | null): v is Locale =>
  v === "ja" || v === "en";

/** BCP 47 tags for <html lang> and Open Graph. */
export const HTML_LANG: Record<Locale, string> = { ja: "ja", en: "en" };
export const OG_LOCALE: Record<Locale, string> = { ja: "ja_JP", en: "en_US" };

const EN_PREFIX = "/en";

/** Which language a pathname belongs to. */
export const localeFromPath = (pathname: string): Locale =>
  pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? "en" : "ja";

/** A pathname with its language prefix removed: /en/contact → /contact. */
export const stripLocale = (pathname: string): string => {
  if (localeFromPath(pathname) === "ja") return pathname || "/";
  const rest = pathname.slice(EN_PREFIX.length);
  return rest === "" ? "/" : rest;
};

/**
 * The path of a page in a given language. `path` is the Japanese (bare)
 * path, with any query or hash left on it: localePath("en", "/contact?type=x")
 * is /en/contact?type=x, and localePath("en", "/") is /en.
 */
export const localePath = (locale: Locale, path: string): string => {
  if (locale === "ja") return path;
  if (path === "/") return EN_PREFIX;
  if (path.startsWith("/#") || path.startsWith("/?")) {
    return `${EN_PREFIX}${path.slice(1)}`;
  }
  return `${EN_PREFIX}${path}`;
};

/** The same page in the other language — what the language switch links to. */
export const otherLocale = (locale: Locale): Locale =>
  locale === "ja" ? "en" : "ja";

/**
 * Japanese pages with no English counterpart, by path prefix, and the
 * English page the switch leads to from each instead.
 *
 * A news article is written in Japanese only (content/news, lib/
 * newsArticles), so /en/news/<slug> is a 404. The nearest English page is
 * the News section of the English home page, the counterpart of the list
 * the article is filed in — written here as the bare path, "/#news",
 * which localePath turns into /en#news.
 */
const JAPANESE_ONLY: readonly { prefix: string; english: string }[] = [
  { prefix: "/news/", english: "/#news" },
];

/**
 * Where the language switch on `pathname` leads: the same page in the
 * other language, or — from a Japanese-only page (JAPANESE_ONLY) — the
 * English page nearest to it.
 */
export const switchLocalePath = (pathname: string): string => {
  const locale = localeFromPath(pathname);
  const path = stripLocale(pathname);
  if (locale === "ja") {
    const only = JAPANESE_ONLY.find(({ prefix }) => path.startsWith(prefix));
    if (only) return localePath("en", only.english);
  }
  return localePath(otherLocale(locale), path);
};
