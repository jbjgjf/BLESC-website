"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { VIEWPORT, staggerVariants } from "@/lib/motion";

/**
 * An unordered list that walks its items in, one after another.
 *
 * <Stagger> in components/Reveal is this for a div or an ol, and neither is
 * what the trust pages hold. The supplied copy lists its statements without
 * numbering them, so an ol would add an order the copy does not state, and a
 * div would take them out of the accessibility tree as a list altogether.
 * This is the same container — the same variants, the same viewport —
 * rendered as a ul.
 *
 * Its items are <RevealItem as="li"> from components/Reveal. They carry no
 * trigger of their own: they take the "hidden"/"show" label from here
 * through motion's context, so the list is observed once, and RevealItem
 * already swaps to the opacity-only variant under reduced motion.
 *
 * role="list" for the reason Stagger gives: the preflight removes the
 * markers, and WebKit then stops announcing an unmarked list as a list.
 */
export function RevealList({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds between items. */
  stagger?: number;
}) {
  return (
    <motion.ul
      role="list"
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={staggerVariants(stagger)}
    >
      {children}
    </motion.ul>
  );
}
