"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Flower } from "@/components/Flower";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/ui";
import type { IconName } from "@/lib/icons";

/** The three openers the app offers, as they appear in the product. */
const PROMPTS = [
  "今日あったことを話したい",
  "最近ちょっとしんどい",
  "考えを整理したい",
];

const TABS: { icon: IconName; label: string; active?: boolean }[] = [
  { icon: "home", label: "今日" },
  { icon: "edit_note", label: "日記" },
  { icon: "chat_bubble", label: "相談", active: true },
];

/**
 * Bar heights for the waveform, as fractions of the track.
 *
 * Written out rather than generated so the shape is stable between renders
 * and between server and client — a random walk would hydrate differently
 * every time, and the eye reads the repeat as a voice either way.
 */
const BARS = [
  0.35, 0.62, 0.95, 0.5, 0.78, 1, 0.55, 0.84, 0.42, 0.7, 0.98, 0.48, 0.74, 0.38,
];

/**
 * The product, as a picture of itself.
 *
 * Everything here is the app's own interface and its own words. It is
 * decorative for assistive tech — the surrounding copy carries every claim —
 * so the whole screen is aria-hidden and nothing in it is focusable.
 *
 * The microphone starts listening when the screen scrolls into view, which
 * is the one moment the reader is looking at it, and stops when it leaves so
 * an off-screen loop is not burning frames.
 */
export function AppMock() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.45 });
  const listening = inView && !reduce;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none flex aspect-[16/11] w-full flex-col bg-canvas select-none"
    >
      {/* Chrome */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3 md:px-6 md:py-4">
        <Logo className="h-4 w-auto md:h-5" />

        <div className="flex items-center gap-1 md:gap-2">
          {TABS.map((tab) => (
            <span
              key={tab.label}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.62rem] md:px-3.5 md:text-[0.8rem] ${
                tab.active
                  ? "bg-accent/15 font-medium text-mark-1"
                  : "text-muted"
              }`}
            >
              <Icon name={tab.icon} size={14} className="shrink-0" />
              {tab.label}
            </span>
          ))}
        </div>

        <Icon name="menu" size={18} className="text-muted" />
      </div>

      {/* The greeting */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/*
          A slow rise and fall, a few pixels either way. Anything more on a
          mark this size reads as a bouncing logo rather than as breathing.
        */}
        <motion.div
          animate={reduce ? undefined : { y: [0, -7, 0] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Flower size={54} className="text-accent md:hidden" />
          <Flower size={72} className="hidden text-accent md:block" />
        </motion.div>

        <p className="mt-5 text-[0.95rem] font-semibold tracking-[-0.01em] text-ink md:mt-7 md:text-[1.3rem]">
          こんにちは、blescです
        </p>
        <p className="mt-1.5 text-[0.72rem] text-muted md:mt-2.5 md:text-[0.95rem]">
          気になっていること、そのまま話してください。
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:mt-7 md:gap-3">
          {PROMPTS.map((prompt) => (
            <span
              key={prompt}
              className="rounded-full border border-mark-1/35 px-3 py-1.5 text-[0.62rem] text-muted md:px-5 md:py-2.5 md:text-[0.8rem]"
            >
              {prompt}
            </span>
          ))}
        </div>
      </div>

      {/* The sky the composer sits in, exactly as the app draws it. */}
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[11rem] bg-[linear-gradient(180deg,transparent_0%,color-mix(in_srgb,var(--color-primary)_16%,transparent)_62%,color-mix(in_srgb,var(--color-primary)_30%,transparent)_100%)]"
        />

        <div className="relative px-4 pb-3 pt-8 md:px-10 md:pb-5 md:pt-14">
          <div className="mx-auto flex w-full max-w-[34rem] items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-4 pr-1.5 shadow-[0_8px_24px_-16px_rgba(11,13,18,0.4)] md:gap-3 md:py-2.5 md:pl-6 md:pr-2.5">
            {listening ? (
              <Waveform />
            ) : (
              <span className="flex-1 truncate text-[0.7rem] text-muted md:text-[0.9rem]">
                blescに話す…
              </span>
            )}

            {/* The microphone, mid-recording. */}
            <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full md:size-9">
              {listening && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-mark-1/35"
                  animate={{ scale: [1, 1.75], opacity: [0.5, 0] }}
                  transition={{
                    duration: 1.9,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
              <span
                className={`relative flex size-full items-center justify-center rounded-full border transition-colors duration-500 ${
                  listening
                    ? "border-transparent bg-accent text-on-accent"
                    : "border-line text-muted"
                }`}
              >
                <Icon name="mic" size={14} className="shrink-0" />
              </span>
            </span>

            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-mark-1 md:size-9">
              <Icon name="send" size={14} className="shrink-0" />
            </span>
          </div>

          <p className="mt-2.5 text-center text-[0.55rem] text-muted md:mt-4 md:text-[0.72rem]">
            blescは診断や緊急対応を行うものではありません。
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The voice, drawn as it is being spoken.
 *
 * scaleY on a fixed-height bar rather than an animated height: height costs
 * layout on every frame, scale is composited. The mirrored repeat is what
 * keeps a bar from snapping back to its floor between cycles.
 */
function Waveform() {
  return (
    <span className="flex flex-1 items-center gap-[3px] md:gap-[5px]">
      {BARS.map((peak, i) => (
        <motion.span
          key={i}
          className="h-3 w-[2px] origin-center rounded-full bg-mark-1 md:h-5 md:w-[3px]"
          initial={{ scaleY: 0.25 }}
          animate={{ scaleY: [0.25, peak, 0.3] }}
          transition={{
            duration: 0.75 + (i % 4) * 0.12,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: i * 0.055,
          }}
        />
      ))}
    </span>
  );
}
