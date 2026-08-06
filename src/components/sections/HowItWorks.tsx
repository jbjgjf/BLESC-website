"use client";

import { useMemo, useState } from "react";
import {
  CircularCarousel,
  type CarouselItem,
} from "@/components/CircularCarousel";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Icon, Lines, Section, SectionTitle } from "@/components/ui";

type Stage = {
  n: string;
  label: string;
  body: string;
  /** Shown only on the stage where it matters. */
  note?: string;
  /** Full class name — Tailwind scans source text, so no interpolation. */
  text: string;
};

/**
 * The section's own explanation, verbatim from the brief.
 *
 * This was dropped when the flow became a carousel, which left the five
 * stage fragments as the only account of how any of it works — and those are
 * read one at a time, so the sequence never appeared as a whole. The brief
 * always specified prose first and the diagram after it.
 */
const LEAD = [
  `月に一度、ホームルームの時間に、生徒はAIと30往復ほどの
自然な対話を行います。チャットのように、構えずに話せる設計です。`,
  `会話に含まれる言葉のニュアンスや入力のためらいといった
微細なシグナルから、AIが心理的リスクを検知します。`,
  `会話の内容そのものが教員に公開されることはありません。
届くのは、対応が必要な生徒を示す要点のみのレポートです。`,
];

/**
 * One line per stage, condensed from the copy above rather than repeating it.
 *
 * Two were wrong before: 01 gave a time and never said what happens, and 04
 * and 05 were swapped — the report step described what teachers *cannot* see
 * while the teacher step described the report. The privacy line now sits at
 * the point of delivery, which is where it means something.
 */
const STAGES: Stage[] = [
  {
    n: "01",
    label: "生徒",
    body: "月に一度、ホームルームの時間に実施します。全生徒が対象です。",
    text: "text-mark-1",
  },
  {
    n: "02",
    label: "30往復の対話",
    body: "AIと30往復ほどの自然な対話。チャットのように、構えずに話せる設計です。",
    text: "text-mark-2",
  },
  {
    n: "03",
    label: "AI解析",
    body: "言葉のニュアンスや入力のためらいといった微細なシグナルから、心理的リスクを検知します。",
    note: "生のログは非公開",
    text: "text-mark-3",
  },
  {
    n: "04",
    label: "リスクレポート",
    body: "対応が必要な生徒を示す、要点のみのレポートが生成されます。",
    text: "text-mark-1",
  },
  {
    n: "05",
    label: "教員",
    body: "教員が受け取るのはこのレポートだけ。会話の内容そのものが公開されることはありません。",
    text: "text-mark-2",
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);

  // Stable identity so the carousel isn't handed a new array every render.
  const items = useMemo<CarouselItem[]>(
    () =>
      STAGES.map((s, i) => ({
        id: String(i),
        title: s.label,
        description: s.body,
      })),
    [],
  );

  const stage = STAGES[active];

  return (
    <Section id="how" alt>
      <Reveal>
        <SectionTitle accent="bg-mark-1">仕組み</SectionTitle>
      </Reveal>

      {/*
        Reads top to bottom without touching anything. The deck below walks
        the same flow stage by stage, but nobody should have to click five
        times to find out what the product does.
      */}
      <Stagger className="max-w-2xl space-y-6" stagger={0.1}>
        {LEAD.map((text, i) => (
          <RevealItem key={i}>
            <Lines className="measure-jp text-muted">{text}</Lines>
          </RevealItem>
        ))}
      </Stagger>

      {/*
        The cards carry every stage's title and body in the markup, so this
        list exists for the no-script reading order — the noscript rule in the
        root layout promotes it to visible copy.
      */}
      <ol className="stage-fallback sr-only">
        {STAGES.map((s) => (
          <li key={s.n}>
            <h3>{`${s.n} ${s.label}`}</h3>
            <p>{s.body}</p>
            {s.note && <p>{s.note}</p>}
          </li>
        ))}
      </ol>

      {/*
        Readout. The step number is the section's anchor, so it gets real
        size here rather than the 7%-opacity watermark it used to be behind
        the deck — and the body and privacy note come with it, which is what
        lets every card shrink to just its label.
      */}
      <div className="mt-16 grid items-baseline gap-x-8 gap-y-4 border-t border-line pt-12 sm:grid-cols-[auto_1fr]">
        <p
          aria-hidden
          className={`text-[clamp(3.5rem,9vw,6rem)] font-semibold leading-[0.8] tabular-nums ${stage.text}`}
        >
          {stage.n}
        </p>

        <div aria-live="polite" aria-atomic="true" className="min-h-[7rem]">
          <h3 className="text-[clamp(1.5rem,3.6vw,2.25rem)] font-medium leading-snug tracking-[-0.02em] text-ink">
            <span className="sr-only">{`ステップ ${stage.n}、`}</span>
            {stage.label}
          </h3>
          <p className="measure-jp mt-3 max-w-xl text-[0.98rem] text-muted">
            {stage.body}
          </p>
          {stage.note && (
            <p className="mt-3 flex items-center gap-2 text-[0.85rem] text-mark-1">
              <Icon name="lock" size={16} />
              {stage.note}
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 md:mt-16">
        <CircularCarousel
          items={items}
          activeIndex={active}
          onActiveChange={setActive}
        />
      </div>
    </Section>
  );
}
