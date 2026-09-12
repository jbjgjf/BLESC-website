import type { ShaderColor } from "@/components/ShaderBackground";

/*
 * The sky's palettes, ground colour first.
 *
 * The shipped preset ran a cyan ramp (#031C26 → #1B6CA8 → #5AD2F4 →
 * #EAF9FF); these are the same shape walked through the site's own tokens so
 * the sky introduces no new hue. Light works because the shader's `shade()`
 * averages the palette rather than adding light to a base — the aurora this
 * replaced clamped to white on a pale ground, which is why it was dark-only.
 *
 * Shared by the hero and the closing statement band. The two skies bookend
 * the page, and they can only read as the same sky if they are drawn from
 * the same colours.
 */
export const DARK_PALETTE: ShaderColor[] = [
  [0.0392, 0.0431, 0.051], // #0a0b0d  --color-bg
  [0.0706, 0.2353, 0.3686], // #123c5e  deep blue
  [0.5216, 0.7529, 0.9294], // #85c0ed  --color-primary
  [1, 1, 1], // #ffffff  --color-text
];

export const LIGHT_PALETTE: ShaderColor[] = [
  [1, 1, 1], // #ffffff  --color-bg
  [0.8235, 0.898, 0.9725], // #d2e5f8  high sky
  [0.5647, 0.749, 0.9294], // #90bfed  deeper sky
  [1, 1, 1], // #ffffff  the light source
];
