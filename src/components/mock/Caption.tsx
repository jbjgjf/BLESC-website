/**
 * The line of text under a mockup.
 *
 * Why it exists: every <Frame> on the site is aria-hidden, so this is where
 * the claim actually lives — for a screen reader it is the whole figure, and
 * for everyone else it is the sentence the picture is evidence for. The shape
 * is one paragraph in two weights: the lead clause in ink, the continuation
 * muted. That is what lets a grid of four read as four short statements
 * rather than four headings with four paragraphs hanging off them.
 *
 * The numeral is decoration over a list that is already ordered — callers
 * put these inside an <ol>, which is what announces position — so it is
 * hidden from assistive tech rather than read out before the lead.
 */
export function Caption({
  n,
  lead,
  className = "",
  children,
}: {
  /** Step number, e.g. "01". Omit where the figures are not a sequence. */
  n?: string;
  /** The bold first clause. Three or four characters, not a summary. */
  lead: string;
  className?: string;
  /** The muted continuation. One sentence if it can be. */
  children: string;
}) {
  return (
    <p
      className={`measure-jp text-[0.95rem] sm:text-[1rem] ${className}`}
    >
      {n && (
        <span
          aria-hidden
          className="mr-2 text-[0.8rem] font-medium tabular-nums text-mark-1"
        >
          {n}
        </span>
      )}
      <strong className="font-medium tracking-[-0.01em] text-ink">{lead}</strong>
      {/* An ideographic space, which is how Japanese sets this kind of break. */}
      <span className="text-muted">{"　"}{children}</span>
    </p>
  );
}
