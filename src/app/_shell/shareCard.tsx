import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n";
import {
  CARD_SIZE,
  DESCRIPTIONS_SHORT,
  SITE_NAME,
  TAGLINES,
  TAGLINE_EN,
} from "@/lib/seo";
import { LIGHT_PALETTE } from "@/lib/sky";

/*
 * The page's tokens, as the literals globals.css defines them: Satori draws
 * with no stylesheet, so var(--…) has nothing to resolve against. If a token
 * changes there, change it here.
 */
const PAGE = "#ffffff"; // --color-bg
const INK = "#0b0d12"; // --color-text
const MUTED = "#576172"; // --color-text-muted
const MARK_1 = "#2b6ea3"; // --mark-1
const PRIMARY = "#85c0ed"; // --color-primary

/*
 * The sky's two blues, read from the palette the hero and the closing
 * statement draw their skies with rather than copied, so the card's wash
 * cannot drift from them.
 */
const HIGH_SKY = 1;
const DEEP_SKY = 2;
const sky = (stop: number, alpha = 1) => {
  const [r, g, b] = LIGHT_PALETTE[stop].map((c) => Math.round(c * 255));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Satori (which backs ImageResponse) ships no CJK glyphs, so without a real
 * font file every Japanese character renders as tofu. Google's css2 endpoint
 * serves TrueType — the one format Satori accepts — when the request carries
 * no browser User-Agent, and `text=` subsets the file to just the characters
 * on the card, which keeps it a few KB rather than a few megabytes.
 */
async function notoSansJp(text: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(
      text,
    )}`,
  ).then((r) => r.text());

  const url = css.match(/src: url\((https:\/\/[^)]+)\) format\('truetype'\)/)?.[1];
  if (!url) throw new Error("Noto Sans JP: no TrueType source in css2 response");

  return fetch(url).then((r) => r.arrayBuffer());
}

/**
 * The card's two lines of copy under the headline, per language: the
 * tagline as a sentence, and the short description. Both are lib/seo's, so
 * the card says what the page's own tags say.
 *
 * The headline above them is TAGLINE_EN on both cards, as it is in both
 * heroes.
 */
const COPY: Record<Locale, { line: string; description: string }> = {
  ja: { line: `${TAGLINES.ja}。`, description: DESCRIPTIONS_SHORT.ja },
  en: { line: `${TAGLINES.en}.`, description: DESCRIPTIONS_SHORT.en },
};

/**
 * What the Japanese card says under the headline when its font cannot be
 * fetched: Latin only, which the built-in face can draw.
 */
const LATIN_FALLBACK =
  "A school platform that surfaces the signals students never say out loud.";

/**
 * The card every share of the site renders — LINE, X, Slack, Discord,
 * Facebook, and Google's own Discover feed at max-image-preview:large — in
 * the language of the page being shared.
 *
 * Generated rather than a checked-in PNG so it can never fall out of step
 * with the tagline: both come from lib/seo.
 *
 * Two routes draw it: app/opengraph-image.tsx in Japanese and
 * app/en/opengraph-image.tsx in English (each re-exported as the X card
 * beside it). The English card is all Latin, so it is given no font file
 * and makes no request: ImageResponse sets it in the face it ships with,
 * Geist.
 *
 * That is close to the Japanese card's headline but not the same face.
 * Given a font list, ImageResponse drops its own default, and for letters
 * the list lacks — the Japanese subset holds none of the headline's — it
 * fetches Noto Sans on demand. So the one English line the two cards share
 * is Noto Sans on the Japanese card and Geist on the English one. To make
 * them match, hand the English card Noto Sans the way notoSansJp fetches
 * its subset; it was left as it is so that the English card cannot fail on
 * the network.
 */
export async function shareCard(locale: Locale) {
  const copy = COPY[locale];

  /*
   * A network failure here would fail the whole build for the sake of a
   * social card, so the fallback drops to the Latin-only layout — which
   * needs no font file at all — instead of throwing.
   */
  const fonts =
    locale === "ja"
      ? await notoSansJp(`${copy.line}${copy.description}`, 600)
          .then((data) => [
            {
              name: "Noto Sans JP",
              data,
              weight: 600 as const,
              style: "normal" as const,
            },
          ])
          .catch(() => undefined)
      : undefined;

  /* Japanese without its font is tofu, so those two lines give way. */
  const drawable = locale === "en" || fonts !== undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 88px",
          /*
           * The page's own white with the hero's sky over it as a wash, so a
           * share looks like the page it opens: the site is light only, and
           * the card used to be navy. The deeper sky blooms from the top-right
           * corner, where there is no copy, through the high sky to nothing;
           * a faint high sky rises from the foot. The left half, where the
           * copy sits, stays white or close to it.
           *
           * Measured against the rendered card: the deepest pixel is #90bfed
           * in the corner, and no copy sits there. Under the copy, ink holds
           * 13.05:1 at its worst (the headline's right end, #bad7f3), the
           * Japanese line in mark-1 5.19:1 and the description in muted
           * 5.43:1. Muted and mark-1 would fall to 3.23 and 2.81:1 on the
           * corner itself — which is why the bloom stays in it.
           */
          backgroundColor: PAGE,
          backgroundImage: [
            `radial-gradient(ellipse 62% 96% at 96% 0%, ${sky(DEEP_SKY)} 0%, ${sky(DEEP_SKY, 0.62)} 34%, ${sky(HIGH_SKY, 0.7)} 62%, ${sky(HIGH_SKY, 0)} 100%)`,
            `radial-gradient(ellipse 80% 58% at 60% 110%, ${sky(HIGH_SKY, 0.85)} 0%, ${sky(HIGH_SKY, 0)} 100%)`,
          ].join(", "),
          color: INK,
          fontFamily: fonts ? "Noto Sans JP" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: PRIMARY,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 34,
              letterSpacing: "0.02em",
              opacity: 0.95,
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              fontSize: 66,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
            }}
          >
            {TAGLINE_EN}
          </div>
          {drawable ? (
            <div
              style={{
                display: "flex",
                fontSize: 40,
                lineHeight: 1.4,
                color: MARK_1,
              }}
            >
              {copy.line}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            lineHeight: 1.5,
            color: MUTED,
            maxWidth: 900,
          }}
        >
          {drawable ? copy.description : LATIN_FALLBACK}
        </div>
      </div>
    ),
    { ...CARD_SIZE, ...(fonts ? { fonts } : null) },
  );
}
