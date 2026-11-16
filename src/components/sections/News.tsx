import Image from "next/image";
import { DrawnRule } from "@/components/DrawnRule";
import { Flower } from "@/components/Flower";
import { NewsPhotoCursor, type FollowPhoto } from "@/components/NewsPhotoCursor";
import { Reveal } from "@/components/Reveal";
import { Container, Icon, SectionTitle } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import {
  NEWS,
  formatNewsDate,
  newestFirst,
  type NewsDate,
  type NewsEntry,
  type NewsPhoto,
} from "@/lib/news";
import {
  allArticles,
  visibleArticles,
  type LocalizedArticle,
} from "@/lib/newsArticles";

/**
 * A dated register, closed until asked.
 *
 * Two kinds of row share it. The entries — what happened and when, written
 * in both of the site's languages — live in lib/news.ts, with their order
 * and the date display. The articles, whole texts with a page each at
 * /news/<slug>, are files in content/news, read by lib/newsArticles.ts.
 * Every article is in Japanese, and in English too once it has been
 * translated (a second file, at /en/news/<slug>), so each page lists the
 * entries and the articles written in its own language. This file is the
 * layout; the strings it owns are the section's title and the article
 * rows' labels (ARTICLE_COPY). It is a server component, so the language
 * arrives as the `locale` prop from the page (see lib/i18n), and it reads
 * the articles off the disk when the page is built.
 *
 * Each row is full-width, its rules running edge to edge of the viewport —
 * wider than the page measure — so a row reads as a line in a register
 * rather than as a block waiting for a neighbour. Inside the rules the
 * content keeps to the ordinary 68rem measure, which is what ties the rows
 * back to the rest of the page.
 *
 * That is why this is a hand-rolled <section> and not <Section>. Section
 * wraps everything it is given in the Container, and a rule drawn inside the
 * Container stops at the measure. The section classes are copied from it so
 * the rhythm down the page does not change, scroll-mt-24 included: the nav
 * scroll-spy and the Lenis anchors both depend on that offset and on the id.
 *
 * This is the one place the page's ground shifts. The register sits on
 * bg-canvas-alt (#f5f7fa), the palette's second surface, which the page
 * otherwise never uses as a ground. It is a change of light rather than a
 * band: a 6rem fade from the canvas white at the top and another at the
 * bottom, so there is no edge to the section, only a slightly different air.
 * The fades sit at -z-10 inside the section's own stacking context
 * (isolate), which puts them above the section's fill and under everything
 * in flow — the title cannot be tinted by them, with or without JS. Both are
 * aria-hidden and take no pointer.
 *
 * Every pair was measured on the alt ground: ink 18.11:1 (the names, the
 * article titles, the open/close mark and the arrow), the muted sentence,
 * summary and date 5.83:1 (6.25:1 where the top fade is still white), the
 * focus ring and the 詳しく読む link (mark-1) 5.07:1 — the link is
 * underlined too, so it does not rest on its colour alone. The rules are the
 * one thing the alt ground weakens — bare line-strong is 3.46:1 there
 * against 3.72:1 on the white canvas. It still clears the 3:1 a structural
 * line needs, but the register would read a shade fainter than every other
 * rule on the page, so a flat layer of the text colour at 4% is laid over
 * the rule's own fill: 3.70:1, the same weight the rules have elsewhere. It
 * is a background-image, so it composes with DrawnRule's background-color
 * rather than fighting it for the same property.
 *
 * Every entry is closed at first: the flower, the name at display size, the
 * date and a plus. That is the whole register at a glance — what happened
 * and when — in a fraction of the height it took with every sentence and
 * photo laid open. Each entry is a native <details>, so opening one needs
 * no script, is a button to the keyboard and to a screen reader with its
 * expanded state announced, and leaves the sentence in the server-rendered
 * HTML for a crawler whether or not anyone opens it. Any number of rows can
 * be open at once; they are independent entries, not tabs.
 *
 * Opened, an entry shows its sentence under the name — in Japanese several
 * open with a particle that continues the name (に登壇し, で、), so name →
 * sentence has to read straight on; the English ones are whole sentences
 * that read on from the name as their heading — and its photo, when there
 * is one, in a column of its own at the right. Below md the photo follows
 * the sentence.
 *
 * There is no "open" or "close" label to translate: the summary is the
 * control, the browser announces it and its expanded state in the reader's
 * own language, and the plus is decoration.
 *
 * An article row is the same row — the flower, the grid, the hairlines, the
 * reveal — that does not open: the whole row is a link to the article's
 * page, and where an entry has its plus it has an arrow, drawn the same
 * way. Its title is a whole sentence, not a proper noun, so it is set in the
 * step titles' style from HowItWorks, which holds the longest title in about
 * two lines on a desktop, where display size would take it to four or
 * more. The summary under it is the opened entries' muted sentence, and the
 * date is the entries' small date, with the category beside it as plain
 * text. It is all on show, so there is nothing for it to open.
 *
 * An entry that tells the same story as an article names it (`article` in
 * lib/news.ts). That article then has no row of its own — one event, one
 * row — and the entry, opened, ends with 詳しく読む → the article (Read
 * more → its English page, on the English page). Each only once the
 * article is published in that language: an article dated TODO has no
 * page, so it is not listed and nothing links to it (the dev server shows
 * drafts, marked 日付未定 or "Date to be set" — see lib/newsArticles), and
 * an article with no English version is neither listed nor linked on the
 * English page.
 *
 * With a mouse, a closed entry with a photo also shows that photo in place
 * of the cursor while the pointer is over it (NewsPhotoCursor, which wraps
 * the list). That is a preview, not the photo's home: it never appears for
 * an open row, and touch, keyboard, reduced motion and no-JS visitors see
 * the photo where everyone can, in the opened row. The follower looks only
 * for <details> rows that carry a photo, so it passes over an article row,
 * which has none, as it passes over SusHi Tech Tokyo's.
 */
