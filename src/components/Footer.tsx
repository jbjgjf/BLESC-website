"use client";

import { FooterFlowers } from "@/components/FooterFlowers";
import { GradientFooter } from "@/components/GradientFooter";
import { useLocale } from "@/components/LocaleProvider";
import { WordmarkReveal } from "@/components/WordmarkReveal";
import { usePathname } from "next/navigation";
import { ButtonLink, Container, Icon } from "@/components/ui";
import {
  localePath,
  otherLocale,
  switchLocalePath,
  type Locale,
} from "@/lib/i18n";
import {
  CONTACT_EMAIL,
  FOOTER_NAV,
  LANGUAGE_SWITCH,
  ctaFor,
  sectionHref,
} from "@/lib/site";
import { TRUST_PATH, TRUST_TITLE } from "@/lib/trust";

/**
 * One treatment for every link in the utility line — the section links and
 * the mail address — so that row reads as a single line of type rather than
 * as two columns with headings of their own.
 *
 * muted holds 6.25:1 on the white ground, so the resting state already
 * passes AA; hover only raises it to ink (19.4:1).
 *
 * Tailwind v4 wraps `hover:` in `@media (hover: hover)` on its own. The
 * arbitrary variant adds `(pointer: fine)` as well, so the colour change
 * cannot be left stuck on by a touch that the browser reports as a hover.
 */
const QUIET_LINK =
  "text-[0.9rem] text-muted transition-colors duration-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink";

/*
 * The link row's layout, used twice: by the row itself, whose two items are
 * the lists, and by the list of sections inside it, whose items are the
 * links. The same gaps at both levels are what make two lists read as one
 * line of type.
 */
const LINK_ROW =
  "flex flex-wrap items-baseline justify-center gap-x-5 gap-y-3";

/*
 * The footer's own words, per language. The buttons' labels are ctaFor's,
 * the section names FOOTER_NAV's and the page title TRUST_TITLE's, so what
 * is left to say here is the invitation and the name of the link row.
 *
 * `headingClass` is a whole class string per language: the two headings
 * share a measure and a size and differ in weight, tracking and palt.
 */
const COPY: Record<
  Locale,
  { heading: string; headingClass: string; navLabel: string }
> = {
  ja: {
    heading: "導入について、お話ししませんか。",
    headingClass:
      "mx-auto max-w-3xl text-center text-[clamp(1.625rem,3.6vw,2.375rem)] font-medium leading-[1.3] tracking-[-0.025em] text-ink [font-feature-settings:'palt'_1]",
    navLabel: "フッターナビゲーション",
  },
  en: {
    heading: "Talk to us about bringing Blesc to your school.",
    /*
      The same invitation, on the same measure and the same size, set the
      way the site sets Latin at display size: Helvetica Neue Light. At 500
      this line is 769px at the top of its clamp, one pixel more than the
      768px measure, and drops its last word alone onto a second line; at
      300 it is 724px and sits on one. text-balance is for everything
      narrower, and for a fallback face wide enough to wrap it (Inter is
      782px) — two even lines rather than a line and an orphan. No palt:
      it is a Japanese feature and there is no Japanese in the line.
    */
    headingClass:
      "mx-auto max-w-3xl text-balance text-center text-[clamp(1.625rem,3.6vw,2.375rem)] font-light leading-[1.3] tracking-[-0.02em] text-ink",
    navLabel: "Footer",
  },
};

