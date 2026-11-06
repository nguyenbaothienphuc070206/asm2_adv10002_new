/**
 * DOM Utility Helpers
 */

export const $ = (selector, parent = document) => parent.querySelector(selector);

export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/**
 * Toggles background scroll lock and accessibility inertness
 * @param {boolean} isLocked
 */
export const lockScrollAndInert = (isLocked) => {
  document.body.classList.toggle('noscroll', isLocked);
  ['header.site-head', 'main', 'footer', '#ma', '#ctaband'].forEach((selector) => {
    const el = $(selector);
    if (el) el.inert = isLocked;
  });
};
