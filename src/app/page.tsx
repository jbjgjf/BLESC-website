import type { Metadata } from "next";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Limitations } from "@/components/sections/Limitations";
import { News } from "@/components/sections/News";
import { Philosophy } from "@/components/sections/Philosophy";
import { Problem } from "@/components/sections/Problem";
import { Product } from "@/components/sections/Product";
import { Stats } from "@/components/sections/Stats";
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
      <Hero />
      <Problem />
      <Stats />
      <Limitations />
      <HowItWorks />
      {/* Straight after the flow that produces them: this is what it looks like. */}
      <Product />
      <Technology />
      <Team />
      {/* The closing argument, so it sits last before the news. */}
      <Philosophy />
      {/*
        After the argument and before the news: someone convinced enough to
        still be reading is the one with objections left, and the answers
        here are also the page's densest block of the plain language people
        actually search in.
      */}
      <Faq />
      <News />
    </>
  );
}
