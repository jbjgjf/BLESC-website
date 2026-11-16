import type { Metadata } from "next";
import {
  ArticleRoute,
  articleMetadata,
  type ArticleRouteProps,
} from "@/components/news/articleRoute";
import { visibleArticles } from "@/lib/newsArticles";

/**
 * A news article in English: /en/news/<slug>, the counterpart of
 * /news/<slug>, from content/news/<slug>.en.md.
 *
 * Built as the Japanese route is (app/(ja)/news/[slug], which says why
 * each piece is what it is). generateStaticParams lists the articles with
 * an English file whose Japanese file has a date — the date is written
 * there alone, so the two pages go out together — plus, on the dev server,
 * drafts, as in Japanese. dynamicParams = false makes every other slug a
 * 404: a mistyped one, one still dated TODO, and one that has no English
 * version, whose language switch leads to /en#news instead (lib/i18n).
 *
 * The metadata is English throughout — the title and the first sentence as
 * the description, the canonical /en/news/<slug>, hreflang to the Japanese
 * page and back, og:locale en_US — and the breadcrumb reads Home > News >
 * the title. All of it, and the page, is components/news/articleRoute's,
 * in English.
 */
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return visibleArticles("en").map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: ArticleRouteProps): Promise<Metadata> {
  return articleMetadata(params, "en");
}

export default function EnglishNewsArticleRoute({ params }: ArticleRouteProps) {
  return <ArticleRoute params={params} locale="en" />;
}
