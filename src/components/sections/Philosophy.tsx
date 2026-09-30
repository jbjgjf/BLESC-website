"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { WebGLFallback } from "@/components/webgl/WebGLErrorBoundary";
import { EXPO_OUT } from "@/lib/motion";
import { FLOWER_NOTCH, FLOWER_PATH, FLOWER_SPIN_VIEWBOX } from "@/lib/flower";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import { LIGHT_PALETTE } from "@/lib/sky";

/*
 * The pinned stretch, in fractions of its own scroll. The statement is
 * already there when the page opens, so the flower starts almost at once:
 * it drifts to the centre of the screen, grows and turns once, and the
 * statement fades as the petals pass over it. The flower's blue fills the
 * screen, and then the whole stage fades away over the hero, which has been
 * sitting underneath it the whole time — so the pin ends on the hero, with
 * nothing left to scroll.
 *
 * The short hold before DIVE is the first flick of a wheel or a thumb: the
 * statement should not start moving the instant a trackpad twitches.
 */
const DIVE = [0.06, 0.8] as const;
const LINE_OUT = [0.2, 0.37] as const;
/*
 * The flower stops growing at 2.6 viewport diagonals — by then every petal
 * is off the screen and only the notches between them still show the sky —
 * and the last stretch fills the screen with the flower's own blue, which
 * reads as the flower finishing its opening. The notch arithmetic alone would
 * ask for about eight diagonals, a shape over 13,000px across on a laptop.
 */
const COVER = [0.6, 0.8] as const;
/*
 * The blue dissolving into the hero beneath. It ends a little before the pin
 * does, so the last stretch of scroll is the hero, uncovered and still,
 * rather than the tail of a fade. The hero's headline starts resolving
 * partway through (see Hero), so the words come up out of the blue.
 */
const REVEAL = [0.82, 0.96] as const;
const MAX_DIAGONALS = 2.6;
/** Growth follows a power curve, so the rush comes at the end of the dive. */
const DIVE_POWER = 2.3;

/** Where p sits in [from, to], clamped to 0–1. */
const window01 = (p: number, [from, to]: readonly [number, number]) =>
  Math.min(1, Math.max(0, (p - from) / (to - from)));

/**
 * The opening statement, and the way into the page.
 *
 * The page opens on the company's line under the sky, with the brand flower
 * breathing above it: the app's own greeting-screen composition, mark above
 * words. The line is the only text, and it is a paragraph rather than a
 * heading — the hero below still carries the page's h1, so the heading
 * outline starts where the argument does.
 *
 * Then the flower is the transition. The band pins, and the flower drifts to
 * the centre of the screen, turns once and grows until its blue is all
 * there is — and then the blue fades away, and the hero is already there
 * underneath it: the hero is pulled up under this section's last pinned
 * screen (see Hero), so the pin ends on it and there is nothing left to
 * scroll.
 *
 * Reduced motion, or a page without JavaScript, gets one still screen: the
 * sky, the flower and the line at rest, and a hero that simply follows. The
 * dive runs on every pointer, phones included, because the dive is the
 * point.
 */
