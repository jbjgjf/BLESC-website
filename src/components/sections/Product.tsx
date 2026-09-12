import { Caption } from "@/components/mock";
import { PrivacyFigure } from "@/components/product/PrivacyFigure";
import { Reveal } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

/**
 * The product, as the one claim it exists to prove.
 *
 * This section used to be seven pieces of copy around two panels drawn in a
 * second style — a student's screen, a teacher's screen, a diagram between
 * them and a heading and a caption for each. The claim they were all making
 * is a single sentence: what the teacher receives is not what the student
 * wrote. So it is now that sentence, one figure that shows it at rest, and
 * one caption that says it in full.
 *
 * The figure is not wrapped in a <Reveal>. Its beats are scroll-linked to
 * its own position, and an ancestor still animating a translate would be
 * measured mid-flight. Only the caption animates in, and it is passed into
 * the figure so that it is the figure's own figcaption rather than a
 * paragraph that happens to follow it.
 */
export function Product() {
  return (
    <Section id="product">
      <Reveal>
        <SectionTitle>プロダクト</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          教員に届くのは、要点のみ。
        </p>
      </Reveal>

      <div className="mt-12 md:mt-16">
        <PrivacyFigure>
          <Reveal>
            <Caption lead="日記の本文は共有されません" className="mt-5">
              自分のタイミングで書いた日記にAIが問いをひとつ返し、教員にはクラスと出席番号、リスクの高低だけが届きます。
            </Caption>
          </Reveal>
        </PrivacyFigure>
      </div>
    </Section>
  );
}
