"use client";

import { AppMock } from "@/components/hero/AppMock";
import { DeviceScroll } from "@/components/hero/DeviceScroll";
import { IntroFade, WordReveal } from "@/components/Reveal";
import { ShaderBackground } from "@/components/ShaderBackground";
import { useTheme } from "@/components/ThemeProvider";
import { WebGLFallback } from "@/components/webgl/WebGLErrorBoundary";
import { ButtonLink, Container } from "@/components/ui";
import { CTA } from "@/lib/site";
import { DARK_PALETTE, LIGHT_PALETTE } from "@/lib/sky";

const HEADLINE_LINES = [
  "Hearing the unspoken.",
  "Preventing the unseen.",
];

// Words per line, so the second line picks up where the first left off.
const LINE_OFFSETS = HEADLINE_LINES.reduce<number[]>((acc, line, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + HEADLINE_LINES[i - 1].split(" ").length);
  return acc;
}, []);

/*
 * Slow enough that the defocus reads as motion rather than a flicker: each
 * word takes 1.2s to resolve out of a 14px blur, 0.09s apart.
 */
const STAGGER = 0.09;
const WORD_DURATION = 1.2;
const WORD_BLUR = 14;
const HEADLINE_START = 0.25;
const TOTAL_WORDS = HEADLINE_LINES.join(" ").split(" ").length;

/*
 * Subheadline and CTAs follow 0.15s after the headline genuinely finishes.
 * The old formula omitted the word duration entirely, so they arrived while
 * the last words were still resolving — invisible at 0.6s, obvious at 1.2s.
 */
const AFTER_HEADLINE =
  HEADLINE_START + (TOTAL_WORDS - 1) * STAGGER + WORD_DURATION + 0.15;

export function Hero() {
  const { theme } = useTheme();

  return (
    <section id="top" className="relative overflow-x-clip bg-canvas">
      {/*
        The static gradient sits underneath permanently: if WebGL is
        unavailable the canvas simply never draws and this shows through, so
        there is no error state to track and no flash.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[128svh]">
        <WebGLFallback className="absolute inset-0" />
        <div className="absolute inset-0">
          <ShaderBackground
            colors={theme === "light" ? LIGHT_PALETTE : DARK_PALETTE}
          />
        </div>

      {/*
        Readability scrim. The shader can clamp to near-white where its three
        ribbons overlap, so the copy cannot rely on the aurora staying dark.
        Held at 0.90 across the text column and opened up on the right, which
        keeps the muted subheadline at 4.6:1 and the headline above 11:1 even
        against a hypothetical pure-white aurora.
      */}
      {/*
        Vertical now that the copy is centred: the sky stays open across the
        full width, and the wash only builds at the very top and bottom,
        where the nav and the first section meet it.
      */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,var(--scrim-mid)_0%,var(--scrim-soft)_34%,var(--scrim-soft)_58%,var(--scrim-strong)_100%)]"
        />
      </div>

      <Container className="relative z-10 flex min-h-[72svh] flex-col justify-center pt-28 pb-4 md:min-h-[76svh]">
        <div className="mx-auto max-w-4xl text-center">
          {/*
            The serif is the whole point of the hero: it is the one place on
            the page where the type, rather than a picture of the product,
            carries the weight.
          */}
          <h1 className="type-hero text-ink">
            {HEADLINE_LINES.map((line, i) => (
              <span key={line} className="block">
                <WordReveal
                  text={line}
                  stagger={STAGGER}
                  duration={WORD_DURATION}
                  blur={WORD_BLUR}
                  delay={HEADLINE_START + LINE_OFFSETS[i] * STAGGER}
                />
              </span>
            ))}
          </h1>

          <IntroFade delay={AFTER_HEADLINE}>
            <p className="mt-7 text-lg text-muted md:text-xl">
              生徒のSOSを可視化する。
            </p>
          </IntroFade>

          <IntroFade delay={AFTER_HEADLINE + 0.08}>
            <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:justify-center">
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

      {/*
        The product, arriving as you scroll rather than sitting there from
        the first frame. It is a picture of software, so the figure is
        decorative and the caption is the only part a screen reader hears.
      */}
      <figure className="relative z-10 m-0">
        <DeviceScroll>
          <AppMock />
        </DeviceScroll>
        <figcaption className="sr-only">
          Blescアプリの画面イメージ。
        </figcaption>
      </figure>
    </section>
  );
}
