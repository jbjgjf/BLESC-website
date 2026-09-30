"use client";

import { useEffect, useRef, useState } from "react";
import { Frame, ViewLabel } from "@/components/mock";
import { Reveal } from "@/components/Reveal";
import {
  ClassMock,
  DiaryMock,
  ProbeMock,
  TrendMock,
} from "@/components/StepMockups";
import { Section, SectionTitle } from "@/components/ui";

type Step = {
  n: string;
  /** The step, in a few characters — not a summary of it. */
  title: string;
  /** One short, plain sentence. No new facts: this restates the old caption. */
  body: string;
  /**
   * Whose screen the picture is, as its label prints it — or, for step 04,
   * that it is nobody's screen but Blesc's own analysis. Not 先生の画面:
   * the teacher's screen shows observations with their time and basis and
   * nothing else (docs/claims.md §2, and プロダクト's own 教員に届くのは、観測と
   * 根拠だけ), so a chart labelled as the teacher's would say the opposite.
   * Only the one row along its foot reaches the teacher.
   */
  view: string;
  /**
   * The meaning mark for that point of view: it tints the panel and dots the
   * label, so the move from the student's screens to the analysis is seen
   * as well as read. One mark per point of view, never one per step.
   */
  mark: 1 | 2 | 3;
  /** The screen this step happens on. */
  mock: () => React.ReactElement;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "全生徒が対象",
    body: "希望者だけでなく、クラス全員が使います。",
    view: "クラス",
    mark: 3,
    mock: ClassMock,
  },
  {
    n: "02",
    title: "日記を書く",
    body: "好きなときに、内容も長さも自由に書けます。",
    view: "生徒の画面",
    mark: 1,
    mock: DiaryMock,
  },
  {
    n: "03",
    title: "AIが問いを返す",
    body: "会話ではなく、短い問いをひとつだけ返します。",
    view: "生徒の画面",
    mark: 1,
    mock: ProbeMock,
  },
  {
    n: "04",
    title: "変化を捉える",
    body: "一日だけの落ち込みか、続いている変化かを見分ける手がかりになります。心理的リスクの判定は行いません。",
    view: "Blescの分析",
    mark: 2,
    mock: TrendMock,
  },
];

/**
 * When the pinned layout is on. The same three conditions as the `js:`,
 * `md:` and `motion-safe:` variants that draw it — the script only has to
 * ask about the last two, since it is the script.
 */
const PINNED = "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";

/*
 * The pinned layout's classes, every one of them behind the same three
 * variants: js: (something will drive it), md: (there is room for two
 * columns) and motion-safe: (the reader has not asked for less movement).
 * Take any of the three away and all of these fall off together, which
 * leaves the plain list. Written out in full, because Tailwind only
 * generates classes it can read.
 */
const PIN = {
  /** The containing block the four pictures are stacked against. */
  list: "js:md:motion-safe:relative js:md:motion-safe:gap-0",
  /**
   * One tall row per step down the left, text centred in it. The rows are
   * the scroll track; the 2px rule down their left edge is the progress
   * line, lit on the active row.
   */
  step: "js:md:motion-safe:flex js:md:motion-safe:min-h-[70svh] js:md:motion-safe:w-[42%] js:md:motion-safe:flex-col js:md:motion-safe:justify-center js:md:motion-safe:border-l-2 js:md:motion-safe:pl-8 js:lg:motion-safe:pl-10",
  /**
   * Each picture's box: out of the flow, down the right-hand side, the full
   * height of the list — so the sticky panel inside it has the whole track
   * to travel and all four are stacked in the same place. Its width is set
   * here, not on the panel, so the box is always exactly as wide as the
   * panel it holds (see the signal thread, below).
   */
  figure:
    "js:md:motion-safe:pointer-events-none js:md:motion-safe:absolute js:md:motion-safe:inset-y-0 js:md:motion-safe:right-0 js:md:motion-safe:mt-0 js:md:motion-safe:w-[52%] js:md:motion-safe:max-w-none",
  /** Centred in the viewport, and never up under the nav on a short one. */
  stick:
    "js:md:motion-safe:sticky js:md:motion-safe:top-[max(6rem,calc(50svh_-_12rem))] js:lg:motion-safe:top-[max(6rem,calc(50svh_-_14rem))]",
  frame: "js:md:motion-safe:h-[24rem] js:lg:motion-safe:h-[28rem]",
} as const;

