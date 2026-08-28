import { ImageResponse } from "next/og";
import { DESCRIPTION_SHORT, SITE_NAME, TAGLINE, TAGLINE_EN } from "@/lib/seo";

/**
 * The card every share of the site renders — LINE, X, Slack, Discord,
 * Facebook, and Google's own Discover feed at max-image-preview:large.
 *
 * Generated rather than a checked-in PNG so it can never fall out of step
 * with the tagline: both come from lib/seo.
 */
export const alt = `${SITE_NAME} — ${TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

export default async function OpengraphImage() {
  const jpText = `${TAGLINE}。${DESCRIPTION_SHORT}`;

  /*
   * A network failure here would fail the whole build for the sake of a
   * social card, so the fallback drops to the Latin-only layout — which
   * needs no font file at all — instead of throwing.
   */
  const fonts = await notoSansJp(jpText, 600)
    .then((data) => [
      { name: "Noto Sans JP", data, weight: 600 as const, style: "normal" as const },
    ])
    .catch(() => undefined);

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
          /* The hero's dark palette, so the card reads as the same site. */
          background:
            "linear-gradient(135deg, #0a0b0d 0%, #123c5e 62%, #2e77b8 100%)",
          color: "#ffffff",
          fontFamily: fonts ? "Noto Sans JP" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: "#85c0ed",
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
          {fonts ? (
            <div
              style={{
                display: "flex",
                fontSize: 40,
                lineHeight: 1.4,
                color: "#b8d9f1",
              }}
            >
              {`${TAGLINE}。`}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            lineHeight: 1.5,
            color: "#c3ccd8",
            maxWidth: 900,
          }}
        >
          {fonts ? DESCRIPTION_SHORT : "A school platform that surfaces the signals students never say out loud."}
        </div>
      </div>
    ),
    { ...size, ...(fonts ? { fonts } : null) },
  );
}
