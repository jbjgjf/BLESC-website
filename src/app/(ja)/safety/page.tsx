import type { Metadata } from "next";
import { TrustPage } from "@/components/trust/TrustPage";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import {
  PRIVACY,
  TRUST_PATH,
  TRUST_TITLE,
  warnPrivacyPolicyPending,
} from "@/lib/trust";

/**
 * Two of the page's own sentences, unaltered: that the diary's text is not
 * shown to teachers, parents or other students, and that a diary is not
 * sold or used for ads. They are taken from lib/trust.ts by position rather
 * than typed again, so the snippet a search engine shows cannot come to
 * promise something the page does not. (Until 2026-11-16 the second also
 * said a diary is not used to train AI models; that could not be confirmed
 * and was taken off the page, and so out of this.)
 *
 * 59 full-width characters, inside the ~92 a Japanese desktop snippet shows
 * (the budget lib/seo.ts works to), so neither sentence is cut.
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
 * breadcrumb — and the build log's reminder that the privacy policy link
 * is held back until there is a policy to link to (lib/trust.ts,
 * PRIVACY_POLICY_URL). Only this page asks for it, so a build prints it
 * once rather than once per language.
 */
export default function Safety() {
  warnPrivacyPolicyPending();

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
