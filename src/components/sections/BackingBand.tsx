"use client";

import { motion, useScroll, useTransform, type Variants } from "motion/react";
import Image from "next/image";
import { Fragment, useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Container } from "@/components/ui";
import { FLOWER_PATH, FLOWER_SPIN_VIEWBOX } from "@/lib/flower";
import type { Locale } from "@/lib/i18n";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";

/**
 * A logo file for an entry, found by Backing in public/backers/ at build
 * time. When it is present it replaces the typeset name, and the entry's
 * `name` becomes the image's alt, so the claim is still text. There is
 * deliberately no separate alt field: a logo is the organisation's name
 * drawn, and a second string for it could only drift from the first.
 *
 * `width` and `height` are the file's own size (an SVG's viewBox, a PNG's
 * pixels), and only their ratio is used: every logo is drawn at the
 * wordmark's height (see LOGO_HEIGHT), so marks of very different
 * proportions still read as one row.
 */
export type BackerLogo = {
  src: string;
  width: number;
  height: number;
};

export type Backer = {
  /**
   * The organisation's own name, spelled the way it spells it — in each of
   * the site's languages, since a university has a name in both.
   */
  name: Record<Locale, string>;
  /**
   * What the relationship is, in the words the Blesc team confirmed and no
   * others. This line is the claim; the name above it is only who it is
   * about. See the note on BACKERS in Backing before adding a word to it.
   *
   * A `\n` written into a line marks the places it may wrap, and nowhere
   * else (see ScopeLine). A line without one is set as plain text.
   */
  scope: Record<Locale, string>;
  /**
   * Width classes for this entry's scope line, per language, in place of
   * the band's default (SCOPE_WIDTH). Only a line long enough to need its
   * own measure has one.
   */
  measure?: Record<Locale, string>;
  logo?: BackerLogo;
};

/**
 * The scope line under a name. Whole class strings, picked by language and
 * entry — Tailwind only generates what it can read.
 */
const SCOPE_CLASS =
  "mt-1.5 text-balance break-keep text-[0.875rem] leading-[1.5] text-muted";

/**
 * A scope line's width when its entry names none (Backer.measure).
 *
 * English adds two width classes for the stretch from md to lg, where the
 * row cannot hold ANOBAKA's line whole beside its neighbour: md:w-min sets
 * the line at its min-content width, which is its longer phrase, so it
 * stands as two lines; lg:w-auto lets it back out to one. On a line
 * without a `\n` they would set one word to a line, which is why a long
 * plain line names a measure of its own.
 */
const SCOPE_WIDTH = {
  ja: "",
  en: "md:w-min lg:w-auto",
} as const;

/**
 * A scope line, wrapping only where its author allowed.
 *
 * In English a line with a `\n` in it is set as phrases: each is an
 * inline-block that does not wrap inside, with an ordinary space between
 * them, so the line is read as one sentence and breaks only between two
 * phrases. That is what keeps "U-25 AI Accelerator," whole — left to the
 * browser the line can break after the hyphen of "U-25", or strand
 * "selected" on a line of its own.
 *
 * In Japanese a `\n` adds nothing between its two sides, because Japanese
 * puts no space between phrases: it becomes a <wbr>, one more place a
 * break-keep line may break, beside the spaces the line already has. That
 * is how 京都大学's line can break before との without a space appearing
 * there, which the confirmed wording does not have.
 *
 * A line without a `\n` is returned as the plain string it is.
 */
