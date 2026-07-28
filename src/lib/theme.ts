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
 * Falls back to the OS preference when nothing is stored, and to dark if
 * storage is unavailable (private mode, blocked cookies).
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (t !== "light" && t !== "dark") {
      t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`.trim();
