"use client";

import { useMemo } from "react";
import {
  CircularCarousel,
  type CarouselItem,
} from "@/components/CircularCarousel";
import { Reveal } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

type Stage = {
  n: string;
  label: string;
  body: string;
  /** Shown only on the stage where it matters. */
  note?: string;
  /** Full class name — Tailwind scans source text, so no interpolation. */
  text: string;
};

/** The section's paragraph, one sentence per stage. */
const STAGES: Stage[] = [
  {
    n: "01",
    label: "生徒",
    body: "月に一度、ホームルームの時間に。",
    text: "text-mark-1",
  },
  {
    n: "02",
    label: "30往復の対話",
    body: "生徒はAIと30往復ほどの自然な対話を行います。チャットのように、構えずに話せる設計です。",
    text: "text-mark-2",
  },
  {
    n: "03",
    label: "AI解析",
    body: "会話に含まれる言葉のニュアンスや入力のためらいといった微細なシグナルから、AIが心理的リスクを検知します。",
    note: "生のログは非公開",
    text: "text-mark-3",
  },
  {
    n: "04",
    label: "リスクレポート",
    body: "会話の内容そのものが教員に公開されることはありません。",
    text: "text-mark-1",
  },
  {
    n: "05",
    label: "教員",
    body: "届くのは、対応が必要な生徒を示す要点のみのレポートです。",
    text: "text-mark-2",
  },
];

export function HowItWorks() {
  // Stable identity so the carousel isn't handed a new array every render.
  const items = useMemo<CarouselItem[]>(
    () =>
      STAGES.map((s, i) => ({
        id: String(i),
        tag: s.n,
        title: s.label,
        description: s.body,
        note: s.note,
        text: s.text,
      })),
    [],
  );

  return (
    <Section id="how" alt>
      <Reveal>
        <SectionTitle accent="bg-mark-1">仕組み</SectionTitle>
      </Reveal>

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

      <div className="mt-6 md:mt-10">
        <CircularCarousel items={items} />
      </div>
    </Section>
  );
}
