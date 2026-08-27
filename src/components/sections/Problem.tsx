import { GridField } from "@/components/GridField";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Lines, Section } from "@/components/ui";

/*
 * Tighter top than the standard section rhythm. The hero centres its copy in
 * a full-viewport box, which already leaves ~246px of air below the CTAs;
 * the default 144px on top of that put this heading 390px clear of them.
 * Tailwind sorts pt-* after py-*, so this wins over Section's own py.
 *
 * The escalation timeline that used to sit under the heading is gone. What
 * is left is the claim itself, centred and standing on the grid field —
 * which is the whole point of putting a field behind it.
 */
export function Problem() {
  return (
    <Section
      id="problem"
      className="relative overflow-hidden pt-12 md:pt-16"
      backdrop={<GridField />}
    >
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          {/*
            One line. The break that used to force 遅い。 onto its own row is
            gone; at this scale the sentence fits the measure on a wide
            screen and rewraps on its own below it.
          */}
          <h2 className="text-[clamp(1.9rem,5vw,3.4rem)] font-medium leading-[1.25] tracking-[-0.035em] text-ink">
            危機が起きてからでは、遅い。
          </h2>
        </Reveal>

        <Stagger className="mt-10 space-y-7 md:mt-12" stagger={0.12}>
          <RevealItem>
            <Lines className="measure-jp text-[clamp(1rem,1.6vw,1.15rem)] text-ink">
              {`生徒の不調に気づくのが「何かが起きた後」になってしまう。
Blescは、そのタイミングを根本から変えます。`}
            </Lines>
          </RevealItem>
          <RevealItem>
            <Lines className="measure-jp text-muted">
              {`毎日5分の日記に綴られた言葉から早期のサインをAIが捉え、
支援が必要な生徒を、孤立する前に可視化します。`}
            </Lines>
          </RevealItem>
        </Stagger>
      </div>
    </Section>
  );
}
