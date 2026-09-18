"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { CHART_ROWS, RC16 } from "@/lib/wellbeing";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";

/**
 * The 37位 figure, shown as what it is made of.
 *
 * A rank on its own says "near the bottom" and nothing more. This is the
 * indicator behind the rank — the share of 15-year-olds who rate their life
 * 6 or better out of 10 — for a handful of countries, with Japan last. The
 * bars start at zero: a truncated axis would make the gap look larger than
 * it is, and the honest gap is already the point. Japan's 62% is second-
 * lowest of the 33 countries measured.
 *
 * The numbers are real text and the names are real text, so the chart is
 * readable without the bars; the bars are the only decoration, and they are
 * drawn from the same rows as the labels, so the two cannot disagree. Japan
 * takes the one colour that carries meaning on this page; the others are a
 * neutral at 45%, which clears 3:1 as a mark against the card in both
 * builds (3.11:1 light, 4.49:1 dark, computed from the tokens).
 *
 * The bars grow from the left as the panel arrives — scaleX on a fixed
 * width, so no frame animates a width — staggered so the eye reads down the
 * list to Japan. Reduced motion puts them at full length the moment the
 * panel arrives, with no growth and no stagger.
 *
 * The hidden state is scaleX 0 either way and only the transition differs.
 * The hidden state is written into the server HTML; if it depended on the
 * setting, the server (which cannot know it) and a reduced-motion visitor's
 * hydration pass would disagree. A transition is read when the animation
 * starts, which is after hydration, so motion's useReducedMotion is the right
 * flag for it.
 */
const MAX = 100;

const barVariants = (reduce: boolean): Variants => ({
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: reduce ? { duration: 0 } : { duration: 0.8, ease: EXPO_OUT },
  },
});

export function SatisfactionChart() {
  const reduce = useReducedMotion() ?? false;

  return (
    <figure className="mt-7">
      <motion.ol
        role="list"
        aria-label={`${RC16.indicator}（${RC16.dataYear}年）`}
        className="space-y-2"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
        }}
      >
        {CHART_ROWS.map((row) => {
          const japan = row.name === "日本";
          return (
            <li
              key={row.name}
              className="grid grid-cols-[5.5rem_1fr_2.25rem] items-center gap-x-3"
            >
              <span
                className={`truncate text-[0.75rem] ${
                  japan ? "font-medium text-ink" : "text-muted"
                }`}
              >
                {row.name}
              </span>

              <span className="block h-1.5 overflow-hidden rounded-full bg-inset">
                {/* Cut to its true length as a static width; only the fill's
                    scale animates, so the resting state is the true value
                    with or without JavaScript. */}
                <span
                  className="block h-full overflow-hidden rounded-full"
                  style={{ width: `${(row.value / MAX) * 100}%` }}
                >
                  <motion.span
                    className={`block h-full w-full origin-left rounded-full ${
                      japan ? "bg-mark-1" : "bg-ink/45"
                    }`}
                    variants={barVariants(reduce)}
                  />
                </span>
              </span>

              <span
                className={`text-right text-[0.75rem] tabular-nums ${
                  japan ? "font-medium text-ink" : "text-muted"
                }`}
              >
                {row.value}%
              </span>
            </li>
          );
        })}
      </motion.ol>

      {/*
        The one caption the panel carries: what the bars measure, and where
        the figure comes from. Linked, because it is a real source and the
        reader should be able to check it.
      */}
      <figcaption className="mt-4 text-[0.7rem] leading-relaxed text-muted">
        {RC16.indicator}（{RC16.dataYear}年）。出典:{" "}
        <a
          href={RC16.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mark-1 underline decoration-mark-1/40 underline-offset-2 transition-colors duration-300 hover:decoration-mark-1"
        >
          {RC16.publisher}
          {RC16.title}
        </a>
        （{RC16.year}）
      </figcaption>
    </figure>
  );
}
