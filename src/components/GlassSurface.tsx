"use client";

import { Glass } from "@samasante/liquid-glass";
import type { CSSProperties, ReactNode } from "react";

/**
 * Client boundary for @samasante/liquid-glass.
 *
 * The package ships no "use client" directive but calls useEffect/useState,
 * so importing it straight into a server module breaks the build. Everything
 * that wants glass goes through here.
 *
 * Default "material mode" is what we want for controls: no `size`/`center`,
 * so the lens frosts and tints the page behind it and the children render
 * crisp. Passing geometry instead would refract the children — i.e. smear
 * the button's own label.
 *
 * Degrades honestly: the tint, padding and radius are plain CSS on the Glass
 * element itself, so if the lens no-ops (Safari and Firefox cannot bend the
 * live DOM, and `backdrop-filter: url()` is Chrome/Edge only) the control is
 * still a correctly sized, correctly coloured button.
 */
export function GlassSurface({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Glass className={className} style={style}>
      {children}
    </Glass>
  );
}
