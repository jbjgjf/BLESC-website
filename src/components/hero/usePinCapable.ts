"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 48rem) and (hover: hover) and (pointer: fine)";

/**
 * True on a pointer-driven screen wide enough for the 3D treatments.
 *
 * useSyncExternalStore rather than an effect with state: the server snapshot
 * is the honest default (assume capable, which is also what the CSS layout
 * assumes), and the subscription keeps it correct if the window is resized
 * or the page is dragged to another display.
 */
export function usePinCapable() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}