/**
 * The four steps, one screen at a time.
 *
 * This was a 2×2 grid of cards, and the feedback on it was specific: too
 * much going on, and two unrelated screens side by side — a grid of blue
 * squares next to a diary — with nothing saying whose screen either was, as
 * the point of view moved from the class to the student to what Blesc makes
 * of the writing.
 * Four pictures in view at once asked the reader to compare them, when what
 * they are is a sequence.
 *
 * So, from 768px with a script and without reduced motion, a sticky
 * stepper: the four steps down the left, each one a tall row, and one large
 * panel on the right that holds still in the middle of the viewport while
 * the rows scroll past it, crossfading to the screen of whichever step is
 * level with the middle of the screen. Every panel is labelled with whose
 * screen it is (<ViewLabel>) and tinted by that point of view, so the
 * student's two screens share a colour and step 04 — Blesc's analysis, of
 * which only the row along its foot reaches the teacher — does not.
 *
 * Everywhere else — below md, under prefers-reduced-motion, and with no
 * JavaScript — it is a plain list: each step, then its own screen, no
 * pinning and no crossfade. Both layouts are the same markup. The pinned
 * one is nothing but classes behind js:md:motion-safe: (PIN, above), so the
 * server HTML is right for either before any script runs, and there is one
 * copy of each screen rather than a list's worth and a stepper's worth.
 *
 * The active step is the one whose row crosses the middle of the viewport,
 * found with an IntersectionObserver on a thin band there — no scroll
 * handler, and state is set only when the index changes. The observer only
 * runs while the pinned layout is on; in the list every step is simply
 * visible and nothing needs to know which one you are reading.
 *
 * Each step's screen is remounted when its step becomes active, through a
 * per-step key. The screens play their one beat on view, and in the pinned
 * layout all four come into view together, stacked; without the remount the
 * question in step 03 would have arrived, unseen, long before its screen
 * was shown.
 *
 * The signal thread (flourish/SignalThread) leaves from step 04's picture.
 * Its anchor is the box around that picture rather than anything inside the
 * sticky panel: the thread measures layout offsets once, not per scroll, and
 * a sticky box's offset depends on where the page was when it was taken.
 * The box is not sticky, and its foot is where the panel comes to rest in
 * both layouts — the bottom of the track when pinned, the bottom of the
 * panel in the list — and it is the panel's width in both (the list's
 * max-w-2xl is on the box, not the panel), so the thread always leaves from
 * the middle of the panel's foot.
 */
export function HowItWorks() {
  const [state, setState] = useState({
    active: 0,
    plays: STEPS.map(() => 0),
  });
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const pinned = window.matchMedia(PINNED);
    const inBand = new Set<number>();
    let observer: IntersectionObserver | null = null;

    const show = (next: number) =>
      setState((s) =>
        s.active === next
          ? s
          : {
              active: next,
              plays: s.plays.map((p, i) => (i === next ? p + 1 : p)),
            },
      );

    const connect = () => {
      observer?.disconnect();
      observer = null;
      inBand.clear();
      if (!pinned.matches) return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const i = rows.current.indexOf(entry.target as HTMLLIElement);
            if (i < 0) continue;
            if (entry.isIntersecting) inBand.add(i);
            else inBand.delete(i);
          }
          /*
           * The band is a few pixels tall, so where two rows meet both can
           * be in it for a moment; the earlier one keeps the panel until it
           * has fully left. Above and below the track nothing is in the
           * band, and the last step shown stays shown.
           */
          let next = -1;
          for (const i of inBand) if (next < 0 || i < next) next = i;
          if (next >= 0) show(next);
        },
        { rootMargin: "-48% 0px -48% 0px" },
      );
      for (const row of rows.current) if (row) observer.observe(row);
    };

    connect();
    pinned.addEventListener("change", connect);
    return () => {
      pinned.removeEventListener("change", connect);
      observer?.disconnect();
    };
  }, []);

  return (
    <Section id="how">
      <Reveal>
        <SectionTitle>仕組み</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          日記を書いてから、先生に記録が届くまで。
        </p>
      </Reveal>

      {/*
        role="list": the preflight removes list markers, and WebKit then
        drops an unmarked list out of the accessibility tree as a list.
        No <Reveal> around the list itself: in the pinned layout it is three
        screens tall, and a translate on it would move the track the sticky
        panel is measured against.
      */}
      <ol
        role="list"
        className={`mt-12 grid gap-16 md:mt-16 md:gap-20 ${PIN.list}`}
      >
        {STEPS.map((step, i) => {
          const Mock = step.mock;
          const active = i === state.active;

          return (
            <li
              key={step.n}
              ref={(el) => {
                rows.current[i] = el;
              }}
              className={`transition-colors duration-500 ${PIN.step} ${
                active
                  ? "js:md:motion-safe:border-mark-1"
                  : "js:md:motion-safe:border-line"
              }`}
            >
              <Reveal>
                {/* Decoration over an ordered list that already announces position. */}
                <p
                  aria-hidden
                  className={`text-[0.85rem] font-medium tabular-nums text-mark-1 transition-colors duration-500 ${
                    active ? "" : "js:md:motion-safe:text-muted"
                  }`}
                >
                  {step.n}
                </p>
                <h3
                  className={`mt-2 text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.025em] text-ink transition-colors duration-500 ${
                    active ? "" : "js:md:motion-safe:text-muted"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="measure-jp mt-3 max-w-[26rem] text-[1.0625rem] text-muted">
                  {step.body}
                </p>
              </Reveal>

              <div
                data-thread={i === STEPS.length - 1 ? "analysis" : undefined}
                className={`mt-8 max-w-2xl transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${PIN.figure} ${
                  active ? "" : "js:md:motion-safe:opacity-0"
                }`}
              >
                <div className={PIN.stick}>
                  <Reveal>
                    <Frame
                      tint={step.mark}
                      label={<ViewLabel mark={step.mark}>{step.view}</ViewLabel>}
                      className={`h-[20rem] sm:h-[22rem] ${PIN.frame}`}
                    >
                      <Mock key={state.plays[i]} />
                    </Frame>
                  </Reveal>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
