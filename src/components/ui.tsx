import type { ComponentProps, ReactNode } from "react";
import { Fragment } from "react";
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
  children: ReactNode;
};

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
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`glass-btn-${variant} inline-block rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:scale-[1.02] ${className}`}
      {...props}
    >
      <GlassSurface
        className={`flex items-center justify-center gap-2 text-[0.95rem] font-medium tracking-wide ${
          variant === "primary" ? "text-on-accent" : "text-ink"
        }`}
        style={{
          background: "var(--glass-tint)",
          borderRadius: 9999,
          padding: "0.875rem 1.75rem",
          transition: "background 300ms cubic-bezier(0.16,1,0.3,1)",
          ...(variant === "secondary"
            ? { border: "1px solid rgba(242,241,238,0.16)" }
            : null),
        }}
      >
        {children}
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
}: {
  id?: string;
  children: ReactNode;
  /** Alternating section background. */
  alt?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-20 md:py-28 ${
        alt ? "bg-canvas-alt" : "bg-canvas"
      } ${className}`}
    >
      <Container>{children}</Container>
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
    <div className="mb-10 md:mb-12">
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
