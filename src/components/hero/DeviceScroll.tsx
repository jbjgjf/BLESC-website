"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { usePinCapable } from "@/components/hero/usePinCapable";

/**
 * The screen you scroll into.
 *
 * It starts tilted away from the reader, as though the device were lying
 * back on a table, and comes upright as it crosses the viewport. The whole
 * move is a function of scroll position, so it is always in the right state
 * on a deep link, a back-button restore, or a Lenis anchor jump.
 *
 * Built from the "container scroll" pattern that does the rounds in the
 * Tailwind component galleries, but rewritten against this project: the
 * motion package rather than framer-motion (they are the same library, and
 * a second copy would ship twice), the site's own tokens instead of the
 * hardcoded dark frame, a smaller tilt, and a reduced-motion path.
 *
 * The tilt resolves in the first half of the pass, so the screen is upright
 * and readable for the whole time it is actually centred.
 */
export function DeviceScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  /*
   * A phone cannot show a 3D tilt at a useful size, and rotateX on a large
   * surface is expensive to composite there. Coarse pointers get the screen
   * flat, which is what they would see at the end of the move anyway.
   */
  const tilts = usePinCapable();
  const still = reduce || !tilts;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /*
   * The ranges collapse to the resting state rather than the style prop
   * being dropped. Handing motion `undefined` leaves whatever transform it
   * wrote on the server sitting in the style attribute — on a phone that
   * froze the screen at its tilted starting frame, scaled to 0.9, for good.
   * Motion owns the transform either way; only the distance changes.
   */
  const rotateX = useTransform(scrollYProgress, [0, 0.42], [still ? 0 : 24, 0], {
    clamp: true,
  });
  const scale = useTransform(scrollYProgress, [0, 0.42], [still ? 1 : 0.9, 1], {
    clamp: true,
  });
  const y = useTransform(scrollYProgress, [0, 0.42], [still ? 0 : 56, 0], {
    clamp: true,
  });

  return (
    <div ref={ref} className="relative px-6 pb-[clamp(3rem,8vw,7rem)] md:px-10">
      {/*
        The perspective lives on the parent: it is what turns rotateX into a
        tilt rather than a squash. 1400px is shallow enough that the near
        edge does not balloon at this width.
      */}
      <div style={{ perspective: "1400px" }}>
        <motion.div
          style={{ rotateX, scale, y }}
          className="mx-auto w-full max-w-[64rem] origin-top rounded-[1.75rem] border border-line bg-surface p-1.5 shadow-[0_2px_4px_-2px_rgba(11,13,18,0.08),0_24px_48px_-24px_rgba(11,13,18,0.22),0_64px_120px_-60px_rgba(11,13,18,0.35)] md:p-2.5"
        >
          <div className="overflow-hidden rounded-[1.35rem] bg-canvas">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
