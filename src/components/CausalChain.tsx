"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Fragment } from "react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";

/**
 * The causal chain the ontology encodes.
 *
 * Drawn as one continuous line with three nodes on it rather than three
 * rounded panels in a row — the panels were the same box repeated, which is
 * the shape that reads as generated. The line is the point: this is a chain,
 * and each term is a consequence of the one before it.
 */
const CHAIN = [
  { label: "睡眠不足", dot: "bg-mark-1", text: "text-mark-1" },
  { label: "認知機能の低下", dot: "bg-mark-2", text: "text-mark-2" },
  { label: "抑うつ傾向", dot: "bg-mark-3", text: "text-mark-3" },
] as const;

const STEP = 0.16;

const nodeVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EXPO_OUT, delay: i * STEP },
  }),
};

/** The rule draws itself left to right, so the chain reads in order. */
const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  show: (i: number) => ({
    scaleX: 1,
    transition: { duration: 0.5, ease: EXPO_OUT, delay: i * STEP + 0.18 },
  }),
};

/** Same reveal for the stacked layout, along the other axis. */
const lineVariantsY: Variants = {
  hidden: { scaleY: 0 },
  show: (i: number) => ({
    scaleY: 1,
    transition: { duration: 0.5, ease: EXPO_OUT, delay: i * STEP + 0.18 },
  }),
};

const flat: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

export function CausalChain() {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className="w-full"
    >
      {/* Wide: one horizontal run. */}
      <div className="hidden items-start md:flex">
        {CHAIN.map((link, i) => (
          <Fragment key={link.label}>
            <motion.div
              custom={i}
              variants={reduce ? flat : nodeVariants}
              className="flex shrink-0 flex-col items-center"
            >
              <span
                className={`block size-3.5 rounded-full ring-4 ring-canvas-alt ${link.dot}`}
              />
              <p
                className={`mt-6 whitespace-nowrap text-[clamp(1.1rem,2.2vw,1.6rem)] font-medium tracking-[-0.01em] ${link.text}`}
              >
                {link.label}
              </p>
            </motion.div>

            {i < CHAIN.length - 1 && (
              <motion.span
                aria-hidden
                custom={i}
                variants={reduce ? flat : lineVariants}
                // mt puts the rule through the middle of the 14px dot.
                className="mt-[6px] h-px flex-1 origin-left bg-line-strong"
              />
            )}
          </Fragment>
        ))}
      </div>

      {/* Narrow: the same chain turned on its side. */}
      <div className="flex flex-col md:hidden">
        {CHAIN.map((link, i) => (
          <Fragment key={link.label}>
            <motion.div
              custom={i}
              variants={reduce ? flat : nodeVariants}
              className="flex items-center gap-4"
            >
              <span
                className={`block size-3.5 shrink-0 rounded-full ring-4 ring-canvas-alt ${link.dot}`}
              />
              <p
                className={`text-[1.15rem] font-medium tracking-[-0.01em] ${link.text}`}
              >
                {link.label}
              </p>
            </motion.div>

            {i < CHAIN.length - 1 && (
              <motion.span
                aria-hidden
                custom={i}
                variants={reduce ? flat : lineVariantsY}
                className="my-1 ml-[6px] h-10 w-px origin-top bg-line-strong"
              />
            )}
          </Fragment>
        ))}
      </div>
    </motion.div>
  );
}
