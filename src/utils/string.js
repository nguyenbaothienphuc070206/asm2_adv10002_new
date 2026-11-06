/**
 * String Processing and Diacritic Normalization
 */

/**
 * Removes Vietnamese diacritics and converts to lowercase for accent-insensitive search
 * @param {string} str
 * @returns {string}
 */
export const normalizeDiacritics = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

/**
 * Escapes HTML special characters to prevent DOM XSS when rendering user input
 * @param {string} str
 * @returns {string}
 */
export const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

