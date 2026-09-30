import Image from "next/image";
import { Flower } from "@/components/Flower";
import { RevealItem, Reveal, Stagger } from "@/components/Reveal";
import { Container } from "@/components/ui";

/**
 * An optional logo file for an entry. When it is present it replaces the
 * typeset name, and the entry's `name` becomes the image's alt, so the claim
 * is still text. There is deliberately no separate alt field: a logo is the
 * organisation's name drawn, and a second string for it could only drift
 * from the first.
 *
 * `width` and `height` are the file's intrinsic size, which next/image needs
 * for the aspect ratio. The rendered size is set by the band, not by them —
 * every logo is drawn at the wordmark's height (see LOGO_HEIGHT), so marks
 * of very different proportions still read as one row.
 */
type BackerLogo = {
  src: string;
  width: number;
  height: number;
};

type Backer = {
  /** The organisation's own name, spelled the way it spells it. */
  name: string;
  /**
   * What the relationship is, in the words the Blesc team confirmed and no
   * others. This line is the claim; the name above it is only who it is
   * about. See the note on BACKERS before adding a word to it.
   */
  scope: string;
  logo?: BackerLogo;
};

/**
 * Who stands behind Blesc, as the Blesc team stated it on 2026-09-30.
 *
 * Each scope line is exactly what was confirmed, and it is kept to that on
 * purpose. docs/claims.md §3 does not allow an unscoped relationship word:
 * 共同研究, 監修, 協働, 提携 and 連携 each say something specific about what
 * an institution did, and none of them has been confirmed for either entry.
 * A word that is true in spirit is still a claim about someone else's name,
 * in copy read by schools and boards of education — the kind of line that
 * is most expensive to take back.
 *
 * 京都大学 — the team's word was 支援, and the written permission is on
 * file (recorded in scripts/check-claims.mjs PERMITTED_ORGS). The claims
 * check keeps it scoped as well as named: 共同研究, 監修 and the rest beside
 * 京都大学 fail CI (unscoped-relationship).
 *
 * ANOBAKA — the relationship is selection into a named programme, so the
 * line is the programme and the result: 「U-25 AI Accelerator 第2期 採択」.
 * It is an accelerator and not an investment. ANOBAKA is itself a venture
 * capital firm — the reviewer's own shorthand was "ANOBAKA VC" — which is
 * exactly why VC / 出資 / 投資 must never appear beside it: a reader would
 * take them as a statement that it holds equity in Blesc. The check
 * enforces that too (accelerator-as-investment).
 *
 * No amount is printed here. An amount is an event, not a relationship, so
 * it goes in ニュース (src/lib/news.ts), with the selection it came with.
 *
 * No 監修者 is listed because none has been named. An expert added here
 * before one is agreed would be the same failure as the 京都大学
 * collaboration line テクノロジー once carried, and had to drop, before any
 * permission existed.
 */
const BACKERS: Backer[] = [
  { name: "京都大学", scope: "支援" },
  { name: "ANOBAKA", scope: "U-25 AI Accelerator 第2期 採択" },
];

/**
 * A Latin name is set larger than a Japanese one, so that the two read as
 * the same size.
 *
 * At one font size they do not. A kanji fills most of its em square, while
 * Helvetica Neue's capitals stand about 0.71em tall, so at 56px 京都大学 has
 * roughly 49px of ink and ANOBAKA 40px — the university's name looked a
 * size up from the programme beside it, which is a ranking nobody chose.
 * 3.125rem kanji against 3.75rem capitals puts both at 43–44px of ink.
 *
 * The test is on the string rather than a field in the data: whoever adds
 * an entry should only have to type the name. Printable ASCII is a Latin
 * wordmark; anything else is set as Japanese.
 *
 * Written out in full — Tailwind only generates classes it can read.
 */
const WORDMARK_SIZE = {
  latin: "text-[clamp(2.375rem,4.8vw,3.75rem)]",
  japanese: "text-[clamp(2rem,4vw,3.125rem)]",
} as const;

function isLatin(name: string) {
  return /^[ -~]+$/.test(name);
}

/**
 * A logo is drawn at the height of the larger wordmark's line box, which is
 * also the minimum height of every name cell. That keeps each scope line on
 * the same baseline across the row, whichever mix of wordmarks and logos
 * the row holds.
 */
const LOGO_HEIGHT = "h-[clamp(2.625rem,5.3vw,4.125rem)]";
const NAME_CELL = "min-h-[clamp(2.625rem,5.3vw,4.125rem)]";

