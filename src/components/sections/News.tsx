import Image from "next/image";
import { DrawnRule } from "@/components/DrawnRule";
import { Flower } from "@/components/Flower";
import { NewsPhotoCursor, type FollowPhoto } from "@/components/NewsPhotoCursor";
import { Reveal } from "@/components/Reveal";
import { Container, SectionTitle } from "@/components/ui";
import { NEWS, formatNewsDate, type NewsPhoto } from "@/lib/news";

/**
 * A dated register, closed until asked.
 *
 * The entries, their order and the date display live in lib/news.ts; this
 * file is only the layout. Each entry is a full-width row whose rules run
 * edge to edge of the viewport — wider than the page measure — so a row
 * reads as a line in a register rather than as a block waiting for a
 * neighbour. Inside the rules the content keeps to the ordinary 68rem
 * measure, which is what ties the rows back to the rest of the page.
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
 * Every pair was measured on the alt ground: ink 18.11:1 (the names and the
 * open/close mark), the muted sentence and date 5.83:1 (6.25:1 where the top
 * fade is still white), the focus ring (mark-1) 5.07:1. The rules are the
 * one thing the alt ground weakens — bare line-strong is 3.46:1 there
 * against 3.72:1 on the white canvas. It still clears the 3:1 a structural
 * line needs, but the register would read a shade fainter than every other
 * rule on the page, so a flat layer of the text colour at 4% is laid over
 * the rule's own fill: 3.70:1, the same weight the rules have elsewhere. It
 * is a background-image, so it composes with DrawnRule's background-color
 * rather than fighting it for the same property.
 *
 * Every row is closed at first: the flower, the name at display size, the
 * date and a plus. That is the whole register at a glance — what happened
 * and when — in a fraction of the height it took with every sentence and
 * photo laid open. Each row is a native <details>, so opening one needs no
 * script, is a button to the keyboard and to a screen reader with its
 * expanded state announced, and leaves the sentence in the server-rendered
 * HTML for a crawler whether or not anyone opens it. Any number of rows can
 * be open at once; they are independent entries, not tabs.
 *
 * Opened, a row shows its sentence under the name — several open with a
 * particle that continues the name (に登壇し, で、), so name → sentence has
 * to read straight on — and its photo, when there is one, in a column of its
 * own at the right. Below md the photo follows the sentence.
 *
 * With a mouse, a closed row with a photo also shows that photo in place of
 * the cursor while the pointer is over it (NewsPhotoCursor, which wraps the
 * list). That is a preview, not the photo's home: it never appears for an
 * open row, and touch, keyboard, reduced motion and no-JS visitors see the
 * photo where everyone can, in the opened row.
 */
const LEDGER_RULE =
  "bg-[linear-gradient(color-mix(in_srgb,var(--color-text)_4%,transparent),color-mix(in_srgb,var(--color-text)_4%,transparent))]";

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
 * that opens sits after the summary, where a div is fine.
 *
 * The first column is the flower's 22px, in both the closed row and the
 * opened part under it, and the name and the sentence both add the same
 * padding past the gap. That puts the sentence's left edge exactly under
 * the name's, although the two grids differ to the right of it. The gap
 * itself stays small (1.5rem from md) because in the closed row it is also
 * what separates the date from the plus, which read as a pair.
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

