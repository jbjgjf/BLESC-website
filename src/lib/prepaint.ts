/**
 * Runs in <head> before first paint.
 *
 * It stamps data-js on <html>. The pinned, scroll-driven stages (the closing
 * statement and its flower's dive into the footer) are only worth their extra
 * screens of scroll when a script is driving them; without JavaScript the
 * attribute is absent and their tracks collapse to one screen in CSS, via the
 * `js:` variant in globals.css. It has to be inline and blocking: set from an
 * effect, it would arrive after the first paint, and the page would lay out
 * collapsed and then jump several screens taller.
 *
 * It also clears "blesc-theme" from localStorage. The site used to have a
 * light/dark switch that remembered the choice under that key; the site is
 * light only now and nothing reads it, so this just stops a dead preference
 * sitting in visitors' storage. In a try/catch because storage access throws
 * outright in some private modes and sandboxed frames, and a throw here
 * would be a throw before the page has painted.
 */
export const PREPAINT_SCRIPT = `
(function(){
  document.documentElement.dataset.js = "";
  try {
    localStorage.removeItem("blesc-theme");
  } catch (e) {}
})();
`.trim();
