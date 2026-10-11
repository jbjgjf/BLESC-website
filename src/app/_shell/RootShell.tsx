import type { ReactNode } from "react";
import "../globals.css";
import { FONT_VARIABLES } from "./fonts";
import { Footer } from "@/components/Footer";
import { LocaleProvider } from "@/components/LocaleProvider";
import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SpotlightPointer } from "@/components/SpotlightPointer";
import { HTML_LANG, type Locale } from "@/lib/i18n";
import { PREPAINT_SCRIPT } from "@/lib/prepaint";
import { siteJsonLd } from "@/lib/seo";

/**
 * The document every page is rendered into: <html>, the head's two inline
 * blocks, and the body's fixed furniture around the page.
 *
 * It is a component rather than a layout because the site has two root
 * layouts, one per language — app/(ja)/layout.tsx and app/en/layout.tsx —
 * and <html lang> is the one thing that has to differ between them. A
 * layout cannot read the path, so a single root layout could only ever
 * print one language on every page; two layouts each print their own, at
 * build time, and both render this.
 *
 * `locale` goes two ways from here: onto <html lang>, and into
 * LocaleProvider, which is how the client components below it — the nav,
 * the footer, anything inside a section — learn the language (see
 * lib/i18n). Server components are handed it as a prop by the page.
 *
 * This folder's underscore keeps it out of the router: _shell is not a
 * route segment.
 */
export function RootShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    // suppressHydrationWarning: the head script stamps data-js on <html>
    // before React hydrates, so the server's attributes intentionally differ.
    <html
      lang={HTML_LANG[locale]}
      suppressHydrationWarning
      className={FONT_VARIABLES}
    >
      <head>
        {/*
          Blocking, before first paint: it marks the document as scripted,
          which is what gives the pinned stages their scroll height. See
          lib/prepaint.ts.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }}
        />
        {/*
          Reveals are server-rendered with their hidden inline styles, so
          without JS the page would read as blank. This forces every animated
          element to its resting state instead.
        */}
        <noscript>
          <style>{`
            main [style], header [style] { opacity: 1 !important; filter: none !important; transform: none !important; }
            footer svg text { stroke-dashoffset: 0 !important; }
          `}</style>
        </noscript>
      </head>
      <body className="antialiased">
        {/*
          Organization + WebSite + SoftwareApplication as one @graph. In the
          body rather than the head because Next streams the head, and a
          script tag appended there after the shell has flushed is not
          guaranteed to be in the HTML a crawler receives.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
        <LocaleProvider locale={locale}>
          <SmoothScroll />
          <SpotlightPointer />
          <ScrollProgress />
          <Nav />
          <main>{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
