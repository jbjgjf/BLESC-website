import { FIGURES, type FigureName } from "@/components/LimitationFigures";
import { Reveal } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

type Limitation = {
  n: string;
  figure: FigureName;
  title: string;
  body: string;
  /** Full class names — Tailwind scans source text, so no interpolation. */
  text: string;
  bar: string;
};

const ITEMS: Limitation[] = [
  {
    n: "01",
    figure: "survey",
    title: "アンケートでは本音が表れない。",
    body: "「はい／いいえ」形式では、生徒は大人が望む無難な回答を選びます。",
    text: "text-mark-1",
    bar: "bg-mark-1",
  },
  {
    n: "02",
    figure: "withdrawal",
    title: "深刻なケースほど見えなくなる。",
    body: "追い詰められた生徒ほど周囲を拒み、孤立します。SOSを待つ仕組みでは間に合いません。",
    text: "text-mark-2",
    bar: "bg-mark-2",
  },
  {
    n: "03",
    figure: "capacity",
    title: "教員のリソースには限界がある。",
    body: "40名を一人ひとり見守り、心の機微まで捉えることは現実的ではありません。",
    text: "text-mark-3",
    bar: "bg-mark-3",
  },
];

/**
 * Three editorial rows: copy on one side, a drawn figure on the other,
 * alternating which side each lands on.
 *
 * Replaces a panel of three identical icon-and-paragraph rows. That layout
 * repeated the same shape three times, which is what made it read as
 * generated — the variation here is the point, not decoration.
 */
export function Limitations() {
  return (
    <Section>
      <Reveal>
        <SectionTitle accent="bg-mark-2">構造的な限界</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink">
          なぜ、これまでの方法では気づけないのか。
        </p>
      </Reveal>

      <div className="mt-20 flex flex-col gap-24 md:gap-32">
        {ITEMS.map((item, i) => {
          const Figure = FIGURES[item.figure];
          const flipped = i % 2 === 1;

          return (
            <Reveal key={item.n}>
              <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
                <div className={flipped ? "md:order-2" : ""}>
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`text-[clamp(2.5rem,5vw,3.75rem)] font-semibold leading-none tabular-nums ${item.text}`}
                    >
                      {item.n}
                    </span>
                    <span
                      aria-hidden
                      className={`h-px flex-1 ${item.bar} opacity-40`}
                    />
                  </div>

                  <h3 className="mt-7 text-[clamp(1.35rem,2.6vw,1.9rem)] font-medium leading-[1.4] tracking-[-0.02em] text-ink">
                    {item.title}
                  </h3>
                  <p className="measure-jp mt-5 max-w-md text-[0.98rem] text-muted">
                    {item.body}
                  </p>
                </div>

                <div className={flipped ? "md:order-1" : ""}>
                  <Figure
                    className={`w-full ${item.text} opacity-90`}
                  />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
