import { RevealItem, Reveal, Stagger } from "@/components/Reveal";
import { SectionTitle, Section } from "@/components/ui";

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
 * The hairline between the two entries at desktop.
 *
 * A gradient rather than a border: a rule that starts and stops short of the
 * column's own ends reads as placed, where a hard edge-to-edge border reads
 * as a table someone forgot to finish. It is painted, not bordered, so it can
 * fade — and it is the only rule in the section, which is why it can afford
 * the detail.
 */
const DIVIDER =
  "bg-[linear-gradient(to_bottom,transparent_0%,var(--color-border)_14%,var(--color-border)_86%,transparent_100%)]";

/**
 * Two entries, side by side.
 *
 * The list will be two items long for a while, and the shape has to suit
 * that: stacked full-width rows left two thirds of the measure empty beside
 * a sentence that is eleven characters long, which read as a section waiting
 * for content. A pair across the measure uses the two-ness — neither half is
 * left hanging, and the block is half as tall.
 *
 * A third entry would wrap into a second row, which is fine but wants its
 * own look at the rules; the classes below are written for the pair that
 * exists rather than for a grid that has to survive every count.
 */
export function News() {
  return (
    <Section id="news">
      <Reveal>
        <SectionTitle>ニュース</SectionTitle>
      </Reveal>

      <Stagger className="grid md:grid-cols-2" stagger={0.06}>
        {ITEMS.map((item, i) => (
          <RevealItem
            key={item.name}
            /*
             * Stacked, the second entry takes a plain top rule and the first
             * takes none — the air under the heading is the boundary there.
             * Side by side, that rule becomes the gradient divider below and
             * the padding opens up around it. Written as a literal class per
             * branch because Tailwind scans source text and would never
             * generate an interpolated one.
             */
            className={
              i === 0
                ? "md:pr-10 lg:pr-14"
                : "relative border-t border-line pt-8 md:border-t-0 md:pl-10 md:pt-0 lg:pl-14"
            }
          >
            {i === 1 && (
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 hidden w-px md:block ${DIVIDER}`}
              />
            )}

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center rounded-full border border-line px-3 py-1 text-[0.8rem] text-muted">
                {item.category}
              </span>
              {item.date && (
                <time className="text-[0.85rem] tabular-nums text-muted">
                  {item.date}
                </time>
              )}
            </div>

            {/*
              The proper noun is the entry. It is set in the sans at display
              scale and the sentence continues beneath it at reading size, so
              the particle that follows the name still reads as one sentence.
              A step down from the old full-measure size, because the name now
              has half the measure to sit in.
            */}
            <p className="mt-5 text-[clamp(1.6rem,3.4vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.03em] text-ink">
              {item.name}
            </p>
            <p className="measure-jp mt-2 text-[1.0625rem] text-muted">
              {item.body}
            </p>
          </RevealItem>
        ))}
      </Stagger>
    </Section>
  );
}
