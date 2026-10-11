import { Inter, Noto_Sans_JP } from "next/font/google";

/**
 * One sans, varied only by weight and size. Inter covers Latin and the
 * numerals; Noto Sans JP picks up kana and kanji, which Inter has no glyphs
 * for. They share a humanist skeleton, so the page still reads as a single
 * typeface rather than a display/body pairing.
 *
 * Declared once, here, because the site has more than one document: a root
 * layout per language and the 404 page each render their own <html>, and
 * all of them have to put the same two variables on it.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/** The classes that define --font-inter and --font-noto-jp, for <html>. */
export const FONT_VARIABLES = `${inter.variable} ${notoSansJp.variable}`;
