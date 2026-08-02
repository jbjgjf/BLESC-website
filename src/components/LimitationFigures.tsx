/**
 * One drawn figure per structural limitation.
 *
 * Not stock photography and not a placeholder well — each figure is a
 * diagram of the specific claim its paragraph makes, built from the palette.
 * They are decorative (the copy carries the meaning), so all three are
 * aria-hidden.
 */

/** Every row answers the same safe option. A survey that learns nothing. */
export function SurveyFigure({ className = "" }: { className?: string }) {
  const rows = [0, 1, 2, 3, 4];

  return (
    <svg
      aria-hidden
      viewBox="0 0 320 240"
      className={className}
      fill="none"
    >
      {rows.map((r) => {
        const y = 26 + r * 40;
        return (
          <g key={r}>
            {/* question stub */}
            <rect
              x="20"
              y={y}
              width={104 - r * 9}
              height="8"
              rx="4"
              fill="var(--color-border)"
            />
            {/* はい — always the chosen one */}
            <rect
              x="170"
              y={y - 8}
              width="56"
              height="24"
              rx="12"
              fill="currentColor"
              opacity="0.9"
            />
            {/* いいえ — never chosen */}
            <rect
              x="236"
              y={y - 8}
              width="56"
              height="24"
              rx="12"
              fill="none"
              stroke="var(--color-border-strong)"
              strokeWidth="1.5"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** The signal recedes as the case gets worse — the centre is nearly gone. */
export function WithdrawalFigure({ className = "" }: { className?: string }) {
  const rings = [
    { r: 96, o: 0.1 },
    { r: 74, o: 0.18 },
    { r: 54, o: 0.3 },
    { r: 36, o: 0.5 },
    { r: 21, o: 0.75 },
  ];

  return (
    <svg aria-hidden viewBox="0 0 320 240" className={className} fill="none">
      {rings.map((ring) => (
        <circle
          key={ring.r}
          cx="160"
          cy="120"
          r={ring.r}
          stroke="currentColor"
          strokeOpacity={ring.o}
          strokeWidth="2"
          strokeDasharray={ring.r < 40 ? "4 6" : undefined}
        />
      ))}
      {/* the person at the centre, faded almost to nothing */}
      <circle cx="160" cy="120" r="7" fill="currentColor" opacity="0.22" />
    </svg>
  );
}

/** Forty students, one pair of eyes. Most of the grid is never reached. */
export function CapacityFigure({ className = "" }: { className?: string }) {
  const cols = 8;
  const rows = 5;
  const seen = new Set([9, 10, 17, 18]);

  return (
    <svg aria-hidden viewBox="0 0 320 240" className={className} fill="none">
      {Array.from({ length: rows * cols }, (_, i) => {
        const cx = 34 + (i % cols) * 36;
        const cy = 40 + Math.floor(i / cols) * 40;
        const isSeen = seen.has(i);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={isSeen ? 9 : 7}
            fill={isSeen ? "currentColor" : "var(--color-border-strong)"}
            opacity={isSeen ? 0.95 : 0.45}
          />
        );
      })}
    </svg>
  );
}

export const FIGURES = {
  survey: SurveyFigure,
  withdrawal: WithdrawalFigure,
  capacity: CapacityFigure,
} as const;

export type FigureName = keyof typeof FIGURES;
