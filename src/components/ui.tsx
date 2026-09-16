import type { ComponentProps, ReactNode } from "react";
import { Fragment } from "react";
import { Drift } from "@/components/flourish/Drift";
import { GlassSurface } from "@/components/GlassSurface";

/* -------------------------------------------------------------------------- */
/* Icon                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Material Symbols, outlined style. Every icon on the site comes from here —
 * no emoji, no second icon set. Icons are decorative; the adjacent text
 * always carries the meaning, so they are hidden from assistive tech.
 */
export function Icon({
  name,
  className = "",
  size = 24,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size, width: size, height: size }}
    >
      {name}
    </span>
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
  icon?: string;
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
      className={`glass-btn-${variant} group inline-block rounded-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:scale-[1.02] ${className}`}
      {...props}
    >
      <GlassSurface
        className={`flex items-center justify-center gap-2 ${SIZES[size].text} font-medium tracking-wide ${
          variant === "primary" ? "text-on-accent" : "text-ink"
        }`}
        style={{
          background: "var(--glass-tint)",
          borderRadius: 12,
          padding: SIZES[size].padding,
          transition: "background 300ms cubic-bezier(0.16,1,0.3,1)",
          /*
           * The secondary pill is the page ground at 78%, which on the page
           * ground is nothing: 資料請求 sat on white with no edge to it. Its
           * edge and its lift are tokens per theme (globals.css), because a
           * white pill wants a shadow and a dark pill wants a lit rim.
           */
          ...(variant === "secondary"
            ? {
                border: "1px solid var(--glass-edge)",
                boxShadow: "var(--glass-shadow)",
              }
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
  className = "",
  backdrop,
}: {
  id?: string;
  children: ReactNode;
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
      className={`scroll-mt-24 bg-canvas py-[clamp(5rem,10vw,9rem)] ${className}`}
    >
      {backdrop}
      <Container className="relative">{children}</Container>
    </section>
  );
}

/**
 * Section title.
 *
 * The accent bar that used to sit above it is gone. On a single white
 * ground the heading does not need a coloured tab to announce a boundary —
 * the air above it does that — and six of them down the page read as
 * decoration rather than structure.
 */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    /*
     * Every section head floats a few pixels against the scroll. It is the
     * one depth cue the page repeats, so it lives here rather than in each
     * section: a heading that lags the copy under it by ten pixels across a
     * screen of travel is felt more than seen, which is the right amount.
     * The h2 keeps its own margin, so the wrapper changes no layout.
     */
    <Drift amount={10}>
      <h2 className="type-head mb-10 text-ink md:mb-12">{children}</h2>
    </Drift>
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
