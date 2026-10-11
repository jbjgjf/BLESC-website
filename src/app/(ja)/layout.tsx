import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { RootShell } from "../_shell/RootShell";
import { SITE_VIEWPORT } from "../_shell/viewport";
import { siteMetadata } from "@/lib/seo";

/**
 * The Japanese site's root layout: /, /contact and /safety.
 *
 * (ja) is a route group — the parentheses keep it out of the URL — and it
 * exists only so that these pages can have a root layout of their own.
 * There is no app/layout.tsx above it: the English pages under app/en have
 * theirs, and the two differ in one attribute, <html lang>, which a single
 * layout shared by every route could not set per page (see RootShell).
 *
 * What follows from having two root layouts:
 * - A link from one language to the other is a full page load, not a
 *   client-side navigation. Every link between pages on this site is a
 *   plain <a> already, so nothing changes.
 * - An unknown URL belongs to neither, so the 404 is its own document:
 *   app/global-not-found.tsx.
 * - The icons, robots.txt and sitemap.xml stay in app/, above both, and
 *   serve every route.
 */
export const metadata: Metadata = siteMetadata("ja");

export const viewport: Viewport = SITE_VIEWPORT;

export default function JapaneseRootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <RootShell locale="ja">{children}</RootShell>;
}
