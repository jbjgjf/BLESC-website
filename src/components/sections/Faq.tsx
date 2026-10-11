import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Section, SectionTitle } from "@/components/ui";
import { FAQ_EN } from "@/lib/faqEn";
import type { Locale } from "@/lib/i18n";
import { FAQ } from "@/lib/seo";

/**
 * The section's own words and the questions under them, per language.
 *
 * The Japanese questions live in lib/seo alongside the FAQPage structured
 * data that quotes them, because Google requires the answer text in the
 * markup to match the answer text in the JSON-LD — two copies would drift on
 * the first edit. The English ones are lib/faqEn's, the same entries in the
 * same order, and the English page's structured data quotes that array for
 * the same reason.
 *
 * `lead` and `answer` are whole class strings picked by language, never
 * fragments joined up: Tailwind only generates what it can read.
 *
 * English is set differently in two places:
 *
 * - The lead gets text-balance. It is well over twice the length of the
 *   Japanese line and breaks at spaces, so on a phone it runs to two lines
 *   and would otherwise wrap as a full line and a one-word orphan. The
 *   Japanese is fifteen characters and sits on one line from 360px up.
 *   The English names what is being adopted ("adopting Blesc"). 導入前に
 *   leaves it unsaid, but a bare "before adoption" on a page about
 *   students can be misread.
 * - An answer drops measure-jp, which is the Japanese paragraph setting
 *   (1.9 leading and a hair of tracking — too open for Latin, and being
 *   unlayered it would outrank any leading set beside it), for 1.7 leading
 *   at 1rem: Latin lower case reads about a size smaller than kana at the
 *   same font size. It is also capped at 40rem. The column is 48rem, which
 *   is under fifty characters a line in Japanese and would be over ninety
 *   in English; the cap brings that to under eighty.
 */
const COPY = {
  ja: {
    title: "よくあるご質問",
    lead: "導入前に、よくいただくご質問。",
    items: FAQ,
    leadClass:
      "text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.4] tracking-[-0.02em] text-ink",
    answerClass: "measure-jp pb-7 pr-8 text-[0.95rem] leading-relaxed text-muted",
  },
  en: {
    title: "FAQ",
    lead: "Common questions before adopting Blesc.",
    items: FAQ_EN,
    leadClass:
      "text-balance text-[clamp(1.25rem,2.6vw,1.75rem)] font-medium leading-[1.4] tracking-[-0.02em] text-ink",
    answerClass:
      "max-w-[40rem] text-pretty pb-7 pr-8 text-[1rem] leading-[1.7] text-muted",
  },
} as const;

/**
 * Native <details>/<summary> rather than a JS accordion: it is open-able
 * without hydration, it is keyboard- and screen-reader-correct for free, and
 * every answer is in the server-rendered HTML whether or not it has been
 * expanded — a crawler reads collapsed content here, which it would not if
 * the panels were mounted on click.
 */
export function Faq({ locale }: { locale: Locale }) {
  const t = COPY[locale];

  return (
    /*
      Not `alt`: ニュース immediately above is already the page's one
      canvas-alt band, and two in a row would merge into one grey block. The
      rules between the questions carry the separation from the closing
      statement below.
    */
    <Section id="faq">
      <Reveal>
        <SectionTitle>{t.title}</SectionTitle>
      </Reveal>

      <Reveal className="max-w-3xl">
        <p className={t.leadClass}>{t.lead}</p>
      </Reveal>

      <Stagger className="mt-10 max-w-3xl" stagger={0.06}>
        {t.items.map(({ q, a }) => (
          <RevealItem key={q}>
            <details className="group border-t border-line">
              <summary className="flex cursor-pointer list-none items-baseline gap-4 py-6 text-[1.05rem] font-medium leading-snug tracking-[-0.01em] text-ink transition-opacity duration-300 hover:opacity-70 motion-reduce:transition-none md:text-[1.15rem]">
                <span className="flex-1">{q}</span>
                {/*
                  A rotating rule rather than an icon: two hairlines that
                  cross into a plus and fold into a minus as the answer opens,
                  which needs nothing loaded and nothing but CSS.
                */}
                <span
                  aria-hidden
                  className="relative mt-2 h-[1px] w-4 shrink-0 bg-mark-2 before:absolute before:inset-0 before:bg-mark-2 before:transition-transform before:duration-300 motion-reduce:before:transition-none before:content-[''] before:[transform:rotate(90deg)] group-open:before:[transform:rotate(0deg)]"
                />
              </summary>
              <p className={t.answerClass}>{a}</p>
            </details>
          </RevealItem>
        ))}
      </Stagger>
    </Section>
  );
}
