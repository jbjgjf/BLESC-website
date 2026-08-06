"use client";

import {
  animate,
  useInView,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 when scrolled into view. Eased (not linear) so the number
 * decelerates into its final value rather than arriving at constant speed.
 */
export function Counter({
  to,
  duration = 1.2,
  className,
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;

    const controls: AnimationPlaybackControls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  // Reduced motion skips the count entirely — derived here rather than
  // pushed through state, so no render is spent on the animated path.
  const shown = reduce ? to : value;

  return (
    <span ref={ref} className={className}>
      {/* The true value is always in the a11y tree, mid-count or not. */}
      <span aria-hidden>{shown.toLocaleString("en-US")}</span>
      <span className="sr-only">{to.toLocaleString("en-US")}</span>
    </span>
  );
}
