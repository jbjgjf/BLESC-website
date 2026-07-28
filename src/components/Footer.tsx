import { GradientFooter } from "@/components/GradientFooter";
import { Container, Icon } from "@/components/ui";
import { CONTACT_EMAIL, NAV_LINKS } from "@/lib/site";

export function Footer() {
  return (
    // bg-canvas rather than canvas-alt: the glow reads cleanest rising off the
    // darkest ground on the page. No transform or filter here — a fixed child
    // needs a plain containing block, which is also why there is no `relative`.
    <GradientFooter className="border-t border-line bg-canvas pt-14">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <a
            href="#top"
            className="self-start text-lg font-semibold tracking-[-0.02em] text-ink"
          >
            Blesc
          </a>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <nav aria-label="フッターナビゲーション">
              <ul className="flex flex-col gap-3">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="text-[0.85rem] text-muted transition-colors duration-300 hover:text-ink"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-start gap-2 text-[0.85rem] text-muted transition-colors duration-300 hover:text-ink"
            >
              <Icon name="mail" size={18} className="shrink-0" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <p className="mt-12 text-[0.78rem] text-muted">© 2026 Blesc</p>
      </Container>
    </GradientFooter>
  );
}
