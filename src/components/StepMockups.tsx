"use client";

import { motion, useReducedMotion } from "motion/react";
import { Logo } from "@/components/Logo";
import { Bar, Chip, Composer, Row, Screen } from "@/components/mock";
import { Icon } from "@/components/ui";
import {
  CLASS,
  ENTRY,
  ENTRY_LENGTH,
  ENTRY_TAIL,
  ROWS,
  STUDENT_BAR,
  TREND,
  TREND_TITLE,
} from "@/lib/sample";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";

/**
 * One screen per step of 仕組み.
 *
 * Each of these is a *window*, not a diagram: a title bar, one idea, a foot,
 * drawn with the <Screen> primitives so four of them read as four views of
 * one product. What they replaced was half-figure, half-caption — a bar chart
 * with the sentence's own words printed beside it, a survey control with its
 * controls labelled — which reads as explanation rather than as software.
 *
 * So there is nothing annotated here. No arrows, no legends, no labels pasted
 * over a picture to say what it means: the <Caption> under each panel carries
 * the claim in real text, which is also the only way the claim reaches a
 * screen reader, since every <Frame> is aria-hidden.
 *
 * Every string is sample data from @/lib/sample or a word the interface
 * itself says (a button, a title). Students are a class and a roll number.
 *
 * Motion is one beat per screen at most, on view, once, ~0.5s on the expo
 * curve, and under prefers-reduced-motion each one renders its end state.
 * None of them is scroll-linked, on purpose: every card is wrapped in a
 * <RevealItem>, and an ancestor that is still animating a translate would be
 * measured mid-flight by useScroll.
 */

/* -------------------------------------------------------------------------- */
/* 01 — the class is the unit                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One cell per student, filling in together.
 *
 * A roster is the obvious screen for 全生徒が対象, and a roster is a list of
 * names — which this site does not have and will not invent. A class-shaped
 * grid says the same thing with nothing in it: forty identical cells, no
 * ordering, no state, nothing that could be read as a measurement of any
 * student.
 */
export function RosterMock() {
  const reduce = useReducedMotion();

  return (
    <Screen title={CLASS.label} trailing={<Chip>{CLASS.size}</Chip>}>
      <div className="my-auto grid grid-cols-10 gap-1 sm:gap-1.5">
        {Array.from({ length: CLASS.count }, (_, i) => (
          <motion.span
            key={i}
            className="aspect-square rounded-[3px] bg-mark-1"
            initial={{ opacity: reduce ? 0.85 : 0.12 }}
            whileInView={{ opacity: 0.85 }}
            viewport={VIEWPORT}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.4, ease: EXPO_OUT, delay: i * 0.012 }
            }
          />
        ))}
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------------------- */
/* 02 — the diary                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The writing screen, mid-entry.
 *
 * The caret at the end of the text is what says "being written" — it is true
 * at rest, so nothing has to animate to make the point, and there is no
 * blinking loop on the page. The counter is derived from the entry itself, so
 * the number on screen is always the number of characters above it.
 *
 * The foot is the whole reason a student writes honestly, which is why it is
 * in the mockup rather than only in the prose: their text does not leave, and
 * they are the one who presses submit.
 */
