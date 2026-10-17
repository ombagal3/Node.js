/**
 * Format number into USD currency string
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date string into human readable format
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Calculate discount percentage between price and compareAtPrice
 * @param {number} price
 * @param {number} compareAtPrice
 * @returns {number|null}
 */
export function getDiscountPercentage(price, compareAtPrice) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return discount > 0 ? discount : null;
}
