import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SpotlightPointer } from "@/components/SpotlightPointer";
import { SmoothScroll } from "@/components/SmoothScroll";
import {
  DESCRIPTION,
  DESCRIPTION_SHORT,
  KEYWORDS,
  SITE_NAME,
  SITE_URL,
  TAGLINE,
  X_HANDLE,
  siteJsonLd,
} from "@/lib/seo";

/**
 * One sans, varied only by weight and size. Inter covers Latin and the
 * numerals; Noto Sans JP picks up kana and kanji, which Inter has no glyphs
 * for. They share a humanist skeleton, so the page still reads as a single
 * typeface rather than a display/body pairing.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  /*
   * Every relative URL below — canonicals, OG images, the sitemap's own
   * entries — is resolved against this. Without it Next emits relative
   * og:image paths, which most crawlers and every social scraper drop.
   */
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${TAGLINE}｜学校向けAIメンタルヘルスプラットフォーム`,
    /*
     * Sub-pages set only their own name and inherit the brand suffix, so no
     * page can ship a title that omits it and none has to repeat it.
     */
    template: `%s｜${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  /*
   * The home page is the canonical for "/" — set here rather than only on
   * page.tsx so that any future route inheriting this layout without its own
   * alternates still self-canonicalises instead of pointing nowhere.
   */
  /*
   * No hreflang: the site is Japanese only, and a self-referencing
   * x-default on a monolingual site tells Google nothing it does not already
   * infer from <html lang="ja">.
   */
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      /*
       * The defaults truncate: Google clips the snippet and shows only a
       * thumbnail. Opening all three lets a Japanese-language snippet run to
       * full length and the OG card render large in Discover.
       */
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION_SHORT,
    /* images comes from app/opengraph-image.tsx, which Next injects here. */
  },
  twitter: {
    card: "summary_large_image",
    /*
     * Puts "@blescinc" on every card of this site anyone posts, wherever it
     * is posted from. X reads it off the page, so it needs no account link.
     */
    site: X_HANDLE,
    creator: X_HANDLE,
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: DESCRIPTION_SHORT,
  },
  /*
   * iOS Safari otherwise linkifies anything that looks like a phone number
   * or a date, which mangles the Japanese copy and injects unwanted <a>s
   * into the crawled markup.
   */
  formatDetection: { telephone: false, date: false, address: false },
  /*
   * No `icons` block: app/favicon.ico and app/apple-icon.png are both picked
   * up by file convention, and naming either here as well emits the link
   * twice.
   */
  /*
   * Paste the token from Search Console → 設定 → 所有権の確認 → HTML タグ.
   * Left unset rather than blank: an empty string emits an empty meta tag.
   */
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  /*
   * One per scheme. A single light value painted the browser chrome
   * near-white behind a near-black page for every dark-mode visitor, which
   * is both an eyesore and a (small) engagement signal.
   */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the head script stamps data-theme on <html>
    // before React hydrates, so the server's attribute intentionally differs.
    <html
      lang="ja"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansJp.variable}`}
    >
      <head>
        {/*
          Blocking, before first paint. Applying the stored theme from an
          effect instead would flash the wrong palette on every load for
          anyone whose preference differs from the server default.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        {/*
          Reveals are server-rendered with their hidden inline styles, so
          without JS the page would read as blank. This forces every animated
          element to its resting state instead.
        */}
        <noscript>
          <style>{`
            main [style], header [style] { opacity: 1 !important; filter: none !important; transform: none !important; }
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
        <ThemeProvider>
          <SmoothScroll />
          <SpotlightPointer />
          <ScrollProgress />
          <Nav />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
