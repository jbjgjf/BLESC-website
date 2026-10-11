"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Frame, ViewLabel } from "@/components/mock";
import { Reveal } from "@/components/Reveal";
import {
  ClassMock,
  DiaryMock,
  ProbeMock,
  TrendMock,
} from "@/components/StepMockups";
import { Section, SectionTitle } from "@/components/ui";
import type { Locale } from "@/lib/i18n";

/** The section's title and the line under it, in each language. */
const COPY = {
  ja: { title: "仕組み", lead: "日記を書いてから、先生に記録が届くまで。" },
  en: {
    title: "How it works",
    lead: "From a diary entry to the record a teacher receives.",
  },
} as const;

/** What a step says, in one language. */
type StepCopy = {
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
};

type Step = {
  n: string;
  /**
   * The meaning mark for that point of view: it tints the panel and dots the
   * label, so the move from the student's screens to the analysis is seen
   * as well as read. One mark per point of view, never one per step.
   */
  mark: 1 | 2 | 3;
  /** The screen this step happens on. */
  mock: () => React.ReactElement;
} & Record<Locale, StepCopy>;

/*
 * The English beside each step is a translation of the Japanese above it,
 * and claims no more than it does. Two of them are worded with care:
 *
 * - 03's 会話ではなく is "There is no back-and-forth." The point of the
 *   sentence is that the AI does not hold an exchange with the student, and
 *   this says so without calling the product, even in a denial, by the name
 *   of the thing it is not.
 * - 04 is 捉える, not 検知: "capture", and "a clue for telling … from …",
 *   never a word for finding or measuring something in a student. Its last
 *   sentence is a negation in both languages and has to stay one
 *   (docs/claims.md §1).
 *
 * Both also say their Japanese in the words the FAQ uses for the same
 * Japanese (lib/faqEn.ts): 短い問いをひとつだけ is "just one short follow-up
 * question", and 一日だけの落ち込みか、続いている変化か is "one low day"
 * against "a change that continues". Change one and change the other.
 */
const STEPS: Step[] = [
  {
    n: "01",
    mark: 3,
    mock: ClassMock,
    ja: {
      title: "全生徒が対象",
      body: "希望者だけでなく、クラス全員が使います。",
      view: "クラス",
    },
    en: {
      title: "Every student is included",
      body: "The whole class uses it, not only the students who choose to.",
      view: "Class",
    },
  },
  {
    n: "02",
    mark: 1,
    mock: DiaryMock,
    ja: {
      title: "日記を書く",
      body: "好きなときに、内容も長さも自由に書けます。",
      view: "生徒の画面",
    },
    en: {
      title: "Write a diary",
      body: "Students can write in their own time, about anything and at any length.",
      view: "Student’s screen",
    },
  },
  {
    n: "03",
    mark: 1,
    mock: ProbeMock,
    ja: {
      title: "AIが問いを返す",
      body: "会話ではなく、短い問いをひとつだけ返します。",
      view: "生徒の画面",
    },
    en: {
      title: "The AI replies with a question",
      body: "There is no back-and-forth. The AI replies with just one short follow-up question.",
      view: "Student’s screen",
    },
  },
  {
    n: "04",
    mark: 2,
    mock: TrendMock,
    ja: {
      title: "変化を捉える",
      body: "一日だけの落ち込みか、続いている変化かを見分ける手がかりになります。心理的リスクの判定は行いません。",
      view: "Blescの分析",
    },
    en: {
      title: "Capture changes",
      body: "This gives a clue for telling one low day from a change that continues. Blesc does not assess psychological risk.",
      view: "Blesc’s analysis",
    },
  },
];

/*
 * Where English is set differently from Japanese. Each is a whole class
 * string picked by locale — Tailwind only generates classes it can read —
 * and the Japanese string is the one the markup always had.
 */

/**
 * The line under the title. English breaks at spaces, so on a phone, where
 * the line does not fit, an unbalanced wrap leaves its last word or two on
 * a line of their own; text-balance splits it evenly instead.
 */
const LEAD: Record<Locale, string> = {
  ja: "text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink",
  en: "text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-balance text-ink",
};

/**
 * A step's title. The pinned layout's column is 255px wide at 768px, where
 * "The AI replies with a question" takes two lines and would leave
 * "question" alone on the second; balanced, it breaks in the middle.
 */
const STEP_TITLE: Record<Locale, string> = {
  ja: "mt-2 text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.025em] text-ink transition-colors duration-500",
  en: "mt-2 text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.025em] text-balance text-ink transition-colors duration-500",
};

/**
 * A step's sentence. measure-jp is the leading and tracking Japanese
 * paragraphs want (1.9, 0.01em); Latin text at the same size is set
 * tighter, with no added tracking. text-pretty, because English breaks at
 * spaces and a sentence can otherwise end on a word by itself — step 02's
 * "length." on a 320px phone, for one, and whichever word a later edit to
 * these sentences leaves last in the pinned layout's 255px column at 768px.
 */
const STEP_BODY: Record<Locale, string> = {
  ja: "measure-jp mt-3 max-w-[26rem] text-[1.0625rem] text-muted",
  en: "mt-3 max-w-[26rem] text-[1.0625rem] leading-[1.7] text-pretty text-muted",
};

/**
 * The panel's height in the list — below 768px, and at any width under
 * prefers-reduced-motion or without a script. The pinned layout sets its
 * own (PIN.frame), the same for both languages.
 *
 * English is 22rem from the narrowest phone rather than from 640px. The
 * windows fill the panel, and what they hold is longer in English: the
 * diary entry is four lines where the Japanese is three, and five on a
 * 320px screen, and the observation along the foot of step 04 takes two
 * lines where the Japanese takes one. At 20rem the fifth line pushes the
 * character count out of the writing surface; the extra 2rem holds it, and
 * gives step 04's chart back the height its foot took.
 */
const FRAME: Record<Locale, string> = {
  ja: "h-[20rem] sm:h-[22rem]",
  en: "h-[22rem]",
};

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
 *
 * The page hands every section its language, and the layout sets the same
 * one in context for client components like this. The prop is used when it
 * is there, so the section answers to the page that rendered it; the two
 * cannot differ, both being the route's. The four screens ask the context
 * themselves (StepMockups).
 */
export function HowItWorks({ locale: fromPage }: { locale?: Locale }) {
  const fromLayout = useLocale();
  const locale = fromPage ?? fromLayout;
  const copy = COPY[locale];
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
        <SectionTitle>{copy.title}</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className={LEAD[locale]}>{copy.lead}</p>
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
          const text = step[locale];
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
                  className={`${STEP_TITLE[locale]} ${
                    active ? "" : "js:md:motion-safe:text-muted"
                  }`}
                >
                  {text.title}
                </h3>
                <p className={STEP_BODY[locale]}>{text.body}</p>
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
                      label={<ViewLabel mark={step.mark}>{text.view}</ViewLabel>}
                      className={`${FRAME[locale]} ${PIN.frame}`}
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
