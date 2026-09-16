import { ScrollFlower } from "@/components/flourish/ScrollFlower";
import { ScrollWash } from "@/components/flourish/ScrollWash";
import { SignalThread } from "@/components/flourish/SignalThread";
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
      {/*
        The signal thread runs from the analysis in 仕組み through the report
        in プロダクト to the graph in テクノロジー — across both of the
        wrappers below. It is rendered once inside each of them, as the first
        child, rather than once in a wrapper around the pair: a layer has to
        sit inside the same positioned box as a section's bg-canvas fill to
        paint above that fill and below the section's Container, and a layer
        in an outer box is painted before both inner boxes and buried under
        their fills. Each instance draws the whole thread in its own box's
        coordinates and is clipped to that box, so the two halves meet at
        the boundary as one line. ScrollFlower is unchanged; it simply gains
        a child.
      */}
      <ScrollFlower>
        <SignalThread />
        <Limitations />
        <HowItWorks />
      </ScrollFlower>
      {/*
        Straight after the flow that produces them: this is what it looks
        like, and what produced it. A wash of the logo's blue drifts across
        the pair, the counterpart of the flower above: it enters on the
        right behind the product figure and crosses to the left behind the
        graph. Wrapped here for the same reason the flower is — it crosses
        the boundary between the two sections, so it has to be positioned
        against the pair.
      */}
      <ScrollWash>
        <SignalThread />
        <Product />
        <Technology />
      </ScrollWash>
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
