import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Limitations } from "@/components/sections/Limitations";
import { News } from "@/components/sections/News";
import { Philosophy } from "@/components/sections/Philosophy";
import { Problem } from "@/components/sections/Problem";
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
      <WhyBlesc />
      <Technology />
      <Philosophy />
      <Team />
      <News />
    </>
  );
}
