import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "blesc ── 生徒のSOSを可視化する。",
  description: "日常の会話に現れる早期のサインをAIが捉え、支援が必要な生徒を、孤立する前に可視化します。京都大学の臨床心理学研究との協働開発。",
  openGraph: {
    type: "website",
    siteName: "blesc",
    title: "blesc ── 生徒のSOSを可視化する。",
    description: "日常の会話に現れる早期のサインをAIが捉え、支援が必要な生徒を、孤立する前に可視化します。京都大学の臨床心理学研究との協働開発。",
    url: "https://blesc.jp/",
    images: [{ url: "https://blesc.jp/assets/logo_with_flower.png" }],
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "blesc ── 生徒のSOSを可視化する。",
    description: "日常の会話に現れる早期のサインをAIが捉え、支援が必要な生徒を、孤立する前に可視化します。",
    images: ["https://blesc.jp/assets/logo_with_flower.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0a0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=swap"
          rel="stylesheet"
        />
        <link rel="canonical" href="https://blesc.jp/" />
      </head>
      <body>{children}</body>
    </html>
  );
}
