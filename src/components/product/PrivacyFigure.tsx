"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Logo } from "@/components/Logo";
import { Chip, Composer, Frame, Screen } from "@/components/mock";
import { Icon } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import {
  BASIS,
  ENTRY,
  ENTRY_COUNT,
  OBSERVATION_LABEL,
  REPORT_SORT,
  REPORT_TITLE,
  ROWS,
  SCREEN_WORDS,
  STUDENT_BAR,
  TEACHER_BAR,
} from "@/lib/sample";

/*
 * The two places English is laid out differently from Japanese. Both are
 * whole class strings picked by locale — Tailwind only generates classes it
 * can read.
 */

/**
 * The band's height from 768px, where the two windows sit side by side and
 * take their height from it.
 *
 * Japanese is 27rem, and 29rem from 1024px. English is 29rem from 768px.
 * At 768px each window is 288px wide, and there the English observations
 * run to two lines apiece, and the longest to three, where the Japanese
 * run to one and two. The teacher's rows are centred in what the window
 * has left, so rows that do not fit do not push the window taller — they
 * run out of it at both ends, up into the title bar. 27rem holds six lines
 * of observation and English can need seven; the extra 2rem holds them.
 * From 1024px the windows are wide enough that both languages fit in the
 * same 29rem.
 *
 * Below 768px the windows are stacked and as tall as what they hold, in
 * either language.
 */
const BAND: Record<Locale, string> = {
  ja: "md:h-[27rem] lg:h-[29rem]",
  en: "md:h-[29rem]",
};

/**
 * The entry on the writing surface: the same size in both languages, with
 * the looser leading kana and kanji need kept for Japanese. See ENTRY_TEXT
 * in StepMockups, which is this window's twin in 仕組み.
 */
const ENTRY_TEXT: Record<Locale, string> = {
  ja: "text-[0.78rem] leading-[1.85] text-ink lg:text-[0.85rem]",
  en: "text-[0.78rem] leading-[1.65] text-ink lg:text-[0.85rem]",
};

/**
 * The privacy boundary, as one figure.
 *
 * 教員に届くのは、観測と根拠だけ。is the strongest claim the product makes, and the
 * section used to assert it in a sentence and then show two screens, drawn
 * in a second style, that happened not to contradict it. A reader had to
 * hold both in their head and notice an absence — and absences are exactly
 * what nobody notices.
 *
 * So the claim is drawn once, at rest: the student's window on the left with
 * words in it, the teacher's window on the right with none, and a lit line
 * between them that the writing visibly does not cross. Both windows are the
 * same <Screen> the four 仕組み steps are drawn in, so this reads as two
 * views of the one product rather than as a diagram about it.
 *
 * Four scroll-linked beats, because the mechanism is a sequence:
 *   1. a hairline scans across the entry — the model reading it — and fades
 *      out as it reaches the wall;
 *   2. the wall brightens as the scan arrives;
 *   3. beyond it, the entry's row arrives in the teacher's list, sliding in
 *      from the wall's side;
 *   4. and its observation is printed.
 *
 * What crosses is an observation — a category of expression, a time, a
 * surface and its basis — never a level or a score for the student: the
 * product draws no bands (docs/claims.md §2), so neither does its picture.
 *
 * All four are motion values off one `useScroll`; nothing per frame touches
 * React state, and nothing animates a size — the row arrives on opacity and
 * a translate. Under `prefers-reduced-motion` the figure renders its end
 * state — wall lit, row in place, observation printed — and the scanner,
 * whose end state is "gone into the wall", stays at opacity 0. The flag is
 * usePrefersReducedMotion, not motion's hook: it picks the style values, so
 * it has to read "not reduced" on the server and through hydration, which
 * this one does before switching to the end state on the render after.
 *
 * Not wrapped in a <Reveal>, and with no entrance of its own: the beats are
 * measured against this element's position, and an ancestor still animating
 * a translate would be measured mid-flight.
 *
 * Every string is sample data from @/lib/sample or a word the interface
 * itself says, in the page's language: the figure and its two windows ask
 * useLocale() and pick with it. Students are a class and a roll number.
 */
