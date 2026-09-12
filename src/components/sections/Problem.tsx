import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Section } from "@/components/ui";

/*
 * The claim and its evidence, in one block.
 *
 * This used to be two sections: the sentence on its own over a graph-paper
 * field, then a separate 数字 section holding two statistics. The statistics
 * are the argument for the sentence, so they now sit in a single panel
 * directly under it and the second section is gone.
 *
 * The grid field went with it. It was a blue-tinted orb behind graph paper,
 * which is legible on the near-black build and fights a white ground — and
 * on white the only colour the page wants is the hero sky and the product
 * UI. The panel is the visual here; it does not need a backdrop as well.
 *
 * Tighter top than the standard section rhythm: the hero centres its copy in
 * a full-viewport box and already leaves a lot of air below the CTAs, so the
 * default 144px on top of that put this heading far clear of them. Tailwind
 * sorts pt-* after py-*, so this wins over Section's own py.
 */
export function Problem() {
  return (
    <Section id="problem" className="pt-12 md:pt-16">
      <Stagger className="mx-auto max-w-3xl text-center" stagger={0.06}>
        <RevealItem>
          <h2 className="type-head text-ink">危機が起きてからでは、遅い。</h2>
        </RevealItem>

        {/*
          One line, and it is the claim. What followed it — Blescは、その
          タイミングを根本から変えます。 — was cut at the company's direction:
          the panel below and 仕組み both make that case, and two adjacent
          sentences opening Blescは… read as a repeat.
        */}
        <RevealItem className="mt-6">
          <p className="measure-jp mx-auto max-w-xl text-[1.0625rem] text-muted">
            生徒の不調に気づくのが「何かが起きた後」になってしまう。
          </p>
        </RevealItem>
      </Stagger>

      <Reveal className="mt-14 md:mt-16">
        <EvidencePanel />
      </Reveal>
    </Section>
  );
}
