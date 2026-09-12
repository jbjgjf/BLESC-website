"use client";

import { GradientFooter } from "@/components/GradientFooter";
import { WordmarkReveal } from "@/components/WordmarkReveal";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { CONTACT_EMAIL, CTA, NAV_LINKS, sectionHref } from "@/lib/site";

/**
 * Glow ramp per theme. Dark rises toward light at the core; light deepens
 * toward saturation instead, because a brightening glow on a near-white page
 * is invisible.
 */
const DARK_STOPS = [
  { offset: 0, color: "#050A10" },
  { offset: 0.1827, color: "#0B3C6E" },
  { offset: 0.2837, color: "#2E77B8" },
  { offset: 0.4135, color: "#85C0ED" },
  { offset: 0.5866, color: "#FFFFFF" },
  { offset: 0.6827, color: "#BBD9F1" },
  { offset: 0.8029, color: "#85C0ED" },
  { offset: 1, color: "#85C0ED00" },
];

const LIGHT_STOPS = [
  { offset: 0, color: "#EDF1F8" },
  { offset: 0.1827, color: "#A8CDEA" },
  { offset: 0.2837, color: "#85C0ED" },
  { offset: 0.4135, color: "#6FB0E2" },
  { offset: 0.5866, color: "#4E97D4" },
  { offset: 0.6827, color: "#7FBCE9" },
  { offset: 0.8029, color: "#A9D3F1" },
  { offset: 1, color: "#85C0ED00" },
];

/**
 * One treatment for every link in the utility line — the section links and
 * the mail address — so that row reads as a single line of type rather than
 * as two columns with headings of their own.
 *
 * muted holds 6.25:1 on the light ground and 8.8:1 on the dark one, so the
 * resting state already passes AA; hover only raises it to ink.
 *
 * Tailwind v4 wraps `hover:` in `@media (hover: hover)` on its own. The
 * arbitrary variant adds `(pointer: fine)` as well, so the colour change
 * cannot be left stuck on by a touch that the browser reports as a hover.
 */
const QUIET_LINK =
  "text-[0.9rem] text-muted transition-colors duration-300 [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink";

export function Footer() {
  const { theme } = useTheme();
  const onHome = usePathname() === "/";

  return (
    <GradientFooter
      className="border-t border-line bg-canvas pt-16"
      stops={theme === "light" ? LIGHT_STOPS : DARK_STOPS}
    >
      {/*
        Three bands, each with one type treatment: the invitation, a quiet
        utility line, then the copyright with the wordmark breaking through
        it. What used to be here was a four-column grid — a CTA block, a
        サイトマップ column and an お問い合わせ column, each with its own
        heading — which made the quietest part of the page the busiest.
      */}
      <Container className="relative z-10">
        {/*
          導入について, folded in from the old standalone CTA section.

          The supporting paragraph under this is gone. It said 資料のご請求、
          導入のご相談を承っております, which is the two button labels below
          read back, and then お問い合わせフォームよりご連絡ください, which is
          where both buttons already go. With the heading no longer sharing a
          half-width grid cell it also sets on one line at desktop.
        */}
        <h2 className="text-[clamp(1.625rem,3.6vw,2.375rem)] font-medium leading-[1.3] tracking-[-0.025em] text-ink [font-feature-settings:'palt'_1]">
          導入について、お話ししませんか。
        </h2>

        {/*
          The only route to the form the footer now needs: both hrefs are
          CONTACT_PATH with the enquiry pre-selected, so the separate
          お問い合わせフォーム text link was a third door onto the same page.
        */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink variant="secondary" href={CTA.document.href}>
            {CTA.document.label}
          </ButtonLink>
          <ButtonLink variant="primary" href={CTA.consult.href}>
            {CTA.consult.label}
          </ButtonLink>
        </div>

        {/*
          items-center, not items-baseline: the mail link is an inline-flex
          whose baseline comes from the icon inside it, which would sit the
          address a pixel or two off the links it shares the line with.
        */}
        <div className="mt-14 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/*
            Kept, but laid down as one wrapping line instead of a titled
            column. The nav hides its own link list below md with no menu
            behind it, so these are the only links to the sections on a
            phone — six items on two lines rather than six stacked rows.
          */}
          <nav aria-label="フッターナビゲーション">
            <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
              {NAV_LINKS.map(({ id, label }) => (
                <li key={id}>
                  <a href={sectionHref(id, onHome)} className={QUIET_LINK}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/*
            The mail route, at the far end of the same line. It keeps its icon
            now that it is the only one left down here: without it, an address
            sitting in the same size and colour as the links reads as a
            seventh nav item.

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
          md:mt-24 buys the wordmark clearance it did not have. The mark is
          pulled up a fixed distance from the bottom of this Container, so at
          lg its cap line lands about 65px above the rule — inside the old
          64px gap, i.e. level with whatever sat above it. Widening the gap
          only at md and up because the mark is hidden below that.
        */}
        <div className="mt-16 border-t border-line pt-8 md:mt-24">
          <p className="text-[0.78rem] text-muted">© 2026 Blesc</p>
        </div>
      </Container>

      {/*
        Pulled up far enough that the capitals break above the rule over the
        copyright, and pushed behind it — the footer's own Container carries
        z-10 — so the line and the copyright read across the letters rather
        than being covered by them.

        Hidden below md: it is a wide wordmark, and at phone widths it either
        shrinks to nothing or collides with the copyright it is meant to sit
        behind.
      */}
      <div className="relative z-0 -mt-[6.25rem] hidden md:block lg:-mt-[7.25rem]">
        <WordmarkReveal />
      </div>
    </GradientFooter>
  );
}
