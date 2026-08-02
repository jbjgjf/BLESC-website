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

      <Stagger className="grid gap-20 md:grid-cols-2 md:gap-16" stagger={0.12}>
        <RevealItem>
          <p className="flex items-baseline text-mark-1">
            <Counter
              to={37}
              className="text-[clamp(4rem,11vw,7.5rem)] font-medium leading-none tracking-[-0.045em] tabular-nums"
            />
            <span className="ml-1 text-[clamp(1.5rem,4vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-muted">
              / 38
            </span>
          </p>
          <p className="mt-7 text-[0.95rem] font-medium text-ink">
            精神的幸福度 38カ国中37位
          </p>
          <p className="mt-2 text-[0.9rem] text-muted">
            一方で、身体的健康は世界1位。
          </p>
        </RevealItem>

        <RevealItem>
          <p className="flex items-baseline text-mark-1">
            <Counter
              to={350000}
              className="text-[clamp(3rem,9vw,7.5rem)] font-medium leading-none tracking-[-0.045em] tabular-nums"
            />
            <span className="ml-1 text-[clamp(1.5rem,4vw,2.5rem)] font-normal leading-none tracking-[-0.03em] text-muted">
              +
            </span>
          </p>
          <p className="mt-7 text-[0.95rem] font-medium text-ink">
            不登校児童・生徒 35万人超
          </p>
          <p className="mt-2 text-[0.9rem] text-muted">増加中。</p>
        </RevealItem>
      </Stagger>
    </Section>
  );
}
