"use client";

import type { MotionValue } from "motion/react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { Icon } from "@/components/ui";

/**
 * One screen per step of 仕組み, so the section shows what each stage looks
 * like rather than only describing it.
 *
 * These were drawn for an 11rem well inside a card and are now the large
 * half of a two-column block, so every size is up a step and each one lays
 * itself out across the width rather than down a narrow column. They are
 * still reductions rather than copies of the プロダクト screens — one idea
 * each — and every student is a class-and-number, exactly as the real report
 * is.
 *
 * Each lives inside an aria-hidden <Panel>, so the claim a screen
 * illustrates is written out in the copy beside it.
 *
 * None of them is scroll-linked, on purpose: every step block is wrapped in
 * a <Reveal>, and an ancestor that is still animating a translate would be
 * measured mid-flight by useScroll. They run once on entry instead.
 */

/** 01 — every student, not a self-selecting few. */
export function RosterMock() {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-full items-center gap-6 p-6 md:gap-10 md:p-8">
      <div className="shrink-0">
        <p className="text-[0.8rem] text-muted">3年2組</p>
        <p className="mt-1 text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium tracking-[-0.02em] tabular-nums text-ink">
          全40名
        </p>
      </div>

      {/*
        Forty cells, one per student, filling in together: the point of the
        step is that the class is the unit, so the block has to read as whole
        rather than as a sample.
      */}
      <div className="grid flex-1 grid-cols-10 gap-1.5 md:gap-2">
        {Array.from({ length: 40 }, (_, i) => (
          <motion.span
            key={i}
            className="aspect-square rounded-[4px] bg-mark-1"
            initial={{ opacity: reduce ? 0.85 : 0.15 }}
            whileInView={{ opacity: 0.85 }}
            viewport={VIEWPORT}
            transition={
              reduce ? { duration: 0 } : { duration: 0.4, ease: EXPO_OUT, delay: i * 0.012 }
            }
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 02 — the diary, being written                                              */
/* -------------------------------------------------------------------------- */

/**
 * The entry, authored as two short lines.
 *
 * It is split rather than left to wrap because the typing is drawn by
 * sliding a cover off each line, and a cover can only uncover one line at a
 * time — a wrapped second line would start revealing before the first
 * finished. Two authored lines of 8 and 12 characters never wrap at any
 * width this panel reaches, so the effect is exact on a phone and on a
 * desktop, and short lines are how a diary looks anyway.
 */
const TYPED_LINES = ["部活がきつくて、", "最近あんまり眠れてない。"] as const;

/** Derived, never typed out: the count and the text cannot drift apart. */
const TYPED_CHARS = TYPED_LINES.reduce((n, line) => n + [...line].length, 0);

/** Where each line's share of the typing starts and ends, by character. */
const LINE_SPANS = TYPED_LINES.map((line, i) => {
  const before = TYPED_LINES.slice(0, i).reduce((n, l) => n + [...l].length, 0);
  return {
    text: line,
    from: before / TYPED_CHARS,
    to: (before + [...line].length) / TYPED_CHARS,
  };
});

/**
 * One line of the entry, uncovered by a block sliding off to the right.
 *
 * The cover is the well's own colour, so the text behind it is simply not
 * there yet, and the caret is the cover's leading edge — which means the
 * caret is always exactly at the last character typed without anything
 * having to measure a glyph. One transform per line, no layout per frame,
 * and the real text stays in the DOM the whole time.
 */
function TypedLine({
  span,
  progress,
  reduce,
}: {
  span: (typeof LINE_SPANS)[number];
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const x = useTransform(progress, [span.from, span.to], ["0%", "100%"], {
    clamp: true,
  });
  /*
   * The caret belongs to whichever line is being written, so it switches on
   * at that line's first character and off at its last. The final line's
   * range ends at 1, so its caret is what stays behind at rest — which is
   * the static caret this panel had before, in the same place.
   */
  const caret = useTransform(
    progress,
    [span.from - 0.0001, span.from, span.to, span.to + 0.0001],
    [0, 1, 1, 0],
  );

  return (
    <span className="relative block w-fit">
      {span.text}
      {reduce ? (
        // End state: the line is written, and only the last line keeps a
        // caret — the same thing the animation leaves behind.
        span.to === 1 && (
          <span className="absolute inset-y-[0.45em] -right-px w-px bg-mark-1" />
        )
      ) : (
        <motion.span
          className="absolute inset-y-0 left-0 w-full"
          style={{ x }}
          aria-hidden
        >
          <motion.span
            className="absolute inset-y-[0.45em] left-0 w-px bg-mark-1"
            style={{ opacity: caret }}
          />
          <span className="absolute inset-y-0 left-px w-full bg-inset" />
        </motion.span>
      )}
    </span>
  );
}

export function DiaryMock() {
  const reduce = useReducedMotion();
  /**
   * Characters typed, 0–1. A motion value rather than state: the counter and
   * both covers read from it every frame without a single React render.
   */
  const progress = useMotionValue(0);
  const count = useTransform(progress, (v) => Math.round(v * TYPED_CHARS));

  return (
    <motion.div
      className="flex h-full flex-col gap-3 p-6 md:p-8"
      viewport={{ once: true, amount: 0.4 }}
      onViewportEnter={() => {
        // Reduced motion gets the finished entry, not a faster one.
        if (reduce) return progress.set(1);
        animate(progress, 1, { duration: 1.7, ease: "linear", delay: 0.25 });
      }}
    >
      <p className="text-[0.78rem] tabular-nums text-muted">8月20日（木）</p>
      <p className="text-[0.95rem] font-medium tracking-[-0.01em] text-ink">
        今日はどんな一日だった？
      </p>

      {/* overflow-hidden so a cover that has slid clear of its line is
          clipped by the well rather than painting inset colour across the
          panel beside it. */}
      {/*
        p-4 at every width, not md:p-5: the entry is two lines plus a counter
        and the desktop panel spends 16px more on its own padding, so the
        wider well is exactly where the content stopped fitting.
      */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-inset p-4">
        <p className="text-[0.9rem] leading-[1.9] text-ink">
          {LINE_SPANS.map((span) => (
            <TypedLine
              key={span.text}
              span={span}
              progress={progress}
              reduce={!!reduce}
            />
          ))}
        </p>
        <span className="mt-auto pt-3 text-right text-[0.72rem] tabular-nums text-muted">
          {/* Counted up from the same value that draws the text, so the
              number on screen is always the number of characters visible. */}
          <motion.span>{count}</motion.span>字
        </span>
      </div>
    </motion.div>
  );
}

/** 03 — one question back, not a conversation. */
export function ProbeMock() {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6 md:p-8">
      <div className="ml-auto max-w-[70%] rounded-xl rounded-br-sm bg-inset px-4 py-3 text-[0.9rem] leading-relaxed text-muted">
        …たぶん大丈夫。
      </div>

      <motion.div
        className="max-w-[82%] rounded-xl rounded-bl-sm bg-accent/10 px-4 py-3.5"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{
          duration: reduce ? 0.3 : 0.6,
          ease: reduce ? "linear" : EXPO_OUT,
          delay: reduce ? 0 : 0.35,
        }}
      >
        <p className="flex items-center gap-1.5 text-[0.72rem] font-medium tracking-[0.06em] text-mark-1">
          <Icon name="auto_awesome" size={13} className="shrink-0" />
          AIからの問いかけ
        </p>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-ink">
          「あんまり眠れてない」のは、いつごろから？
        </p>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 04 — one bad day against a run of them                                     */
/* -------------------------------------------------------------------------- */

/**
 * What replaced the three labelled bars.
 *
 * Those bars were 言葉のニュアンス / 書きためらいの間 / 日々の書きぶりの変化 —
 * the same three phrases the step's own copy lists, at invented lengths that
 * looked like model weights and weren't. The copy's second claim had no
 * picture at all: 「書き重ねられるからこそ、一日の落ち込みと、続いている不調
 * とを区別できます」. That claim is about time, and time is the one thing a
 * single screen cannot assert — so this step now shows the axis the rest of
 * the page doesn't have.
 *
 * A spike on its own stays in the neutral mark; four rising days together
 * are what the report escalates. Nothing here is a measurement of anything
 * real, and the figure carries no numbers for that reason — it is the shape
 * of the distinction, and the distinction is what the copy beside it claims.
 */
const DAYS = [
  { h: 26 },
  { h: 20 },
  { h: 33 },
  // The isolated day. Tall, and deliberately not flagged.
  { h: 80, note: "一日の落ち込み" },
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

const RUN_START = DAYS.findIndex((d) => d.run);
const RUN_LENGTH = DAYS.filter((d) => d.run).length;
const SPIKE = DAYS.findIndex((d) => d.note);

export function TrendMock() {
  const reduce = useReducedMotion();

  const bar = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, y: 8 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: EXPO_OUT },
        },
      };

  return (
    <motion.div
      className="flex h-full flex-col p-6 md:p-8"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        show: { transition: { staggerChildren: reduce ? 0 : 0.035 } },
      }}
    >
      <p className="text-[0.78rem] text-muted">心理的リスクの推移</p>

      {/*
        One column per entry, bottom-aligned. Heights are styles, not
        animations: the bars arrive with the page's own fade-and-rise rather
        than growing, so no frame animates a height.
      */}
      <div className="mt-4 flex flex-1 items-end gap-[3px] md:gap-1">
        {DAYS.map((day, i) => (
          <motion.span
            key={i}
            variants={bar}
            /* flex-1 with the same gap as the label grids below gives the
               same fourteen tracks, and a flex item's percentage height
               resolves against this row's own definite height — a grid row
               sized by auto would collapse every bar to nothing. */
            className={`block min-w-0 flex-1 rounded-t-[2px] ${
              day.run ? "bg-risk-high" : "bg-mark-1"
            }`}
            style={{ height: `${day.h}%` }}
          />
        ))}
      </div>

      {/* The two underlines, on the same 14-column track as the bars, so
          each sits exactly under what it names. */}
      <div className="mt-2 grid grid-cols-14 gap-[3px] md:gap-1">
        <motion.span
          variants={bar}
          className="col-span-1 h-px bg-mark-1"
          style={{ gridColumnStart: SPIKE + 1 }}
        />
        <motion.span
          variants={bar}
          className="h-px bg-risk-high"
          style={{
            gridColumnStart: RUN_START + 1,
            gridColumnEnd: RUN_START + 1 + RUN_LENGTH,
          }}
        />
      </div>

      {/*
        Labels are centred on their own span and allowed to overrun it — a
        seven-character label is wider than one fourteenth of the panel, and
        the panel has room on both sides of both marks at every width it is
        drawn at.
      */}
      <div className="mt-1.5 grid h-4 grid-cols-14 gap-[3px] text-[0.72rem] md:gap-1">
        <motion.span
          variants={bar}
          className="relative col-span-1"
          style={{ gridColumnStart: SPIKE + 1 }}
        >
          <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-muted">
            {DAYS[SPIKE].note}
          </span>
        </motion.span>
        <motion.span
          variants={bar}
          className="relative"
          style={{
            gridColumnStart: RUN_START + 1,
            gridColumnEnd: RUN_START + 1 + RUN_LENGTH,
          }}
        >
          <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-medium text-risk-high-text">
            続いている不調
          </span>
        </motion.span>
      </div>
    </motion.div>
  );
}
