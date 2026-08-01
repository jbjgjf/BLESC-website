/**
 * Brand tokens mirrored from the website's globals.css.
 *
 * Kept as a small explicit copy rather than an import: the video workspace is
 * deliberately isolated from the Next app, and a CSS custom property cannot be
 * read at render time anyway. Flower.tsx, by contrast, is copied verbatim from
 * src/components/ui/Flower.tsx — it is pure SVG and renders identically here,
 * so the petals in the video are the same petals as on the page.
 *
 * If globals.css changes, change these.
 */
export const BRAND = {
  /** --bg-primary: warm ivory canvas. */
  ivory: "#faf8f2",
  /** --bg-elevated: the paper surface of every card. */
  paper: "#ffffff",
  /** --text-primary / --text-secondary. */
  ink: "#0f172a",
  inkSoft: "#334155",
  /** --accent: hsl(215, 100%, 46%). */
  accent: "#0069eb",
  /** Warm shadow used by the hero's paper card. */
  shadow: "rgba(70, 58, 36, 0.13)",
  cardBorder: "rgba(70, 58, 36, 0.06)",
} as const;

/** --ease-expo-out, as a cubic-bezier for Remotion's interpolate. */
export const EASE_EXPO_OUT = [0.16, 1, 0.3, 1] as const;
/** --ease-natural-bloom. */
export const EASE_NATURAL_BLOOM = [0.76, 0, 0.1, 1] as const;

export const COPY = {
  titleEn: "Hearing the unspoken.\nPreventing the unseen.",
  titleJa: "生徒のSOSを可視化する。",
  closing: "ひとつずつは、小さなサイン。\n集まれば、支援へのみちしるべになる。",
  wordmark: "blesc",
} as const;

/**
 * The circle the flowers settle into, and where they start scattered — the
 * same arrangement the site's FloralScrolly uses, so the video reads as the
 * page's signature moment rather than a different piece of art.
 */
export type FieldFlower = {
  scatter: { x: number; y: number };
  /** Angle on the final circle, degrees. */
  angle: number;
  variant: "blue" | "pink" | "lavender";
  size: number;
  /** Pressed-sprig look: a thin stem and leaf below the head. */
  sprig?: boolean;
};

/**
 * Eight evenly spaced seats on the circle, 45° apart.
 *
 * Note for the site: FloralScrolly's FIELD uses -90/-30/30/90/150/210/270/330,
 * where -90 and 270 are the same angle, as are -30 and 330 — two pairs land on
 * top of each other. The finale text hides it there; at 1920x1080 it is
 * obvious, so the video seats them properly.
 *
 * Sizes are roughly 2.5x the site's because the stage here is a Full HD frame
 * rather than a viewport-sized section.
 */
export const FIELD: FieldFlower[] = [
  { scatter: { x: 14, y: 18 }, angle: -90, variant: "blue", size: 190, sprig: true },
  { scatter: { x: 84, y: 14 }, angle: -45, variant: "lavender", size: 150 },
  { scatter: { x: 90, y: 58 }, angle: 0, variant: "blue", size: 200, sprig: true },
  { scatter: { x: 76, y: 86 }, angle: 45, variant: "pink", size: 165 },
  { scatter: { x: 24, y: 88 }, angle: 90, variant: "blue", size: 145 },
  { scatter: { x: 8, y: 60 }, angle: 135, variant: "pink", size: 175, sprig: true },
  { scatter: { x: 34, y: 32 }, angle: 180, variant: "lavender", size: 130 },
  { scatter: { x: 66, y: 38 }, angle: 225, variant: "blue", size: 140 },
];

/**
 * Wider than the site's ring, and deliberately elliptical: 16:9 has horizontal
 * room to spare and none vertically, and the closing line has to sit inside the
 * ring without touching the flowers seated at 0° and 180°.
 */
export const CIRCLE = { x: 50, y: 46, rx: 31, ry: 34 } as const;
