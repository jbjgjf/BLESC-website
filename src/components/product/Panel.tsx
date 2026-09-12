import type { ReactNode } from "react";

/**
 * The frame every product picture on the page sits in.
 *
 * One shape for all of them — 1.25rem radius, a hairline border, the card
 * shadow — because on this half of the page the panels are the argument, and
 * two different frame treatments would read as two different products.
 *
 * The liquid-glass wrapper the 仕組み screens used to sit in is gone. Its
 * tint and lit edge exist to separate a panel from a photograph; on a white
 * ground they only put haze over the screen they were meant to frame.
 *
 * Always aria-hidden: every panel is a picture of software drawn from sample
 * data, so the facts it illustrates are written out as real text in the copy
 * beside it rather than left for a screen reader to reconstruct from a
 * staged diary entry and a table of invented roll numbers.
 */
export function Panel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden
      className={`overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}
