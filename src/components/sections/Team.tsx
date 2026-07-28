"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CircularGallery, type GalleryItem } from "@/components/CircularGallery";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Icon, Section } from "@/components/ui";
import { initialsCard } from "@/lib/initialsCard";

/**
 * PLACEHOLDER ROSTER — every name, role and description here is invented.
 * 山田太郎 / 山田花子 are Japan's standard stand-in names, the equivalent of
 * "John Doe". The descriptions are generic role summaries, not statements
 * about real people. Replace the whole array, and drop real headshots into
 * /public with a `photo` field, before this page goes anywhere public.
 */
const MEMBERS = [
  {
    name: "山田 太郎",
    initials: "YT",
    role: "代表取締役 / CEO",
    description: "事業全体の方針と、教育委員会・学校法人との連携を統括。",
  },
  {
    name: "山田 花子",
    initials: "YH",
    role: "CTO",
    description: "対話エンジンと解析基盤の設計、および技術組織の運営を担当。",
  },
  {
    name: "鈴木 一郎",
    initials: "SI",
    role: "リサーチ",
    description: "臨床心理学の知見をモデルへ落とし込む研究設計を担当。",
  },
  {
    name: "佐藤 次郎",
    initials: "SJ",
    role: "プロダクト",
    description: "生徒が構えずに話せる対話体験の設計と検証を担当。",
  },
  {
    name: "高橋 三郎",
    initials: "TS",
    role: "パートナーシップ",
    description: "学校現場での導入プロセスと、運用サポート体制を構築。",
  },
  {
    name: "田中 四郎",
    initials: "TS",
    role: "機械学習",
    description: "オントロジー知識グラフの構築と、リスク検知モデルの改善。",
  },
  {
    name: "伊藤 五郎",
    initials: "IG",
    role: "データ基盤",
    description: "生徒データの保護要件を満たすインフラと権限設計を担当。",
  },
  {
    name: "渡辺 六子",
    initials: "WR",
    role: "デザイン",
    description: "プロダクトとコミュニケーション全体のデザインを担当。",
  },
  {
    name: "中村 七海",
    initials: "NN",
    role: "カスタマーサクセス",
    description: "導入後の運用伴走と、教員向けの研修プログラムを担当。",
  },
  {
    name: "小林 八郎",
    initials: "KH",
    role: "コーポレート",
    description: "法務・労務・情報セキュリティ体制の整備を担当。",
  },
] as const;

export function Team() {
  const [active, setActive] = useState(0);
  const stepRef = useRef<((delta: number) => void) | null>(null);

  // Stable identity: a new array each render would tear down the WebGL scene.
  const items = useMemo<GalleryItem[]>(
    () =>
      MEMBERS.map((m, i) => ({
        image: initialsCard(m.initials, i),
        text: m.name,
      })),
    [],
  );

  const onReady = useCallback(
    (api: { step: (delta: number) => void }) => {
      stepRef.current = api.step;
    },
    [],
  );

  const person = MEMBERS[active];

  return (
    <Section id="team" alt>
      <Reveal>
        <Eyebrow>チーム</Eyebrow>
      </Reveal>

      <div className="relative h-[420px] w-full md:h-[540px]">
        <CircularGallery
          items={items}
          bend={3}
          borderRadius={0.06}
          scrollEase={0.04}
          onActiveChange={setActive}
          onReady={onReady}
        />
      </div>

      {/*
        The gallery is pixels, so this panel is where the centred person
        actually exists as text. aria-live announces the change as the
        carousel moves.
      */}
      <div className="mx-auto mt-8 max-w-xl text-center">
        <div aria-live="polite" aria-atomic="true" className="min-h-[8.5rem]">
          <p className="text-xl font-medium tracking-[-0.01em] text-ink">
            {person.name}
          </p>
          <p className="mt-2 text-[0.9rem] text-accent">{person.role}</p>
          <p className="measure-jp mt-4 text-[0.95rem] text-muted">
            {person.description}
          </p>
        </div>

        {/*
          Dragging a canvas is not a keyboard-operable control, so these are
          the actual way through the roster without a mouse.
        */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => stepRef.current?.(-1)}
            aria-label="前のメンバーを表示"
            className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:border-ink/40 hover:text-ink"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <p className="text-[0.8rem] tabular-nums text-muted">
            {active + 1} / {MEMBERS.length}
          </p>
          <button
            type="button"
            onClick={() => stepRef.current?.(1)}
            aria-label="次のメンバーを表示"
            className="flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-muted transition-[color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] hover:border-ink/40 hover:text-ink"
          >
            <Icon name="arrow_forward" size={20} />
          </button>
        </div>
      </div>

      {/*
        Only the centred person is in the visible DOM, and the other nine sit
        inside a canvas a screen reader cannot reach or drag. The full roster
        stays in the markup here so every member is readable and indexable.
      */}
      <ul className="sr-only">
        {MEMBERS.map((m) => (
          <li key={m.name}>
            <h3>{m.name}</h3>
            <p>{m.role}</p>
            <p>{m.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