export function PrivacyFigure({ children }: { children: ReactNode }) {
  const reduce = usePrefersReducedMotion();
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  /* Beat 1 — the read. The scanner is parked just past the surface's right
     edge (`left-full`, clipped by the surface) and travels its own width
     back and across, so the line runs from −1% to 100% of the surface and
     fades out over the last stretch — absorbed by the wall rather than
     stopping short of it. Parking it off the edge is what makes its rest
     state honest without JavaScript: the layout's <noscript> rule resets
     every inline transform, and an unmoved scanner is then a line in the
     clipped margin rather than a stray accent down the left of the entry. */
  const scanX = useTransform(scrollYProgress, [0, 0.5], ["-101%", "0%"], {
    clamp: true,
  });
  const scanOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.4, 0.5],
    [0, 1, 1, 0],
    { clamp: true },
  );

  /* Beat 2 — the wall is always drawn; what the scan arrives at is its glow. */
  const wallGlow = useTransform(scrollYProgress, [0.3, 0.55], [0, 1], {
    clamp: true,
  });

  /* Beats 3 and 4 — what crosses. The row slides in from the wall's side,
     then the observation line resolves. A translate and an opacity only. */
  const rowIn = useTransform(scrollYProgress, [0.5, 0.8], [0, 1], {
    clamp: true,
  });
  const rowX = useTransform(rowIn, [0, 1], [-14, 0]);
  const observationOpacity = useTransform(
    scrollYProgress,
    [0.72, 0.92],
    [0, 1],
    { clamp: true },
  );

  return (
    <figure ref={ref}>
      {/*
        One column on a phone, where the wall runs across the band; three
        from 768px, where it runs down it. h-full so both windows take the
        Frame's height at md+ and the grid row stretches the wall to match.
      */}
      <Frame tint={1} className={BAND[locale]}>
        <div className="grid h-full w-full gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <DiaryScreen scanX={scanX} scanOpacity={reduce ? 0 : scanOpacity} />
          <Wall glow={reduce ? 1 : wallGlow} />
          <ReportScreen
            rowOpacity={reduce ? 1 : rowIn}
            rowX={reduce ? 0 : rowX}
            observationOpacity={reduce ? 1 : observationOpacity}
          />
        </div>
      </Frame>

      {/*
        The Frame is aria-hidden, so every fact in it lives here as real text.
        The caller passes the <Caption> in its own <Reveal>; only the caption
        animates in, never the figure the beats are measured against.
      */}
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* The student's window                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The diary, a moment after the question came back.
 *
 * The same window as the 仕組み diary — same prompt, same writing surface,
 * same foot — with the AI's one question under the entry, drawn exactly as
 * the probe screen draws it. Static: this is the side with words on it, and
 * the only thing that moves here is the scanner reading them.
 *
 * The scanner sits inside the writing surface so its corners clip it. It is
 * always in the tree, and reduced motion is expressed as a value — opacity
 * 0 — rather than by leaving the node out. The setting only has its real
 * value after hydration, so a node that existed for one answer and not the
 * other would be mounted or torn down on that first re-render; a value is
 * simply written over.
 */
function DiaryScreen({
  scanX,
  scanOpacity,
}: {
  scanX: MotionValue<string>;
  scanOpacity: MotionValue<number> | number;
}) {
  const locale = useLocale();
  const entry = ENTRY[locale];
  const bar = STUDENT_BAR[locale];

  return (
    <Screen
      title={<Logo className="h-3 w-auto shrink-0" />}
      trailing={
        <span className="shrink-0 text-[0.7rem] tabular-nums text-muted">
          {entry.date}
        </span>
      }
      footer={<Composer note={bar.note} action={bar.action} />}
    >
      <p className="text-[0.78rem] font-medium tracking-[-0.01em] text-ink lg:text-[0.85rem]">
        {entry.prompt}
      </p>

      {/* flex-1 and min-h-0: the writing surface absorbs whatever height the
          Frame gives this window beyond its content, so the bubble under it
          is never pushed out of the window. */}
      <div className="relative mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-inset p-2.5">
        <p className={ENTRY_TEXT[locale]}>{entry.body}</p>
        {/* Counted from the text above, never typed out: the two cannot
            drift apart. */}
        <span className="mt-auto pt-1.5 text-right text-[0.66rem] tabular-nums text-muted">
          {ENTRY_COUNT[locale]}
        </span>

        <motion.div
          className="pointer-events-none absolute inset-y-0 left-full w-full"
          style={{ x: scanX, opacity: scanOpacity }}
        >
          <span className="absolute inset-y-0 left-0 w-px bg-mark-1" />
        </motion.div>
      </div>

      {/*
        Tinted rather than bordered so it reads as the system speaking back,
        not as another field to fill in. mark-1, not accent: #85c0ed is a fill
        colour and measures 1.83:1 as text on this bubble (accent/10 over the
        white window, #f3f9fd), where mark-1 holds 5.11:1.
      */}
      <div className="mt-2.5 max-w-[92%] shrink-0 rounded-xl rounded-bl-sm bg-accent/10 px-3 py-2.5">
        <p className="flex items-center gap-1 text-[0.66rem] font-medium tracking-[0.06em] text-mark-1">
          <Icon name="auto_awesome" size={12} className="shrink-0" />
          {SCREEN_WORDS[locale].question}
        </p>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink lg:text-[0.9rem]">
          {entry.followUp}
        </p>
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------------------- */
/* The wall                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A hairline across the band on a phone and down it on a wide screen, with
 * the lock sitting on the crossing. mark-1 and not border-line-strong: this
 * line has to be seen to be believed. line-strong does clear the 3:1 a
 * meaningful non-text mark needs, but only just — 3.48:1 on the Frame's
 * tint, 3.20:1 where the section's blue wash peaks behind it — and in the
 * warm grey of a diagram stroke. mark-1 holds 5.09 and 4.67:1 on the same
 * two grounds, and it is the blue the glow is drawn in, so the line and its
 * glow read as one lit wall.
 *
 * From md the line is `inset-y-0` and nothing else on the vertical axis.
 * It used to carry `md:top-auto` as well, and Tailwind emits `top-*` after
 * `inset-y-*`, so `top: auto` won and an empty absolutely-positioned span
 * with `top: auto; bottom: 0` is zero pixels tall — on every desktop width
 * the wall was the lock alone, with no line. `inset-y-0` already overrides
 * the phone layout's `top-1/2` by media order.
 *
 * The glow is a gradient rather than a blurred block — a filter on a
 * full-height element is the one thing here that would cost anything, and a
 * three-stop fade is the same picture. Its direction is perpendicular to the
 * line, so it flips with the layout.
 */
function Wall({ glow }: { glow: MotionValue<number> | number }) {
  return (
    <div className="relative flex items-center justify-center py-1 md:w-8 md:py-0">
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-mark-1 md:inset-x-auto md:inset-y-0 md:left-1/2 md:h-auto md:w-px md:-translate-x-1/2 md:translate-y-0" />
      <motion.span
        className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 bg-linear-to-b from-transparent via-mark-1/25 to-transparent md:inset-x-auto md:inset-y-0 md:left-1/2 md:h-auto md:w-4 md:-translate-x-1/2 md:translate-y-0 md:bg-linear-to-r"
        style={{ opacity: glow }}
      />
      <span className="relative rounded-full border border-line bg-surface p-1.5 text-muted">
        <Icon name="lock" size={15} className="block" />
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The teacher's window                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The teacher's screen, and nothing underneath it.
 *
 * Three rows of a class, a roll number, a time, a surface, an observation and
 * its basis — the whole of what a teacher receives. The first row is the
 * entry on the other side of the wall, and it is the one that arrives as the
 * reader scrolls. The other two are already there, because the figure has to
 * state its claim at rest too.
 *
 * Newest first, and the title bar says so. No row carries a level, a score or
 * a bar, and the order is time rather than severity: the display policy
 * removed the 高/中/低 band, and a list ranked by severity would put it back
 * through the sort.
 */
function ReportScreen({
  rowOpacity,
  rowX,
  observationOpacity,
}: {
  rowOpacity: MotionValue<number> | number;
  rowX: MotionValue<number> | number;
  observationOpacity: MotionValue<number> | number;
}) {
  const locale = useLocale();

  return (
    <Screen
      title={REPORT_TITLE[locale]}
      trailing={<Chip>{REPORT_SORT[locale]}</Chip>}
      bodyClassName="flex flex-col justify-center divide-y divide-line px-3.5 py-1"
      footer={
        <span className="flex items-start gap-1.5 text-[0.66rem] leading-snug text-muted sm:text-[0.7rem]">
          <Icon name="lock" size={13} className="mt-px shrink-0" />
          {TEACHER_BAR[locale].note}
        </span>
      }
    >
      {ROWS[locale].map((row, i) => {
        const first = i === 0;
        return (
          /*
            The first row is where the signal thread arrives from step 04's
            analysis in 仕組み, and data-thread is how the page's thread layer
            finds it. The row is its own element rather than a kit <Row>,
            because what it holds is three lines — who and when, what was
            observed, and on what basis — not one line with a value at the end.
          */
          <motion.div
            key={`${row.klass}${row.no}`}
            data-thread={first ? "report" : undefined}
            className="py-2.5"
            style={first ? { opacity: rowOpacity, x: rowX } : undefined}
          >
            <p className="flex min-w-0 items-baseline gap-2 text-[0.7rem] tabular-nums text-muted">
              <span className="shrink-0 text-ink">
                {row.klass} {row.no}
              </span>
              <span className="truncate">
                {row.at} · {row.surface}
              </span>
            </p>
            {/*
              The observation is the row. It says which category of expression
              was matched — not how the student is doing, and not a line
              quoted from what they wrote.
            */}
            <motion.p
              className="mt-1 text-[0.75rem] leading-snug text-ink lg:text-[0.8rem]"
              style={first ? { opacity: observationOpacity } : undefined}
            >
              {OBSERVATION_LABEL[locale]}: {row.observation}
            </motion.p>
            <p className="mt-0.5 text-[0.66rem] text-muted">└ {BASIS[locale]}</p>
          </motion.div>
        );
      })}
    </Screen>
  );
}
