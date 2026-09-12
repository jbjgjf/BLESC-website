import { ScrollFlower } from "@/components/flourish/ScrollFlower";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Limitations } from "@/components/sections/Limitations";
import { News } from "@/components/sections/News";
import { Philosophy } from "@/components/sections/Philosophy";
import { Problem } from "@/components/sections/Problem";
import { Product } from "@/components/sections/Product";
import { Team } from "@/components/sections/Team";
import { Technology } from "@/components/sections/Technology";

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      {/*
        The problem and the answer to it are one stretch of argument, so a
        single flower drifts across the pair as you scroll. It is wrapped here
        rather than added inside either section because it has to cross the
        boundary between them.
      */}
      <ScrollFlower>
        <Limitations />
        <HowItWorks />
      </ScrollFlower>
      {/* Straight after the flow that produces them: this is what it looks like. */}
      <Product />
      <Technology />
      <Team />
      {/* The closing argument, so it sits last before the news. */}
      <Philosophy />
      <News />
    </>
  );
}
