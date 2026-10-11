"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { Locale } from "@/lib/i18n";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { BASELINE, TREND } from "@/lib/sample";

/**
 * テクノロジー's figure: 生徒の「変化」を「抽出」する, drawn as a model.
 *
 * It replaces the knowledge graph that stood here — three overlapping discs
 * of concepts. That was a faithful drawing of the ontology seed, but the
 * company's view is that it is the wrong model of the product: what Blesc
 * does with a diary is not to place it among concepts, it is to take out
 * what has changed. The section's headline says so (「日記から抽出するのは、
 * 変化だけです。」), and this is the picture of that sentence.
 *
 * THREE ROWS ON ONE TIME AXIS, one column per diary entry:
 *   01  the diary — strokes standing for lines of writing, in grey, because
 *       this is what stays behind;
 *   02  the same entries against the student's own range so far (the band).
 *       A dot inside it is grey; a dot that has left it is the mark colour;
 *   03  what is taken out — only the entries that left the band, dropped
 *       straight down their own column, and nothing else in the row.
 * The empty places in row 03 are the point of the figure. They are what
 * 変化だけ looks like.
 *
 * NO NEW CLAIM, AND NO NEW DATA. The columns and the band are TREND and
 * BASELINE from lib/sample — the chart 仕組み draws small in step 04 — so the
 * two pictures cannot disagree, and everything that file says about that
 * chart binds this one: it is unlabelled and unnumbered on its value axis,
 * in one colour, and is "not a measurement of anything real and must not be
 * read as one — above all not as a score for the student" (docs/claims.md
 * §2). So the caption says outright that height is not a score, and nothing
 * here ranks, grades or bands a student.
 *
 * Every entry outside the band is taken out, the lone tall day as much as
 * the run at the end. The figure does not decide which of them matters:
 * that a single day and a continuing change look different in row 03 is the
 * clue the FAQ describes, and the judgement stays with the teacher.
 *
 * Drawn bare, in the site's own vocabulary: step numerals in the mark colour
 * as 仕組み sets them, hairlines, the accent wash for the band as in the
 * step-04 screen, and no boxes of its own — the panel it sits in is
 * テクノロジー's.
 *
 * Built from boxes rather than an <svg>: the fourteen columns are one grid
 * template shared by all three rows, so they line up at any width without a
 * viewBox scaling the type down on a phone, and the captions are real text
 * in the page's own face.
 *
 * Motion is the order of the sentence: the diary arrives, the dots settle
 * against the band, and then the lines drop and the change lands. Nothing
 * animates a size. Under reduced motion everything fades in together.
 */

type Copy = {
  steps: readonly [Step, Step, Step];
  note: string;
  /** For a screen reader, which cannot see which places are empty. */
  spoken: (entries: number, out: number, run: number) => string;
};
type Step = { label: string; note: string };

/**
 * The words agree with the section's own paragraph beside the figure
 * (Technology.tsx, `body`): 「先生が日記を読むことはありません」, 「その生徒の
 * これまでと比べた変化」, 「届くのは…その時刻と根拠だけ」. In English, "teachers
 * never see", "that student’s own writing so far", "with its time and its
 * basis". Change one and change the other.
 */
const COPY: Record<Locale, Copy> = {
  ja: {
    steps: [
      { label: "日記", note: "先生が読むことはありません" },
      {
        label: "その生徒のこれまでと比べる",
        note: "帯は、その生徒自身のこれまでの範囲",
      },
      {
        label: "抽出される変化",
        note: "先生に届くのは、これと、その時刻・根拠だけ",
      },
    ],
    note: "模式図です。点の高さは点数ではなく、生徒を評価するものでもありません。",
    spoken: (entries, out, run) =>
      `${entries}回の記録のうち、その生徒のこれまでの範囲を外れた${out}回だけが、いちばん下の段に取り出されています。1回だけ外れた記録と、続けて外れた${run}回です。ほかの場所は空いています。`,
  },
  en: {
    steps: [
      { label: "Diary", note: "Teachers never see it" },
      {
        label: "Compared with that student’s own writing so far",
        note: "The band is that student’s own range so far",
      },
      {
        label: "The change extracted",
        note: "Only this reaches teachers, with its time and its basis",
      },
    ],
    note: "A schematic. A dot’s height is not a score, and it does not rate a student.",
    spoken: (entries, out, run) =>
      `Of ${entries} entries, only the ${out} that left that student’s own range so far are taken out into the bottom row: one entry on its own, and a run of ${run}. Every other place in the row is empty.`,
  },
};

/** An entry has left the student's own range. */
const isOut = (h: number) => h > BASELINE.to || h < BASELINE.from;

/**
 * For each entry, its place in the order entries are taken out — 0 for the
 * first that left the range, 1 for the next — or -1 if it never left. The
 * lines and the marks stagger by it, and it is worked out once, here, so no
 * render counts as it goes.
 */
const TAKEN: readonly number[] = TREND.reduce<number[]>((acc, d) => {
  const before = acc.filter((k) => k >= 0).length;
  acc.push(isOut(d.h) ? before : -1);
  return acc;
}, []);

const OUT = TAKEN.filter((k) => k >= 0).length;
const RUN = TREND.filter((d) => d.recent).length;

/**
 * The diary's strokes: three to five per entry, of uneven length, the way
 * lines of writing are. Worked out from the column's index rather than
 * drawn at random, so the server and the browser draw the same ones — and
 * deliberately from nothing else: a stroke count that followed TREND would
 * make the diary's length look like the thing being measured.
 */
