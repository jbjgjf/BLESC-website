import type { Metadata } from "next";
import { TrustPage } from "@/components/trust/TrustPage";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PRIVACY, TRUST_PATH, TRUST_TITLE } from "@/lib/trust";

/**
 * The same two sentences the Japanese page's description is made of, in
 * lib/trust.ts's English: diary text is never shown to teachers, parents or
 * other students, and diaries are never sold or used for ads, nor used for
 * AI training without separate consent. (Until jbjgjf/BLESC#469, 2026-10-18,
 * it said "never used to train AI models"; the research consent pack has an
 * optional consent to that, so the promise is now "not without consent".)
 * 157 characters, at the edge of the ~155 an English result shows — which
 * is why the English says "separate consent" where the Japanese names the
 * student and guardian. Lengthen it and the snippet cuts the consent clause.
 */
const DESCRIPTION = `${PRIVACY.en.items[0]} ${PRIVACY.en.items[2]}`;

export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: TRUST_PATH,
  /* The layout's template appends " | Blesc", so this is the page name only. */
  title: TRUST_TITLE.en,
  description: DESCRIPTION,
});

/** "Home > Safety & Privacy" in the search result. */
const BREADCRUMBS = breadcrumbJsonLd(
  [{ name: TRUST_TITLE.en, path: TRUST_PATH }],
  "en",
);

/**
 * Safety & Privacy in English: /en/safety, the counterpart of /safety.
 *
 * Every sentence is lib/trust.ts's, where the English sits beside the
 * Japanese it has to agree with, and the page is TrustPage.
 */
export default function EnglishSafety() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMBS) }}
      />
      <TrustPage locale="en" />
    </>
  );
}
