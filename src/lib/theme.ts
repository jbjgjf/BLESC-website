export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "blesc-theme";

/**
 * Runs in <head> before first paint.
 *
 * Has to be inline and blocking: the upstream footer flipped the theme from a
 * useEffect, which runs *after* the first paint, so every visitor whose stored
 * preference differs from the default gets a full-page flash of the wrong
 * theme on every load.
 *
 * Light is the primary build, so an unset visitor gets light regardless of
 * what their OS asks for. That is a deliberate override of
 * prefers-color-scheme rather than an oversight: the site has a designed
 * default and a toggle two clicks from anywhere, and honouring the OS here
 * would hand half of all first impressions to the secondary palette.
 *
 * It also stamps data-js on <html>. The pinned, scroll-driven stages (the
 * closing statement, the footer's flower dive) are only worth their extra
 * screens of scroll when a script is driving them; without JavaScript the
 * attribute is absent and their tracks collapse to one screen in CSS, via the
 * `js:` variant in globals.css. Set here because this is the one script that
 * is guaranteed to run before first paint.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  document.documentElement.dataset.js = "";
  try {
    var t = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (t !== "light" && t !== "dark") t = "light";
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();
`.trim();
