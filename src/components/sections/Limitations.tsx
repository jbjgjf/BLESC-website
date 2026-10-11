import {
  LimitationFigure,
  type FigureKind,
} from "@/components/evidence/LimitationFigure";
import { PhotoFrame } from "@/components/evidence/PhotoFrame";
import { Drift } from "@/components/flourish/Drift";
import { Reveal } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";
import type { Locale } from "@/lib/i18n";

type Limitation = {
  n: string;
  photo: string;
  /** The row's sentence and its one line of support, in each language. */
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  /** Which mechanism this row's figure draws. See LimitationFigure. */
  figure: FigureKind;
};

/* The section's own heading and the question under it. */
const COPY = {
  ja: {
    title: "構造的な限界",
    lead: "なぜ、これまでの方法では気づけないのか。",
  },
  en: {
    title: "Structural limits",
    lead: "Why the methods used so far fail to notice.",
  },
} as const;

/*
 * Bodies are condensed to one sentence each. Nothing is added and nothing is
 * dropped: each one is the original pair of sentences joined, or kept as a
 * short pair where joining them would have needed a new clause to hold the
 * two halves together.
 *
 * The photographs are free stock, not generated images (the AI-made set that
 * was here read as fake). Both licences allow commercial use with no credit
 * required; the sources are kept here so they can be re-checked:
 *   01 Pexels, "This And No Internet 25" —
 *      https://www.pexels.com/photo/student-taking-exam-in-classroom-setting-31115182/
 *   02 Unsplash, urusy (Hagi, Japan) —
 *      https://unsplash.com/photos/brown-wooden-hallway-with-light-fixture-kscOvVLq2fk
 *   03 Unsplash, urusy (Hagi, Japan) —
 *      https://unsplash.com/photos/wooden-classroom-with-rows-of-desks-vfRkE_9wuPo
 * 02 is an empty corridor on purpose: the row is about students who
 * disappear from view, and it puts no real child's face beside a line about
 * serious cases.
 *
 * The English is the Japanese, sentence for sentence, and says nothing the
 * Japanese does not. Row 01 quotes the survey's two answers as “Yes/No”
 * because those are the words its figure draws (LimitationFigure).
 */
const ITEMS: Limitation[] = [
  {
    n: "01",
    photo: "/photos/classroom-survey.jpg",
    title: {
      ja: "アンケートでは本音が表れない。",
      en: "Surveys do not show true feelings.",
    },
    body: {
      ja: "「はい／いいえ」形式では、生徒は大人が望む無難な回答を選びます。",
      en: "In a “Yes/No” format, students choose the safe answer that adults want.",
    },
    figure: "binary",
  },
  {
    n: "02",
    photo: "/photos/classroom-corridor.jpg",
    title: {
      ja: "深刻なケースほど見えなくなる。",
      en: "The more serious the case, the harder it is to see.",
    },
    body: {
      ja: "追い詰められた生徒ほど周囲を拒み孤立するため、SOSを待つ仕組みでは間に合いません。",
      en: "The more cornered a student is, the more they push others away and become isolated, so a system that waits for an SOS comes too late.",
    },
    figure: "isolating",
  },
  {
    n: "03",
    photo: "/photos/classroom-room.jpg",
    title: {
      ja: "教員のリソースには限界がある。",
      en: "Teachers’ resources have limits.",
    },
    body: {
      ja: "40名一人ひとりの心の機微まで捉えるのは現実的ではありません。教員の熱意ではなく、構造の問題です。",
      en: "It is not realistic to grasp the subtle feelings of each of 40 students. The problem is one of structure, not of teachers’ dedication.",
    },
    figure: "attention",
  },
];

/*
 * The section's type, per language: the question under the heading, and each
 * row's title and body. The sizes are shared; what differs is how a line is
 * set and broken.
 *
 * measure-jp is the site's Japanese paragraph setting — 1.9 leading and a
 * hair of tracking — and is too open for Latin, so English body copy takes
 * 1.65 and text-pretty in its place. (measure-jp is an unlayered class and
 * would outrank a leading utility beside it, so the English strings leave it
 * out rather than override it.)
 *
 * The English titles run longer than the Japanese and break at spaces. Beside
 * the photograph they are one or two lines — three for the longest at 768px,
 * where the copy column is at its narrowest, 254px — and on a phone the
 * longest is two. text-balance evens those lines so none ends on a word
 * alone, and the leading comes in to 1.25, which is what stacked lines of
 * Latin at this size want. The giant numeral hangs from the top of the copy
 * column and the copy is laid over it, so a longer title never meets it: it
 * only makes the column taller, and the row centres the photograph beside
 * whatever height that is.
 */
const TYPE = {
  ja: {
    lead: "measure-jp max-w-2xl text-[1.0625rem] text-muted",
    title:
      "mt-3 text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.35] tracking-[-0.025em] text-ink",
    body: "measure-jp mt-4 text-[1.0625rem] text-muted",
  },
  en: {
    lead: "max-w-2xl text-pretty text-[1.0625rem] leading-[1.65] text-muted",
    title:
      "mt-3 text-balance text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-[1.25] tracking-[-0.025em] text-ink",
    body: "mt-4 text-pretty text-[1.0625rem] leading-[1.65] text-muted",
  },
} as const;

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
function Row({
  item,
  index,
  locale,
}: {
  item: Limitation;
  index: number;
  locale: Locale;
}) {
  const flipped = index % 2 === 1;
  const type = TYPE[locale];

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
            text colour, which is #f3f3f3 on white: a watermark, not a
            figure. Secondary copy over it holds 5.63:1, so the paragraph is
            unharmed wherever it lands. It drifts 28px slower than the row it
            belongs to, which is what separates it from the copy in depth
            rather than just in tone.

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

            <h3 className={type.title}>{item.title[locale]}</h3>

            <p className={type.body}>{item.body[locale]}</p>

            <LimitationFigure kind={item.figure} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Limitations({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

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
        <SectionTitle>{copy.title}</SectionTitle>
        <p className={TYPE[locale].lead}>{copy.lead}</p>
      </Reveal>

      <div className="mt-16 space-y-20 md:mt-20 md:space-y-28">
        {ITEMS.map((item, i) => (
          <Row key={item.n} item={item} index={i} locale={locale} />
        ))}
      </div>
    </Section>
  );
}
