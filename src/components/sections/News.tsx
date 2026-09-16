import { DrawnRule } from "@/components/DrawnRule";
import { RevealItem, Reveal, Stagger } from "@/components/Reveal";
import { Container, SectionTitle } from "@/components/ui";

/**
 * Real entries only. The invented placeholder list that used to sit here —
 * the Kyoto University study, the Hatapro tie-up, the pilot schools, the
 * conference — was removed rather than kept alongside, because a press list
 * that mixes the two is worse than one that is short.
 *
 * `name` is split out of the sentence so the proper noun can be set at
 * display size: read `name` and `body` together and they are the entry
 * exactly as the company wrote it, minus the 「」 that the large type now
 * does the work of.
 *
 * `date` is optional and both entries are currently without one: the events
 * happened, but inventing a date for something the company actually did is
 * the same failure as inventing the entry. Fill them in and they render.
 *
 * There is no `href` field at all. There are no article pages, and a
 * headline styled to look clickable that goes nowhere is worse than one that
 * plainly doesn't — so nothing here carries a link affordance, a hover state
 * or an arrow.
 */
type NewsItem = {
  date?: string;
  category: string;
  name: string;
  body: string;
};

const ITEMS: NewsItem[] = [
  {
    category: "登壇",
    name: "SusHi Tech Tokyo",
    body: "に登壇し、Blescの取り組みについて発表しました。",
  },
  {
    category: "受賞",
    name: "IVS",
    body: "YOUTH部門において、優秀賞を受賞しました。",
  },
];

/**
 * Two entries as a ledger.
 *
 * The pair used to sit side by side, so that neither half of the measure was
 * left empty beside an eleven-character sentence. The ledger answers the same
 * problem from the other direction: each entry is a full-width row whose
 * rules run edge to edge of the viewport — wider than the page measure — so a
 * row reads as a line in a register rather than as a block waiting for a
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
 * bg-canvas-alt — #f5f7fa on the white build, #121417 on the dark — which is
 * the second surface the palette has always had and the page has never used
 * as a ground. It is a change of light rather than a band: a 6rem fade from
 * the canvas colour at the top and another at the bottom, so there is no
 * edge to the section, only a slightly different air. The fades sit at -z-10
 * inside the section's own stacking context (isolate), which puts them
 * above the section's fill and under everything in flow — the title cannot
 * be tinted by them, with or without JS. Both are aria-hidden and take no
 * pointer.
 *
 * Every pair was measured on the alt ground. Secondary copy 5.83:1 light and
 * 11.38:1 dark; the mark-1 stamp 5.07:1 and 9.45:1; ink 18.11:1 and 18.45:1.
 * The rules were the one thing that slipped: line-strong is 3.46:1 on the
 * light alt ground but 2.95:1 on the dark one, under the 3:1 a structural
 * line needs. The fix is theme-neutral — a flat layer of the text colour at
 * 4% laid over the rule's own fill, which pulls a light rule darker and a
 * dark rule lighter — and it returns the rules to the weight they have on
 * the plain canvas: 3.70:1 light and 3.25:1 dark against 3.72:1 and 3.15:1
 * there. It is a background-image, so it composes with DrawnRule's
 * background-color rather than fighting it for the same property.
 *
 * From md each row is three columns — the category stamp turned on its side,
 * the proper noun at display size, and the sentence. The sentence sits last
 * because it is where the eye lands after the name: に登壇し opens with a
 * particle that continues the name, so name → sentence has to run left to
 * right. Below md the three stack in the same reading order.
 */
const LEDGER_RULE =
  "bg-[linear-gradient(color-mix(in_srgb,var(--color-text)_4%,transparent),color-mix(in_srgb,var(--color-text)_4%,transparent))]";

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

        <Stagger as="ol" stagger={0.1}>
          {ITEMS.map((item) => (
            <RevealItem as="li" key={item.name} className="relative">
              {/*
                The sentence column is minmax rather than a fraction so that
                the name, not the sentence, absorbs whatever width the
                viewport adds: the sentence is two lines of reading-size
                Japanese at any width in that range, and the name is the
                thing that wants the room.
              */}
              <Container className="grid gap-y-5 py-10 md:grid-cols-[auto_1fr_minmax(16rem,20rem)] md:gap-x-10 md:py-14 lg:gap-x-14">
                {/*
                  The only colour in the section. Turned on its side from md
                  because a two-character category set horizontally beside a
                  sixty-pixel name reads as a stray word; upright in the
                  margin it reads as a stamp. The border takes the same hue
                  at 35% so the stamp does not outweigh the text it frames.
                */}
                <span className="inline-flex w-fit items-center justify-center self-start rounded-md border border-mark-1/35 px-2.5 py-1 text-[0.8rem] font-medium tracking-[0.18em] text-mark-1 md:px-1.5 md:py-3 md:[writing-mode:vertical-rl]">
                  {item.category}
                </span>

                {/*
                  Weight 300: the hero's voice, not the section head's. The
                  size is capped at 3.75rem instead of riding 5vw up to the
                  measure because past that "SusHi Tech Tokyo" stops holding
                  one line — the name has about 540px at the full measure
                  beside a 20rem sentence column, and at 64px it wants
                  500–530px depending on whether Helvetica Neue or Inter is
                  serving the Latin. At 60px it fits either way with room to
                  spare; at 768px it takes two lines, which is fine.
                */}
                <p className="font-light text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1]">
                  {item.name}
                </p>

                {/*
                  pt-1 at md puts the first line's ink within a couple of
                  pixels of the name's cap height whether or not a date sits
                  above it. At 60px/1.05 the name's cap top is about 11px
                  below the row; a kanji at 17px/1.9 starts about 8.5px below
                  its own line box, and a tabular digit at 0.85rem about 6px,
                  so 4px is the one value that lands both within reach.
                */}
                <div className="md:pt-1">
                  {item.date && (
                    <time className="mb-1 block text-[0.85rem] tabular-nums text-muted">
                      {item.date}
                    </time>
                  )}
                  <p className="measure-jp text-[1.0625rem] text-muted">
                    {item.body}
                  </p>
                </div>
              </Container>

              <DrawnRule className={`bottom-0 ${LEDGER_RULE}`} />
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