export function News() {
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
          <SectionTitle>ニュース</SectionTitle>
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
          and its rows open. The reveal wraps the whole <details>, not the
          pieces of the row one by one: those pieces are inside <summary>,
          where Reveal's div would be invalid markup.

          role="list" for the same reason Stagger sets it: the preflight
          removes list markers, and WebKit then stops announcing an unmarked
          list as one.
        */}
        <ol role="list">
          {NEWS.map((item) => (
            <li
              key={`${item.date ?? "undated"}-${item.name}`}
              className="relative"
            >
              <Reveal>
                <details
                  className="group"
                  data-news-photo={item.photo?.src}
                >
                  {/*
                    block (not the default list-item) and the WebKit marker
                    hidden: the row's own plus is the disclosure mark.

                    The focus ring is the site's own (:focus-visible in
                    globals.css), pulled inside the row: the summary runs the
                    full width of the viewport, and the default 3px outset
                    would put its sides off the screen. The ! is needed
                    because that rule is unlayered and beats any utility.
                  */}
                  <summary
                    className={`group/summary block cursor-pointer list-none focus-visible:-outline-offset-4! [&::-webkit-details-marker]:hidden ${
                      item.photo ? FOLLOW_CURSOR : ""
                    }`}
                  >
                    {/*
                      Open, the row gives up most of its bottom padding, so
                      the sentence reads on from the name instead of
                      starting a new block under it. A step, not an
                      animation — the row changes height once, as it opens.
                    */}
                    <span
                      className={`${ROW} grid-cols-[1.375rem_1fr_auto] py-6 group-open:pb-3 md:grid-cols-[1.375rem_1fr_auto_auto] md:py-8 md:group-open:pb-4`}
                    >
                      {/*
                        The brand flower in ink — the same shape the logo
                        draws, as the row's marker. Decorative; the name is
                        the entry. It turns a little under the pointer, about
                        the flower's own centre (126, 133.25 of its 250×241
                        box — see lib/flower) so it turns in place, as the
                        cue that the row opens. Not under reduced motion,
                        where it simply stays put.
                      */}
                      <span className={`col-start-1 row-start-1 ${FIRST_LINE}`}>
                        <Flower
                          size={22}
                          className="origin-[50.4%_55.3%] text-ink motion-safe:transition-[rotate] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/summary:rotate-45"
                        />
                      </span>

                      {/*
                        Weight 300: the hero's voice, not the section head's,
                        capped at 3.75rem instead of riding 5vw up to the
                        measure.

                        The breaking is set by hand. Japanese breaks between
                        any two characters by default, which at display size
                        puts the line end in the middle of a compound.
                        break-keep allows breaks only at spaces and at the
                        zero-width spaces written into the data; wrap-anywhere
                        is the safety net for a phrase wider than the column,
                        and it is also what keeps the name's min-content small
                        enough that the 1fr column cannot be pushed wider by
                        it. text-balance evens the lines out so a two-line
                        name does not end on a lone "2026".
                      */}
                      <span className="col-start-2 row-start-1 block text-balance break-keep wrap-anywhere text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1] md:pl-4 lg:pl-8">
                        {item.name}
                      </span>

                      {/*
                        Under the name on a phone, where there is no room
                        beside it; from md at the right, beside the plus.
                      */}
                      {item.date && (
                        <span className="col-start-2 row-start-2 mt-2 block md:col-start-3 md:row-start-1 md:mt-0 md:flex md:h-[calc(clamp(2.5rem,5vw,3.75rem)*1.05)] md:items-center">
                          <time
                            dateTime={item.date}
                            className="whitespace-nowrap text-[0.85rem] tabular-nums text-muted"
                          >
                            {formatNewsDate(item.date)}
                          </time>
                        </span>
                      )}

                      {/*
                        The same open/close mark as the FAQ, drawn larger for
                        a row at display size: two 1px rules, the height of
                        the register's own hairlines, crossed into a plus;
                        opening folds the upright one down onto the other, a
                        minus. rotate only. Decorative — the summary is
                        already announced as a button with its expanded
                        state.
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
                    What opening reveals. It fades in, and drops the last
                    8px into place where motion is welcome; the height is
                    never animated, the row is simply taller once open.

                    The fade is a transition from the closed values, with
                    @starting-style (starting:) holding the same values for
                    browsers that render closed <details> content as nothing
                    at all, where there is no closed style to transition
                    from. No script is involved, so it works without JS. If
                    none of it runs, the open state is still just the open
                    state: fully opaque, in place.
                  */}
                  <div
                    className={`${ROW} grid-cols-[1.375rem_1fr] pb-10 opacity-0 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:opacity-100 group-open:starting:opacity-0 motion-safe:-translate-y-2 motion-safe:group-open:translate-y-0 motion-safe:group-open:starting:-translate-y-2 motion-reduce:duration-200 md:grid-cols-[1.375rem_1fr_minmax(16rem,20rem)] md:pb-12`}
                  >
                    <p className="measure-jp col-start-2 row-start-1 text-[1.0625rem] text-muted md:pl-4 lg:pl-8">
                      {item.body}
                    </p>

                    {/*
                      A fixed 3:2 frame whatever the file is, so photos from
                      different phones still line up down the register;
                      object-cover takes the difference and `position` in the
                      data chooses which part survives.

                      bg-line is the empty frame while the file loads, so the
                      row keeps its shape. The edge is an outline pulled 1px
                      inside rather than a border or a ring: an outline paints
                      over the image and follows the radius, so a photo with a
                      pale sky still has an edge against the pale ground. It
                      is decorative — ink at 10% — and not a boundary anyone
                      has to find.

                      Lazy, as next/image is by default, and a closed row's
                      content is not rendered, so a photo is fetched when its
                      row is opened — or already sits in the cache, fetched
                      for the pointer preview at the same 20rem.

                      sizes: the column is at most 20rem from md; below that
                      the photo is capped at 28rem and otherwise runs the
                      width of the phone.
                    */}
                    {item.photo && (
                      <Image
                        src={item.photo.src}
                        width={item.photo.width}
                        height={item.photo.height}
                        alt={item.photo.alt}
                        sizes="(min-width: 768px) 20rem, (min-width: 480px) 28rem, 100vw"
                        className={`col-start-2 mt-6 aspect-[3/2] h-auto w-full max-w-md rounded-2xl bg-line object-cover outline-1 -outline-offset-1 outline-ink/10 md:col-start-3 md:row-start-1 md:mt-0 ${PHOTO_POSITION[item.photo.position ?? "center"]}`}
                      />
                    )}
                  </div>
                </details>
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
