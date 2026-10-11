import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FONT_VARIABLES } from "./_shell/fonts";
import { SITE_VIEWPORT } from "./_shell/viewport";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

/*
 * Next adds <meta name="robots" content="noindex"> to anything served with
 * a 404 status, so none is set here.
 *
 * metadataBase is here for the icons and the card that app/'s metadata
 * files attach to every document, this one included: without a base their
 * URLs would be resolved against a fallback origin.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `ページが見つかりません｜${SITE_NAME}`,
};

export const viewport: Viewport = SITE_VIEWPORT;

/**
 * The 404, for any URL that matches no route. Enabled by
 * experimental.globalNotFound in next.config.ts, which says why the site
 * needs it.
 *
 * It is a whole document, not a page inside a layout: Next serves it
 * without rendering either root layout, so it brings its own <html>, the
 * stylesheet and the fonts.
 *
 * And it is one document for both languages. It is prerendered once and
 * cannot see the URL that missed, so it cannot tell a mistyped /en/… from
 * a mistyped Japanese path; it says what happened in both, Japanese first
 * as the site's default language, and offers both ways home. <html> is
 * marked ja and each English run carries lang="en", so a screen reader
 * changes voice with the text.
 *
 * No nav and no footer. Both speak one language and both offer a switch to
 * "this page in the other language", which here is another 404. The mark
 * and the two links home are everything this page has to offer.
 *
 * Nothing on it is animated, so it needs neither the pre-paint script nor
 * the noscript rule the pages' shell carries (app/_shell/RootShell).
 *
 * Plain anchors, not next/link, as every link between pages on this site
 * is: each leads into a root layout this document is not part of, which is
 * a full page load whatever element it is.
 */
export default function GlobalNotFound() {
  return (
    <html lang="ja" className={FONT_VARIABLES}>
      <body className="antialiased">
        <main className="flex min-h-svh flex-col items-center justify-center bg-canvas px-6 py-24 text-center">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" aria-label={SITE_NAME}>
            <Logo className="h-7 w-auto" />
          </a>

          {/*
            The section heads' weight, tracking and palt (type-head), at a
            smaller size: eleven full-width characters have to fit a phone
            on one line, and at type-head's 32px floor they are 341px
            against the 272px a 320px screen leaves — the line would break
            two characters from its end. This ramp gives 24px there, 256px,
            and tops out at 36px. text-balance is for a face wide enough to
            wrap it anyway, and for the sentence under it, which is nineteen
            characters and does wrap on a phone: two even lines.
          */}
          <h1 className="mt-12 text-balance text-[clamp(1.5rem,1rem+2.5vw,2.25rem)] font-medium leading-[1.3] tracking-[-0.03em] text-ink [font-feature-settings:'palt'_1]">
            ページが見つかりません
          </h1>
          <p className="measure-jp mt-5 text-balance text-[1.0625rem] text-muted">
            お探しのページは見つかりませんでした。
          </p>
          <p
            lang="en"
            className="mt-2 text-balance text-[1.0625rem] leading-[1.6] text-muted"
          >
            The page you are looking for could not be found.
          </p>

          {/*
            Stacked and centred on a phone, side by side from sm. The
            Japanese home page is the primary of the two, as Japanese is
            the default language.
          */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink variant="primary" href="/">
              ホームへ戻る
            </ButtonLink>
            <ButtonLink variant="secondary" href="/en" lang="en" hrefLang="en">
              Back to home
            </ButtonLink>
          </div>
        </main>
      </body>
    </html>
  );
}
