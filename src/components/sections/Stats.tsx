import { Counter } from "@/components/Counter";
import { FlowerScatter } from "@/components/Flower";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

/**
 * Numbers are the visual here — no icons, no chrome.
 *
 * NEW COPY: 数字が示す現実 is my wording, not from the brief. The section had
 * no heading of its own and read as two figures floating between sections.
 */

/**
 * 38 marks, one per country, with Japan's 37th highlighted.
 *
 * This is the figure drawn rather than decorated: nothing here is invented,
 * it is the same 37/38 the label states. Seeing 36 marks stack up ahead of
 * the highlighted one lands "second from last" in a way the numeral cannot.
 */
function RankScale() {
  return (
    <div aria-hidden className="flex items-end gap-[3px]">
      {Array.from({ length: 38 }, (_, i) => {
        const isJapan = i === 36;
        return (
          <span
            key={i}
            className={`w-[3px] rounded-full ${
              isJapan ? "h-9 bg-mark-1" : "h-5 bg-line-strong opacity-50"
            }`}
          />
        );
      })}
    </div>
  );
}

/**
 * 35 dots at 10,000 students each. Again the same number, drawn — the
 * caption states the unit so the count is checkable rather than decorative.
 */
function VolumeScale() {
  return (
    <div>
      <div aria-hidden className="flex max-w-[19rem] flex-wrap gap-1.5">
        {Array.from({ length: 35 }, (_, i) => (
          <span key={i} className="size-2.5 rounded-full bg-mark-1 opacity-80" />
        ))}
      </div>
      <p className="mt-3 text-[0.72rem] tabular-nums text-muted">● = 1万人</p>
    </div>
  );
}

export function Stats() {
  return (
    <Section alt className="relative overflow-hidden">
      <FlowerScatter
        items={[
          { top: "16%", right: "3%", size: 58, rotate: -14, opacity: 0.46, className: "hidden text-mark-3 lg:block" },
          { top: "66%", right: "11%", size: 36, rotate: 26, opacity: 0.4, className: "hidden text-mark-1 lg:block" },
        ]}
      />

      <Reveal>
        <SectionTitle accent="bg-mark-1">数字が示す現実</SectionTitle>
      </Reveal>

      <Stagger className="grid gap-16 md:grid-cols-2 md:gap-12" stagger={0.12}>
        <RevealItem>
          {/* A rule per figure: the eyebrow names what the number measures. */}
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-mark-1">
            精神的幸福度
          </p>

          <p className="mt-5 flex items-baseline text-mark-1">
            <Counter
              to={37}
              className="text-[clamp(4rem,11vw,7.5rem)] font-medium leading-none tracking-[-0.045em] tabular-nums"
            />
            <span className="text-[clamp(1.5rem,4vw,2.5rem)] font-normal leading-none tracking-[-0.03em]">
              位
            </span>
            <span className="ml-2 text-[clamp(1.5rem,4vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-muted">
              / 38
            </span>
          </p>

          <div className="mt-8">
            <RankScale />
          </div>

          <p className="mt-6 text-[0.95rem] font-medium text-ink">
            先進38カ国中37位。
          </p>
          <p className="measure-jp mt-2 text-[0.9rem] text-muted">
            一方で、身体的健康は世界1位。心だけが、置き去りにされています。
          </p>
        </RevealItem>

        <RevealItem>
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-mark-1">
            不登校児童・生徒
          </p>

          <p className="mt-5 flex items-baseline text-mark-1">
            <Counter
              to={350000}
              className="text-[clamp(3rem,9vw,7.5rem)] font-medium leading-none tracking-[-0.045em] tabular-nums"
            />
            <span className="text-[clamp(1.5rem,4vw,2.5rem)] font-normal leading-none tracking-[-0.03em]">
              人
            </span>
            <span className="text-[clamp(1.5rem,4vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-muted">
              +
            </span>
          </p>

          <div className="mt-8">
            <VolumeScale />
          </div>

          <p className="mt-6 text-[0.95rem] font-medium text-ink">
            35万人を超え、増加が続いています。
          </p>
          <p className="measure-jp mt-2 text-[0.9rem] text-muted">
            そのすべてに、気づかれなかった時間がありました。
          </p>
        </RevealItem>
      </Stagger>
    </Section>
  );
}
