import { OntologyGraph } from "@/components/OntologyGraph";
import { Reveal } from "@/components/Reveal";
import { SectionTitle, Lines, Section } from "@/components/ui";

export function Technology() {
  return (
    <Section id="technology" alt>
      <Reveal>
        <SectionTitle accent="bg-mark-1">テクノロジー</SectionTitle>
      </Reveal>

      <Reveal className="max-w-3xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          Blescは、言葉を予測するだけの汎用AIではありません。
        </p>
      </Reveal>

      <Reveal className="mt-8 max-w-2xl">
        <Lines className="measure-jp text-muted">
          {`「睡眠不足 → 認知機能の低下 → 抑うつ傾向」といった心理のつながりを、
WHOやNICEなど公開されている医学的ガイドラインをもとに構造化した
オントロジー知識グラフをAIに実装しています。`}
        </Lines>
      </Reveal>

      {/*
        Deliberately outside the 2xl measure the rest of the section reads in:
        the chain is the section's centrepiece now, not a margin note, so it
        takes the full container width.
      */}
      <div className="mt-12">
        <OntologyGraph />
      </div>

      {/*
        What this section may claim is bounded by `docs/claims.md`, and the
        bound is written rather than remembered: a named institution goes on
        this page only once its permission is on file. 京都大学 and
        株式会社Hatapro were both named here as settled collaborations while
        `sentra/docs/lp_claim_alignment.md` still recorded the collaborator
        line as 未記入 — an unagreed use of a university's name in B2B copy
        aimed at schools and boards of education. They come back the day the
        permission does.

        What replaces them is the part that is checkable today: three curated
        subgraphs, 40 nodes and 50 edges, every one carrying a source id, and
        the ones that carry none saying so.
      */}
      <Reveal className="mt-12 max-w-2xl">
        <Lines className="measure-jp text-muted">
          {`グラフは社内でキュレーションしています。ノードと関係のひとつずつに出典を紐づけ、
出典を示せないものは専門家の判断であることを明記しています。
現在は睡眠・社会的ひきこもり・学業上の負荷の3領域を整備しており、
臨床の専門家によるレビューを準備しています。`}
        </Lines>
      </Reveal>
    </Section>
  );
}
