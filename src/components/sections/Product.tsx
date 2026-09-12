import { Logo } from "@/components/Logo";
import { Panel } from "@/components/product/Panel";
import { PrivacyBoundary } from "@/components/product/PrivacyBoundary";
import { Reveal } from "@/components/Reveal";
import { Icon, Section, SectionTitle } from "@/components/ui";

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

/**
 * The student's side, at the width of the page.
 *
 * It used to be one of two portrait frames in a 2-up grid, where the diary —
 * the surface the whole product is built on — was about 200px tall. At full
 * measure it can be shaped like the application it is: the writing on the
 * left, what the AI sends back beside it, and the two promises the student is
 * actually given (their text is private, they press submit) along the foot.
 */
function StudentScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4 md:px-8">
        <Logo className="h-5 w-auto" />
        <span className="text-[0.8rem] tabular-nums text-muted">
          {ENTRY.date}
        </span>
      </div>

      <div className="grid flex-1 gap-5 p-6 md:grid-cols-[1.7fr_1fr] md:gap-7 md:p-8">
        <div className="flex min-h-0 flex-col">
          <p className="text-[0.95rem] font-medium tracking-[-0.01em] text-ink">
            {ENTRY.prompt}
          </p>

          {/*
            flex-1 so the writing surface takes whatever height is left,
            which is what makes a diary read as a diary rather than as a form
            field — the page is mostly the space to write in.
          */}
          <div className="mt-3 flex flex-1 flex-col rounded-2xl bg-inset p-5">
            <p className="text-[0.95rem] leading-[2] text-ink">{ENTRY.body}</p>
            {/* Counted from the text above, never typed out: the two cannot
                drift apart. */}
            <span className="mt-auto pt-4 text-right text-[0.78rem] tabular-nums text-muted">
              {[...ENTRY.body].length}字
            </span>
          </div>
        </div>

        {/*
          Tinted rather than bordered so it reads as the system speaking back,
          not as another field to fill in. The label uses mark-1, not accent:
          #85c0ed is a fill colour and measures 1.87:1 as text on the light
          ground, while mark-1 flips with the theme.
        */}
        <div className="flex flex-col justify-center rounded-2xl bg-accent/10 p-5">
          <p className="flex items-center gap-1.5 text-[0.75rem] font-medium tracking-[0.06em] text-mark-1">
            <Icon name="auto_awesome" size={14} className="shrink-0" />
            AIからの問いかけ
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink">
            {ENTRY.followUp}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4 md:px-8">
        <span className="flex items-center gap-1.5 text-[0.8rem] text-muted">
          <Icon name="lock" size={14} className="shrink-0" />
          本文は先生に見えません
        </span>
        <span className="rounded-full bg-accent px-5 py-2.5 text-[0.82rem] font-medium text-on-accent">
          提出する
        </span>
      </div>
    </div>
  );
}

/** The teacher's side: the report, and nothing underneath it. */
function TeacherScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4 md:px-8">
        <span className="text-[0.95rem] font-medium tracking-[-0.01em] text-ink">
          今月のリスクレポート
        </span>
        {/*
          text-risk-high-text, not text-risk-high: the fill colour over its
          own 15% tint measures 3.81:1 in light mode, under AA for a label
          this small.
        */}
        <span className="shrink-0 rounded-full bg-risk-high/15 px-2.5 py-1 text-[0.75rem] font-medium text-risk-high-text">
          3件の要対応
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center divide-y divide-line">
        {ROWS.map((row) => (
          <div
            key={`${row.klass}${row.no}`}
            className="flex items-center gap-5 px-6 py-4 md:px-8"
          >
            <span className="w-[6rem] shrink-0 text-[0.85rem] tabular-nums text-muted">
              {row.klass} <span className="text-ink">{row.no}</span>
            </span>

            <span className="h-2 flex-1 overflow-hidden rounded-full bg-inset">
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
              className={`w-4 shrink-0 text-right text-[0.85rem] font-medium ${row.text}`}
            >
              {row.level}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-6 py-4 text-[0.8rem] text-muted md:px-8">
        <Icon name="lock" size={16} className="shrink-0" />
        日記の本文は共有されません
      </div>
    </div>
  );
}

/**
 * A screen and the sentence that says what it shows.
 *
 * The uppercase, letter-spaced, accent-coloured label that used to sit above
 * each frame is now a plain heading, and the caption has moved up beside it:
 * the panel is the thing worth looking at, so nothing should sit underneath
 * it competing for the same glance. The caption is also where the panel's
 * facts live as real text, since the panel itself is aria-hidden.
 */
function Screen({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure>
      <figcaption className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <h3 className="text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-snug tracking-[-0.02em] text-ink">
          {title}
        </h3>
        <p className="text-[1.0625rem] text-muted">{caption}</p>
      </figcaption>

      <Panel className="mt-6 md:h-[23rem]">{children}</Panel>
    </figure>
  );
}

/**
 * The two screens the product actually is.
 *
 * They were side by side at half measure with three lines of summary above
 * them; the summary repeated 仕組み almost sentence for sentence, so it is
 * gone and the screens have the full width each. What is left above them is
 * the one claim the pair exists to prove — that the diary does not travel —
 * and it holds because the student's text is on one panel and demonstrably
 * absent from the other.
 */
export function Product() {
  return (
    <Section id="product">
      <Reveal>
        <SectionTitle>プロダクト</SectionTitle>
      </Reveal>

      <Reveal className="max-w-4xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          教員に届くのは要点のみで、日記の本文が共有されることはありません。
        </p>
      </Reveal>

      <div className="mt-12 space-y-12 md:mt-16 md:space-y-16">
        <Reveal>
          <Screen
            title="生徒の画面"
            caption="自分のタイミングで。書いた内容に、AIが問いを返します。"
          >
            <StudentScreen />
          </Screen>
        </Reveal>

        {/*
          Between the two screens, because that is where the claim lives.
          Reading order is: here is what the student writes — here is the
          wall it does not cross — here is all that arrives.

          NOT wrapped in <Reveal>: the beats inside are scroll-linked to this
          element's own position, and an ancestor still animating a translate
          would be measured mid-flight. Same reason the ontology graph opts
          out.
        */}
        <PrivacyBoundary
          body={ENTRY.body}
          klass={ROWS[0].klass}
          no={ROWS[0].no}
          level={ROWS[0].level}
          width={ROWS[0].width}
        />

        <Reveal>
          <Screen
            title="教員の画面"
            caption="届くのは要点のみ。日記の本文は非公開。"
          >
            <TeacherScreen />
          </Screen>
        </Reveal>
      </div>
    </Section>
  );
}
