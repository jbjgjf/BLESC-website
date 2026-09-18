/**
 * The sample data every product mockup on the site draws from.
 *
 * One module, because the mockups are an argument and the argument only holds
 * if they agree with each other: the entry the student writes in 仕組み has to
 * be the same entry the AI asks about, and the roll number the analysis
 * flags has to be the row the teacher receives. When this lived as a local
 * `const` in each section, two screens could quietly come to show two
 * different products.
 *
 * Nothing here is real, and nothing here may be *invented* either. The rule
 * the whole site follows: a student is a class and a roll number, never a
 * name; no dates beyond the one entry's own; no counts, percentages or
 * metrics that read as a measurement of anything. Every string below already
 * shipped in the repo — this file moved them, it did not write them.
 *
 * Every product picture on the page — 仕組み, プロダクト — imports from here
 * and nowhere else.
 */

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
} as const;

/** Characters written. Counted from the entry, never typed out beside it. */
export const ENTRY_LENGTH = [...ENTRY.body].length;

/**
 * The last clause of the entry, quoted on its own where a mockup shows the
 * moment the question comes back — it is the line the follow-up pushes on.
 * Sliced from `ENTRY.body` rather than written out a second time, so the
 * quote cannot drift from the entry it quotes.
 */
export const ENTRY_TAIL = `…${ENTRY.body.slice(ENTRY.body.lastIndexOf("、") + 1)}`;

/** The two promises the student is given, as the writing screen states them. */
export const STUDENT_BAR = {
  /** Printed beside a lock. */
  note: "本文は先生に見えません",
  action: "提出する",
} as const;

/**
 * The promise printed along the foot of the teacher's screen: the tool does
 * not diagnose, and the entry itself does not travel. The display policy
 * requires the first half on every educator mock; the second is the privacy
 * claim the product figure is built on.
 */
export const TEACHER_BAR = {
  note: "本ツールは診断を行いません。日記の本文も共有されません。",
} as const;

/* -------------------------------------------------------------------------- */
/* The class                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The class a mockup is set in, and its size.
 *
 * 全生徒が対象 is a claim about the unit being a whole class rather than the
 * students who volunteer, so the roster mockup needs a class to be about.
 * Both strings are the ones the 仕組み roster already used.
 */
export const CLASS = { label: "3年2組", size: "全40名", count: 40 } as const;

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
 * The wording is the product's own (its safety.reason catalogue), as the
 * production site's teacher mock already quotes it, so the mock and the
 * screen cannot drift apart. The first row is the sample entry above: the
 * same class and roll number, the same evening, written in the journal.
 */
export const ROWS = [
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

export type Row = (typeof ROWS)[number];

/**
 * Printed under every row. An educator has to be able to tell a lexicon match
 * from a model judgement, so the provenance is stated rather than implied —
 * and an observation with no basis is not displayed at all.
 */
export const BASIS = "根拠: 記述との一致 / 推論なし";

/** The heading the rows are filed under, as the teacher's screen prints it. */
export const REPORT_TITLE = "要確認の観測";

/**
 * The order, stated in the title bar. It is time, and it says so: anything
 * that ranked these rows by severity would be the removed band re-entering
 * through the sort.
 */
export const REPORT_SORT = "新しい順";

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
 * not a judgement — and the caption says so in words.
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
export const TREND_TITLE = "書きぶりの変化";
