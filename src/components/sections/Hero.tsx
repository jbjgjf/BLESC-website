"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { AppMock } from "@/components/hero/AppMock";
import { DeviceScroll } from "@/components/hero/DeviceScroll";
import { useLocale } from "@/components/LocaleProvider";
import { IntroFade, WordReveal } from "@/components/Reveal";
import { ShaderBackground } from "@/components/ShaderBackground";
import { getLenis } from "@/components/SmoothScroll";
import { WebGLFallback } from "@/components/webgl/WebGLErrorBoundary";
import { ButtonLink, Container } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import { ctaFor } from "@/lib/site";
import { LIGHT_PALETTE } from "@/lib/sky";

/*
 * The couplet is the company's line and is English in both languages. What
 * changes with the page's language is the line under it, the two buttons
 * (lib/site's ctaFor) and the figure's caption.
 */
const HEADLINE_LINES = [
  "Hearing the unspoken.",
  "Preventing the unseen.",
];

const COPY = {
  ja: {
    tagline: "生徒のSOSを可視化する。",
    figcaption: "Blescアプリの画面イメージ。",
  },
  en: {
    tagline: "Making students’ unspoken SOS visible.",
    figcaption: "Illustration of the Blesc app screen.",
  },
} as const;

/*
 * The line under the couplet, per language: whole class strings, because
 * Tailwind only generates what it can read.
 *
 * The Japanese line is thirteen characters and fits any phone at 18px. The
 * English one is 18.06em in Helvetica Neue and 18.93em in Inter (worked out
 * from the faces' advance widths, not measured in a browser) — 325px and
 * 341px at 18px, against the 342px a 390px phone leaves and the 312px a
 * 360px one does. Left at 18px it would wrap on a 360px phone in either
 * face — the usual Android width — and drop "visible." onto a line of its
 * own. So below md its size follows the screen: 4.4vw holds it on one line
 * from 320px up in either face, and it reaches the Japanese line's 18px at
 * 410px wide. text-balance is for a face wider still: two even lines
 * rather than a line and an orphan.
 */
const TAGLINE = {
  ja: "mt-7 block text-lg font-normal leading-normal tracking-normal text-ink md:text-xl",
  en: "mt-7 block text-balance text-[clamp(0.875rem,4.4vw,1.125rem)] font-normal leading-normal tracking-normal text-ink md:text-xl",
} as const;

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

