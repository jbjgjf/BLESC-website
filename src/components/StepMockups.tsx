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

/** 05 — the whole of what a teacher receives. */
const ROWS = [
  { id: "3年2組 #14", level: "高", width: "88%", bar: "bg-risk-high", text: "text-risk-high" },
  { id: "3年1組 #08", level: "中", width: "62%", bar: "bg-risk-mid", text: "text-risk-mid" },
  { id: "3年3組 #03", level: "低", width: "24%", bar: "bg-risk-low", text: "text-risk-low" },
];

export function ReportMock() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-medium text-ink">今月のリスクレポート</span>
        <span className="rounded-full bg-risk-high/15 px-2 py-0.5 text-[0.6rem] font-medium text-risk-high">
          3件の要対応
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2.5">
        {ROWS.map((row, i) => (
          <div key={row.id} className="flex items-center gap-3">
            <span className="w-[4.5rem] shrink-0 text-[0.62rem] tabular-nums text-muted">
              {row.id}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset">
              <motion.span
                className={`block h-full rounded-full ${row.bar}`}
                {...grow(row.width, i)}
              />
            </span>
            <span className={`w-3 shrink-0 text-right text-[0.65rem] font-medium ${row.text}`}>
              {row.level}
            </span>
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-[0.6rem] text-muted">
        <Icon name="lock" size={11} className="shrink-0" />
        日記の本文は共有されません
      </p>
    </div>
  );
}
