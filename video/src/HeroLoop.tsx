import React from "react";
import { AbsoluteFill, interpolate, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import Flower from "./Flower";
import { BRAND, CIRCLE, COPY, EASE_EXPO_OUT, EASE_NATURAL_BLOOM, FIELD, type FieldFlower } from "./brand";
import { FONT_JA } from "./fonts";

const bloom = Easing.bezier(...EASE_NATURAL_BLOOM);
const expoOut = Easing.bezier(...EASE_EXPO_OUT);

/**
 * The page's signature moment as a standalone loop: scattered flowers drift,
 * converge into a ring, and the closing line blooms in the middle.
 *
 * Built to sit behind or beside the site rather than inside it — the hero
 * itself stays scroll-driven, because a video cannot answer to the reader's
 * scroll position the way FloralScrolly does.
 */

function ConvergingFlower({
  flower,
  progress,
}: {
  flower: FieldFlower;
  progress: number;
}) {
  const endX = CIRCLE.x + CIRCLE.rx * Math.cos((flower.angle * Math.PI) / 180);
  const endY = CIRCLE.y + CIRCLE.ry * Math.sin((flower.angle * Math.PI) / 180);

  const left = interpolate(progress, [0.18, 0.62], [flower.scatter.x, endX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: bloom,
  });
  const top = interpolate(progress, [0.18, 0.62], [flower.scatter.y, endY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: bloom,
  });
  // A drift outward before the pull inward, so the convergence reads as a
  // gathering rather than a snap.
  const drift = interpolate(progress, [0, 0.18, 0.62], [0, -26, 0], {
    extrapolateRight: "clamp",
    easing: expoOut,
  });
  const rotate = interpolate(progress, [0.18, 0.62], [flower.angle * 0.4, flower.angle + 90], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: bloom,
  });
  const scale = interpolate(progress, [0.18, 0.62], [1, 0.84], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: bloom,
  });
  const opacity = interpolate(progress, [0, 0.08], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, calc(-50% + ${drift}px)) rotate(${rotate}deg) scale(${scale})`,
        opacity,
      }}
    >
      <Flower variant={flower.variant} size={flower.size} sprig={flower.sprig} />
    </div>
  );
}

export const HeroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  // Stronger than the site's halo: those values were tuned against a
  // viewport-sized section and read as almost nothing across a Full HD frame.
  const haloOpacity = interpolate(progress, [0, 0.55, 0.9], [0.35, 0.6, 1], { easing: expoOut });
  const haloScale = interpolate(progress, [0.3, 0.85], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: bloom,
  });
  const ringOpacity = interpolate(progress, [0.5, 0.74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const messageOpacity = interpolate(progress, [0.62, 0.78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: expoOut,
  });
  const messageScale = interpolate(progress, [0.62, 0.86], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: bloom,
  });
  // Hold, then fade the whole frame so the loop rejoins its own first frame.
  const loopFade = interpolate(progress, [0.93, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ivory, opacity: loopFade }}>
      <AbsoluteFill
        style={{
          opacity: haloOpacity,
          transform: `scale(${haloScale})`,
          background: `radial-gradient(circle at 50% 46%, rgba(120,168,220,0.5), rgba(250,248,242,0) 66%)`,
        }}
      />

      <AbsoluteFill
        style={{
          opacity: ringOpacity,
          background: `radial-gradient(circle at 50% 46%, rgba(250,248,242,0) 27%, rgba(175,151,221,0.34) 29%, rgba(250,248,242,0) 33%)`,
        }}
      />

      <AbsoluteFill>
        {FIELD.map((flower) => (
          <ConvergingFlower key={flower.angle} flower={flower} progress={progress} />
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: messageOpacity,
          transform: `scale(${messageScale})`,
        }}
      >
        <p
          style={{
            margin: 0,
            whiteSpace: "pre-line",
            textAlign: "center",
            color: BRAND.ink,
            fontFamily: FONT_JA,
            fontSize: 52,
            fontWeight: 600,
            lineHeight: 1.9,
            letterSpacing: "0.03em",
            // Keeps the measure clear of the flowers seated on the ring.
            maxWidth: 1040,
          }}
        >
          {COPY.closing}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
