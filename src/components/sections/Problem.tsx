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
 * UI. What sits behind the panel now is not a field: a pool of the logo's
 * own blue at 10%, fading to nothing before it reaches the section's edges,
 * so the panel reads as resting in a little light rather than on a plain
 * sheet. The panel is bg-surface, so nothing inside it changes; the only
 * copy that can fall over the pool is the sentence above it, and secondary
 * text over the pool's deepest point still holds 5.88:1 on the light build
 * and 10.47:1 on the dark one.
 *
 * The ellipse is sized to end inside the box. A gradient is clipped at its
 * element's edge, so an ellipse larger than the section would not spill —
 * it would stop, and leave a hard line of faint blue along the bottom
 * where the next section's white begins. Vertical radius 40% about a
 * centre at 62% puts the far edge exactly at the section's bottom, and the
 * horizontal radius clears the sides by enough that what is left there is
 * under one level of eight bits.
 *
 * Tighter top than the standard section rhythm: the hero centres its copy in
 * a full-viewport box and already leaves a lot of air below the CTAs, so the
 * default 144px on top of that put this heading far clear of them. Tailwind
 * sorts pt-* after py-*, so this wins over Section's own py.
 *
 * overflow-x-clip, never overflow-hidden: nothing here needs to escape, but
 * hidden would make the section a scroll container and trap anything that
 * later did. relative is what the absolutely positioned backdrop measures
 * against.
 */
export function Problem() {
  return (
    <Section
      id="problem"
      className="relative overflow-x-clip pt-12 md:pt-16"
      backdrop={
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_40%_at_50%_62%,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_100%)]"
        />
      }
    >
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
