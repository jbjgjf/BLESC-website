import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";
import { homeMetadata } from "@/lib/seo";

/*
 * The canonical and the hreflang pair, restated here though the layout
 * carries the same: the layout's are a fallback for a route that sets
 * nothing, and this page should not depend on being the fallback.
 */
export const metadata: Metadata = homeMetadata("ja");

/** The home page in Japanese. Its content is HomePage, shared with /en. */
export default function Home() {
  return <HomePage locale="ja" />;
}
