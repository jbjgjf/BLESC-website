/** Single source of truth for nav targets and contact destinations. */

import { localePath, type Locale } from "@/lib/i18n";

/**
 * Section ids, not hrefs.
 *
 * The site is one scrolling page plus two short ones (/contact, /safety),
 * in two languages, so a nav link has to render two ways: bare `#how` on
 * the home page, where Lenis intercepts it and smooth-scrolls, and `/#how`
 * (`/en#how` in English) anywhere else, where it has to actually navigate.
 * Storing the id keeps both derivable — and the scroll-spy needs the raw id
 * regardless, since `querySelector("/#how")` is not a valid selector and
 * throws.
 *
 * These are the Japanese labels. NAV and FOOTER_NAV below are the same
 * links in either language, and are what the nav and the footer render.
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

export type SectionId = (typeof FOOTER_LINKS)[number]["id"];

/**
 * The sections' names in English, by id. Where a section's heading on /en
 * is its name (How it works, Product, Technology, Team, News, FAQ) this is
 * the same word, so a link and the heading it scrolls to agree; change one
 * and change the other.
 */
const SECTION_LABELS_EN: Record<SectionId, string> = {
  problem: "The problem",
  how: "How it works",
  product: "Product",
  technology: "Technology",
  team: "Team",
  news: "News",
  faq: "FAQ",
};

export type SectionLink = { readonly id: SectionId; readonly label: string };

/**
 * The nav's six links and the footer's seven, in each language.
 *
 * Built once, here, rather than per render: the nav hands its list to an
 * effect as a dependency, and an array made on every render would restart
 * the scroll-spy each time.
 */
export const NAV: Record<Locale, readonly SectionLink[]> = {
  ja: NAV_LINKS,
  en: NAV_LINKS.map(({ id }) => ({ id, label: SECTION_LABELS_EN[id] })),
};

export const FOOTER_NAV: Record<Locale, readonly SectionLink[]> = {
  ja: FOOTER_LINKS,
  en: FOOTER_LINKS.map(({ id }) => ({ id, label: SECTION_LABELS_EN[id] })),
};

/**
 * `#id` on the page that holds the section, `<page>#id` from anywhere else.
 *
 * `page` is the home page of the language being rendered — "/" by default,
 * and localePath(locale, "/") from the nav and the footer, so an English
 * link reads `#how` on /en and `/en#how` from /en/contact.
 */
export const sectionHref = (id: string, onPage: boolean, page = "/") =>
  onPage ? `#${id}` : `${page}#${id}`;

/*
 * The 安全とプライバシー page is not in either list. It is a page, not a
 * section: its path and title are lib/trust.ts's (TRUST_PATH, TRUST_TITLE),
 * beside every sentence on it, and a link to it is
 * localePath(locale, TRUST_PATH). It is not in the top bar for the reason
 * the FAQ is not — six links are what fits — so the footer and the home
 * page's プロダクト section are where a visitor finds it.
 */

/**
 * The language switch, keyed by the language it leads to.
 *
 * `short` is what the top bar shows — two letters on a Japanese page,
 * because six section links leave room for nothing longer — and `label` is
 * the name the footer has room for, which also names the two-letter switch
 * to a screen reader. `lang` is the language the label itself is written
 * in, so "English" is not read out by a Japanese voice, nor 日本語 by an
 * English one.
 *
 * No href: the switch leads to the same page in the other language, which
 * depends on the page it is on — switchLocalePath(pathname) in lib/i18n.
 */
export const LANGUAGE_SWITCH = {
  en: { lang: "en", short: "EN", label: "English" },
  ja: { lang: "ja", short: "日本語", label: "日本語" },
} as const satisfies Record<Locale, { lang: Locale; short: string; label: string }>;

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

/**
 * The two enquiries' names in each language. ENQUIRY_TYPES above is the
 * Japanese pair; this is the same pair for either language, and the labels
 * on every call-to-action button come from here so a button and the option
 * it pre-selects on the form are always the same words.
 */
export const ENQUIRY_LABELS: Record<Locale, Record<EnquiryType, string>> = {
  ja: ENQUIRY_TYPES,
  en: { document: "Request information", consult: "Book a consultation" },
};

/**
 * The two calls to action for a page in `locale`: the label in that
 * language, and the contact form in that language with the enquiry
 * pre-selected. Sections call this rather than CTA so the English page's
 * buttons lead to the English form.
 */
export const ctaFor = (locale: Locale) =>
  ({
    document: {
      label: ENQUIRY_LABELS[locale].document,
      href: localePath(locale, `${CONTACT_PATH}?type=document`),
    },
    consult: {
      label: ENQUIRY_LABELS[locale].consult,
      href: localePath(locale, `${CONTACT_PATH}?type=consult`),
    },
  }) as const;

/**
 * The top bar's call to action, where the full label does not fit.
 *
 * The bar's button is ctaFor(locale).consult. In English that label is
 * "Book a consultation", 172px of button, and on a phone the mark, the
 * language switch and that button together are wider than the screen (see
 * the budget in components/Nav). Below sm the English button therefore
 * reads "Contact" — the name of the page it opens — and takes its full
 * label from sm up. Japanese fits at every width and has no short form.
 */
export const NAV_CTA_SHORT: Record<Locale, string | null> = {
  ja: null,
  en: "Contact",
};
