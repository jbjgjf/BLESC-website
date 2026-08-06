import { LOGO } from "@/lib/site";

/**
 * The brand mark, in whichever version suits the current theme.
 *
 * Both files are always in the markup and CSS hides one — see the
 * `.logo-on-*` rules in globals.css. That is deliberate over reading the
 * theme in JS: the pre-paint script in the root layout has already stamped
 * data-theme on <html> before first paint, so the correct mark is right on
 * the very first frame with no flash of the wrong one, and this stays a
 * server component. The hidden one is `display: none`, which takes it out of
 * the accessibility tree too, so `alt` never gets announced twice.
 *
 * Two files rather than one recoloured with CSS because a real logo is
 * usually not a single flat shape — it may invert, drop a shadow, or swap a
 * knockout. Point both at the same file if yours does recolour cleanly.
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
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO.onDark}
        alt={alt}
        className={`logo-on-dark ${className}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO.onLight}
        alt={alt}
        className={`logo-on-light ${className}`}
      />
    </>
  );
}
