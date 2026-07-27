import { CausalChain } from "@/components/CausalChain";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Eyebrow, Lines, Section } from "@/components/ui";

export function Technology() {
  return (
    <Section id="technology" alt>
      <Reveal>
        <Eyebrow>テクノロジー</Eyebrow>
      </Reveal>

      <Reveal className="max-w-3xl">
        <h2 className="text-[clamp(1.5rem,3.4vw,2.25rem)] font-medium leading-[1.45] tracking-[-0.02em] text-ink">
          Blescは、言葉を予測するだけの汎用AIではありません。
        </h2>
      </Reveal>

      <Stagger className="mt-14 max-w-2xl space-y-8" stagger={0.12}>
        <RevealItem>
          <Lines className="measure-jp text-muted">
            {`「睡眠不足 → 認知機能の低下 → 抑うつ傾向」といった心理の因果連鎖を、
医学的研究にもとづいて構造化したオントロジー知識グラフをAIに実装しています。
これは、臨床心理士の思考プロセスを機械可読な形で再現する仕組みです。`}
          </Lines>
        </RevealItem>

        <RevealItem>
          <div className="py-6">
            <CausalChain />
          </div>
        </RevealItem>

        <RevealItem>
          <Lines className="measure-jp text-muted">
            {`このモデルは京都大学の臨床心理学研究との協働によって開発しています。
プラットフォーム基盤は、学校環境の要件に耐えうるスケーラブルな設計を、
株式会社Hataproとの連携で構築しています。`}
          </Lines>
        </RevealItem>
      </Stagger>
    </Section>
  );
}
