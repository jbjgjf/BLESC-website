import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { ENGLISH_ARTICLES, localePath, type Locale } from "@/lib/i18n";
import { inlineText, parseMarkdown, type Block } from "@/lib/markdown";
import { formatNewsDate, newestFirst, type NewsDate } from "@/lib/news";

/**
 * ニュースの記事 — one Markdown file per article and language in
 * content/news/ (content/news/README.md says the same for whoever writes
 * them).
 *
 * Adding an article is adding a file: content/news/<slug>.md, in Japanese,
 * whose name is the article's URL (/news/<slug>). The file opens with a
 * small header between two `---` lines, then the body in Markdown:
 *
 *   ---
 *   date: 2026-11-20        (YYYY-MM-DD, YYYY-MM, or TODO)
 *   category: お知らせ
 *   title: 記事のタイトル
 *   summary: 一覧に出す短い要約
 *   ---
 *
 *   本文…
 *
 * Its English version, when it has one, is a second file beside it,
 * content/news/<slug>.en.md, published at /en/news/<slug>. The same header
 * without the date — category, title, summary — and the body in English.
 * The date is written once, in the Japanese file, so the two can never
 * disagree and are published together; a `date:` in an English file fails
 * the build. So does an English file with no Japanese one beside it. The
 * slug also goes into ENGLISH_ARTICLES in lib/i18n, for the language switch
 * (which cannot read this folder); the build compares the two and stops,
 * naming the slug, when they differ.
 *
 * A header line starting with # is a note to whoever edits the file and is
 * ignored. Any other key, a missing key, a bad date or a bad file name fails
 * the build with the file named, so a typo cannot quietly drop an article.
 * So does a body lib/markdown cannot read, with the line named — drafts
 * included, so a mistake is found while the article is written, not on the
 * day it is given a date. README.md is the folder's own note and is not an
 * article.
 *
 * `date: TODO` keeps an article off the live site, in both languages: it is
 * not listed and has no page, and every build prints which articles are
 * waiting for a date. On the dev server (`npm run dev`) drafts are shown,
 * marked 日付未定 (in English, "Date to be set"), so they can be read before
 * they go out.
 *
 * The short entries in lib/news.ts — the ones that predate articles, and
 * carry photos — stay there; the ニュース section lists both, newest first,
 * in each language: the Japanese articles on the Japanese page, the English
 * ones on the English page. This file is server-only: it reads the disk at
 * build time.
 */

/** An article's words in one language, as read from its file. */
export type ArticleText = {
  category: string;
  title: string;
  summary: string;
  /** The body as written, in Markdown. */
  body: string;
  /**
   * Lines of the file above the body's first line — the header, its ---
   * lines and the blank after them. The page hands it to lib/markdown with
   * the body, so a parse error names the line in the file.
   */
  lineOffset: number;
  /** The body's first sentence, as plain text: the page's meta description. */
  description: string;
  /** The file, as an error names it: content/news/<slug>.md or <slug>.en.md. */
  file: string;
};

/** An article as it is on disk: its date, and its text in each language. */
export type NewsArticle = {
  /** The Japanese file's name without .md, and the article's URL segment. */
  slug: string;
  /** null while the Japanese file says `date: TODO`. */
  date: NewsDate | null;
  /** Every article is written in Japanese. */
  ja: ArticleText;
  /** null when there is no <slug>.en.md. */
  en: ArticleText | null;
};

/**
 * One article in one language: what a page, a row of the list and the
 * sitemap work from.
 */
export type LocalizedArticle = ArticleText & {
  slug: string;
  date: NewsDate | null;
  locale: Locale;
  /** The article's page in this language: /news/<slug> or /en/news/<slug>. */
  path: string;
  /**
   * Whether the article is in both languages. Its two pages then name each
   * other (hreflang, the sitemap); an article in Japanese alone names no
   * English twin, which would send a crawler to a 404.
   */
  bilingual: boolean;
};

const DIR = path.join(process.cwd(), "content", "news");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** The folder's note to its writers, which is not an article. */
const README = "README.md";
const EN_SUFFIX = ".en.md";

/** The header each file must carry. The date is the Japanese file's alone. */
const KEYS = {
  ja: ["date", "category", "title", "summary"],
  en: ["category", "title", "summary"],
} as const satisfies Record<Locale, readonly string[]>;

type Key = (typeof KEYS)["ja"][number];

/** Drafts are readable on the dev server and nowhere else. */
export const SHOW_DRAFTS = process.env.NODE_ENV === "development";

function fail(file: string, why: string): never {
  throw new Error(`content/news/${file}: ${why}`);
}

