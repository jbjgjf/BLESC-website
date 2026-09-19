/**
 * A crowd, not a count.
 *
 * Deliberately not a unit chart: nobody is meant to count these, and the count
 * is not a multiple of anything the copy claims. Blurred back at low opacity it
 * gives the figure a crowd to stand on, and the text over it still clears AA in
 * both themes — 5.2:1 for muted copy at this opacity, which is the whole reason
 * it is this faint.
 *
 * What changed is that it is now a crowd rather than a grid. Identical glyphs on
 * exact rows read as wallpaper however far you blur them, because the eye finds
 * the lattice before it finds the people; so every figure is nudged off its cell
 * by a fixed amount derived from its index, and the rows recede — smaller and
 * fainter towards the back — so the bank has depth and a front edge. It is
 * anchored to the bottom of the panel, which is what lets the figure above it
 * stand on the crowd instead of floating in the middle of it.
 *
 * Nothing here animates. The panel's own reveal brings it in, and a hundred
 * and twenty-eight elements fading in behind a blur would mean re-blurring
 * half a panel on every frame of it.
 */

const COLUMNS = 16;
const ROWS = 8;

/**
 * A fixed value in [0,1) for a given figure and channel.
 *
 * Integer mixing, not Math.sin: sine is allowed to differ in its last bits
 * between Node and a browser engine, and these numbers are written into inline
 * styles during SSR, so a disagreement would be a hydration mismatch on every
 * figure in the crowd.
 */
function noise(index: number, channel: number) {
  let h = (index * 0x9e3779b1 + channel * 0x85ebca77) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** -1…1 */
const signed = (index: number, channel: number) => noise(index, channel) * 2 - 1;

export function StudentCrowd() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 opacity-[0.14] blur-[3px]"
    >
      <div className="grid w-full grid-cols-16 gap-x-3 gap-y-2">
        {Array.from({ length: COLUMNS * ROWS }, (_, i) => {
          // 0 at the back of the bank, 1 at the front.
          const depth = Math.floor(i / COLUMNS) / (ROWS - 1);

          /*
           * Scatter is a fraction of the figure's own box, so it holds at
           * every panel width. Kept under half a gap in each direction: past
           * that the crowd starts to clump into pairs, which reads as a
           * mistake rather than as a crowd.
           */
          const x = signed(i, 1) * 24;
          const y = signed(i, 2) * 26;
          /*
           * Size and weight both fall off towards the back. No figure exceeds
           * full strength, so the densest point of the crowd is still the
           * 0.14 the contrast figure above was measured at.
           */
          const scale = (0.86 + noise(i, 3) * 0.2) * (0.84 + depth * 0.16);
          const opacity = (0.3 + depth * 0.7) * (0.74 + noise(i, 4) * 0.26);

          return (
            <span
              key={i}
              className="block"
              style={{
                transform: `translate(${x.toFixed(2)}%, ${y.toFixed(2)}%) scale(${scale.toFixed(3)})`,
                opacity: opacity.toFixed(3),
              }}
            >
              <svg
                viewBox="0 0 12 17"
                className="h-auto w-full text-mark-1"
                fill="currentColor"
              >
                <circle cx="6" cy="3.4" r="3.4" />
                <path d="M6 8.2c-3.1 0-5.4 2.1-5.4 5.1V17h10.8v-3.7c0-3-2.3-5.1-5.4-5.1Z" />
              </svg>
            </span>
          );
        })}
      </div>
    </div>
  );
}
