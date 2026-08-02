import { Reveal } from "@/components/Reveal";
import { StatementList, type Statement } from "@/components/StatementList";
import { SectionTitle, Section } from "@/components/ui";

const ITEMS: Statement[] = [
  {
    icon: "quiz",
    title: "アンケートでは本音が表れない。",
    body: "「はい／いいえ」形式では、生徒は大人が望む無難な回答を選びます。",
  },
  {
    icon: "visibility_off",
    title: "深刻なケースほど見えなくなる。",
    body: "追い詰められた生徒ほど周囲を拒み、孤立します。SOSを待つ仕組みでは間に合いません。",
  },
  {
    icon: "groups",
    title: "教員のリソースには限界がある。",
    body: "40名を一人ひとり見守り、心の機微まで捉えることは現実的ではありません。",
  },
];

// NEW COPY — not from the brief. The panel header needs a title, and this
// frames the three limitations as the question the 仕組み section answers,
// which is where the header arrow points.
const HEADING = "なぜ、これまでの方法では気づけないのか。";

export function Limitations() {
  return (
    <Section>
      <Reveal>
        <SectionTitle accent="bg-mark-2">構造的な限界</SectionTitle>
      </Reveal>

      <div className="mt-4">
        <StatementList
          title={HEADING}
          items={ITEMS}
          href="#how"
          hrefLabel="仕組みのセクションへ移動する"
        />
      </div>
    </Section>
  );
}
