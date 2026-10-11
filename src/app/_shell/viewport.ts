import type { Viewport } from "next";

/** The viewport every document on the site declares. */
export const SITE_VIEWPORT: Viewport = {
  /*
   * The page ground, so the browser chrome runs straight into the page. One
   * value rather than a light/dark pair: the site is light only, so the
   * chrome is white whatever the OS is set to — a dark bar over a white page
   * would only draw a seam across the top of it.
   */
  themeColor: "#ffffff",
  /*
   * Tells the browser, before the stylesheet arrives, that this page only
   * has a light rendering — so a dark-OS visitor gets light form controls,
   * scrollbars and overscroll ground from the first frame, and a browser
   * with a forced-dark mode is asked to leave it alone. Matches the
   * `color-scheme: only light` in globals.css, which says why `only`.
   */
  colorScheme: "only light",
  width: "device-width",
  initialScale: 1,
};
