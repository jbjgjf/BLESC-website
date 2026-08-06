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

export const sectionHref = (id: string, onHome: boolean) =>
  onHome ? `#${id}` : `/#${id}`;

/**
 * Brand mark. Two files, because a mark that reads against the near-black
 * ground will not read against the near-white one.
 *
 * Both are placeholders right now. To use the real logo, either overwrite
 * the two files in /public/logo keeping these names, or drop yours in beside
 * them and change the paths here — any web format works, not just SVG, since
 * these are plain <img> sources. Nothing else needs touching: the three
 * places the mark appears all render <Logo />.
 */
export const LOGO = {
  /** Shown on the dark theme, so this artwork should be light. */
  onDark: "/logo/logo-on-dark.svg",
  /** Shown on the light theme, so this artwork should be dark. */
  onLight: "/logo/logo-on-light.svg",
} as const;

export const CONTACT_EMAIL = "blesc.official@gmail.com";

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
