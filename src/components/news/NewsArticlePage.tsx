import { DrawnRule } from "@/components/DrawnRule";
import { Flower } from "@/components/Flower";
import { Drift } from "@/components/flourish/Drift";
import { Markdown } from "@/components/news/Markdown";
import { TRUST_TYPE } from "@/components/trust/TrustSections";
import { Container, Icon } from "@/components/ui";
import { formatNewsDate } from "@/lib/news";
import type { NewsArticle } from "@/lib/newsArticles";
import { sectionHref } from "@/lib/site";

/**
 * The 安全とプライバシー page's Japanese type: the h1 here is set exactly as
 * that page's is, so the site's two text pages read as one family.
 */
const TYPE = TRUST_TYPE.ja;

/**
 * The footer's quiet link (QUIET_LINK in components/Footer), written out
 * because Footer keeps it to itself: small, muted — 6.25:1 on the ground,
 * so the resting state passes AA — and ink on a fine pointer's hover.
 * Whole class strings, because Tailwind only generates what it can read.
 */
const QUIET_LINK =
  "text-[0.9rem] text-muted transition-colors duration-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink";

/**
 * One news article, /news/<slug>: the date and category, the title, the
 * body, and the way back to the list.
 *
 * Japanese only — the articles have no English (lib/newsArticles) — so
 * there is no `locale` prop and every string here is Japanese.
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
export function NewsArticlePage({ article }: { article: NewsArticle }) {
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

            日付未定 only ever shows on the dev server: an article without a
            date is a draft, and a production build gives it no page.
          */}
          <p className="text-[0.85rem] text-muted">
            {article.date ? (
              <time dateTime={article.date} className="tabular-nums">
                {formatNewsDate(article.date, "ja")}
              </time>
            ) : (
              "日付未定"
            )}
            <span aria-hidden> · </span>
            {article.category}
          </p>

          {/*
            TrustPage's h1. An article's title runs to two or three lines
            where 安全とプライバシー takes one, so two things are added for
            the lines: auto-phrase breaks the Japanese between phrases
            rather than between any two characters, as the footer's and the
            adoption note's paragraphs do, and text-balance evens the lines
            so a title does not end on a lone word.

            wrap-anywhere is the fallback the News register's names carry
            for the same reason: auto-phrase does not break inside a phrase,
            and at 320px the h1's 28px leaves room for about ten characters
            a line, so a longer phrase — a katakana compound such as
            スタートアップカンファレンス — would run past the edge and be
            clipped by the page's overflow-x-clip. It changes nothing for a
            title whose phrases fit.
          */}
          <h1
            className={`mt-4 text-balance font-light tracking-[-0.02em] text-ink wrap-anywhere [word-break:auto-phrase] md:mt-5 ${TYPE.h1}`}
          >
            {article.title}
          </h1>
        </header>

        {/*
          The body, at the measure of TrustPage's opening paragraph (40rem):
          Japanese text read at length wants a line of about forty
          characters, not the Container's full 68rem. The type, the
          headings, lists and tables are Markdown's own.
        */}
        <div className="mt-10 max-w-[40rem] md:mt-14">
          <Markdown
            source={article.body}
            file={`content/news/${article.slug}.md`}
            lineOffset={article.lineOffset}
          />
        </div>
      </Container>

      {/*
        The closing line, as TrustPage closes: a rule, then the way on —
        here, back to the list. The footer's quiet link with an icon before
        it, as the footer sets its mail link, so it reads as a link without
        competing with the text above it. A plain anchor, like every link
        between pages on this site, to /#news by the same helper the nav's
        and the footer's section links use off the home page (sectionHref
        in lib/site) — the same full load they make from /safety.
      */}
      <Container className="relative">
        <div className="relative pt-[clamp(2.5rem,5vw,3.5rem)] pb-[clamp(4rem,9vw,7rem)]">
          <DrawnRule className="top-0" />
          <a
            href={sectionHref("news", false)}
            className={`inline-flex items-center gap-2 ${QUIET_LINK}`}
          >
            <Icon name="arrow_back" size={18} className="shrink-0" />
            ニュース一覧へ戻る
          </a>
        </div>
      </Container>
    </div>
  );
}
