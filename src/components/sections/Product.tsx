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
const ROWS = [
  {
    klass: "3年2組",
    no: "#14",
    level: "高",
    width: "88%",
    bar: "bg-risk-high",
    text: "text-risk-high",
  },
  {
    klass: "3年1組",
    no: "#08",
    level: "中",
    width: "63%",
    bar: "bg-risk-mid",
    text: "text-risk-mid",
  },
  {
    klass: "3年2組",
    no: "#27",
    level: "中",
    width: "54%",
    bar: "bg-risk-mid",
    text: "text-risk-mid",
  },
  {
    klass: "3年3組",
    no: "#03",
    level: "低",
    width: "21%",
    bar: "bg-risk-low",
    text: "text-risk-low",
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
          今月のリスクレポート
        </span>
        <span className="shrink-0 rounded-full bg-risk-high/15 px-2.5 py-1 text-[0.7rem] font-medium text-risk-high">
          3件の要対応
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center divide-y divide-line">
        {ROWS.map((row) => (
          <div
            key={`${row.klass}${row.no}`}
            className="flex items-center gap-4 px-5 py-4"
          >
            <span className="w-[5.5rem] shrink-0 text-[0.8rem] tabular-nums text-muted">
              {row.klass}{" "}
              <span className="text-ink">{row.no}</span>
            </span>

            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset">
              <span
                className={`block h-full rounded-full ${row.bar}`}
                style={{ width: row.width }}
              />
            </span>

            {/*
              The level is printed, not merely coloured. Red-amber-green is
              the worst possible pairing for colour blindness, so the label
              is what actually carries the meaning — WCAG 1.4.1.
            */}
            <span
              className={`w-4 shrink-0 text-right text-[0.8rem] font-medium ${row.text}`}
            >
              {row.level}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-5 py-4 text-[0.78rem] text-muted">
        <Icon name="lock" size={16} className="shrink-0" />
        会話ログは共有されません
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
