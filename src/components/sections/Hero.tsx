"use client";

import { IntroFade, WordReveal } from "@/components/Reveal";
import { SilkAurora } from "@/components/SilkAurora";
import { ButtonLink, Container } from "@/components/ui";
import { CTA } from "@/lib/site";

const HEADLINE_LINES = [
  "Hearing the unspoken.",
  "Preventing the unseen.",
];

// Words per line, so the second line picks up where the first left off.
const LINE_OFFSETS = HEADLINE_LINES.reduce<number[]>((acc, line, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + HEADLINE_LINES[i - 1].split(" ").length);
  return acc;
}, []);

const STAGGER = 0.06;
const HEADLINE_START = 0.35;
const TOTAL_WORDS = HEADLINE_LINES.join(" ").split(" ").length;
// Subheadline and CTAs follow 0.2s after the headline finishes.
const AFTER_HEADLINE = HEADLINE_START + TOTAL_WORDS * STAGGER + 0.2;

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[88svh] items-center overflow-hidden bg-canvas pt-32 pb-24 md:min-h-screen"
    >
      <SilkAurora />

      {/*
        Readability scrim. The shader can clamp to near-white where its three
        ribbons overlap, so the copy cannot rely on the aurora staying dark.
        Held at 0.90 across the text column and opened up on the right, which
        keeps the muted subheadline at 4.6:1 and the headline above 11:1 even
        against a hypothetical pure-white aurora.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,11,13,0.92)_0%,rgba(10,11,13,0.90)_58%,rgba(10,11,13,0.35)_100%)]"
      />

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <IntroFade delay={0.05}>
            <p className="text-2xl font-semibold tracking-[-0.02em] text-ink">
              Blesc
            </p>
          </IntroFade>

          <h1 className="mt-8 text-[clamp(2.25rem,6.4vw,4.25rem)] font-medium leading-[1.1] tracking-[-0.03em] text-ink">
            {HEADLINE_LINES.map((line, i) => (
              <span key={line} className="block">
                <WordReveal
                  text={line}
                  stagger={STAGGER}
                  delay={HEADLINE_START + LINE_OFFSETS[i] * STAGGER}
                />
              </span>
            ))}
          </h1>

          <IntroFade delay={AFTER_HEADLINE}>
            <p className="mt-8 text-lg text-muted md:text-xl">
              生徒のSOSを可視化する。
            </p>
          </IntroFade>

          <IntroFade delay={AFTER_HEADLINE + 0.08}>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <ButtonLink variant="secondary" href={CTA.document.href}>
                {CTA.document.label}
              </ButtonLink>
              <ButtonLink variant="primary" href={CTA.consult.href}>
                {CTA.consult.label}
              </ButtonLink>
            </div>
          </IntroFade>
        </div>
      </Container>
    </section>
  );
}
