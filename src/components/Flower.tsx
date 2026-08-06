/**
 * A small five-petal flower, drawn as inline SVG.
 *
 * Five petals and a pale eye is roughly a nemophila — "baby blue eyes" —
 * which is the flower #85c0ed already looks like, so the ornament borrows the
 * palette rather than adding to it. Petals take `currentColor`, so a flower
 * picks up whatever text colour it sits in.
 *
 * Purely decorative: aria-hidden everywhere, never carries meaning.
 */
export function Flower({
  size = 24,
  className = "",
  rotate = 0,
  opacity = 1,
}: {
  size?: number;
  className?: string;
  rotate?: number;
  opacity?: number;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, opacity }}
    >
      <g fill="currentColor">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx="50"
            cy="27"
            rx="14"
            ry="23"
            transform={`rotate(${i * 72} 50 50)`}
          />
        ))}
      </g>
      {/* The eye sits on the page ground so the petals read as separate. */}
      <circle cx="50" cy="50" r="9.5" fill="var(--color-bg)" />
      <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

type Scatter = {
  /** Percentage offsets within the parent, so they scale with the box. */
  top: string;
  left?: string;
  right?: string;
  size: number;
  rotate: number;
  opacity: number;
  className: string;
};

/**
 * A few flowers placed in a section's margins.
 *
 * Absolutely positioned and pointer-events-none, so nothing here can shift
 * layout or intercept a click. Kept sparse on purpose — this is a page about
 * student distress, and a dense scatter would read as decoration for its own
 * sake.
 */
export function FlowerScatter({ items }: { items: Scatter[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {items.map((f, i) => (
        <span
          key={i}
          className={`absolute ${f.className}`}
          style={{ top: f.top, left: f.left, right: f.right }}
        >
          <Flower size={f.size} rotate={f.rotate} opacity={f.opacity} />
        </span>
      ))}
    </div>
  );
}
