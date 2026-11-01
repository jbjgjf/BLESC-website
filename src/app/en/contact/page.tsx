import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";
import { DESCRIPTIONS_SHORT, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { CONTACT_PATH } from "@/lib/site";

/*
 * The Japanese page's title and description, translated. Until adoption
 * opens (ADOPTION_STATUS in lib/site) the description says it is coming
 * soon, and names the two things a visitor can ask for: a question, and to
 * be told when it opens.
 */
export const metadata: Metadata = pageMetadata({
  locale: "en",
  path: CONTACT_PATH,
  /* The layout's template appends " | Blesc", so this is the page name only. */
  title: "Contact",
  description:
    "Contact blesc. blesc will be available for adoption very soon; we welcome questions, and requests to be notified when it is.",
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
