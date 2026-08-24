import { Counter } from "@/components/Counter";
import { FlowerScatter } from "@/components/Flower";
import { Reveal, SlideIn } from "@/components/Reveal";
import { RankTable, StudentPictogram } from "@/components/StatFigures";
import { Section, SectionTitle } from "@/components/ui";

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

      <Reveal>
        <SectionTitle accent="bg-mark-1">数字が示す現実</SectionTitle>
      </Reveal>

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
                  className="text-[clamp(4.5rem,13vw,9rem)] font-medium leading-none tracking-[-0.045em] tabular-nums"
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

        {/* Mirrored: the picture takes the left, the figure the right. */}
        <SlideIn from="right">
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:mt-28">
            <StudentPictogram />

            <div className="md:text-right">
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-mark-3">
                不登校児童・生徒
              </p>

              <p className="mt-5 flex items-baseline text-mark-3 md:justify-end">
                <Counter
                  to={350000}
                  className="text-[clamp(3rem,9vw,6.5rem)] font-medium leading-none tracking-[-0.045em] tabular-nums"
                />
                <span className="text-[clamp(1.35rem,3.2vw,2.25rem)] font-normal leading-none tracking-[-0.03em]">
                  人
                </span>
                <span className="text-[clamp(1.35rem,3.2vw,2.25rem)] font-normal leading-none tracking-[-0.03em] text-muted">
                  +
                </span>
              </p>

              <p className="measure-jp mt-6 text-[0.95rem] text-muted md:ml-auto md:max-w-sm">
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
