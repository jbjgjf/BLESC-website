"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GlassSurface } from "@/components/GlassSurface";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CTA, NAV_LINKS, sectionHref } from "@/lib/site";

/**
 * Fixed nav, in two states.
 *
 * Over the hero it is a plain full-width row with no ground of its own —
 * the sky is the page's one piece of colour and a bar across it would cut
 * it in half. Once the hero has gone past, it draws in to a glass pill
 * floating at the top of the screen, because from there on it sits over
 * body copy and has to obscure what runs underneath it.
 *
 * The two states are one element. Width, height, padding and radius are CSS
 * transitions on real properties, so the bar draws in rather than cutting;
 * the glass is a separate layer behind the content that fades in, which
 * keeps the links, the toggle and the CTA from remounting at the boundary.
 */
export function Nav() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [pill, setPill] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  /*
   * The sections only exist on the home page. Off it the links have to point
   * back at "/" instead of at a fragment of whatever page you happen to be
   * on, and the scroll-spy below simply finds nothing and stays quiet.
   */
  const onHome = usePathname() === "/";

  /*
   * Where the hero ends, measured rather than assumed: the hero holds a
   * screen that grows with the viewport, so a hardcoded offset would be
   * wrong at every size but one. Pages without a hero (contact) report 0 and
   * get the pill immediately, which is what they want anyway.
   */
  const boundary = useRef(0);

  useEffect(() => {
    const hero = document.getElementById("top");
    const measure = () => {
      boundary.current = hero
        ? hero.offsetTop + hero.offsetHeight - 96
        : 0;
      setPill(window.scrollY > boundary.current);
    };
    measure();

    const observer = new ResizeObserver(measure);
    if (hero) observer.observe(hero);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [onHome]);

  useMotionValueEvent(scrollY, "change", (y) => setPill(y > boundary.current));

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
            ? "h-14 max-w-[52rem] rounded-full px-4 md:px-5"
            : "h-20 max-w-[68rem] rounded-none px-6 md:px-10"
        }`}
      >
        {/*
          The pill's ground, behind the content rather than around it. An
          empty lens layer means the links never remount as the state flips,
          and the fade is the only thing that moves.
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
              <GlassSurface
                className="glass-nav h-full w-full"
                style={{
                  background: "var(--glass-tint)",
                  borderRadius: 9999,
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {null}
              </GlassSurface>
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
