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

export function News() {
  return (
    <Section id="news">
      <Reveal>
        <SectionTitle>ニュース</SectionTitle>
      </Reveal>

      {/*
        A hairline between the entries and nothing above the first: two items
        boxed as cards read as a grid of chrome, where two names with air
        around them read as news.
      */}
      <Stagger stagger={0.06}>
        {ITEMS.map((item, i) => (
          <RevealItem
            key={item.name}
            /*
             * The rule goes between the entries, never above the first — the
             * air under the heading is the boundary there. Written as a
             * literal class per branch because Tailwind scans source text and
             * would never generate an interpolated one.
             */
            className={
              i === 0
                ? "pb-8 md:pb-10"
                : "border-t border-line py-8 md:py-10"
            }
          >
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
              The proper noun is the entry. It is set in the sans at section
              scale and the sentence continues beneath it at reading size, so
              the particle that follows the name still reads as one sentence.
            */}
            <p className="mt-4 text-[clamp(1.75rem,4.4vw,2.75rem)] font-medium leading-[1.15] tracking-[-0.03em] text-ink">
              {item.name}
            </p>
            <p className="measure-jp mt-2 max-w-2xl text-[1.0625rem] text-muted">
              {item.body}
            </p>
          </RevealItem>
        ))}
      </Stagger>
    </Section>
  );
}
