import type { Locale } from "@/lib/i18n";

/**
 * The line of text under a mockup.
 *
 * Why it exists: every <Frame> on the site is aria-hidden, so this is where
 * the claim actually lives — for a screen reader it is the whole figure, and
 * for everyone else it is the sentence the picture is evidence for. The shape
 * is one paragraph in two weights: the lead clause in ink, the continuation
 * muted. That is what lets a figure's caption read as one short statement
 * rather than a heading with a paragraph hanging off it.
 *
 * The numeral is decoration over a list that is already ordered — a caller
 * that passes `n` puts the caption inside an <ol>, which is what announces
 * position — so it is hidden from assistive tech rather than read out
 * before the lead.
 *
 * It writes no words of its own, but how the two halves are joined and set
 * is a matter of language, so it takes the page's `locale`. Japanese joins
 * them with an ideographic space and sets the paragraph with measure-jp,
 * the looser leading and tracking Japanese text wants. English ends its
 * lead on a full stop of its own, joins with an ordinary space — an
 * ideographic one is a full em of hole in a Latin line — and is set at a
 * Latin leading with no added tracking, with text-pretty so that a caption
 * which ends on a claim does not leave that claim's last word on a line by
 * itself.
 */
export function Caption({
  locale,
  n,
  lead,
  className = "",
  children,
}: {
  /** The language of `lead` and `children`. */
  locale: Locale;
  /** Step number, e.g. "01". Omit where the figures are not a sequence. */
  n?: string;
  /**
   * The bold first clause. Three or four characters in Japanese, a short
   * sentence with its full stop in English — not a summary either way.
   */
  lead: string;
  className?: string;
  /** The muted continuation. One sentence if it can be. */
  children: string;
}) {
  return (
    <p className={`${SETTING[locale]} ${className}`}>
      {n && (
        <span
          aria-hidden
          className="mr-2 text-[0.8rem] font-medium tabular-nums text-mark-1"
        >
          {n}
        </span>
      )}
      <strong className="font-medium tracking-[-0.01em] text-ink">{lead}</strong>
      <span className="text-muted">
        {JOIN[locale]}
        {children}
      </span>
    </p>
  );
}

/** Written out in full — Tailwind only generates classes it can read. */
const SETTING: Record<Locale, string> = {
  ja: "measure-jp text-[0.95rem] sm:text-[1rem]",
  en: "text-[0.95rem] leading-[1.7] text-pretty sm:text-[1rem]",
};

/** What sits between the lead and the rest of the caption. */
const JOIN: Record<Locale, string> = {
  /* An ideographic space, which is how Japanese sets this kind of break. */
  ja: "　",
  en: " ",
};
