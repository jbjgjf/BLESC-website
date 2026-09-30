"use client";

import { motion, useScroll, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Container } from "@/components/ui";
import { FLOWER_PATH, FLOWER_SPIN_VIEWBOX } from "@/lib/flower";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";

/**
 * An optional logo file for an entry. When it is present it replaces the
 * typeset name, and the entry's `name` becomes the image's alt, so the claim
 * is still text. There is deliberately no separate alt field: a logo is the
 * organisation's name drawn, and a second string for it could only drift
 * from the first.
 *
 * `width` and `height` are the file's intrinsic size, which next/image needs
 * for the aspect ratio. The rendered size is set by the band, not by them —
 * every logo is drawn at the wordmark's height (see LOGO_HEIGHT), so marks
 * of very different proportions still read as one row.
 */
type BackerLogo = {
  src: string;
  width: number;
  height: number;
};

type Backer = {
  /** The organisation's own name, spelled the way it spells it. */
  name: string;
  /**
   * What the relationship is, in the words the Blesc team confirmed and no
   * others. This line is the claim; the name above it is only who it is
   * about. See the note on BACKERS before adding a word to it.
   */
  scope: string;
  logo?: BackerLogo;
};

/**
 * Who stands behind Blesc, as the Blesc team stated it on 2026-09-30.
 *
 * Each scope line is exactly what was confirmed, and it is kept to that on
 * purpose. docs/claims.md §3 does not allow an unscoped relationship word:
 * 共同研究, 監修, 協働, 提携 and 連携 each say something specific about what
 * an institution did, and none of them has been confirmed for either entry.
 * A word that is true in spirit is still a claim about someone else's name,
 * in copy read by schools and boards of education — the kind of line that
 * is most expensive to take back.
 *
 * 京都大学 — the team's word was 支援, and the written permission is on
 * file (recorded in scripts/check-claims.mjs PERMITTED_ORGS). The claims
 * check keeps it scoped as well as named: 共同研究, 監修 and the rest beside
 * 京都大学 fail CI (unscoped-relationship).
 *
 * ANOBAKA — the relationship is selection into a named programme, so the
 * line is the programme and the result: 「U-25 AI Accelerator 第2期 採択」.
 * It is an accelerator and not an investment. ANOBAKA is itself a venture
 * capital firm — the reviewer's own shorthand was "ANOBAKA VC" — which is
 * exactly why VC / 出資 / 投資 must never appear beside it: a reader would
 * take them as a statement that it holds equity in Blesc. The check
 * enforces that too (accelerator-as-investment).
 *
 * No amount is printed here. An amount is an event, not a relationship, so
 * it goes in ニュース (src/lib/news.ts), with the selection it came with.
 *
 * No 監修者 is listed because none has been named. An expert added here
 * before one is agreed would be the same failure as the 京都大学
 * collaboration line テクノロジー once carried, and had to drop, before any
 * permission existed.
 */
const BACKERS: Backer[] = [
  { name: "京都大学", scope: "支援" },
  { name: "ANOBAKA", scope: "U-25 AI Accelerator 第2期 採択" },
];

/**
 * A Latin name is set larger than a Japanese one, so that the two read as
 * the same size.
 *
 * At one font size they do not. A kanji fills most of its em square, while
 * Helvetica Neue's capitals stand about 0.71em tall, so at one size 京都大学
 * has roughly a fifth more ink than ANOBAKA beside it — the university's
 * name looked a size up from the programme, which is a ranking nobody
 * chose. Every term of the Japanese clamp is five sixths of the Latin one,
 * so the correction holds at every width: at the cap, 2.1875rem kanji and
 * 2.625rem capitals both put about 30px of ink on the line.
 *
 * Strip size, not display size. These are marks in a row of backers, the
 * way a startup page shows the names behind it, and they only need to be
 * unmistakably the largest thing in the band — a heading-sized pair here
 * was most of why the band used to stand as tall as a section.
 *
 * The test is on the string rather than a field in the data: whoever adds
 * an entry should only have to type the name. Printable ASCII is a Latin
 * wordmark; anything else is set as Japanese.
 *
 * Written out in full — Tailwind only generates classes it can read.
 */
const WORDMARK_SIZE = {
  latin: "text-[clamp(1.875rem,3.2vw,2.625rem)]",
  japanese: "text-[clamp(1.5625rem,2.667vw,2.1875rem)]",
} as const;

function isLatin(name: string) {
  return /^[ -~]+$/.test(name);
}

/**
 * A logo is drawn at the height of the larger wordmark's line box (the
 * Latin clamp times its 1.1 leading), which is also the minimum height of
 * every name cell. That keeps each scope line on the same baseline across
 * the row, whichever mix of wordmarks and logos the row holds.
 */
const LOGO_HEIGHT = "h-[clamp(2.0625rem,3.52vw,2.8875rem)]";
const NAME_CELL = "min-h-[clamp(2.0625rem,3.52vw,2.8875rem)]";

