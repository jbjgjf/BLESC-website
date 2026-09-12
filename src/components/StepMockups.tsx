"use client";

import { motion, useReducedMotion } from "motion/react";
import { EXPO_OUT, VIEWPORT } from "@/lib/motion";
import { Icon } from "@/components/ui";

/**
 * One screen per step of 仕組み, so the section shows what each stage looks
 * like rather than only describing it.
 *
 * These were drawn for an 11rem well inside a card and are now the large
 * half of a two-column block, so every size is up a step and each one lays
 * itself out across the width rather than down a narrow column. They are
 * still reductions rather than copies of the プロダクト screens — one idea
 * each — and every student is a class-and-number, exactly as the real report
 * is.
 *
 * Each lives inside an aria-hidden <Panel>, so the claim a screen
 * illustrates is written out in the copy beside it.
 */

/**
 * Bars and blocks that draw themselves in when the panel arrives.
 *
 * The reduced-motion path starts at the final width instead of animating to
 * it — a bar whose length *is* the datum cannot simply be faded in, because
 * a zero-width bar is a different reading, not a quieter one.
 */
const grow = (width: string, i: number, reduce: boolean) => ({
  initial: { width: reduce ? width : 0 },
  whileInView: { width },
  viewport: VIEWPORT,
  transition: reduce
    ? { duration: 0 }
    : { duration: 0.9, ease: EXPO_OUT, delay: 0.15 + i * 0.12 },
});

/** 01 — every student, not a self-selecting few. */
export function RosterMock() {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-full items-center gap-6 p-6 md:gap-10 md:p-8">
      <div className="shrink-0">
        <p className="text-[0.8rem] text-muted">3年2組</p>
        <p className="mt-1 text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium tracking-[-0.02em] tabular-nums text-ink">
          全40名
        </p>
      </div>

      {/*
        Forty cells, one per student, filling in together: the point of the
        step is that the class is the unit, so the block has to read as whole
        rather than as a sample.
      */}
      <div className="grid flex-1 grid-cols-10 gap-1.5 md:gap-2">
        {Array.from({ length: 40 }, (_, i) => (
          <motion.span
            key={i}
            className="aspect-square rounded-[4px] bg-mark-1"
            initial={{ opacity: reduce ? 0.85 : 0.15 }}
            whileInView={{ opacity: 0.85 }}
            viewport={VIEWPORT}
            transition={
              reduce ? { duration: 0 } : { duration: 0.4, ease: EXPO_OUT, delay: i * 0.012 }
            }
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 02 — the writing surface, mid-sentence. The count is derived from what is
 * actually typed, so the two can never drift apart.
 */
const TYPED = "部活がきつくて、最近あんまり眠れてない。";

export function DiaryMock() {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-full flex-col gap-3 p-6 md:p-8">
      <p className="text-[0.78rem] tabular-nums text-muted">8月20日（木）</p>
      <p className="text-[0.95rem] font-medium tracking-[-0.01em] text-ink">
        今日はどんな一日だった？
      </p>

      <div className="flex flex-1 flex-col rounded-xl bg-inset p-4 md:p-5">
        <p className="text-[0.9rem] leading-[1.9] text-ink">
          {TYPED}
          {/*
            The caret is the one looping animation in these panels, and it is
            what says the entry is being written rather than already filed.
            Under prefers-reduced-motion it stays put instead of blinking —
            the cue survives, the repetition does not.
          */}
          {reduce ? (
            <span className="ml-0.5 inline-block h-[0.9em] w-px translate-y-[0.1em] bg-mark-1" />
          ) : (
            <motion.span
              className="ml-0.5 inline-block h-[0.9em] w-px translate-y-[0.1em] bg-mark-1"
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                times: [0, 0.5, 0.5, 1],
              }}
            />
          )}
        </p>
        <span className="mt-auto pt-3 text-right text-[0.72rem] tabular-nums text-muted">
          {[...TYPED].length}字
        </span>
      </div>
    </div>
  );
}

/** 03 — one question back, not a conversation. */
export function ProbeMock() {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6 md:p-8">
      <div className="ml-auto max-w-[70%] rounded-xl rounded-br-sm bg-inset px-4 py-3 text-[0.9rem] leading-relaxed text-muted">
        …たぶん大丈夫。
      </div>

      <motion.div
        className="max-w-[82%] rounded-xl rounded-bl-sm bg-accent/10 px-4 py-3.5"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{
          duration: reduce ? 0.3 : 0.6,
          ease: reduce ? "linear" : EXPO_OUT,
          delay: reduce ? 0 : 0.35,
        }}
      >
        <p className="flex items-center gap-1.5 text-[0.72rem] font-medium tracking-[0.06em] text-mark-1">
          <Icon name="auto_awesome" size={13} className="shrink-0" />
          AIからの問いかけ
        </p>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-ink">
          「あんまり眠れてない」のは、いつごろから？
        </p>
      </motion.div>
    </div>
  );
}

/** 04 — the signals the model actually weighs. */
const SIGNALS = [
  { label: "言葉のニュアンス", width: "78%" },
  { label: "書きためらいの間", width: "54%" },
  { label: "日々の書きぶりの変化", width: "88%" },
];

export function SignalMock() {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-full flex-col justify-center gap-6 p-6 md:gap-7 md:p-8">
      {SIGNALS.map((sig, i) => (
        <div key={sig.label} className="flex items-center gap-5">
          <p className="w-[9.5rem] shrink-0 text-[0.8rem] text-muted">
            {sig.label}
          </p>
          <span className="block h-2 flex-1 overflow-hidden rounded-full bg-inset">
            <motion.span
              className="block h-full rounded-full bg-mark-1"
              {...grow(sig.width, i, !!reduce)}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/** The whole of what a teacher receives, at step scale. */
const ROWS = [
  { id: "3年2組 #14", level: "高", width: "88%", bar: "bg-risk-high", text: "text-risk-high" },
  { id: "3年1組 #08", level: "中", width: "62%", bar: "bg-risk-mid", text: "text-risk-mid" },
  { id: "3年3組 #03", level: "低", width: "24%", bar: "bg-risk-low", text: "text-risk-low" },
];

export function ReportMock() {
  const reduce = useReducedMotion();

  return (
    <div className="flex h-full flex-col gap-4 p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.9rem] font-medium text-ink">
          今月のリスクレポート
        </span>
        {/*
          text-risk-high-text, not text-risk-high: the fill colour over its
          own 15% tint measures 3.81:1 in light mode, under AA for a label
          this small.
        */}
        <span className="shrink-0 rounded-full bg-risk-high/15 px-2.5 py-1 text-[0.72rem] font-medium text-risk-high-text">
          3件の要対応
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {ROWS.map((row, i) => (
          <div key={row.id} className="flex items-center gap-4">
            <span className="w-[5.5rem] shrink-0 text-[0.78rem] tabular-nums text-muted">
              {row.id}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-inset">
              <motion.span
                className={`block h-full rounded-full ${row.bar}`}
                {...grow(row.width, i, !!reduce)}
              />
            </span>
            <span
              className={`w-4 shrink-0 text-right text-[0.8rem] font-medium ${row.text}`}
            >
              {row.level}
            </span>
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-[0.72rem] text-muted">
        <Icon name="lock" size={13} className="shrink-0" />
        日記の本文は共有されません
      </p>
    </div>
  );
}
