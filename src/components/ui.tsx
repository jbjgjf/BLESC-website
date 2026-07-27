import type { ComponentProps, ReactNode } from "react";
import { Fragment } from "react";

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
 * The only permitted button micro-interaction: scale 1 → 1.02 plus a
 * background lighten. #85c0ed is a light fill, so primary buttons carry the
 * dark ground colour as their label (10.1:1) rather than the page's text
 * colour, which would be light-on-light.
 */
export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 " +
    "text-[0.95rem] font-medium tracking-wide transition-[transform,background-color,border-color] " +
    "duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:scale-[1.02]";

  const variants = {
    primary: "bg-accent text-canvas hover:bg-[#9bcdf2]",
    // A translucent white lift reads on both canvas and canvas-alt sections,
    // which a fixed background colour would not.
    secondary: "border border-line text-ink hover:border-ink/30 hover:bg-ink/[0.06]",
  } as const;

  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
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

/** Small uppercase section marker. Muted, never the accent (contrast). */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-6 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
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
