import { FlowDiagram } from "@/components/FlowDiagram";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Eyebrow, Lines, Section } from "@/components/ui";

export function HowItWorks() {
  return (
    <Section id="how" alt>
      <Reveal>
        <Eyebrow>仕組み</Eyebrow>
      </Reveal>

      <Stagger className="max-w-2xl space-y-8" stagger={0.12}>
        <RevealItem>
          <Lines className="measure-jp text-ink">
            {`月に一度、ホームルームの時間に、生徒はAIと30往復ほどの
自然な対話を行います。チャットのように、構えずに話せる設計です。`}
          </Lines>
        </RevealItem>
        <RevealItem>
          <Lines className="measure-jp text-muted">
            {`会話に含まれる言葉のニュアンスや入力のためらいといった
微細なシグナルから、AIが心理的リスクを検知します。`}
          </Lines>
        </RevealItem>
        <RevealItem>
          <Lines className="measure-jp text-muted">
            {`会話の内容そのものが教員に公開されることはありません。
届くのは、対応が必要な生徒を示す要点のみのレポートです。`}
          </Lines>
        </RevealItem>
      </Stagger>

      <div className="mt-24 border-t border-line pt-20">
        <FlowDiagram />
      </div>
    </Section>
  );
}
