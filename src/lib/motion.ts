import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion vocabulary.
 *
 * globals.css declares the brand's easing curves, but every section animated
 * with framer-motion's defaults instead, so the motion identity existed only
 * on paper. These mirror the CSS custom properties so JS-driven motion and
 * CSS-driven motion finally agree:
 *
 *   --ease-expo-out       cubic-bezier(0.16, 1, 0.3, 1)
 *   --ease-natural-bloom  cubic-bezier(0.76, 0, 0.1, 1)
 */
export const EASE_EXPO_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_NATURAL_BLOOM = [0.76, 0, 0.1, 1] as const;

/** Content entering as the reader arrives. Long and soft, never snappy. */
export const reveal: Transition = { duration: 0.8, ease: EASE_EXPO_OUT };

/** Something opening or settling into place — flowers, cards, halos. */
export const bloom: Transition = { duration: 1.1, ease: EASE_NATURAL_BLOOM };

/**
 * Viewport config used across sections. `once` matters: re-animating on every
 * scroll-back turns a calm page into a nervous one.
 */
export const inView = { once: true, margin: "-80px" } as const;

/** Rise-and-fade, the page's default entrance. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: reveal },
};

/** Section headings, which lead from the left edge of the measure. */
export const headingIn: Variants = {
  hidden: { opacity: 0, x: -20 },
  shown: { opacity: 1, x: 0, transition: reveal },
};

/**
 * Parent for a group whose children arrive in sequence. Pair with `riseIn` on
 * the children and drop the per-item `delay: i * n` arithmetic.
 */
export const stagger = (step = 0.12, delayChildren = 0): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: step, delayChildren } },
});

/**
 * Petals unfolding: children scale up from a slightly closed state. Used where
 * the floral language should carry into a section rather than a plain rise.
 */
export const petalIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 16 },
  shown: { opacity: 1, scale: 1, y: 0, transition: bloom },
};

/** Standard props for a one-shot entrance. Spread onto a motion element. */
export const enter = (variants: Variants = riseIn) => ({
  variants,
  initial: "hidden" as const,
  whileInView: "shown" as const,
  viewport: inView,
});
