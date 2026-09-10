"use client";

import { motion } from "motion/react";
import { VIEWPORT } from "@/lib/motion";
import { Icon } from "@/components/ui";

/**
 * One small screen per step, so 仕組み shows the same thing プロダクト does —
 * what the stage actually looks like — rather than only describing it.
 *
 * These are deliberately reductions, not copies of the product mockups: a
 * single idea each, at a size that reads inside a card. Every figure is
 * sample data and every student is a class-and-number, exactly as the real
 * report is.
 */
const EASE = [0.16, 1, 0.3, 1] as const;

const grow = (width: string, i: number) => ({
  initial: { width: 0 },
  whileInView: { width },
  viewport: VIEWPORT,
  transition: { duration: 0.9, ease: EASE, delay: 0.15 + i * 0.12 },
});

/** 01 — every student, not a self-selecting few. */
export function RosterMock() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-baseline justify-between text-[0.7rem]">
        <span className="text-ink">3年2組</span>
        <span className="tabular-nums text-muted">全40名</span>
      </div>
      <div aria-hidden className="grid flex-1 grid-cols-10 content-center gap-1.5">
        {Array.from({ length: 40 }, (_, i) => (
          <motion.span
            key={i}
            className="aspect-square rounded-[3px] bg-mark-1"
            initial={{ opacity: 0.15 }}
            whileInView={{ opacity: 0.85 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.012 }}
          />
        ))}
      </div>
    </div>
  );
}

/** 02 — the writing surface, mid-sentence. */
export function DiaryMock() {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <p className="text-[0.65rem] tabular-nums text-muted">8月20日（木）</p>
      <p className="text-[0.75rem] font-medium text-ink">今日はどんな一日だった？</p>
      <div className="flex flex-1 flex-col rounded-lg bg-inset/70 p-3">
        <p className="text-[0.7rem] leading-[1.8] text-ink">
          部活がきつくて、最近あんまり眠れてない。
          <motion.span
            aria-hidden
            className="ml-0.5 inline-block h-[0.85em] w-px translate-y-[0.1em] bg-mark-1"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          />
        </p>
        <span className="mt-auto pt-2 text-right text-[0.6rem] tabular-nums text-muted">
          48字
        </span>
      </div>
    </div>
  );
}

/** 03 — one question back, not a conversation. */
export function ProbeMock() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-4">
      <div className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-inset/70 px-3 py-2 text-[0.7rem] leading-relaxed text-muted">
        …たぶん大丈夫。
      </div>
      <motion.div
        className="max-w-[92%] rounded-lg rounded-bl-sm bg-mark-1/10 px-3 py-2.5"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
      >
        <p className="flex items-center gap-1.5 text-[0.6rem] font-medium tracking-[0.06em] text-mark-1">
          <Icon name="auto_awesome" size={11} className="shrink-0" />
          AIからの問いかけ
        </p>
        <p className="mt-1.5 text-[0.7rem] leading-relaxed text-ink">
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
  return (
    <div className="flex h-full flex-col justify-center gap-3.5 p-4">
      {SIGNALS.map((sig, i) => (
        <div key={sig.label}>
          <p className="mb-1.5 text-[0.65rem] text-muted">{sig.label}</p>
          <span className="block h-1.5 overflow-hidden rounded-full bg-inset">
            <motion.span
              className="block h-full rounded-full bg-mark-1"
              {...grow(sig.width, i)}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * 05 — the whole of what a teacher receives.
 *
 * The band this used to show (高/中/低, with a bar whose width encoded a
 * score) is the same claim `educator_display_policy.md` removed from the
 * product on 2026-08-06, and the same one the LP was already corrected for
 * once — see ④ in `lp_claim_alignment.md`. It came back here because this
 * mock lives outside プロダクト and was missed. It now shows what the educator
 * surface actually renders: the matched observation, when, and its basis.
 *
 * Currently unrendered — 仕組み stops at 04 — but kept in step with the
 * policy rather than left as a compliant-looking place to paste a band back
 * into.
 */
const ROWS = [
  { id: "3年2組 #14", observation: "苦痛の表現（危険の明示なし）", at: "8/20 21:47" },
  { id: "3年1組 #08", observation: "離脱を示唆する曖昧な表現", at: "8/19 22:03" },
  { id: "3年3組 #03", observation: "別の画面での開示を引き継ぎ", at: "8/18 20:15" },
];

export function ReportMock() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-medium text-ink">要確認の観測</span>
        <span className="rounded-full bg-inset px-2 py-0.5 text-[0.6rem] font-medium text-muted">
          新しい順
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2.5">
        {ROWS.map((row) => (
          <div key={row.id}>
            <p className="flex items-baseline gap-2 text-[0.62rem] tabular-nums text-muted">
              <span className="text-ink">{row.id}</span>
              <span>{row.at}</span>
            </p>
            <p className="mt-0.5 text-[0.65rem] leading-snug text-ink">
              観測: {row.observation}
            </p>
          </div>
        ))}
      </div>

      <p className="flex items-start gap-1.5 text-[0.6rem] leading-snug text-muted">
        <Icon name="lock" size={11} className="mt-px shrink-0" />
        診断は行いません。日記の本文も共有されません。
      </p>
    </div>
  );
}
