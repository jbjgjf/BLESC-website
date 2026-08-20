"use client";

import { useRef, useState } from "react";
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
 * The section's own explanation, verbatim in structure from the brief but
 * rewritten for the diary model: the student writes rather than talks.
 *
 * This reads top to bottom without touching anything. The five stages below
 * walk the same flow one at a time, but nobody should have to click five
 * times to find out what the product does.
 */
const LEAD = [
  `毎日5分、ホームルームの時間に、生徒は短い日記を書きます。
誰かに読ませるための文章ではなく、自分のための記録です。`,
  `独自のAIが書かれた内容を深掘りし、言葉のニュアンスや
書くことをためらった間といった微細なシグナルから、心理的リスクを検知します。`,
  `日記の本文そのものが教員に公開されることはありません。
届くのは、対応が必要な生徒を示す要点のみのレポートです。`,
];

const STAGES: Stage[] = [
  {
    n: "01",
    label: "生徒",
    body: "毎日5分、ホームルームの時間に実施します。全生徒が対象です。",
    text: "text-mark-1",
  },
  {
    n: "02",
    label: "日記を書く",
    body: "その日にあったことを5分で綴ります。書く内容も長さも自由です。",
    text: "text-mark-2",
  },
  {
    n: "03",
    label: "AIが深掘り",
    body: "独自のAIが日記の内容に問いを返し、言葉の奥にあるサインまで引き出します。",
    text: "text-mark-3",
  },
  {
    n: "04",
    label: "リスク解析",
    body: "言葉のニュアンスや書きためらいといった微細なシグナルから、心理的リスクを検知します。",
    note: "本文は非公開",
    text: "text-mark-1",
  },
  {
    n: "05",
    label: "教員",
    body: "教員が受け取るのはこのレポートだけ。日記の本文が公開されることはありません。",
    text: "text-mark-2",
  },
];

const PANEL_ID = "how-panel";

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /*
   * Arrow keys move between tabs, per the WAI-ARIA tabs pattern. Combined
   * with the roving tabindex below this means one Tab stop for the whole
   * group rather than five, and the arrows do the walking.
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = STAGES.length - 1;
    let next: number | null = null;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = active === last ? 0 : active + 1;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = active === 0 ? last : active - 1;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = last;
    }

    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const stage = STAGES[active];

  return (
    <Section id="how" alt>
      <Reveal>
        <SectionTitle accent="bg-mark-1">仕組み</SectionTitle>
      </Reveal>

      <Stagger className="max-w-2xl space-y-5" stagger={0.1}>
        {LEAD.map((text, i) => (
          <RevealItem key={i}>
            <Lines className="measure-jp text-muted">{text}</Lines>
          </RevealItem>
        ))}
      </Stagger>

      {/*
        The panel below carries only the selected stage, so this list is what
        keeps all five in the markup — for the no-script reading order, which
        the noscript rule in the root layout promotes to visible copy, and
        for indexing.
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

      <Reveal className="mt-12">
        <div
          role="tablist"
          aria-label="仕組みのステップ"
          onKeyDown={onKeyDown}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
        >
          {STAGES.map((s, i) => {
            const selected = i === active;
            return (
              <button
                key={s.n}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`how-tab-${i}`}
                aria-selected={selected}
                aria-controls={PANEL_ID}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                className={`rounded-2xl border p-4 text-left transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:p-5 ${
                  selected
                    ? "border-line-strong bg-surface"
                    : "border-line bg-transparent hover:bg-surface/60"
                }`}
              >
                <span
                  className={`block text-[1.375rem] font-semibold leading-none tabular-nums md:text-[1.625rem] ${
                    selected ? s.text : "text-muted"
                  }`}
                >
                  {s.n}
                </span>
                <span
                  className={`mt-3 block text-[0.85rem] leading-snug tracking-[-0.01em] md:text-[0.9rem] ${
                    selected ? "text-ink" : "text-muted"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/*
          min-h stops the section resizing as you click between stages of
          different copy lengths — the boxes above would otherwise shift
          under the cursor.
        */}
        <div
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={`how-tab-${active}`}
          tabIndex={0}
          className="mt-10 grid items-baseline gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr]"
        >
          <p
            aria-hidden
            className={`text-[clamp(3rem,8vw,5rem)] font-semibold leading-[0.8] tabular-nums ${stage.text}`}
          >
            {stage.n}
          </p>

          <div className="min-h-[6.5rem]">
            <h3 className="text-[clamp(1.375rem,3.2vw,2rem)] font-medium leading-snug tracking-[-0.02em] text-ink">
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
      </Reveal>
    </Section>
  );
}
