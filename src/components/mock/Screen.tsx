import type { ReactNode } from "react";

/**
 * The application window inside a <Frame>.
 *
 * Why it exists: what makes a mockup read as software rather than as a
 * diagram is chrome — a card edge, a title bar, a foot. This is that chrome,
 * once, so four screens on a page are four views of one product instead of
 * four different drawings. Nothing in here knows what it contains.
 *
 * The surface token, the hairline and the card shadow are the same three the
 * rest of the site's panels use, so the window belongs to the page even
 * though it sits on a tinted plane.
 *
 * `h-full` by default: the <Frame> sets the height, the window fills it, and
 * the body flexes — so a screen is never taller than the panel it is in, and
 * anything that does not fit is clipped the way a real window clips rather
 * than pushing the layout around.
 */
export function Screen({
  title,
  trailing,
  footer,
  className = "",
  bodyClassName = "",
  children,
}: {
  /** A string is set as the window title; a node (a logo, say) is placed as-is. */
  title?: ReactNode;
  /** Right end of the title bar — a date, a count, a chip. */
  trailing?: ReactNode;
  /** The bar along the foot: a <Composer>, or a <Row> of what came out. */
  footer?: ReactNode;
  className?: string;
  /** Replaces the body's own padding when a figure needs to run wider. */
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[0.875rem] border border-line bg-surface shadow-[var(--shadow-card)] ${className}`}
    >
      {(title || trailing) && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-3.5 py-2.5">
          {typeof title === "string" ? (
            <span className="truncate text-[0.8rem] font-medium tracking-[-0.01em] text-ink">
              {title}
            </span>
          ) : (
            title
          )}
          {trailing}
        </div>
      )}

      {/*
        min-h-0 so a tall child is clipped by this box rather than stretching
        it past the window's own height.
      */}
      <div
        className={`flex min-h-0 flex-1 flex-col ${
          bodyClassName || "px-3.5 py-3"
        }`}
      >
        {children}
      </div>

      {footer && (
        <div className="flex shrink-0 items-center gap-3 border-t border-line px-3.5 py-2.5">
          {footer}
        </div>
      )}
    </div>
  );
}
