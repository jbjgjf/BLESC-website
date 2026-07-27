"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Fragment } from "react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { Icon } from "@/components/ui";

const NODES = [
  { icon: "person", label: "生徒" },
  { icon: "forum", label: "30往復の対話" },
  {
    icon: "neurology",
    label: "AI解析",
    // The trust-critical detail of the whole page.
    note: "（生のログは非公開）",
  },
  { icon: "summarize", label: "リスクレポート" },
  { icon: "school", label: "教員" },
] as const;

const STEP = 0.15;

const nodeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: EXPO_OUT, delay: i * STEP },
  }),
};

const lineVariants: Variants = {
  hidden: { pathLength: 0 },
  show: (i: number) => ({
    pathLength: 1,
    transition: { duration: 0.45, ease: EXPO_OUT, delay: i * STEP + 0.12 },
  }),
};

const arrowVariants: Variants = {
  hidden: { opacity: 0 },
  show: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.3, delay: i * STEP + 0.42 },
  }),
};

const flatVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

const flatLineVariants: Variants = {
  hidden: { pathLength: 1, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 0.3 } },
};

function Line({
  index,
  vertical,
  reduce,
}: {
  index: number;
  vertical: boolean;
  reduce: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox={vertical ? "0 0 2 100" : "0 0 100 2"}
      preserveAspectRatio="none"
      className={vertical ? "h-full w-0.5" : "h-0.5 w-full"}
    >
      <motion.path
        d={vertical ? "M1 0 V100" : "M0 1 H100"}
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        // Keeps the stroke 2px on screen despite the stretched viewBox.
        vectorEffect="non-scaling-stroke"
        custom={index}
        variants={reduce ? flatLineVariants : lineVariants}
      />
    </svg>
  );
}

function Connector({ index, reduce }: { index: number; reduce: boolean }) {
  return (
    <>
      {/* Horizontal, tablet and up. */}
      <div className="relative hidden h-14 flex-1 items-center px-1 md:flex">
        <Line index={index} vertical={false} reduce={reduce} />
        <motion.span
          aria-hidden
          custom={index}
          variants={reduce ? flatVariants : arrowVariants}
          className="absolute inset-y-0 right-0 flex items-center bg-canvas-alt pl-1 text-accent"
        >
          <Icon name="arrow_forward" size={18} />
        </motion.span>
      </div>

      {/* Vertical, mobile. */}
      <div className="relative flex h-12 w-full justify-center md:hidden">
        <Line index={index} vertical reduce={reduce} />
        <motion.span
          aria-hidden
          custom={index}
          variants={reduce ? flatVariants : arrowVariants}
          className="absolute inset-x-0 bottom-0 flex justify-center bg-canvas-alt pt-1 text-accent"
        >
          <Icon name="arrow_downward" size={18} />
        </motion.span>
      </div>
    </>
  );
}

/**
 * 生徒 → 30往復の対話 → AI解析 → リスクレポート → 教員
 *
 * Horizontal on desktop, vertical on mobile. Nodes step in left to right;
 * the connecting lines draw themselves rather than simply appearing.
 */
export function FlowDiagram() {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className="flex flex-col items-center md:flex-row md:items-start"
    >
      {NODES.map((node, i) => (
        <Fragment key={node.label}>
          <motion.div
            custom={i}
            variants={reduce ? flatVariants : nodeVariants}
            className="flex shrink-0 flex-col items-center text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-accent bg-accent/15 text-ink">
              <Icon name={node.icon} size={24} />
            </span>
            <span className="mt-4 whitespace-nowrap text-[0.9rem] font-medium text-ink">
              {node.label}
            </span>
            {"note" in node && node.note ? (
              // Muted secondary text per spec, but paired with a lock mark so
              // the page's trust-critical detail still catches the eye.
              <span className="mt-2.5 flex items-center gap-1.5 whitespace-nowrap text-[0.82rem] text-muted">
                <Icon name="lock" size={15} />
                {node.note}
              </span>
            ) : null}
          </motion.div>

          {i < NODES.length - 1 && <Connector index={i} reduce={reduce} />}
        </Fragment>
      ))}
    </motion.div>
  );
}