export function DiaryMock() {
  return (
    <Screen
      title={<Logo className="h-3 w-auto shrink-0" />}
      trailing={
        <span className="shrink-0 text-[0.7rem] tabular-nums text-muted">
          {ENTRY.date}
        </span>
      }
      footer={<Composer note={STUDENT_BAR.note} action={STUDENT_BAR.action} />}
    >
      <p className="text-[0.78rem] font-medium tracking-[-0.01em] text-ink lg:text-[0.85rem]">
        {ENTRY.prompt}
      </p>

      {/* The writing surface takes whatever height is left: a diary is mostly
          the space to write in. */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-inset p-2.5">
        <p className="text-[0.78rem] leading-[1.85] text-ink lg:text-[0.85rem]">
          {ENTRY.body}
          {/* Static, and the only thing here that is not type: the insertion
              point where the student stopped. */}
          <span className="ml-px inline-block h-[0.9em] w-px translate-y-[0.1em] bg-mark-1" />
        </p>
        <span className="mt-auto pt-1.5 text-right text-[0.66rem] tabular-nums text-muted">
          {ENTRY_LENGTH}字
        </span>
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------------------- */
/* 03 — one question back                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The last line of the entry, and the single question it gets back.
 *
 * Same chrome as the diary, because it is the same screen a moment later
 * rather than a second product — and only two bubbles in it, because one
 * question back is the whole of what the AI sends. A thread of four would be
 * a chat app, which is the one thing this is not.
 *
 * The question arriving is the one beat in this section worth animating, so it
 * is the only screen here that moves on its own.
 */
export function ProbeMock() {
  const reduce = useReducedMotion();

  return (
    <Screen
      title={<Logo className="h-3 w-auto shrink-0" />}
      trailing={
        <span className="shrink-0 text-[0.7rem] tabular-nums text-muted">
          {ENTRY.date}
        </span>
      }
    >
      <div className="my-auto flex flex-col gap-2.5">
        <span className="ml-auto w-fit max-w-[78%] rounded-xl rounded-br-sm bg-inset px-3 py-2 text-[0.78rem] leading-relaxed text-muted lg:text-[0.85rem]">
          {ENTRY_TAIL}
        </span>

        <motion.div
          className="max-w-[92%] rounded-xl rounded-bl-sm bg-accent/10 px-3 py-2.5"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{
            duration: reduce ? 0.3 : 0.6,
            ease: reduce ? "linear" : EXPO_OUT,
            delay: reduce ? 0 : 0.3,
          }}
        >
          {/*
            mark-1, not accent: #85c0ed is a fill colour and measures 1.87:1
            as text on the light ground, while mark-1 flips with the theme.
          */}
          <p className="flex items-center gap-1 text-[0.66rem] font-medium tracking-[0.06em] text-mark-1">
            <Icon name="auto_awesome" size={12} className="shrink-0" />
            AIからの問いかけ
          </p>
          <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink lg:text-[0.9rem]">
            {ENTRY.followUp}
          </p>
        </motion.div>
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------------------- */
/* 04 — a bad day against a run of them                                       */
/* -------------------------------------------------------------------------- */

/**
 * The analysis, and the one line it produces.
 *
 * Time is the thing a single screen cannot assert, and it is exactly what the
 * step claims: 書き重ねられるからこそ、一日の落ち込みと、続いている不調とを区別
 * できます。So the chart is an axis of entries, one tall day standing alone in
 * the neutral mark and a run of rising days in the risk colour — the shape of
 * the distinction, carrying no numbers, because it is not a measurement of
 * anything real.
 *
 * The foot is what comes out: a class, a roll number, a level. The same row
 * the teacher's report opens with, imported rather than restated, so the two
 * screens cannot come to disagree.
 */
export function TrendMock() {
  const reduce = useReducedMotion();
  const flagged = ROWS[0];

  const bar = reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.3 } },
      }
    : {
        hidden: { opacity: 0, y: 6 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: EXPO_OUT },
        },
      };

  return (
    <Screen
      title={TREND_TITLE}
      footer={
        /*
          data-thread marks this row as the point the signal thread leaves
          from on its way to the report: the page's thread layer finds it by
          this attribute and nothing else here knows the thread exists.
        */
        <div data-thread="analysis" className="w-full">
          <Row
            klass={flagged.klass}
            no={flagged.no}
            trailing={<Chip tone="risk">{flagged.level}</Chip>}
            className="w-full"
          >
            <Bar pct={flagged.width} tone="risk-high" />
          </Row>
        </div>
      }
    >
      {/*
        One column per entry, bottom-aligned. The heights are styles, not
        animations: the bars arrive with a fade and a small rise rather than
        growing, so no frame animates a height.
      */}
      <motion.div
        className="flex min-h-0 flex-1 items-end gap-[2px] pt-1 sm:gap-[3px]"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={{
          show: { transition: { staggerChildren: reduce ? 0 : 0.03 } },
        }}
      >
        {TREND.map((day, i) => (
          <motion.span
            key={i}
            variants={bar}
            /* flex-1 rather than a grid track: a flex item's percentage
               height resolves against this row's own definite height, where
               an auto-sized grid row would collapse every bar to nothing. */
            className={`block min-w-0 flex-1 rounded-t-[2px] ${
              day.run ? "bg-risk-high" : "bg-mark-1"
            }`}
            style={{ height: `${day.h}%` }}
          />
        ))}
      </motion.div>
    </Screen>
  );
}
