/** Single source of truth for nav targets and contact destinations. */

export const NAV_LINKS = [
  { href: "#problem", label: "課題" },
  { href: "#how", label: "仕組み" },
  { href: "#technology", label: "テクノロジー" },
  { href: "#team", label: "チーム" },
] as const;

// TODO: replace with the real enquiry endpoints (form URLs) when they exist.
export const CONTACT_EMAIL = "blesc.official@gmail.com";

export const CTA = {
  document: {
    label: "資料請求",
    href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Blesc 資料請求")}`,
  },
  consult: {
    label: "導入のご相談",
    href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Blesc 導入のご相談")}`,
  },
} as const;
