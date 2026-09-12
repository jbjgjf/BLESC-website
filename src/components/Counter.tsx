"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";

/*
 * A mechanical counter, not a count-up.
 *
 * The figures in the 課題 panel used to animate by writing a rounded value to
 * React state on every frame, which has two problems. It re-renders the tree
 * sixty times a second for a piece of decoration, and — more to the point — it
 * shows the reader a stream of numbers that are not the claim: 350,000 arrived
 * by way of 41,228 and 287,515, each of them legible for a frame and none of
 * them true. Now the only values that ever appear in a digit column are the
 * ones on the way round a 0–9 drum, so the figure reads as a counter settling
 * rather than as a number being invented.
 *
 * Per frame this is a translateY on one element per digit and nothing else: no
 * state, no layout, no text measurement.
 */

/**
 * Extra full revolutions a column turns before it lands.
 *
 * Every drum turns at least once and the last one turns twice, so the units
 * column is always the fastest thing on screen — which is what draws the eye to
 * the end of the number first and then back along it as the drums stop. Scaling
 * the turns down across the whole number was tried and is worse: 350,000 has
 * four zeros, and any column whose digit is 0 and whose turn count is 0 has
 * nowhere to travel, so it sits dead still while its neighbours spin.
 */
function turnsFor(indexFromRight: number) {
  return indexFromRight === 0 ? 2 : 1;
}

/**
 * Held back far enough that the drums are not spinning underneath the 4px
 * defocus their own panel enters on, and spaced per column so the figure
 * settles as a wave from the left rather than snapping all at once.
 */
const ENTRY_DELAY = 0.18;
const COLUMN_DELAY = 0.05;

/**
 * One drum.
 *
 * The strip holds every value from 0 up to `turns * 10 + digit`, drawn modulo
 * ten, so its last cell is the digit we are landing on and its first is a zero.
 * Travel is a percentage of the strip's own height, which makes one cell exactly
 * `100 / cells` percent — no pixel measurement, so the column is correct at any
 * clamp() font size and after any resize.
 *
 * It hangs from the BOTTOM of the drum and starts pushed down, so the finished
 * state is `transform: none` and the strip travels upwards into it — the
 * direction a mechanical counter turns when it counts up. Which way round this
 * is matters for more than taste: the page ships a <noscript> rule that forces
 * `transform: none` on every inline-styled node in <main>, and anything that
 * fails to hydrate keeps whatever style was server-rendered. Resting on the
 * first cell would make both of those read 00 and 000,000 — a figure the
 * company does not claim. Resting on the last one means every way this can fail
 * lands on the true number.
 *
 * Cells centre their glyph with flex rather than leaning on line-height. The box
 * is one line box tall, the same as the invisible sizer that gives the figure its
 * width and baseline, and centring the glyph in it reproduces exactly what
 * half-leading does to the sizer — so a resting drum sits on the same baseline
 * as the static text beside it.
 */
function Drum({
  digit,
  indexFromRight,
  duration,
  delay,
  reduce,
}: {
  digit: number;
  indexFromRight: number;
  duration: number;
  delay: number;
  reduce: boolean;
}) {
  const steps = turnsFor(indexFromRight) * 10 + digit;
  const cells = steps + 1;

  /*
   * Reduced motion collapses the start onto the end rather than dropping the
   * drum: the figure is simply printed, because the end of the roll is the
   * digit. Done by narrowing the range instead of by rendering a different
   * tree, so the markup React hydrates is the markup the server sent — the
   * preference is not known during SSR and a structural switch on it would be
   * a hydration mismatch on every figure.
   */
  const variants: Variants = {
    rest: { y: reduce ? "0%" : `${(steps / cells) * 100}%` },
    rolled: { y: "0%", transition: { duration, ease: EXPO_OUT, delay } },
  };

  return (
    <span className="relative shrink-0 overflow-hidden">
      {/* Width only: one tabular digit's advance. */}
      <span className="invisible">0</span>

      <motion.span
        className="absolute inset-x-0 bottom-0 flex flex-col"
        style={{ height: `${cells * 100}%` }}
        variants={variants}
      >
        {Array.from({ length: cells }, (_, i) => (
          <span key={i} className="flex flex-1 items-center justify-center">
            {i % 10}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function Counter({
  to,
  duration = 1.3,
  className,
}: {
  to: number;
  /** Seconds for a drum to travel, whatever distance it has to cover. */
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const formatted = to.toLocaleString("en-US");
  const chars = formatted.split("");

  return (
    <motion.span
      className={`relative inline-block ${className ?? ""}`}
      initial="rest"
      whileInView="rolled"
      viewport={VIEWPORT}
    >
      {/*
        The sizer is the figure's real geometry — width, height and, because
        it is a normal in-flow line rather than an overflow-hidden box, the
        baseline the surrounding 位 / 人 / ＋ are aligned to. Everything that
        moves is laid over it and takes no space.
      */}
      <span aria-hidden className="invisible">
        {formatted}
      </span>

      {/*
        select-none so a reader dragging across the figure copies the number
        from the sr-only span rather than every digit on every drum — the
        strips put 0-9 in the DOM ten times over, and without this a copied
        selection reads "0123456789012...".
      */}
      <span aria-hidden className="absolute inset-0 flex select-none">
        {chars.map((char, i) => {
          if (!/\d/.test(char)) {
            // The comma. Its own width, centred the same way a drum cell is.
            return (
              <span key={i} className="flex shrink-0 items-center justify-center">
                {char}
              </span>
            );
          }

          const indexFromRight = chars.slice(i + 1).filter((c) => /\d/.test(c)).length;

          return (
            <Drum
              key={i}
              digit={Number(char)}
              indexFromRight={indexFromRight}
              duration={duration}
              reduce={reduce}
              delay={ENTRY_DELAY + i * COLUMN_DELAY}
            />
          );
        })}
      </span>

      {/* The true value, in the accessibility tree, mid-roll or not. */}
      <span className="sr-only">{formatted}</span>
    </motion.span>
  );
}
