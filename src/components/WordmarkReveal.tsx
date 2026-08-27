"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

/**
 * The wordmark, drawn as an outline, with a colour reveal that follows the
 * cursor.
 *
 * Adapted from the supplied TextHoverEffect. Six things changed.
 *
 * The reveal gradient is the palette's three marks rather than the
 * component's yellow / red / mint / cyan / violet, which shares no colour
 * with this site.
 *
 * Strokes are tokens. The original hardcodes neutral-200 with a `dark:`
 * variant, and this site does not use Tailwind's dark strategy at all — it
 * switches on [data-theme], so every `dark:` rule in that component would
 * simply never fire.
 *
 * The draw-in fires when the wordmark is actually reached rather than on
 * mount. It sits at the very bottom of the page, so on mount it animates
 * where nobody is looking and is already finished by the time anyone
 * arrives.
 *
 * `automatic` was declared and never used; the `cx`/`cy`/`r` on the
 * linearGradient are radialGradient attributes and do nothing. Both gone.
 *
 * Without a pointer there is no hover, so the brand stroke stays visible on
 * its own and the wordmark still reads — the reveal is a bonus, not the
 * only thing making it legible.
 */
export function WordmarkReveal({
  text = "BLESC",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(svgRef, { once: true, margin: "0px 0px -15% 0px" });
  const [hovered, setHovered] = useState(false);
  const [mask, setMask] = useState({ cx: "50%", cy: "50%" });

  /*
   * Derived straight from the event rather than kept in a second state and
   * synced in an effect, which is what the original does — that costs an
   * extra render and a frame of lag on every mouse move.
   */
  const track = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMask({
      cx: `${((e.clientX - rect.left) / rect.width) * 100}%`,
      cy: `${((e.clientY - rect.top) / rect.height) * 100}%`,
    });
  };

  const common = {
    x: "50%",
    y: "52%",
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    fontSize: 62,
    fontWeight: 700,
    letterSpacing: "0.02em",
    className: "fill-transparent font-sans",
  };

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={track}
      className={`w-full select-none ${className}`}
    >
      <defs>
        <linearGradient id="wm-colours" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="0">
          <stop offset="0%" stopColor="var(--mark-3)" />
          <stop offset="45%" stopColor="var(--mark-1)" />
          <stop offset="100%" stopColor="var(--mark-2)" />
        </linearGradient>

        <motion.radialGradient
          id="wm-reveal"
          gradientUnits="userSpaceOnUse"
          r="22%"
          initial={false}
          animate={mask}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="wm-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#wm-reveal)" />
        </mask>
      </defs>

      {/* Ghost outline, only while a pointer is over it. */}
      <text
        {...common}
        stroke="var(--color-border-strong)"
        strokeWidth="0.35"
        style={{
          opacity: hovered ? 0.5 : 0,
          transition: "opacity 400ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {text}
      </text>

      {/* The wordmark itself, drawn once on arrival. */}
      <motion.text
        {...common}
        stroke="var(--mark-1)"
        strokeWidth="0.4"
        strokeOpacity={0.55}
        initial={reduce ? false : { strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={inView ? { strokeDashoffset: 0, strokeDasharray: 1000 } : undefined}
        transition={{ duration: 2.4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>

      {/* Colour, revealed under the cursor. */}
      <text
        {...common}
        stroke="url(#wm-colours)"
        strokeWidth="0.5"
        mask="url(#wm-mask)"
      >
        {text}
      </text>
    </svg>
  );
}
