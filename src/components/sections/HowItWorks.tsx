import { OrbitalTimeline, type OrbitalStage } from "@/components/OrbitalTimeline";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, Section } from "@/components/ui";

/**
 * The section's paragraph, one sentence per stage. Stages relate to their
 * immediate neighbours, so the panel's jump targets read as "previous /
 * next step" rather than an arbitrary graph.
 */
const STAGES: OrbitalStage[] = [
  {
    id: 1,
    n: "01",
    icon: "person",
    label: "生徒",
    body: "月に一度、ホームルームの時間に。",
    relatedIds: [2],
  },
  {
    id: 2,
    n: "02",
    icon: "forum",
    label: "30往復の対話",
    body: "生徒はAIと30往復ほどの自然な対話を行います。チャットのように、構えずに話せる設計です。",
    relatedIds: [1, 3],
  },
  {
    id: 3,
    n: "03",
    icon: "neurology",
    label: "AI解析",
    body: "会話に含まれる言葉のニュアンスや入力のためらいといった微細なシグナルから、AIが心理的リスクを検知します。",
    note: "（生のログは非公開）",
    relatedIds: [2, 4],
  },
  {
    id: 4,
    n: "04",
    icon: "summarize",
    label: "リスクレポート",
    body: "会話の内容そのものが教員に公開されることはありません。",
    relatedIds: [3, 5],
  },
  {
    id: 5,
    n: "05",
    icon: "school",
    label: "教員",
    body: "届くのは、対応が必要な生徒を示す要点のみのレポートです。",
    relatedIds: [4],
  },
];

export function HowItWorks() {
  return (
    <Section id="how" alt>
      <Reveal>
        <Eyebrow>仕組み</Eyebrow>
      </Reveal>

      <OrbitalTimeline stages={STAGES} />
    </Section>
  );
}
