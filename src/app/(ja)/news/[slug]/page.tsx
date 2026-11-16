import type { Metadata } from "next";
import {
  ArticleRoute,
  articleMetadata,
  type ArticleRouteProps,
} from "@/components/news/articleRoute";
import { visibleArticles, warnDrafts } from "@/lib/newsArticles";

/**
 * A news article: /news/<slug>, one page per file in content/news.
 *
 * Every page is built ahead of time. generateStaticParams lists the
 * articles the site shows (visibleArticles: the dated ones, plus drafts on
 * the dev server), and dynamicParams = false makes every other slug a 404
 * — a mistyped one, and an article still dated TODO, which in a production
 * build has no page at all. The 404 is app/global-not-found.tsx, as for
 * any URL that matches nothing.
 *
 * With every article a draft, the list is empty. That is a valid build:
 * the route is compiled, no page is generated, and /news/<anything> is a
 * 404. Next 16 only refuses an empty list under Cache Components
 * (`cacheComponents` in next.config.ts), which this site does not turn on —
 * and which would also refuse dynamicParams. Turning it on means revisiting
 * this file and its English twin.
 *
 * An article with an English version (content/news/<slug>.en.md) has a
 * second page at /en/news/<slug> (app/en/news/[slug]); the two name each
 * other in their metadata, and the language switch moves between them
 * (lib/i18n, switchLocalePath). One without leads the switch to /en#news,
 * and its metadata names no English twin. The metadata, the structured
 * data and the page are components/news/articleRoute's, shared with the
 * English route.
 */
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  /*
   * Runs once per build, before any article page is rendered, so this is
   * where the list of articles still waiting for a date is printed.
   */
  warnDrafts();
  return visibleArticles("ja").map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: ArticleRouteProps): Promise<Metadata> {
  return articleMetadata(params, "ja");
}

export default function NewsArticleRoute({ params }: ArticleRouteProps) {
  return <ArticleRoute params={params} locale="ja" />;
}
