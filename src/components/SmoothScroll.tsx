"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Lenis smooth scroll. Duration sits at 1.1s — calm, but not sluggish. The
 * easing is a plain exponential decay, so scrolling settles rather than
 * overshooting; rubber-banding at the page ends is suppressed in CSS via
 * overscroll-behavior, which is the actual control for it.
 *
 * Disabled outright under prefers-reduced-motion: smooth scroll hijacking is
 * exactly the kind of motion that setting is asking us to drop.
 */
export function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoRaf: true,
      // Lenis intercepts in-page anchors so nav jumps ease instead of
      // snapping. It honours each target's scroll-margin-top, which is what
      // clears the fixed nav — see `scroll-mt-24` on <Section>.
      anchors: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