const LEDGER_RULE =
  "bg-[linear-gradient(color-mix(in_srgb,var(--color-text)_4%,transparent),color-mix(in_srgb,var(--color-text)_4%,transparent))]";

const COPY = {
  ja: { title: "ニュース" },
  en: { title: "News" },
} as const;

/**
 * The article rows' labels: `undated` stands where a draft's date would be
 * (drafts show on the dev server only), and `more` is the link from an
 * entry to its article. `sep` joins the link's words to the article's
 * title for a screen reader, in each language's own punctuation.
 */
const ARTICLE_COPY = {
  ja: { undated: "日付未定", more: "詳しく読む", sep: "：" },
  en: { undated: "Date to be set", more: "Read more", sep: ": " },
} as const satisfies Record<
  Locale,
  { undated: string; more: string; sep: string }
>;

/**
 * The opened row's sentence, per language. measure-jp is the site's Japanese
 * paragraph setting — 1.9 leading and a hair of tracking — which sets an
 * English sentence as if it were double-spaced, so English takes the Latin
 * leading the 安全とプライバシー pages use. Whole class strings, because
 * Tailwind only generates what it can read. An article's summary is in the
 * page's language, and takes the same setting.
 */
const BODY_TYPE = {
  ja: "measure-jp",
  en: "text-pretty leading-[1.65]",
} as const;

/** Literal classes for the crop — Tailwind cannot see an interpolated one. */
const PHOTO_POSITION: Record<NonNullable<NewsPhoto["position"]>, string> = {
  top: "object-top",
  center: "object-center",
  bottom: "object-bottom",
};

/**
 * The rows' shared frame: the Container's measure and gutters, as a grid.
 *
 * Written out rather than using <Container> because the closed row is a
 * <summary>, which takes phrasing content only — a div in there is invalid
 * markup, so inside it every box is a span set to block or grid. The part
 * that opens sits after the summary, where a div is fine. The article row
 * keeps to spans as well, so the two rows are built alike.
 *
 * The first column is the flower's 22px, in both the closed row and the
 * opened part under it, and the name and the sentence both add the same
 * padding past the gap. That puts the sentence's left edge exactly under
 * the name's, although the two grids differ to the right of it. The gap
 * itself stays small (1.5rem from md) because in the closed row it is also
 * what separates the date from the plus, which read as a pair. An article
 * row has the same columns, its title and summary in the name's place and
 * its arrow in the plus's.
 */
