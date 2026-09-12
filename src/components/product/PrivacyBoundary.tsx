"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Icon } from "@/components/ui";

/**
 * The privacy boundary, drawn.
 *
 * 「教員に届くのは要点のみで、日記の本文が共有されることはありません」 is the
 * strongest claim the product makes and the section used to assert it in a
 * sentence and then show two screens that happen not to contradict it. A
 * reader has to hold both panels in their head and notice an absence to
 * believe it, and absences are exactly what nobody notices.
 *
 * So the claim gets its own figure, sitting between the two screens it is
 * about: the entry on one side, what the teacher receives on the other, and
 * a wall between them that the writing visibly does not cross. The entry's
 * text fades out before it reaches the wall (a mask, not an animation — it
 * is true at rest too), and the only thing on the far side is the one row
 * from the report above, which carries a class, a roll number and a level
 * and no words at all.
 *
 * Two scroll-linked beats, because the mechanism is a sequence:
 *   1. a hairline scans across the entry — the model reading it — and dies
 *      at the wall, which brightens as it arrives;
 *   2. beyond the wall, the report row resolves: the bar measures out and
 *      the level appears.
 *
 * Both are motion values off one `useScroll`; nothing per frame touches
 * React state, and the bar is a scaleX rather than a width so no frame
 * triggers layout. Under `prefers-reduced-motion` the figure renders its
 * end state — wall lit, bar measured, level printed — and the scanner,
 * whose end state is "merged into the wall", is simply not drawn.
 *
 * Sample data is passed in from the section rather than restated here: the
 * body is the same entry the student screen shows and the row is the top
 * row of the teacher's report, so the figure cannot drift away from the
 * screens it sits between.
 */
export function PrivacyBoundary({
  body,
  klass,
  no,
  level,
  width,
}: {
  /** The student's entry, verbatim from the screen above. */
  body: string;
  klass: string;
  no: string;
  level: string;
  /** The row's bar length as a percentage string, e.g. "88%". */
  width: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.45"],
  });

  /* Beat 1 — the read. Travels the full width of the entry card and fades
     out over the last stretch, so it reads as absorbed by the wall rather
     than as stopping short of it. */
  const scanX = useTransform(scrollYProgress, [0, 0.5], ["-1%", "100%"], {
    clamp: true,
  });
  const scanOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.4, 0.5],
    [0, 1, 1, 0],
  );

  /* The wall is always drawn; what the scan arrives at is its glow. */
  const wallGlow = useTransform(scrollYProgress, [0.3, 0.55], [0, 1], {
    clamp: true,
  });

  /* Beat 2 — what crosses. scaleX on a full-width bar: the same measurement
     as a width animation, without a layout pass per frame. */
  const barScale = useTransform(
    scrollYProgress,
    [0.5, 0.95],
    [0, parseFloat(width) / 100],
    { clamp: true },
  );
  const levelOpacity = useTransform(scrollYProgress, [0.72, 0.92], [0, 1], {
    clamp: true,
  });

  const finalScale = parseFloat(width) / 100;

  return (
    <figure ref={ref}>
      {/*
        A diagram, not a screen — so it sits on the inset plane with the two
        objects it compares raised on it, where the product panels are
        themselves the raised surface. That division is what stops this
        reading as a third screenshot.
      */}
      <div
        aria-hidden
        className="grid items-stretch gap-4 rounded-[1.25rem] border border-line bg-inset p-4 md:grid-cols-[1fr_auto_1fr] md:gap-6 md:p-7"
      >
        {/* The entry. overflow-hidden so the scanner is clipped by the
            card's own corners. */}
        <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-4 md:p-5">
          <p className="text-[0.72rem] font-medium tracking-[0.04em] text-muted">
            日記の本文
          </p>

          {/*
            The mask is the whole argument at rest: the writing thins out
            and is gone well before the edge nearest the wall. It is static
            CSS, so it is true in a screenshot, in print and under reduced
            motion — the animation only times it.
          */}
          <p className="mt-2.5 text-[0.9rem] leading-[1.9] text-ink [mask-image:linear-gradient(to_right,black_0%,black_58%,transparent_92%)]">
            {body}
          </p>

          {!reduce && (
            <motion.div
              className="pointer-events-none absolute inset-y-0 left-0 w-full"
              style={{ x: scanX, opacity: scanOpacity }}
            >
              <span className="absolute inset-y-0 left-0 w-px bg-mark-1" />
            </motion.div>
          )}
        </div>

        {/*
          The wall. A hairline across the band on a phone and down it on a
          wide screen, with the lock sitting on the crossing. mark-1 and not
          border-line-strong: this line has to be seen to be believed, and
          line-strong measures 2.37:1 on the inset plane in the dark build,
          under the 3:1 a meaningful non-text mark needs. mark-1 holds
          7.59:1 dark and 5.07:1 light.
        */}
        <div className="relative flex items-center justify-center py-1 md:w-8 md:py-0">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-mark-1 md:inset-x-auto md:inset-y-0 md:left-1/2 md:top-auto md:h-auto md:w-px md:-translate-x-1/2 md:translate-y-0" />
          {/* The glow is a gradient rather than a blurred block — a filter
              on a full-height element is the one thing here that would cost
              anything, and a three-stop fade is the same picture. Its
              direction is perpendicular to the line, so it flips with the
              layout. */}
          <motion.span
            className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 bg-linear-to-b from-transparent via-mark-1/25 to-transparent md:inset-x-auto md:inset-y-0 md:left-1/2 md:top-auto md:h-auto md:w-4 md:-translate-x-1/2 md:translate-y-0 md:bg-linear-to-r"
            style={{ opacity: reduce ? 1 : wallGlow }}
          />
          <span className="relative rounded-full border border-line bg-surface p-1.5 text-muted">
            <Icon name="lock" size={15} className="block" />
          </span>
        </div>

        {/* What the teacher receives: one row, no words. */}
        <div className="flex flex-col rounded-xl border border-line bg-surface p-4 md:p-5">
          <p className="text-[0.72rem] font-medium tracking-[0.04em] text-muted">
            教員に届く要点
          </p>

          {/* flex-1: the entry beside it is three lines tall and this is one
              row, so the row sits in the middle of the height the grid
              stretches this card to rather than leaving a hole under it. */}
          <div className="mt-3.5 flex flex-1 items-center gap-3">
            <span className="shrink-0 text-[0.8rem] tabular-nums text-muted">
              {klass} <span className="text-ink">{no}</span>
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-inset">
              <motion.span
                className="block h-full w-full origin-left rounded-full bg-risk-high"
                style={{ scaleX: reduce ? finalScale : barScale }}
              />
            </span>
            {/*
              risk-high-text, not risk-high: the fill colour reads 4.83:1 on
              this card in the light build, which is over AA but with nothing
              to spare at 0.8rem — the text variant holds 6.47:1 light and
              6.50:1 dark.
            */}
            <motion.span
              className="w-4 shrink-0 text-right text-[0.8rem] font-medium text-risk-high-text"
              style={{ opacity: reduce ? 1 : levelOpacity }}
            >
              {level}
            </motion.span>
          </div>
        </div>
      </div>

      {/*
        The figure is aria-hidden, so every fact in it is written out here.
        Both halves of the claim already exist in the copy; what the caption
        adds is the list of fields the report mockup is actually made of.
      */}
      <figcaption className="mt-5 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
        届くのは要点のみ。クラスと出席番号、リスクの高低だけで、日記の本文は共有されません。
      </figcaption>
    </figure>
  );
}
