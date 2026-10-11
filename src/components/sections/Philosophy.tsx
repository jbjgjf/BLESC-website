"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { Fragment, useLayoutEffect, useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { ShaderBackground } from "@/components/ShaderBackground";
import { WebGLFallback } from "@/components/webgl/WebGLErrorBoundary";
import { EXPO_OUT } from "@/lib/motion";
import { FLOWER_NOTCH, FLOWER_PATH, FLOWER_SPIN_VIEWBOX } from "@/lib/flower";
import type { Locale } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import { LIGHT_PALETTE } from "@/lib/sky";
import { ABOUT } from "@/lib/trust";

/*
 * The statement in each language, as the phrases a line may end on. The
 * paragraph under it is not here: it is lib/trust's ABOUT, which already
 * holds both languages side by side.
 */
const COPY = {
  ja: { statement: ["声にならないSOSに、", "気づける社会へ。"] },
  en: {
    statement: [
      "Toward a society",
      "that notices",
      "the SOS",
      "no one says aloud.",
    ],
  },
} as const;

/*
 * Where the English statement breaks: after each phrase but the last, on a
 * phone or from md. It is three lines on a phone — society / SOS / aloud —
 * and two from md, broken after "notices", and those two sets of breaks do
 * not nest. So they are <br>s that each show at one width or the other,
 * rather than the block spans the Japanese gets by with, whose one break
 * simply goes away at md.
 */
const EN_BREAKS = ["md:hidden", "hidden md:inline", "md:hidden"] as const;

/*
 * The type of the two blocks of words, per language. Whole class strings,
 * because Tailwind only generates what it can read. The Japanese cuts are
 * explained where they are used, below; these are the reasons the English
 * ones differ. The widths are worked out from the faces' advance widths —
 * Helvetica Neue, and Inter, which Android and Windows fall back to and
 * which runs about 8% wider — not measured in a browser.
 *
 * The statement. The Japanese line is 15.86em and spans the screen on one
 * line; the English is 23.9em (25.7em in Inter) and cannot, at any size
 * that still reads as a statement. So:
 *
 * - From md it is two lines, "Toward a society that notices" over "the SOS
 *   no one says aloud.", 12.07em and 11.52em (13.09em and 12.30em in
 *   Inter). At 5.4vw the longer is 65–71vw, inside the column at every
 *   width, and the type stands 69px on a 1280px laptop, where the Japanese
 *   stands 71px. Two lines are twice as tall as one, so the size also
 *   answers to the height — 10svh — which only bites on a window that is
 *   wide and short (63px at 1366×633), and keeps the paragraph on screen
 *   there; 2rem is the floor under both. No whitespace-nowrap: nothing
 *   needs it, and a face wider than Inter should wrap rather than run off
 *   a stage that clips.
 * - On a phone it is three lines, the longest "that notices the SOS" at
 *   8.53em (9.04em in Inter). 8vw keeps that inside the column — the screen
 *   less 48px — down to 320px in either face, and keeps three lines from
 *   costing much more height than the Japanese two: 98px against 75px on a
 *   390px phone.
 *
 * No palt: it is a Japanese feature, and there is no Japanese in the line.
 *
 * The paragraph. Latin text wraps at its spaces, so it needs neither
 * break-keep nor wrap-anywhere, and it wants less leading than Japanese:
 * 1.6 on a phone and 1.7 from md, against 1.75 and 1.9. At the same sizes
 * and the same 42rem it is five lines from md (six in Inter) and nine or
 * ten on a phone, where the Japanese is five and ten. text-pretty keeps a
 * lone "teachers." off the last line on a phone, where ten lines are more
 * than Chrome's text-balance will take on. text-balance is declared with
 * it for a browser that has balance and not pretty (Safari before 26),
 * which would otherwise leave that word alone from 320px to 393px in
 * Helvetica Neue: the two set the same property, Tailwind emits pretty
 * second, and a browser that does not know it keeps balance. From md,
 * balance evens the five or six.
 *
 * So the English column is 450–480px tall on a 1280×800 laptop and 392–421px
 * on a 768×1024 tablet, against 640px and 864px between the nav and the
 * matching clearance at the foot; and 460px on a 390×844 phone, 444px on an
 * iPhone SE, the same as the Japanese to within a line.
 */
