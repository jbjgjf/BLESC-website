"use client";

import { useState } from "react";
import { GradientFooter } from "@/components/GradientFooter";
import { useTheme } from "@/components/ThemeProvider";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { CONTACT_EMAIL, CTA, NAV_LINKS } from "@/lib/site";

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

function ContactForm() {
  const [email, setEmail] = useState("");

  /*
   * No backend exists yet, so this hands off to the visitor's mail client
   * with their address in the body. It genuinely works and sends nothing
   * anywhere on its own — which matters here, because silently collecting
   * an address on a page about student mental health and doing nothing with
   * it would be worse than not offering the field.
   *
   * TODO: point at a real endpoint and drop the mailto handoff.
   */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;

    const subject = encodeURIComponent("Blesc へのお問い合わせ");
    const body = encodeURIComponent(`ご連絡先メールアドレス: ${address}\n\n`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-sm">
      <label
        htmlFor="contact-email"
        className="block text-[0.8rem] font-medium text-ink"
      >
        ご連絡先メールアドレス
      </label>

      <div className="relative mt-3">
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@school.ac.jp"
          autoComplete="email"
          className="h-12 w-full rounded-full border border-line bg-canvas-alt pl-5 pr-14 text-[0.9rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          aria-label="お問い合わせ内容の作成に進む"
          className="absolute right-1.5 top-1.5 flex size-9 items-center justify-center rounded-full bg-accent text-on-accent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.05]"
        >
          <Icon name="send" size={18} />
        </button>
      </div>

      <p className="mt-3 text-[0.75rem] text-muted">
        送信するとメールソフトが開きます。内容を確認のうえ送信してください。
      </p>
    </form>
  );
}

export function Footer() {
  const { theme } = useTheme();

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
            </p>

            <ContactForm />

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
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
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
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-5 inline-flex items-start gap-2 text-[0.9rem] text-muted transition-colors duration-300 hover:text-ink"
            >
              <Icon name="mail" size={18} className="shrink-0" />
              {CONTACT_EMAIL}
            </a>

          </div>
        </div>

        <div className="mt-16 border-t border-line pt-8">
          <p className="text-[0.78rem] text-muted">© 2026 Blesc</p>
        </div>
      </Container>
    </GradientFooter>
  );
}
