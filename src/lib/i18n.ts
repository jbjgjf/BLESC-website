/**
 * The site's two languages, and the one rule for where each lives.
 *
 * Japanese is the default and keeps the bare paths (/, /contact, /safety).
 * English is the same page tree under /en (/en, /en/contact, /en/safety).
 * Every page exists in both, with one exception: a news article
 * (/news/<slug>) is always in Japanese, and in English (/en/news/<slug>)
 * only when it has been translated — ENGLISH_ARTICLES, below. Nothing is
 * English-only. switchLocalePath, at the bottom, is what keeps a language
 * switch from leading to a page that is not there.
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
 * The news articles that have an English version, by slug: those with a
 * content/news/<slug>.en.md beside the Japanese <slug>.md (lib/newsArticles).
 *
 * Written out here because the language switch is drawn by client
 * components (Nav, Footer), which cannot read the content folder, and
 * switchLocalePath has to stay a plain function of the pathname. It is not
 * left to drift: lib/newsArticles compares it with the folder on every
 * build, and the build stops, naming the slug to add or remove, the moment
 * the two disagree. So adding an English version is adding its file and its
 * slug here.
 *
 * Whether the article is published does not enter into it. An article's
 * date is in its Japanese file alone, so the two pages are published
 * together: a reader on /news/<slug> is on a published article (or a draft
 * on the dev server, which shows English drafts too), and its English page
 * exists exactly when it is listed here.
 */
export const ENGLISH_ARTICLES: readonly string[] = [
  "ivs-pitch",
  "rd-team-launch",
  "service-launch",
  "sushi-tech-tokyo-pitch",
  "unu-pitch",
];

/** A news article's path, in either language once the prefix is off. */
const ARTICLE_PATH = /^\/news\/([^/]+)$/;

/**
 * Where the language switch on `pathname` leads: the same page in the
 * other language — or, from a news article that is in one language only,
 * the News section of the other language's home page (/en#news, /#news),
 * the counterpart of the list the article is filed in.
 *
 * Only an article missing from ENGLISH_ARTICLES falls back, and in
 * practice only from Japanese: an English article's Japanese page always
 * exists. The rule is written for both directions anyway, so a mistyped
 * /en/news/ URL does not lead to a second 404.
 */
export const switchLocalePath = (pathname: string): string => {
  const locale = localeFromPath(pathname);
  const path = stripLocale(pathname);
  const to = otherLocale(locale);
  if (path.startsWith("/news/")) {
    const slug = ARTICLE_PATH.exec(path)?.[1];
    if (slug === undefined || !ENGLISH_ARTICLES.includes(slug)) {
      return localePath(to, "/#news");
    }
  }
  return localePath(to, path);
};
