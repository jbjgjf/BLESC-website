"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

/**
 * A photograph that sits behind its frame rather than on it.
 *
 * 構造的な限界 is three large pictures, and flat they read as three stickers —
 * the frame and the image move as one object, so the panel has no depth and no
 * relationship to the page it is travelling through. The image is mounted
 * 36px oversize top and bottom and shifted against the frame as the row
 * crosses the viewport, which is the whole effect: a window with something
 * behind it. The travel is ±24px, so there is a 12px margin of image left at
 * either extreme and the frame can never show an edge.
 *
 * Nothing here is measured in JavaScript and no state is touched per frame: the
 * offset is a motion value derived from scroll progress, so it is correct on a
 * deep link, a back-button restore or a Lenis anchor jump.
 *
 * Under reduced motion the range collapses to zero rather than the style being
 * dropped — motion keeps ownership of the transform and writes the resting
 * position, which is the centred crop the frame was designed around.
 */

/** Oversize in each direction, and how far the image may travel. */
const BLEED = 36;
const TRAVEL = 24;

export function PhotoFrame({ src, sizes }: { src: string; sizes: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [-TRAVEL, TRAVEL],
  );

  return (
    /*
     * 3:2, a wider panel that fits the page's other visuals. The corridor and
     * the classroom are 3:2 files and fill it as they are; the survey is 4:3,
     * and object-cover takes the difference off its top and bottom, which
     * keeps the hand and the answer sheet in the middle of the frame.
     */
    <div
      ref={ref}
      className="relative aspect-[3/2] overflow-hidden rounded-[1.25rem] border border-line shadow-[var(--shadow-card)]"
    >
      <motion.div
        className="absolute inset-x-0"
        style={{ top: -BLEED, bottom: -BLEED, y, willChange: reduce ? undefined : "transform" }}
      >
        <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  );
}
