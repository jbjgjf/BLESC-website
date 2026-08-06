import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

const ITEMS = [
  {
    n: "01",
    title: "心理的安全性",
    body: "チャットログは完全に非公開。見られる不安がないからこそ、生徒は本音を語れます。",
    text: "text-mark-1",
  },
  {
    n: "02",
    title: "早期検知",
    body: "孤立する前に、隠れたリスクを自動でアラート。教員の追加業務は発生しません。",
    text: "text-mark-2",
  },
  {
    n: "03",
    title: "全生徒をカバー",
    body: "学校インフラ上で稼働するため、任意ダウンロードに依存せず、全生徒にリーチします。",
    text: "text-mark-3",
  },
  {
    n: "04",
    title: "科学的な裏付け",
    body: "医学研究にもとづくモデルが、解析に厳密な根拠を与えます。",
    text: "text-mark-1",
  },
] as const;

/**
 * A numbered index: hanging numeral, title, copy.
 *
 * Was a 2×2 grid of identical rounded, shadowed, cursor-tilting panels — the
 * same shape four times, which is exactly the layout that reads as generated.
 * Then rules and a margin icon; both are gone now too, so separation comes
 * from whitespace and the numeral alone. Nothing here is a container.
 *
 * Kept structurally distinct from 構造的な限界, which alternates copy against
 * drawn figures — two adjacent sections sharing one layout would just move
 * the sameness rather than fix it.
 */
export function WhyBlesc() {
  return (
    <Section alt>
      <Reveal>
        <SectionTitle accent="bg-mark-3">Why Blesc</SectionTitle>
      </Reveal>

      {/* Gap does the separating the rules used to, so it has to be wider. */}
      <Stagger className="mt-4 flex flex-col gap-16 md:gap-20" stagger={0.1}>
        {ITEMS.map((item) => (
          <RevealItem key={item.n}>
            <div className="grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-4 md:gap-x-12">
              <span
                className={`text-[clamp(2.5rem,5.5vw,4rem)] font-semibold leading-[0.82] tabular-nums ${item.text}`}
              >
                {item.n}
              </span>

              <div className="max-w-xl">
                <h3 className="text-[clamp(1.3rem,2.4vw,1.75rem)] font-medium leading-snug tracking-[-0.02em] text-ink">
                  {item.title}
                </h3>
                <p className="measure-jp mt-4 text-[0.98rem] text-muted">
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
