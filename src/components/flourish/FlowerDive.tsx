"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";

/*
 * The brand flower's outline, as drawn in public/logo/flower.svg and inlined
 * in src/components/Flower.tsx. It is repeated here rather than imported
 * because Flower.tsx only exports a component: this file needs the path as a
 * string to build a CSS mask image from it, and that component's JSX cannot
 * be serialised on the client. If the artwork ever changes, both copies
 * change.
 */
const FLOWER_PATH =
  "M124.6 0.07C125 0.07 125.41 0.07 125.82 0.07C126.87 4.43 134.93 14.48 137.74 18.82C146.51 32.38 154.69 45.44 155.4 62.05C156.01 76.14 149.88 88.32 143.69 100.47C141.67 104.43 136.5 111.68 136.25 115.8C139.41 114.2 142.22 109.44 144.56 106.71C151.16 99.01 158.25 90.3 166.25 84.04C169.88 81.19 174.14 79.44 178.36 77.74C196.11 70.59 211.81 74.72 228.92 81.74C235.43 84.4 244.02 87.37 249.03 92.51C239.88 107.51 226.49 133.59 210.6 141.81C206.77 143.79 202.24 144.85 198.08 145.84C185.3 148.89 172.87 144.41 160.17 142.77C157.73 142.45 148.34 139.89 147.11 141.34C150.03 143.65 154.78 144.69 158.2 146.23C167.7 150.51 178.2 154.24 186.84 160.14C195.39 165.98 205.06 182.36 206.89 192.43C208.4 200.68 208.56 210.05 207.84 218.39C207.41 223.35 207.04 228.65 205.87 233.49C205.3 235.88 204.2 238.49 204.21 240.94C203.19 240.94 202.16 240.94 201.13 240.94C199.75 239.57 185.13 236.67 182.14 235.97C170.24 233.18 155.54 229.35 146.24 220.89C131.2 207.2 130.97 189.12 128.24 170.44C127.51 165.37 127.66 156.53 125.64 152.09C123.46 155.48 124.14 165.99 123.55 170.45C121.21 188.34 121.48 201.72 109.76 216.59C100.15 228.79 84.09 234.09 69.64 237.87C66.48 238.69 55.44 239.65 53.7 240.94C51.77 240.94 49.85 240.94 47.92 240.94C46.21 232.23 46.06 222.77 45.87 213.91C45.52 197.05 44.63 183.11 55.97 169.52C58.68 166.28 61.45 162.54 65.06 160.25C70.41 156.88 76.5 154.55 82.2 151.87C87.1 149.56 91.75 146.64 96.64 144.37C99.67 142.96 107.32 140.53 109.17 138.2C105.82 137.32 91.66 141.7 87.5 142.75C69.91 147.15 52.77 149.18 35.95 140.79C24.67 135.17 13.34 118.41 7.26 107.64C5.87 105.19 1.31 94.15 0.07 93.21C0.07 92.6 0.07 91.99 0.07 91.38C18.91 85.37 37.82 72.28 58.45 74.06C63.88 74.53 69.39 76.95 74.32 79.11C84.29 83.48 94.06 95.36 101.52 103.42C103.18 105.21 110.67 113.72 112.31 113.56C111.4 109.45 107.64 104.94 105.41 101.35C100.3 93.08 95.46 84.1 93.26 74.56C87.92 51.37 101.77 29.98 114.93 12.12C117.89 8.09 122.15 4.36 124.6 0.07Z";

/*
 * The mask's canvas is a square centred on the flower itself, not the
 * artwork's 250×241 box. Sampled along the path, the flower's centre — the
 * point every petal tip is equally far from — sits at (126, 133.25), which
 * is 13 units below the box's centre. A mask spun about the box's centre
 * would wobble by that much, 5% of its size on every turn; spun about its
 * own centre the flower turns in place. The half-side of 134 is the tip
 * radius (133.2) with a hair of room so anti-aliasing never clips a tip.
 */
const FLOWER_CENTER = { x: 126, y: 133.25 };
const HALF = 134;
const VIEWBOX = `${FLOWER_CENTER.x - HALF} ${FLOWER_CENTER.y - HALF} ${HALF * 2} ${HALF * 2}`;

/*
 * The notches between the petals reach in to 17.5 units of the centre, so a
 * mask this many times its own size across still shows five wedges of page
 * ground meeting near the middle of the screen. This is that reach as a
 * fraction of the mask's width: the flower only stops clipping the photo
 * once the notch radius exceeds half the viewport's diagonal, which is the
 * figure the end size is computed from below. It comes out at roughly eight
 * diagonals — far past the 4500px of the reference this is modelled on,
 * whose shape had no notches — and that is the flower's geometry rather
 * than a choice.
 */
const NOTCH = 17.5 / (HALF * 2);
/**
 * How far the window is allowed to grow, in viewport diagonals. The notch
 * arithmetic above would ask for about eight diagonals — a mask image some
 * 14,000px across on a laptop, which is the kind of size a browser may
 * rasterise rather than draw — so the window stops at 2.6 diagonals, where
 * the petals are already off every edge and only five wedges of ground
 * meet at the centre, and the last stretch of the dive dissolves those
 * wedges instead: an unmasked copy of the photograph fades in over the
 * masked one. The eye reads it as the flower finishing its opening, and
 * the mask never exceeds the size the reference this is modelled on used.
 */
