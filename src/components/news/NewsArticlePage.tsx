import { DrawnRule } from "@/components/DrawnRule";
import { Flower } from "@/components/Flower";
import { Drift } from "@/components/flourish/Drift";
import { Markdown } from "@/components/news/Markdown";
import { TRUST_TYPE } from "@/components/trust/TrustSections";
import { Container, Icon } from "@/components/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { formatNewsDate } from "@/lib/news";
import type { LocalizedArticle } from "@/lib/newsArticles";
import { sectionHref } from "@/lib/site";

/**
 * The page's own strings: what stands for a draft's date (drafts show on
 * the dev server only), and the way back to the list.
 */
const COPY = {
  ja: { undated: "日付未定", back: "ニュース一覧へ戻る" },
  en: { undated: "Date to be set", back: "Back to news" },
} as const satisfies Record<Locale, { undated: string; back: string }>;

/**
 * The title: the 安全とプライバシー page's h1 in the article's language
 * (TRUST_TYPE, set exactly as TrustPage sets it), so the site's text pages
 * read as one family. An article's title runs to two or three lines where
 * 安全とプライバシー takes one, so two things are added for the lines in
 * Japanese: auto-phrase breaks it between phrases rather than between any
 * two characters, as the footer's and the adoption note's paragraphs do,
 * and text-balance evens the lines so a title does not end on a lone word.
 * The English h1 is balanced already, and breaks at its spaces.
 *
 * wrap-anywhere is the fallback the News register's names carry for the
 * same reason: auto-phrase does not break inside a phrase, and at 320px the
 * h1's 28px leaves room for about ten characters a line, so a longer phrase
 * — a katakana compound such as スタートアップカンファレンス — would run
 * past the edge and be clipped by the page's overflow-x-clip. It changes
 * nothing for a title whose phrases (or, in English, words) fit.
 *
 * Whole class strings, because Tailwind only generates what it can read.
 */
const TITLE: Record<Locale, string> = {
  ja: `mt-4 text-balance font-light tracking-[-0.02em] text-ink wrap-anywhere [word-break:auto-phrase] md:mt-5 ${TRUST_TYPE.ja.h1}`,
  en: `mt-4 font-light tracking-[-0.02em] text-ink wrap-anywhere md:mt-5 ${TRUST_TYPE.en.h1}`,
};

/**
 * The footer's quiet link (QUIET_LINK in components/Footer), written out
 * because Footer keeps it to itself: small, muted — 6.25:1 on the ground,
 * so the resting state passes AA — and ink on a fine pointer's hover.
 * Whole class strings, because Tailwind only generates what it can read.
 */
const QUIET_LINK =
  "text-[0.9rem] text-muted transition-colors duration-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink";

/**
 * One news article, /news/<slug> or /en/news/<slug>: the date and
 * category, the title, the body, and the way back to the list.
 *
 * The article arrives in one language (lib/newsArticles, LocalizedArticle),
 * and the page speaks that language: the date is formatNewsDate's for it,
 * and the two strings this file owns are COPY's.
 *
 * The shell is the 安全とプライバシー page's (components/trust/TrustPage),
 * which is the site's model for a page of text: the same pale flower off
 * the top-right corner, the same Container measure, the same top padding
 * clearing the fixed nav (7rem, 10rem from md), the same h1, and the same
 * DrawnRule over a closing line. Read TrustPage for why each is what it
 * is; what is this file's own is said where it happens.
 *
 * A server component. The article arrives whole from the route, which has
 * already turned an unknown slug into a 404.
 *
 * Like TrustPage, the first screen is not animated: the title and the text
 * are in the HTML at full strength, and the only motion is the flower's
 * drift and the closing rule drawing in.
 *
 * A div, not an <article> wrapped in a <main>: the root layout already
 * wraps every page in <main>, and the page is the one article.
 */
export function NewsArticlePage({ article }: { article: LocalizedArticle }) {
  const { locale } = article;
  const copy = COPY[locale];

  return (
    <div className="relative overflow-x-clip bg-canvas">
      {/*
        TrustPage's wash, unchanged — including the opacity and blur on an
        inner element with no style attribute, which keeps the layout's
        noscript rule from setting it to full strength (see TrustPage).
        The muted date line can come to lie on it on a phone: muted on the
        wash's #f0f7fd is 5.79:1, inside AA.
      */}
      <Drift
        amount={-40}
        className="pointer-events-none absolute top-8 -right-24 aspect-square w-[clamp(18rem,40vw,38rem)] md:top-12 md:-right-[6%]"
      >
        <div className="h-full w-full text-accent opacity-[0.12] blur-[6px]">
          <Flower size={100} rotate={18} className="h-full w-full" />
        </div>
      </Drift>

      <Container className="relative pt-28 pb-[clamp(3.5rem,7vw,6rem)] md:pt-40">
        <header>
          {/*
            When and what kind, above the title in the register's own date
            style (components/sections/News): small, muted, tabular figures.
            The separator is the " · " the site's other bylines use, and is
            hidden from a screen reader, which reads the two as a pair.

            COPY's undated label only ever shows on the dev server: an
            article without a date is a draft, and a production build gives
            it no page.
          */}
          <p className="text-[0.85rem] text-muted">
            {article.date ? (
              <time dateTime={article.date} className="tabular-nums">
                {formatNewsDate(article.date, locale)}
              </time>
            ) : (
              copy.undated
            )}
            <span aria-hidden> · </span>
            {article.category}
          </p>

          {/* TrustPage's h1, with what TITLE adds for a longer title. */}
          <h1 className={TITLE[locale]}>{article.title}</h1>
        </header>

        {/*
          The body, at the measure of TrustPage's Japanese opening paragraph
          (40rem): Japanese text read at length wants a line of about forty
          characters, not the Container's full 68rem. The same 40rem holds
          English at 17–18px to about seventy-five characters, inside the
          English opening paragraph's 46rem. The type, the headings, lists
          and tables are Markdown's own.
        */}
        <div className="mt-10 max-w-[40rem] md:mt-14">
          <Markdown
            source={article.body}
            file={article.file}
            lineOffset={article.lineOffset}
            locale={locale}
          />
        </div>
      </Container>

      {/*
        The closing line, as TrustPage closes: a rule, then the way on —
        here, back to the list. The footer's quiet link with an icon before
        it, as the footer sets its mail link, so it reads as a link without
        competing with the text above it. A plain anchor, like every link
        between pages on this site, to the News section of the home page in
        the article's language — /#news or /en#news — by the same helper the
        nav's and the footer's section links use off the home page
        (sectionHref in lib/site, with localePath's home page): the same full
        load they make from /safety.
      */}
      <Container className="relative">
        <div className="relative pt-[clamp(2.5rem,5vw,3.5rem)] pb-[clamp(4rem,9vw,7rem)]">
          <DrawnRule className="top-0" />
          <a
            href={sectionHref("news", false, localePath(locale, "/"))}
            className={`inline-flex items-center gap-2 ${QUIET_LINK}`}
          >
            <Icon name="arrow_back" size={18} className="shrink-0" />
            {copy.back}
          </a>
        </div>
      </Container>
    </div>
  );
}
