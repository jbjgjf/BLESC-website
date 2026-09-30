import { LOGO_SRC } from "@/lib/site";

/**
 * The brand mark.
 *
 * One file — the dark wordmark on a transparent ground, drawn for the site's
 * white page — as a plain <img> so this stays a server component and the
 * mark is in the very first paint.
 *
 * `block`, so the mark never sits on a text baseline with a gap under it —
 * every caller is laid out against a block-level mark. None of them passes
 * a display utility; one that needs to hide the mark should wrap it
 * instead, since two display utilities on one element leave the winner to
 * stylesheet order.
 */
export function Logo({
  className = "",
  alt = "",
}: {
  /** Set the height; width follows the artwork's own aspect ratio. */
  className?: string;
  /** Leave empty for decorative use — e.g. inside an already-labelled link. */
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_SRC} alt={alt} className={`block ${className}`} />
  );
}
