"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Fragment } from "react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";

const CHAIN = ["睡眠不足", "認知機能の低下", "抑うつ傾向"] as const;

const STEP = 0.18;

const dotVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EXPO_OUT, delay: i * STEP },
  }),
};

const labelVariants: Variants = {
  hidden: { opacity: 0 },
  show: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.45, delay: i * STEP + 0.08 },
  }),
};

const edgeVariants: Variants = {
  hidden: { pathLength: 0 },
  show: (i: number) => ({
    pathLength: 1,
    transition: { duration: 0.5, ease: EXPO_OUT, delay: i * STEP + 0.14 },
  }),
};

const flat: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

const flatEdge: Variants = {
  hidden: { pathLength: 1, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 0.3 } },
};

/**
 * The causal chain the ontology encodes, shown at a deliberately small scale.
 * Supporting illustration for the copy above it — not a hero visual.
 */
export function CausalChain() {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      aria-hidden
      className="flex max-w-lg flex-col items-start gap-0 sm:flex-row sm:items-start"
    >
      {CHAIN.map((label, i) => (
        <Fragment key={label}>
          <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:gap-2.5">
            <motion.span
              custom={i}
              variants={reduce ? flat : dotVariants}
              className="block size-3 shrink-0 rounded-full bg-accent ring-4 ring-accent/30"
            />
            <motion.span
              custom={i}
              variants={reduce ? flat : labelVariants}
              className="whitespace-nowrap text-[0.8rem] text-muted"
            >
              {label}
            </motion.span>
          </div>

          {i < CHAIN.length - 1 && (
            <>
              {/* Horizontal edge, sm and up — sits level with the dots. */}
              <svg
                viewBox="0 0 100 2"
                preserveAspectRatio="none"
                className="mt-[0.3125rem] hidden h-0.5 w-full min-w-8 sm:block"
              >
                <motion.path
                  d="M0 1 H100"
                  stroke="var(--color-primary)"
                  strokeOpacity={0.85}
                  strokeWidth={2.5}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  custom={i}
                  variants={reduce ? flatEdge : edgeVariants}
                />
              </svg>

              {/* Vertical edge, mobile — drops from the dot's centre. */}
              <svg
                viewBox="0 0 2 100"
                preserveAspectRatio="none"
                className="ml-[0.3125rem] h-6 w-0.5 sm:hidden"
              >
                <motion.path
                  d="M1 0 V100"
                  stroke="var(--color-primary)"
                  strokeOpacity={0.85}
                  strokeWidth={2.5}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  custom={i}
                  variants={reduce ? flatEdge : edgeVariants}
                />
              </svg>
            </>
          )}
        </Fragment>
      ))}
    </motion.div>
  );
}
