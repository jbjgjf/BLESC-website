"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  EXPO_OUT,
  VIEWPORT,
  reducedVariants,
  revealVariants,
  staggerVariants,
} from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to hold before this block starts. */
  delay?: number;
};

/**
 * Scroll-triggered reveal for a single block. Children stay real DOM nodes —
 * only transform/opacity/filter are animated, so screen readers and text
 * selection are unaffected.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={reduce ? reducedVariants : revealVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  /** Gap between children. Spec range is 0.08–0.12s. */
  stagger?: number;
  delayChildren?: number;
};

/** Reveals its <RevealItem> descendants one after another. */
export function Stagger({
  children,
  className,
  stagger = 0.1,
  delayChildren = 0,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={staggerVariants(stagger, delayChildren)}
    >
      {children}
    </motion.div>
  );
}

/** A single participant in a <Stagger>. */
export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduce ? reducedVariants : revealVariants}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hero-only intro reveal. Runs on mount rather than on scroll, and animates
 * blur+opacity without any translate for word-level splits.
 */
export function IntroFade({
  children,
  className,
  delay = 0,
  translate = true,
  duration = 0.9,
  blur = 8,
}: RevealProps & { translate?: boolean; duration?: number; blur?: number }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: translate ? 16 : 0,
        filter: `blur(${blur}px)`,
      }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration, ease: EXPO_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Splits a line into words and reveals them with blur+opacity — no scale, no
 * rotation. The full string stays readable to assistive tech because every
 * word remains a real text node.
 *
 * `duration` and `blur` are deliberately generous: the defocus is the point
 * of this reveal, and at a short duration it resolves before the eye can
 * register it.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 0.09,
  duration = 1.2,
  blur = 14,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  blur?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay }}
      >
        {text}
      </motion.span>
    );
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="show"
      variants={staggerVariants(stagger, delay)}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block whitespace-pre"
          variants={{
            hidden: { opacity: 0, filter: `blur(${blur}px)` },
            show: {
              opacity: 1,
              filter: "blur(0px)",
              // Linear on the blur, not expo-out: expo resolves almost all of
              // the defocus in the first few frames, which is exactly what
              // made it hard to see.
              transition: { duration, ease: "easeOut" },
            },
          }}
        >
          {i === words.length - 1 ? word : `${word} `}
        </motion.span>
      ))}
    </motion.span>
  );
}
