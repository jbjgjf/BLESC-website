"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui";
import {
  localePath,
  otherLocale,
  switchLocalePath,
  type Locale,
} from "@/lib/i18n";
import {
  LANGUAGE_SWITCH,
  NAV,
  NAV_CTA_SHORT,
  type SectionId,
  ctaFor,
  sectionHref,
} from "@/lib/site";

/**
 * Fixed nav, in two states.
 *
 * At the very top it is a plain full-width row with no ground of its own —
 * the sky is the page's one piece of colour and a bar across it would cut
 * it in half. The moment the page moves it draws in to a floating glass box,
 * because from the first scroll onward it is sitting over content.
 *
 * The two states are one element. Width, height, padding and radius are CSS
 * transitions on real properties, so the bar draws in rather than cutting;
 * the glass is a separate layer behind the content that fades in, which
 * keeps the links and the CTA from remounting at the boundary.
 */

/*
 * One scroll of a wheel is enough to bring the box up. The threshold exists
 * only so that a page which restores a few pixels down, or rubber-bands at
 * the top, cannot flicker it in and out.
 */
const SETTLED = 24;

/**
 * Whether the page has moved, read from the window rather than held in state.
 *
 * useSyncExternalStore rather than an effect that sets state on mount: a
 * refresh or a back-button restore can land the page well down the document,
 * and this reports that on the very first client render instead of a frame
 * later. The server snapshot is false, which is the top of the page — where a
 * cold load starts.
 *
 * The subscription samples the position each frame instead of listening for
 * `scroll`. Wheel and touch scrolling do fire that event, but Lenis moves the
 * page itself for anchor jumps and scrollIntoView, and those did not reach a
 * window listener — measured: the page sat at 1359px with the bar still in its
 * resting state until a scroll event was dispatched by hand. Clicking a nav
 * link from the top is exactly that path. One number read per frame, and React
 * is only notified when the answer actually flips.
 */
function useScrolled() {
  return useSyncExternalStore(
    (onChange) => {
      let frame = 0;
      let last = window.scrollY > SETTLED;

      const check = () => {
        const now = window.scrollY > SETTLED;
        if (now !== last) {
          last = now;
          onChange();
        }
      };

      const sample = () => {
        check();
        frame = requestAnimationFrame(sample);
      };

      // Both, deliberately. The event covers the case where frames are not
      // being produced at all — a background tab throttles rAF to nothing —
      // and the frame loop covers the scrolls that never raise the event.
      window.addEventListener("scroll", check, { passive: true });
      frame = requestAnimationFrame(sample);

      return () => {
        window.removeEventListener("scroll", check);
        cancelAnimationFrame(frame);
      };
    },
    () => window.scrollY > SETTLED,
    () => false,
  );
}

/*
 * The underline a link in the bar draws on hover, and holds in the accent
 * while its section is current. One string for the section links and the
 * language switch, so the two cannot come to move differently.
 */
const UNDERLINE =
  "absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

/*
 * What the bar sets differently in English, as whole class strings picked
 * by language (Tailwind only generates what it can read). English labels
 * are longer — the six links are 364px at lg where the Japanese six are
 * 331px, and the button is 172px where 導入のご相談 is 124px — and the row
 * cannot wrap, so two things give. The budget under the mark, below, has
 * the numbers.
 *
 * - `box`: the glass box the bar draws in to. 56rem holds the Japanese row
 *   with 101px to spare; the English row is 866px against the 864px that
 *   leaves, and 891px in Inter. 60rem gives it 928px.
 * - `lgOnly`: the links that wait for lg in English. Between md and lg
 *   the row has room for four of the six, so Technology and News — the two
 *   furthest down the page — are left to the footer's row, which lists all
 *   of them at every width.
 *
 * Japanese is as it was: every link from md, and the 56rem box.
 */
const BAR: Record<
  Locale,
  { box: string; lgOnly: ReadonlySet<SectionId> }
> = {
  ja: {
    box: "h-14 max-w-[56rem] rounded-3xl px-3 md:px-4",
    lgOnly: new Set(),
  },
  en: {
    box: "h-14 max-w-[60rem] rounded-3xl px-3 md:px-4",
    lgOnly: new Set<SectionId>(["technology", "news"]),
  },
};

const NAV_LABEL: Record<Locale, string> = {
  ja: "メインナビゲーション",
  en: "Main",
};

