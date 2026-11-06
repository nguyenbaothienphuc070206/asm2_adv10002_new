/**
 * Currency and Text Formatters
 */

/**
 * Formats a number into a Vietnamese Dong price string in EN format
 * @param {number} amount
 * @returns {string}
 */
export const M = (amount) => (amount || 0).toLocaleString('en-US') + ' VND';

/**
 * Formats VND monetary values in string with dots instead of commas for Vietnamese locale
 * @param {string} text
 * @param {string} lang
 * @returns {string}
 */
export const formatVNDSeparators = (text, lang) => {
  if (lang !== 'vi') return text;
  return text.replace(/(\d{1,3}(?:,\d{3})+)(?= VND)/g, (match) => match.replace(/,/g, '.'));
};
