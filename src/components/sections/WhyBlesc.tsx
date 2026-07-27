import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Eyebrow, Icon, Section } from "@/components/ui";

const ITEMS = [
  {
    n: "01",
    icon: "lock",
    title: "心理的安全性",
    body: "チャットログは完全に非公開。見られる不安がないからこそ、生徒は本音を語れます。",
  },
  {
    n: "02",
    icon: "notifications_active",
    title: "早期検知",
    body: "孤立する前に、隠れたリスクを自動でアラート。教員の追加業務は発生しません。",
  },
  {
    n: "03",
    icon: "diversity_3",
    title: "全生徒をカバー",
    body: "学校インフラ上で稼働するため、任意ダウンロードに依存せず、全生徒にリーチします。",
  },
  {
    n: "04",
    icon: "science",
    title: "科学的な裏付け",
    body: "医学研究にもとづくモデルが、解析に厳密な根拠を与えます。",
  },
] as const;

/** 2×2 on desktop, stacked on mobile. Rules, not cards. */
export function WhyBlesc() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Why Blesc</Eyebrow>
      </Reveal>

      <Stagger
        className="mt-4 grid grid-cols-1 gap-x-16 md:grid-cols-2"
        stagger={0.1}
      >
        {ITEMS.map((item) => (
          <RevealItem key={item.n}>
            <div className="h-full border-t border-line py-12 md:py-14">
              <Icon name={item.icon} size={26} className="text-muted" />
              <h3 className="mt-6 flex items-baseline gap-3 text-xl font-medium tracking-[-0.01em] text-ink">
                <span className="text-[0.8rem] font-normal tabular-nums text-muted">
                  {item.n} /
                </span>
                {item.title}
              </h3>
              <p className="measure-jp mt-4 max-w-md text-[0.95rem] text-muted">
                {item.body}
              </p>
            </div>
          </RevealItem>
        ))}
      </Stagger>
    </Section>
  );
}
