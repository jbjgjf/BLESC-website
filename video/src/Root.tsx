import React from "react";
import { Composition } from "remotion";
import { HeroLoop } from "./HeroLoop";
import { OgCard } from "./OgCard";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 10s at 30fps. Long enough for the flowers to gather without the loop
          becoming something a visitor has to wait through. */}
      <Composition
        id="HeroLoop"
        component={HeroLoop}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Open Graph dimensions. Render as a still for og:image, or as this
          short loop where a platform accepts video. */}
      <Composition
        id="OgCard"
        component={OgCard}
        durationInFrames={90}
        fps={30}
        width={1200}
        height={630}
      />
    </>
  );
};
