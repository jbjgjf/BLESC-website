import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticlePage } from "@/components/news/NewsArticlePage";
import { HTML_LANG, type Locale } from "@/lib/i18n";
import {
  articleBySlug,
  articlePath,
  type LocalizedArticle,
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
 * What the two article routes share — app/(ja)/news/[slug] and
 * app/en/news/[slug] — so that /news/<slug> and /en/news/<slug> are one page
 * in two languages rather than two pages kept alike by hand. Each route
 * keeps its own segment config and generateStaticParams, which Next reads
 * from the route file itself, and hands its language to these.
 */

export type ArticleRouteProps = { params: Promise<{ slug: string }> };

/**
 * The article a route's params name, in the route's language. dynamicParams
 * already 404s any slug generateStaticParams did not list, and articleBySlug
 * reads the same list, so notFound() here is a guard that narrows the type,
 * not a path a reader takes.
 */
async function articleFor(
  params: ArticleRouteProps["params"],
  locale: Locale,
): Promise<LocalizedArticle> {
  const { slug } = await params;
  const article = articleBySlug(slug, locale);
  if (!article) notFound();
  return article;
}

/**
 * The title is the article's own; the layout's template appends the
 * brand ("｜Blesc", " | Blesc"). The description is the body's first
 * sentence (lib/newsArticles), so the snippet is a line the page itself
 * opens with.
 *
 * The card is the site's card in the page's language, as on every other
 * page, typed as an article with its date and category. The canonical is
 * the page's own URL in its language. An article in both languages names
 * the other page as its hreflang twin, ja ⇄ en with the Japanese as
 * x-default, as every other page of the site does (languageAlternates in
 * lib/seo builds both ends from the one bare path, so they always pair),
 * and its card names the other locale. An article in Japanese alone names
 * neither: it has no English page, and the pair would send a crawler to a
 * 404 (japaneseOnly in lib/seo).
 */
export async function articleMetadata(
  params: ArticleRouteProps["params"],
  locale: Locale,
): Promise<Metadata> {
  const article = await articleFor(params, locale);

  return pageMetadata({
    locale,
    // The bare (Japanese) path; pageMetadata puts it in `locale`.
    path: articlePath(article.slug),
    title: article.title,
    description: article.description,
    japaneseOnly: !article.bilingual,
    article: {
      ...(article.date ? { publishedTime: article.date } : null),
      section: article.category,
    },
  });
}

/** The breadcrumb's middle step: the home page's News section. */
const NEWS_CRUMB: Record<Locale, string> = { ja: "ニュース", en: "News" };

/**
 * Structured data for one article: the breadcrumb Home > News > the title
 * (ホーム > ニュース > … in Japanese, under /en in English), and the
 * article itself.
 *
 * NewsArticle carries what the page states and nothing it does not: the
 * title as the headline, the first sentence as the description, the date
 * (a YYYY-MM date is ISO 8601 too, with the month as its precision) and the
 * language of the page. No image: the only one to hand is the site's share
 * card, which shows the brand, not the article. No dateModified: nothing
 * records when an article was last edited.
 *
 * Blesc is both author and publisher — the articles are the company's own
 * statements. Each is the Organization node every page already carries
 * (siteJsonLd, through RootShell), named by its @id; the name and URL are
 * repeated beside it so that the node still says who it is to a reader
 * that does not join the two blocks.
 */
function articleJsonLd(article: LocalizedArticle) {
  const url = absoluteUrl(article.path);
  const blesc = {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
  };

  return [
    breadcrumbJsonLd(
      [
        { name: NEWS_CRUMB[article.locale], path: sectionHref("news", false) },
        { name: article.title, path: articlePath(article.slug) },
      ],
      article.locale,
    ),
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "@id": `${url}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: article.title,
      description: article.description,
      ...(article.date ? { datePublished: article.date } : null),
      inLanguage: HTML_LANG[article.locale],
      author: blesc,
      publisher: blesc,
    },
  ];
}

/**
 * `<` is escaped in the serialised JSON. The text is the company's, but it
 * comes from a file rather than from code, and a `</script>` in a title
 * would otherwise end the tag early.
 */
const serialise = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

/** The page: its structured data, then the article. */
export async function ArticleRoute({
  params,
  locale,
}: ArticleRouteProps & { locale: Locale }) {
  const article = await articleFor(params, locale);

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