export function Philosophy() {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const flower = useRef<HTMLDivElement>(null);

  /*
   * The hydration-safe hook, not motion's: it picks style values below, so
   * it has to read the same on the server and in the hydration pass. It
   * answers "moving" there, and the real value arrives on the render after.
   */
  const reduce = usePrefersReducedMotion();

  /*
   * The breathing loop only runs while the band is near the viewport; there
   * is no point animating a flower that has scrolled away.
   */
  const near = useInView(track, { margin: "25% 0px 25% 0px" });
  const moving = !reduce && near;

  /*
   * Progress over the pinned stretch only: 0 at the top of the page, where
   * the stage is already stuck, and 1 as the track's foot reaches the
   * viewport's foot, the last frame before it releases. Measured against the
   * track, not the stage — the stage stops moving while pinned, so its own
   * scroll window would read a flat line.
   */
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  /*
   * The opacities are computed in JavaScript on purpose. Given a range
   * mapping straight off a target scroll, motion hands opacity to the
   * browser as a native ViewTimeline animation, and on a pinned track that
   * ran at about half the intended progress — measured: at 97% of the pin
   * the blue cover sat at 0.50 and the statement at 0.93, so the line
   * showed through the notches of a flower that should have hidden it. The
   * function form of useTransform is never accelerated, so these follow
   * scrollYProgress exactly. They also take a plain number when still,
   * which is the other reason not to let a native animation own them.
   */
  const lineOpacity = useTransform(() => 1 - window01(scrollYProgress.get(), LINE_OUT));
  const cover = useTransform(() => window01(scrollYProgress.get(), COVER));
  const stageOpacity = useTransform(
    () => 1 - window01(scrollYProgress.get(), REVEAL),
  );

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
   * are identity until the dive starts, and the breathing and the entrance
   * are a few pixels on outer wrappers that offsetTop ignores.
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
    const column = flower.current?.closest("[data-statement-column]");
    if (column) observer.observe(column);
    if (stage.current) observer.observe(stage.current);
    document.fonts?.ready.then(measure, () => undefined);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [growBy, toCentre]);

  return (
    /*
     * id="top": the nav's wordmark links here, and the top of the page is
     * now this statement rather than the hero.
     *
     * overflow-x-clip, never overflow-hidden: hidden on any ancestor is
     * what switches `position: sticky` off.
     *
     * z-10, and no background of its own. The hero is pulled up under this
     * section's last pinned screen (see Hero), so the section has to paint
     * above it, and has to be see-through wherever the stage is not — the
     * stage paints its own sky, and it covers the whole section at every
     * scroll position, pinned or not.
     */
    <section id="top" className="relative z-10 overflow-x-clip">
      {/*
        The track is only tall — and so the stage only pins — when motion is
        allowed and a script is running to drive it, decided in CSS so the
        server, the stylesheet and the JS above agree before hydration.
        Everywhere else it is exactly the stage's height: one still screen,
        where a page with no script would otherwise scroll screens past a
        picture that never moves.
      */}
      <div ref={track} className="relative motion-safe:js:h-[270svh]">
        {/*
          The one place overflow-hidden is allowed: this is the sticky
          element itself, not an ancestor of one, and it is what keeps the
          sky's canvas and a flower many times the screen's size inside the
          viewport without a scrollbar.

          When it pins, the stage is 100lvh, the large viewport: on a phone
          the toolbar collapses as the page scrolls down, and a 100svh stage
          then left a strip of the track's own ground under the blue cover —
          the "one colour" screen had a white band along its foot. lvh is the
          height the viewport grows to, and overflow-hidden clips the rest
          while the toolbar is still showing.

          pointer-events-none: nothing in the stage is interactive, and at
          the end of the pin it is a transparent layer over the hero's
          buttons, which have to take the click.
        */}
        <motion.div
          ref={stage}
          className="pointer-events-none sticky top-0 flex min-h-[72svh] items-center justify-center overflow-hidden px-6 md:h-[100svh] md:px-10 motion-safe:js:h-[100lvh]"
          style={{ opacity: reduce ? 1 : stageOpacity }}
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
              <ShaderBackground colors={LIGHT_PALETTE} />
            </div>
            {/*
              White at the top, under the nav, and at the foot, where the
              still screen hands over to the hero. The middle is left open,
              which is where the type sits — and it needs no ground of its
              own there: the sky's darkest pixel under the line read back off
              the canvas as #95c3f0, and ink over that is 10.5:1.
            */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--scrim-strong)_0%,var(--scrim-soft)_28%,var(--scrim-soft)_72%,var(--scrim-strong)_100%)]" />
          </div>

          {/*
            The entrance: the page's first frame, so it arrives on load
            rather than on scroll — a short rise out of nothing, flower and
            line together. The layout's noscript rule shows it at once
            without a script, and reduced motion gets the fade alone.
          */}
          <motion.div
            data-statement-column
            className="relative flex flex-col items-center text-center"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0.3 }
                : { duration: 1.4, ease: EXPO_OUT, delay: 0.15 }
            }
          >
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
            <motion.p
              style={{ opacity: reduce ? 1 : lineOpacity }}
              className="mt-8 text-[clamp(1.9rem,9.2vw,3.25rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1] md:mt-10 md:text-[5.55vw] md:whitespace-nowrap"
            >
              <span className="block md:inline">声にならないSOSに、</span>
              <span className="block md:inline">気づける社会へ。</span>
            </motion.p>
          </motion.div>

          {/*
            The flower's own blue, over everything, at the end of the dive:
            it fills the notches between the petals so the screen is one
            colour before the stage fades away over the hero underneath.
            Invisible at rest, and absent in effect under reduced motion.

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
        </motion.div>
      </div>
    </section>
  );
}
