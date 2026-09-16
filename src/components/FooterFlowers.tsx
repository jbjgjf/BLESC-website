"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { FloatingFlower } from "@/components/flourish/FloatingFlower";

/*
 * The brand flower, floating at either side of the footer's invitation.
 *
 * The footer closes the page with a centred heading and two buttons, which
 * leaves the gutters beside them empty. Product sites fill that spot with
 * floating objects from the product; the only object this company has is
 * its flower, so each gutter gets a pair — one solid mark, one small mark
 * drifting above it out of phase — and the whole layer eases upward as the
 * footer scrolls in. They are flat marks, the way the flower is flat in the
 * logo: a blurred wash behind them and a halo around them were both tried
 * and both read as an effect rather than as the brand.
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
 * Geometry, so the clusters can be checked against the heading without a
 * browser. The heading is centred at max-w-3xl (768px), so the gutter each
 * side is (viewport − 768) / 2: 128px at 1024, 256px at 1280, 336px at 1440.
 * Every other row — the buttons, the nav line, the address, the copyright —
 * is narrower than the heading and centred, so the heading's box is the
 * bound. Each cluster is anchored 3vw in from its edge (3vw − 3.5rem at lg,
 * which tucks it part-way off the page) and the figures below are how far
 * inward its marks reach from the page edge.
 *
 *             left reach   right reach   gutter   margin
 *   1024        99           95           128      29px
 *   1280       210          184           256      46px
 *   1440       215          184           336     121px
 *
 * The right cluster's figures are distances in from the right edge; at
 * 1280 the right small mark sits at 184 + 38 = 222px in, 34px short of the
 * heading's box. The two sides are arranged differently, not mirrored: on
 * the left the small mark floats above and inward of the solid one, on the
 * right it sits below it.
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
   * A permanent will-change would keep the layer rasterised in GPU memory
   * from first paint for something that only moves during the last screen
   * of scroll. The promise is made as the footer comes within half a screen
   * and withdrawn when it leaves.
   */
  const near = useInView(layerRef, { margin: "50% 0px 50% 0px" });

  return (
    <motion.div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-10 z-0 hidden h-[18rem] overflow-x-clip lg:block"
      style={{ y, willChange: !reduce && near ? "transform" : undefined }}
    >
      {/* Left cluster: solid mark low, small mark up and inward. */}
      <div className="absolute inset-y-0 left-[calc(3vw-3.5rem)] w-48 xl:left-[3vw]">
        <div className="absolute top-17 left-4 xl:left-10">
          <FloatingFlower
            size={88}
            className="text-accent"
            rotate={-12}
            duration={5.2}
          />
        </div>
        <div className="absolute top-4 left-21 xl:left-33">
          <FloatingFlower
            size={40}
            className="text-accent opacity-60"
            rotate={22}
            duration={3.8}
            delay={0.9}
          />
        </div>
      </div>

      {/* Right cluster: solid mark higher, small mark below and inward. */}
      <div className="absolute inset-y-0 right-[calc(3vw-3.5rem)] w-48 xl:right-[3vw]">
        <div className="absolute top-14 right-4 xl:right-12">
          <FloatingFlower
            size={88}
            className="text-accent"
            rotate={14}
            duration={5.8}
            delay={0.6}
          />
        </div>
        <div className="absolute top-38 right-20 xl:right-36">
          <FloatingFlower
            size={40}
            className="text-accent opacity-60"
            rotate={-20}
            duration={4.2}
            delay={1.4}
          />
        </div>
      </div>
    </motion.div>
  );
}
