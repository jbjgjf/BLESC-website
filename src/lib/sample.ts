/**
 * The sample data every product mockup on the site draws from.
 *
 * One module, because the mockups are an argument and the argument only holds
 * if they agree with each other: the entry the student writes in 仕組み has to
 * be the same entry the AI asks about, and the row along the foot of step
 * 04's analysis has to be the row the teacher receives. When this lived as
 * a local `const` in each section, two screens could quietly come to show
 * two different products.
 *
 * Nothing here is real, and nothing here may be *invented* either. The rule
 * the whole site follows: a student is a class and a roll number, never a
 * name; no dates beyond the one entry's own; no counts, percentages or
 * metrics that read as a measurement of anything. Every Japanese string
 * below already shipped in the repo — this file moved them, it did not write
 * them.
 *
 * Every product picture on the page — 仕組み, プロダクト — imports from here
 * and nowhere else.
 *
 * Two languages, one shape. The site is Japanese at / and English at /en,
 * and the mockups are the same screens in both, so each value below carries
 * `ja` and `en` side by side and a screen picks with its locale
 * (`ENTRY[locale]`). The English is a translation of the Japanese beside it
 * and states nothing the Japanese does not: the same class, the same roll
 * numbers, the same evening, the same observations. Anything that is not
 * language — how many students, the shape of the chart — is written once.
 */

