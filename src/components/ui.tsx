import type { ComponentProps, ReactNode } from "react";
import { Fragment } from "react";
import { GlassSurface } from "@/components/GlassSurface";
import { ICON_PATHS, ICON_VIEW_BOX, type IconName } from "@/lib/icons";

/* -------------------------------------------------------------------------- */
/* Icon                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Inline SVG, from the twelve paths in lib/icons — no webfont. Every icon on
 * the site comes from here — no emoji, no second icon set.
 *
 * Icons are decorative; the adjacent text always carries the meaning, so they
 * are hidden from assistive tech.
 *
 * `fill="currentColor"` is what keeps every existing `text-*` class working:
 * the old implementation coloured a glyph via the text colour, and an SVG
 * filled with currentColor inherits exactly the same value, so `text-mark-1`
 * and friends needed no change at the call sites.
 */
export function Icon({
  name,
  className = "",
  size = 24,
}: {
  name: IconName;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={ICON_VIEW_BOX}
      fill="currentColor"
      className={className}
      /*
       * Size only — deliberately no `display` here. Tailwind's preflight
       * already sets `svg { display: block }`, and an inline display would
       * outrank every class, which would silently break the one call site
       * that hides its icon responsively (`hidden md:block` in News). That is
       * the same specificity trap the old icon font's own CSS set, just from
       * the other direction.
       */
      style={{ width: size, height: size }}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: "primary" | "secondary";
  /** md is the page CTAs; sm is the nav pill. */
  size?: "sm" | "md";
  children: ReactNode;
};

const SIZES = {
  sm: { padding: "0.625rem 1.25rem", text: "text-[0.85rem]" },
  md: { padding: "0.875rem 1.75rem", text: "text-[0.95rem]" },
} as const;

/**
 * Hover choreography: the label leaves to the left, and the label with an
 * arrow arrives from the right.
 *
 * The incoming layer is absolutely positioned rather than sharing a grid
 * cell, so the button does not have to reserve width for an arrow it only
 * shows on hover — the pill keeps exactly the width it has today, and the
 * wider hover label spills into the horizontal padding, which is 28px at md
 * and 20px at sm against the ~24px the arrow and its gap need.
 *
 * The duplicate label is aria-hidden. Without that every CTA would announce
 * its own text twice, which is what the component this came from does.
 *
 * `transition-[translate,…]` and not `transform`: Tailwind v4 emits
 * translate as its own CSS property, so a transform transition would leave
 * this snapping rather than easing.
 */
export function HoverSwap({
  children,
  icon = "arrow_forward",
}: {
  children: ReactNode;
  icon?: IconName;
}) {
  const ease =
    "transition-[translate,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";

  return (
    <span className="relative flex items-center justify-center">
      <span className={`${ease} group-hover:-translate-x-2 group-hover:opacity-0`}>
        {children}
      </span>
      <span
        aria-hidden
        className={`absolute inset-0 flex translate-x-2 items-center justify-center gap-1.5 whitespace-nowrap opacity-0 ${ease} group-hover:translate-x-0 group-hover:opacity-100`}
      >
        {children}
        <Icon name={icon} size={18} className="shrink-0" />
      </span>
    </span>
  );
}

/**
 * Liquid-glass control. The anchor keeps the semantics, focus ring and the
 * one permitted micro-interaction (scale 1 → 1.02); the inner lens is the
 * surface, tinted through --glass-tint so the hover lighten still animates.
 *
 * #85c0ed is a light fill, so primary carries the dark ground colour as its
 * label rather than the page's text colour, which would be light-on-light.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`glass-btn-${variant} group inline-block rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:scale-[1.02] ${className}`}
      {...props}
    >
      <GlassSurface
        className={`flex items-center justify-center gap-2 ${SIZES[size].text} font-medium tracking-wide ${
          variant === "primary" ? "text-on-accent" : "text-ink"
        }`}
        style={{
          background: "var(--glass-tint)",
          borderRadius: 9999,
          padding: SIZES[size].padding,
          transition: "background 300ms cubic-bezier(0.16,1,0.3,1)",
          ...(variant === "secondary"
            ? { border: "1px solid rgba(242,241,238,0.16)" }
            : null),
        }}
      >
        <HoverSwap>{children}</HoverSwap>
      </GlassSurface>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[68rem] px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  alt = false,
  className = "",
  backdrop,
}: {
  id?: string;
  children: ReactNode;
  /** Alternating section background. */
  alt?: boolean;
  className?: string;
  /**
   * Painted behind the content, outside the Container so it can run the
   * full width of the section rather than stopping at the 68rem measure.
   * Pair it with `relative overflow-hidden` on className.
   */
  backdrop?: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-16 md:py-24 ${
        alt ? "bg-canvas-alt" : "bg-canvas"
      } ${className}`}
    >
      {backdrop}
      <Container className="relative">{children}</Container>
    </section>
  );
}

/**
 * Section title.
 *
 * Was a 0.78rem uppercase label, which read as a caption rather than the
 * name of the section. Now the second-largest type on the page after the
 * hero headline — clamp tops out at 3.25rem against the hero's 4.25rem — as
 * a real <h2>, with a short accent bar carrying the colour so the heading
 * itself can stay full-strength ink.
 *
 * `accent` takes a complete class name rather than a fragment: Tailwind
 * scans source text, so a interpolated `bg-${x}` would never be generated.
 */
export function SectionTitle({
  children,
  accent = "bg-mark-1",
}: {
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div className="mb-8 md:mb-10">
      <span aria-hidden className={`block h-1 w-14 rounded-full ${accent}`} />
      <h2 className="mt-6 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
        {children}
      </h2>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Japanese copy                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Renders authored line breaks that apply on wide screens only. Japanese has
 * no inter-word spaces, so an unwrapped narrow viewport would otherwise break
 * lines at arbitrary points; below 768px the text rewraps on its own.
 */
export function Lines({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const lines = children.trim().split("\n");

  return (
    <p className={className}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br className="br-wide" />}
        </Fragment>
      ))}
    </p>
  );
}
