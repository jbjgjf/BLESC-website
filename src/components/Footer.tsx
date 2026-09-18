"use client";

import { FooterFlowers } from "@/components/FooterFlowers";
import { GradientFooter } from "@/components/GradientFooter";
import { WordmarkReveal } from "@/components/WordmarkReveal";
import { motion, useScroll, useTransform } from "motion/react";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
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
 * muted holds 6.25:1 on the light ground and 12.1:1 on the dark one, so the
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
  const reduce = usePrefersReducedMotion();
  const content = useRef<HTMLDivElement>(null);

  /*
   * The invitation rising out of the flower's blue. On the home page the
   * closing statement's flower grows until the screen is its blue, and the
   * pin releases straight into this footer; the footer begins in that blue
   * and fades to the page ground, and its content fades up as it arrives —
   * from the footer's top entering the viewport to it reaching the upper
   * third. A plain number when there is no dive to come out of: on
   * /contact, under reduced motion, and (via the noscript rule) without JS.
   */
  const { scrollYProgress } = useScroll({
    target: content,
    offset: ["start end", "start 0.3"],
  });
  /*
   * Computed in JavaScript rather than as a range mapping, which motion
   * would hand to a native scroll timeline for opacity — and on this page
   * those were measured running at the wrong rate (see Philosophy).
   */
  const rise = useTransform(() =>
    Math.min(1, Math.max(0, (scrollYProgress.get() - 0.25) / 0.75)),
  );
  const riseY = useTransform(() => (1 - rise.get()) * 32);
  const fades = onHome && !reduce;

  /*
   * `relative` is the only positioning the footer gets. Nothing else — no
   * transform, filter or overflow — because the glow band inside
   * GradientFooter is position: fixed and any of those on an ancestor would
   * capture it and pin it to the footer instead of the viewport. The
   * content block below does carry a transform (its rise), but on its own
   * subtree: a transform captures only its own descendants, and the band
   * is not one of them.
   *
   * No border-top on the footer: on the home page its top edge is the
   * flower's blue, and a rule across that would cut the hand-over in two.
   */
  return (
    <GradientFooter
      className="relative bg-canvas"
      stops={theme === "light" ? LIGHT_STOPS : DARK_STOPS}
    >
      {/*
        The flower's blue, handing over to the page ground — as its own
        stretch of the page, above the content rather than behind it. The
        closing statement ends with its flower filling the screen in
        --color-primary; this lead-in starts in exactly that colour and fades
        to the ground over most of a screen, and the invitation then rises in
        on the plain ground below it.

        Above, not behind, because the blue is #85c0ed in both themes: laid
        under the content it took the dark build's white heading to 2.4:1 and
        its muted links under 3:1, hid the light build's muted links under
        4.5:1, swallowed the flower marks and the primary button, and made
        the focus ring (mark-1, the same blue) vanish. On the ground, every
        pair is what it is everywhere else.

        Only on the home page, and only when that dive runs — motion allowed
        and a script running — decided in CSS so the server and every
        visitor's first paint agree. Elsewhere there is no blue to come out
        of, and the footer simply starts.
      */}
      {onHome && (
        <div
          aria-hidden
          className="pointer-events-none hidden h-[65svh] bg-linear-to-b from-accent to-canvas motion-safe:js:block"
        />
      )}

      {/*
        The content, in a block of its own so it can rise out of the blue as
        one piece — opacity and a short translate, scroll-linked. Positioned,
        so FooterFlowers sits against it. data-rise is what the layout's
        noscript rule uses to show it at rest when no script will animate it:
        the footer is outside <main>, which the general rule covers.
      */}
      <motion.div
        ref={content}
        data-rise
        className="relative"
        style={{ opacity: fades ? rise : 1, y: fades ? riseY : 0 }}
      >
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
      </motion.div>
    </GradientFooter>
  );
}
