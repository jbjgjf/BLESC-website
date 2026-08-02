"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Fragment } from "react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { Icon } from "@/components/ui";

/**
 * The causal chain the ontology encodes, at full section width.
 *
 * Previously a small run of dots beside the copy. It is the clearest single
 * statement of what the model actually does, so it now carries the section
 * rather than annotating it.
 */
const CHAIN = [
  { label: "睡眠不足", icon: "bedtime", text: "text-mark-1", bar: "bg-mark-1" },
  {
    label: "認知機能の低下",
    icon: "psychology",
    text: "text-mark-2",
    bar: "bg-mark-2",
  },
  {
    label: "抑うつ傾向",
    icon: "trending_down",
    text: "text-mark-3",
    bar: "bg-mark-3",
  },
] as const;

const STEP = 0.14;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EXPO_OUT, delay: i * STEP },
  }),
};

const arrowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EXPO_OUT, delay: i * STEP + 0.22 },
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
      className="flex w-full flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-3"
    >
      {CHAIN.map((link, i) => (
        <Fragment key={link.label}>
          <motion.div
            custom={i}
            variants={reduce ? flat : cardVariants}
            className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-[var(--shadow-card)] md:py-14"
          >
            <span
              className={`flex size-16 items-center justify-center rounded-full bg-canvas-alt ${link.text}`}
            >
              <Icon name={link.icon} size={30} />
            </span>

            <p className="mt-6 text-[clamp(1.1rem,2vw,1.5rem)] font-medium tracking-[-0.015em] text-ink">
              {link.label}
            </p>

            <span
              aria-hidden
              className={`mt-5 block h-1 w-10 rounded-full ${link.bar}`}
            />
          </motion.div>

          {i < CHAIN.length - 1 && (
            <motion.div
              aria-hidden
              custom={i}
              variants={reduce ? flat : arrowVariants}
              className="flex shrink-0 items-center justify-center text-muted"
            >
              {/* Horizontal on a row, vertical once the chain stacks. */}
              <Icon name="arrow_forward" size={30} className="hidden md:block" />
              <Icon name="arrow_downward" size={30} className="md:hidden" />
            </motion.div>
          )}
        </Fragment>
      ))}
    </motion.div>
  );
}
