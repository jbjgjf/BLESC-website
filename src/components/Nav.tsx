"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CTA, NAV_LINKS, sectionHref } from "@/lib/site";

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
 * keeps the links, the toggle and the CTA from remounting at the boundary.
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
export function Nav() {
  const reduce = useReducedMotion();
  const pill = useScrolled();
  const [activeId, setActiveId] = useState<string>("");

  /*
   * The sections only exist on the home page. Off it the links have to point
   * back at "/" instead of at a fragment of whatever page you happen to be
   * on, and the scroll-spy below simply finds nothing and stays quiet.
   */
  const onHome = usePathname() === "/";

  // Scroll-spy: whichever section straddles the upper third of the viewport
  // owns the active indicator.
  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

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
          setActiveId(first.id);
        } else if (window.scrollY < sections[0].offsetTop) {
          // Above the first section (i.e. in the hero) nothing is current.
          // Below the last one, the previous value deliberately sticks.
          setActiveId("");
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        pill ? "px-4 pt-3 md:pt-4" : "px-0 pt-0"
      }`}
    >
      <nav
        aria-label="メインナビゲーション"
        className={`relative mx-auto flex w-full items-center justify-between transition-[max-width,height,padding,border-radius] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          pill
            ? "h-14 max-w-[50rem] rounded-3xl px-3 md:px-4"
            : "h-20 max-w-[68rem] rounded-none px-6 md:px-10"
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

        {/* Images are decorative; the link carries the name. */}
        <a
          href={onHome ? "#top" : "/"}
          aria-label="Blesc"
          className="flex items-center"
        >
          <Logo
            className={`w-auto transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              pill ? "h-5 md:h-6" : "h-6 md:h-7"
            }`}
          />
        </a>

        <div className="flex items-center gap-4 md:gap-6">
          <ul className="hidden items-center gap-5 md:flex lg:gap-7">
            {NAV_LINKS.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <li key={id}>
                  <a
                    href={sectionHref(id, onHome)}
                    aria-current={isActive ? "true" : undefined}
                    className={`group relative block py-1 text-[0.9rem] transition-colors duration-300 ${
                      isActive ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                    <span
                      aria-hidden
                      className={`absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
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

          <ThemeToggle compact />

          {/* Was a hand-rolled copy of ButtonLink's glass markup. */}
          <ButtonLink href={CTA.consult.href} size="sm">
            {CTA.consult.label}
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