/**
 * The band's arrival: the label comes in from the left, the names from the
 * right, and both close on the hairline between them as it draws. Offsets
 * are the page reveal's 24px and its expo-out, turned on their side, so the
 * band moves like everything else on the page and not like a widget.
 *
 * Under reduced motion only the opacity moves. The x and blur are still
 * named in `show`, with no duration, because the flag behind `reduce` reads
 * false through hydration: an element can mount with the moving `hidden`
 * and only learn afterwards that the visitor asked for stillness. Leaving
 * x out of the reduced `show` would leave it parked 24px off and blurred.
 */
function arrive(from: number, delay: number, reduce: boolean): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
          duration: 0.3,
          ease: "linear",
          x: { duration: 0 },
          filter: { duration: 0 },
        },
      },
    };
  }
  return {
    hidden: { opacity: 0, x: from, filter: "blur(4px)" },
    show: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: EXPO_OUT, delay },
    },
  };
}

/**
 * The hairline between the label and the names, drawn out from its middle.
 * It is horizontal under the label on a phone and vertical beside it from
 * md, so there are two of them and each scales along its own length. A
 * uniform scale would serve both, but it would also thin the line while it
 * grew. Reduced motion gets the drawn line, at once.
 */
function drawn(axis: "x" | "y", reduce: boolean): Variants {
  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.9, ease: EXPO_OUT, delay: 0.1 };
  return axis === "x"
    ? { hidden: { scaleX: reduce ? 1 : 0 }, show: { scaleX: 1, transition } }
    : { hidden: { scaleY: reduce ? 1 : 0 }, show: { scaleY: 1, transition } };
}

/**
 * How far the flower turns across the band's pass through the viewport,
 * either side of upright. One petal's worth: the mark's five petal tips sit
 * 72° apart, so a turn of 72° lands on the same silhouette it started from,
 * and the flower reads as upright at both ends of the pass, in the middle
 * of it, and in the server HTML, which is drawn at the start of the pass.
 *
 * On an ordinary load the band is below the fold, at the start of its
 * pass, so the first scroll read changes nothing. Landing with the band
 * already on screen — a deep link, a restored scroll — sets the mark to the
 * angle for that position on the first read: a single step of at most
 * half a petal (36°) on an 18px mark, which is accepted. Without
 * JavaScript the still, upright mark is the one the page draws.
 */
const FLOWER_TURN = 72;

/**
 * 支援・採択 — a band, not a section.
 *
 * Built the way a startup page shows who backs it: a small label, a
 * hairline, the names in a row, on the plain white ground. It sits between
 * チーム and ニュース, both full sections with their own air, so the band
 * brings almost none of its own. It used to be a section of its own: 102px
 * of padding above and below at 1280, a 56px gap under the label and
 * 60px names, 390px in all, which put more than 230px of white either side
 * of two names. At 1280 it is now 136px — 32px above and below and one
 * 72px row — and at 768 116px against 289px. On a phone the names stack
 * under the label, 251px against 397px.
 *
 * There is no SectionTitle. Another display-size heading would put this on
 * the same footing as the argument the page makes, and a list of two names
 * is not an argument. The label is still the h2, so the band is a real stop
 * in the document outline and in a screen reader's heading list — it is
 * only set at label size.
 *
 * The heading is 支援・採択 rather than "Backed by" or 支援 alone. In
 * English, "backed by" beside the name of a firm that runs a venture fund
 * reads as an investment, which is the one thing that must not be implied
 * about ANOBAKA. And 支援 alone would repeat 京都大学's own scope line word
 * for word. 支援・採択 is exactly the two relationships below it, and says
 * nothing they do not.
 *
 * The entries are a description list: an organisation, then what it is to
 * Blesc. That is the claim as a screen reader should hear it — "京都大学,
 * 支援" — and the names are real text unless a logo has replaced one, in
 * which case its alt carries the name. Each entry is a motion.div wrapping
 * one dt and its dd, which is valid inside a dl; the reveal reaches the
 * entries through motion's context rather than the DOM, so the dl between
 * them and the band costs nothing.
 *
 * Layout. From md the whole band is one centred row — label, hairline,
 * names — and the names wrap as a group if a third or fourth is ever added.
 * Below md the label, the hairline and the names stack and centre; from sm
 * the names sit side by side under the label, and below sm they stack as
 * well, because ANOBAKA's scope line is wider than half a phone and would
 * otherwise wrap in the middle of the programme's name. Names are
 * break-keep: a Japanese name breaks only where it has a space, so 京都大学
 * is never split, and a Latin name still may wrap at its spaces rather than
 * run off a narrow screen.
 *
 * Motion is what keeps a band this small from sitting there. The pieces
 * close in on the hairline as it draws (see arrive and drawn), and the
 * flower beside the label turns two petals' worth as the band passes
 * through the screen (see FLOWER_TURN), tied to the scroll so it moves only
 * while the reader does. It is not a marquee: a loop of two names reads as
 * padding. And there is no hover state, because nothing here is a link — a
 * name that lights up under the pointer promises a click it cannot keep.
 *
 * Without JavaScript the layout's noscript rule sets every inline-styled
 * element in <main> to full opacity with no filter or transform, so the
 * names, the drawn line and the upright flower are simply there. That is
 * also why this became a client component: the scroll that turns the
 * flower can only be read in the browser.
 *
 * Measured against the tokens in globals.css on bg-canvas (#ffffff): the
 * names in ink 19.43:1, the label and the scope lines in muted 6.25:1 (AA
 * at their 0.85 and 0.875rem), the hairline in line-strong 3.72:1 and the
 * flower in mark-1 5.44:1 — both decorative, and both clear the 3:1
 * non-text line anyway.
 */
