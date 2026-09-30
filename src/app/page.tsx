import type { Metadata } from "next";
import { Backing } from "@/components/sections/Backing";
import { Faq } from "@/components/sections/Faq";
import { ScrollFlower } from "@/components/flourish/ScrollFlower";
import { ScrollWash } from "@/components/flourish/ScrollWash";
import { SignalThread } from "@/components/flourish/SignalThread";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Intro } from "@/components/sections/Intro";
import { Limitations } from "@/components/sections/Limitations";
import { News } from "@/components/sections/News";
import { Philosophy } from "@/components/sections/Philosophy";
import { Problem } from "@/components/sections/Problem";
import { Product } from "@/components/sections/Product";
import { Team } from "@/components/sections/Team";
import { Technology } from "@/components/sections/Technology";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/*
        FAQPage, quoting the <Faq> section verbatim. Kept on the home page
        rather than in the root layout: it describes this document, and
        claiming an FAQ on /contact — which has none — is exactly the
        mismatch that costs a rich result.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      {/*
        The page opens on the company's line, and its flower is the way in:
        it grows and turns until the screen is the flower's blue, and the
        blue then fades to leave the hero, which has been sitting underneath
        the statement's last screen (see Philosophy and Hero).
      */}
      <Philosophy />
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
        {/*
          What Blesc is, in three plain sentences, straight before the steps
          that show how it works: 仕組み reads as a sequence of screens, and
          without this it was a sequence of screens for a product the page
          had not yet said it was.
        */}
        <Intro />
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
      {/*
        Who backs the company, straight after who runs it — the people, then
        the institutions behind them.
      */}
      <Backing />
      <News />
      {/*
        After the argument and the news, and last before the footer's
        invitation: someone convinced enough to still be reading is the one
        with objections left, and the answers here are also the page's
        densest block of the plain language people actually search in.
      */}
      <Faq />
    </>
  );
}
