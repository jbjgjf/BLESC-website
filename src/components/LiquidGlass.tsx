/**
 * A liquid-glass panel.
 *
 * Adapted from the supplied liquid-glass component. Four things changed.
 *
 * The tint and the inset edge are tokens rather than literal white. The
 * original assumes it sits on a photograph; ours sits on a near-black page
 * in one theme and a near-white one in the other, and a fixed
 * rgba(255,255,255,0.25) is invisible on the second.
 *
 * `rounded-inherit` was doing nothing — it is not a Tailwind class, and
 * neither is `rounded-4xl`. The radius is passed down explicitly instead.
 *
 * The displacement filter is declared once per page rather than once per
 * instance, and its scale is 18 rather than 200. At 200 a panel this size
 * smears into abstraction; the readable part of the effect is the blur, the
 * tint and the lit edge, and those degrade cleanly where the filter does
 * not run.
 *
 * `cursor-pointer` and `text-black` are gone: these panels are not
 * controls, and the text colour belongs to whatever is inside them.
 */
export function GlassFilter() {
  return (
    <svg aria-hidden className="absolute size-0" focusable="false">
      <filter
        id="lg-distort"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.008"
          numOctaves="2"
          seed="17"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="softMap" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="18"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

export function LiquidGlass({
  children,
  className = "",
  radius = "1rem",
}: {
  children: React.ReactNode;
  className?: string;
  radius?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius: radius }}
    >
      {/* The lens: blurs what is behind, then bends it very slightly. */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          borderRadius: radius,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          filter: "url(#lg-distort)",
          isolation: "isolate",
        }}
      />
      {/* The tint. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{ borderRadius: radius, background: "var(--glass-panel)" }}
      />
      {/* The lit edge — what actually sells it as glass rather than as haze. */}
      <div
        aria-hidden
        className="absolute inset-0 z-20"
        style={{ borderRadius: radius, boxShadow: "var(--glass-edge)" }}
      />

      <div className="relative z-30 h-full">{children}</div>
    </div>
  );
}
