"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { usePinCapable } from "@/components/hero/usePinCapable";
import { ShaderBackground } from "@/components/ShaderBackground";
import { useTheme } from "@/components/ThemeProvider";
import { WebGLFallback } from "@/components/webgl/WebGLErrorBoundary";
import { FLOWER_NOTCH, FLOWER_PATH, FLOWER_SPIN_VIEWBOX } from "@/lib/flower";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import { DARK_PALETTE, LIGHT_PALETTE } from "@/lib/sky";

/*
 * The pinned stretch, in fractions of its own scroll. The line grows first,
 * holds, and then the flower above it takes over: it drifts to the centre of
 * the screen, grows and turns once, and the statement fades as the petals
 * pass over it. By the end the flower's blue fills the screen, and the pin
 * releases straight into the footer, which begins in that same blue.
 */
const LINE = [0, 0.2] as const;
const DIVE = [0.34, 0.94] as const;
const LINE_OUT = [0.44, 0.58] as const;
/*
 * The flower stops growing at 2.6 viewport diagonals — by then every petal
 * is off the screen and only the notches between them still show the sky —
 * and the last stretch fills the screen with the flower's own blue, which
 * reads as the flower finishing its opening. The notch arithmetic alone would
 * ask for about eight diagonals, a shape over 13,000px across on a laptop.
 */
const COVER = [0.78, 0.94] as const;
const MAX_DIAGONALS = 2.6;
/** Growth follows a power curve, so the rush comes at the end of the dive. */
const DIVE_POWER = 2.3;

/** Where p sits in [from, to], clamped to 0–1. */
const window01 = (p: number, [from, to]: readonly [number, number]) =>
  Math.min(1, Math.max(0, (p - from) / (to - from)));

/**
 * The closing statement, as the page's second sky — and the way out of it.
 *
 * The hero opens the page under the aurora and this closes it under the
 * same one, drawn from the same palettes, so the two bookend everything
 * between them. Above the line the brand flower breathes: the app's own
 * greeting-screen composition, mark above words. The heading is the only
 * text.
 *
 * Then the flower is the transition. The band pins; the line grows to fill
 * the width and holds; and the flower drifts to the centre of the screen,
 * turns once and grows until its blue is all there is. The pin releases
 * into the footer, which begins in that same blue and fades to the page
 * ground as the invitation rises out of it (see Footer).
 *
 * Reduced motion, or a page without JavaScript, gets one still screen: the
 * sky, the flower and the line at rest, and a footer that simply follows.
 * The line only grows on a fine-pointer screen from md, where the statement
 * sits on one line; the flower's dive runs on every pointer, because the
 * dive is the point.
 */
