import { HowSteps } from "@/components/HowSteps";
import { Reveal } from "@/components/Reveal";
import { Container, Eyebrow } from "@/components/ui";

/**
 * The five stages of a check-in, advanced by scroll. The section's paragraph
 * lives inside <HowSteps>, one sentence per stage.
 */
export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 bg-canvas-alt pb-24 md:pb-36">
      <Container className="pt-24 md:pt-36">
        <Reveal>
          <Eyebrow>仕組み</Eyebrow>
        </Reveal>
      </Container>

      <HowSteps />
    </section>
  );
}
