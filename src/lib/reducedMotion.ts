"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the visitor has asked for reduced motion — safe to branch rendered
 * output on.
 *
 * motion's own useReducedMotion is null on the server and already true on the
 * first client render for anyone with the setting on, because it reads
 * matchMedia synchronously while hydrating. Any component that picks a
 * different range, style or tree from it therefore renders one thing on the
 * server and another in the hydration pass, and React 19 reports that as a
 * hydration mismatch — for exactly the visitors the setting exists to serve.
 *
 * useSyncExternalStore answers false on the server and false during
 * hydration (it uses the server snapshot there), then re-renders with the
 * real value once hydration is done, and again whenever the setting changes.
 * Motion values that were set up with the moving range pick up the still one
 * on that re-render, so the visitor sees the resting state from the first
 * committed frame after hydration.
 *
 * Use this where the reduced branch changes what is rendered — ranges,
 * styles, which elements exist. Where it only changes a transition passed to
 * an animation that has not started yet, motion's hook is fine.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
