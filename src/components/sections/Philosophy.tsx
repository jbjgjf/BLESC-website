"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import Image from "next/image";
import { Fragment, useRef } from "react";
import { Reveal } from "@/components/Reveal";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { Section, SectionTitle } from "@/components/ui";

/**
 * The two photographs, at their own proportions.
 *
 * `width`/`height` are the files' intrinsic pixel sizes, which is what makes
 * the rendered box the source aspect ratio rather than a crop of it: the
 * images used to sit in fixed 2:3 and 1:1 frames with object-cover, so both
 * were losing an edge. Nothing is upscaled either — the main photograph is
 * 1505px wide and renders at about 350.
 */
const PHOTO = {
  src: "/photos/philosophy.png",
  alt: "",
  width: 1505,
  height: 2001,
} as const;

/** The square-ish inset that overhangs the main photograph's top-right. */
const PHOTO_INSET = {
  src: "/photos/philosophy-2.png",
  alt: "",
  width: 882,
  height: 946,
} as const;

/**
 * Two lines, in the page's own voice.
 *
 * This was the most text-heavy block on the site — six paragraphs of founding
 * story in a single column. What is left is the turning point and the closing
 * statement, because those are the two the rest was leading to; the passage
 * in between made the same case that 課題 and the hero already make in fewer
 * words — 気づけるのが「何かが起きた後」だけ and 孤立する前に可視化する are both
 * stated in 課題, so nothing the company claims is lost with them.
 *
 * `[[…]]` marks the phrase inside a line that carries the accent — the eye
 * should land on the phrase, not on a container. `mark` says which of the two
 * treatments that phrase gets.
 */
type Block = { text: string; mark: MarkKind };

const PULL: Block = {
  /*
   * The sign was there and nobody saw it, so the phrase is marked but not
   * underlined — it is the one that went unnoticed.
   */
  mark: "quiet",
  text: `[[サイン]]は、確かにそこにあったはずでした。`,
};

const CLOSE: Block = {
  mark: "drawn",
  text: `誰かが孤立する前に、[[見えないものを可視化する]]。
それが、私たちがBlescをつくる理由です。`,
};

const SPLIT = /(\[\[.*?\]\])/g;

type MarkKind = "quiet" | "drawn";

/**
 * The rule under 見えないものを可視化する, drawn left to right as the statement
 * arrives.
 *
 * It replaces a static `underline decoration-2`, and the swap is the point:
 * the company's claim is that the signs are already there and only need
 * making visible, so the closing statement marks itself as you read it
 * rather than arriving pre-annotated. One transform on one small element,
 * once — no layout, no repaint of the text.
 *
 * It carries its own `whileInView` rather than inheriting the surrounding
 * <Reveal>'s variant label. Inheriting would work and save an observer, but
 * it puts a visible piece of the design at the mercy of variant propagation
 * through two plain elements — and the failure mode is a rule that never
 * draws at all, which is invisible in review.
 */
const RULE: Variants = {
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    // Starts after the line itself has settled, so the eye has the words
    // before it has the mark.
    transition: { duration: 0.9, ease: EXPO_OUT, delay: 0.35 },
  },
};

/** Reduced motion gets the drawn state, not the undrawn one. */
const RULE_STATIC: Variants = { hidden: { scaleX: 1 }, show: { scaleX: 1 } };

/**
 * An accented phrase.
 *
 * The colour is flat mark-1 in both states on purpose: 5.44:1 on the light
 * ground and 10.09:1 on the dark one, and nothing fades it part-way, so the
 * phrase is readable at every frame of the reveal. Only the rule moves.
 */
function Mark({ children, kind }: { children: string; kind: MarkKind }) {
  const reduce = useReducedMotion();

  if (kind === "quiet") {
    return <em className="font-medium not-italic text-mark-1">{children}</em>;
  }

  return (
    /*
     * inline-block is what gives the rule a box to span. The phrase is short
     * enough to hold one line at every width the column takes, and an
     * inline-block is still a block container, so a narrow viewport wraps
     * inside it rather than overflowing.
     *
     * The rule sits at the box's bottom edge — with 1.45 leading that lands
     * about a third of an em under the baseline, which is the offset the
     * static underline had, without having to guess at a serif's metrics.
     */
    <em className="relative inline-block font-medium not-italic text-mark-1">
      {children}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[0.075em] origin-left rounded-full bg-mark-1/45"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={reduce ? RULE_STATIC : RULE}
      />
    </em>
  );
}

function Rich({
  text,
  mark,
  className,
}: {
  text: string;
  mark: MarkKind;
  className?: string;
}) {
  return (
    <p className={className}>
      {text
        .trim()
        .split("\n")
        .map((line, i, lines) => (
          <Fragment key={i}>
            {line.split(SPLIT).map((part, j) =>
              part.startsWith("[[") ? (
                <Mark key={j} kind={mark}>
                  {part.slice(2, -2)}
                </Mark>
              ) : (
                <Fragment key={j}>{part}</Fragment>
              ),
            )}
            {i < lines.length - 1 && <br className="br-wide" />}
          </Fragment>
        ))}
    </p>
  );
}

