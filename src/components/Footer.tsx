"use client";

import { GradientFooter } from "@/components/GradientFooter";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { ButtonLink, Container, Icon } from "@/components/ui";
import {
  CONTACT_EMAIL,
  CONTACT_PATH,
  CTA,
  NAV_LINKS,
  sectionHref,
} from "@/lib/site";

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
  { offset: 0, color: "#DCE9F5" },
  { offset: 0.1827, color: "#A8CDEA" },
  { offset: 0.2837, color: "#85C0ED" },
  { offset: 0.4135, color: "#6FB0E2" },
  { offset: 0.5866, color: "#4E97D4" },
  { offset: 0.6827, color: "#7FBCE9" },
  { offset: 0.8029, color: "#A9D3F1" },
  { offset: 1, color: "#85C0ED00" },
];

export function Footer() {
  const { theme } = useTheme();
  const onHome = usePathname() === "/";

  return (
    <GradientFooter
      className="border-t border-line bg-canvas pt-16"
      stops={theme === "light" ? LIGHT_STOPS : DARK_STOPS}
    >
      <Container>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* 導入について, folded in from the old standalone CTA section. */}
          <div className="lg:col-span-2">
            <h2 className="text-[clamp(1.5rem,3.4vw,2rem)] font-medium leading-[1.35] tracking-[-0.02em] text-ink">
              導入について、お話ししませんか。
            </h2>
            <p className="measure-jp mt-4 max-w-sm text-[0.95rem] text-muted">
              資料のご請求、導入のご相談を承っております。
              お問い合わせフォームよりご連絡ください。
            </p>

            {/*
              The email field that used to sit here is now the first field of
              the real form at /contact. One place to enquire, not two that
              collect different amounts of information.
            */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink variant="secondary" href={CTA.document.href}>
                {CTA.document.label}
              </ButtonLink>
              <ButtonLink variant="primary" href={CTA.consult.href}>
                {CTA.consult.label}
              </ButtonLink>
            </div>
          </div>

          <div>
            <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.15em] text-mark-1">
              サイトマップ
            </h3>
            <nav aria-label="フッターナビゲーション" className="mt-5">
              <ul className="flex flex-col gap-3">
                {NAV_LINKS.map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={sectionHref(id, onHome)}
                      className="text-[0.9rem] text-muted transition-colors duration-300 hover:text-ink"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.15em] text-mark-1">
              お問い合わせ
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <a
                  href={CONTACT_PATH}
                  className="inline-flex items-start gap-2 text-[0.9rem] text-muted transition-colors duration-300 hover:text-ink"
                >
                  <Icon name="edit_note" size={18} className="shrink-0" />
                  お問い合わせフォーム
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-start gap-2 text-[0.9rem] text-muted transition-colors duration-300 hover:text-ink"
                >
                  <Icon name="mail" size={18} className="shrink-0" />
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-line pt-8">
          <p className="text-[0.78rem] text-muted">© 2026 Blesc</p>
          <a
            href="/root"
            className="text-[0.78rem] text-muted transition-colors duration-300 hover:text-ink"
          >
            決算公告
          </a>
        </div>
      </Container>
    </GradientFooter>
  );
}
