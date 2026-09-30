import type { ShaderColor } from "@/components/ShaderBackground";

/*
 * The sky's palette, ground colour first.
 *
 * The shipped preset ran a cyan ramp (#031C26 → #1B6CA8 → #5AD2F4 →
 * #EAF9FF); this is the same shape walked through the site's own ground and
 * blues so the sky introduces no new hue. A pale palette works because the
 * shader's `shade()` averages the palette rather than adding light to a
 * base — the aurora this replaced clamped to white on a pale ground.
 *
 * Shared by the hero and the closing statement band. The two skies bookend
 * the page, and they can only read as the same sky if they are drawn from
 * the same colours. It is the only palette: the site is light only.
 */
export const LIGHT_PALETTE: ShaderColor[] = [
  [1, 1, 1], // #ffffff  --color-bg
  [0.8235, 0.898, 0.9725], // #d2e5f8  high sky
  [0.5647, 0.749, 0.9294], // #90bfed  deeper sky
  [1, 1, 1], // #ffffff  the light source
];
