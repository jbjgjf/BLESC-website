import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "material-symbols/outlined.css";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SmoothScroll } from "@/components/SmoothScroll";

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
  title: "Blesc — 生徒のSOSを可視化する",
  description:
    "Blescは、月に一度のホームルームでの自然な対話から、生徒の心理的リスクの早期サインをAIが検知する学校向けプラットフォームです。会話ログそのものが教員に公開されることはありません。",
  openGraph: {
    title: "Blesc — 生徒のSOSを可視化する",
    description:
      "声にならないSOSに、気づける社会へ。生徒の早期のサインをAIが捉え、孤立する前に可視化します。",
    locale: "ja_JP",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJp.variable}`}>
      <head>
        {/*
          Reveals are server-rendered with their hidden inline styles, so
          without JS the page would read as blank. This forces every animated
          element to its resting state instead.
        */}
        <noscript>
          <style>{`main [style], header [style] { opacity: 1 !important; filter: none !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <SmoothScroll />
        <ScrollProgress />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
