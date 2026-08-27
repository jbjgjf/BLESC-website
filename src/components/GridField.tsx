/**
 * Graph paper with a glow behind it.
 *
 * Adapted from the supplied grid-background. That version carried a
 * `useState` counter it never read, a `cn()` import it never used, and a
 * hardcoded white ground with a slate grid and a magenta orb — none of
 * which survive here. It also owned the page's full-height wrapper; this
 * one is only the painted layer, so it can sit behind a section that
 * already has its own height and background.
 *
 * Everything visual lives in the .grid-field rule in globals.css, because
 * the colours have to flip with the theme and an inline style cannot hold
 * a media query or a [data-theme] branch.
 */
export function GridField({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`grid-field pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