const ROW =
  "mx-auto grid w-full max-w-[68rem] gap-x-4 px-6 md:gap-x-6 md:px-10";

/**
 * A box exactly as tall as the name's first line, with its content centred
 * in it. The flower, the date (from md) and the plus sit in one, so all
 * three hang off the same line through the middle of the name, whatever
 * size the clamp has set it at and however many lines the name then takes.
 */
const FIRST_LINE =
  "flex h-[calc(clamp(2.5rem,5vw,3.75rem)*1.05)] items-center";

/**
 * FIRST_LINE for an article row: as tall as the title's first line, at the
 * step-title size and its 1.35 leading, so the flower, the date and the
 * arrow hang off the middle of that line as an entry's hang off its name.
 */
const TITLE_LINE =
  "flex h-[calc(clamp(1.35rem,2.4vw,1.75rem)*1.35)] items-center";

/**
 * The row's marker: the brand flower in ink — the same shape the logo
 * draws. Decorative; the name or the title is the entry. It turns a little
 * under the pointer, about the flower's own centre (126, 133.25 of its
 * 250×241 box — see lib/flower) so it turns in place, as the cue that the
 * row does something: an entry opens, an article row leads to its page. Not
 * under reduced motion, where it simply stays put. `row` is the group both
 * kinds of row declare, on the <summary> and on the article's link.
 */
const FLOWER_MARK =
  "origin-[50.4%_55.3%] text-ink motion-safe:transition-[rotate] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/row:rotate-45";

/**
 * Hides the system cursor over a closed row that has a photo, but only
 * inside a list NewsPhotoCursor has marked as following — so only when the
 * photo is there to take the cursor's place.
 */
const FOLLOW_CURSOR = "[[data-news-follow]_details:not([open])>&]:cursor-none";

const FOLLOW_PHOTOS: FollowPhoto[] = NEWS.flatMap(({ photo }) =>
  photo
    ? [
        {
          src: photo.src,
          width: photo.width,
          height: photo.height,
          crop: PHOTO_POSITION[photo.position ?? "center"],
        },
      ]
    : [],
);

/**
 * One row of the register: an entry, with the article that tells its story
 * when there is one to link to, or an article that no entry names.
 */
type Row = { key: string; date: NewsDate | null | undefined } & (
  | { type: "entry"; entry: NewsEntry; more: LocalizedArticle | undefined }
  | { type: "article"; article: LocalizedArticle }
);

/**
 * The register for one language, newest first by the one rule both kinds of
 * row are ordered by (newestFirst in lib/news.ts): undated entries, then
 * drafts, after everything dated; entries sharing a date with an article
 * come first, as they are added first and the sort is stable.
 *
 * The articles are the ones published in `locale` (visibleArticles): in
 * English, those with an English version. An entry's link to its article,
 * and the rule that a named article has no row of its own, work the same
 * in both languages.
 *
 * Every entry's `article` must name a file in content/news, drafts
 * included, so a misspelt slug fails the build here rather than leaving an
 * entry without its link and the article listed twice over.
 *
 * The keys: an entry's is its date and its Japanese name in either language
 * — it identifies the entry and is not what the row shows; an article's is
 * its slug, which is its file name.
 */
function rowsFor(locale: Locale): Row[] {
  const onDisk = allArticles();
  for (const entry of NEWS) {
    if (entry.article && !onDisk.some((a) => a.slug === entry.article)) {
      throw new Error(
        `lib/news.ts: the entry 「${entry.name.ja}」 names the article "${entry.article}", but there is no content/news/${entry.article}.md.`,
      );
    }
  }

  const articles = visibleArticles(locale);
  const named = new Set(NEWS.map((entry) => entry.article));

  const rows: Row[] = [
    ...NEWS.map(
      (entry): Row => ({
        type: "entry",
        key: `${entry.date ?? "undated"}-${entry.name.ja}`,
        date: entry.date,
        entry,
        more: articles.find((a) => a.slug === entry.article),
      }),
    ),
    ...articles
      .filter((article) => !named.has(article.slug))
      .map(
        (article): Row => ({
          type: "article",
          key: `article-${article.slug}`,
          date: article.date,
          article,
        }),
      ),
  ];

  return rows.sort((a, b) => newestFirst(a.date, b.date));
}