export function Backing() {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();

  /*
   * The band's own box from entering the bottom of the viewport to leaving
   * the top, so the angle is a pure function of where the page is — right
   * on a deep link or a Lenis anchor jump, with no state per frame. Under
   * reduced motion the range collapses rather than the style being dropped,
   * so motion keeps writing the upright mark (the same pattern as Drift).
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [-FLOWER_TURN, FLOWER_TURN],
  );

  return (
    <section
      ref={ref}
      id="backing"
      aria-labelledby="backing-title"
      className="scroll-mt-24 bg-canvas py-[clamp(1.75rem,2.5vw,2.25rem)]"
    >
      <Container>
        <motion.div
          className="flex flex-col items-center gap-y-4 md:flex-row md:items-stretch md:justify-center md:gap-x-[clamp(2rem,4vw,3.5rem)]"
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          {/*
            The brand flower as the band's mark, the same way it marks each
            row of ニュース, beside the label so the label stays one quiet
            line. Drawn in the square box centred on the flower
            (FLOWER_SPIN_VIEWBOX), so it turns in place rather than wobbling
            about the artwork's off-centre box. Centred on the whole entry
            from md — name and scope together — the way a label sits beside
            a two-line item.
          */}
          <motion.div
            variants={arrive(-24, 0, reduce)}
            className="flex shrink-0 items-center gap-2 md:self-center"
          >
            <motion.span
              aria-hidden
              className="block size-[18px] shrink-0 text-mark-1"
              style={{ rotate }}
            >
              <svg
                focusable="false"
                viewBox={FLOWER_SPIN_VIEWBOX}
                className="size-full"
              >
                <path d={FLOWER_PATH} fill="currentColor" fillRule="evenodd" />
              </svg>
            </motion.span>
            <h2
              id="backing-title"
              className="whitespace-nowrap text-[0.85rem] font-medium tracking-[0.04em] text-muted"
            >
              支援・採択
            </h2>
          </motion.div>

          {/*
            line-strong, as DrawnRule argues for it: this line is structure —
            it is what makes a label and two names read as one band — and
            line-strong is the token that holds 3:1 on white.
          */}
          <motion.span
            aria-hidden
            variants={drawn("x", reduce)}
            className="block h-px w-10 bg-line-strong md:hidden"
          />
          <motion.span
            aria-hidden
            variants={drawn("y", reduce)}
            className="hidden w-px bg-line-strong md:block"
          />

          <dl className="flex flex-col items-center gap-y-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center sm:gap-x-12 md:justify-start md:gap-x-[clamp(2.5rem,5vw,4.5rem)]">
            {BACKERS.map((backer, i) => (
              <motion.div
                key={backer.name}
                variants={arrive(24, 0.2 + i * 0.1, reduce)}
                className="flex flex-col items-center text-center md:items-start md:text-left"
              >
                <dt
                  className={`flex items-center justify-center md:justify-start ${NAME_CELL}`}
                >
                  {backer.logo ? (
                    <Image
                      src={backer.logo.src}
                      width={backer.logo.width}
                      height={backer.logo.height}
                      alt={backer.name}
                      className={`${LOGO_HEIGHT} w-auto`}
                    />
                  ) : (
                    /*
                      Weight 300: the hero's voice, which is Helvetica Neue
                      Light on the Latin and Hiragino Sans W3 on the kanji.
                    */
                    <span
                      className={`font-light leading-[1.1] tracking-[-0.015em] text-balance break-keep text-ink [font-feature-settings:'palt'_1] ${
                        isLatin(backer.name)
                          ? WORDMARK_SIZE.latin
                          : WORDMARK_SIZE.japanese
                      }`}
                    >
                      {backer.name}
                    </span>
                  )}
                </dt>
                <dd className="mt-1.5 text-balance break-keep text-[0.875rem] leading-[1.5] text-muted">
                  {backer.scope}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </Container>
    </section>
  );
}
