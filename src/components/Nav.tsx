"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassSurface } from "@/components/GlassSurface";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CTA, NAV_LINKS, sectionHref } from "@/lib/site";

/**
 * Fixed nav. Transparent at rest, easing to a solid --color-bg bar with a
 * hairline bottom border once the page starts moving.
 *
 * Note: the spec says "past the hero", but the hero shares the page
 * background, so a full-viewport transparent phase would let body copy scroll
 * under unreadable nav links. Solidifying early keeps the intent (clean at
 * rest) without that collision.
 */
const SOLID_AT = 64;

export function Nav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  /*
   * The sections only exist on the home page. Off it the links have to point
   * back at "/" instead of at a fragment of whatever page you happen to be
   * on, and the scroll-spy below simply finds nothing and stays quiet.
   */
  const onHome = usePathname() === "/";

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > SOLID_AT));

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

  /*
   * The bar is driven by classes rather than motion's `animate`, so its
   * colour is the --color-canvas token and flips with the theme. Animating a
   * literal rgba() meant a hardcoded dark bar sitting over a light page.
   */
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        solid
          ? "border-line bg-canvas/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="メインナビゲーション"
        className="mx-auto flex h-20 w-full max-w-[68rem] items-center justify-between px-6 md:px-10"
      >
        <a
          href={onHome ? "#top" : "/"}
          className="text-xl font-semibold tracking-[-0.02em] text-ink"
        >
          Blesc
        </a>

        <div className="flex items-center gap-4 md:gap-6">
          <ul className="hidden items-center gap-5 md:flex lg:gap-8">
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

          <a
            href={CTA.consult.href}
            className="glass-btn-primary inline-block rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]"
          >
            <GlassSurface
              className="flex items-center text-[0.85rem] font-medium text-on-accent"
              style={{
                background: "var(--glass-tint)",
                borderRadius: 9999,
                padding: "0.625rem 1.25rem",
                transition: "background 300ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {CTA.consult.label}
            </GlassSurface>
          </a>
        </div>
      </nav>
    </header>
  );
}
