import IntroOverlay from "@/components/ui/IntroOverlay";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Reality from "@/components/sections/Reality";
import HowItWorks from "@/components/sections/HowItWorks";
import Technology from "@/components/sections/Technology";
import Product from "@/components/sections/Product";
import WhyBlesc from "@/components/sections/WhyBlesc";
import Philosophy from "@/components/sections/Philosophy";
import Team from "@/components/sections/Team";
import Process from "@/components/sections/Process";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <IntroOverlay />
      <Header />
      <main id="main-content">
        <Hero />
        <Reality />
        <HowItWorks />
        <Product />
        <WhyBlesc />
        <Technology />
        <Philosophy />
        <Team />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
