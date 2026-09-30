/** Single source of truth for nav targets and contact destinations. */

/**
 * Section ids, not hrefs.
 *
 * The site is one scrolling page plus /contact, so a nav link has to render
 * two ways: bare `#how` on the home page, where Lenis intercepts it and
 * smooth-scrolls, and `/#how` anywhere else, where it has to actually
 * navigate. Storing the id keeps both derivable — and the scroll-spy needs
 * the raw id regardless, since `querySelector("/#how")` is not a valid
 * selector and throws.
 */
export const NAV_LINKS = [
  { id: "problem", label: "課題" },
  { id: "how", label: "仕組み" },
  { id: "product", label: "プロダクト" },
  { id: "technology", label: "テクノロジー" },
  { id: "team", label: "チーム" },
  { id: "news", label: "ニュース" },
] as const;

/**
 * Footer sitemap. Every section the nav lists, plus the FAQ.
 *
 * The FAQ is deliberately not in NAV_LINKS: the top bar already runs six
 * links against the logo and a CTA at md, and a seventh wraps it. It
 * still wants a crawlable internal link from somewhere on the page, so it
 * lives here — which is also where a visitor looking for it would look.
 */
export const FOOTER_LINKS = [
  ...NAV_LINKS,
  { id: "faq", label: "よくあるご質問" },
] as const;

export const sectionHref = (id: string, onHome: boolean) =>
  onHome ? `#${id}` : `/#${id}`;

/**
 * Brand mark: the dark wordmark, for the site's white ground.
 *
 * Derived from the supplied JPEG rather than used raw. The source files have
 * opaque grounds, which would have shown as a rectangle behind the mark, and
 * the black-ground PNG was clipped on the right, cutting the final "c". The
 * white-ground JPEG is the only complete artwork, so this is that, with its
 * ground keyed out.
 *
 * The file keeps its "on-light" name because it says which ground the
 * artwork is drawn for, and because the structured data in lib/seo.ts points
 * crawlers at the same path.
 *
 * To replace it, overwrite the file keeping the name. Transparent
 * background, please. Every place on the page the mark appears renders
 * <Logo />; only a new path would also need lib/seo.ts changed.
 */
export const LOGO_SRC = "/logo/logo-on-light.png";

export const CONTACT_EMAIL = "blesc.official@gmail.com";

/**
 * Web3Forms access key: the contact form posts to Web3Forms, which forwards
 * each enquiry to the inbox this key was issued for.
 *
 * It lives here rather than in an environment variable on purpose. The key
 * is public by design — Web3Forms' own FAQ says it does not need hiding, and
 * all it can do is deliver mail to that one inbox — and a constant in the
 * repo deploys without anyone needing access to the hosting dashboard.
 *
 * Empty means not set up yet, and the form falls back to opening the
 * visitor's mail client. It never pretends to send.
 *
 * Typed `string` on purpose. Left to inference, the empty literal types as
 * "" and a pasted key as that exact key, and the form's `!== ""` check then
 * compares two types that cannot overlap — a type error that fails
 * `next build` at the very moment the form is switched on.
 */
export const WEB3FORMS_ACCESS_KEY: string = "";

export const CONTACT_PATH = "/contact";

/**
 * The two enquiries. Carried to the form as ?type= so whichever button was
 * pressed arrives pre-selected rather than making the visitor say it twice.
 */
export const ENQUIRY_TYPES = {
  document: "資料請求",
  consult: "導入のご相談",
} as const;

export type EnquiryType = keyof typeof ENQUIRY_TYPES;

export const isEnquiryType = (v: string | null): v is EnquiryType =>
  v !== null && Object.hasOwn(ENQUIRY_TYPES, v);

export const CTA = {
  document: {
    label: ENQUIRY_TYPES.document,
    href: `${CONTACT_PATH}?type=document`,
  },
  consult: {
    label: ENQUIRY_TYPES.consult,
    href: `${CONTACT_PATH}?type=consult`,
  },
} as const;
