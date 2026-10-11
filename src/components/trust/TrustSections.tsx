import type { ReactNode } from "react";
import { DrawnRule } from "@/components/DrawnRule";
import { Flower } from "@/components/Flower";
import { Drift } from "@/components/flourish/Drift";
import { Reveal, RevealItem } from "@/components/Reveal";
import { RevealList } from "@/components/trust/RevealList";
import { Container } from "@/components/ui";
import type { Locale } from "@/lib/i18n";
import { PRIVACY, SAFETY, SOS_DIAL } from "@/lib/trust";

/**
 * The type the two trust pages are set in, per language.
 *
 * One scale in two cuts, because the same statements are set in Japanese on
 * /safety and in English on /en/safety, and a size that suits one script
 * does not suit the other. Every heading is weight 300 — Helvetica Neue Light on the
 * Latin, Hiragino Sans W3 on the Japanese — which is the hero's voice; the
 * home page's section heads are 500, and are not used here (see TrustSection
 * for why).
 *
 * Japanese runs a step smaller than Latin at display size, for the reason
 * Backing gives: a kanji fills its em square where Helvetica's capitals
 * stand about 0.71em tall, so at one size the Japanese heading looks a size
 * up. The caps are in the same 5:6 — 3.75rem against 4.5rem for the h1,
 * 2.5rem against 3rem for the h2.
 *
 * The h1 floors are set by the narrowest phone, and worked out from the
 * faces' own advance widths rather than read off a browser:
 *
 * - 安全とプライバシー is nine full-width characters, 8.82em once the
 *   -0.02em tracking is taken off. At 320px the Container leaves 272px and
 *   the ramp gives 28px: 247px, on one line.
 * - "Safety & Privacy" is 6.95em in Helvetica Neue Light and 7.59em in
 *   Inter at 300, which is what Android and Windows fall back to, less
 *   0.32em of tracking. At 320px the ramp gives 26px and Inter needs 189px
 *   of the 272. The ramp was set for a longer line — an earlier English
 *   heading ran to 10.77em and only just fitted — so this one has room at
 *   every width. text-balance is there for a fallback wide enough to wrap
 *   it anyway: two even lines rather than a line and an orphan.
 *
 * Both ramps are a rem term plus a vw term, not vw alone, so the heading
 * still answers to the reader's own text size.
 *
 * measure-jp (globals.css) is the site's Japanese paragraph setting — 1.9
 * leading and a hair of tracking. It is an unlayered class, so it outranks
 * any leading utility beside it; the Japanese cuts therefore name no
 * leading of their own for body text, and `line` — the height the list
 * marker centres itself in — repeats the leading each cut really has.
 *
 * Class names are written out whole: Tailwind only generates what it can
 * read.
 */
export const TRUST_TYPE = {
  ja: {
    h1: "text-[clamp(1.75rem,0.75rem+5vw,3.75rem)] leading-[1.2] [font-feature-settings:'palt'_1]",
    lead: "measure-jp max-w-[40rem] text-[clamp(1.0625rem,0.95rem+0.45vw,1.25rem)]",
    h2: "text-[clamp(1.375rem,0.95rem+2vw,2.5rem)] leading-[1.25] [font-feature-settings:'palt'_1]",
    intro: "measure-jp text-[clamp(1.125rem,1rem+0.5vw,1.375rem)]",
    item: "measure-jp text-[1.0625rem]",
    line: "h-[1.9em]",
  },
  en: {
    h1: "text-balance text-[clamp(1.625rem,0.5rem+5.6vw,4.5rem)] leading-[1.08]",
    lead: "max-w-[46rem] text-pretty text-[clamp(1.0625rem,0.9rem+0.7vw,1.375rem)] leading-[1.6]",
    h2: "text-[clamp(1.5rem,1rem+2.4vw,3rem)] leading-[1.15]",
    intro: "text-[clamp(1.1875rem,1.05rem+0.6vw,1.5rem)] leading-[1.45]",
    item: "text-pretty text-[1.0625rem] leading-[1.65] md:text-[1.125rem]",
    line: "h-[1.65em]",
  },
} as const;

/**
 * The SOS dial's number, as a link that dials it.
 *
 * The sentence is lib/trust.ts's and is not reworded here: the number is
 * found in it and wrapped where it stands, so the visible words are exactly
 * the supplied ones in either language, and an item that does not carry the
 * number comes back untouched. The site turns off the browser's own
 * telephone detection (formatDetection in lib/seo.ts's siteMetadata), so
 * without this the one number on the page a reader might need to ring would
 * be plain text on a phone.
 *
 * nowrap, because a number broken at one of its hyphens reads as two.
 *
 * mark-1 with an underline: the colour holds 5.44:1 on the page ground, and
 * the underline is what marks it as a link for a reader who cannot tell the
 * colour apart from the ink around it. Hover goes to ink, which raises the
 * contrast — fading the link instead, as a hover often does, would take it
 * under AA while the pointer is on it.
 */
function withDial(text: string): ReactNode {
  const at = text.indexOf(SOS_DIAL.number);
  if (at === -1) return text;

  return (
    <>
      {text.slice(0, at)}
      <a
        href={SOS_DIAL.tel}
        className="whitespace-nowrap text-mark-1 underline decoration-1 underline-offset-[0.25em] transition-colors duration-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink"
      >
        {SOS_DIAL.number}
      </a>
      {text.slice(at + SOS_DIAL.number.length)}
    </>
  );
}