export function News({ locale }: { locale: Locale }) {
  const rows = rowsFor(locale);

  return (
    <section
      id="news"
      className="relative isolate scroll-mt-24 bg-canvas-alt py-[clamp(5rem,10vw,9rem)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-linear-to-b from-canvas to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-canvas to-transparent"
      />

      <Container>
        <Reveal>
          <SectionTitle>{COPY[locale].title}</SectionTitle>
        </Reveal>
      </Container>

      {/*
        The opening rule lives beside the list rather than in it: an <ol> may
        hold nothing but <li>, and the point of rendering a real list is that
        it stays a valid one. It draws almost at once, since there is nothing
        above it to wait for; the rule that closes each row keeps DrawnRule's
        default hold so the words arrive before the line under them does.

        The rules take no pointer: a 1px line between two rows would
        otherwise count as "not over a row", and the photo following the
        cursor would blink out at every row boundary.
      */}
      <NewsPhotoCursor photos={FOLLOW_PHOTOS} className="relative">
        <DrawnRule
          className={`pointer-events-none top-0 ${LEDGER_RULE}`}
          delay={0.1}
        />

        {/*
          A plain list, and each row triggers its own reveal. A single reveal
          on the whole <ol> would fire at 20% visibility, which a list more
          than five viewports tall can never reach — and the register grows,
          and its rows open. The reveal wraps the whole row — the <details>,
          or the article's link — not the pieces of it one by one: those
          pieces are inside <summary> or <a>, where Reveal's div would be
          invalid markup or a block inside a line of text.

          role="list" for the same reason Stagger sets it: the preflight
          removes list markers, and WebKit then stops announcing an unmarked
          list as one.
        */}
        <ol role="list">
          {rows.map((row) => (
            <li key={row.key} className="relative">
              <Reveal>
                {row.type === "entry" ? (
                  <EntryRow item={row.entry} more={row.more} locale={locale} />
                ) : (
                  <ArticleRow article={row.article} />
                )}
              </Reveal>

              <DrawnRule
                className={`pointer-events-none bottom-0 ${LEDGER_RULE}`}
              />
            </li>
          ))}
        </ol>
      </NewsPhotoCursor>
    </section>
  );
}

/**
 * An entry from lib/news.ts: a <details> that opens in place to its
 * sentence and photo — and, when `more` is given, to a link to the article
 * that tells the same story at length.
 */