export function Philosophy() {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const flower = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  /*
   * The hydration-safe hook, not motion's: these flags pick ranges and
   * style values below, so they have to read the same on the server and in
   * the hydration pass. Both answer "moving" there, and the real values
   * arrive on the render after.
   */
  const reduce = usePrefersReducedMotion();
  const pins = usePinCapable();
  const lineStill = reduce || !pins;

  /*
   * Layer promises only while the band is near the viewport: a permanent
   * will-change on an 88vw line of display type, or on a flower that grows
   * to fill the screen, would hold both rasterised for the whole visit.
   */
  const near = useInView(track, { margin: "25% 0px 25% 0px" });
  const moving = !reduce && near;

  /*
   * Progress over the pinned stretch only: 0 as the track's top reaches the
   * top of the viewport, which is when the stage sticks, and 1 as its foot
   * reaches the viewport's foot, the last frame before it releases.
   * Measured against the track, not the stage — the stage stops moving
   * while pinned, so its own scroll window would read a flat line.
   */
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  const lineScale = useTransform(
    scrollYProgress,
    [...LINE],
    lineStill ? [1, 1] : [0.7, 1],
    { clamp: true },
  );
  /*
   * The opacities are computed in JavaScript on purpose. Given a range
   * mapping straight off a target scroll, motion hands opacity to the
   * browser as a native ViewTimeline animation, and on this pinned track
   * that ran at about half the intended progress — measured: at 97% of the
   * pin the blue cover sat at 0.50 and the statement at 0.93, so the line
   * showed through the notches of a flower that should have hidden it. The
   * function form of useTransform is never accelerated, so these follow
   * scrollYProgress exactly. They also take a plain number when still,
   * which is the other reason not to let a native animation own them.
   */
  const lineOpacity = useTransform(() => 1 - window01(scrollYProgress.get(), LINE_OUT));
  const cover = useTransform(() => window01(scrollYProgress.get(), COVER));

  /*
   * The dive's geometry, from the viewport: how far the flower has to move
   * to reach the stage's centre, and how large it has to grow. Motion
   * values rather than state, so a resize rewrites the transform without
   * re-rendering the section. They start at "no movement", which is also
   * the reduced and the server state.
   */
  const toCentre = useMotionValue(0);
  const growBy = useMotionValue(0);

  const dive = useTransform(() => {
    const t = window01(scrollYProgress.get(), DIVE);
    return reduce ? 0 : t;
  });
  const flowerScale = useTransform(
    () => 1 + Math.pow(dive.get(), DIVE_POWER) * growBy.get(),
  );
  /*
   * The drift to the centre finishes early in the dive, while the flower is
   * still small enough for the move to read as a move rather than as the
   * whole screen sliding.
   */
  const flowerY = useTransform(
    () => Math.min(1, dive.get() / 0.35) * toCentre.get(),
  );
  const flowerRotate = useTransform(() => dive.get() * 360);

  /*
   * Measured after the transforms above exist, so their subscriptions hear
   * the first set(). The flower is measured at rest — its own transforms
   * are identity until the dive starts, and the breathing is a few pixels
   * on an outer wrapper this measurement ignores.
   */
  useLayoutEffect(() => {
    const measure = () => {
      const s = stage.current;
      const f = flower.current;
      if (!s || !f) return;
      const size = f.offsetWidth || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const diagonal = Math.hypot(w, h);
      /*
       * The flower covers the screen once its notches are further from its
       * centre than the viewport's corners are, whatever angle it has turned
       * to — capped at MAX_DIAGONALS, with the blue cover doing the rest.
       */
      const end = Math.min(diagonal / 2 / FLOWER_NOTCH, diagonal * MAX_DIAGONALS);
      growBy.set(end / size - 1);
      // The stage is 100svh and pinned at the top, so its centre is h / 2.
      let top = 0;
      let node: HTMLElement | null = f;
      while (node && node !== s) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      toCentre.set(s.offsetHeight / 2 - (top + size / 2));
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    /*
     * The column can change height without the window changing size — the
     * web fonts swapping in can move the statement between one line and two
     * on a phone — and the drift to centre is worked out from that height.
     */
    const observer = new ResizeObserver(measure);
    if (flower.current?.parentElement?.parentElement) {
      observer.observe(flower.current.parentElement.parentElement);
    }
    if (stage.current) observer.observe(stage.current);
    document.fonts?.ready.then(measure, () => undefined);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [growBy, toCentre]);

  return (
    /*
     * overflow-x-clip, never overflow-hidden: hidden on any ancestor is
     * what switches `position: sticky` off.
     */
    <section className="relative overflow-x-clip bg-canvas">
      {/*
        The track is only tall — and so the stage only pins — when motion is
        allowed and a script is running to drive it, decided in CSS so the
        server, the stylesheet and the JS above agree before hydration.
        Everywhere else it is exactly the stage's height: one still screen,
        where a page with no script would otherwise scroll three screens past
        a picture that never moves.
      */}
      <div ref={track} className="relative motion-safe:js:h-[330svh]">
        {/*
          The one place overflow-hidden is allowed: this is the sticky
          element itself, not an ancestor of one, and it is what keeps the
          sky's canvas and a flower many times the screen's size inside the
          viewport without a scrollbar.
        */}
        {/*
          When it pins, the stage is 100lvh, the large viewport: on a phone
          the toolbar collapses as the page scrolls down, and a 100svh stage
          then left a strip of the track's own ground under the blue cover —
          the "one colour" screen had a white band along its foot. lvh is the
          height the viewport grows to, and overflow-hidden clips the rest
          while the toolbar is still showing.
        */}
        <div
          ref={stage}
          className="sticky top-0 flex min-h-[72svh] items-center justify-center overflow-hidden px-6 md:h-[100svh] md:px-10 motion-safe:js:h-[100lvh]"
        >
          {/*
            The sky, composed exactly as the hero composes it: the static
            gradient sits underneath permanently so that if WebGL never
            initialises the canvas stays transparent and this shows through.
            ShaderBackground pauses itself off-screen and freezes under
            reduced motion.
          */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <WebGLFallback className="absolute inset-0" />
            <div className="absolute inset-0">
              <ShaderBackground
                colors={theme === "light" ? LIGHT_PALETTE : DARK_PALETTE}
              />
            </div>
            {/*
              Fades the sky in from the section above and out at the foot,
              as the hero does at its own. The middle is left open, which is
              where the type sits.
            */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--scrim-strong)_0%,var(--scrim-soft)_28%,var(--scrim-soft)_72%,var(--scrim-strong)_100%)]" />
            {/*
              The type's own ground: a wide, flat-topped ellipse behind the
              line. --band-scrim is a token, set per theme in globals.css
              from pixels read back off the canvas: a 0.7 page-ground wash
              on the dark build, nothing at all on the light one.
            */}
            <div className="absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_50%,var(--band-scrim)_0%,var(--band-scrim)_55%,transparent_100%)]" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            {/*
              The flower, in three layers so no two transforms share an
              element: the outer one breathes (a few pixels of y, not
              scaled), the middle one carries the dive (the drift to centre,
              the growth, the turn), and the SVG inside is drawn in a square
              box centred on the flower itself, so it turns in place rather
              than swinging about the artwork's off-centre box. It sits above
              the line, so the petals pass over the statement as it grows.
            */}
            <motion.div
              aria-hidden
              className="relative z-10"
              animate={moving ? { y: [0, -7, 0] } : { y: 0 }}
              transition={
                moving
                  ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.4 }
              }
            >
              <motion.div
                ref={flower}
                className="size-14 text-accent md:size-22"
                /*
                  No will-change here, deliberately. A promised layer is
                  rasterised once at the flower's resting size and then
                  scaled, and at forty-odd times that size its edges were a
                  soft blur; without the promise the browser redraws the
                  vector at each size, which for one path is cheap.
                */
                style={{
                  y: flowerY,
                  scale: flowerScale,
                  rotate: flowerRotate,
                }}
              >
                <svg
                  viewBox={FLOWER_SPIN_VIEWBOX}
                  className="block h-full w-full"
                  focusable="false"
                >
                  <path d={FLOWER_PATH} fill="currentColor" fillRule="evenodd" />
                </svg>
              </motion.div>
            </motion.div>

            {/*
              The hero's voice: weight 300, 1.05 leading, −0.02em tracking
              and palt. From md the statement is one line set in vw — 15.86em
              in Helvetica Neue Light and Hiragino Sans W3, so 5.55vw lands it
              at 88vw — and below md it breaks at the comma into two lines.
            */}
            <motion.h2
              style={{
                scale: lineScale,
                opacity: reduce ? 1 : lineOpacity,
                willChange: moving && !lineStill ? "transform" : undefined,
              }}
              className="mt-8 text-[clamp(1.9rem,9.2vw,3.25rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1] md:mt-10 md:text-[5.55vw] md:whitespace-nowrap"
            >
              <span className="block md:inline">声にならないSOSに、</span>
              <span className="block md:inline">気づける社会へ。</span>
            </motion.h2>
          </div>

          {/*
            The flower's own blue, over everything, at the end of the dive:
            it fills the notches between the petals so the screen is one
            colour when the pin releases into the footer, which starts in the
            same colour. Invisible at rest, and absent in effect under reduced
            motion.
          */}
          {/*
            hidden unless motion is allowed and a script is running, decided
            in CSS: the layout's noscript rule forces every inline-styled
            element in <main> to opacity 1, and it would otherwise raise this
            cover over the whole statement for a reader with no script.
          */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 hidden bg-accent motion-safe:js:block"
            style={{ opacity: reduce ? 0 : cover }}
          />
        </div>
      </div>
    </section>
  );
}
