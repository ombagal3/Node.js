/**
 * Generate a clean, URL-safe slug from a string.
 * @param {string} text - Input text
 * @returns {string} Clean slug
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, '');   // Trim leading/trailing hyphens
}

module.exports = slugify;
