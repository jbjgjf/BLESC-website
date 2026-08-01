import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadNotoSansJP } from "@remotion/google-fonts/NotoSansJP";

/**
 * The same two families the site loads through next/font. Without these,
 * Remotion renders with whatever the headless browser falls back to, and the
 * video quietly stops matching the page it is meant to represent.
 */
const inter = loadInter();
const notoSansJP = loadNotoSansJP();

export const FONT_LATIN = `${inter.fontFamily}, system-ui, sans-serif`;
export const FONT_JA = `${notoSansJP.fontFamily}, ${inter.fontFamily}, 'Hiragino Sans', sans-serif`;

/** Awaited by delayRender in the compositions so no frame renders unstyled. */
export const fontsReady = Promise.all([inter.waitUntilDone(), notoSansJP.waitUntilDone()]);
