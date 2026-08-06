"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * 2px page-scroll indicator pinned to the top of the viewport. Deliberately
 * thin — it is a wayfinding cue, not decoration.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent"
    />
  );
}
