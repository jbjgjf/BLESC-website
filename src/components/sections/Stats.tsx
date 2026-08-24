import { Counter } from "@/components/Counter";
import { FlowerScatter } from "@/components/Flower";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

/**
 * NEW COPY: 数字が示す現実 is my wording, not from the brief. The section had
 * no heading of its own and read as two figures floating between sections.
 *
 * The two figures are deliberately not equals. Giving both the same column
 * made them read as a list of two; the ranking carries the chart and the
 * headcount sits under it as a supporting figure.
 */

const COUNTRIES = 38;
/** 37th of 38, so index 36. */
const JAPAN_INDEX = 36;

/**
 * One mark per country, Japan's standing tall and labelled.
 *
 * The figure drawn rather than decorated: nothing is invented, it is the
 * same 37/38 the copy states. Seeing 36 marks stacked ahead of the tall one
 * lands "second from last" in a way the numeral cannot, and the 1位 / 38位
 * ends of the axis say what the row of marks actually is.
 */
function RankScale() {
  return (
    <div>
      <div aria-hidden className="flex items-end gap-[2px] pt-9 md:gap-1">
        {Array.from({ length: COUNTRIES }, (_, i) => {
          const isJapan = i === JAPAN_INDEX;
          return (
            <span
              key={i}
              className={`relative flex-1 rounded-full ${
                isJapan
                  ? "h-16 bg-mark-1 md:h-20"
                  : "h-8 bg-line-strong/40 md:h-10"
              }`}
            >
              {/*
                Anchored to the bar itself rather than positioned by
                percentage, so the label can never drift off the mark it
                names. Right-aligned because Japan sits second from the end,
                which keeps the text inside the chart.
              */}
              {isJapan && (
                <span className="absolute bottom-full right-0 mb-2.5 whitespace-nowrap text-[0.85rem] font-medium text-mark-1 md:text-[0.95rem]">
                  日本 — 37位
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex items-baseline justify-between text-[0.78rem] tabular-nums text-muted">
        <span>1位</span>
        <span className="tracking-[0.04em]">先進38カ国</span>
        <span>38位</span>
      </div>
    </div>
  );
}

export function Stats() {
  return (
    <Section alt className="relative overflow-hidden">
      <FlowerScatter
        items={[
          { top: "12%", right: "3%", size: 58, rotate: -14, opacity: 0.46, className: "hidden text-mark-3 lg:block" },
          { top: "72%", right: "9%", size: 36, rotate: 26, opacity: 0.4, className: "hidden text-mark-1 lg:block" },
        ]}
      />

      <Reveal>
        <SectionTitle accent="bg-mark-1">数字が示す現実</SectionTitle>
      </Reveal>

      <Stagger stagger={0.12}>
        <RevealItem>
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-mark-1">
            精神的幸福度
          </p>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="flex items-baseline text-mark-1">
              <Counter
                to={37}
                className="text-[clamp(4.5rem,13vw,9rem)] font-medium leading-none tracking-[-0.045em] tabular-nums"
              />
              <span className="text-[clamp(1.75rem,4.5vw,3rem)] font-normal leading-none tracking-[-0.03em]">
                位
              </span>
              <span className="ml-2 text-[clamp(1.75rem,4.5vw,3rem)] font-normal leading-none tracking-[-0.03em] text-muted">
                / 38
              </span>
            </p>
            <p className="measure-jp max-w-sm text-[0.95rem] text-muted">
              先進38カ国の子どもの精神的幸福度で、日本は37位。
              <span className="text-ink">一方、身体的健康は世界1位です。</span>
            </p>
          </div>

          <div className="mt-10 md:mt-12">
            <RankScale />
          </div>
        </RevealItem>

        {/*
          The second figure, deliberately smaller. The dot grid that used to
          sit here counted to 35 without making 35 mean anything.
        */}
        <RevealItem>
          <div className="mt-20 flex flex-col gap-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10 md:mt-24">
            <div>
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-mark-1">
                不登校児童・生徒
              </p>
              <p className="mt-4 flex items-baseline text-mark-1">
                <Counter
                  to={350000}
                  className="text-[clamp(2.5rem,7vw,4.5rem)] font-medium leading-none tracking-[-0.045em] tabular-nums"
                />
                <span className="text-[clamp(1.1rem,2.6vw,1.75rem)] font-normal leading-none tracking-[-0.03em]">
                  人
                </span>
                <span className="text-[clamp(1.1rem,2.6vw,1.75rem)] font-normal leading-none tracking-[-0.03em] text-muted">
                  +
                </span>
              </p>
            </div>

            <div className="max-w-md sm:text-right">
              <p className="text-[0.95rem] font-medium text-ink">
                35万人を超え、増加が続いています。
              </p>
              <p className="measure-jp mt-2 text-[0.9rem] text-muted">
                そのすべてに、気づかれなかった時間がありました。
              </p>
            </div>
          </div>
        </RevealItem>
      </Stagger>
    </Section>
  );
}
