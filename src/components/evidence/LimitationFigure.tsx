"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";

/**
 * One small figure per structural limitation.
 *
 * 構造的な限界 was three photographs with a title and a sentence each, and the
 * three rows were identical in shape — so the section read as "three reasons"
 * without ever showing what made each reason different. These figures are that
 * difference, drawn. Each one is the mechanism its own sentence describes and
 * nothing else: a survey that only offers two answers, a student whose links to
 * the group come apart, forty students and one teacher's attention.
 *
 * Deliberately three different kinds of drawing rather than one template. The
 * rows are making different kinds of argument — about a form, about a dynamic,
 * about arithmetic — and a single house diagram stamped three times would put
 * them back where they started. What holds them together is weight: one size,
 * the same faint neutral marks, the same single accent, the same hairline.
 *
 * Every one is aria-hidden. The heading and the sentence beside them carry the
 * whole claim, and the only words inside a figure — はい and いいえ — are lifted
 * from the sentence they sit under.
 *
 * Each has exactly one beat, held back half a second so it plays as the row
 * settles rather than during its reveal, and each beat is the sentence's verb:
 * the answer being chosen, the links letting go, the attention landing. Under
 * reduced motion the ranges collapse so motion still owns the transform and
 * writes the finished state — the selection already made, the student already
 * apart, the ring already down.
 */

/** After the row's own 0.7s reveal has mostly resolved. */
const BEAT = 0.5;

const settle = (delay = BEAT) => ({ duration: 0.6, ease: EXPO_OUT, delay });

/*
 * Neutral marks: a faint field the one accent is read against. The link width
 * is appended per use rather than defaulted here — two w-* utilities in one
 * class string resolve by stylesheet order, not by the order they are written.
 */
const DOT = "size-2.5 shrink-0 rounded-full bg-ink/25";
const LINK = "h-px shrink-0 bg-ink/20";

/* -------------------------------------------------------------------------- */
/* 01 — アンケートでは本音が表れない                                            */
/* -------------------------------------------------------------------------- */

const CHOICE = "px-5 py-1.5 text-center text-[0.8rem] font-medium whitespace-nowrap";

/**
 * The survey itself: a two-answer control with the answer already given.
 *
 * The fill starts on いいえ and travels to はい, because that is the sentence —
 * the student does not fail to answer, they move off their answer and onto the
 * one that will not cause trouble. A figure of a control sitting already-set on
 * はい would only say that a survey has two buttons.
 *
 * The chosen label is a second copy of the whole answer row, clipped inside the
 * travelling fill and sliding the opposite way by half its own width, so the
 * two copies stay registered to the pixel and the label under the fill is the
 * only one that changes colour. text-canvas, not text-ink: mark-1 is a mid blue
 * in both themes and its label has to be the page ground to clear AA (5.44:1
 * light, 10.09:1 dark).
 */
function BinaryAnswer({ reduce }: { reduce: boolean }) {
  const fill: Variants = {
    rest: { x: reduce ? "0%" : "100%" },
    beat: { x: "0%", transition: settle() },
  };
  const label: Variants = {
    rest: { x: reduce ? "0%" : "-50%" },
    beat: { x: "0%", transition: settle() },
  };

  return (
    <div className="relative inline-flex rounded-full border border-line bg-inset p-1">
      <div className="grid grid-cols-2">
        <span className={`${CHOICE} text-muted`}>はい</span>
        <span className={`${CHOICE} text-muted`}>いいえ</span>
      </div>

      <motion.div
        className="absolute inset-y-1 left-1 w-[calc(50%_-_0.25rem)] overflow-hidden rounded-full bg-mark-1"
        variants={fill}
      >
        <motion.div className="grid w-[200%] grid-cols-2" variants={label}>
          <span className={`${CHOICE} text-canvas`}>はい</span>
          <span className={`${CHOICE} text-canvas`}>いいえ</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 02 — 深刻なケースほど見えなくなる                                            */
/* -------------------------------------------------------------------------- */

/**
 * A chain of students, and the one at the end letting go of it.
 *
 * The accent is the student the sentence is about, so the drawing puts the
 * colour on the one mark that is leaving. The link retracts towards the group
 * rather than simply fading: it is the connection being withdrawn, and a line
 * that shortens from the far end reads as that where a dissolve reads as a
 * rendering glitch.
 */
function Isolating({ reduce }: { reduce: boolean }) {
  const link: Variants = {
    rest: { scaleX: reduce ? 0.1 : 1, opacity: reduce ? 0 : 1 },
    beat: { scaleX: 0.1, opacity: 0, transition: settle() },
  };
  const away: Variants = {
    rest: { x: reduce ? 16 : 0 },
    beat: { x: 16, transition: settle() },
  };

  return (
    <div className="flex items-center">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && <span className={`${LINK} w-4`} />}
          <span className={DOT} />
        </span>
      ))}

      <motion.span className={`${LINK} w-5 origin-left`} variants={link} />
      <motion.span
        className="size-2.5 shrink-0 rounded-full bg-mark-1"
        variants={away}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 03 — 教員のリソースには限界がある                                            */
/* -------------------------------------------------------------------------- */

/**
 * Forty marks — the number is the sentence's own — and one ring.
 *
 * The ring is where the attention is, and it can only be in one place, which
 * is the entire argument of the row. It lands rather than fades in: coming down
 * from 1.7 scale it reads as attention arriving on one student, and the other
 * thirty-nine are visibly not where it went.
 */
const CLASS_SIZE = 40;
const ATTENDED = 15;

function Attention({ reduce }: { reduce: boolean }) {
  const ring: Variants = {
    rest: { scale: reduce ? 1 : 1.7, opacity: reduce ? 1 : 0 },
    beat: { scale: 1, opacity: 1, transition: settle() },
  };

  return (
    <div className="grid w-fit grid-cols-10 gap-2">
      {Array.from({ length: CLASS_SIZE }, (_, i) =>
        i === ATTENDED ? (
          <span key={i} className="relative size-1.5 rounded-full bg-mark-1">
            {/* Centring lives on this wrapper so the ring's own transform is
                the beat and nothing else. */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.span
                className="block size-[1.125rem] rounded-full border border-mark-1"
                variants={ring}
              />
            </span>
          </span>
        ) : (
          <span key={i} className="size-1.5 rounded-full bg-ink/25" />
        ),
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export type FigureKind = "binary" | "isolating" | "attention";

export function LimitationFigure({ kind }: { kind: FigureKind }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      aria-hidden
      className="mt-8 flex h-12 items-center"
      initial="rest"
      whileInView="beat"
      viewport={VIEWPORT}
      variants={{ rest: {}, beat: {} }}
    >
      {kind === "binary" && <BinaryAnswer reduce={reduce} />}
      {kind === "isolating" && <Isolating reduce={reduce} />}
      {kind === "attention" && <Attention reduce={reduce} />}
    </motion.div>
  );
}
