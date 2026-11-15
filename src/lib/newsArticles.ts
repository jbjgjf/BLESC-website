import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseMarkdown, type Block, type Inline } from "@/lib/markdown";
import { formatNewsDate, newestFirst, type NewsDate } from "@/lib/news";

/**
 * ニュースの記事 — one Markdown file per article in content/news/.
 *
 * Adding an article is adding a file: content/news/<slug>.md, whose name is
 * the article's URL (/news/<slug>). The file opens with a small header
 * between two `---` lines, then the body in Markdown:
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
 * A header line starting with # is a note to whoever edits the file and is
 * ignored. Any other key, a missing key, a bad date or a bad file name fails
 * the build with the file named, so a typo cannot quietly drop an article.
 * So does a body lib/markdown cannot read, with the line named — drafts
 * included, so a mistake is found while the article is written, not on the
 * day it is given a date.
 *
 * `date: TODO` keeps an article off the live site: it is not listed and has
 * no page, and every build prints which articles are waiting for a date. On
 * the dev server (`npm run dev`) drafts are shown, marked 日付未定, so they
 * can be read before they go out.
 *
 * The short entries in lib/news.ts — the ones that predate articles, and
 * carry photos and English — stay there; the ニュース section lists both,
 * newest first. This file is server-only: it reads the disk at build time.
 */

export type NewsArticle = {
  /** The file name without .md, and the article's URL segment. */
  slug: string;
  /** null while the file says `date: TODO`. */
  date: NewsDate | null;
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
};

const DIR = path.join(process.cwd(), "content", "news");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEYS = ["date", "category", "title", "summary"] as const;

/** Drafts are readable on the dev server and nowhere else. */
export const SHOW_DRAFTS = process.env.NODE_ENV === "development";

function fail(file: string, why: string): never {
  throw new Error(`content/news/${file}: ${why}`);
}

function parse(file: string, source: string): NewsArticle {
  const slug = file.replace(/\.md$/, "");
  if (!SLUG.test(slug)) {
    fail(file, "file names are lower-case letters, digits and hyphens");
  }

  const text = source.replace(/\r\n?/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!match) fail(file, "the file must open with a --- header --- block");
  const [, header, rest] = match;

  const fields: Partial<Record<(typeof KEYS)[number], string>> = {};
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
    if (!(KEYS as readonly string[]).includes(key)) {
      fail(file, `unknown header "${key}" (expected ${KEYS.join(", ")})`);
    }
    if (value === "") fail(file, `"${key}" is empty`);
    fields[key as (typeof KEYS)[number]] = value;
  }
  for (const key of KEYS) {
    if (!fields[key]) fail(file, `missing "${key}"`);
  }

  let date: NewsDate | null = null;
  if (fields.date !== "TODO") {
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
  const blocks = parseMarkdown(body, `content/news/${file}`, lineOffset);

  return {
    slug,
    date,
    category: fields.category!,
    title: fields.title!,
    summary: fields.summary!,
    body,
    lineOffset,
    description: firstSentence(blocks) || fields.summary!,
  };
}

/**
 * The first sentence of the first paragraph, as plain text. Headings,
 * lists and tables are skipped: a description is prose.
 */
function firstSentence(blocks: readonly Block[]): string {
  const paragraph = blocks.find(
    (block): block is Extract<Block, { type: "paragraph" }> =>
      block.type === "paragraph",
  );
  if (!paragraph) return "";
  const plain = plainText(paragraph.children);
  const end = plain.search(/[。！？]/);
  return end === -1 ? plain : plain.slice(0, end + 1);
}

const plainText = (nodes: readonly Inline[]): string =>
  nodes
    .map((node) => (node.type === "text" ? node.value : plainText(node.children)))
    .join("");

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
    files = readdirSync(DIR).filter((f) => f.endsWith(".md"));
  } catch {
    files = [];
  }
  cache = files
    .map((file) => parse(file, readFileSync(path.join(DIR, file), "utf8")))
    .sort((a, b) => newestFirst(a.date, b.date));
  return cache;
}

/** What the site shows: dated articles, plus drafts on the dev server. */
export function visibleArticles(): readonly NewsArticle[] {
  return allArticles().filter((a) => a.date !== null || SHOW_DRAFTS);
}

export function articleBySlug(slug: string): NewsArticle | undefined {
  return visibleArticles().find((a) => a.slug === slug);
}

export const articlePath = (slug: string) => `/news/${slug}`;

let warned = false;

/**
 * Prints, once per build, which articles are held back for want of a date.
 * Called from the article route's generateStaticParams, which runs once.
 */
export function warnDrafts(): void {
  if (warned) return;
  warned = true;
  const drafts = allArticles().filter((a) => a.date === null);
  if (drafts.length === 0) return;
  console.warn(
    `\n⚠ ニュース: 日付が TODO の記事は公開されません（${drafts.length}件）\n` +
      drafts.map((a) => `   - content/news/${a.slug}.md  「${a.title}」`).join("\n") +
      "\n   date: を YYYY-MM-DD か YYYY-MM にすると公開されます。\n",
  );
}