export function Nav() {
  const reduce = useReducedMotion();
  const pill = useScrolled();
  const pathname = usePathname();

  /*
   * One bar, in two languages. The language is the layout's, through
   * LocaleProvider — never read off the path. What the path does decide is
   * which page this is: whether the section links scroll or navigate, and
   * where the language switch leads.
   */
  const locale = useLocale();
  const links = NAV[locale];
  const bar = BAR[locale];
  const cta = ctaFor(locale).consult;
  const ctaShort = NAV_CTA_SHORT[locale];

  /*
   * The switch leads to the same page in the other language: /contact to
   * /en/contact and back. Every page exists in both, so there is always
   * somewhere for it to go.
   */
  const toOther = LANGUAGE_SWITCH[otherLocale(locale)];
  const switchHref = switchLocalePath(pathname);

  /*
   * The sections only exist on one page per language: "/" and "/en". Off it
   * the links have to point back at that page instead of at a fragment of
   * whatever page you happen to be on (/contact, /safety), and the
   * scroll-spy below simply finds nothing and stays quiet.
   */
  const home = localePath(locale, "/");
  const onPage = pathname === home;

  /*
   * The current section, kept with the path it was observed on. The bar
   * outlives a client-side navigation, and an id seen on one page must not
   * light a link on the next — the six links are the same six on /safety,
   * where none of their sections exist. Deriving it here, rather than
   * clearing the state when the path changes, means there is no frame in
   * which the stale one is drawn.
   */
  const [active, setActive] = useState({ path: "", id: "" });
  const activeId = active.path === pathname ? active.id : "";

  // Scroll-spy: whichever section straddles the upper third of the viewport
  // owns the active indicator.
  useEffect(() => {
    // getElementById, so an id with no element is a null to drop rather
    // than a selector that can throw. A page with none of them — /contact,
    // /safety — leaves the list empty and the spy never starts.
    const sections = links
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    // The observer reports far more often than the answer changes; handing
    // React the same object back is what makes those reports free.
    const mark = (id: string) =>
      setActive((was) =>
        was.path === pathname && was.id === id ? was : { path: pathname, id },
      );

    // IntersectionObserver hands entries back in no guaranteed order, so
    // track membership and resolve the winner in document order instead.
    const visible = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }

        const first = sections.find((section) => visible.has(section));
        if (first) {
          mark(first.id);
        } else if (sections[0].getBoundingClientRect().top > 0) {
          // Above the first section (i.e. in the hero) nothing is current.
          // Below the last one, the previous value deliberately sticks.
          //
          // Asked of the viewport rather than as scrollY < offsetTop:
          // offsetTop counts from the nearest positioned ancestor, which is
          // the document on the home page but need not be on a page whose
          // sections sit inside a positioned wrapper.
          mark("");
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links, pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        pill ? "px-4 pt-3 md:pt-4" : "px-0 pt-0"
      }`}
    >
      {/*
        gap-3 is a floor, not the spacing: justify-between sets the real
        distance between the mark and the row, and this only guarantees that
        on the narrowest screens the two cannot touch.
      */}
      <nav
        aria-label={NAV_LABEL[locale]}
        className={`relative mx-auto flex w-full items-center justify-between gap-3 transition-[max-width,height,padding,border-radius] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          pill ? bar.box : "h-20 max-w-[68rem] rounded-none px-6 md:px-10"
        }`}
      >
        {/*
          The box's ground, behind the content rather than around it, so the
          links never remount as the state flips and the fade is the only
          thing that moves. `.glass-nav` carries the backdrop blur — see
          globals.css for why this is not the lens package.
        */}
        <AnimatePresence>
          {pill && (
            <motion.div
              aria-hidden
              className="absolute inset-0 -z-10"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="glass-nav h-full w-full rounded-3xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/*
          Images are decorative; the link carries the name.

          The mark is one step smaller below lg than it used to be (24px
          resting and 20px in the box, where md had 28 and 24). That is 17px
          of the row at the one width that has none to spare — see the
          budget below.
        */}
        <a
          href={onPage ? "#top" : home}
          aria-label="Blesc"
          className="flex items-center"
        >
          <Logo
            className={`w-auto transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              pill ? "h-5 lg:h-6" : "h-6 lg:h-7"
            }`}
          />
        </a>

        {/*
          The row's budget. Six Japanese links, the switch and the CTA have
          to share one line with the mark from 768px up, and nothing in it
          can shrink (the links are nowrap, the mark is an image), so it is
          worked out here rather than found out in a browser. Widths are the
          labels measured in the page's own faces — Helvetica Neue and
          Hiragino Sans, where every kana and kanji is 1em — and the mark is
          its artwork's 999:241.

                              mark   links  switch   CTA   gaps   total   room
            768  at the top   99.5   382.8   19.2   123.6   32    657.1    688
            768  in the box   82.9   382.8   19.2   123.6   32    640.5    704
            1024 at the top  116.1   471.2   20.4   123.6   48    779.3    944
            1024 in the box   99.5   471.2   20.4   123.6   48    762.7    864
            1280 at the top  116.1   471.2   20.4   123.6   48    779.3   1008
            1280 in the box   99.5   471.2   20.4   123.6   48    762.7    864

          768 is the tight one: 31px to spare, and that is the whole
          distance between the mark and 課題. The classes these replaced
          (28px mark, 0.9rem links 20px apart, 24px before the CTA) came to
          694.9 there — already 7px more than the row holds — and the
          switch on top of them would have made it 738. So between md and
          lg the links set at 0.85rem and 14px apart, and the row's own
          gaps are 16px; from lg up everything is as it was.

          English, by the same method. The mark is the same; the switch is
          日本語 (three characters, 40.8 and 43.2); the button is "Book a
          consultation", 171.9. Helvetica Neue first, and in brackets Inter,
          which is what Android and Windows set it in and is the wider:

                              links        total            room
            768  at the top   280.5        624.7 (640.9)     688
            768  in the box   280.5        608.2 (624.4)     704
            1024 at the top   503.7        882.9 (908.0)     944
            1024 in the box   503.7        866.3 (891.4)     928
            1280 at the top   503.7        882.9 (908.0)    1008
            1280 in the box   503.7        866.3 (891.4)     928

          With the Japanese classes it does not fit anywhere but the top of
          a wide screen: all six links at 768 come to 757.7 against 688,
          and in the 56rem box from lg it is 866.3 against 864. So in
          English the row at 768 is four links (BAR.en.lgOnly holds the two
          that wait for lg), which leaves 47px in Inter and 63 in
          Helvetica; and the box is 60rem, which leaves 36 and 61. 1024 is
          the tight one here — 36px in Inter between the mark and "The
          problem", where the Japanese row's tightest is 31.

          Below md the list is hidden in both languages, as before — the
          footer carries the same links — and what is left is the mark, the
          switch and the CTA: 258.3 of 272 at 320px in Japanese. In English
          the full button would make that 328.2 (330.7), which a phone
          under 377px cannot hold at all and a 390px one holds with 11px
          between the mark and 日本語. So below sm the button reads
          "Contact" (NAV_CTA_SHORT): 248.5 of 272 at 320px, 249.9 in Inter.
        */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/*
            Resting links are muted only inside the glass box. At the top
            the row has no ground, so on the home page it sits straight on
            the hero's sky, with only the top of its white edge wash (about
            40% at this height) between them: muted over the deepest blue
            that reaches the nav falls to about 4.3:1, under AA at this
            size, where ink holds 13:1. Nothing is current
            up there anyway — the scroll-spy clears the active link in the
            hero — so there is no active state for the muted colour to set
            off, and hover keeps its underline.
          */}
          <ul className="hidden items-center gap-3.5 md:flex lg:gap-7">
            {links.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <li
                  key={id}
                  className={
                    bar.lgOnly.has(id) ? "hidden shrink-0 lg:block" : "shrink-0"
                  }
                >
                  <a
                    href={sectionHref(id, onPage, home)}
                    aria-current={isActive ? "true" : undefined}
                    className={`group relative block py-1 text-[0.85rem] whitespace-nowrap transition-colors duration-300 lg:text-[0.9rem] ${
                      isActive || !pill ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                    <span
                      aria-hidden
                      className={`${UNDERLINE} ${
                        isActive
                          ? "scale-x-100 bg-accent"
                          : "scale-x-0 bg-ink/50 group-hover:scale-x-100"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          {/*
            The language switch: EN on a Japanese page, 日本語 on an English
            one, each leading to the same page in the other language.
            Outside the list, because it is not a section of this page, and
            outside the md gate, because it is the only way across on a
            phone short of the footer.

            A plain anchor, like every link between pages on this site. The
            two languages have separate root layouts, so this is a full page
            load whatever element it is; an <a> says so.

            It takes the links' colours for the links' reason — ink at the
            top, where the ground may be a sky, and muted only in the box.
            There muted holds 6.25:1 over the page and 5.23:1 over the
            deepest blue the box ever crosses, the opening flower's cover
            (--color-primary, saturated by the glass and then under its 72%
            of white). Its underline is the links' own, so that at the top,
            where the colour has nowhere to go, hover still shows.

            lang is the language of the label and hrefLang that of the page
            it opens. "EN" alone is two letters to a screen reader, so the
            Japanese page names it; 日本語 is its own name and gets no
            label, which would be read in the label's language rather than
            its own.

            The padding is the target, not the look: two letters at this
            size are 19px wide, and the padding takes the link to 35 by 34
            while the negative margin gives the same 16px back to the row,
            so the budget above is unchanged.
          */}
          <a
            href={switchHref}
            lang={toOther.lang}
            hrefLang={toOther.lang}
            aria-label={toOther.short === toOther.label ? undefined : toOther.label}
            className={`group -mx-2 block px-2 py-1.5 text-[0.85rem] whitespace-nowrap transition-colors duration-300 lg:text-[0.9rem] ${
              locale === "ja" ? "tracking-[0.04em]" : ""
            } ${pill ? "text-muted hover:text-ink" : "text-ink"}`}
          >
            <span className="relative block">
              {toOther.short}
              <span
                aria-hidden
                className={`${UNDERLINE} scale-x-0 bg-ink/50 group-hover:scale-x-100`}
              />
            </span>
          </a>

          {/*
            The enquiry that opens the form with 導入のご相談 selected, in
            the page's language.

            Where a language has a short form (English, below sm — see the
            budget above) both labels are in the markup and CSS shows one.
            The hidden one is display: none, so it is in neither the
            accessibility tree nor the button's name: the link is called
            what it visibly says, which is what a voice-control user will
            ask for. No aria-label for the same reason.
          */}
          <ButtonLink href={cta.href} size="sm" className="whitespace-nowrap">
            {ctaShort ? (
              <>
                <span className="sm:hidden">{ctaShort}</span>
                <span className="hidden sm:inline">{cta.label}</span>
              </>
            ) : (
              cta.label
            )}
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
