import { Panel } from "@/components/product/Panel";
import { Reveal } from "@/components/Reveal";
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
  /** One line. If it needs two, the panel is not doing its job. */
  body: string;
  /** The screen this step looks like. */
  mock: () => React.ReactElement;
};

/**
 * Four steps, each one a line of copy against a large picture of the screen
 * it happens on.
 *
 * This was a 4/8 + 7/5 grid of four bordered cards, each holding a heading,
 * a paragraph and a thumbnail. Four boxes of the same construction read as a
 * specification rather than as a sequence, and the screens — the only part
 * that actually shows what the product does — were the smallest thing in
 * them. Inverted here: the panel is most of the block, the prose is one
 * line, and the sides swap so the eye has to travel down the page to follow
 * the flow.
 */
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
 * One step.
 *
 * Twelve columns with an explicit col-start on each side rather than a
 * reordered DOM: the copy stays before its own panel in source, so the
 * reading order is 01, 02, 03, 04 whatever side each panel lands on. Both
 * branches are written out in full because Tailwind only generates classes
 * it can find literally in the source.
 *
 * Copy first when the block stacks. The generic alternating block puts the
 * panel first on narrow screens, but these are numbered steps: a picture
 * arriving above its own number would read as belonging to the step above
 * it.
 */
function StepBlock({ step, flipped }: { step: Step; flipped: boolean }) {
  const Mock = step.mock;

  return (
    <li>
      <Reveal className="grid gap-6 md:grid-cols-12 md:items-center md:gap-x-12">
        <div
          className={
            flipped
              ? "md:col-span-5 md:col-start-8 md:row-start-1"
              : "md:col-span-5 md:col-start-1 md:row-start-1"
          }
        >
          {/*
            The step number is decoration over a list that is already
            ordered; the sr-only label on the heading is what announces
            position.

            Set in the display serif at something close to the size of the
            heading under it. At 0.8rem in the sans it was a caption, and four
            captions down the page read as four specifications — which is
            exactly how this section was failing. The serif is the page's own
            voice (it is the hero face), the numerals are old-style, and at
            this size they are what the eye lands on first, so the four blocks
            read as 01 through 04 rather than as four of the same thing.
          */}
          <p
            aria-hidden
            className="font-serif text-[clamp(1.875rem,3.4vw,2.5rem)] leading-none tabular-nums text-muted"
          >
            {step.n}
          </p>
          <h3 className="mt-3 text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-snug tracking-[-0.02em] text-ink">
            <span className="sr-only">{`ステップ ${step.n}、`}</span>
            {step.title}
          </h3>
          <p className="measure-jp mt-4 text-[1.0625rem] text-muted">
            {step.body}
          </p>
        </div>

        {/*
          Up from 13/15rem. The diary now writes two lines rather than one and
          the risk panel draws a fourteen-day chart under two labels, and at
          the old phone height the last line of each was inside the frame by
          less than it takes to clip a descender. Every mockup sizes itself
          from this box, so the floor is set here once.
        */}
        <Panel
          className={`h-[15rem] sm:h-[16rem] ${
            flipped
              ? "md:col-span-7 md:col-start-1 md:row-start-1"
              : "md:col-span-7 md:col-start-6 md:row-start-1"
          }`}
        >
          <Mock />
        </Panel>
      </Reveal>
    </li>
  );
}

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

      <ol className="mt-12 space-y-12 md:mt-16 md:space-y-16">
        {STEPS.map((step, i) => (
          <StepBlock key={step.n} step={step} flipped={i % 2 === 1} />
        ))}
      </ol>
    </Section>
  );
}
