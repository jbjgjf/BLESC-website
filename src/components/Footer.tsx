"use client";

import { FlowerDive } from "@/components/flourish/FlowerDive";
import { FooterFlowers } from "@/components/FooterFlowers";
import { GradientFooter } from "@/components/GradientFooter";
import { WordmarkReveal } from "@/components/WordmarkReveal";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { CONTACT_EMAIL, CTA, FOOTER_LINKS, sectionHref } from "@/lib/site";

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

  /*
   * `relative` is the only positioning the footer gets. Nothing else — no
   * transform, filter or overflow — because the glow band inside
   * GradientFooter is position: fixed and any of those on an ancestor would
   * capture it and pin it to the footer instead of the viewport. The dive
   * below does use sticky and transforms, but on its own descendants: a
   * child's transform captures only that child's subtree, never a sibling.
   *
   * No border-top and no top padding on the footer itself any more. The
   * dive is the boundary now — its stage begins on the page ground the
   * statement band has just faded to — and the padding has moved onto the
   * Container so the invitation keeps its distance from the dive's end.
   */
  return (
    <GradientFooter
      className="relative bg-canvas"
      stops={theme === "light" ? LIGHT_STOPS : DARK_STOPS}
    >
      {/*
        The flower dive: a pinned stage where a flower-shaped window onto
        the classroom photograph opens, spins, and fills the screen before
        the invitation follows. First in the footer because it is the
        footer's top edge.
      */}
      <FlowerDive />

      {/*
        The content, in a positioned block of its own. FooterFlowers is
        absolutely positioned a little below the top of its nearest
        positioned ancestor, and with the dive in front of everything that
        ancestor can no longer be the footer — it would put the clusters
        over the dive's stage. position: relative here is safe for the glow
        band: only transforms, filters and the like capture a fixed
        descendant, and the band is not inside this block anyway.
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
          <h2 className="mx-auto max-w-3xl text-center text-[clamp(1.625rem,3.6vw,2.375rem)] font-medium leading-[1.3] tracking-[-0.025em] text-ink [font-feature-settings:'palt'_1]">
            導入について、お話ししませんか。
          </h2>

          {/*
            The only route to the form the footer now needs: both hrefs are
            CONTACT_PATH with the enquiry pre-selected, so the separate
            お問い合わせフォーム text link was a third door onto the same page.

            items-center keeps the stacked buttons at their own width and
            centred on a phone, rather than stretched to the column.
          */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink variant="secondary" href={CTA.document.href}>
              {CTA.document.label}
            </ButtonLink>
            <ButtonLink variant="primary" href={CTA.consult.href}>
              {CTA.consult.label}
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
              phone — six items on two lines rather than six stacked rows.
            */}
            <nav aria-label="フッターナビゲーション">
              <ul className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-3">
                {FOOTER_LINKS.map(({ id, label }) => (
                  <li key={id}>
                    <a href={sectionHref(id, onHome)} className={QUIET_LINK}>
                      {label}
                    </a>
                  </li>
                ))}
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
