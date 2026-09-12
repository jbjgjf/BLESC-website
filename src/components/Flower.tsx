/**
 * The brand flower, as supplied.
 *
 * The path is the company's own artwork, lifted out of public/logo/flower.svg
 * and inlined so it can take `currentColor` — the mark appears at 22px in a
 * footer and at 700px as a background wash, in two themes, and an <img> would
 * be stuck at the one blue it was exported in.
 *
 * The source file draws the mark on the full lockup's 999x241 canvas, with the
 * flower itself occupying only the left quarter; the viewBox here is cropped to
 * the mark so `size` means the size of the flower rather than the size of the
 * empty space around it.
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
      viewBox="0 0 250 241"
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, opacity }}
    >
      <path d="M124.6 0.07C125 0.07 125.41 0.07 125.82 0.07C126.87 4.43 134.93 14.48 137.74 18.82C146.51 32.38 154.69 45.44 155.4 62.05C156.01 76.14 149.88 88.32 143.69 100.47C141.67 104.43 136.5 111.68 136.25 115.8C139.41 114.2 142.22 109.44 144.56 106.71C151.16 99.01 158.25 90.3 166.25 84.04C169.88 81.19 174.14 79.44 178.36 77.74C196.11 70.59 211.81 74.72 228.92 81.74C235.43 84.4 244.02 87.37 249.03 92.51C239.88 107.51 226.49 133.59 210.6 141.81C206.77 143.79 202.24 144.85 198.08 145.84C185.3 148.89 172.87 144.41 160.17 142.77C157.73 142.45 148.34 139.89 147.11 141.34C150.03 143.65 154.78 144.69 158.2 146.23C167.7 150.51 178.2 154.24 186.84 160.14C195.39 165.98 205.06 182.36 206.89 192.43C208.4 200.68 208.56 210.05 207.84 218.39C207.41 223.35 207.04 228.65 205.87 233.49C205.3 235.88 204.2 238.49 204.21 240.94C203.19 240.94 202.16 240.94 201.13 240.94C199.75 239.57 185.13 236.67 182.14 235.97C170.24 233.18 155.54 229.35 146.24 220.89C131.2 207.2 130.97 189.12 128.24 170.44C127.51 165.37 127.66 156.53 125.64 152.09C123.46 155.48 124.14 165.99 123.55 170.45C121.21 188.34 121.48 201.72 109.76 216.59C100.15 228.79 84.09 234.09 69.64 237.87C66.48 238.69 55.44 239.65 53.7 240.94C51.77 240.94 49.85 240.94 47.92 240.94C46.21 232.23 46.06 222.77 45.87 213.91C45.52 197.05 44.63 183.11 55.97 169.52C58.68 166.28 61.45 162.54 65.06 160.25C70.41 156.88 76.5 154.55 82.2 151.87C87.1 149.56 91.75 146.64 96.64 144.37C99.67 142.96 107.32 140.53 109.17 138.2C105.82 137.32 91.66 141.7 87.5 142.75C69.91 147.15 52.77 149.18 35.95 140.79C24.67 135.17 13.34 118.41 7.26 107.64C5.87 105.19 1.31 94.15 0.07 93.21C0.07 92.6 0.07 91.99 0.07 91.38C18.91 85.37 37.82 72.28 58.45 74.06C63.88 74.53 69.39 76.95 74.32 79.11C84.29 83.48 94.06 95.36 101.52 103.42C103.18 105.21 110.67 113.72 112.31 113.56C111.4 109.45 107.64 104.94 105.41 101.35C100.3 93.08 95.46 84.1 93.26 74.56C87.92 51.37 101.77 29.98 114.93 12.12C117.89 8.09 122.15 4.36 124.6 0.07Z" fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