/** One file, read: its date (the Japanese file's) and its text. */
type Parsed = { slug: string; date: NewsDate | null; text: ArticleText };

function parse(file: string, source: string, locale: Locale): Parsed {
  const slug = file.slice(0, -(locale === "en" ? EN_SUFFIX : ".md").length);
  if (!SLUG.test(slug)) {
    fail(
      file,
      "file names are lower-case letters, digits and hyphens, then .md (Japanese) or .en.md (English)",
    );
  }

  const text = source.replace(/\r\n?/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!match) fail(file, "the file must open with a --- header --- block");
  const [, header, rest] = match;

  const keys: readonly string[] = KEYS[locale];
  const fields: Partial<Record<Key, string>> = {};
  for (const raw of header.split("\n")) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    const colon = line.indexOf(":");
    if (colon < 1) fail(file, `cannot read header line "${line}"`);
    const key = line.slice(0, colon).trim();
    const value = line
      .slice(colon + 1)
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2");
    if (locale === "en" && key === "date") {
      fail(
        file,
        `an English file has no date — it is written once, in ${slug}.md, so the two are published together`,
      );
    }
    if (!keys.includes(key)) {
      fail(file, `unknown header "${key}" (expected ${keys.join(", ")})`);
    }
    if (value === "") fail(file, `"${key}" is empty`);
    fields[key as Key] = value;
  }
  for (const key of keys) {
    if (!fields[key as Key]) fail(file, `missing "${key}"`);
  }

  let date: NewsDate | null = null;
  if (locale === "ja" && fields.date !== "TODO") {
    date = fields.date as NewsDate;
    try {
      formatNewsDate(date, "ja");
    } catch {
      fail(file, `date "${fields.date}" is not YYYY-MM-DD, YYYY-MM or TODO`);
    }
  }

  const body = rest.trim();
  if (body === "") fail(file, "the body is empty");

  /*
   * The body is parsed here as well as where the page renders it
   * (components/news/Markdown), for two reasons. A draft is checked too: a
   * production build renders no page for an article dated TODO, so without
   * this a body lib/markdown refuses would pass every build until the one
   * that gives it a date, and fail that. And the description is taken from
   * the parsed text, so it is the page's first sentence exactly as the page
   * shows it — bold and links reduced to their words, a \* escape resolved,
   * wrapped lines joined as the page joins them.
   */
  const start = text.length - rest.length + rest.search(/\S/);
  const lineOffset = text.slice(0, start).split("\n").length - 1;
  const where = `content/news/${file}`;
  const blocks = parseMarkdown(body, where, lineOffset);

  return {
    slug,
    date,
    text: {
      category: fields.category!,
      title: fields.title!,
      summary: fields.summary!,
      body,
      lineOffset,
      description: firstSentence(blocks, locale) || fields.summary!,
      file: where,
    },
  };
}

/**
 * Where an English sentence may end: a full stop, question or exclamation
 * mark, with any closing quote or bracket after it, then a space or the end
 * of the paragraph. A question inside a sentence — Asked “Are you okay?”,
 * most students… — is followed by a comma, so it does not end one.
 */
