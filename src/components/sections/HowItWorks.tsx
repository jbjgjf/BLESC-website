import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Icon, Section, SectionTitle } from "@/components/ui";

type Stage = {
  n: string;
  label: string;
  body: string;
};

/**
 * One flow, read top to bottom.
 *
 * This was five tabs. Clicking through five panels to learn what the product
 * does made the reader do work the page should do for them, and any one
 * numbered box looks like every other numbered box. All five are on the page
 * at once now, and the thing that gives them structure is the boundary they
 * cross: everything above the gate touches what the student actually wrote,
 * and only the summary passes below it. That is the product's whole claim,
 * so it is the divider rather than a footnote on step 04.
 */
const BEFORE: Stage[] = [
  {
    n: "01",
    label: "生徒",
    body: "毎日5分、ホームルームの時間に実施します。対象は希望者ではなく全生徒で、新しい習慣も専用の準備も必要ありません。",
  },
  {
    n: "02",
    label: "日記を書く",
    body: "その日にあったことを、5分で短く綴るだけ。内容も長さも自由です。誰かに読ませるための文章ではなく、自分のための記録として書けることが、本音が残る条件になります。",
  },
  {
    n: "03",
    label: "AIが深掘り",
    body: "独自のAIが、書かれた内容に短い問いを返します。「たぶん大丈夫」で終わる一行の奥にあるものを、対話ではなく一問一答のかたちで、静かに引き出します。",
  },
  {
    n: "04",
    label: "リスク解析",
    body: "言葉のニュアンス、書くことをためらった間、日々の書きぶりの変化。こうした微細なシグナルを積み重ねて、心理的リスクを検知します。毎日書かれるからこそ、一日の落ち込みと、続いている不調とを区別できます。",
  },
];

const AFTER: Stage[] = [
  {
    n: "05",
    label: "教員",
    body: "教員が受け取るのは、対応が必要な生徒を示す要点のみのレポートです。日記の本文そのものが公開されることはなく、教員の側に新しい業務が生まれることもありません。",
  },
];

function Step({ stage, last }: { stage: Stage; last: boolean }) {
  return (
    <div className="relative grid grid-cols-[3rem_1fr] gap-5 pb-10 md:grid-cols-[3.5rem_1fr] md:gap-8 md:pb-12">
      {/*
        Connector, from the bottom of this node to the top of the next. Drawn
        per step rather than once behind the list so it can simply be omitted
        on the last one instead of being masked.
      */}
      {!last && (
        <span
          aria-hidden
          className="absolute left-6 top-12 h-[calc(100%-3rem)] w-px -translate-x-1/2 bg-line md:left-7 md:top-14 md:h-[calc(100%-3.5rem)]"
        />
      )}

      <span
        aria-hidden
        className="relative z-10 flex size-12 items-center justify-center rounded-full border border-line bg-surface text-[0.95rem] font-semibold tabular-nums text-mark-1 md:size-14 md:text-[1.05rem]"
      >
        {stage.n}
      </span>

      <div className="pt-2 md:pt-3">
        <h3 className="text-[clamp(1.2rem,2.4vw,1.6rem)] font-medium leading-snug tracking-[-0.02em] text-ink">
          <span className="sr-only">{`ステップ ${stage.n}、`}</span>
          {stage.label}
        </h3>
        <p className="measure-jp mt-3 max-w-xl text-[0.98rem] text-muted">
          {stage.body}
        </p>
      </div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-7 text-[0.75rem] font-medium uppercase tracking-[0.16em] text-muted">
      {children}
    </p>
  );
}

export function HowItWorks() {
  return (
    <Section id="how" alt>
      <Reveal>
        <SectionTitle accent="bg-mark-1">仕組み</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          毎日5分の日記が、一枚のレポートになるまで。
        </p>
      </Reveal>

      <div className="mt-14">
        <Reveal>
          <GroupLabel>生徒とAIのあいだ</GroupLabel>
        </Reveal>

        <Stagger as="ol" stagger={0.08}>
          {BEFORE.map((stage, i) => (
            <RevealItem as="li" key={stage.n}>
              <Step stage={stage} last={i === BEFORE.length - 1} />
            </RevealItem>
          ))}
        </Stagger>

        {/*
          The boundary, not a footnote. Everything above touches what the
          student wrote; only the summary passes below.
        */}
        <Reveal>
          <div className="my-2 flex items-center gap-4 rounded-2xl border border-dashed border-mark-1/40 bg-mark-1/[0.07] px-5 py-4 md:px-6 md:py-5">
            <Icon name="lock" size={20} className="shrink-0 text-mark-1" />
            <p className="text-[0.9rem] font-medium leading-snug text-ink md:text-[0.98rem]">
              日記の本文は、ここから先に渡りません。
            </p>
          </div>
        </Reveal>

        <div className="mt-12">
          <Reveal>
            <GroupLabel>教員に届くもの</GroupLabel>
          </Reveal>

          <Stagger as="ol" stagger={0.08}>
            {AFTER.map((stage) => (
              <RevealItem as="li" key={stage.n}>
                <Step stage={stage} last />
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </div>
    </Section>
  );
}