export function Hero({ locale: fromPage }: { locale?: Locale }) {
  /*
   * The page hands every section its language, and the layout sets the same
   * one in context for client components like this. The prop is used when it
   * is there, so a section answers to the page that rendered it; the two
   * cannot differ, both being the route's. The app mock below is handed
   * the one settled on here, so the screen and the headline over it are
   * always in the same language.
   */
  const fromLayout = useLocale();
  const locale = fromPage ?? fromLayout;
  const t = COPY[locale];
  const cta = ctaFor(locale);

  const section = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);

  /*
   * The hero is not the first screen any more. The opening statement sits
   * above it, and — when motion is allowed and a script is running — the
   * hero is pulled up under the statement's last pinned screen, so the
   * statement's flower dissolves to leave it in place (see Philosophy). The
   * pull-up is CSS-gated like the pin itself, so reduced motion and no-JS
   * get a hero that simply follows the statement's one still screen.
   *
   * The intro therefore waits for the headline to reach the upper half of
   * the viewport. Under the pin that is partway through the blue's
   * dissolve, so the words resolve out of it; without the pin it is when
   * the reader scrolls the headline up into view. A page restored below
   * the hero (a back button, a deep link) plays it at once instead of
   * holding the words hidden until the reader scrolls back up to them:
   * the observed area runs from far above the page down to the viewport's
   * midline, so a headline already above the screen counts as reached.
   */
  const play = useInView(headline, {
    once: true,
    margin: "100000px 0px -50% 0px",
  });

  /*
   * The one thing CSS cannot arrange is focus. A keyboard user tabbing past
   * the nav lands on a hero button that, until the pin has run to its end,
   * is still underneath the statement. So focus arriving in the hero while
   * it is covered takes the page to the end of the pin, where it is not.
   */
  const onFocusIn = () => {
    const el = section.current;
    if (!el) return;
    if (parseFloat(getComputedStyle(el).marginTop) >= 0) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY >= top - 1) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { immediate: true });
    else window.scrollTo({ top });
  };

  return (
    /*
     * isolate gives the hero a stacking context of its own, and it has to:
     * the statement above paints at z-10 so that it covers the hero while
     * the flower runs, and without one the z-10 Container and figure in here
     * would compete with it in the page's stacking context — and, coming
     * later in the document, win, printing the headline over the flower's
     * blue before the blue had faded.
     */
    <section
      ref={section}
      onFocusCapture={onFocusIn}
      className="relative isolate overflow-x-clip bg-canvas motion-safe:js:-mt-[100lvh]"
    >
      {/*
        The static gradient sits underneath permanently: if WebGL is
        unavailable the canvas simply never draws and this shows through, so
        there is no error state to track and no flash.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[128svh]">
        <WebGLFallback className="absolute inset-0" />
        <div className="absolute inset-0">
          <ShaderBackground colors={LIGHT_PALETTE} />
        </div>

        {/*
          The sky's edge wash, in the page's own white: 72% under the nav,
          open through the middle where the copy sits, and building to 72%
          again at the foot, where the sky hands over to the product figure.

          The top edge is as white as the opening statement's. While the
          statement's blue dissolves, the hero is still rising into place
          under it with the page's white ground above its top edge, and at
          the old 45% the hero's first rows were bluer than that ground — a
          line ran across the screen through the dissolve, about eight
          levels deep. At 72% the two meet at the same white.

          The copy is not what it protects. The sky is pale — its deepest
          stop is #90bfed, and shade() always mixes the white ground back in
          — so ink holds 10:1 over the deepest possible patch of it with no
          help. That is why every line of the copy below is ink.
        */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,var(--scrim-strong)_0%,var(--scrim-soft)_34%,var(--scrim-soft)_58%,var(--scrim-strong)_100%)]"
        />
      </div>

      <Container className="relative z-10 flex min-h-[72svh] flex-col justify-center pt-28 pb-4 md:min-h-[76svh]">
        <div className="mx-auto max-w-4xl text-center">
          {/*
            Helvetica Neue Light at display size: the one place on the page
            where the type, rather than a picture of the product, carries the
            weight.

            The Japanese line is inside the h1, not in a <p> after it.
            Visually it keeps its own size, weight and colour, but the page's
            most weighted heading then states what Blesc does in the language
            its visitors search in, instead of an English couplet no one
            queries for. It is a span so the heading still contains only
            phrasing content.

            On /en that line is the same statement in English, in the same
            place for the same reason: the couplet says nothing about
            students or schools, and the line under it does. Its type is its
            own below md (see TAGLINE).

            The line is ink in either language, not muted: size and weight
            carry the hierarchy. It sits in the open middle of the sky with
            no wash behind it, and muted over the sky's deepest blue falls to
            about 4:1 there (3.4:1 against the darkest pixel read back off
            the canvas, #95c3f0) — under AA for 18–20px type.
          */}
          <h1 ref={headline} className="type-hero text-ink">
            {HEADLINE_LINES.map((line, i) => (
              <span key={line} className="block">
                <WordReveal
                  text={line}
                  stagger={STAGGER}
                  duration={WORD_DURATION}
                  blur={WORD_BLUR}
                  delay={HEADLINE_START + LINE_OFFSETS[i] * STAGGER}
                  play={play}
                />
              </span>
            ))}

            <IntroFade
              as="span"
              play={play}
              delay={AFTER_HEADLINE}
              className={TAGLINE[locale]}
            >
              {t.tagline}
            </IntroFade>
          </h1>

          {/*
            The same row in either language. The English labels run to about
            150px each where the Japanese are 62px and 93px, and the pair is
            still only some 430px across — inside the 592px the narrowest
            side-by-side layout (sm, 640px) leaves. Below sm the two stack at
            the column's full width.
          */}
          <IntroFade play={play} delay={AFTER_HEADLINE + 0.08}>
            <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <ButtonLink variant="secondary" href={cta.document.href}>
                {cta.document.label}
              </ButtonLink>
              <ButtonLink variant="primary" href={cta.consult.href}>
                {cta.consult.label}
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
          <AppMock locale={locale} />
        </DeviceScroll>
        <figcaption className="sr-only">{t.figcaption}</figcaption>
      </figure>
    </section>
  );
}
