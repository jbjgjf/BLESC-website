import { Logo } from "@/components/Logo";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Reveal } from "@/components/Reveal";
import { Icon, Lines, Section, SectionTitle } from "@/components/ui";

/**
 * A sample entry, not a real one.
 *
 * Kept deliberately ordinary and undramatic: the product's whole claim is
 * that the signal lives in unremarkable writing, so a mockup showing a
 * student in visible crisis would misrepresent what the model reads.
 */
const ENTRY = {
  date: "8月20日（木）",
  prompt: "今日はどんな一日だった？",
  body: "部活がきつくて、最近あんまり眠れてない。朝がしんどいけど、みんなも同じだと思うから、たぶん大丈夫。",
  count: "48",
  /**
   * The deep-dive. Not a chat: the diary is still the interface, and the AI
   * returns a single question about what was actually written rather than
   * opening a conversation. "たぶん大丈夫" is the kind of line it exists to
   * push gently on.
   */
  followUp: "「あんまり眠れてない」のは、いつごろから？",
};

/**
 * Sample rows for the teacher panel.
 *
 * Anonymised exactly the way the real report is — class and roll number,
 * never a name, never a line quoted from the entry itself. That is the
 * product decision made visible: the panel is the *whole* of what a teacher
 * receives. Holding the mockup to that standard also means it cannot be
 * mistaken for a screenshot of real students.
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

/** Chrome comes from SpotlightCard; this is only the layout. */
const FRAME = "flex flex-1 flex-col overflow-hidden";

function StudentScreen() {
  return (
    <SpotlightCard className={FRAME}>
      {/* h-5 keeps this header the height the old lockup occupied. */}
      <div className="flex items-center border-b border-line px-5 py-4">
        <Logo className="h-5 w-auto" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-[0.75rem] tabular-nums text-muted">{ENTRY.date}</p>
          <p className="mt-1.5 text-[0.9rem] font-medium tracking-[-0.01em] text-ink">
            {ENTRY.prompt}
          </p>
        </div>

        {/*
          The writing surface. flex-1 so it takes whatever height is left,
          which is what makes a diary read as a diary rather than as a form
          field — the page is mostly the space to write in.
        */}
        <div className="flex flex-1 flex-col rounded-2xl bg-inset p-4">
          <p className="text-[0.85rem] leading-[1.9] text-ink">{ENTRY.body}</p>
          <span className="mt-auto pt-3 text-right text-[0.7rem] tabular-nums text-muted">
            {ENTRY.count}字
          </span>
        </div>

        {/*
          Tinted rather than bordered so it reads as the system speaking back,
          not as another field to fill in. The label uses mark-1, not accent:
          #85c0ed is a fill colour and measures 1.87:1 as text on the light
          ground, while mark-1 flips with the theme.
        */}
        <div className="rounded-2xl bg-accent/10 p-4">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-medium tracking-[0.06em] text-mark-1">
            <Icon name="auto_awesome" size={14} className="shrink-0" />
            AIからの問いかけ
          </p>
          <p className="mt-2 text-[0.85rem] leading-relaxed text-ink">
            {ENTRY.followUp}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
        <span className="flex items-center gap-1.5 text-[0.75rem] text-muted">
          <Icon name="lock" size={14} className="shrink-0" />
          本文は先生に見えません
        </span>
        <span className="rounded-full bg-accent px-4 py-2 text-[0.78rem] font-medium text-on-accent">
          提出する
        </span>
      </div>
    </SpotlightCard>
  );
}

function TeacherScreen() {
  return (
    <SpotlightCard className={FRAME}>
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
              {row.klass} <span className="text-ink">{row.no}</span>
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
        日記の本文は共有されません
      </div>
    </SpotlightCard>
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
        so a screen reader is not walked through a staged diary entry and a
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
 * Split out of テクノロジー, which argued for an ontology graph without ever
 * showing the thing being sold. Both sides at once is also the clearest form
 * of the privacy claim: what the student writes on the left never appears on
 * the right.
 */
export function Product() {
  return (
    <Section id="product">
      <Reveal>
        <SectionTitle accent="bg-mark-3">プロダクト</SectionTitle>
      </Reveal>

      <Reveal className="max-w-3xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          毎日5分の日記から、心理的リスクを捉える。
        </p>
      </Reveal>

      <Reveal className="mt-6 max-w-2xl">
        <Lines className="measure-jp text-muted">
          {`生徒が書くのは、1日5分の短い日記だけ。
独自のAIがその内容を深掘りし、言葉の奥にあるサインまで捉えます。
教員に届くのは要点のみで、日記の本文が共有されることはありません。`}
        </Lines>
      </Reveal>

      <Reveal className="mt-14">
        <div className="grid items-stretch gap-10 md:grid-cols-2 md:gap-8">
          <Screen label="生徒の画面" caption="毎日5分。書いた内容に、AIが問いを返します。">
            <StudentScreen />
          </Screen>

          <Screen
            label="教員の画面"
            caption="届くのは要点のみ。日記の本文は非公開。"
          >
            <TeacherScreen />
          </Screen>
        </div>
      </Reveal>
    </Section>
  );
}