const STROKES: readonly (readonly number[])[] = TREND.map((_, i) =>
  Array.from(
    { length: 3 + ((i * 7 + 3) % 3) },
    (_, j) => 52 + ((i * 13 + j * 29) % 49),
  ),
);

const COLUMNS = { gridTemplateColumns: `repeat(${TREND.length}, minmax(0, 1fr))` };

export function ChangeFigure({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const reduce = useReducedMotion();

  /*
   * One set of variants, each taking its own delay. Reduced motion keeps
   * the hidden states it can fade from and drops every travel and delay, so
   * the figure arrives whole.
   */
  const at = (delay: number, duration = 0.5) =>
    reduce ? { duration: 0.3 } : { duration, ease: EXPO_OUT, delay };

  const fade: Variants = {
    hidden: { opacity: 0 },
    show: (delay: number) => ({ opacity: 1, transition: at(delay) }),
  };
  const settle: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 6 },
    show: (delay: number) => ({ opacity: 1, y: 0, transition: at(delay) }),
  };
  const drop: Variants = {
    hidden: { opacity: reduce ? 0 : 1, scaleY: reduce ? 1 : 0 },
    show: (delay: number) => ({
      opacity: 1,
      scaleY: 1,
      transition: at(delay, 0.6),
    }),
  };
  const land: Variants = {
    hidden: {
      opacity: 0,
      scale: reduce ? 1 : 0.4,
      filter: reduce ? "blur(0px)" : "blur(4px)",
    },
    show: (delay: number) => ({
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: at(delay, 0.7),
    }),
  };

  return (
    <figure>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="flex flex-col"
      >
        <StepHead n="01" step={copy.steps[0]} />

        {/* 01 — the diary. Decorative: the caption above says what it is. */}
        <div aria-hidden className="mt-4 grid" style={COLUMNS}>
          {STROKES.map((lines, i) => (
            <motion.span
              key={i}
              variants={fade}
              custom={i * 0.025}
              className="flex flex-col gap-[6px] px-[14%]"
            >
              {lines.map((w, j) => (
                <span
                  key={j}
                  className="block h-[1.5px] rounded-full bg-ink/30"
                  style={{ width: `${w}%` }}
                />
              ))}
            </motion.span>
          ))}
        </div>

        <StepHead n="02" step={copy.steps[1]} className="mt-10" />

        {/*
          02 and 03 are one block with no gap between them, so a line that
          leaves a dot in 02 arrives in 03 unbroken. The rule between the
          two rows is the only thing it crosses.
        */}
        <div aria-hidden className="mt-4">
          <div className="relative h-44 sm:h-60">
            {/*
              The student's own range. A band and not a line, for the reason
              the step-04 screen gives: a single threshold would read as a
              cut-off a student is above or below — a level by another name.
            */}
            <motion.span
              variants={fade}
              custom={0.3}
              className="absolute inset-x-0 border-y border-accent/40 bg-accent/15"
              style={{
                bottom: `${BASELINE.from}%`,
                height: `${BASELINE.to - BASELINE.from}%`,
              }}
            />
            <div className="absolute inset-0 grid" style={COLUMNS}>
              {TREND.map((day, i) => {
                const out = TAKEN[i] >= 0;
                return (
                  <span key={i} className="relative">
                    {out && (
                      <motion.span
                        variants={drop}
                        custom={1.0 + TAKEN[i] * 0.08}
                        className="absolute bottom-0 left-1/2 w-px origin-top -translate-x-1/2 bg-mark-1/50"
                        style={{ height: `${day.h}%` }}
                      />
                    )}
                    <motion.span
                      variants={settle}
                      custom={0.4 + i * 0.03}
                      className={`absolute left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full ${
                        out ? "bg-mark-1" : "bg-ink/30"
                      }`}
                      style={{ bottom: `${day.h}%` }}
                    />
                  </span>
                );
              })}
            </div>
          </div>

          {/* 03 — what is taken out. Most of this row is empty on purpose. */}
          <div className="grid h-14 border-t border-line" style={COLUMNS}>
            {TAKEN.map((k, i) =>
              k < 0 ? (
                <span key={i} />
              ) : (
                <span key={i} className="relative">
                  <motion.span
                    variants={drop}
                    /* After the line above it, so the two read as one
                       line falling through the rule. */
                    custom={1.25 + k * 0.08}
                    className="absolute left-1/2 top-0 h-1/2 w-px origin-top -translate-x-1/2 bg-mark-1/50"
                  />
                  <motion.span
                    variants={land}
                    custom={1.5 + k * 0.08}
                    className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mark-1"
                  />
                </span>
              ),
            )}
          </div>
        </div>

        <StepHead n="03" step={copy.steps[2]} className="mt-3" />
      </motion.div>

      <p className="sr-only">{copy.spoken(TREND.length, OUT, RUN)}</p>

      <figcaption className="mt-7 border-t border-line pt-4 text-[0.78rem] leading-relaxed text-muted">
        {copy.note}
      </figcaption>
    </figure>
  );
}

/**
 * A step's caption: its numeral in the mark colour, as 仕組み sets its own,
 * then what the row is, then the one thing to know about it. On one line
 * where there is room, and wrapping after the label where there is not.
 */
function StepHead({
  n,
  step,
  className = "",
}: {
  n: string;
  step: Step;
  className?: string;
}) {
  return (
    <p
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-0.5 ${className}`}
    >
      <span className="text-[0.85rem] font-medium tabular-nums text-mark-1">
        {n}
      </span>
      <span className="text-[0.95rem] font-medium text-ink">{step.label}</span>
      <span className="text-[0.8rem] text-muted">{step.note}</span>
    </p>
  );
}
