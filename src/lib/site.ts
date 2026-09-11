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
 * Both were derived from the supplied JPEG rather than used raw. The source
 * files have opaque grounds — one white, one black — which would have shown
 * as a rectangle behind the mark on either theme, and the black-ground PNG
 * was clipped on the right, cutting the final "c". The white-ground JPEG is
 * the only complete artwork, so both versions come from it: its ground keyed
 * out, and the wordmark flipped to white for the dark build.
 *
 * To replace them, overwrite these two files keeping the names, or drop new
 * ones beside them and change the paths here — any web format works, since
 * these are plain <img> sources. Transparent backgrounds, please. Nothing
 * else needs touching: all three places the mark appears render <Logo />.
 */
export const LOGO = {
  /** Shown on the dark theme, so this artwork should be light. */
  onDark: "/logo/logo-on-dark.png",
  /** Shown on the light theme, so this artwork should be dark. */
  onLight: "/logo/logo-on-light.png",
} as const;

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
