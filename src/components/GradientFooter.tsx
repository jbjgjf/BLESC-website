"use client";

/*
 * Gradient footer — the content reads first; a blurred glow is pinned to the
 * bottom of the viewport and stretches up from the floor over the last stretch
 * of scroll, reaching full height exactly as you hit the end of the page.
 * One inline <svg>, no canvas, no scroll spacer.
 *
 * Adapted from Ruixen's gradient footer. Its stop ramp was a full rainbow
 * (ember → blue → white → yellow → red-orange → magenta); this one is built
 * from the site's own palette so the glow reads as the same light as the hero
 * aurora rather than introducing seven new hues.
 */

import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

type Stop = { offset: number; color: string };

const VBW = 1271;
const VBH = 599;

/**
 * Floor (0) → top (1). Same rhythm as the original — deep floor, saturated
 * body, bright core, fade to nothing — but walked through --color-primary and
 * --color-text instead of around the colour wheel. The near-white at the peak
 * is the aurora's own sheen colour.
 */
const BLESC_STOPS: Stop[] = [
  { offset: 0, color: "#050A10" },
  { offset: 0.1827, color: "#0B3C6E" },
  { offset: 0.2837, color: "#2E77B8" },
  { offset: 0.4135, color: "#85C0ED" },
  { offset: 0.5866, color: "#F2F1EE" },
  { offset: 0.6827, color: "#BBD9F1" },
  { offset: 0.8029, color: "#85C0ED" },
  { offset: 1, color: "#85C0ED00" },
];

/** Gentle power falloff: short edges, tallest middle. */
function bellHeights(n: number, peak: number, valley: number): number[] {
  const out: number[] = [];
  const mid = (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const t = mid === 0 ? 0 : Math.abs(i - mid) / mid;
    const eased = 1 - Math.pow(t, 1.24);
    out.push(peak * VBH * (valley + (1 - valley) * eased));
  }
  return out;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface GradientFooterProps {
  children?: ReactNode;
  /**
   * Height of the glow band pinned to the viewport bottom. Doubles as the
   * scroll distance the reveal takes and the room reserved under the content.
   *
   * Capped in px as well as vh on purpose. At the page bottom the viewport
   * shows the last screenful, so the footer's own content has to fit in
   * `100vh - gradientHeight`; a pure vh value keeps that budget shrinking as
   * the viewport does, while the content stays the same height, and the
   * copyright line ends up sitting on the bright part of the glow.
   */
  gradientHeight?: string;
  /**
   * Resting height of the glow as a fraction of the band. Defaults to 0 so
   * nothing shows until the last screen — at the upstream default of 0.045 a
   * coloured strip sits across the bottom of every section, including the
   * quiet ones.
   */
  minReveal?: number;
  bars?: number;
  /** Blur in viewBox units. */
  blur?: number;
  /** Peak height as a fraction of the viewBox. */
  peak?: number;
  /** Edge height as a fraction of the peak. */
  valley?: number;
  stops?: Stop[];
  className?: string;
  style?: CSSProperties;
}

export function GradientFooter({
  children,
  gradientHeight = "min(42vh, 400px)",
  minReveal = 0,
  bars = 9,
  blur = 15,
  peak = 0.98,
  valley = 0.55,
  stops = BLESC_STOPS,
  className,
  style,
}: GradientFooterProps) {
  const uid = useId().replace(/:/g, "");
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;

    const doc = el.ownerDocument;
    const win = doc.defaultView ?? window;

    if (win.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Scroll-linked or not, this is movement. Show the glow at rest instead.
      el.style.transform = "scaleY(1)";
      return;
    }

    let frame = 0;

    const apply = () => {
      frame = 0;
      // offsetHeight ignores the transform, so the band can measure itself.
      const h = el.offsetHeight || 1;
      // Scroll remaining before the end of the page: the glow starts rising
      // once that's within its own height and is full at the bottom.
      const left =
        doc.documentElement.scrollHeight - win.innerHeight - win.scrollY;
      const t = clamp01((h - left) / h);
      /*
       * Written straight to the node rather than through React state. The SVG
       * never changes — only this transform does — and routing it through a
       * re-render would rebuild nine blurred rects on every scroll event.
       */
      el.style.transform = `scaleY(${minReveal + (1 - minReveal) * t})`;
    };

    const measure = () => {
      if (!frame) frame = win.requestAnimationFrame(apply);
    };

    apply();
    win.addEventListener("scroll", measure, { passive: true });
    win.addEventListener("resize", measure, { passive: true });

    return () => {
      if (frame) win.cancelAnimationFrame(frame);
      win.removeEventListener("scroll", measure);
      win.removeEventListener("resize", measure);
    };
  }, [minReveal]);

  const colW = VBW / bars;

  return (
    // The glow is pinned to the viewport, so the footer reserves the same
    // height beneath its content for it to land in.
    <footer
      className={className}
      style={{ paddingBottom: gradientHeight, ...style }}
    >
      {children}

      {/*
        Fixed to the viewport — a transformed or filtered ancestor would
        capture it, so this footer must stay a plain containing block. It sits
        below the nav's z-50 and the progress bar's z-60 on purpose.
      */}
      <div
        ref={bandRef}
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: gradientHeight,
          pointerEvents: "none",
          transformOrigin: "bottom",
          transform: `scaleY(${minReveal})`,
          willChange: "transform",
        }}
      >
        <svg
          style={{ height: "100%", width: "100%", display: "block" }}
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`grad-${uid}`} x1="0" y1="1" x2="0" y2="0">
              {stops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
            <filter
              id={`blur-${uid}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          </defs>
          {bellHeights(bars, peak, valley).map((barH, i) => (
            <g key={i} filter={`url(#blur-${uid})`}>
              <rect
                x={i * colW}
                y={VBH - barH}
                width={colW * 1.23}
                height={barH}
                fill={`url(#grad-${uid})`}
              />
            </g>
          ))}
        </svg>
      </div>
    </footer>
  );
}
