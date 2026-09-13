"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { Flower } from "@/components/Flower";
import { FloatingFlower } from "@/components/flourish/FloatingFlower";

/*
 * The brand flower, floating at either side of the footer's invitation.
 *
 * The footer closes the page with a centred heading and two buttons, which
 * leaves the gutters beside them empty. Product sites fill that spot with
 * floating objects from the product; the only object this company has is
 * its flower, so each gutter gets a small cluster of three — one soft wash
 * behind, one solid mark with its glow, one small mark drifting above — and
 * the whole layer eases upward as the footer scrolls in.
 *
 * Hidden below lg. The heading is 768px wide and centred, so below 1024px
 * there is no gutter for the clusters to sit in; anything shown there would
 * have to go behind the type, and text over a flower is the one thing this
 * layer must never produce.
 *
 * Stacking follows ScrollFlower: the layer is positioned with z-0 and
 * rendered FIRST inside the footer, so it paints above the footer's own
 * bg-canvas fill and below the Container, which carries z-10. A negative
 * z-index would drop it under the fill and make it invisible.
 *
 * overflow-x-clip on the layer, not on the footer. At lg the clusters are
 * tucked a little off both edges; overflow to the left never scrolls, but
 * overflow to the right would put a horizontal scrollbar on the page. The
 * footer itself must stay a plain containing block — its glow band is
 * position: fixed and a transform, filter or clip on an ancestor would
 * capture it — so the clip lives here, on a sibling of that band.
 */

/*
 * 22% of --mark-1 under a 22px blur is the ceiling ScrollFlower established
 * for a wash anywhere near copy, and it is kept here even though no text is
 * ever over these: the same wash at two strengths on one page would read as
 * two different ornaments. The wash is static on purpose — it is the soft
 * ground the two marks float over, not a third object.
 *
 * w-26 at lg, w-36 from xl: the 144px box does not fit the 128px gutter at
 * 1024 even tucked off the edge, so it drops to 104px there.
 */
const WASH =
  "absolute aspect-square w-26 text-mark-1 opacity-[0.22] blur-[22px] xl:w-36";

/*
 * Geometry, so the clusters can be checked against the heading without a
 * browser. The heading is centred at max-w-3xl (768px), so the gutter each
 * side is (viewport − 768) / 2: 128px at 1024, 256px at 1280, 336px at 1440.
 * Every other row — the buttons, the nav line, the address, the copyright —
 * is narrower than the heading and centred, so the heading's box is the
 * bound. Each cluster is anchored 3vw in from its edge (3vw − 3.5rem at lg,
 * which tucks it part-way off the page) and the figures below are how far
 * inward it reaches from the page edge, with a blur counted as one standard
 * deviation past its box: 22px for the wash, 18px for the glow, which
 * FloatingFlower draws at 1.6× the mark. Past one deviation a blur is under
 * a sixth of its own alpha and reads as nothing on the page.
 *
 *             left cluster reach   right cluster reach   gutter   margin
 *   1024      99 sharp / 123 halo   95 sharp / 123 halo  128      5px
 *   1280     210 sharp / 210 halo  184 sharp / 180 halo  256     46px
 *   1440     215 sharp / 215 halo  184 sharp / 180 halo  336    121px
 *
 * The right cluster's figures are distances in from the right edge; at
 * 1280 the right small mark sits at 184 + 38 = 222px in, 34px short of the
 * heading's box. The two sides are arranged differently, not mirrored: on
 * the left the small mark floats above and inward of the solid one, on the
 * right it sits below it, and the washes are set at different heights.
 *
 * The FloatingFlower marks sit in plain positioned wrappers rather than
 * taking the offsets through className: its className lands on a box that
 * is already `relative`, and two position utilities on one element would be
 * decided by stylesheet order.
 */
export function FooterFlowers() {
  const layerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  /*
   * The scroll window is the footer's, not this layer's: the drift should
   * run from the footer entering the viewport to the page ending, and this
   * layer is only 18rem of that. GradientFooter owns the <footer> element
   * and forwards no ref, so the ref is filled in from the DOM instead. This
   * is a path motion documents — useScroll waits on a microtask for a target
   * ref that an effect hydrates later — and the layer itself is the fallback
   * so the target can never be left empty, which useScroll treats as an
   * error.
   */
  useEffect(() => {
    footerRef.current = layerRef.current?.closest("footer") ?? layerRef.current;
  }, []);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  /*
   * 18px down to 14px up across the footer's whole scroll-in: a little faster
   * than the page, so the flowers read as lighter than the type they sit
   * beside. Under reduced motion the range collapses to zero rather than the
   * style prop being dropped — handing motion `undefined` would leave the
   * server-rendered translate sitting in the style attribute for good. The
   * breathing of the individual marks is FloatingFlower's own and it handles
   * reduced motion itself.
   */
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [18, -14]);

  /*
   * The layer holds four blurred elements, and a permanent will-change would
   * keep all of them rasterised in GPU memory from first paint for a layer
   * that only moves during the last screen of scroll. The promise is made as
   * the footer comes within half a screen and withdrawn when it leaves.
   */
  const near = useInView(layerRef, { margin: "50% 0px 50% 0px" });

  return (
    <motion.div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-10 z-0 hidden h-[18rem] overflow-x-clip lg:block"
      style={{ y, willChange: !reduce && near ? "transform" : undefined }}
    >
      {/* Left cluster: wash low, solid mark over it, small mark up and inward. */}
      <div className="absolute inset-y-0 left-[calc(3vw-3.5rem)] w-48 xl:left-[3vw]">
        <div className={`${WASH} top-8 left-0`}>
          {/*
            The size prop only fixes the ratio the viewBox is drawn against;
            h-full/w-full then fill the square box, as the contact page does.
          */}
          <Flower size={100} rotate={-10} className="h-full w-full" />
        </div>
        <div className="absolute top-17 left-4 xl:left-10">
          <FloatingFlower
            size={88}
            className="text-mark-1"
            rotate={-12}
            duration={5.2}
            glow
          />
        </div>
        <div className="absolute top-4 left-21 xl:left-33">
          <FloatingFlower
            size={40}
            className="text-mark-1 opacity-60"
            rotate={22}
            duration={3.8}
            delay={0.9}
          />
        </div>
      </div>

      {/* Right cluster: wash set lower, solid mark higher, small mark below and inward. */}
      <div className="absolute inset-y-0 right-[calc(3vw-3.5rem)] w-48 xl:right-[3vw]">
        <div className={`${WASH} top-12 right-0`}>
          <Flower size={100} rotate={16} className="h-full w-full" />
        </div>
        <div className="absolute top-14 right-4 xl:right-12">
          <FloatingFlower
            size={88}
            className="text-mark-1"
            rotate={14}
            duration={5.8}
            delay={0.6}
            glow
          />
        </div>
        <div className="absolute top-38 right-20 xl:right-36">
          <FloatingFlower
            size={40}
            className="text-mark-1 opacity-60"
            rotate={-20}
            duration={4.2}
            delay={1.4}
          />
        </div>
      </div>
    </motion.div>
  );
}
