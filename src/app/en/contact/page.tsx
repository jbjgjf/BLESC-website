import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";
import { DESCRIPTIONS_SHORT, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { CONTACT_PATH } from "@/lib/site";

/*
 * The Japanese page's title and description, translated. The two things a
 * visitor can ask for are named as the form's own options name them
 * (ENQUIRY_LABELS in lib/site): "Request information" and "Book a
 * consultation".
 */
export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: CONTACT_PATH,
  /* The layout's template appends " | Blesc", so this is the page name only. */
  title: "Contact and information requests",
  description:
    "Request information about Blesc or book a consultation about adopting it. We reply to form inquiries from schools and boards of education within a few business days.",
  socialDescription: DESCRIPTIONS_SHORT.en,
});

/** "Home > Contact" in the search result, as /contact has its own. */
const BREADCRUMBS = breadcrumbJsonLd(
  [{ name: "Contact", path: CONTACT_PATH }],
  "en",
);

/** /en/contact. The page itself is ContactPage, shared with /contact. */
export default function EnglishContact() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMBS) }}
      />
      <ContactPage locale="en" />
    </>
  );
}
