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
 * What each row shows is an *observation* — which category of expression the
 * deterministic safety layer matched, when, and on which surface — never a
 * classification of the student. `educator_display_policy.md` (2026-08-06)
 * removed the 高/中/低 band on arithmetic rather than on a validation gap: at
 * 5% prevalence with 80/90 sensitivity/specificity the positive predictive
 * value is ~30%, so seven in ten students labelled 高 would not be cases, and
 * a better model does not move that. `state_band` and `latest_score` are still
 * computed and stored; they are not rendered, not counted in a tile, and not
 * used to order this list — ordering by band would put the classification back
 * into the interface through the sort. These rows are newest-first, and the
 * header says so.
 *
 * The observation wording is the product's own, from
 * `sentra/frontend/src/lib/i18n/ja.ts` (`safety.reason`), so the mock and the
 * screen cannot drift apart.
 */
const ROWS = [
  {
    klass: "3年2組",
    no: "#14",
    observation: "苦痛の表現（危険の明示なし）",
    at: "8月20日 21:47",
    surface: "ジャーナル",
  },
  {
    klass: "3年1組",
    no: "#08",
    observation: "「消えたい」など離脱を示唆する曖昧な表現",
    at: "8月19日 22:03",
    surface: "チャット",
  },
  {
    klass: "3年3組",
    no: "#03",
    observation: "別の画面での開示を引き継ぎ",
    at: "8月18日 20:15",
    surface: "音声",
  },
] as const;

/**
 * Printed under every row. Rule 3 of the display policy: an educator has to be
 * able to tell a lexicon match from a model judgement, so the provenance is
 * stated rather than implied. Rule 2 is why there is no row without one — an
 * observation with no reasons is not displayed at all.
 */
const BASIS = "根拠: 記述との一致 / 推論なし";

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
          要確認の観測
        </span>
        {/*
          The sort is stated, and it is time. Anything that ranked these rows
          by severity would be the removed band re-entering through the order
          — display policy, rule 1.
        */}
        <span className="shrink-0 rounded-full bg-inset px-2.5 py-1 text-[0.7rem] font-medium text-muted">
          新しい順
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center divide-y divide-line">
        {ROWS.map((row) => (
          <div key={`${row.klass}${row.no}`} className="px-5 py-3.5">
            <p className="flex items-baseline gap-2 text-[0.75rem] tabular-nums text-muted">
              <span className="text-ink">
                {row.klass} {row.no}
              </span>
              <span>
                {row.at} · {row.surface}
              </span>
            </p>

            {/*
              The observation is the row. It says which category of expression
              was matched — not how the student is doing, and not a line
              quoted from what they wrote.
            */}
            <p className="mt-1.5 text-[0.8rem] leading-snug text-ink">
              観測: {row.observation}
            </p>

            <p className="mt-1 text-[0.7rem] text-muted">└ {BASIS}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 border-t border-line px-5 py-4 text-[0.78rem] leading-snug text-muted">
        <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
        <span>本ツールは診断を行いません。日記の本文も共有されません。</span>
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
          毎日5分の日記から、言葉の変化を捉える。
        </p>
      </Reveal>

      <Reveal className="mt-6 max-w-2xl">
        <Lines className="measure-jp text-muted">
          {`生徒が書くのは、1日5分の短い日記だけ。
独自のAIがその内容を深掘りし、言葉の奥にあるサインまで捉えて可視化します。
教員に届くのは観測された記述とその時刻・根拠だけで、
日記の本文も、心理的リスクの判定も共有されません。`}
        </Lines>
      </Reveal>

      <Reveal className="mt-14">
        <div className="grid items-stretch gap-10 md:grid-cols-2 md:gap-8">
          <Screen label="生徒の画面" caption="毎日5分。書いた内容に、AIが問いを返します。">
            <StudentScreen />
          </Screen>

          <Screen
            label="教員の画面"
            caption="届くのは観測とその根拠のみ。判定は行いません。"
          >
            <TeacherScreen />
          </Screen>
        </div>
      </Reveal>
    </Section>
  );
}