/**
 * 支援・採択 — a band, not a section.
 *
 * The request was for a part of the site that shows the backing. It is built
 * the way cluely.com shows its own: a small label, then the names large, on
 * the plain white ground, with nothing else competing. The names are the
 * content; the band's job is to get out of their way. So there is no
 * SectionTitle here. Another display-size heading would put this on the
 * same footing as the argument the page makes, and a list of two names is
 * not an argument. The label is still the h2, so the band is a real stop in
 * the document outline and in a screen reader's heading list — it is only
 * set at label size.
 *
 * The heading is 支援・採択 rather than "Backed by" or 支援 alone. In
 * English, "backed by" beside the name of a firm that runs a venture fund
 * reads as an investment, which is the one thing that must not be implied
 * about ANOBAKA. And 支援 alone would repeat 京都大学's own scope line word
 * for word. 支援・採択 is exactly the two relationships below it, and says
 * nothing they do not.
 *
 * The entries are a description list: an organisation, then what it is to
 * Blesc. That is the claim as a screen reader should hear it — "京都大学,
 * 支援" — and the names are real text unless a logo has replaced one, in
 * which case its alt carries the name. Each entry is a RevealItem, which
 * renders a div; a div wrapping one dt and its dd is valid inside a dl, and
 * the stagger reaches the items through motion's context rather than the
 * DOM, so the dl between them costs nothing.
 *
 * The row is a centred, wrapping flex rather than a two-column grid, so a
 * third name — or a fifth — lands centred on its own line instead of
 * leaving a hole in a column.
 *
 * Motion is the page's shared reveal and nothing more. Reduced motion gets
 * reducedVariants (opacity only) through Reveal and RevealItem, and without
 * JavaScript the layout's noscript rule sets every inline-styled element in
 * <main> back to full opacity with no transform, so the names are simply
 * there. This file has no client code of its own and stays a server
 * component.
 *
 * Measured against the tokens in globals.css on bg-canvas (#ffffff): the
 * names in ink 19.43:1, the label and the scope lines in muted 6.25:1 (AA at
 * their 0.85–1rem size), the flower in mark-1 5.44:1 — decorative, but it
 * clears the 3:1 non-text line anyway.
 */
export function Backing() {
  return (
    <section
      id="backing"
      aria-labelledby="backing-title"
      className="scroll-mt-24 bg-canvas py-[clamp(4rem,8vw,7rem)]"
    >
      <Container>
        {/*
          The brand flower as the band's mark, the same way it marks each row
          of ニュース. Beside the label rather than above it, so the label
          stays one quiet line and does not become a second heading.
        */}
        <Reveal className="flex items-center justify-center gap-2.5">
          <Flower size={16} className="shrink-0 text-mark-1" />
          <h2
            id="backing-title"
            className="text-[0.85rem] font-medium tracking-[0.04em] text-muted"
          >
            支援・採択
          </h2>
        </Reveal>

        <Stagger className="mt-10 md:mt-14" stagger={0.1} delayChildren={0.05}>
          <dl className="flex flex-col items-center gap-y-12 md:flex-row md:flex-wrap md:items-start md:justify-center md:gap-x-[clamp(4rem,10vw,9rem)] md:gap-y-14">
            {BACKERS.map((backer) => (
              <RevealItem
                key={backer.name}
                className="flex flex-col items-center text-center"
              >
                <dt className={`flex items-center justify-center ${NAME_CELL}`}>
                  {backer.logo ? (
                    <Image
                      src={backer.logo.src}
                      width={backer.logo.width}
                      height={backer.logo.height}
                      alt={backer.name}
                      className={`${LOGO_HEIGHT} w-auto`}
                    />
                  ) : (
                    /*
                      Weight 300: the hero's voice, which is Helvetica Neue
                      Light on the Latin and Hiragino Sans W3 on the kanji.
                      text-balance rather than nowrap, so a longer name
                      added later wraps evenly on a phone instead of running
                      off it.
                    */
                    <span
                      className={`font-light leading-[1.1] tracking-[-0.015em] text-balance text-ink [font-feature-settings:'palt'_1] ${
                        isLatin(backer.name)
                          ? WORDMARK_SIZE.latin
                          : WORDMARK_SIZE.japanese
                      }`}
                    >
                      {backer.name}
                    </span>
                  )}
                </dt>
                <dd className="mt-3 text-[1rem] text-muted md:mt-4">
                  {backer.scope}
                </dd>
              </RevealItem>
            ))}
          </dl>
        </Stagger>
      </Container>
    </section>
  );
}
