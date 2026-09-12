import { Caption, Frame } from "@/components/mock";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import {
  DiaryMock,
  ProbeMock,
  RosterMock,
  TrendMock,
} from "@/components/StepMockups";
import { Section, SectionTitle } from "@/components/ui";

type Step = {
  n: string;
  /** Three or four characters: the step, not a summary of it. */
  title: string;
  /** The continuation of the caption. One sentence if it can be. */
  body: string;
  /** The screen this step happens on. */
  mock: () => React.ReactElement;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "全生徒が対象",
    body: "希望者ではなく全生徒が対象で、新しい習慣も専用の準備も必要ありません。",
    mock: RosterMock,
  },
  {
    n: "02",
    title: "日記を書く",
    body: "内容も長さも自由。誰かに読ませるための文章ではなく、自分のための記録として書けることが、本音が残る条件になります。",
    mock: DiaryMock,
  },
  {
    n: "03",
    title: "AIが深掘り",
    body: "独自のAIが、対話ではなく短い問いをひとつ返し、「たぶん大丈夫」で終わる一行の奥にあるものを静かに引き出します。",
    mock: ProbeMock,
  },
  {
    n: "04",
    title: "リスク解析",
    body: "言葉のニュアンス、書くことをためらった間、日々の書きぶりの変化。こうした微細なシグナルを積み重ねて、心理的リスクを検知します。書き重ねられるからこそ、一日の落ち込みと、続いている不調とを区別できます。",
    mock: TrendMock,
  },
];

/**
 * The four steps, as four cards.
 *
 * This was four full-measure blocks alternating a column of prose against a
 * wide panel — one screen per scroll, and the prose was the larger half of
 * each. Two problems with that. A sequence of four needs to be *seen* as a
 * sequence, which it cannot be when no two steps are on screen together; and
 * the panels were half-diagram, half-caption, with labels pasted over them
 * saying what they meant.
 *
 * So: a 2×2 grid of mockup cards. Each card is a tinted panel holding one
 * window of the product, and under it one line of text whose first clause is
 * the step. The pictures carry the product, the captions carry the claims,
 * and the whole sequence fits in about a screen and a half.
 *
 * All four panels take the same tint and the same height. The <Frame> can
 * tint with any of the three meaning marks, but this section is one product
 * seen four times, and four different tints would read as four different
 * things.
 */
export function HowItWorks() {
  return (
    <Section id="how">
      <Reveal>
        <SectionTitle>仕組み</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          ひとりで綴る日記が、一枚のレポートになるまで。
        </p>
      </Reveal>

      {/*
        One column until 768px. The windows inside these panels set Japanese
        at 0.78rem, and at two columns on a phone a line of the diary entry
        would be about nine characters wide — which is not what the product
        looks like.

        gap-y is larger than gap-x because the vertical gap has to separate a
        caption from the next card's panel, while the horizontal one only
        separates two panels.
      */}
      <Stagger
        as="ol"
        stagger={0.08}
        className="mt-12 grid gap-x-6 gap-y-10 md:mt-16 md:grid-cols-2 md:gap-x-8 md:gap-y-14"
      >
        {STEPS.map((step) => {
          const Mock = step.mock;

          return (
            <RevealItem as="li" key={step.n}>
              <Frame className="h-[18rem] lg:h-[20rem]">
                <Mock />
              </Frame>
              <Caption n={step.n} lead={step.title} className="mt-5">
                {step.body}
              </Caption>
            </RevealItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
