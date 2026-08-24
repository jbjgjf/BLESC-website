"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/Reveal";
import { SPOTLIGHT } from "@/components/SpotlightCard";
import { Icon, Section, SectionTitle } from "@/components/ui";

type Stage = {
  n: string;
  label: string;
  body: string;
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
    label: "生徒",
    body: "毎日5分、ホームルームの時間に実施します。対象は希望者ではなく全生徒で、新しい習慣も専用の準備も必要ありません。",
  },
  {
    n: "02",
    label: "日記を書く",
    body: "その日にあったことを、5分で短く綴るだけ。内容も長さも自由です。誰かに読ませるための文章ではなく、自分のための記録として書けることが、本音が残る条件になります。",
  },
  {
    n: "03",
    label: "AIが深掘り",
    body: "独自のAIが、書かれた内容に短い問いを返します。「たぶん大丈夫」で終わる一行の奥にあるものを、対話ではなく一問一答のかたちで、静かに引き出します。",
  },
  {
    n: "04",
    label: "リスク解析",
    body: "言葉のニュアンス、書くことをためらった間、日々の書きぶりの変化。こうした微細なシグナルを積み重ねて、心理的リスクを検知します。毎日書かれるからこそ、一日の落ち込みと、続いている不調とを区別できます。",
  },
];

const AFTER: Stage[] = [
  {
    n: "05",
    label: "教員",
    body: "教員が受け取るのは、対応が必要な生徒を示す要点のみのレポートです。日記の本文そのものが公開されることはなく、教員の側に新しい業務が生まれることもありません。",
  },
];

/**
 * Clockwise, 01 → 02 → 03 → 04, then out through the gate to 05.
 *
 * DOM order stays 01–04, which is both the reading order and the order a
 * screen reader gets; only the grid placement is clockwise. Explicit
 * col/row starts rather than reordering the array, because the sequence is
 * the content and the square is presentation.
 */
const CELL = [
  "md:col-start-1 md:row-start-1",
  "md:col-start-2 md:row-start-1",
  "md:col-start-2 md:row-start-2",
  "md:col-start-1 md:row-start-2",
];

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

  return (
    <motion.div
      ref={ref}
      className={`${SPOTLIGHT} flex h-full flex-col rounded-3xl border p-6 shadow-[var(--shadow-card)] md:p-7 ${
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
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-full bg-mark-1 text-[0.95rem] font-semibold tabular-nums text-on-accent md:size-14 md:text-[1.05rem]"
      >
        {stage.n}
      </span>

      <h3 className="mt-5 text-[clamp(1.2rem,2.4vw,1.55rem)] font-medium leading-snug tracking-[-0.02em] text-ink">
        <span className="sr-only">{`ステップ ${stage.n}、`}</span>
        {stage.label}
      </h3>
      <p className="measure-jp mt-3 text-[0.95rem] text-muted">{stage.body}</p>
    </motion.div>
  );
}

/** Sits in a gap between the cards, pointing the way round. */
function Turn({
  icon,
  className,
}: {
  icon: string;
  className: string;
}) {
  return (
    <span
      aria-hidden
      className={`absolute z-10 hidden size-8 items-center justify-center rounded-full border border-line bg-canvas-alt text-mark-1 md:flex ${className}`}
    >
      <Icon name={icon} size={18} />
    </span>
  );
}

function GroupLabel({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <p
      className={`mb-7 flex items-center gap-2.5 text-[0.75rem] font-medium uppercase tracking-[0.16em] ${
        accent ? "text-mark-1" : "text-muted"
      }`}
    >
      {accent && (
        <span aria-hidden className="h-px w-6 shrink-0 bg-mark-1" />
      )}
      {children}
    </p>
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

      <div className="mt-14">
        <Reveal>
          <GroupLabel>生徒とAIのあいだ</GroupLabel>
        </Reveal>

        <div className="relative">
          <Turn icon="arrow_forward" className="left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2" />
          <Turn icon="arrow_downward" className="left-3/4 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <Turn icon="arrow_back" className="left-1/2 top-3/4 -translate-x-1/2 -translate-y-1/2" />

          <ol className="grid gap-5 md:auto-rows-fr md:grid-cols-2 md:gap-9">
            {BEFORE.map((stage, i) => (
              <li key={stage.n} className={CELL[i]}>
                <Step stage={stage} index={i} />
              </li>
            ))}
          </ol>
        </div>

        {/*
          The boundary, not a footnote. Everything above touches what the
          student wrote; only the summary passes below.
        */}
        <Reveal>
          <div className="my-2 flex items-center gap-4 rounded-2xl border border-dashed border-mark-1/40 bg-mark-1/[0.07] px-5 py-4 md:px-6 md:py-5">
            <Icon name="lock" size={20} className="shrink-0 text-mark-1" />
            <p className="text-[0.9rem] font-medium leading-snug text-ink md:text-[0.98rem]">
              日記の本文は、ここから先に渡りません。
            </p>
          </div>
        </Reveal>

        {/*
          The teacher half sits on a raised card. Rendered like the four
          steps above it, the destination read as just another item in the
          same list — but it is the other side of the boundary, and it is
          the only thing anyone outside the student ever sees.
        */}
        <div className="mt-12">
          <Reveal>
            <GroupLabel accent>教員に届くもの</GroupLabel>
          </Reveal>

          <ol>
            {AFTER.map((stage) => (
              <li key={stage.n}>
                <Step stage={stage} index={0} feature />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