function EntryRow({
  item,
  more,
  locale,
}: {
  item: NewsEntry;
  more: LocalizedArticle | undefined;
  locale: Locale;
}) {
  const label = ARTICLE_COPY[locale];

  return (
    <details className="group" data-news-photo={item.photo?.src}>
      {/*
        block (not the default list-item) and the WebKit marker hidden: the
        row's own plus is the disclosure mark.

        The focus ring is the site's own (:focus-visible in globals.css),
        pulled inside the row: the summary runs the full width of the
        viewport, and the default 3px outset would put its sides off the
        screen. The ! is needed because that rule is unlayered and beats any
        utility.
      */}
      <summary
        className={`group/row block cursor-pointer list-none focus-visible:-outline-offset-4! [&::-webkit-details-marker]:hidden ${
          item.photo ? FOLLOW_CURSOR : ""
        }`}
      >
        {/*
          Open, the row gives up most of its bottom padding, so the sentence
          reads on from the name instead of starting a new block under it. A
          step, not an animation — the row changes height once, as it opens.
        */}
        <span
          className={`${ROW} grid-cols-[1.375rem_1fr_auto] py-6 group-open:pb-3 md:grid-cols-[1.375rem_1fr_auto_auto] md:py-8 md:group-open:pb-4`}
        >
          <span className={`col-start-1 row-start-1 ${FIRST_LINE}`}>
            <Flower size={22} className={FLOWER_MARK} />
          </span>

          {/*
            Weight 300: the hero's voice, not the section head's, capped at
            3.75rem instead of riding 5vw up to the measure.

            The breaking is set by hand. Japanese breaks between any two
            characters by default, which at display size puts the line end in
            the middle of a compound. break-keep allows breaks only at spaces
            and at the zero-width spaces written into the data; wrap-anywhere
            is the safety net for a phrase wider than the column, and it is
            also what keeps the name's min-content small enough that the 1fr
            column cannot be pushed wider by it. text-balance evens the lines
            out so a two-line name does not end on a lone "2026".

            The English names take the same classes. An English name already
            breaks only at its spaces, so break-keep changes nothing for it,
            and palt is a feature of the Japanese faces that the Latin ones do
            not have. Its longest word ("Business", about 160px at the 2.5rem
            floor) is narrower than the 194px the name column has on a 320px
            phone, so wrap-anywhere never has to split one. The one name that
            differs, "… Tokyo qualifier" for 「… Tokyo予選」, is a word longer
            and takes the same number of lines or one more.
          */}
          <span className="col-start-2 row-start-1 block text-balance break-keep wrap-anywhere text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1] md:pl-4 lg:pl-8">
            {item.name[locale]}
          </span>

          {/*
            Under the name on a phone, where there is no room beside it; from
            md at the right, beside the plus.
          */}
          {item.date && (
            <span className="col-start-2 row-start-2 mt-2 block md:col-start-3 md:row-start-1 md:mt-0 md:flex md:h-[calc(clamp(2.5rem,5vw,3.75rem)*1.05)] md:items-center">
              <time
                dateTime={item.date}
                className="whitespace-nowrap text-[0.85rem] tabular-nums text-muted"
              >
                {formatNewsDate(item.date, locale)}
              </time>
            </span>
          )}

          {/*
            The same open/close mark as the FAQ, drawn larger for a row at
            display size: two 1px rules, the height of the register's own
            hairlines, crossed into a plus; opening folds the upright one down
            onto the other, a minus. rotate only. Decorative — the summary is
            already announced as a button with its expanded state.
          */}
          <span
            aria-hidden
            className={`col-start-3 row-start-1 ${FIRST_LINE} md:col-start-4`}
          >
            <span className="relative block h-px w-6 bg-ink before:absolute before:inset-0 before:rotate-90 before:bg-ink before:content-[''] before:transition-[rotate] before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] group-open:before:rotate-0 motion-reduce:before:transition-none" />
          </span>
        </span>
      </summary>

      {/*
        What opening reveals. It fades in, and drops the last 8px into place
        where motion is welcome; the height is never animated, the row is
        simply taller once open.

        The fade is a transition from the closed values, with @starting-style
        (starting:) holding the same values for browsers that render closed
        <details> content as nothing at all, where there is no closed style to
        transition from. No script is involved, so it works without JS. If
        none of it runs, the open state is still just the open state: fully
        opaque, in place.
      */}
      <div
        className={`${ROW} grid-cols-[1.375rem_1fr] pb-10 opacity-0 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:opacity-100 group-open:starting:opacity-0 motion-safe:-translate-y-2 motion-safe:group-open:translate-y-0 motion-safe:group-open:starting:-translate-y-2 motion-reduce:duration-200 md:grid-cols-[1.375rem_1fr_minmax(16rem,20rem)] md:pb-12`}
      >
        {/*
          The sentence, and under it the link to the article when there is
          one, share the name's column. They are one cell, so the link sits
          directly under the sentence however tall the photo beside them is.
        */}
        <div className="col-start-2 row-start-1 md:pl-4 lg:pl-8">
          <p className={`${BODY_TYPE[locale]} text-[1.0625rem] text-muted`}>
            {item.body[locale]}
          </p>

          {/*
            Quiet: smaller than the sentence, in the site's link style —
            mark-1 with a faint underline that firms up on hover, as on the
            contact page — and the arrow that ButtonLink's hover brings in,
            which steps forward a pixel or two under the pointer where motion
            is welcome. On its own "詳しく読む" (or "Read more") says nothing
            about where it goes, and there can be two in the list, so a
            screen reader also hears the article's title.

            A plain anchor, like every link between pages on this site: a
            full load, which is what Lenis has always started from.
          */}
          {more && (
            <p className="mt-4 text-[0.95rem]">
              <a
                href={more.path}
                className="group/more text-mark-1 underline decoration-mark-1/40 underline-offset-4 transition-colors duration-300 hover:decoration-mark-1"
              >
                {label.more}
                <span className="sr-only">
                  {label.sep}
                  {more.title}
                </span>
                <Icon
                  name="arrow_forward"
                  size={16}
                  className="ml-1 inline-block align-[-0.15em] motion-safe:transition-[translate] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/more:translate-x-0.5"
                />
              </a>
            </p>
          )}
        </div>

        {/*
          A fixed 3:2 frame whatever the file is, so photos from different
          phones still line up down the register; object-cover takes the
          difference and `position` in the data chooses which part survives.

          bg-line is the empty frame while the file loads, so the row keeps
          its shape. The edge is an outline pulled 1px inside rather than a
          border or a ring: an outline paints over the image and follows the
          radius, so a photo with a pale sky still has an edge against the
          pale ground. It is decorative — ink at 10% — and not a boundary
          anyone has to find.

          Lazy, as next/image is by default, and a closed row's content is
          not rendered, so a photo is fetched when its row is opened — or
          already sits in the cache, fetched for the pointer preview at the
          same 20rem.

          sizes: the column is at most 20rem from md; below that the photo is
          capped at 28rem and otherwise runs the width of the phone.
        */}
        {item.photo && (
          <Image
            src={item.photo.src}
            width={item.photo.width}
            height={item.photo.height}
            alt={item.photo.alt[locale]}
            sizes="(min-width: 768px) 20rem, (min-width: 480px) 28rem, 100vw"
            className={`col-start-2 mt-6 aspect-[3/2] h-auto w-full max-w-md rounded-2xl bg-line object-cover outline-1 -outline-offset-1 outline-ink/10 md:col-start-3 md:row-start-1 md:mt-0 ${PHOTO_POSITION[item.photo.position ?? "center"]}`}
          />
        )}
      </div>
    </details>
  );
}