export function Footer() {
  const pathname = usePathname();

  /*
   * The language is the layout's, through LocaleProvider, as it is for the
   * nav: the invitation, the two buttons and the link row are in it. The
   * address, the copyright, the wordmark and the glow are the same in both.
   *
   * The path decides only what a path should: whether the section links
   * scroll or navigate, which link is the current page, and where the
   * language switch leads.
   */
  const locale = useLocale();
  const t = COPY[locale];
  const cta = ctaFor(locale);
  const home = localePath(locale, "/");
  const onHome = pathname === home;
  const trustHref = localePath(locale, TRUST_PATH);
  const toOther = LANGUAGE_SWITCH[otherLocale(locale)];

  /*
   * `relative` is the only positioning the footer gets. Nothing else — no
   * transform, filter or overflow — because the glow band inside
   * GradientFooter is position: fixed and any of those on an ancestor would
   * capture it and pin it to the footer instead of the viewport.
   */
  return (
    <GradientFooter className="relative bg-canvas">
      {/*
        The content, in a positioned block of its own, which FooterFlowers
        sits against.
      */}
      <div className="relative">
        {/*
          First in the block on purpose: it is a z-0 layer and the Container
          after it carries z-10, so the flowers paint above the footer's
          white and below every line of type. Placed later they would still
          sit under the Container, but the point of the ordering is that
          nothing here depends on a negative z-index, which the footer's own
          background would paint over.
        */}
        <FooterFlowers />

        {/*
          Three bands, each with one type treatment and each centred: the
          invitation, a quiet utility line, then the copyright with the
          wordmark breaking through it. What used to be here was a
          four-column grid — a CTA block, a サイトマップ column and an
          お問い合わせ column, each with its own heading — which made the
          quietest part of the page the busiest. Centring is what makes the
          gutters either side of the heading a place the flowers can float,
          rather than dead space to the right of a left-aligned block.
        */}
        <Container className="relative z-10 pt-16">
          {/*
            導入について, folded in from the old standalone CTA section.

            The supporting paragraph under this is gone. It said 資料のご請求、
            導入のご相談を承っております, which is the two button labels below
            read back, and then お問い合わせフォームよりご連絡ください, which is
            where both buttons already go. With the heading no longer sharing a
            half-width grid cell it also sets on one line at desktop.

            max-w-3xl is the measure the flower clusters are laid out against:
            768px centred leaves 128px of gutter at 1024 and FooterFlowers
            reasons from exactly that figure, so widening this would need the
            clusters re-checked.
          */}
          <h2 className={t.headingClass}>{t.heading}</h2>

          {/*
            The only route to the form the footer now needs: both hrefs are
            the contact page with the enquiry pre-selected, so the separate
            お問い合わせフォーム text link was a third door onto the same page.

            items-center keeps the stacked buttons at their own width and
            centred on a phone, rather than stretched to the column.

            The same two in either language, each leading to that language's
            form (ctaFor). The English pair is the wider — about 206px a
            button against 118px and 150px — and still a row from sm: about
            425px with the gap, of the 592px a 640px screen leaves. Stacked
            on a phone, the wider is 210px of the 272px at 320px.
          */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink variant="secondary" href={cta.document.href}>
              {cta.document.label}
            </ButtonLink>
            <ButtonLink variant="primary" href={cta.consult.href}>
              {cta.consult.label}
            </ButtonLink>
          </div>

          {/*
            The link row and the address stack, centred, at every width. They
            used to share one line at md with the address pushed to the far
            end, which only made sense under a left-aligned heading; centred,
            an address hanging off the right of a centred row of links reads
            as a mistake.
          */}
          <div className="mt-14 flex flex-col items-center gap-5">
            {/*
              Kept, but laid down as one wrapping line instead of a titled
              column. The nav hides its own link list below md with no menu
              behind it, so these are the only links to the sections on a
              phone.

              Two lists on that one line: the sections of the page, then the
              links that leave it — the 安全とプライバシー page and this page
              in the other language. They are separate lists because they
              have to wrap differently. The sections may break anywhere; the
              pair may not be split. In a single list there is a band of
              widths just under the one where everything fits — 782 to
              848px, and a 10- or 11-inch iPad held upright is 810 to 834 —
              in which the line has room for 安全とプライバシー and not for
              "English", and the switch sits alone on a second line. As one
              flex item the pair moves down together or not at all, which on
              a phone makes it the third line.

              gap-x-5, where this was gap-x-6. Nine labels are 608px of type
              (Hiragino Sans at 0.9rem is 14.4px a character; "English" is
              47), and at 24px apart the line ran to 800px. FooterFlowers
              lays its clusters out against the 768px heading on the
              understanding that no row under it is wider; at 20px the line
              is 768px, the heading's own width, so the heading is still the
              bound.

              The English row is the same nine links and the narrower: 541px
              of type in Helvetica Neue and 571px in Inter, so 701px and
              731px with the gaps — under the 768px bound in either face,
              with nothing changed for it. Its labels have spaces in them
              and still do not break inside: each link is a flex item, which
              is laid out at its full width and moves to the next line whole
              (the widest, "Safety & Privacy", is 112px in Inter).
            */}
            <nav aria-label={t.navLabel} className={LINK_ROW}>
              <ul className={LINK_ROW}>
                {FOOTER_NAV[locale].map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={sectionHref(id, onHome, home)}
                      className={QUIET_LINK}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>

              <ul className="flex shrink-0 items-baseline gap-x-5">
                <li>
                  <a
                    href={trustHref}
                    aria-current={pathname === trustHref ? "page" : undefined}
                    className={QUIET_LINK}
                  >
                    {TRUST_TITLE[locale]}
                  </a>
                </li>
                {/*
                  The language switch: this page in the other language. lang
                  is the language the label is written in and hrefLang that
                  of the page it opens, so the one link on the page that is
                  in another language is not read in the wrong voice.
                */}
                <li>
                  <a
                    href={switchLocalePath(pathname)}
                    lang={toOther.lang}
                    hrefLang={toOther.lang}
                    className={QUIET_LINK}
                  >
                    {toOther.label}
                  </a>
                </li>
              </ul>
            </nav>

            {/*
              The mail route, on its own line under the links. It keeps its
              icon now that it is the only one left down here: without it, an
              address sitting in the same size and colour as the links reads
              as a seventh nav item.

              It stays in this band rather than joining the copyright, because
              the copyright row is the one the wordmark reads through and a
              second line of type over those letters would crowd them.
            */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`inline-flex items-center gap-2 ${QUIET_LINK}`}
            >
              <Icon name="mail" size={18} className="shrink-0" />
              {CONTACT_EMAIL}
            </a>
          </div>

          {/*
            The rule and the copyright close the content, and nothing else
            shares their space. They used to sit across the wordmark's capitals
            — the letters read through them by design — and what that looked
            like was a line and a copyright printed over a logo.
          */}
          <div className="mt-16 border-t border-line pt-8 md:mt-20">
            <p className="text-center text-[0.78rem] text-muted">© 2026 Blesc</p>
          </div>
        </Container>

        {/*
          The wordmark, on its own below everything, dissolving downward into
          the glow (its own mask does that). Hidden below md: it is a wide
          wordmark, and at phone widths it shrinks to nothing.
        */}
        <div className="relative z-0 mt-10 hidden md:block lg:mt-12">
          <WordmarkReveal />
        </div>
      </div>
    </GradientFooter>
  );
}
