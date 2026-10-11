"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/LocaleProvider";
import { Logo } from "@/components/Logo";
import { Chip, Composer, Screen } from "@/components/mock";
import { Icon } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import {
  BASIS,
  BASELINE,
  CLASS,
  ENTRY,
  ENTRY_COUNT,
  ENTRY_TAIL,
  OBSERVATION_LABEL,
  ROWS,
  SCREEN_WORDS,
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
 * over a picture to say what it means — but every screen has to be readable
 * without the text beside it, because in 仕組み's pinned layout only one of
 * them is on screen at a time and the reader's eye is on it. That is done
 * with the words a real interface would print (a class name, a column head,
 * a button), and whose screen it is goes on the <Frame> around it, never in
 * here. The step's own text carries the claim, which is also the only way
 * the claim reaches a screen reader, since every <Frame> is aria-hidden.
 *
 * Every string is sample data from @/lib/sample or a word the interface
 * itself says (a button, a title, a column head), and that module holds
 * each of them in Japanese and in English. Students are a class and a
 * roll number.
 *
 * The screens speak the page's language: each one asks useLocale() and
 * picks its strings with it. The windows themselves — sizes, chrome,
 * motion — are the same in both, with one exception, the diary's leading
 * (ENTRY_TEXT below).
 *
 * Motion is one beat per screen at most, on view, ~0.5s on the expo curve,
 * and under prefers-reduced-motion each one lands on its end state without
 * travelling. The starting state is the same either way and only the
 * transition reads the setting: the starting state is written into the
 * server HTML, which cannot know the setting, so a reduced-motion start would
 * disagree with it on hydration. A transition is only read when the beat
 * fires, after hydration, so motion's useReducedMotion is the right flag for
 * it here. None of them is scroll-linked, on purpose: each sits inside a
 * <Reveal>, and an ancestor that is still animating a translate would be
 * measured mid-flight by useScroll. 仕組み remounts a screen each time its
 * step becomes the active one in the pinned layout, which is what lets a
 * beat play when the screen is actually shown rather than while it was
 * stacked out of sight.
 */

/**
 * The entry as it sits on the writing surface. Written out in full for each
 * language — Tailwind only generates classes it can read.
 *
 * The size is the same in both. The leading is not: 1.85 is the air kana
 * and kanji need at this size, and on Latin type it reads as double
 * spacing. It also costs height the English does not have — the same entry
 * runs a line longer in English (four lines to the Japanese three on a
 * 360px phone), and the surface is whatever the window has left. So English
 * is set at 1.65, and 仕組み gives its windows a little more height on a
 * phone (FRAME in HowItWorks), which together keep the counter under the
 * entry inside the surface down to 320px.
 */
const ENTRY_TEXT: Record<Locale, string> = {
  ja: "text-[0.78rem] leading-[1.85] text-ink lg:text-[0.85rem]",
  en: "text-[0.78rem] leading-[1.65] text-ink lg:text-[0.85rem]",
};

/* -------------------------------------------------------------------------- */
/* 01 — the class is the unit                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The class list: every roll number in the class, all of them lit.
 *
 * 全生徒が対象 is a claim about the unit being the whole class rather than the
 * students who volunteer, so the screen is the class. The version before
 * this was forty identical blue squares, which said nothing until you had
 * read the caption — a reviewer saw a grid of tiles and could not say what
 * it was. Numbering the cells is what makes it a class: 3年2組, 全40名, a
 * column head that says 出席番号, and 1 to 40 underneath it. Every cell is
 * drawn the same way, because the point is that nobody is left out, and
 * nothing about any one cell could be read as a state or a measurement of
 * that student.
 *
 * Numbers, never names: a roll number is how the whole site refers to a
 * student, and the count comes from the sample class rather than being
 * typed out here.
 *
 * The beat is the list filling in together — each cell from faint to full,
 * a few milliseconds apart — on the parent, so forty cells cost one
 * observer rather than forty.
 */
export function ClassMock() {
  const reduce = useReducedMotion();
  const locale = useLocale();

  const cell = {
    hidden: { opacity: 0.2 },
    show: {
      opacity: 1,
      transition: reduce ? { duration: 0 } : { duration: 0.4, ease: EXPO_OUT },
    },
  };

  return (
    <Screen
      title={CLASS[locale].label}
      trailing={<Chip tone="accent">{CLASS[locale].size}</Chip>}
    >
      <div className="my-auto">
        <p className="text-[0.66rem] text-muted lg:text-[0.7rem]">
          {SCREEN_WORDS[locale].rollNumber}
        </p>
        <motion.div
          className="mt-2 grid grid-cols-10 gap-1 sm:gap-1.5"
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={{
            show: { transition: { staggerChildren: reduce ? 0 : 0.012 } },
          }}
        >
          {Array.from({ length: CLASS.count }, (_, i) => (
            <motion.span
              key={i}
              variants={cell}
              className="flex aspect-square min-w-0 items-center justify-center rounded-[4px] bg-accent/15 text-[0.62rem] font-medium tabular-nums text-mark-1 lg:text-[0.7rem]"
            >
              {i + 1}
            </motion.span>
          ))}
        </motion.div>
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
  const locale = useLocale();
  const entry = ENTRY[locale];
  const bar = STUDENT_BAR[locale];

  return (
    <Screen
      title={<Logo className="h-3 w-auto shrink-0" />}
      trailing={
        <span className="shrink-0 text-[0.7rem] tabular-nums text-muted">
          {entry.date}
        </span>
      }
      footer={<Composer note={bar.note} action={bar.action} />}
    >
      <p className="text-[0.78rem] font-medium tracking-[-0.01em] text-ink lg:text-[0.85rem]">
        {entry.prompt}
      </p>

      {/* The writing surface takes whatever height is left: a diary is mostly
          the space to write in. */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-inset p-2.5">
        <p className={ENTRY_TEXT[locale]}>
          {entry.body}
          {/* Static, and the only thing here that is not type: the insertion
              point where the student stopped. */}
          <span className="ml-px inline-block h-[0.9em] w-px translate-y-[0.1em] bg-mark-1" />
        </p>
        <span className="mt-auto pt-1.5 text-right text-[0.66rem] tabular-nums text-muted">
          {ENTRY_COUNT[locale]}
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
 * The question arriving is the whole of this step, so the bubble is the one
 * thing on this screen that moves. It is held back 0.3s, which in the pinned
 * layout is long enough for the screen to be mostly faded in before the
 * question starts to arrive.
 */
export function ProbeMock() {
  const reduce = useReducedMotion();
  const locale = useLocale();
  const entry = ENTRY[locale];

  return (
    <Screen
      title={<Logo className="h-3 w-auto shrink-0" />}
      trailing={
        <span className="shrink-0 text-[0.7rem] tabular-nums text-muted">
          {entry.date}
        </span>
      }
    >
      <div className="my-auto flex flex-col gap-2.5">
        <span className="ml-auto w-fit max-w-[78%] rounded-xl rounded-br-sm bg-inset px-3 py-2 text-[0.78rem] leading-relaxed text-muted lg:text-[0.85rem]">
          {ENTRY_TAIL[locale]}
        </span>

        <motion.div
          className="max-w-[92%] rounded-xl rounded-bl-sm bg-accent/10 px-3 py-2.5"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          /* Reduced motion keeps the fade and drops the rise: the 8px is
             landed outright while the bubble is still transparent. */
          transition={
            reduce
              ? { duration: 0.3, ease: "linear", y: { duration: 0 } }
              : { duration: 0.6, ease: EXPO_OUT, delay: 0.3 }
          }
        >
          {/*
            mark-1, not accent: #85c0ed is a fill colour and measures 1.95:1
            as text on white, where mark-1 is the same blue taken dark enough
            to read.
          */}
          <p className="flex items-center gap-1 text-[0.66rem] font-medium tracking-[0.06em] text-mark-1">
            <Icon name="auto_awesome" size={12} className="shrink-0" />
            {SCREEN_WORDS[locale].question}
          </p>
          <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink lg:text-[0.9rem]">
            {entry.followUp}
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
 * The student's writing over time, and the one line that comes out of it.
 *
 * Time is the thing a single screen cannot assert, and it is what the step
 * describes: 書き重ねられるからこそ、一日の落ち込みなのか、続いている変化なのか
 * を見分ける手がかりになります。So the chart is an axis of entries against the
 * student's own usual range — the band — with one tall day that returns to
 * it and a recent run that stays outside. It is drawn in the one blue, with
 * no numbers and no labels, because it is not a measurement of anything real
 * and must not read as a score: the product draws no levels for a student,
 * and this picture does not either (docs/claims.md §2).
 *
 * The foot is what the teacher receives from the latest entry: a class and
 * roll number, a time and surface, an observation and its basis — the first
 * row of the teacher's screen in プロダクト, imported rather than restated,
 * so the two cannot disagree.
 */
export function TrendMock() {
  const reduce = useReducedMotion();
  const locale = useLocale();
  const latest = ROWS[locale][0];

  /* The same hidden state either way; reduced motion fades the bars in
     together and lands the 6px rise outright rather than playing it. */
  const bar = {
    hidden: { opacity: 0, y: 6 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0.3, y: { duration: 0 } }
        : { duration: 0.5, ease: EXPO_OUT },
    },
  };

  return (
    <Screen
      title={TREND_TITLE[locale]}
      footer={
        /*
          No data-thread here, though this row is what the signal thread
          carries on to the teacher's screen. The thread measures its anchor
          by layout offsets, and in 仕組み's pinned layout this window sits
          in a sticky box, whose offsets change with the scroll position they
          are measured at — so the anchor is 仕組み's own box for step 04,
          which is not sticky. See HowItWorks.
        */
        <div className="w-full min-w-0">
          {/*
            The same three lines the teacher's row carries — who and when,
            what was observed, on what basis — because an observation is only
            shown with its time and its basis (docs/claims.md §2), and a
            shortened one can say the opposite of the real one: cut at the
            card's width, 苦痛の表現（危険の明示なし） loses its なし. So the
            observation wraps instead of truncating; the chart above is
            flex-1 and gives up the height. In English it does wrap, to two
            lines wherever the window is narrower than about 400px, and the
            chart is that much shorter.
          */}
          <p className="flex min-w-0 items-baseline gap-2 text-[0.66rem] tabular-nums text-muted">
            <span className="shrink-0 text-ink">
              {latest.klass} {latest.no}
            </span>
            <span className="truncate">
              {latest.at} · {latest.surface}
            </span>
          </p>
          <p className="mt-0.5 text-[0.72rem] leading-snug text-ink">
            {OBSERVATION_LABEL[locale]}: {latest.observation}
          </p>
          <p className="mt-0.5 text-[0.62rem] text-muted">└ {BASIS[locale]}</p>
        </div>
      }
    >
      <div className="relative flex min-h-0 flex-1 pt-1">
        {/*
          The student's usual range. A band rather than a line: a range is
          what "usual" is, and a single threshold would read as a cut-off
          that a student is above or below — a level by another name.
        */}
        <span
          className="absolute inset-x-0 rounded-sm bg-accent/15"
          style={{
            bottom: `${BASELINE.from}%`,
            height: `${BASELINE.to - BASELINE.from}%`,
          }}
        />
        {/*
          One column per entry, bottom-aligned. The heights are styles, not
          animations: the bars arrive with a fade and a small rise rather than
          growing, so no frame animates a height.
        */}
        <motion.div
          className="relative flex min-h-0 flex-1 items-end gap-[2px] sm:gap-[3px]"
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
                day.recent ? "bg-mark-1" : "bg-mark-1/35"
              }`}
              style={{ height: `${day.h}%` }}
            />
          ))}
        </motion.div>
      </div>
    </Screen>
  );
}
