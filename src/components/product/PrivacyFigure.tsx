"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Bar, Chip, Composer, Frame, Row, Screen } from "@/components/mock";
import { Icon } from "@/components/ui";
import {
  ENTRY,
  ENTRY_LENGTH,
  REPORT_BADGE,
  REPORT_TITLE,
  ROWS,
  STUDENT_BAR,
  TEACHER_BAR,
} from "@/lib/sample";

/**
 * The privacy boundary, as one figure.
 *
 * 教員に届くのは、要点のみ。is the strongest claim the product makes, and the
 * section used to assert it in a sentence and then show two screens, drawn
 * in a second style, that happened not to contradict it. A reader had to
 * hold both in their head and notice an absence — and absences are exactly
 * what nobody notices.
 *
 * So the claim is drawn once, at rest: the student's window on the left with
 * words in it, the teacher's window on the right with none, and a lit line
 * between them that the writing visibly does not cross. Both windows are the
 * same <Screen> the 仕組み cards use, so this reads as two views of the one
 * product rather than as a diagram about it.
 *
 * Four scroll-linked beats, because the mechanism is a sequence:
 *   1. a hairline scans across the entry — the model reading it — and fades
 *      out as it reaches the wall;
 *   2. the wall brightens as the scan arrives;
 *   3. beyond it, the flagged row's bar measures out;
 *   4. its level is printed.
 *
 * All four are motion values off one `useScroll`; nothing per frame touches
 * React state, and the bar is a scaleX rather than a width so no frame
 * triggers layout. Under `prefers-reduced-motion` the figure renders its end
 * state — wall lit, bar measured, level printed — and the scanner, whose end
 * state is "gone into the wall", is simply not drawn.
 *
 * Not wrapped in a <Reveal>, and with no entrance of its own: the beats are
 * measured against this element's position, and an ancestor still animating
 * a translate would be measured mid-flight.
 *
 * Every string is sample data from @/lib/sample or a word the interface
 * itself says. Students are a class and a roll number.
 */
