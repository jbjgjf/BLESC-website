import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticlePage } from "@/components/news/NewsArticlePage";
import {
  articleBySlug,
  articlePath,
  visibleArticles,
  warnDrafts,
  type NewsArticle,
} from "@/lib/newsArticles";
import {
  ORGANIZATION_ID,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  breadcrumbJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { sectionHref } from "@/lib/site";

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
 * this file.
 *
 * Japanese only, under app/(ja): there is no app/en/news. The language
 * switch on these pages leads to /en#news instead (lib/i18n,
 * switchLocalePath), and the metadata names no English twin.
 */
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  /*
   * Runs once per build, before any article page is rendered, so this is
   * where the list of articles still waiting for a date is printed.
   */
  warnDrafts();
  return visibleArticles().map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

/** The breadcrumb's middle step: the home page's ニュース section. */
const NEWS_CRUMB = { name: "ニュース", path: sectionHref("news", false) };

/**
 * The article a route's params name. dynamicParams already 404s any slug
 * generateStaticParams did not list, and articleBySlug reads the same list,
 * so notFound() here is a guard that narrows the type, not a path a reader
 * takes.
 */
async function articleFor(params: Props["params"]): Promise<NewsArticle> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();
  return article;
}

/**
 * The title is the article's own; the layout's template appends "｜Blesc".
 * The description is the body's first sentence (lib/newsArticles), so the
 * snippet is a line the page itself opens with.
 *
 * The card is the site's Japanese card, as on every other page, typed as
 * an article with its date and category. No hreflang and no alternate
 * locale: the article has no English page (japaneseOnly in lib/seo).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await articleFor(params);

  return pageMetadata({
    locale: "ja",
    path: articlePath(article.slug),
    title: article.title,
    description: article.description,
    japaneseOnly: true,
    article: {
      ...(article.date ? { publishedTime: article.date } : null),
      section: article.category,
    },
  });
}

/**
 * Structured data for one article: the breadcrumb ホーム > ニュース >
 * the title, and the article itself.
 *
 * NewsArticle carries what the page states and nothing it does not: the
 * title as the headline, the first sentence as the description, the date
 * (a YYYY-MM date is ISO 8601 too, with the month as its precision) and the
 * language. No image: the only one to hand is the site's share card, which
 * shows the brand, not the article. No dateModified: nothing records when
 * an article was last edited.
 *
 * Blesc is both author and publisher — the articles are the company's own
 * statements. Each is the Organization node every page already carries
 * (siteJsonLd, through RootShell), named by its @id; the name and URL are
 * repeated beside it so that the node still says who it is to a reader
 * that does not join the two blocks.
 *
 * `<` is escaped in the serialised JSON. The text is the company's, but it
 * comes from a file rather than from code, and a `</script>` in a title
 * would otherwise end the tag early.
 */
function articleJsonLd(article: NewsArticle) {
  const url = absoluteUrl(articlePath(article.slug));
  const blesc = {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
  };

  return [
    breadcrumbJsonLd(
      [NEWS_CRUMB, { name: article.title, path: articlePath(article.slug) }],
      "ja",
    ),
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "@id": `${url}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: article.title,
      description: article.description,
      ...(article.date ? { datePublished: article.date } : null),
      inLanguage: "ja",
      author: blesc,
      publisher: blesc,
    },
  ];
}

const serialise = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

export default async function NewsArticleRoute({ params }: Props) {
  const article = await articleFor(params);

  return (
    <>
      {articleJsonLd(article).map((block) => (
        <script
          key={block["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialise(block) }}
        />
      ))}
      <NewsArticlePage article={article} />
    </>
  );
}
