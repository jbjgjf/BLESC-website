import {
  LimitationFigure,
  type FigureKind,
} from "@/components/evidence/LimitationFigure";
import { PhotoFrame } from "@/components/evidence/PhotoFrame";
import { Drift } from "@/components/flourish/Drift";
import { Reveal } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";

type Limitation = {
  n: string;
  photo: string;
  title: string;
  body: string;
  /** Which mechanism this row's figure draws. See LimitationFigure. */
  figure: FigureKind;
};

/*
 * Bodies are condensed to one sentence each. Nothing is added and nothing is
 * dropped: each one is the original pair of sentences joined, or kept as a
 * short pair where joining them would have needed a new clause to hold the
 * two halves together.
 */
const ITEMS: Limitation[] = [
  {
    n: "01",
    photo: "/photos/limitation-01.jpg",
    title: "アンケートでは本音が表れない。",
    body: "「はい／いいえ」形式では、生徒は大人が望む無難な回答を選びます。",
    figure: "binary",
  },
  {
    n: "02",
    photo: "/photos/limitation-02.jpg",
    title: "深刻なケースほど見えなくなる。",
    body: "追い詰められた生徒ほど周囲を拒み孤立するため、SOSを待つ仕組みでは間に合いません。",
    figure: "isolating",
  },
  {
    n: "03",
    photo: "/photos/limitation-03.jpg",
    title: "教員のリソースには限界がある。",
    body: "40名一人ひとりの心の機微まで捉えるのは現実的ではありません。教員の熱意ではなく、構造の問題です。",
    figure: "attention",
  },
];

/**
 * One reason per row, photograph and copy swapping sides as you go down.
 *
 * This replaces a stack of sticky folder tabs. That stack was the old look's
 * signature piece — rounded tabs, a coloured dot per item, three panels
 * piling up under the nav — and it cost about 1,400px of scroll to show
 * roughly 500px of content at a time, with the photograph squeezed into an
 * 18rem column to make room for the pile. Flat rows give each photograph
 * more than half the measure and the section reads in one pass.
 *
 * The photograph comes first in the markup, so the mobile stack puts the
 * picture above its paragraph; md:order-* is what swaps the sides back on a
 * wide screen. Rows alternate from the second one down.
 *
 * Under each sentence is a small figure of the mechanism that sentence
 * describes. Three flat rows of photo-plus-paragraph made the three reasons
 * look like one reason restated, and the figures are what tells them apart at
 * a glance — each is a different drawing because each row argues differently.
 */
function Row({ item, index }: { item: Limitation; index: number }) {
  const flipped = index % 2 === 1;

  return (
    <Reveal>
      <div className="grid items-center gap-8 md:grid-cols-12 md:gap-14">
        <div className={`md:col-span-7 ${flipped ? "md:order-2" : ""}`}>
          <PhotoFrame src={item.photo} sizes="(min-width: 768px) 36rem, 100vw" />
        </div>

        <div className={`relative md:col-span-5 ${flipped ? "md:order-1" : ""}`}>
          {/*
            The row's number again, giant and almost not there, behind the
            copy. Set in the hero's voice — weight 300, tight — at 5% of the
            text colour, which is #f3f3f3 on the white build and #161719 on
            the dark one: a watermark, not a figure. Secondary copy over it
            holds 5.63:1 light and 11.04:1 dark, so the paragraph is unharmed
            wherever it lands. It drifts 28px slower than the row it belongs
            to, which is what separates it from the copy in depth rather than
            just in tone.

            It hangs off the top-left of the copy column, so on a flipped row
            it follows the column to the other side without knowing it did.
            The overhang is smaller below md: there the photograph sits
            directly above with a 2rem gap, and 2rem is exactly how far the
            numeral may rise before it lies over the picture. Nothing about
            it reaches the viewport's edge, since the column keeps the
            Container's own padding on both sides. The small numeral beside
            the title stays; this one is aria-hidden as well and says
            nothing the small one does not.
          */}
          <Drift
            amount={28}
            className="pointer-events-none absolute -top-8 -left-4 z-0 select-none md:-top-24"
          >
            <span
              aria-hidden
              className="block font-light text-[clamp(7rem,16vw,14rem)] leading-none tracking-[-0.04em] whitespace-nowrap text-ink/5"
            >
              {item.n}
            </span>
          </Drift>

          <div className="relative z-10">
            {/*
              A plain numeral in muted. The coloured dot and the mark-coloured
              figure that used to sit beside it were the tab's decoration, not
              the sequence; the sequence is all this needs to carry.
            */}
            <p aria-hidden className="text-[0.85rem] font-medium tabular-nums text-muted">
              {item.n}
            </p>

            <h3 className="mt-3 text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.025em] text-ink">
              {item.title}
            </h3>

            <p className="measure-jp mt-4 text-[1.0625rem] text-muted">{item.body}</p>

            <LimitationFigure kind={item.figure} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Limitations() {
  return (
    /*
     * overflow-x-clip is a precaution, not a fix: the giant numerals hang off
     * their columns but never past the Container's padding. clip rather than
     * hidden because hidden would make the section a scroll container and
     * cut off the numerals where they rise above their rows; clip leaves the
     * vertical axis alone.
     */
    <Section className="overflow-x-clip">
      <Reveal>
        <SectionTitle>構造的な限界</SectionTitle>
        <p className="measure-jp max-w-2xl text-[1.0625rem] text-muted">
          なぜ、これまでの方法では気づけないのか。
        </p>
      </Reveal>

      <div className="mt-16 space-y-20 md:mt-20 md:space-y-28">
        {ITEMS.map((item, i) => (
          <Row key={item.n} item={item} index={i} />
        ))}
      </div>
    </Section>
  );
}
