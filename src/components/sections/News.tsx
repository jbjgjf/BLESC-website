import Image from "next/image";
import { DrawnRule } from "@/components/DrawnRule";
import { Flower } from "@/components/Flower";
import { RevealItem, Reveal, Stagger } from "@/components/Reveal";
import { Container, SectionTitle } from "@/components/ui";
import { NEWS, formatNewsDate, type NewsPhoto } from "@/lib/news";

/**
 * A dated register.
 *
 * The entries, their order and the date display live in lib/news.ts; this
 * file is only the layout. Each entry is a full-width row whose rules run
 * edge to edge of the viewport — wider than the page measure — so a row
 * reads as a line in a register rather than as a block waiting for a
 * neighbour. Inside the rules the content keeps to the ordinary 68rem
 * Container, which is what ties the rows back to the rest of the page.
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
 * Every pair was measured on the alt ground: ink 18.11:1, the muted sentence
 * and date 5.83:1 (6.25:1 where the top fade is still white). The rules are
 * the one thing the alt ground weakens — bare line-strong is 3.46:1 there
 * against 3.72:1 on the white canvas. It still clears the 3:1 a structural
 * line needs, but the register would read a shade fainter than every other
 * rule on the page, so a flat layer of the text colour at 4% is laid over
 * the rule's own fill: 3.70:1, the same weight the rules have elsewhere. It
 * is a background-image, so it composes with DrawnRule's background-color
 * rather than fighting it for the same property.
 *
 * From md each row is three columns — the brand flower as the row's marker,
 * the proper noun at display size, and the date over the sentence, with the
 * photo under them when there is one. The sentence sits last because it is
 * where the eye lands after the name: several open with a particle that
 * continues the name (に登壇し, で、), so name → sentence has to run left to
 * right. Below md the three stack in the same reading order.
 *
 * The photo belongs to the sentence column, not a column of its own. A
 * fourth column would be an empty cell in every row without a photo, and a
 * register where some rows look unfinished is worse than one without
 * pictures; under the sentence, a row without one simply ends sooner.
 */
const LEDGER_RULE =
  "bg-[linear-gradient(color-mix(in_srgb,var(--color-text)_4%,transparent),color-mix(in_srgb,var(--color-text)_4%,transparent))]";

/** Literal classes for the crop — Tailwind cannot see an interpolated one. */
const PHOTO_POSITION: Record<NonNullable<NewsPhoto["position"]>, string> = {
  top: "object-top",
  center: "object-center",
  bottom: "object-bottom",
};

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
      */}
      <div className="relative">
        <DrawnRule className={`top-0 ${LEDGER_RULE}`} delay={0.1} />

        {/*
          A plain list, and each row triggers its own reveal.

          The list used to be one Stagger — a single whileInView on the whole
          <ol>, at 20% visibility. That is fine for two rows and broken for a
          register that grows: an element more than five viewports tall can
          never be 20% visible, so it never reveals. Six rows, four of them
          with photos, pass that on a landscape phone, and 活動様子 will add
          more.
          The stagger now runs inside each row instead — marker, name, then
          sentence — and every row starts when it arrives, however long the
          list gets.

          role="list" for the same reason Stagger sets it: the preflight
          removes list markers, and WebKit then stops announcing an unmarked
          list as one.
        */}
        <ol role="list">
          {NEWS.map((item) => (
            <li key={`${item.date ?? "undated"}-${item.name}`} className="relative">
              <Container className="py-10 md:py-14">
                {/*
                  The sentence column is minmax rather than a fraction so that
                  the name, not the sentence, absorbs whatever width the
                  viewport adds: the sentence reads at the same measure at
                  any width in that range, and the name is the thing that
                  wants the room.
                */}
                <Stagger
                  stagger={0.08}
                  className="grid gap-y-5 md:grid-cols-[auto_1fr_minmax(16rem,20rem)] md:gap-x-10 lg:gap-x-14"
                >
                  {/*
                    The brand flower in ink — the same shape the logo draws,
                    set as the row's marker in the text colour. Decorative;
                    the name and the sentence beside it are the entry. There
                    is no category label: the sentence already says what
                    happened.
                  */}
                  <RevealItem className="mt-0.5 self-start md:mt-3">
                    <Flower size={22} className="text-ink" />
                  </RevealItem>

                  {/*
                    Weight 300: the hero's voice, not the section head's. The
                    size is capped at 3.75rem instead of riding 5vw up to the
                    measure: at that size "SusHi Tech Tokyo" still holds one
                    line beside the 20rem sentence column, and the longer
                    names take two or three lines rather than four.

                    Those longer names are why the breaking is set by hand.
                    Japanese breaks between any two characters by default,
                    which at display size puts the line end in the middle of
                    ビジネスプランコンテスト. break-keep allows breaks only at
                    spaces and at the zero-width spaces written into the data;
                    wrap-anywhere is the safety net for a phrase wider than
                    the column, and it is also what keeps the name's
                    min-content small enough that the 1fr column cannot be
                    pushed wider by it. text-balance evens the lines out so a
                    two-line name does not end on a lone "2026".
                  */}
                  <RevealItem>
                    <p className="text-balance break-keep wrap-anywhere font-light text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1]">
                      {item.name}
                    </p>
                  </RevealItem>

                  {/*
                    pt-1 at md puts the first line's ink within a couple of
                    pixels of the name's cap height whether or not a date sits
                    above it. At 60px/1.05 the name's cap top is about 11px
                    below the row; a kanji at 17px/1.9 starts about 8.5px below
                    its own line box, and a tabular digit at 0.85rem about 6px,
                    so 4px is the one value that lands both within reach.
                  */}
                  <RevealItem className="md:pt-1">
                    {item.date && (
                      <time
                        dateTime={item.date}
                        className="mb-1 block text-[0.85rem] tabular-nums text-muted"
                      >
                        {formatNewsDate(item.date)}
                      </time>
                    )}
                    <p className="measure-jp text-[1.0625rem] text-muted">
                      {item.body}
                    </p>

                    {/*
                      A fixed 3:2 frame whatever the file is, so photos from
                      different phones still line up down the register;
                      object-cover takes the difference and `position` in the
                      data chooses which part survives. It arrives with the
                      sentence rather than on its own beat — it is evidence
                      for the sentence, not a second thing to look at.

                      bg-line is the empty frame while the file loads, so the
                      row keeps its shape. The edge is an outline pulled 1px
                      inside rather than a border or a ring: an outline paints
                      over the image and follows the radius, so a photo with a
                      pale sky still has an edge against the pale ground. It
                      is decorative — ink at 10% — and not a boundary anyone
                      has to find.

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
                        className={`mt-6 aspect-[3/2] h-auto w-full max-w-md rounded-2xl bg-line object-cover outline-1 -outline-offset-1 outline-ink/10 ${PHOTO_POSITION[item.photo.position ?? "center"]}`}
                      />
                    )}
                  </RevealItem>
                </Stagger>
              </Container>

              <DrawnRule className={`bottom-0 ${LEDGER_RULE}`} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
