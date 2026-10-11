import { Caption } from "@/components/mock";
import { PrivacyFigure } from "@/components/product/PrivacyFigure";
import { Reveal } from "@/components/Reveal";
import { ButtonLink, Section, SectionTitle } from "@/components/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { TRUST_PATH, TRUST_TITLE } from "@/lib/trust";

/**
 * The section's own words, in each language.
 *
 * The English says what the Japanese says and no more. 観測された記述 is
 * "what was observed in the writing", not "the observed text": the caption's
 * first words are that the text is not shared, and an English reader must
 * not be able to read its next sentence as saying it is. The last sentence
 * is a negation in both languages and has to stay one (docs/claims.md §1).
 *
 * The English lead is a sentence with its own full stop, where the Japanese
 * one is a clause followed by an ideographic space; <Caption> joins each the
 * way its language does.
 */
const COPY = {
  ja: {
    title: "プロダクト",
    lead: "教員に届くのは、観測と根拠だけ。",
    captionLead: "日記の本文は共有されません",
    caption:
      "自分のタイミングで書いた日記にAIが問いをひとつ返します。教員に届くのは観測された記述とその時刻・根拠だけで、心理的リスクの判定は行いません。",
  },
  en: {
    title: "Product",
    lead: "Teachers receive only observations and their basis.",
    captionLead: "The diary text is not shared.",
    caption:
      "Students write a diary in their own time, and the AI replies with one follow-up question. Teachers receive only what was observed in the writing, with its time and basis. Blesc does not assess psychological risk.",
  },
} as const;

/*
 * Where English is set differently. Whole class strings picked by locale —
 * Tailwind only generates classes it can read.
 */

/**
 * The line under the title. English breaks at spaces, so where the line
 * does not fit — a phone, or the widest type on a system whose Latin face
 * runs wider than Helvetica Neue — an unbalanced wrap leaves "basis." on a
 * line by itself; text-balance splits it evenly instead. Japanese breaks
 * wherever the width runs out and is left as it was.
 */
const LEAD: Record<Locale, string> = {
  ja: "text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-ink",
  en: "text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.5] tracking-[-0.02em] text-balance text-ink",
};

/**
 * The caption's measure. The Japanese caption runs the width of the figure,
 * about sixty characters to a line at its widest. The English one is three
 * times as many characters, and at that width would be a 130-character
 * line, so it is held to the measure of the lead above it.
 */
const CAPTION: Record<Locale, string> = {
  ja: "mt-5",
  en: "mt-5 max-w-2xl",
};

/**
 * The product, as the one claim it exists to prove.
 *
 * This section used to be seven pieces of copy around two panels drawn in a
 * second style — a student's screen, a teacher's screen, a diagram between
 * them and a heading and a caption for each. The claim they were all making
 * is a single sentence: what the teacher receives is not what the student
 * wrote. So it is now that sentence, one figure that shows it at rest, and
 * one caption that says it in full.
 *
 * The figure is not wrapped in a <Reveal>. Its beats are scroll-linked to
 * its own position, and an ancestor still animating a translate would be
 * measured mid-flight. Only the caption animates in, and it is passed into
 * the figure so that it is the figure's own figcaption rather than a
 * paragraph that happens to follow it.
 *
 * A server component, so its language is the `locale` the page hands it.
 * The figure is a client component and reads the same language from the
 * layout's provider (useLocale); nothing here decides it from the path.
 */
export function Product({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  return (
    <Section id="product">
      <Reveal>
        <SectionTitle>{copy.title}</SectionTitle>
      </Reveal>

      <Reveal className="max-w-2xl">
        <p className={LEAD[locale]}>{copy.lead}</p>
      </Reveal>

      <div className="mt-12 md:mt-16">
        <PrivacyFigure>
          <Reveal>
            <Caption
              locale={locale}
              lead={copy.captionLead}
              className={CAPTION[locale]}
            >
              {copy.caption}
            </Caption>
          </Reveal>
        </PrivacyFigure>

        {/*
          The way to 安全とプライバシー — its own page, /safety and
          /en/safety — straight under the caption that says the diary is not
          shared, which is where the reader who wants the rest of that
          promise is standing.

          A button, not a link in the running text: the page is not in the
          top bar, so this and the footer are the two ways to it, and the
          one on the page has to be findable by someone who is scanning
          rather than reading. It is the hero's secondary pill — the same
          white glass with a hairline edge — so it reads as a way onward
          without competing with the blue of the page's primary call to
          action. Its label is the page's own title, from lib/trust.ts, so
          the button and the page it opens cannot name two different things.

          After the figure, not inside its figcaption, for two reasons. A
          figcaption is the figure's caption, and a way to another page is
          not part of it. And the figure's beats are scroll-linked to the
          figure's own box: a button inside it would make that box taller
          and stretch every beat, in both languages, for something that is
          not part of the picture. So the figure is exactly as tall as it
          was, and the button has its own Reveal, which comes into view
          just after the caption's.

          pt-6 is the air between a caption and a control. ButtonLink is
          inline-block, so it sits at the caption's left edge.

          From 1024px the button takes no height of its own: its box is
          lg:h-0 and it hangs into the section's bottom padding, which is
          102px there and more above (the button and its air are 78px). That
          is for the signal thread, which is only drawn from 1024px. The
          thread leaves the teacher's row and crosses to the gutter 35% of
          the way down to テクノロジー's graph (flourish/threadPath), so every
          pixel added between the two moves that crossing. Without the
          button it runs inside the foot of the figure's panel; 78px more
          put it 27px lower, on the caption's first line from 1440px. With
          no height added, everything from the figure down is where it was
          and so is the thread. The air is padding, not margin, because a
          margin would collapse through the zero-height box and be added
          back above it. Below 1024px there is no thread, and the button is
          in the flow like anything else.

          The Reveal is inside the zero-height box rather than being it, so
          what the reveal watches for is the button's real 78px and not an
          empty line.
        */}
        <div className="lg:h-0">
          <Reveal className="pt-6">
            <ButtonLink
              variant="secondary"
              href={localePath(locale, TRUST_PATH)}
            >
              {TRUST_TITLE[locale]}
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
