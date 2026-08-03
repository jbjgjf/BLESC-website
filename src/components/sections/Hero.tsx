"use client";

import { IntroFade, WordReveal } from "@/components/Reveal";
import {
  ShaderBackground,
  type ShaderColor,
} from "@/components/ShaderBackground";
import { useTheme } from "@/components/ThemeProvider";
import { WebGLFallback } from "@/components/webgl/WebGLErrorBoundary";
import { ButtonLink, Container } from "@/components/ui";
import { CTA } from "@/lib/site";

/*
 * Palettes, ground colour first. The shipped preset ran a cyan ramp
 * (#031C26 → #1B6CA8 → #5AD2F4 → #EAF9FF); these are the same shape walked
 * through the site's own tokens so the hero introduces no new hue.
 *
 * Light works here because `shade()` averages the palette rather than adding
 * light to a base — the previous aurora clamped to white on a pale ground,
 * which is why it was dark-only.
 */
const DARK_PALETTE: ShaderColor[] = [
  [0.0392, 0.0431, 0.051], // #0a0b0d  --color-bg
  [0.0706, 0.2353, 0.3686], // #123c5e  deep blue
  [0.5216, 0.7529, 0.9294], // #85c0ed  --color-primary
  [1, 1, 1], // #ffffff  --color-text
];

const LIGHT_PALETTE: ShaderColor[] = [
  [0.9804, 0.9804, 0.9725], // #fafaf8  --color-bg
  [0.7216, 0.851, 0.9451], // #b8d9f1  pale blue
  [0.498, 0.7216, 0.8902], // #7fb8e3  mid blue
  [1, 1, 1], // #ffffff
];

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
    <section
      id="top"
      className="relative flex min-h-[88svh] items-center overflow-hidden bg-canvas pt-28 pb-16 md:min-h-screen"
    >
      {/*
        The static gradient sits underneath permanently: if WebGL is
        unavailable the canvas simply never draws and this shows through, so
        there is no error state to track and no flash.
      */}
      <WebGLFallback className="pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0">
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--scrim-strong)_0%,var(--scrim-mid)_58%,var(--scrim-soft)_100%)]"
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
                  duration={WORD_DURATION}
                  blur={WORD_BLUR}
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
