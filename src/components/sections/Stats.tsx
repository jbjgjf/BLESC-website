import { Counter } from "@/components/Counter";
import { RevealItem, Stagger } from "@/components/Reveal";
import { Section } from "@/components/ui";

/** Numbers are the visual here — no icons, no chrome. */
export function Stats() {
  return (
    <Section alt>
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
          <p className="flex items-baseline text-mark-2">
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
