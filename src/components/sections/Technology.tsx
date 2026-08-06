import { CausalChain } from "@/components/CausalChain";
import { Reveal } from "@/components/Reveal";
import { SectionTitle, Lines, Section } from "@/components/ui";

export function Technology() {
  return (
    <Section id="technology">
      <Reveal>
        <SectionTitle accent="bg-mark-1">テクノロジー</SectionTitle>
      </Reveal>

      <Reveal className="max-w-3xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          Blescは、言葉を予測するだけの汎用AIではありません。
        </p>
      </Reveal>

      <Reveal className="mt-12 max-w-2xl">
        <Lines className="measure-jp text-muted">
          {`「睡眠不足 → 認知機能の低下 → 抑うつ傾向」といった心理の因果連鎖を、
医学的研究にもとづいて構造化したオントロジー知識グラフをAIに実装しています。
これは、臨床心理士の思考プロセスを機械可読な形で再現する仕組みです。`}
        </Lines>
      </Reveal>

      {/*
        Deliberately outside the 2xl measure the rest of the section reads in:
        the chain is the section's centrepiece now, not a margin note, so it
        takes the full container width.
      */}
      <div className="mt-14">
        <CausalChain />
      </div>

      <Reveal className="mt-16 max-w-2xl">
        <Lines className="measure-jp text-muted">
          {`このモデルは京都大学の臨床心理学研究との協働によって開発しています。
プラットフォーム基盤は、学校環境の要件に耐えうるスケーラブルな設計を、
株式会社Hataproとの連携で構築しています。`}
        </Lines>
      </Reveal>
    </Section>
  );
}
