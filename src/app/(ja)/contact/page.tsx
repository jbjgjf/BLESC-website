import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";
import { DESCRIPTIONS_SHORT, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { CONTACT_PATH } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  locale: "ja",
  path: CONTACT_PATH,
  /* The layout's template appends "｜Blesc", so this is the page name only. */
  title: "お問い合わせ",
  description:
    "blescへのお問い合わせはこちらから。blescはまもなく導入いただけるようになります。ご質問や、導入開始のお知らせのご希望を承ります。",
  socialDescription: DESCRIPTIONS_SHORT.ja,
});

/**
 * A form page is a conversion endpoint, not a body of content — this exists
 * so Google renders the "ホーム > お問い合わせ" trail in the SERP rather than
 * a bare URL, and so the page is understood as a child of the home page.
 */
const BREADCRUMBS = breadcrumbJsonLd(
  [{ name: "お問い合わせ", path: CONTACT_PATH }],
  "ja",
);

/** /contact. The page itself is ContactPage, shared with /en/contact. */
export default function Contact() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMBS) }}
      />
      <ContactPage locale="ja" />
    </>
  );
}