const EN_SENTENCE_END = /[.!?]["'”’)]*(?=\s|$)/g;

/**
 * A full stop that ends an abbreviation, not a sentence: e.g., i.e., etc.,
 * excl. and the like, and a single letter (an initial, or the last of
 * U.S.). Taking one of these for the end would cut the description off in
 * the middle of its sentence; missing a real end only makes it a sentence
 * longer.
 */
const ABBREVIATION =
  /(?:^|[\s(])(?:e\.g|i\.e|etc|excl|incl|approx|vs|cf|Mr|Ms|Mrs|Dr|Prof|No|St|Inc|Ltd|Co)$|(?:^|[\s(.])[A-Za-z]$/;

/**
 * The first sentence of the first paragraph, as plain text. Headings,
 * lists and tables are skipped: a description is prose. Japanese ends a
 * sentence at 。！？; English at the marks above.
 */
function firstSentence(blocks: readonly Block[], locale: Locale): string {
  const paragraph = blocks.find(
    (block): block is Extract<Block, { type: "paragraph" }> =>
      block.type === "paragraph",
  );
  if (!paragraph) return "";
  const plain = inlineText(paragraph.children);

  if (locale === "ja") {
    const end = plain.search(/[。！？]/);
    return end === -1 ? plain : plain.slice(0, end + 1);
  }
  for (const end of plain.matchAll(EN_SENTENCE_END)) {
    if (end[0][0] === "." && ABBREVIATION.test(plain.slice(0, end.index))) {
      continue;
    }
    return plain.slice(0, end.index + end[0].length);
  }
  return plain;
}

/**
 * ENGLISH_ARTICLES (lib/i18n), which the language switch reads, has to name
 * exactly the articles with an English file. Checked whenever the folder is
 * read, so the build stops on the slug that is missing or left over rather
 * than shipping a switch that leads to a 404 or skips a translation.
 */
function checkEnglishList(english: ReadonlySet<string>): void {
  const listed = new Set(ENGLISH_ARTICLES);
  const missing = [...english].filter((slug) => !listed.has(slug));
  const extra = [...listed].filter((slug) => !english.has(slug));
  if (missing.length === 0 && extra.length === 0) return;
  throw new Error(
    "src/lib/i18n.ts: ENGLISH_ARTICLES has to list exactly the articles with a content/news/<slug>.en.md —" +
      (missing.length ? ` add ${missing.map((s) => `"${s}"`).join(", ")}` : "") +
      (missing.length && extra.length ? ";" : "") +
      (extra.length ? ` remove ${extra.map((s) => `"${s}"`).join(", ")}` : "") +
      ".",
  );
}

/*
 * Read once per build and kept. Not on the dev server, where the files are
 * being written: nothing tells it a .md file changed, so a kept copy would
 * show the old text until it was restarted. There every render reads the
 * folder again, which is a handful of small files.
 */
let cache: readonly NewsArticle[] | null = null;

/**
 * Every article on disk, drafts included, newest first — by the register's
 * one order (newestFirst in lib/news.ts), so drafts, which have no date,
 * come after every dated article.
 */
export function allArticles(): readonly NewsArticle[] {
  if (cache && !SHOW_DRAFTS) return cache;
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith(".md") && f !== README);
  } catch {
    files = [];
  }
  const read = (file: string, locale: Locale) =>
    parse(file, readFileSync(path.join(DIR, file), "utf8"), locale);

  const english = new Map(
    files
      .filter((file) => file.endsWith(EN_SUFFIX))
      .map((file) => {
        const { slug, text } = read(file, "en");
        return [slug, text] as const;
      }),
  );
  const japanese = files
    .filter((file) => !file.endsWith(EN_SUFFIX))
    .map((file) => read(file, "ja"));

  for (const slug of english.keys()) {
    if (!japanese.some((a) => a.slug === slug)) {
      fail(
        `${slug}${EN_SUFFIX}`,
        `there is no ${slug}.md — an English version sits beside the Japanese article it translates`,
      );
    }
  }
  checkEnglishList(new Set(english.keys()));

  cache = japanese
    .map(
      ({ slug, date, text }): NewsArticle => ({
        slug,
        date,
        ja: text,
        en: english.get(slug) ?? null,
      }),
    )
    .sort((a, b) => newestFirst(a.date, b.date));
  return cache;
}

export const articlePath = (slug: string, locale: Locale = "ja") =>
  localePath(locale, `/news/${slug}`);

/**
 * What the site shows in a language: the dated articles written in it,
 * plus drafts on the dev server — newest first. In Japanese that is every
 * article; in English, those with an English file. The date is the
 * Japanese file's, so an article goes out in both languages at once.
 */
export function visibleArticles(locale: Locale): readonly LocalizedArticle[] {
  return allArticles().flatMap((article): LocalizedArticle[] => {
    const text = article[locale];
    if (!text || (article.date === null && !SHOW_DRAFTS)) return [];
    return [
      {
        ...text,
        slug: article.slug,
        date: article.date,
        locale,
        path: articlePath(article.slug, locale),
        bilingual: article.en !== null,
      },
    ];
  });
}

export function articleBySlug(
  slug: string,
  locale: Locale,
): LocalizedArticle | undefined {
  return visibleArticles(locale).find((a) => a.slug === slug);
}

let warned = false;

/**
 * Prints, once per build, which articles are held back for want of a date.
 * Called from the Japanese article route's generateStaticParams, which runs
 * once; an English version waits on the same date, so it is not listed
 * twice.
 */
export function warnDrafts(): void {
  if (warned) return;
  warned = true;
  const drafts = allArticles().filter((a) => a.date === null);
  if (drafts.length === 0) return;
  console.warn(
    `\n⚠ ニュース: 日付が TODO の記事は公開されません（${drafts.length}件）\n` +
      drafts
        .map(
          (a) =>
            `   - content/news/${a.slug}.md  「${a.ja.title}」${a.en ? "（英語版あり）" : ""}`,
        )
        .join("\n") +
      "\n   date: を YYYY-MM-DD か YYYY-MM にすると公開されます。\n",
  );
}