import type { Locale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/* The entry                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A sample entry, not a real one.
 *
 * Kept deliberately ordinary and undramatic: the product's whole claim is
 * that the signal lives in unremarkable writing, so a mockup showing a
 * student in visible crisis would misrepresent what the model reads.
 */
export const ENTRY = {
  ja: {
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
  },
  /*
   * The same entry as a teenager would write it in English, and no more
   * worrying than the Japanese: practice, sleep, mornings, "probably fine".
   * The follow-up quotes three words of it exactly, as the Japanese one
   * quotes あんまり眠れてない, so change the two together.
   *
   * It runs to about a line more than the Japanese at every width the
   * screens are drawn at; the screens that hold it give English its own
   * leading and height for that (StepMockups, PrivacyFigure).
   */
  en: {
    date: "Thu, Aug 20",
    prompt: "How was your day?",
    body: "Practice has been tough and I’m not sleeping much lately. Mornings are rough, but I guess everyone’s the same, so I’m probably fine.",
    followUp: "About when did “not sleeping much” start?",
  },
} as const satisfies Record<
  Locale,
  { date: string; prompt: string; body: string; followUp: string }
>;

/** Characters written. Counted from the entry, never typed out beside it. */
const lengthOf = (body: string) => [...body].length;

/**
 * The counter under the writing surface, as the screen prints it: the
 * entry's own length and the unit. Each language counts its own entry, so
 * the number on screen is always the number of characters above it.
 */
export const ENTRY_COUNT: Record<Locale, string> = {
  ja: `${lengthOf(ENTRY.ja.body)}字`,
  en: `${lengthOf(ENTRY.en.body)} characters`,
};

/** Everything after the last `comma` in `body`, behind an ellipsis. */
const tailOf = (body: string, comma: string) =>
  `…${body.slice(body.lastIndexOf(comma) + comma.length)}`;

/**
 * The last clause of the entry, quoted on its own where a mockup shows the
 * moment the question comes back — it is the line the follow-up pushes on.
 * Sliced from the entry's `body` rather than written out a second time, so
 * the quote cannot drift from the entry it quotes. The clause starts after
 * the last comma: 「、」 in Japanese, a comma and a space in English.
 */
export const ENTRY_TAIL: Record<Locale, string> = {
  ja: tailOf(ENTRY.ja.body, "、"),
  en: tailOf(ENTRY.en.body, ", "),
};

/** The two promises the student is given, as the writing screen states them. */
export const STUDENT_BAR = {
  ja: {
    /** Printed beside a lock. */
    note: "本文は先生に見えません",
    action: "提出する",
  },
  /*
   * The note is cut with an ellipsis where it does not fit (<Composer>), and
   * it sits beside the button in a window as narrow as 248px, so the English
   * is held to what fits there whole: a promise that loses its last word
   * reads as a different promise.
   */
  en: {
    note: "Teachers can’t see this",
    action: "Submit",
  },
} as const satisfies Record<Locale, { note: string; action: string }>;

/**
 * The promise printed along the foot of the teacher's screen: the tool does
 * not diagnose, and the entry itself does not travel. The display policy
 * requires the first half on every educator mock; the second is the privacy
 * claim the product figure is built on.
 */
export const TEACHER_BAR = {
  ja: { note: "本ツールは診断を行いません。日記の本文も共有されません。" },
  en: {
    note: "This tool does not diagnose. The diary text is not shared either.",
  },
} as const satisfies Record<Locale, { note: string }>;

/* -------------------------------------------------------------------------- */
/* The class                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The class a mockup is set in, and its size.
 *
 * 全生徒が対象 is a claim about the unit being a whole class rather than the
 * students who volunteer, so step 01's screen in 仕組み is a class list, and
 * it needs a class to be about: `label` is its title, `size` the chip beside
 * it, and `count` how many roll numbers it draws, so the list cannot hold a
 * different number of students from the one its chip states. Both Japanese
 * strings came over from the roster that screen used to be. `count` is not
 * language, so it is written once, beside the two chips that state it.
 */
export const CLASS = {
  count: 40,
  ja: { label: "3年2組", size: "全40名" },
  en: { label: "Class 3-2", size: "40 students" },
} as const;

/* -------------------------------------------------------------------------- */
/* The report                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Sample rows for the teacher's screen.
 *
 * Anonymised exactly the way the real screen is — class and roll number,
 * never a name, never a line quoted from the entry itself. That is the
 * product decision made visible: these rows are the *whole* of what a teacher
 * receives, and holding the mockup to that standard means it cannot be
 * mistaken for a screenshot of real students.
 *
 * What each row shows is an *observation* — which category of expression was
 * matched, when, and on which surface — never a classification of the
 * student. The company's educator display policy (2026-08-06) removed the
 * 高/中/低 band on arithmetic rather than on a validation gap: at 5%
 * prevalence with 80/90 sensitivity/specificity the positive predictive value
 * is about 30%, so seven in ten students labelled 高 would not be cases, and a
 * better model does not move that. Nothing here carries a level, a score or a
 * bar, and the rows are newest-first — ordering by severity would put the
 * classification back through the sort. See docs/claims.md §2.
 *
 * The Japanese wording is the product's own (its safety.reason catalogue),
 * as the production site's teacher mock already quotes it, so the mock and
 * the screen cannot drift apart. The first row is the sample entry above:
 * the same class and roll number, the same evening, written in the journal.
 *
 * The English is a translation of those lines, not a second catalogue, and
 * it is held to the same rule: each one names a category of expression and
 * says nothing about the student. The bracket on the first row is a
 * negation in both languages — no explicit mention of danger — and has to
 * stay one. The surface names are the product's own three (ジャーナル,
 * チャット, 音声): Journal, Talk, Voice. チャット is "Talk", not "Chat" —
 * the English site never calls anything Blesc does a chat, even in a label,
 * and "Talk" is the name the same screen's tab carries in the hero's mock
 * (hero/AppMock: 相談, "Talk"), so the two pictures name it alike.
 *
 * One list, with both languages on each row, so the two cannot come to hold
 * different rows or a different order; `ROWS` below is the same list read
 * out in one language.
 */
const REPORT = [
  {
    no: "#14",
    ja: {
      klass: "3年2組",
      observation: "苦痛の表現（危険の明示なし）",
      at: "8月20日 21:47",
      surface: "ジャーナル",
    },
    en: {
      klass: "Class 3-2",
      observation: "Expression of distress (no explicit mention of danger)",
      at: "Aug 20, 9:47 PM",
      surface: "Journal",
    },
  },
  {
    no: "#08",
    ja: {
      klass: "3年1組",
      observation: "「消えたい」など離脱を示唆する曖昧な表現",
      at: "8月19日 22:03",
      surface: "チャット",
    },
    en: {
      klass: "Class 3-1",
      observation:
        "Ambiguous expression suggesting escape, such as “I want to disappear”",
      at: "Aug 19, 10:03 PM",
      surface: "Talk",
    },
  },
  {
    no: "#03",
    ja: {
      klass: "3年3組",
      observation: "別の画面での開示を引き継ぎ",
      at: "8月18日 20:15",
      surface: "音声",
    },
    en: {
      klass: "Class 3-3",
      observation: "Disclosure carried over from another screen",
      at: "Aug 18, 8:15 PM",
      surface: "Voice",
    },
  },
] as const;

/** One row as a screen draws it: who, what was observed, when and where. */
export type Row = {
  /** e.g. 3年2組 */
  klass: string;
  /** e.g. #14. The same in both languages. */
  no: string;
  observation: string;
  at: string;
  surface: string;
};

const rowsIn = (locale: Locale): readonly Row[] =>
  REPORT.map((row) => ({ no: row.no, ...row[locale] }));

/** The rows in each language, newest first. */
export const ROWS: Record<Locale, readonly Row[]> = {
  ja: rowsIn("ja"),
  en: rowsIn("en"),
};

/**
 * The word a row prints in front of what was observed — 観測: … — so the
 * line says what kind of thing it is before it says what.
 */
export const OBSERVATION_LABEL: Record<Locale, string> = {
  ja: "観測",
  en: "Observation",
};

/**
 * Printed under every row. An educator has to be able to tell a lexicon match
 * from a model judgement, so the provenance is stated rather than implied —
 * and an observation with no basis is not displayed at all.
 */
export const BASIS: Record<Locale, string> = {
  ja: "根拠: 記述との一致 / 推論なし",
  en: "Basis: text match / no inference",
};

/** The heading the rows are filed under, as the teacher's screen prints it. */
export const REPORT_TITLE: Record<Locale, string> = {
  ja: "要確認の観測",
  en: "Observations to check",
};

/**
 * The order, stated in the title bar. It is time, and it says so: anything
 * that ranked these rows by severity would be the removed band re-entering
 * through the sort.
 */
export const REPORT_SORT: Record<Locale, string> = {
  ja: "新しい順",
  en: "Newest first",
};

/* -------------------------------------------------------------------------- */
/* The trend                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * How the student's writing has moved, one column per entry.
 *
 * Deliberately unlabelled and unnumbered, and in one colour. It is not a
 * measurement of anything real and must not be read as one — above all not as
 * a score for the student, which is exactly what the display policy forbids.
 * What it carries is the thing the product does visualise: the student's own
 * usual range (the band, `BASELINE`) and entries leaving it. One tall day on
 * its own returns to the band; a run of recent days stays outside it. That is
 * the distinction step 04 describes — a clue for the teacher to look closer,
 * not a judgement — and the step's own text says so in words.
 *
 * `h` is a percentage of the chart's own height — the bars are styled, never
 * animated, so no frame animates a height. `recent` marks the latest run,
 * which is drawn at full strength and the rest at a quieter one.
 */
export const TREND: readonly { h: number; recent?: true }[] = [
  { h: 26 },
  { h: 20 },
  { h: 33 },
  // The isolated day. Tall, and back inside the band the next day.
  { h: 80 },
  { h: 24 },
  { h: 30 },
  { h: 22 },
  { h: 35 },
  { h: 27 },
  { h: 41 },
  { h: 57, recent: true },
  { h: 69, recent: true },
  { h: 81, recent: true },
  { h: 93, recent: true },
];

/** The student's usual range, as percentages of the chart's height. */
export const BASELINE = { from: 16, to: 44 } as const;

/** The heading the analysis screen is filed under — the step's own words. */
export const TREND_TITLE: Record<Locale, string> = {
  ja: "書きぶりの変化",
  en: "Changes in how a student writes",
};

/* -------------------------------------------------------------------------- */
/* The interface's own words                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The few words the screens print that are not sample data: a column head
 * and the label over the AI's question. They are here, rather than in each
 * screen, because two screens print the same label — the question appears in
 * 仕組み and again in プロダクト — and it has to be the same words in both.
 */
export const SCREEN_WORDS = {
  ja: {
    /** The column head over the class list. */
    rollNumber: "出席番号",
    /** Over the one question the AI sends back. */
    question: "AIからの問いかけ",
  },
  en: {
    rollNumber: "Student number",
    question: "Question from the AI",
  },
} as const satisfies Record<Locale, { rollNumber: string; question: string }>;
