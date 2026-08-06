/**
 * Builds a placeholder portrait card as an inline SVG data URI.
 *
 * Deliberately not a stock photo: these stand in for real colleagues, and a
 * photograph of an identifiable stranger beside an invented name reads as a
 * genuine team page. Initials are unmistakably a placeholder.
 *
 * No network request and no CORS, so the WebGL texture upload can never be
 * tainted or race a slow CDN.
 */
export function initialsCard(initials: string, tintShift = 0) {
  // Small hue walk across the roster so ten cards aren't identical.
  const hue = 205 + (tintShift % 5) * 6;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
<stop offset="0" stop-color="hsl(${hue} 14% 14%)"/>
<stop offset="1" stop-color="hsl(${hue} 16% 9%)"/>
</linearGradient>
</defs>
<rect width="800" height="1000" fill="url(#g)"/>
<circle cx="400" cy="500" r="235" fill="none" stroke="hsl(${hue} 30% 45%)" stroke-width="3" opacity="0.5"/>
<text x="400" y="500" font-family="Inter, -apple-system, system-ui, sans-serif" font-size="210" font-weight="500" letter-spacing="6" fill="#85c0ed" text-anchor="middle" dominant-baseline="central">${initials}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
