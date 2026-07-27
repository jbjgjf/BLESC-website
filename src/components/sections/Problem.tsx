import { Reveal, Stagger, RevealItem } from "@/components/Reveal";
import { Lines, Section } from "@/components/ui";

export function Problem() {
  return (
    <Section id="problem">
      <Reveal className="max-w-3xl">
        <h2 className="text-[clamp(1.875rem,4.4vw,3rem)] font-medium leading-[1.35] tracking-[-0.02em] text-ink">
          危機が起きてからでは、遅い。
        </h2>
      </Reveal>

      <Stagger className="mt-14 max-w-2xl space-y-8" stagger={0.12}>
        <RevealItem>
          <Lines className="measure-jp text-ink">
            {`生徒の不調に気づくのが「何かが起きた後」になってしまう。
Blescは、そのタイミングを根本から変えます。`}
          </Lines>
        </RevealItem>
        <RevealItem>
          <Lines className="measure-jp text-muted">
            {`日常の会話に現れる早期のサインをAIが捉え、
支援が必要な生徒を、孤立する前に可視化します。`}
          </Lines>
        </RevealItem>
      </Stagger>
    </Section>
  );
}
