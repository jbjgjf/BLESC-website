import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";
import { homeMetadata } from "@/lib/seo";

/* As app/(ja)/page.tsx: the layout's metadata, stated by the page itself. */
export const metadata: Metadata = homeMetadata("en");

/**
 * The home page in English: the same sections as "/", in the same order,
 * each handed the language.
 */
export default function EnglishHome() {
  return <HomePage locale="en" />;
}
