import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Flower } from "@/components/Flower";
import { SectionTitle, Icon, Section } from "@/components/ui";

/**
 * Real entries. The invented placeholder list that used to sit here — the
 * Kyoto University study, the Hatapro tie-up, the pilot schools, the
 * conference — has been removed rather than kept alongside, because a press
 * list that mixes the two is worse than one that is short.
 *
 * `date` is optional and both entries are currently without one: the events
 * happened, but inventing a date for something the company actually did is
 * the same failure as inventing the entry. Fill them in and they render.
 *
 * `href` is intentionally absent too: there are no article pages yet, and a
 * headline that looks clickable but goes nowhere is worse than one that
 * plainly doesn't. Add the field and the entry becomes a link.
 */
type NewsItem = {
  date?: string;
  category: string;
  title: string;
  href?: string;
};

const ITEMS: NewsItem[] = [
  {
    category: "登壇",
    title: "「SusHi Tech Tokyo」に登壇し、Blescの取り組みについて発表しました。",
  },
  {
    category: "受賞",
    title: "「IVS」YOUTH部門において、優秀賞を受賞しました。",
  },
];

/** Category tints, cycled so the list carries colour rather than grey rows. */
const MARKS = ["text-mark-1", "text-mark-2", "text-mark-3"] as const;

export function News() {
  return (
    <Section id="news">
      <Reveal>
        <SectionTitle accent="bg-mark-3">ニュース</SectionTitle>
      </Reveal>

      <Reveal className="max-w-3xl">
        <p className="flex items-center gap-3 text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.4] tracking-[-0.02em] text-ink">
          Blescの最新の動き。
          <Flower size={34} rotate={14} opacity={0.9} className="shrink-0 text-mark-3" />
        </p>
      </Reveal>

      <Stagger className="mt-10" stagger={0.09}>
        {ITEMS.map((item, i) => {
          const mark = MARKS[i % MARKS.length];

          const body = (
            <div className="flex flex-col gap-2 border-t border-line py-6 md:flex-row md:items-baseline md:gap-8 md:py-7">
              <div className="flex shrink-0 items-center gap-4">
                {item.date && (
                  <time className="text-[0.85rem] tabular-nums text-muted">
                    {item.date}
                  </time>
                )}
                <span
                  className={`text-[0.75rem] font-medium tracking-[0.08em] ${mark}`}
                >
                  {item.category}
                </span>
              </div>

              <p className="text-[1rem] leading-relaxed text-ink md:text-[1.05rem]">
                {item.title}
              </p>

              {item.href && (
                <Icon
                  name="arrow_outward"
                  size={18}
                  className="ml-auto hidden shrink-0 text-muted md:block"
                />
              )}
            </div>
          );

          return (
            <RevealItem key={item.title}>
              {item.href ? (
                <a
                  href={item.href}
                  className="group block transition-opacity duration-300 hover:opacity-80"
                >
                  {body}
                </a>
              ) : (
                body
              )}
            </RevealItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
