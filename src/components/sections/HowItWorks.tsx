"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CircularCarousel,
  type CarouselItem,
} from "@/components/CircularCarousel";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/TiltCard";
import { Icon, Section, SectionTitle } from "@/components/ui";

type Stage = {
  n: string;
  icon: string;
  label: string;
  body: string;
  /** Shown only on the stage where it matters. */
  note?: string;
  /** Drop a file in /public and point at it; the well shows until then. */
  image?: { src: string; alt: string };
  /** Full class name — Tailwind scans source text, so no interpolation. */
  text: string;
};

/** The section's paragraph, one sentence per stage. */
const STAGES: Stage[] = [
  {
    n: "01",
    icon: "person",
    label: "生徒",
    body: "月に一度、ホームルームの時間に。",
    text: "text-mark-1",
  },
  {
    n: "02",
    icon: "forum",
    label: "30往復の対話",
    body: "生徒はAIと30往復ほどの自然な対話を行います。チャットのように、構えずに話せる設計です。",
    text: "text-mark-2",
  },
  {
    n: "03",
    icon: "neurology",
    label: "AI解析",
    body: "会話に含まれる言葉のニュアンスや入力のためらいといった微細なシグナルから、AIが心理的リスクを検知します。",
    note: "（生のログは非公開）",
    text: "text-mark-3",
  },
  {
    n: "04",
    icon: "summarize",
    label: "リスクレポート",
    body: "会話の内容そのものが教員に公開されることはありません。",
    text: "text-mark-1",
  },
  {
    n: "05",
    icon: "school",
    label: "教員",
    body: "届くのは、対応が必要な生徒を示す要点のみのレポートです。",
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
        tag: s.n,
        title: s.label,
        description: s.body,
        text: s.text,
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
        The carousel puts all five titles and bodies in the markup, so this
        list exists only for the pieces it cannot carry — the privacy note —
        and to give a linear reading order when scripting is off, which the
        noscript rule in the root layout promotes to visible copy.
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

      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
        <CircularCarousel
          items={items}
          activeIndex={active}
          onActiveChange={setActive}
        />

        <div className="w-full">
          <TiltCard className="border border-line bg-surface p-7 shadow-[var(--shadow-card)] md:p-8">
            <div className="flex items-center gap-3">
              <span
                className={`flex size-11 items-center justify-center rounded-full bg-canvas-alt ${stage.text}`}
              >
                <Icon name={stage.icon} size={22} />
              </span>
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">
                ステップ {stage.n} / {String(STAGES.length).padStart(2, "0")}
              </p>
            </div>

            <h3 className="mt-5 text-xl font-medium tracking-[-0.01em] text-ink">
              {stage.label}
            </h3>
            <p className="measure-jp mt-4 text-[0.95rem] text-muted">
              {stage.body}
            </p>

            {stage.image ? (
              <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl border border-line bg-canvas-alt">
                <Image
                  src={stage.image.src}
                  alt={stage.image.alt}
                  fill
                  sizes="(min-width: 1024px) 30rem, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="mt-6 flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-canvas-alt">
                <Icon
                  name="add_photo_alternate"
                  size={26}
                  className={stage.text}
                />
                <p className="text-[0.75rem] text-muted">
                  {stage.label} — モックアップ / 写真
                </p>
              </div>
            )}

            {stage.note && (
              <p className="mt-5 flex items-center gap-2 text-[0.85rem] text-muted">
                <Icon name="lock" size={16} className="text-mark-1" />
                {stage.note}
              </p>
            )}
          </TiltCard>
        </div>
      </div>
    </Section>
  );
}
