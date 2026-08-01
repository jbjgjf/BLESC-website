import React from "react";
import { AbsoluteFill, interpolate, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import Flower from "./Flower";
import { BRAND, COPY, EASE_EXPO_OUT, EASE_NATURAL_BLOOM } from "./brand";
import { FONT_JA, FONT_LATIN } from "./fonts";

const bloom = Easing.bezier(...EASE_NATURAL_BLOOM);
const expoOut = Easing.bezier(...EASE_EXPO_OUT);

/**
 * Share card: the hero's paper card, rendered at OG dimensions.
 *
 * Renders as a still (`npm run still:og`) for og:image, or as a short loop
 * (`npm run render:og`) for social posts that accept video. The current
 * og:image is a static logo PNG; this puts the actual hero on the card.
 */
export const OgCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  const cardScale = interpolate(progress, [0, 0.35], [0.965, 1], {
    extrapolateRight: "clamp",
    easing: bloom,
  });
  const cardOpacity = interpolate(progress, [0, 0.16], [0, 1], { extrapolateRight: "clamp" });
  const lift = interpolate(progress, [0, 0.4], [16, 0], {
    extrapolateRight: "clamp",
    easing: expoOut,
  });

  const petal = (delay: number) =>
    interpolate(progress, [delay, delay + 0.3], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: bloom,
    });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.ivory,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 44%, rgba(120,168,220,0.22), rgba(250,248,242,0) 64%)",
        }}
      />

      <div
        style={{
          position: "relative",
          background: BRAND.paper,
          border: `1px solid ${BRAND.cardBorder}`,
          borderRadius: 10,
          boxShadow: `0 2px 6px rgba(70,58,36,0.07), 0 28px 70px ${BRAND.shadow}`,
          padding: "64px 88px",
          textAlign: "center",
          transform: `scale(${cardScale}) translateY(${lift}px) rotate(-1.2deg)`,
          opacity: cardOpacity,
        }}
      >
        <div style={{ position: "absolute", top: -34, left: -28, opacity: petal(0.12) }}>
          <Flower variant="blue" size={78} rotate={18} />
        </div>
        <div style={{ position: "absolute", bottom: -30, right: -22, opacity: petal(0.24) }}>
          <Flower variant="pink" size={66} rotate={-24} />
        </div>

        <h1
          style={{
            margin: 0,
            whiteSpace: "pre-line",
            color: BRAND.ink,
            fontFamily: FONT_LATIN,
            fontSize: 56,
            fontWeight: 600,
            lineHeight: 1.32,
            letterSpacing: "-0.01em",
          }}
        >
          {COPY.titleEn}
        </h1>
        <p
          style={{
            margin: "26px 0 0",
            color: BRAND.inkSoft,
            fontFamily: FONT_JA,
            fontSize: 27,
            letterSpacing: "0.06em",
          }}
        >
          {COPY.titleJa}
        </p>
      </div>

      <p
        style={{
          position: "absolute",
          bottom: 46,
          margin: 0,
          color: BRAND.inkSoft,
          fontFamily: FONT_LATIN,
          fontSize: 22,
          letterSpacing: "0.34em",
          opacity: cardOpacity,
        }}
      >
        {COPY.wordmark}
      </p>
    </AbsoluteFill>
  );
};
