import type { Transition, Variants } from "motion/react";

/**
 * The "expo-out" curve. Used as the default easing everywhere instead of
 * ease-in-out — it decelerates hard, which is what makes motion read as
 * settled rather than springy.
 */
export const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

/** Scroll reveals fire once, at ~20% visibility. */
export const VIEWPORT = { once: true, amount: 0.2 } as const;

const revealTransition: Transition = { duration: 0.7, ease: EXPO_OUT };

/** translateY(24→0) + opacity(0→1) + blur(4→0). */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: revealTransition },
};

/** Opacity-only stand-in used whenever prefers-reduced-motion is set. */
export const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: "linear" } },
};

/** Container that walks its children in, 0.08–0.12s apart. */
export function staggerVariants(stagger = 0.1, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

/**
 * A rule drawing itself in: scaleX 0 → 1 on the expo curve, held back so the
 * words arrive before the mark under them does. `origin-left` or
 * `origin-center` on the element decides which way it grows.
 */
export function drawVariants(delay = 0.35): Variants {
  return {
    hidden: { scaleX: 0 },
    show: {
      scaleX: 1,
      transition: { duration: 0.9, ease: EXPO_OUT, delay },
    },
  };
}

/** Reduced motion gets the drawn state, not the undrawn one. */
export const drawStatic: Variants = {
  hidden: { scaleX: 1 },
  show: { scaleX: 1 },
};
