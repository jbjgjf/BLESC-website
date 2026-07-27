import { RevealItem, Reveal, Stagger } from "@/components/Reveal";
import { Eyebrow, Icon, Section } from "@/components/ui";

const ITEMS = [
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
] as const;

/** Flat list separated by hairline rules — deliberately not cards. */
export function Limitations() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>構造的な限界</Eyebrow>
      </Reveal>

      <Stagger className="mt-4" stagger={0.1}>
        {ITEMS.map((item) => (
          <RevealItem key={item.title}>
            <div className="flex items-start gap-6 border-t border-line py-12 md:gap-10 md:py-16">
              <Icon
                name={item.icon}
                size={26}
                className="mt-1 shrink-0 text-muted"
              />
              <div className="max-w-2xl">
                <h3 className="text-xl font-medium leading-snug tracking-[-0.01em] text-ink md:text-2xl">
                  {item.title}
                </h3>
                <p className="measure-jp mt-4 text-[0.95rem] text-muted md:text-base">
                  {item.body}
                </p>
              </div>
            </div>
          </RevealItem>
        ))}
      </Stagger>
    </Section>
  );
}
