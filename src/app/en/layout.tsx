import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { RootShell } from "../_shell/RootShell";
import { SITE_VIEWPORT } from "../_shell/viewport";
import { siteMetadata } from "@/lib/seo";

/**
 * The English site's root layout: /en, /en/contact and /en/safety.
 *
 * A root layout because nothing sits above it — there is no app/layout.tsx
 * — so this is where the English pages' <html lang="en"> comes from. The
 * Japanese pages have the same file at app/(ja)/layout.tsx, which says why
 * there are two.
 */
export const metadata: Metadata = siteMetadata("en");

export const viewport: Viewport = SITE_VIEWPORT;

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <RootShell locale="en">{children}</RootShell>;
}
