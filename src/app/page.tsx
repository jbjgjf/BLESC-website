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
import { WhyBlesc } from "@/components/sections/WhyBlesc";

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <Stats />
      <Limitations />
      <HowItWorks />
      {/* Straight after the flow that produces them: this is what it looks like. */}
      <Product />
      <WhyBlesc />
      <Technology />
      <Philosophy />
      <Team />
      <News />
    </>
  );
}
