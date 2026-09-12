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
 * ENTRY and ROWS are transcribed verbatim from src/components/sections/
 * Product.tsx, which still holds its own copies; that section is owned
 * elsewhere and should import from here instead (see the report).
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
export const ROWS = [
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

export type Row = (typeof ROWS)[number];

/** The heading the report is filed under, as the teacher's screen prints it. */
export const REPORT_TITLE = "今月のリスクレポート";

/* -------------------------------------------------------------------------- */
/* The trend                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The shape of the analysis, one column per entry.
 *
 * Deliberately unlabelled and unnumbered. It is not a measurement of
 * anything real and must not be able to be read as one — what it carries is
 * a *distinction*: one tall day on its own stays in the neutral mark, while
 * a run of rising days is what the report escalates. The claim that shape
 * illustrates is written out in the caption beside it, so the figure never
 * has to be annotated to be understood.
 *
 * `h` is a percentage of the chart's own height — the bars are styled, never
 * animated, so no frame animates a height.
 */
export const TREND: readonly { h: number; run?: true }[] = [
  { h: 26 },
  { h: 20 },
  { h: 33 },
  // The isolated day. Tall, and deliberately not flagged.
  { h: 80 },
  { h: 24 },
  { h: 30 },
  { h: 22 },
  { h: 35 },
  { h: 27 },
  { h: 41 },
  { h: 57, run: true },
  { h: 69, run: true },
  { h: 81, run: true },
  { h: 93, run: true },
];

/** The heading the analysis screen is filed under. */
export const TREND_TITLE = "心理的リスクの推移";