/**
 * An article row's title and summary, per language — whole class strings,
 * because Tailwind only generates what it can read. Explained where they
 * are used, in ArticleRow.
 */
const ARTICLE_TITLE: Record<Locale, string> = {
  ja: "col-start-2 row-start-1 block text-pretty wrap-anywhere text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.025em] text-ink [word-break:auto-phrase] md:pl-4 lg:pl-8",
  en: "col-start-2 row-start-1 block text-balance wrap-anywhere text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.025em] text-ink md:pl-4 lg:pl-8",
};

const ARTICLE_SUMMARY: Record<Locale, string> = {
  ja: `${BODY_TYPE.ja} col-start-2 row-start-3 mt-3 block text-pretty text-[1.0625rem] text-muted [word-break:auto-phrase] md:row-start-2 md:pl-4 lg:pl-8`,
  en: `${BODY_TYPE.en} col-start-2 row-start-3 mt-3 block text-[1.0625rem] text-muted md:row-start-2 md:pl-4 lg:pl-8`,
};

/**
 * An article no entry names: the same row as an entry's, closed, except
 * that it is a link to the article's page and shows its summary in place
 * of the sentence an entry keeps folded away. In the article's language,
 * which is the page's: the title, category and summary are that language's
 * file, the date is formatNewsDate's for it, and the link goes to the page
 * in it.
 *
 * The link's name is the title alone, and the date, category and summary
 * are its description: read out whole, a row would be a paragraph before a
 * listener heard what it was. The ids are the slug's, which is unique.
 *
 * A plain anchor, like every link between pages on this site: a full load,
 * which is what Lenis has always started from.
 */
