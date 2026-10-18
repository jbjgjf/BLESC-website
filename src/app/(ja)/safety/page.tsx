import type { Metadata } from "next";
import { TrustPage } from "@/components/trust/TrustPage";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PRIVACY, TRUST_PATH, TRUST_TITLE } from "@/lib/trust";

/**
 * Two of the page's own sentences, unaltered: that the diary's text is not
 * shown to teachers, parents or other students, and that a diary is not
 * sold or used for ads, and not used to train an AI model without the
 * student's and a guardian's separate consent. (It used to say "never used
 * to train a model", full stop; the research consent pack has an optional
 * consent to exactly that, so the owner corrected it — jbjgjf/BLESC#469,
 * 2026-10-18.) They are taken from lib/trust.ts by position rather than
 * typed again, so the snippet a search engine shows cannot come to promise
 * something the page does not. The two items added after them for #469
 * (OpenAI, Supabase) sit at 3 and 4, so these positions did not move.
 *
 * 91 full-width characters, just inside the ~92 a Japanese desktop snippet
 * shows (the budget lib/seo.ts works to), so neither sentence is cut. The
 * consent clause is worded short for that reason; lengthen it and this
 * description runs over.
 */
const DESCRIPTION = `${PRIVACY.ja.items[0]}${PRIVACY.ja.items[2]}`;

export const metadata: Metadata = pageMetadata({
  locale: "ja",
  path: TRUST_PATH,
  /* The layout's template appends "｜Blesc", so this is the page name only. */
  title: TRUST_TITLE.ja,
  description: DESCRIPTION,
});

/** "ホーム > 安全とプライバシー" in the search result, as /contact has its own. */
const BREADCRUMBS = breadcrumbJsonLd(
  [{ name: TRUST_TITLE.ja, path: TRUST_PATH }],
  "ja",
);

/**
 * 安全とプライバシー: what Blesc is, what happens when a diary suggests
 * danger, and what is done with a diary.
 *
 * Every sentence is lib/trust.ts's and the page is TrustPage, shared with
 * /en/safety. What is this file's own is the page's metadata and its
 * breadcrumb.
 */
export default function Safety() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMBS) }}
      />
      <TrustPage locale="ja" />
    </>
  );
}
