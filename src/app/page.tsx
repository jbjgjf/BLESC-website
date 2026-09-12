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
      <News />
      {/*
        The closing statement sits last so it runs straight into the footer's
        invitation: 声にならないSOSに、気づける社会へ。 and then 導入について、
        お話ししませんか。 with nothing between them. The news used to sit
        here, and two rows of announcements between the statement and the
        CTA broke that line of thought.
      */}
      <Philosophy />
    </>
  );
}
