"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { usePinCapable } from "@/components/hero/usePinCapable";

/*
 * The path, as five stops along the span the wash is given — the same
 * scheme as ScrollFlower, and the counterpart of its journey: the flower
 * enters on the left and crosses to the right, so the wash enters on the
 * right and crosses to the left.
 *
 * Horizontal stops are in vw, vertical ones are percentages of the span.
 * The wash holds on the right through the first stop, which is where the
 * product figure's report sits, then sweeps left across the middle leg while
 * descending at very nearly the speed of the scroll, so through the middle
 * of the journey it hangs roughly still on screen and the sweep is what the
 * reader sees. It ends left of centre, under the copy column and the near
 * half of the graph.
 */
const STOPS = [0, 0.15, 0.4, 0.7, 1];
const X = ["72vw", "60vw", "54vw", "6vw", "-6vw"];
const Y = ["4%", "10%", "18%", "63%", "70%"];

/** Where the wash sits when it is not allowed to travel: behind the figure, right of centre. */
const REST_X = "24vw";
const REST_Y = "14%";

/**
 * A soft wash of the logo's blue drifting behind a run of sections, as a
 * function of scroll.
 *
 * One large ellipse of a radial gradient, not a blurred block: the gradient
 * is already soft at its edge, so nothing has to be filtered per frame, and
 * the compositor only moves a painted layer. 14% of --color-primary is the
 * ceiling, measured rather than chosen: at the ellipse's centre it takes the
 * light ground to rgb(238,246,252) and the dark ground to rgb(27,36,44), over
 * which --color-text-muted still holds 5.73:1 and 9.66:1 — both clear of
 * the 4.5:1 that secondary copy sitting on the page ground needs.
 *
 * Stacking, wrapping and the no-JS fallback are exactly ScrollFlower's: the
 * layer is positioned with z-0 and rendered FIRST, so it paints above the
 * sections' bg-canvas fills and below their positioned Containers; the
 * wrapper is overflow-x-clip so the ellipse can hang off the edge without a
 * scrollbar and without trapping the vertical axis; and the gradient lives
 * on a plain element with no inline style, so the layout's <noscript> rule
 * leaves a parked wash rather than nothing.
 */
export function ScrollWash({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  /*
   * Travelling is for pointer-driven screens, for the reason ScrollFlower
   * gives: on a phone the span is several screens long and the journey
   * would read as a wash that is simply there. Small screens get the resting
   * wash, which is the same colour without the per-frame cost.
   */
  const travels = usePinCapable();
  const still = reduce || !travels;

  /*
   * From the span entering the viewport to it leaving, so the position is a
   * pure function of where the page is — correct on a deep link, a
   * back-button restore, or a Lenis anchor jump, with no state per frame.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /*
   * Under reduced motion the ranges collapse to the resting stop rather than
   * the style props being dropped — see ScrollFlower for why handing motion
   * `undefined` leaves the last transform sitting in the style attribute.
   */
  const x = useTransform(scrollYProgress, STOPS, still ? STOPS.map(() => REST_X) : X);
  const y = useTransform(scrollYProgress, STOPS, still ? STOPS.map(() => REST_Y) : Y);
  /*
   * In a little after the span starts and out before it ends, so the
   * ellipse cannot reach above the first section or below the last one and
   * wash over a neighbour it would paint on top of.
   */
  const fade = useTransform(
    scrollYProgress,
    still ? [0, 1] : [0, 0.1, 0.9, 1],
    still ? [1, 1] : [0, 1, 1, 0],
  );

  return (
    <div ref={ref} className="relative overflow-x-clip">
      {/*
        Three boxes, as in ScrollFlower: the outer one measures against the
        span so its translate is a fraction of the two sections; the middle
        one is the ellipse's box, translated in vw across the screen; the
        inner one carries the gradient and no inline style at all. The wash
        says nothing, so the layer is hidden from assistive tech and from the
        pointer.
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
          className="absolute top-0 left-0 aspect-[5/3] w-[clamp(28rem,70vw,64rem)]"
          style={{ x, willChange: still ? undefined : "transform" }}
        >
          {/*
            closest-side, so the gradient reaches full transparency exactly
            at the ellipse's edge and the box has no hard rim. inset-0 rather
            than h-full for the reason ScrollFlower gives: a height that
            comes from aspect-ratio is the kind percentage heights have been
            unreliable against.
          */}
          <div className="absolute inset-0 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-primary)_14%,transparent),transparent)]" />
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}