function ScopeLine({ text, locale }: { text: string; locale: Locale }) {
  const phrases = text.split("\n");
  if (phrases.length === 1) return text;
  if (locale === "ja") {
    return phrases.map((phrase, i) => (
      <Fragment key={phrase}>
        {i > 0 && <wbr />}
        {phrase}
      </Fragment>
    ));
  }
  return phrases.map((phrase, i) => (
    <Fragment key={phrase}>
      {i > 0 && " "}
      <span className="inline-block whitespace-nowrap">{phrase}</span>
    </Fragment>
  ));
}

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
 *
 * LOGO_BOX is that height's cap — 2.8875rem, 46.2px — rounded up, and it
 * is the height handed to next/image with the width that keeps the file's
 * ratio. Those two numbers hold the logo's box before the file arrives,
 * and for a PNG they are what next/image makes its 1x and 2x sizes from,
 * so a large file is not sent whole to be drawn 46px tall. An SVG is
 * served as it is (next/image does not optimise SVG).
 *
 * max-w-full and object-contain are for a very wide logo on a narrow
 * phone: the box narrows to the column and the mark shrinks inside it
 * instead of being squeezed out of proportion.
 */
const LOGO_HEIGHT = "h-[clamp(2.0625rem,3.52vw,2.8875rem)]";
const LOGO_BOX = 47;
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
 * The 共同研究・採択 band as it is drawn and moves. What it says — the
 * entries, the label, and the logos found for them — comes from Backing,
 * which is a server component so that it can look for the logo files.
 *
 * Built the way a startup page shows who backs it: a small label, a
 * hairline, the names in a row, on the plain white ground. It sits between
 * チーム and ニュース, both full sections with their own air, so the band
 * brings almost none of its own. It used to be a section of its own: 102px
 * of padding above and below at 1280, a 56px gap under the label and 60px
 * names, 390px in all, which put more than 230px of white either side of
 * two names. With one-line scope lines it came to 136px at 1280 — 32px
 * above and below and one 72px row. 京都大学's line is now the full
 * statement of the joint research, three lines in Japanese and four in
 * English, so the row is about 114px and 135px there (a 45px name cell,
 * 6px, and 21px a line) and the band about 178px and 199px — worked out
 * from the classes, not measured in a browser.
 *
 * There is no SectionTitle. Another display-size heading would put this on
 * the same footing as the argument the page makes, and a list of two names
 * is not an argument. The label is still the h2, so the band is a real stop
 * in the document outline and in a screen reader's heading list — it is
 * only set at label size.
 *
 * The entries are a description list: an organisation, then what it is to
 * Blesc. That is the claim as a screen reader should hear it — "京都大学,
 * 京都大学大学院 教育学研究科 附属臨床教育実践研究センターとの共同研究" — and the
 * names are real text unless a logo has replaced one, in which case its alt
 * carries the name. Each entry is a motion.div wrapping one dt and its dd,
 * which is valid inside a dl; the reveal reaches the entries through
 * motion's context rather than the DOM, so the dl between them and the
 * band costs nothing.
 *
 * Layout. From md the whole band is one centred row — label, hairline,
 * names — and the names wrap as a group when they do not fit side by side.
 * Below md the label, the hairline and the names stack and centre; from sm
 * the names sit side by side under the label, and below sm they stack as
 * well, because ANOBAKA's scope line is wider than half a phone and would
 * otherwise wrap in the middle of the programme's name. Names are
 * break-keep: a Japanese name breaks only where it has a space, so 京都大学
 * is never split, and a Latin name still may wrap at its spaces rather than
 * run off a narrow screen.
 *
 * 京都大学's scope line sets the band's widths, because it names the
 * research centre in full (see its `measure` in Backing).
 *
 * - Japanese: three lines at every width — 京都大学大学院 教育学研究科 /
 *   附属臨床教育実践研究センター / との共同研究. Every kanji and kana is one
 *   em, so the widest of the three is fourteen ems, 196px at 0.875rem;
 *   w-min holds the line to that, and break-keep with the one `\n` (a
 *   <wbr>, see ScopeLine) lets it break only at those three places. Set
 *   whole, its longest run would be twenty ems, 280px, wider than the
 *   272px a 320px phone leaves. At 768px the row — the flower and the
 *   label (共同研究・採択, seven ems with its tracking, about 99px), 105px
 *   of gaps and hairline, 196px and ANOBAKA's 195px — is about 621px of
 *   the 688px the Container leaves, so the Japanese page keeps its one row
 *   from md, as before.
 * - English: about 880–930px of running text at 0.875rem (Helvetica Neue
 *   to Inter, which is what Android and Windows draw — estimated from the
 *   faces' average advances), capped at 18rem and balanced, which sets it
 *   in four lines. That entry is 288px wide, and with the label ("Research
 *   and programs", about 161–174px) the row needs about 716–735px at md,
 *   where ANOBAKA's line is two lines (SCOPE_WIDTH): it is one row from
 *   about 800–815px, and below that ANOBAKA wraps under 京都大学, which is
 *   the wrap the row allows. From sm to md the names sit side by side when
 *   288px, 48px and ANOBAKA's whole line (260–276px) fit, from about
 *   644–660px; below that they stack. From lg the row holds both with
 *   room: about 869–898px of the 944px the Container leaves at 1024px. The
 *   ANOBAKA line fits whole down to about 325px and breaks between its two
 *   phrases under that.
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
 * also why this is a client component: the scroll that turns the flower
 * can only be read in the browser.
 *
 * Measured against the tokens in globals.css on bg-canvas (#ffffff): the
 * names in ink 19.43:1, the label and the scope lines in muted 6.25:1 (AA
 * at their 0.85 and 0.875rem), the hairline in line-strong 3.72:1 and the
 * flower in mark-1 5.44:1 — both decorative, and both clear the 3:1
 * non-text line anyway.
 */
export function BackingBand({
  locale: fromPage,
  label,
  backers,
}: {
  locale?: Locale;
  label: Record<Locale, string>;
  backers: Backer[];
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  /*
   * The page hands every section its language as a prop, and the layout's
   * provider holds the same one for client components. They cannot differ
   * on a page; the prop is read first only so that the band can be rendered
   * outside a provider and still be told what to say — which is why Backing
   * hands over both languages and leaves the choice to this.
   */
  const fromLayout = useLocale();
  const locale = fromPage ?? fromLayout;

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
              {label[locale]}
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
            {backers.map((backer, i) => {
              const name = backer.name[locale];
              return (
                /*
                  Keyed by the Japanese name in either language: it is the
                  entry's identity, not what the entry shows.
                */
                <motion.div
                  key={backer.name.ja}
                  variants={arrive(24, 0.2 + i * 0.1, reduce)}
                  className="flex flex-col items-center text-center md:items-start md:text-left"
                >
                  <dt
                    className={`flex items-center justify-center md:justify-start ${NAME_CELL}`}
                  >
                    {backer.logo ? (
                      <Image
                        src={backer.logo.src}
                        width={Math.round(
                          (LOGO_BOX * backer.logo.width) / backer.logo.height,
                        )}
                        height={LOGO_BOX}
                        alt={name}
                        className={`${LOGO_HEIGHT} w-auto max-w-full object-contain`}
                      />
                    ) : (
                      /*
                        Weight 300: the hero's voice, which is Helvetica Neue
                        Light on the Latin and Hiragino Sans W3 on the kanji.

                        The size follows the name as it is written in this
                        language, so "Kyoto University" is set as the Latin
                        wordmark it is, at ANOBAKA's size. palt and
                        break-keep are for the kanji and do nothing to a
                        Latin name, which breaks only at its spaces anyway.
                      */
                      <span
                        className={`font-light leading-[1.1] tracking-[-0.015em] text-balance break-keep text-ink [font-feature-settings:'palt'_1] ${
                          isLatin(name)
                            ? WORDMARK_SIZE.latin
                            : WORDMARK_SIZE.japanese
                        }`}
                      >
                        {name}
                      </span>
                    )}
                  </dt>
                  <dd
                    className={[
                      SCOPE_CLASS,
                      backer.measure?.[locale] ?? SCOPE_WIDTH[locale],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <ScopeLine text={backer.scope[locale]} locale={locale} />
                  </dd>
                </motion.div>
              );
            })}
          </dl>
        </motion.div>
      </Container>
    </section>
  );
}
