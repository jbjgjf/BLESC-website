import { Counter } from "@/components/Counter";
import { FlowerScatter } from "@/components/Flower";
import { SlideIn } from "@/components/Reveal";
import { RankTable, StudentPictogram } from "@/components/StatFigures";
import { Section } from "@/components/ui";

/**
 * NEW COPY: 数字が示す現実 is my wording, not from the brief. The section had
 * no heading of its own and read as two figures floating between sections.
 *
 * The two figures are deliberately not equals. Giving both the same column
 * made them read as a list of two; the ranking carries the chart and the
 * headcount sits under it as a supporting figure.
 */

export function Stats() {
  return (
    <Section alt className="relative overflow-hidden">
      <FlowerScatter
        items={[
          { top: "12%", right: "3%", size: 58, rotate: -14, opacity: 0.46, className: "hidden text-mark-3 lg:block" },
          { top: "72%", right: "9%", size: 36, rotate: 26, opacity: 0.4, className: "hidden text-mark-1 lg:block" },
        ]}
      />

      <div>
        {/* Figure left, evidence right. */}
        <SlideIn from="left">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-mark-1">
                精神的幸福度
              </p>

              <p className="mt-5 flex items-baseline text-mark-1">
                <Counter
                  to={37}
                  className="text-[clamp(5rem,15vw,11rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums"
                />
                <span className="text-[clamp(1.75rem,4.5vw,3rem)] font-normal leading-none tracking-[-0.03em]">
                  位
                </span>
                <span className="ml-2 text-[clamp(1.75rem,4.5vw,3rem)] font-normal leading-none tracking-[-0.03em] text-muted">
                  / 38
                </span>
              </p>

              <p className="measure-jp mt-6 max-w-sm text-[0.95rem] text-muted">
                先進38カ国の子どもの精神的幸福度で、日本は37位。
                <span className="text-ink">一方、身体的健康は世界1位です。</span>
              </p>
            </div>

            <RankTable />
          </div>
        </SlideIn>

        {/*
          The crowd is the ground here, not a chart beside one: blurred and
          held back, with the figure standing on it. A drop shadow is what
          keeps the numeral legible over the busiest part of the pattern.
        */}
        <SlideIn from="right">
          <div className="relative mt-24 flex min-h-[16rem] items-center justify-center overflow-hidden rounded-3xl px-6 py-12 md:mt-28 md:min-h-[20rem]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.28] blur-[3px]"
            >
              <StudentPictogram />
            </div>

            <div className="relative text-center">
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-mark-3">
                不登校児童・生徒
              </p>
              <p
                className="mt-3 flex items-baseline justify-center text-mark-3"
                style={{ filter: "drop-shadow(0 2px 20px var(--color-bg-alt)) drop-shadow(0 0 8px var(--color-bg-alt))" }}
              >
                <Counter
                  to={350000}
                  className="text-[clamp(3.25rem,11vw,8rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums"
                />
                <span className="text-[clamp(1.5rem,3.6vw,2.5rem)] font-normal leading-none tracking-[-0.03em]">
                  人
                </span>
                <span className="text-[clamp(1.5rem,3.6vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-muted">
                  +
                </span>
              </p>
              <p className="measure-jp mx-auto mt-5 max-w-md text-[0.95rem] text-muted">
                <span className="text-ink">35万人を超え、増加が続いています。</span>
                そのすべてに、気づかれなかった時間がありました。
              </p>
            </div>
          </div>
        </SlideIn>
      </div>
    </Section>
  );
}