function ArticleRow({ article }: { article: LocalizedArticle }) {
  const { locale } = article;
  const id = `news-${article.slug}`;

  return (
    <a
      href={article.path}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-meta ${id}-summary`}
      className="group/row block focus-visible:-outline-offset-4!"
    >
      <span
        className={`${ROW} grid-cols-[1.375rem_1fr_auto] py-6 md:grid-cols-[1.375rem_1fr_auto_auto] md:py-8`}
      >
        <span className={`col-start-1 row-start-1 ${TITLE_LINE}`}>
          <Flower size={22} className={FLOWER_MARK} />
        </span>

        {/*
          The step-title style (HowItWorks), indented as the names are.
          [word-break:auto-phrase] breaks Japanese between phrases rather
          than between any two characters, as in the footer and on the
          安全とプライバシー page; Chrome and Edge support it, and elsewhere
          it falls back to the ordinary break. text-pretty keeps a last line
          from being a single character. English breaks at its spaces and is
          balanced instead, as the English step titles are (ARTICLE_TITLE).

          wrap-anywhere is the names' safety net again. auto-phrase keeps a
          phrase whole where it can, and a phrase can be wider than the
          column: 「共同研究パートナーを」 is ten characters, about 216px at
          the 1.35rem floor, against the title column's 194px on a 320px
          phone. Kept whole, it would run past the column and, as the
          title's min-content, push the 1fr column wider and the arrow off
          the screen. With it, a phrase too long for the line breaks where it
          must, and nothing changes for one that fits.
        */}
        <span id={`${id}-title`} className={ARTICLE_TITLE[locale]}>
          {article.title}
        </span>

        {/*
          Where an entry has its date, in the same small date type: under the
          title on a phone, at the right from md. The category follows the
          date as plain text. The space before the dot does not break, so on
          a narrow phone the category goes down a line with the dot left
          behind the date, never leading the next line; each half keeps
          itself together. That space is written as the escape \u00A0, never
          as the character itself — pasted in, it looks like any other space
          in the editor, and the next person to retype the line would drop
          it without knowing (the same rule lib/news.ts gives for the names'
          zero-width spaces). One inner span, as the entry's date has its
          <time>: from md the outer one is a flex box, and loose text in it
          would be a flex item of its own and lose the space after the dot.
        */}
        <span
          id={`${id}-meta`}
          className="col-start-2 row-start-2 mt-2 block md:col-start-3 md:row-start-1 md:mt-0 md:flex md:h-[calc(clamp(1.35rem,2.4vw,1.75rem)*1.35)] md:items-center"
        >
          <span className="text-[0.85rem] tabular-nums text-muted md:whitespace-nowrap">
            <span className="whitespace-nowrap">
              {article.date ? (
                <time dateTime={article.date}>
                  {formatNewsDate(article.date, locale)}
                </time>
              ) : (
                ARTICLE_COPY[locale].undated
              )}
            </span>
            {"\u00A0· "}
            <span className="whitespace-nowrap">{article.category}</span>
          </span>
        </span>

        {/*
          The plus's counterpart: a 1px shaft the width of the plus, with a
          head of two shorter 1px strokes turned off its tip — the register's
          hairline weight again. Under the pointer it steps forward 4px, where
          motion is welcome; it never turns, since a link has no state to
          show. Decorative — the link is already announced as one.
        */}
        <span
          aria-hidden
          className={`col-start-3 row-start-1 ${TITLE_LINE} md:col-start-4`}
        >
          <span className="relative block h-px w-6 bg-ink before:absolute before:top-0 before:right-0 before:h-px before:w-2.5 before:origin-right before:rotate-45 before:bg-ink before:content-[''] after:absolute after:top-0 after:right-0 after:h-px after:w-2.5 after:origin-right after:-rotate-45 after:bg-ink after:content-[''] motion-safe:transition-[translate] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/row:translate-x-1" />
        </span>

        {/*
          The summary, in the opened entries' sentence style for the
          language, under the title's left edge.
        */}
        <span id={`${id}-summary`} className={ARTICLE_SUMMARY[locale]}>
          {article.summary}
        </span>
      </span>
    </a>
  );
}
