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
      className={`scroll-mt-24 py-24 md:py-36 ${
        alt ? "bg-canvas-alt" : "bg-canvas"
      } ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

/**
 * Small uppercase section marker. Muted, never the accent (contrast).
 *
 * Sized up from 0.7rem and pulled in from 0.22em tracking: at that size,
 * letters spaced that widely stop reading as a word and start reading as
 * scattered characters, which is most of why these disappeared.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-6 text-[0.78rem] font-medium uppercase tracking-[0.15em] text-muted">
      {children}
    </p>
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