const TYPE = {
  ja: {
    statement:
      "mt-[clamp(0.75rem,6svh,2rem)] text-[clamp(1.9rem,9.2vw,3.25rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1] md:mt-[clamp(0.75rem,6svh,2.5rem)] md:text-[5.55vw] md:whitespace-nowrap",
    paragraph:
      "mt-[clamp(0.75rem,4svh,1.5rem)] max-w-[42rem] text-balance break-keep wrap-anywhere text-[clamp(0.8rem,4vw,1rem)] leading-[1.75] text-ink md:mt-[clamp(0.75rem,5svh,2rem)] md:text-[1.0625rem] md:leading-[1.9]",
  },
  en: {
    statement:
      "mt-[clamp(0.75rem,6svh,2rem)] text-[clamp(1.6rem,8vw,3.25rem)] font-light leading-[1.05] tracking-[-0.02em] text-ink md:mt-[clamp(0.75rem,6svh,2.5rem)] md:text-[max(2rem,min(5.4vw,10svh))]",
    paragraph:
      "mt-[clamp(0.75rem,4svh,1.5rem)] max-w-[42rem] text-balance text-pretty text-[clamp(0.8rem,4vw,1rem)] leading-[1.6] text-ink md:mt-[clamp(0.75rem,5svh,2rem)] md:text-balance md:text-[1.0625rem] md:leading-[1.7]",
  },
} as const;

/*
 * The pinned stretch, in fractions of its own scroll. The statement is
 * already there when the page opens, so the flower starts almost at once:
 * it drifts to the centre of the screen, grows and turns once, and the
 * words — the statement and the paragraph under it, on one window — fade as
 * the petals pass over them. The flower's blue fills the screen, and then
 * the whole stage fades away over the hero, which has been sitting
 * underneath it the whole time — so the pin ends on the hero, with nothing
 * left to scroll.
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
 * words. Under the line is one paragraph that says what Blesc is — ABOUT in
 * lib/trust, the company's wording, rendered as written — so a first-time
 * visitor knows what the product is from the first screen, before anything
 * has been scrolled. Both are paragraphs rather than headings — the hero
 * below still carries the page's h1, so the heading outline starts where
 * the argument does.
 *
 * Both are in the page's language: the same line and the same paragraph on
 * / and on /en, each set in its own type (see TYPE). Nothing else differs —
 * the stage, the flower and the dive are one piece of code, and the dive's
 * geometry is measured off the laid-out column, so it follows whichever
 * language's words made the column the height it is.
 *
 * Then the flower is the transition. The band pins, and the flower drifts to
 * the centre of the screen, turns once and grows until its blue is all
 * there is — and then the blue fades away, and the hero is already there
 * underneath it: the hero is pulled up under this section's last pinned
 * screen (see Hero), so the pin ends on it and there is nothing left to
 * scroll.
 *
 * Reduced motion, or a page without JavaScript, gets one still screen: the
 * sky, the flower, the line and the paragraph at rest, and a hero that
 * simply follows. The dive runs on every pointer, phones included, because
 * the dive is the point.
 */
