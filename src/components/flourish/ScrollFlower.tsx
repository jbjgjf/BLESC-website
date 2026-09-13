"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { FlowerMark } from "@/components/flourish/FlowerMark";
import { usePinCapable } from "@/components/hero/usePinCapable";

/*
 * The path, as five stops along the span the flower is given.
 *
 * Horizontal stops are in vw because the sections run the full width of the
 * page, so a vw is the width the reader actually sees. Vertical stops are
 * percentages of the travelling layer, and that layer is inset-0 inside the
 * span — so a percentage here is a percentage of the two sections together,
 * whatever they end up measuring. Nothing has to be measured in JavaScript.
 *
 * The flower enters off the left edge, crosses to the right while the first
 * section reads, and returns left as the second one ends. The vertical stops
 * are deliberately uneven: the middle leg descends through the document at
 * very nearly the speed the page is scrolling, so through the middle of the
 * journey the flower hangs roughly still on screen and the sweep is what the
 * reader sees. A flower kept inside these two sections cannot also drift down
 * the screen the whole way — it would have to outrun the scroll and leave the
 * span — so the descent is spent where it shows.
 */
const STOPS = [0, 0.15, 0.55, 0.85, 1];
const X = ["-48vw", "-26vw", "54vw", "10vw", "-22vw"];
const Y = ["0%", "4%", "48%", "68%", "72%"];
const ROTATE = [-22, -14, 12, 26, 34];

/**
 * Where the flower sits when it is not allowed to travel: past the first
 * section, right of centre, clear of the measure.
 */
const REST_X = "28vw";
const REST_Y = "38%";
const REST_ROTATE = 8;

/**
 * One flower drifting behind a run of sections, as a function of scroll.
 *
 * Wrapping rather than living inside either section: the whole point is that
 * the ornament crosses the boundary between them, so it has to be positioned
 * against the pair and the pair has to be what the scroll window is measured
 * from. Sections stay unaware of it.
 *
 * Stacking is the subtle part. A negative z-index would put the flower under
 * the sections' own bg-canvas fills and make it invisible, because backgrounds
 * of in-flow blocks paint above negative layers. Instead the layer is
 * positioned with z-0 and placed BEFORE the sections in the markup: positioned
 * boxes at z-index 0 or auto paint in tree order, and every section's content
 * lives inside a positioned Container, so the flower lands above the white
 * fills and below all of the text and panels.
 *
 * overflow-x-clip, never overflow-hidden: the flower hangs off both edges by
 * design and must not create a horizontal scrollbar, but hidden would force
 * the vertical axis to scroll as well and trap anything that needs to escape
 * upwards. No transform, filter or contain goes on this wrapper either, so it
 * never becomes a containing block for what it wraps.
 */
export function ScrollFlower({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  /*
   * Travelling is for pointer-driven screens. On a phone these two sections
   * stack into a very long column, so the same path would be spread over
   * several screens of scrolling and read as a flower that is simply there —
   * while still asking the compositor to re-blur a half-viewport-wide element
   * on every frame of a touch scroll. Small screens get the resting flower,
   * which is the same ornament without the cost.
   */
  const travels = usePinCapable();
  const still = reduce || !travels;

  /*
   * The window runs from the pair entering the viewport to it leaving, so the
   * position is a pure function of where the page is — correct on a deep link,
   * a back-button restore, or a Lenis anchor jump, with no state per frame.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /*
   * Under reduced motion the ranges collapse to the resting stop rather than
   * the style props being dropped. Handing motion `undefined` would leave
   * whatever transform it had already written sitting in the style attribute,
   * which is how an effect like this ends up frozen at its off-screen first
   * frame; this way motion still owns the transform and only the distance
   * changes.
   */
  const x = useTransform(scrollYProgress, STOPS, still ? STOPS.map(() => REST_X) : X);
  const y = useTransform(scrollYProgress, STOPS, still ? STOPS.map(() => REST_Y) : Y);
  const rotate = useTransform(
    scrollYProgress,
    STOPS,
    still ? STOPS.map(() => REST_ROTATE) : ROTATE,
  );
  /*
   * The fade starts a little after the span does, so the blur halo cannot
   * reach above the first section and wash over the section before it — which
   * it would paint over, being later in the markup than that section's own
   * content. It is out before the end for the same reason at the bottom.
   */
  const fade = useTransform(
    scrollYProgress,
    still ? [0, 1] : [0, 0.1, 0.9, 1],
    still ? [1, 1] : [0, 1, 1, 0],
  );

  return (
    <div ref={ref} className="relative overflow-x-clip">
      {/*
        Three boxes, each measuring against something different. The outer one
        is the span itself, so its percentage translate is a fraction of the
        two sections. The middle one is the flower's box, so its translate is
        in vw across the screen. The inner one holds the wash and the blur and
        carries no inline style at all — which is what makes this safe without
        JavaScript: the layout's <noscript> rule forces every inline-styled
        node in <main> to opacity 1, no transform and no filter, so with the
        colour and the blur on a plain element the no-JS fallback is the same
        soft 10% flower, simply parked at the top of the span instead of
        travelling. The mark carries nothing, so the layer is hidden from
        assistive tech and from the pointer.
      */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          y,
          opacity: fade,
          willChange: still ? undefined : "transform, opacity",
        }}
      >
        <motion.div
          className="absolute top-0 left-0 aspect-square w-[clamp(20rem,54vw,48rem)]"
          style={{ x, rotate, willChange: still ? undefined : "transform" }}
        >
          {/*
            22% of the logo's own blue (--color-primary, via text-accent)
            under a 22px blur. The ceiling was measured when the wash was the
            darker --mark-1 — secondary copy over it held 4.60:1 in the light
            build, and 26% fell to 4.33:1 — and the lighter brand blue only
            raises that figure, so the alpha stays where it was. Presence
            comes from size and sharpness instead of alpha — hence the wider
            box and the tighter blur, which is what lets the petals read as
            the mark rather than as a haze.

            inset-0 rather than h-full: a height that comes from aspect-ratio
            is the kind of definite-enough that percentage heights have been
            unreliable against, and this box must fill its parent exactly.
          */}
          <div className="absolute inset-0 text-accent opacity-[0.22] blur-[22px]">
            <FlowerMark />
          </div>
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}
