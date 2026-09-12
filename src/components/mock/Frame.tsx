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
 * colour. That alpha is chosen so the plane works in both themes without a
 * theme-specific rule: over the white ground --mark-1 lands on #f5f8fb,
 * which is the site's own second surface with a blue cast; over the near-
 * black ground it lands on #101418, a visible lift off the canvas that is
 * still darker than --surface-raised — so the <Screen> inside it reads as
 * raised in both builds rather than inverting in one of them.
 *
 * Always aria-hidden. Every mockup is drawn from sample data, so the claim a
 * screen illustrates is carried as real text by the <Caption> beneath it.
 *
 * Height comes from the caller (`className="h-[17rem]"`), because a row of
 * these only looks deliberate when every panel in it is the same height —
 * and that is a decision about the grid, not about one panel.
 */
export function Frame({
  tint = 1,
  className = "",
  children,
}: {
  /** Which meaning mark tints the plane. 1 blue, 2 violet, 3 green. */
  tint?: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center overflow-hidden rounded-[1.5rem] p-4 sm:p-6 ${TINTS[tint]} ${className}`}
    >
      {children}
    </div>
  );
}

/** Written out in full — Tailwind only generates classes it can read. */
const TINTS = {
  1: "bg-mark-1/5",
  2: "bg-mark-2/5",
  3: "bg-mark-3/5",
} as const;
