"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Flower } from "@/components/Flower";
import { useLocale } from "@/components/LocaleProvider";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import type { IconName } from "@/lib/icons";

/*
 * The screen's words, in each language. The Japanese is the app's own
 * interface; the English is that interface translated string for string —
 * the same three tabs, the same three openers — and nothing the app does
 * not have. The name is lower-case in the Japanese, as the app writes it,
 * and capitalised in the English, as the rest of the English site has it.
 */
const COPY = {
  ja: {
    /** The three openers the app offers, as they appear in the product. */
    prompts: [
      "今日あったことを話したい",
      "最近ちょっとしんどい",
      "考えを整理したい",
    ],
    greeting: "こんにちは、blescです",
    invitation: "気になっていること、そのまま話してください。",
    placeholder: "blescに話す…",
    disclaimer: "blescは診断や緊急対応を行うものではありません。",
  },
  en: {
    prompts: [
      "I want to talk about today",
      "It’s been a bit hard lately",
      "I want to sort out my thoughts",
    ],
    greeting: "Hello, this is Blesc",
    invitation: "Say what’s on your mind, just as it is.",
    placeholder: "Talk to Blesc…",
    disclaimer: "Blesc does not diagnose or provide emergency response.",
  },
} as const;

const TABS: {
  icon: IconName;
  label: Record<Locale, string>;
  active?: boolean;
}[] = [
  { icon: "home", label: { ja: "今日", en: "Today" } },
  { icon: "edit_note", label: { ja: "日記", en: "Diary" } },
  { icon: "chat_bubble", label: { ja: "相談", en: "Talk" }, active: true },
];

/*
 * Where the English needs its own classes. Whole strings, because Tailwind
 * only generates what it can read. The widths are from this markup laid out
 * in headless Chrome, in Helvetica Neue and in Inter (what Android and
 * Windows fall back to); where two numbers are given they are in that
 * order.
 *
 * The tabs. A two-character Japanese label is 20px wide at this size, and
 * "Today", "Diary" and "Talk" are 27, 23 and 18px (29, 25 and 19): the
 * three are 8–13px longer, and a 360px phone's bar — 266px between its
 * paddings, 84 of them the wordmark's and the menu's — has none to give.
 * 360px is the usual Android width, so that phone is an Inter one. So below
 * md an English tab gives up 4px on each side and 2px of the gap to its
 * icon, which brings the three to 165px (171px) and leaves 8px (5.5px)
 * either side of them there. At 2px a side instead, the Inter row was a
 * pixel longer than the bar: the active tab's tint ran into the menu icon
 * and the icon was squeezed. A few pixels under 360px even this row no
 * longer fits (a 344px screen's bar is 250px, and the row is 255px in
 * Inter), so there the tabs drop their icons rather than run into the
 * menu: the labels are the tabs, and the icons come back at 22.5rem. From
 * md there is room, and the two languages share one setting.
 *
 * The openers. As chips they are 134–159px (140–166px), each inside the
 * 210px a 320px phone leaves; on the narrower phones they sit one to a row
 * where the Japanese sit two and one, and the screen, whose height is its
 * content's there, is a row taller. From md they are meant to be one row,
 * and at md itself the screen is at its narrowest for that setting — 618px
 * across, at 768px — where the Japanese three need 533px and the English
 * three, at the same 20px of padding, 607px (630px): in Inter the third
 * dropped to a second row and the screen was 54px taller for it. So from
 * md to lg an English chip has 16px a side, which is 583px (606px) and one
 * row, and from lg, where the screen is over 870px across, it has the same
 * 20px as the Japanese.
 *
 * The disclaimer is 227px at this size (240px) where the Japanese is 206px,
 * and a 320px phone leaves 226px. text-balance makes that two even lines
 * rather than a line and the word "response."
 *
 * Nothing else needed it. The invitation is 191px (200px) in the 210px a
 * 320px phone leaves.
 */
const TAB = {
  ja: "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.62rem] md:px-3.5 md:text-[0.8rem]",
  en: "flex items-center gap-1 rounded-full px-1.5 py-1.5 text-[0.62rem] md:gap-1.5 md:px-3.5 md:text-[0.8rem]",
} as const;

const TAB_ICON = {
  ja: "shrink-0",
  en: "hidden shrink-0 min-[22.5rem]:block",
} as const;

const CHIP = {
  ja: "rounded-full border border-mark-1/35 px-3 py-1.5 text-[0.62rem] text-muted md:px-5 md:py-2.5 md:text-[0.8rem]",
  en: "rounded-full border border-mark-1/35 px-3 py-1.5 text-[0.62rem] text-muted md:px-4 md:py-2.5 md:text-[0.8rem] lg:px-5",
} as const;

const DISCLAIMER = {
  ja: "mt-2.5 text-center text-[0.55rem] text-muted md:mt-4 md:text-[0.72rem]",
  en: "mt-2.5 text-center text-balance text-[0.55rem] text-muted md:mt-4 md:text-[0.72rem]",
} as const;

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
 * Everything here is the app's own interface and its own words — in
 * Japanese as the app has them, and on the English pages translated (see
 * COPY). It is decorative for assistive tech — the surrounding copy carries
 * every claim — so the whole screen is aria-hidden and nothing in it is
 * focusable.
 *
 * The language is the hero's, handed down as `locale`, so the screen can
 * never be in one language under a headline in the other; rendered on its
 * own it asks useLocale(), like any client component.
 *
 * The microphone starts listening when the screen scrolls into view, which
 * is the one moment the reader is looking at it, and stops when it leaves so
 * an off-screen loop is not burning frames.
 */
export function AppMock({ locale: fromHero }: { locale?: Locale }) {
  const fromLayout = useLocale();
  const locale = fromHero ?? fromLayout;
  const t = COPY[locale];

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
              key={tab.icon}
              className={`${TAB[locale]} ${
                tab.active
                  ? "bg-accent/15 font-medium text-mark-1"
                  : "text-muted"
              }`}
            >
              <Icon name={tab.icon} size={14} className={TAB_ICON[locale]} />
              {tab.label[locale]}
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
          {t.greeting}
        </p>
        <p className="mt-1.5 text-[0.72rem] text-muted md:mt-2.5 md:text-[0.95rem]">
          {t.invitation}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:mt-7 md:gap-3">
          {t.prompts.map((prompt) => (
            <span key={prompt} className={CHIP[locale]}>
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
                {t.placeholder}
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

          <p className={DISCLAIMER[locale]}>{t.disclaimer}</p>
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
