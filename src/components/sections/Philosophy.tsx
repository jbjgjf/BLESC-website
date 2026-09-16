"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { FloatingFlower } from "@/components/flourish/FloatingFlower";
import { usePinCapable } from "@/components/hero/usePinCapable";
import { ShaderBackground } from "@/components/ShaderBackground";
import { useTheme } from "@/components/ThemeProvider";
import { WebGLFallback } from "@/components/webgl/WebGLErrorBoundary";
import { DARK_PALETTE, LIGHT_PALETTE } from "@/lib/sky";

/**
 * The closing statement, as the page's second sky.
 *
 * The hero opens the page under the aurora and this closes it under the
 * same one, drawn from the same palettes, so the two bookend everything
 * between them. Above the line the brand flower breathes — the app's own
 * greeting-screen composition, mark above words, rather than a page
 * ornament. The heading is the only text: no subline, no photographs,
 * nothing to read but the one sentence the rest of the page was leading
 * to, and the footer's invitation follows it directly.
 *
 * On a fine-pointer desktop the band pins for most of a screen while the
 * line grows from 0.7 to fill the width. A phone, a tablet or a
 * reduced-motion setting gets one screen with the line already at rest.
 */
export function Philosophy() {
  const track = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  /*
   * The pin is a desktop gesture. On a coarse pointer the band is one
   * screen tall and never sticks, so a line that grew as it crossed the
   * viewport would finish growing before anyone could read it.
   */
  const pins = usePinCapable();
  const still = reduce || !pins;

  /*
   * The layer promise is only made while the band is near the viewport. A
   * permanent will-change on an 88vw line of display type would hold that
   * text rasterised in its own layer for the whole visit, and at scale(0.7)
   * until the compositor chose to redraw it — soft type, for nothing, on
   * every screen of the page above this one. One state change on the way
   * in and one on the way out; nothing per frame.
   */
  const near = useInView(track, { margin: "25% 0px 25% 0px" });
  const moving = !still && near;

  /*
   * Measured against the track rather than the band: the band is sticky,
   * and a scroll window measured against an element that stops moving
   * reads a flat line for as long as it is pinned. The track is 190svh on
   * desktop, so progress 0 is its top reaching the viewport's foot and 1
   * is its foot reaching the same place — the last frame the band is
   * still pinned. The band itself pins at 100/190 = 0.53.
   *
   * The scale runs 0.45 → 0.85. It starts as the band's top edge is about
   * 14vh from the top of the screen, reaches full width a little past
   * halfway through the pin, and holds there for the last ~29vh before
   * the band releases, so the statement gets a moment at rest at its
   * full size rather than releasing the instant it arrives.
   *
   * The range collapses to [1, 1] rather than the style prop being
   * dropped, as DeviceScroll does: handing motion `undefined` would leave
   * the server-rendered `scale(0.7)` in the style attribute for good.
   * Motion owns the transform either way; only the distance changes.
   */
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start end", "end end"],
  });
  const scale = useTransform(
    scrollYProgress,
    [0.45, 0.85],
    still ? [1, 1] : [0.7, 1],
    { clamp: true },
  );

  return (
    /*
     * overflow-x-clip, never overflow-hidden: hidden on any ancestor is
     * what switches `position: sticky` off.
     */
    <section className="relative overflow-x-clip bg-canvas">
      {/*
        The track is only tall — and so the band only pins — for a fine
        pointer from md when motion is allowed, and that is decided in CSS
        rather than by a state flag so the server, the stylesheet and the
        JS above all agree before hydration. Everywhere else the track is
        exactly the band's height and there is nothing to stick to.
      */}
      <div
        ref={track}
        className="relative motion-safe:pointer-fine:md:h-[190svh]"
      >
        {/*
          The one place `overflow-hidden` is allowed: this is the sticky
          element itself, not an ancestor of one, and it is what keeps the
          sky's canvas and a still-growing line inside the viewport.
        */}
        <div className="sticky top-0 flex min-h-[72svh] items-center justify-center overflow-hidden px-6 md:h-[100svh] md:px-10">
          {/*
            The sky, composed exactly as the hero composes it: the static
            gradient sits underneath permanently so that if WebGL never
            initialises the canvas stays transparent and this shows through,
            with no error state to track and no flash. ShaderBackground
            pauses itself off-screen and freezes under reduced motion.
          */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <WebGLFallback className="absolute inset-0" />
            <div className="absolute inset-0">
              <ShaderBackground
                colors={theme === "light" ? LIGHT_PALETTE : DARK_PALETTE}
              />
            </div>

            {/*
              Fades the sky in from the white section above and out into
              the white footer below, as the hero does at its own foot. The
              middle is left open, which is where the type sits.
            */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--scrim-strong)_0%,var(--scrim-soft)_28%,var(--scrim-soft)_72%,var(--scrim-strong)_100%)]" />

            {/*
              The type's own ground: a wide, flat-topped ellipse behind the
              line. 120% × 60% are the radii, so the plateau (to 55%) runs
              past both side edges and covers the middle two thirds of the
              band's height, and the falloff only reaches 37% of full
              strength at the band's top and bottom edges — the line and
              the flower never leave the plateau. --band-scrim is a token,
              set per theme in globals.css from pixels read back off the
              canvas: a 0.7 page-ground wash on the dark build, nothing at
              all on the light one.
            */}
            <div className="absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_50%,var(--band-scrim)_0%,var(--band-scrim)_55%,transparent_100%)]" />
          </div>

          {/*
            Shrink-to-fit on purpose — no `w-full` on the heading. A flex
            item wider than its container under `items-center` overflows
            equally on both sides, so if a fallback font sets the line a
            few pixels wider than measured it spills into the gutters
            symmetrically and stays centred. With `w-full` and text-align
            the same overflow would all fall to the right.
          */}
          <div className="relative flex flex-col items-center text-center">
            {/*
              Two marks, one per breakpoint, because the flower takes a
              pixel size and sets it inline. Only one has a box at a time,
              and useInView inside FloatingFlower reports the display:none
              one as out of view, so only the visible one breathes.
            */}
            <FloatingFlower size={56} className="text-accent md:hidden" />
            <FloatingFlower size={88} className="hidden text-accent md:block" />

            {/*
              The hero's voice: weight 300, 1.05 leading, −0.02em tracking
              and `palt`, which is what keeps the two full-width marks from
              leaving holes in a headline.

              From md the statement is one line set in vw so it fills the
              screen at every desktop width instead of stopping at a rem
              cap. Measured with CoreText in Helvetica Neue Light and
              Hiragino Sans W3 — the stack macOS resolves to — the line is
              15.86em at this weight with palt and the tracking (fourteen
              kana and kanji, "SOS", and two marks that palt takes to
              half-width), so 5.55vw lands it at 88vw: inside the 40px
              gutters from 768px up, with room for a fallback face on
              Windows or Android to set it a couple of percent wider.

              Below md it breaks at the comma into two lines. 9.2vw puts the
              longer first line (8.8em) at ~81vw; the 1.9rem floor is what
              lets that line still fit a 320px phone inside its 24px
              gutters, where a 2rem floor overran them by 9px.

              `will-change` is only promised while the band is near the
              viewport and the line can actually move: a permanent
              compositor layer for a still heading is a cost with nothing
              to show for it.
            */}
            <motion.h2
              style={{ scale, willChange: moving ? "transform" : undefined }}
              className="mt-8 text-[clamp(1.9rem,9.2vw,3.25rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1] md:mt-10 md:text-[5.55vw] md:whitespace-nowrap"
            >
              <span className="block md:inline">声にならないSOSに、</span>
              <span className="block md:inline">気づける社会へ。</span>
            </motion.h2>
          </div>
        </div>
      </div>
    </section>
  );
}
