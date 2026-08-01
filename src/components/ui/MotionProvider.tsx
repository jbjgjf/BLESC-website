"use client";
import { MotionConfig } from "framer-motion";

/**
 * Makes framer-motion honour the OS reduced-motion preference site-wide.
 *
 * globals.css already zeroes CSS animations under
 * `@media (prefers-reduced-motion: reduce)`, but framer-motion drives inline
 * styles from JS, so that rule never reached it — every scroll entrance still
 * played for readers who had asked for stillness. `reducedMotion="user"` makes
 * framer-motion skip transform and opacity animations for those readers while
 * leaving the layout untouched, so nothing needs a bespoke static fallback.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
