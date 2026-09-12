"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";

/**
 * Thirty-eight marks for thirty-eight countries, with the thirty-seventh
 * picked out and named. Every mark is the same height on purpose: giving them
 * descending heights would look like a chart of per-country scores, and we
 * publish no such numbers.
 *
 * What it adds to the figure beside it is the one thing a number cannot say on
 * its own — where 37 sits. So the scale is built left to right as you arrive:
 * the marks rise out of the axis in order, the reader's eye is carried along
 * the ranking, and the tall coloured mark lands almost at the end of that
 * sweep. The 日本 label is held back until the sweep has reached it, so the
 * naming is the last thing to happen rather than a caption that was always
 * there. Read a second time it is just a scale; read once, it is the argument.
 *
 * Decorative — the figure and its label carry all three facts — so the whole
 * thing is aria-hidden, axis labels included.
 */

const COUNTRY_COUNT = 38;
const JAPAN_RANK = 37;

/** Shared by the label row and the mark row so their grid lines agree. */
const SCALE_COLUMNS = {
  gridTemplateColumns: `repeat(${COUNTRY_COUNT}, minmax(0, 1fr))`,
};

/**
 * 14ms a mark. Thirty-eight of them is a 520ms sweep — fast enough to read as
 * one gesture rather than thirty-eight events, slow enough that the direction
 * is unmistakable.
 */
const MARK_STAGGER = 0.014;

/**
 * The sweep waits for the panel it sits in. The whole panel enters on a 0.7s
 * fade, rise and 4px defocus, and a sweep started under that is a sweep nobody
 * can quite see — so it begins as the blur clears.
 */
const SWEEP_DELAY = 0.18;

/** When the sweep passes rank 37, plus a beat. */
const LABEL_DELAY = SWEEP_DELAY + MARK_STAGGER * JAPAN_RANK + 0.12;

/*
 * scaleY from a bottom origin rather than an animated height: height would
 * relayout the grid thirty-eight times a frame, and the marks have to grow out
 * of a shared baseline for the sweep to read as a scale filling in. 0.45 is as
 * low as the start can go before a 4px corner radius on a squashed pill starts
 * looking like a blob rather than a short mark.
 */
const markVariants = (reduce: boolean): Variants =>
  reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, scaleY: 0.45 },
        show: {
          opacity: 1,
          scaleY: 1,
          transition: { duration: 0.5, ease: EXPO_OUT },
        },
      };

const rowVariants = (reduce: boolean): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: reduce ? 0 : MARK_STAGGER,
      delayChildren: reduce ? 0 : SWEEP_DELAY,
    },
  },
});

const lateVariants = (reduce: boolean, delay: number): Variants =>
  reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, y: 6 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: EXPO_OUT, delay },
        },
      };

export function RankScale() {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      aria-hidden
      className="mt-7"
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{ hidden: {}, show: {} }}
    >
      {/*
        The label's grid span ends on line 38, which is the right edge of the
        37th column, so right-aligning it inside that span lands its final
        character directly above Japan's mark. It also carries the same colour
        as that mark, which is what ties the two together at a glance.
      */}
      <div className="grid gap-x-[2px]" style={SCALE_COLUMNS}>
        <motion.span
          className="justify-self-end whitespace-nowrap text-right text-[0.75rem] font-medium text-mark-1"
          style={{ gridColumn: `${JAPAN_RANK - 9} / ${JAPAN_RANK + 1}` }}
          variants={lateVariants(reduce, LABEL_DELAY)}
        >
          日本
        </motion.span>
      </div>

      <motion.div
        className="mt-1.5 grid items-end gap-x-[2px]"
        style={SCALE_COLUMNS}
        variants={rowVariants(reduce)}
      >
        {Array.from({ length: COUNTRY_COUNT }, (_, i) => (
          <motion.span
            key={i}
            className={`origin-bottom ${
              i + 1 === JAPAN_RANK ? "h-10 rounded-full bg-mark-1" : "h-6 rounded-full bg-ink/20"
            }`}
            variants={markVariants(reduce)}
          />
        ))}
      </motion.div>

      {/*
        The axis arrives with the label, after the sweep: printed up front it
        would be a pair of numbers to read before anything has happened, and
        the sweep itself already says which end is which.
      */}
      <motion.div
        className="mt-2.5 flex justify-between text-[0.75rem] text-muted"
        variants={lateVariants(reduce, LABEL_DELAY)}
      >
        <span>1位</span>
        <span>38位</span>
      </motion.div>
    </motion.div>
  );
}
