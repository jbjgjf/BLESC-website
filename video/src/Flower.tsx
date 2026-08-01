import { useId } from "react";

export type FlowerVariant = "blue" | "pink" | "lavender";

const PALETTES: Record<FlowerVariant, { inner: string; outer: string; edge: string }> = {
  blue: { inner: "#cfe4f7", outer: "#5b9bd9", edge: "#3f7fc1" },
  pink: { inner: "#fbe3e8", outer: "#eda4b2", edge: "#d97f92" },
  lavender: { inner: "#e9e2f8", outer: "#af97dd", edge: "#8f74c4" },
};

const PETAL_PATH = "M0 2 C 11 -8, 15 -26, 0 -40 C -15 -26, -11 -8, 0 2 Z";

type FlowerProps = {
  variant?: FlowerVariant;
  size?: number;
  /** Rotation of the flower head, degrees. */
  rotate?: number;
  /** Render a thin stem with a small leaf below the head (pressed-sprig look). */
  sprig?: boolean;
  className?: string;
};

/**
 * Five-petal flower drawn to match the brand's floral asset set:
 * soft gradient petals, warm golden heart, optional pressed-flower stem.
 */
export default function Flower({ variant = "blue", size = 64, rotate = 0, sprig = false, className }: FlowerProps) {
  const gradientId = useId();
  const palette = PALETTES[variant];
  const viewBox = sprig ? "-50 -50 100 150" : "-50 -50 100 100";
  const height = sprig ? size * 1.5 : size;

  return (
    <svg
      width={size}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="62%" r="72%">
          <stop offset="0%" stopColor={palette.inner} />
          <stop offset="72%" stopColor={palette.outer} />
          <stop offset="100%" stopColor={palette.edge} />
        </radialGradient>
      </defs>

      {sprig && (
        <g>
          <path
            d="M0 6 C 4 34, -6 62, 2 92"
            stroke="#4a5d3a"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="-9" cy="52" rx="10" ry="4.5" fill="#5d7548" transform="rotate(-38 -9 52)" />
        </g>
      )}

      <g transform={`rotate(${rotate})`}>
        {[0, 72, 144, 216, 288].map((angle) => (
          <path key={angle} d={PETAL_PATH} fill={`url(#${gradientId})`} transform={`rotate(${angle})`} />
        ))}
        <circle cx="0" cy="0" r="7" fill="#f0d492" />
        <circle cx="-2" cy="-2" r="2.6" fill="#f9ecc9" />
      </g>
    </svg>
  );
}
