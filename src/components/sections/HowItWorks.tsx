"use client";

import { useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { Icon, Section, SectionTitle } from "@/components/ui";

type Stage = {
  n: string;
  label: string;
  body: string;
  /** Shown only on the stage where it matters. */
  note?: string;
};

const STAGES: Stage[] = [
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
    note: "本文は非公開",
  },
  {
    n: "05",
    label: "教員",
    body: "教員が受け取るのは、対応が必要な生徒を示す要点のみのレポートです。日記の本文そのものが公開されることはなく、教員の側に新しい業務が生まれることもありません。",
  },
];

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

  return (
    <Section id="how" alt>
      <Reveal>
        <SectionTitle accent="bg-mark-1">仕組み</SectionTitle>
      </Reveal>

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

      <Reveal>
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
                aria-controls={`how-panel-${i}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                className={`group cursor-pointer rounded-2xl border p-4 text-left transition-[translate,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[translate] md:p-5 ${
                  selected
                    ? "-translate-y-1.5 border-line-strong bg-surface shadow-[var(--shadow-card)]"
                    : "border-line bg-transparent hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface/60"
                }`}
              >
                {/*
                  One blue for all five. Selection is carried by the lift and
                  the surface behind it, so the number only has to vary in
                  weight — and hover brings it to full strength, which makes
                  the box feel live before you commit to it.
                */}
                <span
                  className={`block text-[1.375rem] font-semibold leading-none tabular-nums text-mark-1 transition-opacity duration-300 md:text-[1.625rem] ${
                    selected ? "opacity-100" : "opacity-55 group-hover:opacity-100"
                  }`}
                >
                  {s.n}
                </span>
                <span
                  className={`mt-3 block text-[0.85rem] leading-snug tracking-[-0.01em] transition-colors duration-300 md:text-[0.9rem] ${
                    selected ? "text-ink" : "text-muted group-hover:text-ink"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/*
          All five panels occupy one grid cell, so the cell is as tall as the
          longest of them and the boxes above never shift when you click. A
          fixed min-height could only ever be correct at one viewport width —
          this is right at every width, with no magic number.

          Inactive panels are `invisible`, not `hidden`: visibility:hidden
          still occupies its grid area, which is what does the sizing, and it
          is equally removed from the accessibility tree, which is what the
          tabs pattern requires.
        */}
        <div className="mt-10 grid">
          {STAGES.map((s, i) => {
            const selected = i === active;
            return (
              <div
                key={s.n}
                id={`how-panel-${i}`}
                role="tabpanel"
                aria-labelledby={`how-tab-${i}`}
                tabIndex={selected ? 0 : -1}
                style={{ gridArea: "1 / 1" }}
                className={`grid items-baseline gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr] ${
                  selected ? "" : "invisible"
                }`}
              >
                <p
                  aria-hidden
                  className="text-[clamp(3rem,8vw,5rem)] font-semibold leading-[0.8] tabular-nums text-mark-1"
                >
                  {s.n}
                </p>

                <div>
                  <h3 className="text-[clamp(1.375rem,3.2vw,2rem)] font-medium leading-snug tracking-[-0.02em] text-ink">
                    {s.label}
                  </h3>
                  <p className="measure-jp mt-3 max-w-xl text-[0.98rem] text-muted">
                    {s.body}
                  </p>
                  {s.note && (
                    <p className="mt-3 flex items-center gap-2 text-[0.85rem] text-mark-1">
                      <Icon name="lock" size={16} />
                      {s.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}
