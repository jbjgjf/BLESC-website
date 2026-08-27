import Image from "next/image";
import { FIGURES, type FigureName } from "@/components/LimitationFigures";
import { Reveal } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

/**
 * The photographs are in. Set false to fall back to the drawn figures,
 * which are still exported from LimitationFigures.
 *
 * 02 and 03 arrived as 3652x1120 panoramas and were centre-cropped to the
 * 4:3 this slot expects — 02 keeps the doorframe and the figure down the
 * corridor, 03 keeps the central aisle. All three were re-encoded, which
 * took 5MB down to 460KB.
 */
const PHOTOS_READY = true;

type Limitation = {
  n: string;
  figure: FigureName;
  /** 4:3, matching the drawn figure it replaces. */
  photo: string;
  title: string;
  body: string;
  /** Full class names — Tailwind scans source text, so no interpolation. */
  text: string;
  dot: string;
};

const ITEMS: Limitation[] = [
  {
    n: "01",
    figure: "survey",
    photo: "/photos/limitation-01.jpg",
    title: "アンケートでは本音が表れない。",
    body: "「はい／いいえ」形式では、生徒は大人が望む無難な回答を選びます。設問が用意された時点で、答えの範囲も決まってしまいます。",
    text: "text-mark-1",
    dot: "bg-mark-1",
  },
  {
    n: "02",
    figure: "withdrawal",
    photo: "/photos/limitation-02.jpg",
    title: "深刻なケースほど見えなくなる。",
    body: "追い詰められた生徒ほど周囲を拒み、孤立します。SOSを待つ仕組みでは間に合いません。",
    text: "text-mark-2",
    dot: "bg-mark-2",
  },
  {
    n: "03",
    figure: "capacity",
    photo: "/photos/limitation-03.jpg",
    title: "教員のリソースには限界がある。",
    body: "40名を一人ひとり見守り、心の機微まで捉えることは現実的ではありません。教員の熱意ではなく、構造の問題です。",
    text: "text-mark-3",
    dot: "bg-mark-3",
  },
];

/**
 * A pile of panels rather than a cross-fade.
 *
 * Each panel sticks one header-height lower than the one before, so as you
 * scroll it slides up and halts just under the previous panel's header. The
 * headers accumulate at the top and stay readable, which the cross-fade this
 * replaces could not do — there, only one item existed at a time and the two
 * you were not looking at left no trace.
 *
 * Three things make it work. Each panel is opaque, so it occludes the body
 * of the one behind while leaving its header showing. The photograph starts
 * at the panel's top edge, so a covered panel keeps a sliver of its own
 * image inside the header band. And the wrapper carries trailing padding,
 * without which the last panel — whose bottom is the wrapper's bottom — has
 * no room to stick and would simply scroll past.
 *
 * It is CSS position: sticky throughout: no scroll listener, no measurement,
 * nothing to keep in sync, and it degrades to a plain stack of rows if
 * sticky is unsupported.
 */
function Panel({ item, index }: { item: Limitation; index: number }) {
  const Figure = FIGURES[item.figure];

  return (
    <div
      className="sticky flex flex-col"
      style={{
        top: `calc(var(--stack-top) + ${index} * var(--stack-header))`,
        minHeight: `calc(var(--stack-release) - ${index} * var(--stack-header))`,
      }}
    >
      {/*
        Folder tab: rounded across the top, square at the foot, and bordered
        on three sides. Stacked, the run of them reads as tabs in a drawer
        rather than as three rules across the page.
      */}
      <article className="flex flex-1 flex-col rounded-t-2xl border-x border-t border-line bg-canvas px-4 md:px-6">
        <div className="grid flex-1 gap-x-10 gap-y-6 md:grid-cols-[1fr_18rem]">
          <div className="flex flex-col">
            {/*
              Fixed height, and the same value the sticky offsets step by —
              that is what makes each panel halt exactly under the previous
              header rather than somewhere near it.
            */}
            <div className="flex h-[var(--stack-header)] shrink-0 items-center gap-4 md:gap-6">
              <span aria-hidden className={`size-2 shrink-0 rounded-full ${item.dot}`} />
              {/*
                Plain numeral in the site's own face. The N°001 of the
                reference is set in a monospace this site does not load, and
                the degree sign plus wide tracking read as a rendering fault
                in Inter rather than as a label.
              */}
              <span
                className={`shrink-0 text-[1.05rem] font-semibold tabular-nums ${item.text}`}
              >
                {item.n}
              </span>
              <h3 className="text-[clamp(1.15rem,2.6vw,1.95rem)] font-medium leading-tight tracking-[-0.025em] text-ink">
                {item.title}
              </h3>
            </div>

            <p className="measure-jp max-w-md pt-2 text-[0.98rem] text-muted">
              {item.body}
            </p>
          </div>

          {/*
            Starts at the panel's top edge on purpose: once the next panel
            covers this one, the part still showing inside the header band is
            the top of this photograph.
          */}
          {/*
            Fills the panel's height from md up rather than holding a fixed
            ratio. Aligning the release means the upper panels are padded
            taller than their copy needs, and that slack would otherwise read
            as an accidental hole under the text; here it becomes picture.
          */}
          <div className="row-start-1 pb-14 md:col-start-2 md:pb-20">
            {PHOTOS_READY ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line md:aspect-auto md:h-full">
                <Image
                  src={item.photo}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 20rem, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <Figure className={`w-full ${item.text} opacity-90`} />
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

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

      {/*
        pb is the last panel's entire sticky range — it is the only one whose
        bottom is the wrapper's bottom — so it is also exactly how long the
        assembled stack dwells before releasing. 35vh made that dwell read as
        dead space under 03; this is enough for the panel to stop and be
        read, and no more.
      */}
      <div className="stack mt-14 pb-[16vh]">
        {ITEMS.map((item, i) => (
          <Panel key={item.n} item={item} index={i} />
        ))}
      </div>
    </Section>
  );
}