const MAX_DIAGONALS = 2.6;
/** The stretch of the dive over which the unmasked photograph fades in. */
const DISSOLVE_FROM = 0.84;

/**
 * Where the flower window begins, as the stage arrives: 36% of the shorter
 * viewport side, between 240px on a phone and 420px on a wide desktop.
 */
const START_MIN = 240;
const START_MAX = 420;
const START_VMIN = 0.36;

/**
 * The reference's power curve: the window grows as progress^2.3, so the
 * first third of the pin is spent watching the flower open and the rush
 * happens at the end.
 */
const DIVE_POWER = 2.3;

/**
 * The window when nothing moves. Written in CSS units rather than measured
 * pixels so that the server can render it with no viewport to measure, and
 * so a visitor without JavaScript gets a window sized to their screen.
 */
const REST_SIZE = "clamp(240px, 60vmin, 640px)";

/*
 * The data URI. Only the three characters a URL cannot carry are encoded —
 * a full encodeURIComponent would turn every space in the path into %20
 * and triple the attribute for no gain, since a quoted url() tolerates the
 * rest. Black is arbitrary: with the default mask-mode an SVG image masks
 * by alpha, so any opaque fill is the window and everything else is cut.
 */
const MASK_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${VIEWBOX}'><path d='${FLOWER_PATH}' fill='black' fill-rule='evenodd'/></svg>`;
const FLOWER_MASK = `url("data:image/svg+xml,${MASK_SVG.replace(/</g, "%3C")
  .replace(/>/g, "%3E")
  .replace(/#/g, "%23")}")`;

/**
 * The dive at the top of the footer.
 *
 * The closing statement's sky fades to the page ground, and on that ground
 * a flower-shaped window opens onto the company's own classroom. As the
 * page scrolls the stage pins, the window grows on a power curve and turns
 * one full time, the photograph behind it creeps in, and by the end the
 * petals have spun off every edge of the screen and the picture fills it.
 * Then the stage releases and the footer's invitation follows on the page
 * ground, which the stage has already faded back into along its foot.
 *
 * Modelled on a scroll "zoom-in through a shape" section — a pinned stage,
 * a CSS mask-image whose mask-size is driven by scroll on an eased curve,
 * the content scaling gently underneath — with the shape being the brand
 * flower and the window spinning as it opens. The dive pins on every
 * pointer, phones included; only reduced motion gets a single still screen.
 *
 * Wordless and decorative on purpose: the stage is aria-hidden, the
 * photograph has an empty alt, and the heading that carries the footer's
 * meaning comes after it.
 */