export function PrivacyFigure({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
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

  /* Beats 3 and 4 — what crosses. The bar scales within a track already cut
     to its true length (see <MeasuredBar>), so 1 here means 88%, not full. */
  const barScale = useTransform(scrollYProgress, [0.5, 0.95], [0, 1], {
    clamp: true,
  });
  const levelOpacity = useTransform(scrollYProgress, [0.72, 0.92], [0, 1], {
    clamp: true,
  });

  return (
    <figure ref={ref}>
      {/*
        One column on a phone, where the wall runs across the band; three
        from 768px, where it runs down it. h-full so both windows take the
        Frame's height at md+ and the grid row stretches the wall to match.
      */}
      <Frame tint={1} className="md:h-[27rem] lg:h-[29rem]">
        <div className="grid h-full w-full gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <DiaryScreen scanX={scanX} scanOpacity={reduce ? 0 : scanOpacity} />
          <Wall glow={reduce ? 1 : wallGlow} />
          <ReportScreen
            barScale={reduce ? 1 : barScale}
            levelOpacity={reduce ? 1 : levelOpacity}
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
 * 0 — rather than by leaving the node out. useReducedMotion is null on the
 * server and true on the first client render for anyone with the setting
 * on, so a node that exists in one and not the other is a hydration
 * mismatch that makes React throw the server HTML away for exactly the
 * people the setting is meant to serve.
 */
function DiaryScreen({
  scanX,
  scanOpacity,
}: {
  scanX: MotionValue<string>;
  scanOpacity: MotionValue<number> | number;
}) {
  return (
    <Screen
      title={<Logo className="h-3 w-auto shrink-0" />}
      trailing={
        <span className="shrink-0 text-[0.7rem] tabular-nums text-muted">
          {ENTRY.date}
        </span>
      }
      footer={<Composer note={STUDENT_BAR.note} action={STUDENT_BAR.action} />}
    >
      <p className="text-[0.78rem] font-medium tracking-[-0.01em] text-ink lg:text-[0.85rem]">
        {ENTRY.prompt}
      </p>

      {/* flex-1 and min-h-0: the writing surface absorbs whatever height the
          Frame gives this window beyond its content, so the bubble under it
          is never pushed out of the window. */}
      <div className="relative mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-inset p-2.5">
        <p className="text-[0.78rem] leading-[1.85] text-ink lg:text-[0.85rem]">
          {ENTRY.body}
        </p>
        {/* Counted from the text above, never typed out: the two cannot
            drift apart. */}
        <span className="mt-auto pt-1.5 text-right text-[0.66rem] tabular-nums text-muted">
          {ENTRY_LENGTH}字
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
        colour and measures 1.87:1 as text on the light ground, while mark-1
        flips with the theme.
      */}
      <div className="mt-2.5 max-w-[92%] shrink-0 rounded-xl rounded-bl-sm bg-accent/10 px-3 py-2.5">
        <p className="flex items-center gap-1 text-[0.66rem] font-medium tracking-[0.06em] text-mark-1">
          <Icon name="auto_awesome" size={12} className="shrink-0" />
          AIからの問いかけ
        </p>
        <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink lg:text-[0.9rem]">
          {ENTRY.followUp}
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
 * line has to be seen to be believed, and line-strong would not clear the
 * 3:1 a meaningful non-text mark needs on the dark build.
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
 * The report, and nothing underneath it.
 *
 * Four rows of a class, a roll number, a length and a level — the whole of
 * what a teacher receives. The first row is the entry on the other side of
 * the wall, and it is the one that resolves as the reader scrolls: the bar
 * measures out, then the level prints. The other three are already there,
 * because the figure has to state its claim at rest too.
 *
 * The level is printed, not merely coloured. Red-amber-green is the worst
 * possible pairing for colour blindness, so the label is what actually
 * carries the meaning — WCAG 1.4.1.
 */
function ReportScreen({
  barScale,
  levelOpacity,
}: {
  barScale: MotionValue<number> | number;
  levelOpacity: MotionValue<number> | number;
}) {
  return (
    <Screen
      title={REPORT_TITLE}
      trailing={<Chip tone="risk">{REPORT_BADGE}</Chip>}
      bodyClassName="flex flex-col justify-center divide-y divide-line px-3.5 py-1"
      footer={
        <span className="flex items-center gap-1.5 text-[0.66rem] text-muted sm:text-[0.7rem]">
          <Icon name="lock" size={13} className="shrink-0" />
          {TEACHER_BAR.note}
        </span>
      }
    >
      {ROWS.map((row, i) => {
        const line = (
          <Row
            key={`${row.klass}${row.no}`}
            klass={row.klass}
            no={row.no}
            className="py-2.5"
            trailing={
              /* `row.text` is a whole class name written out in sample.ts —
                 Tailwind reads it there, so nothing is assembled here. */
              <motion.span
                className={`w-4 shrink-0 text-right text-[0.75rem] font-medium ${row.text}`}
                style={{ opacity: i === 0 ? levelOpacity : 1 }}
              >
                {row.level}
              </motion.span>
            }
          >
            {i === 0 ? (
              <MeasuredBar pct={row.width} scale={barScale} />
            ) : (
              <Bar pct={row.width} tone={row.tone} />
            )}
          </Row>
        );

        /*
          The first row is where the signal thread arrives from the analysis
          in 仕組み, and data-thread is how the page's thread layer finds it.
          A wrapper rather than a prop on <Row>, so the kit's one component
          with no room for a name gains no room for anything else either;
          divide-y still rules between it and the row below.
        */
        return i === 0 ? (
          <div key={`${row.klass}${row.no}`} data-thread="report">
            {line}
          </div>
        ) : (
          line
        );
      })}
    </Screen>
  );
}

/**
 * The kit's <Bar>, with its fill able to measure out.
 *
 * Three layers rather than two. The middle span is cut to the true length as
 * a static style, and the fill inside it scales from 0 to 1 of *that* — so
 * the animation is a scaleX and never a width, and the end state cannot
 * overshoot. It also means the bar is honest without JavaScript: the
 * layout's <noscript> rule resets every inline transform, which would turn a
 * scaleX on the track itself into a full bar, but here it can only ever fill
 * the 88% the row actually says.
 */
function MeasuredBar({
  pct,
  scale,
}: {
  /** A CSS length, e.g. "88%". Set as a style, never animated. */
  pct: string;
  scale: MotionValue<number> | number;
}) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-inset">
      <span
        className="block h-full overflow-hidden rounded-full"
        style={{ width: pct }}
      >
        <motion.span
          className="block h-full w-full origin-left rounded-full bg-risk-high"
          style={{ scaleX: scale }}
        />
      </span>
    </span>
  );
}
