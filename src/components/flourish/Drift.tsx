"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

/**
 * Moves its children a little slower than the page.
 *
 * The block is offset by `amount` pixels downward as it enters the bottom of
 * the viewport and by the same amount upward as it leaves the top, so it
 * passes through its resting position at the middle of the screen — which is
 * where a heading is when it is being read, so the drift never puts the text
 * anywhere the layout did not intend. A few pixels of lag against everything
 * around it is what makes a page read as layered rather than as one flat
 * sheet sliding past.
 *
 * The window is the element's own box from entering the viewport to leaving
 * it, so the offset is a pure function of where the page is — correct on a
 * deep link, a back-button restore or a Lenis anchor jump, with no state per
 * frame. There is no will-change: the travel is small and the elements are
 * cheap, and promoting every heading on the page to its own layer would cost
 * more memory than the compositor would save.
 *
 * Under reduced motion the range collapses to zero rather than the style
 * being dropped — motion keeps ownership of the transform and writes the
 * resting position, which is exactly where the element sits without JS.
 */
export function Drift({
  children,
  amount = 12,
  className,
}: {
  children: ReactNode;
  /** Pixels of lag at either end of the window. */
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [amount, -amount],
  );

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