/*
 * A list item's rule and padding, in the two forms a list here takes.
 *
 * Under an opening sentence (安全's condition) every item is ruled off above,
 * the first included, so the sentence reads as the head of the list it
 * governs. With nothing above it (プライバシー) the first item drops its rule
 * and its padding and starts level with the section's heading.
 *
 * border-line: these hairlines only separate one statement from the next —
 * 1.22:1, which is what that token is for — and the list would still be a
 * list without them. The rule that carries structure is the DrawnRule at
 * the head of each section.
 */
const ITEM_RULED = "border-t border-line py-5 last:pb-0";
const ITEM_OPEN =
  "border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0";

/**
 * One titled list: 安全 or プライバシー, Safety or Privacy.
 *
 * Not <Section> and <SectionTitle> from components/ui, though this is what
 * they are for on the home page, and for two reasons that are both about
 * scale. Section pads 5–9rem above and below, the rhythm of screens that
 * each make an argument; these are two short lists that belong together,
 * and that much air would set them a screen apart. And SectionTitle is
 * type-head — 500, up to 3.5rem — which on a phone comes out as large as
 * these pages' h1 and heavier, so the section would outrank the page. What
 * is kept from both is what matters to the rest of the site: scroll-mt-24,
 * which is what Lenis reads to stop an anchor jump clear of the nav, the
 * Container's measure, and the few pixels of Drift every section head has.
 *
 * The section is `relative` so that it paints above the flower wash at the
 * top of the page (see TrustPage) wherever the two happen to meet, and has
 * no fill of its own for the same reason: a white band would cut the wash
 * off in a straight line. The page's ground is the wrapper's.
 *
 * Layout. From lg the heading stands in a column of its own beside the
 * list, the two aligned on their first baselines, so a 40px heading and a
 * 17px sentence sit on one line of type rather than hanging from one top
 * edge. Below lg they stack. The marker is taken out of the flow precisely
 * so that it has no say in that baseline: the first line of each item is
 * its sentence.
 *
 * The marker is the brand flower, decorative and hidden from assistive
 * tech — the list semantics are the ul's. It centres itself in a box one
 * line tall (`line`, in em, so it follows the item's own size) and is drawn
 * in mark-1, 5.44:1 on the ground: nothing depends on it, and it clears the
 * 3:1 of a meaningful mark anyway.
 *
 * Motion is the page's own: the rule draws, the heading and the opening
 * sentence reveal, the items follow 0.08s apart. Every piece has its still
 * form — DrawnRule and Reveal swap variants under reduced motion, Drift
 * collapses its range — and without JavaScript the layout's noscript rule
 * puts each of them at rest and visible.
 */
function TrustSection({
  id,
  locale,
  title,
  intro,
  items,
}: {
  id: string;
  locale: Locale;
  title: string;
  /** The sentence the list hangs from, where the copy has one. */
  intro?: string;
  items: readonly string[];
}) {
  const type = TRUST_TYPE[locale];
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="relative scroll-mt-24"
    >
      <Container>
        <div className="relative py-[clamp(3.5rem,7vw,6rem)]">
          {/*
            Inside the Container, so the rule is the width of the text it
            heads rather than the width of the window.
          */}
          <DrawnRule className="top-0" />

          <div className="grid gap-y-7 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-baseline lg:gap-x-16">
            <Reveal>
              <Drift amount={10}>
                <h2
                  id={titleId}
                  className={`font-light tracking-[-0.02em] text-ink ${type.h2}`}
                >
                  {title}
                </h2>
              </Drift>
            </Reveal>

            <div>
              {intro ? (
                <Reveal>
                  <p className={`text-balance font-light text-ink ${type.intro}`}>
                    {intro}
                  </p>
                </Reveal>
              ) : null}

              <RevealList className={intro ? "mt-6 md:mt-8" : undefined}>
                {items.map((item) => (
                  <RevealItem
                    key={item}
                    as="li"
                    className={intro ? ITEM_RULED : ITEM_OPEN}
                  >
                    <div className={`relative pl-8 text-ink ${type.item}`}>
                      <span
                        aria-hidden
                        className={`absolute top-0 left-0 flex items-center ${type.line}`}
                      >
                        <Flower size={16} className="text-mark-1" />
                      </span>
                      <p>{withDial(item)}</p>
                    </div>
                  </RevealItem>
                ))}
              </RevealList>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * 安全 and プライバシー — what Blesc does when a diary suggests danger, and
 * what it does with a diary — in the language asked for.
 *
 * Presentational only. Every word is lib/trust.ts's, rendered as supplied:
 * the title, the sentence 安全 opens on, and each item, in order. That file
 * is the one place the two languages are kept side by side, and this is the
 * one component both pages draw them with, so /safety and /en/safety cannot
 * come to promise different things or set them differently.
 *
 * The ids are `safety` and `privacy` in both languages, so /safety#privacy
 * and /en/safety#privacy are the same fragment on the two pages. Nothing in
 * the nav links to them — its six links are the home page's sections — so
 * its scroll-spy finds none of its ids here and stays quiet.
 */
export function TrustSections({ locale }: { locale: Locale }) {
  const safety = SAFETY[locale];
  const privacy = PRIVACY[locale];

  return (
    <>
      <TrustSection
        id="safety"
        locale={locale}
        title={safety.title}
        intro={safety.lead}
        items={safety.items}
      />
      <TrustSection
        id="privacy"
        locale={locale}
        title={privacy.title}
        items={privacy.items}
      />
    </>
  );
}
