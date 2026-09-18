import { FLOWER_PATH, FLOWER_VIEWBOX } from "@/lib/flower";

/**
 * The brand flower, as supplied.
 *
 * The path is the company's own artwork, lifted out of public/logo/flower.svg
 * and inlined so it can take `currentColor` — the mark appears at 22px in a
 * footer and at 700px as a background wash, in two themes, and an <img> would
 * be stuck at the one blue it was exported in.
 *
 * The source file draws the mark on the full lockup's 999x241 canvas, with the
 * flower itself occupying only the left quarter; the viewBox here is cropped to
 * the mark so `size` means the size of the flower rather than the size of the
 * empty space around it.
 *
 * Purely decorative: aria-hidden everywhere, never carries meaning.
 */
export function Flower({
  size = 24,
  className = "",
  rotate = 0,
  opacity = 1,
}: {
  size?: number;
  className?: string;
  rotate?: number;
  opacity?: number;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      width={size}
      height={size}
      viewBox={FLOWER_VIEWBOX}
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, opacity }}
    >
      <path d={FLOWER_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
