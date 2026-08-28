"use client";

import { useEffect } from "react";

/**
 * Publishes the pointer position to :root as --pointer-x / -y / -xp, once for
 * the whole page.
 *
 * The card component this was adapted from registered its own
 * `pointermove` listener per instance and wrote the coordinates onto its own
 * element. With nine cards on this page that is nine listeners doing
 * identical work on every mouse move, and nine style writes per event.
 * Custom properties inherit, so one writer on <html> feeds every card.
 *
 * Writes are coalesced to one per frame: pointermove fires far faster than
 * the compositor can use, and each write invalidates style on every element
 * reading the variable.
 *
 * Nothing is attached at all unless the device actually has a fine pointer
 * and the visitor has not asked for reduced motion — which also keeps the
 * `background-attachment: fixed` these cards rely on off touch devices,
 * where it is both unreachable and badly behaved.
 */
const POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export function SpotlightPointer() {
  useEffect(() => {
    const fine = window.matchMedia(POINTER_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);
    const root = document.documentElement;

    let frame = 0;
    let x = 0;
    let y = 0;

    const flush = () => {
      frame = 0;
      root.style.setProperty("--pointer-x", x.toFixed(1));
      root.style.setProperty("--pointer-y", y.toFixed(1));
      root.style.setProperty(
        "--pointer-xp",
        (x / window.innerWidth).toFixed(3),
      );
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const sync = () => {
      window.removeEventListener("pointermove", onMove);
      if (fine.matches && !reduced.matches) {
        window.addEventListener("pointermove", onMove, { passive: true });
      } else {
        // Park it off-screen so no card is left mid-glow.
        root.style.setProperty("--pointer-x", "-9999");
        root.style.setProperty("--pointer-y", "-9999");
      }
    };

    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      window.removeEventListener("pointermove", onMove);
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
