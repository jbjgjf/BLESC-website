"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { GlassFilter, LiquidGlass } from "@/components/LiquidGlass";
import { Reveal } from "@/components/Reveal";
import { SPOTLIGHT } from "@/components/SpotlightCard";
import {
  DiaryMock,
  ProbeMock,
  RosterMock,
  SignalMock,
} from "@/components/StepMockups";
import { Section, SectionTitle } from "@/components/ui";

type Stage = {
  n: string;
  label: string;
  body: string;
  /** The screen this stage looks like. */
  mock: () => React.ReactElement;
};

/**
 * One flow, read top to bottom.
 *
 * This was five tabs. Clicking through five panels to learn what the product
 * does made the reader do work the page should do for them, and any one
 * numbered box looks like every other numbered box. All five are on the page
 * at once now, and the thing that gives them structure is the boundary they
 * cross: everything above the gate touches what the student actually wrote,
 * and only the summary passes below it. That is the product's whole claim,
 * so it is the divider rather than a footnote on step 04.
 */
const BEFORE: Stage[] = [
  {
    n: "01",
    mock: RosterMock,
    label: "生徒",
    body: "毎日5分、ホームルームの時間に実施します。対象は希望者ではなく全生徒で、新しい習慣も専用の準備も必要ありません。",
  },
  {
    n: "02",
    mock: DiaryMock,
    label: "日記を書く",
    body: "その日にあったことを、5分で短く綴るだけ。内容も長さも自由です。誰かに読ませるための文章ではなく、自分のための記録として書けることが、本音が残る条件になります。",
  },
  {
    n: "03",
    mock: ProbeMock,
    label: "AIが深掘り",
    body: "独自のAIが、書かれた内容に短い問いを返します。「たぶん大丈夫」で終わる一行の奥にあるものを、対話ではなく一問一答のかたちで、静かに引き出します。",
  },
  {
    n: "04",
    mock: SignalMock,
    label: "リスク解析",
    body: "言葉のニュアンス、書くことをためらった間、日々の書きぶりの変化。こうした微細なシグナルを積み重ねて、心理的リスクを検知します。毎日書かれるからこそ、一日の落ち込みと、続いている不調とを区別できます。",
  },
];

/**
 * Clockwise still — 01 across to 02, down to 03, back to 04 — but the two
 * rows no longer share a column template, so all four widths differ: 4/8
 * on the top row and 7/5 on the bottom. One grid cannot vary its columns
 * per row, so this is two grids, and 03 and 04 are placed explicitly rather
 * than reordered in the markup, which keeps the DOM in reading order.
 *
 * The arrows that used to sit in the gaps are gone. They were positioned by
 * percentage against equal columns; against unequal ones they no longer
 * land on the boundary, and four cards this size do not need them to read
 * as a sequence.
 */
function Step({
  stage,
  index,
  feature = false,
}: {
  stage: Stage;
  index: number;
  /** The destination, on the far side of the gate. */
  feature?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const shown = useInView(ref, { margin: "0px 0px -20% 0px", once: true });
  const Mock = stage.mock;

  return (
    <motion.div
      ref={ref}
      className={`${SPOTLIGHT} flex h-full flex-col rounded-3xl border p-5 shadow-[var(--shadow-card)] md:p-6 ${
        feature ? "border-mark-1/40 bg-mark-1/[0.07]" : "border-line bg-surface"
      }`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
      animate={
        shown
          ? { opacity: 1, y: 0, scale: 1 }
          : reduce
            ? { opacity: 0 }
            : { opacity: 0, y: 24, scale: 0.97 }
      }
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: reduce ? 0 : index * 0.08,
      }}
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-[0.9rem] font-semibold tabular-nums text-on-accent md:size-12"
        >
          {stage.n}
        </span>
        <h3 className="text-[clamp(1.15rem,2.2vw,1.45rem)] font-medium leading-snug tracking-[-0.02em] text-ink">
          <span className="sr-only">{`ステップ ${stage.n}、`}</span>
          {stage.label}
        </h3>
      </div>

      <p className="measure-jp mt-4 text-[0.92rem] text-muted">{stage.body}</p>

      {/*
        The screen sits at the foot of the card, on glass. mt-auto so the
        panels line up along the bottom whatever length the copy runs to.
      */}
      <LiquidGlass
        radius="0.9rem"
        className="mt-6 h-[11rem] border border-line/60"
      >
        <Mock />
      </LiquidGlass>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <Section id="how" alt>
      <Reveal>
        <SectionTitle accent="bg-mark-1">仕組み</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          毎日5分の日記が、一枚のレポートになるまで。
        </p>
      </Reveal>

      <GlassFilter />

      <div className="mt-14">
        <ol className="space-y-5 md:space-y-8">
          <li>
            <div className="grid gap-5 md:grid-cols-[4fr_8fr] md:gap-8">
              <Step stage={BEFORE[0]} index={0} />
              <Step stage={BEFORE[1]} index={1} />
            </div>
          </li>
          <li>
            <div className="grid gap-5 md:grid-cols-[7fr_5fr] md:gap-8">
              {/* 03 sits right, 04 left — the clockwise turn — without
                  moving either out of reading order in the markup. */}
              <div className="md:col-start-2 md:row-start-1">
                <Step stage={BEFORE[2]} index={2} />
              </div>
              <div className="md:col-start-1 md:row-start-1">
                <Step stage={BEFORE[3]} index={3} />
              </div>
            </div>
          </li>
        </ol>

      </div>
    </Section>
  );
}