export function Philosophy({ locale: fromPage }: { locale?: Locale }) {
  /*
   * The page hands every section its language, and the layout sets the same
   * one in context for client components like this. The prop is used when it
   * is there, so a section answers to the page that rendered it; the two
   * cannot differ, both being the route's.
   */
  const fromLayout = useLocale();
  const locale = fromPage ?? fromLayout;
  const type = TYPE[locale];

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
   * whole screen sliding. It is a real journey: the column is centred as a
   * whole, so with the paragraph in it the flower rests well above the
   * stage's centre — about 155px on a laptop and 200px on a phone — and
   * comes down across the words to get there. In English the column is
   * taller on a laptop, two lines of statement for one, and the journey is
   * 180–195px there; on a phone it is the same 200px.
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
     * on a phone, or rewrap the paragraph under it — and the drift to centre
     * is worked out from that height. The English paragraph is the likelier
     * of the two to do it: it is five lines in Helvetica Neue and six in
     * Inter.
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

          Still, it is one small viewport at least, and a minimum rather
          than a height: this element clips, so the still screen has to be
          able to grow with its words. The column is about 460px on a phone —
          the paragraph runs to ten lines there — which the old 72svh, with
          the nav over its top, could not hold.

          py-20 is the fixed nav's height, kept clear at the top and matched
          at the foot, and the column is centred by its own auto margins
          (my-auto, below) rather than by items-center. Where the column
          fits, the two are the same thing. Where it does not — a phone on
          its side — auto margins fall to nothing, so the column starts
          under the nav and runs off the foot, where items-center would have
          pushed the flower up under the nav's links as well.

          pointer-events-none: nothing in the stage is interactive, and at
          the end of the pin it is a transparent layer over the hero's
          buttons, which have to take the click.
        */}
        <motion.div
          ref={stage}
          className="pointer-events-none sticky top-0 flex min-h-[100svh] items-start justify-center overflow-hidden px-6 py-20 md:px-10 motion-safe:js:h-[100lvh]"
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
              the canvas as #95c3f0, and ink over that is 10.5:1. Over the
              palette's deepest stop, #90bfed, which is as dark as the sky
              can get, it is still 10.05:1.
            */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--scrim-strong)_0%,var(--scrim-soft)_28%,var(--scrim-soft)_72%,var(--scrim-strong)_100%)]" />
          </div>

          {/*
            The entrance: the page's first frame, so it arrives on load
            rather than on scroll — a short rise out of nothing, flower,
            line and paragraph together. The layout's noscript rule shows it
            at once without a script, and reduced motion gets the fade alone.

            my-auto is the vertical centring (see the stage, above).
          */}
          <motion.div
            data-statement-column
            className="relative my-auto flex flex-col items-center text-center"
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

              Its size, and the two gaps under it, are set in svh with their
              usual values as the ceiling: the flower is its full 56px from
              560px of height and its full 88px, from md, from about 630px —
              in practice every phone held upright and every laptop window.
              Below that the ornament and the air give way before the words
              do, which is what keeps the paragraph's last line on a screen
              390px tall. svh, not lvh: what has to fit is what shows before
              the toolbar collapses.
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
                className="size-[clamp(2.25rem,10svh,3.5rem)] text-accent md:size-[clamp(2.5rem,14svh,5.5rem)]"
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

              That is the Japanese. The English line is half as long again
              and is set smaller, on two lines from md and three below it;
              see TYPE and EN_BREAKS. The space before each <br> is the one
              between the words when that break is not showing.
            */}
            <motion.p
              style={{ opacity: reduce ? 1 : lineOpacity }}
              className={type.statement}
            >
              {locale === "ja"
                ? COPY.ja.statement.map((phrase) => (
                    <span key={phrase} className="block md:inline">
                      {phrase}
                    </span>
                  ))
                : COPY.en.statement.map((phrase, i) => (
                    <Fragment key={phrase}>
                      {phrase}
                      {i < EN_BREAKS.length && (
                        <>
                          {" "}
                          <br className={EN_BREAKS[i]} />
                        </>
                      )}
                    </Fragment>
                  ))}
            </motion.p>

            {/*
              What Blesc is, in one paragraph, on the first screen: the
              statement says what the company is for and nothing about what
              the product does, and the page's plain description of it
              (Intro) is several sections down. The words are lib/trust's
              ABOUT, in the page's language — the paragraph the
              安全とプライバシー page opens with too — rendered as written,
              never reworded here.

              It leaves with the statement, on the same motion value, and
              arrives with it, inside the column's entrance.

              Ink, in the regular weight. It sits straight on the sky like
              the line above it: ink is 10.05:1 over the sky's deepest blue,
              where the muted grey the site sets its other paragraphs in is
              3.23:1, under AA at this size.

              break-keep, so it only breaks after 、 and 。 — Japanese has no
              spaces, and a centred paragraph left to itself breaks wherever
              the width runs out, in the middle of a word. Every line then
              ends where a clause does. Two numbers follow from that:

              - From md it is five lines, and the longest of them is 38
                characters, 646px at 17px. Hence 42rem: at 40rem that line
                does not fit and the paragraph resets as six ragged ones.
              - On a phone it is ten lines, one or two clauses each, and the
                longest clause is 21 characters. The size is 4vw so that
                clause fits the column — the screen less the stage's 48px of
                padding — down to a 320px phone: 14.4px at 360px wide, 16px
                from 400px. If it ever does not fit — a reader's own larger
                text size — wrap-anywhere lets it break rather than run off
                the screen.

              text-balance evens the lines where the browser will (up to six
              in Chrome), which is what stops a stranded last clause on the
              widths just under md.

              With this in it the column is 396px tall on a 1280×800 laptop,
              which has 720px under the nav, and 445–460px on a phone, where
              Safari with its toolbars showing leaves about 470px (an iPhone
              SE) to 580px (an iPhone 14).

              All of that is the Japanese setting. The English paragraph
              breaks at its spaces and takes less leading; TYPE has its
              classes and the heights they come to.
            */}
            <motion.p
              style={{ opacity: reduce ? 1 : lineOpacity }}
              className={type.paragraph}
            >
              {ABOUT[locale]}
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
