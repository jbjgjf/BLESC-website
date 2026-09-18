"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Flower } from "@/components/Flower";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";

/**
 * The brand flower, breathing.
 *
 * The same slow rise and fall the app's greeting screen gives its own mark —
 * a few pixels either way over several seconds, which reads as breathing;
 * anything larger on a mark this size reads as a bouncing logo. The
 * amplitude scales with the flower, so a footer ornament and a display-size
 * mark move at the same rate rather than the same distance.
 *
 * The loop only runs while the flower is on screen. A repeat: Infinity
 * animation keeps a compositor layer busy wherever it is, and there can be
 * half a dozen of these on one page. Under reduced motion the mark is simply
 * drawn at rest. The flag is usePrefersReducedMotion, not motion's hook,
 * because it decides the `animate` target and so what is rendered: it agrees
 * with the server through hydration, and the loop cannot start before it has
 * its real value, since the in-view check that also gates it only answers
 * after hydration.
 *
 * No halo. A blurred copy behind the mark was tried and read as a glow
 * around a logo rather than as depth; the flower is a flat mark in the
 * logo and stays one here.
 *
 * Decorative everywhere it appears: <Flower> is already aria-hidden.
 */
export function FloatingFlower({
  size,
  className = "",
  rotate = 0,
  duration = 4.5,
  delay = 0,
}: {
  /** Pixel size of the mark. */
  size: number;
  /** Colour comes from a `text-*` class: the flower fills with currentColor. */
  className?: string;
  /** Static tilt in degrees. The breathing is a translate, so the two never fight. */
  rotate?: number;
  /** Seconds per breath. Give neighbours different values so they drift out of phase. */
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(ref, { amount: 0.1 });
  const breathes = inView && !reduce;
  const amp = Math.max(4, Math.round(size / 10));

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ width: size, height: size, rotate }}
      animate={breathes ? { y: [0, -amp, 0] } : { y: 0 }}
      transition={
        breathes
          ? { duration, repeat: Infinity, ease: "easeInOut", delay }
          : { duration: 0.4 }
      }
    >
      <Flower size={size} className="h-full w-full" />
    </motion.div>
  );
}
