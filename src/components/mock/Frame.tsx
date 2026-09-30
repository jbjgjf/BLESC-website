import type { ReactNode } from "react";

/**
 * The soft tinted panel a product mockup sits in.
 *
 * Why it exists: a screenshot dropped straight onto the page ground reads as
 * a diagram of the page, not as software. Setting it inside a larger tinted
 * plane puts air around the screen and says "this is a picture of the
 * product" before a single word is read — which is the whole difference
 * between a figure that explains and a figure that shows.
 *
 * The tint is one of the three meaning marks at 5%, i.e. a *token*, not a
 * colour: over the white ground --mark-1 lands on #f4f8fa, the site's own
 * second surface with a blue cast, which is just enough lift for the white
 * <Screen> inside it to read as raised.
 *
 * Always aria-hidden. Every mockup is drawn from sample data, so the claim a
 * screen illustrates is carried as real text beside or beneath it.
 *
 * `label` puts a <ViewLabel> — whose screen this is — at the top of the
 * plane, outside the window, and the window takes the height that is left.
 * Without one the markup is exactly what it always was, so a figure that
 * does not need to say whose it is lays out as it did before the prop
 * existed.
 *
 * Height comes from the caller (`className="h-[17rem]"`), because a row of
 * these only looks deliberate when every panel in it is the same height —
 * and that is a decision about the grid, not about one panel.
 *
 * p-3 below sm, not p-4. At 320px a window's title bar has 210px to hold
 * its title and badge, and the composer's note lost its last character the
 * same way; the 8px this returns, with the 4px the window's own bars give
 * back, is what lets both fit.
 */
export function Frame({
  tint = 1,
  label,
  className = "",
  children,
}: {
  /** Which meaning mark tints the plane. 1 blue, 2 violet, 3 green. */
  tint?: 1 | 2 | 3;
  /** A <ViewLabel> naming whose screen this is. */
  label?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  if (!label) {
    return (
      <div
        aria-hidden
        className={`flex items-center justify-center overflow-hidden rounded-[1.5rem] p-3 sm:p-6 ${TINTS[tint]} ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`flex flex-col gap-3 overflow-hidden rounded-[1.5rem] p-3 sm:gap-4 sm:p-6 ${TINTS[tint]} ${className}`}
    >
      <div className="flex shrink-0">{label}</div>
      {/*
        min-h-0 so the window is clipped to what is left under the label
        rather than pushing the panel taller than the height it was given.
      */}
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/** Written out in full — Tailwind only generates classes it can read. */
const TINTS = {
  1: "bg-mark-1/5",
  2: "bg-mark-2/5",
  3: "bg-mark-3/5",
} as const;
