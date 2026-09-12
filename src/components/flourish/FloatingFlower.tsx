"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Flower } from "@/components/Flower";

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
 * drawn at rest.
 *
 * `glow` draws a blurred copy behind at low opacity — the wash the flower
 * behind 仕組み uses — so a solid mark on a plain ground still has depth.
 *
 * Decorative everywhere it appears: <Flower> is already aria-hidden.
 */
export function FloatingFlower({
  size,
  className = "",
  rotate = 0,
  duration = 4.5,
  delay = 0,
  glow = false,
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
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
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
      {glow && (
        <div className="absolute inset-0 scale-[1.6] opacity-40 blur-[18px]">
          <Flower size={size} className="h-full w-full" />
        </div>
      )}
      <Flower size={size} className="relative h-full w-full" />
    </motion.div>
  );
}