/*
 * Set in the serif, which until now the hero had to itself.
 *
 * That is where the display face was always headed — it is the one other
 * place on the page where type rather than a picture of the product carries
 * the weight, and the sans at the same size read as one more paragraph at
 * the end of a long scroll, set in the display weight rather than the body
 * one — Helvetica Neue Light for the Latin, Hiragino Sans W3 for the kana.
 * picks these lines up; both are high-contrast old-style faces, so the page
 * still reads as one pairing.
 *
 * Weight stays at 400 and tracking comes back from -0.03em to almost
 * nothing: a serif at display size does not want a sans's negative tracking,
 * and `palt` is what keeps full-width punctuation from leaving holes.
 */
const STYLE = {
  pull: "text-[clamp(1.35rem,2.6vw,1.8rem)] font-light leading-[1.65] tracking-[-0.015em] text-ink [font-feature-settings:'palt'_1]",
  /*
   * Sized for the column it sits in rather than for the full container — it
   * shares the row with the photographs, so roughly 590px at desktop.
   */
  close:
    "text-[clamp(1.5rem,3vw,2.25rem)] font-light leading-[1.5] tracking-[-0.02em] text-ink [font-feature-settings:'palt'_1]",
} as const;

/**
 * The closing argument: two lines and the photographs, side by side.
 *
 * `overflow-x-clip` is what lets the inset break the right edge at lg
 * without adding a horizontal scrollbar on narrow windows.
 */
export function Philosophy() {
  const photos = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /*
   * The inset drifts against the photograph it overhangs, so the pair reads
   * as two photographs at two depths rather than one collaged edge — which
   * is the same job the ring in the ground colour is doing, carried a little
   * further.
   *
   * Measured from a plain wrapper, never from the <Reveal>: that element is
   * animating its own y on arrival, and a scroll window measured against a
   * box mid-flight reads the wrong offsets. Pure scroll → transform, no
   * state per frame, and ±16px is small enough that it never breaks the
   * overlap.
   */
  const { scrollYProgress } = useScroll({
    target: photos,
    offset: ["start end", "end start"],
  });
  const insetY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [16, -16],
  );

  return (
    <Section className="relative overflow-x-clip">
      {/*
        The mobile gap is wider than it looks it needs to be: the inset
        photograph hangs 32px above the main one, so a 48px gap would leave it
        almost touching the closing line above.
      */}
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <SectionTitle>
              声にならないSOSに、
              <br className="br-wide" />
              気づける社会へ。
            </SectionTitle>
          </Reveal>

          {/*
            One <Reveal> per line rather than the dim-to-full pass this had.
            That effect held both lines at 0.32 opacity until they reached
            the upper third of the viewport, and dimmed text is measurable:
            ink at 0.32 over the light ground is 2.13:1 and the accented
            phrase inside it 1.58:1, against the 3:1 AA floor for type this
            size. The floor that would clear it — 0.70, where the phrase only
            just reaches 3.02:1 — is barely a dim at all, so the arrival is
            now an ordinary fade and rise and the rule under the statement is
            what lights as you reach it.
          */}
          <Reveal>
            <Rich text={PULL.text} mark={PULL.mark} className={STYLE.pull} />
          </Reveal>

          <Reveal className="mt-9">
            <Rich text={CLOSE.text} mark={CLOSE.mark} className={STYLE.close} />
          </Reveal>
        </div>

        {/*
          `relative` is what the inset anchors to. The column used to be
          sticky, which it needed when the copy beside it ran five paragraphs
          past the image; with two lines there is nothing left to track.
        */}
        <div ref={photos} className="relative">
          <Reveal className="relative">
            <Image
              src={PHOTO.src}
              alt={PHOTO.alt}
              width={PHOTO.width}
              height={PHOTO.height}
              sizes="(min-width: 1024px) 22rem, 100vw"
              className="h-auto w-full rounded-2xl border border-line shadow-[var(--shadow-card)]"
            />

            {/*
              Overhangs the corner rather than sitting inside it. It stays within
              the column on small screens, where there is no page margin to spill
              into, and only breaks the right edge from lg. The ring in the page
              ground colour is what keeps the two reading as two photographs
              rather than one collaged edge.

              The drift is a motion `y` and the offsets are plain `top`/`right`,
              so nothing here mixes a translate utility with a transform.
            */}
            <motion.div
              style={{ y: insetY, willChange: reduce ? undefined : "transform" }}
              className="absolute -top-8 right-2 w-[46%] overflow-hidden rounded-2xl border border-line ring-4 ring-canvas lg:-right-10 lg:-top-12 lg:w-[58%]"
            >
              <Image
                src={PHOTO_INSET.src}
                alt={PHOTO_INSET.alt}
                width={PHOTO_INSET.width}
                height={PHOTO_INSET.height}
                sizes="(min-width: 1024px) 13rem, 45vw"
                className="h-auto w-full"
              />
            </motion.div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
