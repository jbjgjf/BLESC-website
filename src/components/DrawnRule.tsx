"use client";

import { motion, useReducedMotion } from "motion/react";
import { drawStatic, drawVariants, VIEWPORT } from "@/lib/motion";

/**
 * A hairline that draws itself as it arrives.
 *
 * Positioned by the caller (`top-0`, `bottom-0`) inside a relative parent,
 * and full-bleed by default: it exists for rows that run wider than the page
 * measure, where a static border reads as a table and a line that draws in
 * reads as placed.
 *
 * It carries its own `whileInView` rather than inheriting the surrounding
 * reveal's variant label. Inheriting would save an observer, but it puts a
 * visible piece of the design at the mercy of variant propagation through
 * plain elements — and the failure mode is a rule that never draws at all,
 * which is invisible in review.
 *
 * bg-line-strong, not bg-line: this line is structure, not a seam between
 * two surfaces, and line-strong is the token that clears the 3:1 a
 * meaningful non-text mark needs in both builds (3.72:1 light, 3.15:1 dark).
 */
export function DrawnRule({
  className = "",
  origin = "left",
  delay,
}: {
  className?: string;
  origin?: "left" | "center";
  /** Seconds to hold before drawing. Defaults to just after the row settles. */
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      className={`absolute inset-x-0 h-px bg-line-strong ${
        origin === "center" ? "origin-center" : "origin-left"
      } ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={reduce ? drawStatic : drawVariants(delay)}
    />
  );
}
