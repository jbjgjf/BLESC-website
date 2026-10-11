import { DrawnRule } from "@/components/DrawnRule";
import { Flower } from "@/components/Flower";
import { Drift } from "@/components/flourish/Drift";
import { Reveal } from "@/components/Reveal";
import { TRUST_TYPE, TrustSections } from "@/components/trust/TrustSections";
import { ButtonLink, Container } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import { ctaFor } from "@/lib/site";
import { ABOUT, TRUST_TITLE } from "@/lib/trust";

/**
 * 安全とプライバシー / Safety & Privacy: the page's title, the paragraph
 * that says what Blesc is, 安全 and プライバシー, and a closing pair of
 * buttons.
 *
 * /safety and /en/safety are this one component. They differ only in
 * language, so `locale` is the one prop: the title is TRUST_TITLE, every
 * sentence is lib/trust.ts's — where the English sits beside the Japanese
 * it has to agree with — and the way out is the two enquiries, the same
 * pair the footer offers and in the same order, each arriving at that
 * language's contact form with its type selected (ctaFor in lib/site).
 *
 * A server component: the route hands it `locale`, and it hands the same
 * on to TrustSections.
 *
 * The first screen is not animated. This page exists so that someone can
 * tell what Blesc is at once, and a reveal would hold the heading and the
 * paragraph at opacity 0 until the script had loaded and run — the answer
 * withheld for the sake of its entrance. They are in the HTML at full
 * strength, as /contact's heading is, and the motion starts with the first
 * rule under them.
 *
 * It is also short on purpose. The paragraph has to be on screen without
 * scrolling, so the top padding is a step under /contact's (7rem and 10rem
 * against 9rem and 11rem; the resting nav is 5rem tall) and the heading is
 * capped below the hero's size. Worked out from the faces' advance widths,
 * not measured in a browser, the paragraph ends at about:
 *
 *            English (/en/safety)      Japanese (/safety)
 *   1280px   481px  (6 lines)          492px  (6 lines)
 *    375px   440px  (10 lines)         464–496px  (9–10 lines)
 *    360px   493px  (12 lines, Inter)
 *
 * against roughly 550px of visible page on a 667px-tall phone in Safari and
 * 720px on a small laptop. At 320px it runs up to some 90px past a 460px
 * viewport, which is the one case left over.
 *
 * The English figures are for a one-line heading. "Safety & Privacy" is
 * 6.95em in Helvetica Neue Light and 7.59em in Inter at 300, less 0.32em of
 * tracking: 172px and 189px of the 272px a 320px phone leaves, so it never
 * takes a second line. (They were first worked out for a two-line English
 * heading and are those figures less one line of it.)
 *
 * No lang attribute: each language has its own root layout, so <html lang>
 * is already right for the page (see app/_shell/RootShell).
 *
 * A div, not a <main>: the root layout already wraps every page in one.
 *
 * Text is ink throughout. Size and weight carry the hierarchy, and these
 * are the sentences the page is for. On the page ground that is 19.43:1,
 * and 18.04:1 where the flower wash lies behind it.
 */
export function TrustPage({ locale }: { locale: Locale }) {
  const type = TRUST_TYPE[locale];
  const cta = ctaFor(locale);

  return (
    /*
      overflow-x-clip so the flower can hang off the right edge without
      putting a horizontal scrollbar on a narrow window. clip rather than
      hidden, which would make this a scroll container.
    */
    <div className="relative overflow-x-clip bg-canvas">
      {/*
        The company's flower, as a pale wash off the top-right corner — the
        ornament /contact parks in its lower left, here behind the opening.

        It recedes: a negative Drift amount moves it with the page but a
        little slower, about 40px across its pass, which is what puts it
        behind the type rather than on the same sheet. Under reduced motion
        Drift collapses that to nothing and it is simply parked.

        The opacity and the blur are on an inner element with no style
        attribute of its own, and that is load-bearing. Drift writes an
        inline transform, and the layout's noscript rule sets every element
        in <main> that has a style attribute to opacity 1 with no filter; on
        one element, a reader without JavaScript would get the flower at
        full strength, unblurred, across the heading.

        12% of the accent composites to #f0f7fd on the ground. Ink over it
        holds 18.04:1, the dial link's mark-1 5.05:1 and a drawn rule
        3.45:1, so nothing that could come to lie on it falls under its
        floor. On a phone about two thirds of it is on screen, behind the
        right-hand end of the heading; from 1280px it clears the text
        column almost entirely.
      */}
      <Drift
        amount={-40}
        className="pointer-events-none absolute top-8 -right-24 aspect-square w-[clamp(18rem,40vw,38rem)] md:top-12 md:-right-[6%]"
      >
        <div className="h-full w-full text-accent opacity-[0.12] blur-[6px]">
          {/*
            The size prop writes width/height attributes, which h-full/w-full
            then override; they only matter as the ratio the viewBox draws
            against.
          */}
          <Flower size={100} rotate={18} className="h-full w-full" />
        </div>
      </Drift>

      {/* relative, so the type paints above the wash. */}
      <Container className="relative pt-28 pb-[clamp(3.5rem,7vw,6rem)] md:pt-40">
        <h1 className={`font-light tracking-[-0.02em] text-ink ${type.h1}`}>
          {TRUST_TITLE[locale]}
        </h1>

        {/*
          lib/trust.ts's paragraph, whole. Weight 300 like the heading: at
          17–22px in ink that is Hiragino Sans W3, the weight Japanese body
          copy is ordinarily set in, and Helvetica Neue Light.
        */}
        <p className={`mt-6 font-light text-ink md:mt-8 ${type.lead}`}>
          {ABOUT[locale]}
        </p>
      </Container>

      <TrustSections locale={locale} />

      {/*
        The closing line: one more rule, then the two enquiries in a row.
        Stacked and left-aligned on a phone, where items-start keeps each
        button at its own width rather than stretched to the column.

        The English pair is wider — "Request information" and "Book a
        consultation" are about 206px each against 118px and 150px — and
        needs nothing changed: side by side from sm they are about 436px
        with the gap, of the 592px a 640px screen leaves, and stacked on a
        phone the wider is 210px of the 272px at 320px.
      */}
      <Container className="relative">
        <div className="relative pt-[clamp(2.5rem,5vw,3.5rem)] pb-[clamp(4rem,9vw,7rem)]">
          <DrawnRule className="top-0" />
          <Reveal className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-6">
            <ButtonLink variant="secondary" href={cta.document.href}>
              {cta.document.label}
            </ButtonLink>
            <ButtonLink variant="primary" href={cta.consult.href}>
              {cta.consult.label}
            </ButtonLink>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
