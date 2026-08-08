import { Reveal } from "@/components/Reveal";
import { Icon, Lines, Section, SectionTitle } from "@/components/ui";

/** The student side: an ordinary chat, deliberately unremarkable. */
const CHAT = [
  { from: "ai", text: "最近、学校はどんな感じ？" },
  { from: "me", text: "うーん、ちょっと疲れてるかも" },
  { from: "ai", text: "そっか。ちゃんと眠れてる？" },
] as const;

/**
 * Sample rows for the teacher panel.
 *
 * Anonymised exactly the way the real report is — class and roll number,
 * never a name, never a quotation from the conversation. That is the product
 * decision made visible: the panel is the *whole* of what a teacher receives.
 * Keeping the mockup to that standard also means it can't be mistaken for a
 * screenshot of real students.
 *
 * Full class names throughout — Tailwind scans source text, so an
 * interpolated `bg-risk-${level}` would never be generated.
 */
/**
 * Observations, not a risk classification.
 *
 * The previous rows carried 高/中/低 per student. The product stopped
 * producing that on 2026-08-06: "wrote a direct statement about self-harm at
 * 22:14" is a fact, while "risk: high" is an inference about a minor's
 * internal state whose positive predictive value is poor at school-level
 * prevalence no matter how good the model gets. The third row shows the
 * ramp-up state on purpose, so the screen is honest about what it cannot say
 * yet. See BLESC docs/educator_display_policy.md.
 */
const OBSERVATIONS = [
  {
    klass: "3年2組",
    no: "#14",
    observation: "自傷に関する直接的な表現",
    meta: "8/3 22:14 · 決定的マッチ",
  },
  {
    klass: "3年1組",
    no: "#08",
    observation: "「消えたい」など離脱を示唆する表現",
    meta: "8/2 19:40 · 決定的マッチ",
  },
  {
    klass: "3年3組",
    no: "#03",
    observation: "基準値の学習中（残り 6 日）",
    meta: "比較は表示されません",
  },
] as const;

const FRAME =
  "flex flex-1 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow-card)]";

function StudentScreen() {
  return (
    <div className={FRAME}>
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <span className="size-2.5 rounded-full bg-accent" />
        <span className="text-[0.85rem] font-medium tracking-[-0.01em] text-ink">
          blesc
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {CHAT.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-2.5 text-[0.85rem] leading-relaxed ${
              m.from === "me"
                ? "ml-auto rounded-2xl rounded-br-md bg-accent text-on-accent"
                : "rounded-2xl rounded-bl-md bg-inset text-ink"
            }`}
          >
            {m.text}
          </div>
        ))}

        <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md bg-inset px-4 py-3.5">
          <span className="typing-dot size-1.5 rounded-full bg-muted" />
          <span className="typing-dot size-1.5 rounded-full bg-muted" />
          <span className="typing-dot size-1.5 rounded-full bg-muted" />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-5 py-4">
        <span className="flex-1 rounded-full bg-inset px-4 py-2.5 text-[0.8rem] text-muted">
          メッセージを入力...
        </span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
          <Icon name="arrow_upward" size={18} />
        </span>
      </div>
    </div>
  );
}

function TeacherScreen() {
  return (
    <div className={FRAME}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <span className="text-[0.85rem] font-medium tracking-[-0.01em] text-ink">
          今月の観測レポート
        </span>
        <span className="shrink-0 rounded-full bg-inset px-2.5 py-1 text-[0.7rem] font-medium text-muted">
          3件の要確認
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center divide-y divide-line">
        {OBSERVATIONS.map((row) => (
          <div key={`${row.klass}${row.no}`} className="px-5 py-4">
            <div className="flex items-baseline gap-3">
              <span className="w-[5.5rem] shrink-0 text-[0.8rem] tabular-nums text-muted">
                {row.klass} <span className="text-ink">{row.no}</span>
              </span>
              {/*
                No bar and no colour band. A meter reads as a measurement, and
                red-amber-green would carry a severity judgement the product
                does not make — so the observation itself is the content.
              */}
              <span className="text-[0.8rem] leading-relaxed text-ink">
                {row.observation}
              </span>
            </div>
            <div className="mt-1 pl-[5.5rem] text-[0.7rem] text-muted">
              {row.meta}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-line px-5 py-3 text-[0.7rem] text-muted">
        会話ログは共有されません／本ツールは診断を行いません
      </div>
    </div>
  );
}

function Screen({
  label,
  caption,
  children,
}: {
  label: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="flex flex-col">
      <figcaption className="mb-5 text-[0.78rem] font-medium uppercase tracking-[0.15em] text-mark-1">
        {label}
      </figcaption>

      {/*
        The frames are pictures of software, not software. Marked decorative
        so a screen reader is not walked through a staged conversation and a
        table of invented roll numbers as though they were real; the sentence
        underneath each one says what it shows.
      */}
      <div aria-hidden className="flex flex-1 flex-col">
        {children}
      </div>

      <p className="measure-jp mt-5 text-[0.9rem] text-muted">{caption}</p>
    </figure>
  );
}

/**
 * The two screens the product actually is.
 *
 * Split out of テクノロジー, which was three paragraphs about an ontology
 * graph and no picture of the thing being sold. The privacy claim in
 * particular is much harder to doubt when both sides are shown at once: the
 * conversation on the left never appears on the right.
 */
export function Product() {
  return (
    <Section id="product">
      <Reveal>
        <SectionTitle accent="bg-mark-3">プロダクト</SectionTitle>
      </Reveal>

      <Reveal className="max-w-3xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          生徒が語り、教員は要点だけを受け取る。
        </p>
      </Reveal>

      <Reveal className="mt-8 max-w-2xl">
        <Lines className="measure-jp text-muted">
          {`生徒側は、構えずに話せるチャット。
教員側は、対応が必要な生徒だけが浮かび上がる要点レポート。
会話ログそのものが教員に共有されることはありません。`}
        </Lines>
      </Reveal>

      <Reveal className="mt-16">
        <div className="grid items-stretch gap-10 md:grid-cols-2 md:gap-8">
          <Screen label="生徒の画面" caption="構えずに話せる、月に一度の対話。">
            <StudentScreen />
          </Screen>

          <Screen
            label="教員の画面"
            caption="届くのは要点のみ。会話の中身は非公開。"
          >
            <TeacherScreen />
          </Screen>
        </div>
      </Reveal>
    </Section>
  );
}