export function FlowerDive() {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const still = reduce === true;

  /*
   * The layer promise is made while the track is near the viewport and
   * withdrawn when it leaves. A permanent will-change on a 150vmax square
   * and a 120vw photograph would hold both rasterised for the whole visit
   * for an effect that runs over one stretch of the last screens. One state
   * change on the way in, one on the way out, nothing per frame.
   */
  const near = useInView(track, { margin: "25% 0px 25% 0px" });
  const moving = !still && near;

  /*
   * Progress runs over the pinned stretch only: 0 as the track's top
   * reaches the top of the viewport, which is the moment the stage sticks,
   * and 1 as the track's foot reaches the viewport's foot, the last frame
   * before it releases. Measured against the track rather than the stage
   * for the reason Philosophy gives — the stage stops moving while pinned,
   * so its own scroll window would read a flat line.
   */
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  /*
   * The start and the growth, in pixels, from the viewport. They are motion
   * values rather than state so that a resize rewrites the mask directly
   * instead of re-rendering the stage, and they start at 0 — which reads as
   * "not measured yet" below — so the server, which has no viewport, and
   * the first client render agree on the resting size.
   */
  const startPx = useMotionValue(0);
  const growPx = useMotionValue(0);

  useLayoutEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const start = Math.min(
        START_MAX,
        Math.max(START_MIN, START_VMIN * Math.min(w, h)),
      );
      /*
       * The flower has fully left the screen once its notches are further
       * from the centre than the viewport's corners, whatever angle it has
       * turned to: notch radius = NOTCH × size ≥ half the diagonal.
       */
      const diagonal = Math.hypot(w, h);
      const end = Math.min(diagonal / 2 / NOTCH, diagonal * MAX_DIAGONALS);
      startPx.set(start);
      growPx.set(end - start);
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [startPx, growPx]);

  /*
   * The window's size: start + progress^2.3 × growth, as a CSS string.
   *
   * Every input is read before any branch. useTransform subscribes only to
   * the motion values whose .get() ran during the render's collection pass,
   * so an early return ahead of scrollYProgress.get() would leave the
   * scroll unsubscribed until React happened to re-render the stage.
   *
   * Under reduced motion, and before the viewport has been measured, the
   * value is the resting size. Both are the same string, so the HTML the
   * server sends is what a reduced-motion visitor's first render produces
   * too, and there is no hydration mismatch to warn about.
   *
   * mask-size is not a compositor property: each change repaints the mask
   * for the visible tiles. That is the cost the reference accepts, and it
   * is proportional to the viewport, not to the mask's size, since the
   * SVG is drawn as vectors.
   */
  const maskSize = useTransform(() => {
    const progress = scrollYProgress.get();
    const start = startPx.get();
    const grow = growPx.get();
    if (still || start === 0) return `${REST_SIZE} ${REST_SIZE}`;
    const size = Math.round(start + Math.pow(progress, DIVE_POWER) * grow);
    return `${size}px ${size}px`;
  });

  /*
   * One full turn over the dive for the window, and the exact opposite for
   * the photograph inside it, so the picture stays upright while the
   * flower-shaped hole in front of it spins. Both derive from the same
   * scroll value and are written in the same frame; motion drives `rotate`
   * from JavaScript on both (only a whole `transform` can be handed to a
   * native scroll timeline), so they can never be a frame apart.
   *
   * The ranges collapse rather than the style props being dropped, as
   * everywhere else on the page: handing motion `undefined` would leave the
   * server-rendered values in the style attribute for good.
   */
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    still ? [0, 0] : [0, 360],
  );
  const counterRotate = useTransform(rotate, (deg: number) => -deg);
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    still ? [1, 1] : [1, 1.18],
  );
  /*
   * The dissolve: nothing until the window has all but filled the screen,
   * then the unmasked photograph comes up over the last sixth of the dive.
   * Under reduced motion it stays down, so the still screen is the flower
   * window and nothing else.
   */
  const dissolve = useTransform(
    scrollYProgress,
    [DISSOLVE_FROM, 1],
    still ? [0, 0] : [0, 1],
  );

  return (
    /*
     * The track is 260svh only when motion is allowed, decided in CSS so
     * the server, the stylesheet and the JS above agree before hydration.
     * Under reduced motion it is exactly the stage's height, so there is
     * nothing to stick to and the dive is one still screen. No overflow on
     * the track: hidden on any ancestor is what switches sticky off.
     */
    <div ref={track} className="relative motion-safe:h-[260svh]">
      {/*
        The one place overflow-hidden is allowed: this is the sticky element
        itself, not an ancestor of one, and it is what keeps the oversized
        spinning square inside the viewport without a scrollbar. Its own
        background is the page ground, which is what shows through wherever
        the mask cuts the photograph away.
      */}
      <div
        aria-hidden
        className="pointer-events-none sticky top-0 h-[100svh] overflow-hidden bg-canvas"
      >
        {/*
          Flex centring, not a translate, positions the square: motion owns
          the square's transform for the spin, and a second transform on the
          same element would have to be composed with it.
        */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/*
            The masked, spinning square. 150vmax a side because a rotating
            rectangle only covers the viewport at every angle if it is a
            square at least the diagonal across, and the diagonal is at most
            √2 × vmax. The mask sits on this element so it turns with it.

            Both spellings of every mask property: unprefixed mask-* only
            reached Safari in 15.4, and Chrome treats the -webkit- names as
            aliases, so the pair is harmless where both are understood.
          */}
          <motion.div
            className="relative flex size-[150vmax] shrink-0 items-center justify-center"
            style={{
              rotate,
              willChange: moving ? "transform" : undefined,
              WebkitMaskImage: FLOWER_MASK,
              maskImage: FLOWER_MASK,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "50% 50%",
              maskPosition: "50% 50%",
              WebkitMaskSize: maskSize,
              maskSize,
            }}
          >
            {/*
              The photograph, counter-rotated so it stays upright, and a
              fifth larger than the viewport so a rounding drift between the
              two rotations, or the 1.18 scale's origin, can never expose a
              corner. It is not made larger than that on purpose: the source
              is 1505px wide, and a bigger box would only be a crop of it,
              enlarged and softened.
            */}
            <motion.div
              className="relative h-[120svh] w-[120vw] shrink-0"
              style={{
                rotate: counterRotate,
                scale,
                willChange: moving ? "transform" : undefined,
              }}
            >
              <Image
                src="/photos/philosophy.png"
                alt=""
                fill
                sizes="120vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>

        {/*
          The same photograph again, unmasked and upright, fading in over
          the masked one at the end of the dive — see MAX_DIAGONALS. Its
          scale follows the masked copy's so the two never slide against
          each other during the fade. Behind the foot band below, so the
          hand-off to the footer still dissolves into the page ground.
        */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: dissolve, scale, willChange: moving ? "opacity" : undefined }}
        >
          <Image
            src="/photos/philosophy.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/*
          The stage's foot dissolves into the page ground, so that when the
          photograph fills the screen and the stage releases, the footer's
          invitation rises out of it rather than meeting it at a hard edge.
          While the window is still small and centred the band lies over
          page ground of the same colour, and so is invisible.
        */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-[22svh] bg-[linear-gradient(180deg,transparent_0%,var(--color-bg)_100%)]" />
      </div>
    </div>
  );
}
